// ============================================================================
// IMPORTADOR DE ESTADOS — Ingesta de CSV y PDF con validación y trazabilidad.
// ============================================================================

import { useState, useRef } from 'react';
import { Upload, FileText, AlertTriangle, CheckCircle2, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { parseCSV, parsePDFText } from '../utils/csvParser';
import { normalizeParsedTransactions } from '../utils/transactionNormalizer';
import { useTransactions } from '../contexts/TransactionContext';
import type { ImportBatch } from '../types/transactions';

export function ImportadorEstados() {
  const { addTransactions } = useTransactions();
  const [isDragOver, setIsDragOver] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<{
    ok: boolean;
    count: number;
    errors: string[];
    warnings: string[];
  } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function processFile(file: File) {
    setProcessing(true);
    setResult(null);

    try {
      let parsed;

      if (file.name.toLowerCase().endsWith('.csv')) {
        const text = await file.text();
        parsed = parseCSV(text);
      } else if (file.name.toLowerCase().endsWith('.pdf')) {
        const text = await parsePDFText(file);
        if (!text.trim()) {
          setResult({
            ok: false,
            count: 0,
            errors: ['No se pudo extraer texto del PDF. Intenta exportar el estado de cuenta como CSV desde tu banco.'],
            warnings: [],
          });
          setProcessing(false);
          return;
        }
        // Try to parse the extracted text as CSV-like
        parsed = parseCSV(text);
        if (parsed.transactions.length === 0) {
          setResult({
            ok: false,
            count: 0,
            errors: ['El PDF no contiene datos en formato tabular reconocible. Exporta el estado como CSV para mejor compatibilidad.'],
            warnings: parsed.warnings,
          });
          setProcessing(false);
          return;
        }
      } else {
        setResult({
          ok: false,
          count: 0,
          errors: [`Formato no soportado: ${file.name}. Usa archivos .csv o .pdf.`],
          warnings: [],
        });
        setProcessing(false);
        return;
      }

      if (parsed.errors.length > 0 && parsed.transactions.length === 0) {
        setResult({ ok: false, count: 0, errors: parsed.errors, warnings: parsed.warnings });
        setProcessing(false);
        return;
      }

      const { transactions, batchId } = normalizeParsedTransactions(parsed.transactions, {
        source: file.name.toLowerCase().endsWith('.pdf') ? 'pdf' : 'csv',
        fileName: file.name,
      });

      const batch: ImportBatch = {
        id: batchId,
        createdAt: new Date().toISOString(),
        source: file.name.toLowerCase().endsWith('.pdf') ? 'pdf' : 'csv',
        fileName: file.name,
        count: transactions.length,
      };

      await addTransactions(transactions, batch);

      setResult({
        ok: true,
        count: transactions.length,
        errors: parsed.errors,
        warnings: parsed.warnings,
      });
      toast.success(`✅ ${transactions.length} transacciones importadas`, {
        description: file.name,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error desconocido';
      setResult({ ok: false, count: 0, errors: [msg], warnings: [] });
      toast.error('Error al importar', { description: msg });
    } finally {
      setProcessing(false);
    }
  }

  function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    processFile(files[0]);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Importar Estado de Cuenta
        </CardTitle>
        <CardDescription>
          Arrastra un archivo CSV o PDF de tu banco. Solo se extraen las transacciones — no se almacena el archivo original.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Drop zone */}
        <div
          onDragOver={e => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={e => { e.preventDefault(); setIsDragOver(false); handleFiles(e.dataTransfer.files); }}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors
            ${isDragOver ? 'border-primary bg-primary/5' : 'border-muted-foreground/30 hover:border-primary/50'}`}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".csv,.pdf"
            className="hidden"
            onChange={e => handleFiles(e.target.files)}
          />
          {processing ? (
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span>Procesando archivo…</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <FileText className="h-8 w-8" />
              <span className="font-medium">Haz clic o arrastra aquí</span>
              <span className="text-xs">Formatos: CSV, PDF</span>
            </div>
          )}
        </div>

        {/* Results */}
        {result && (
          <div className="space-y-2">
            {result.ok ? (
              <Alert>
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <AlertDescription>
                  <strong>{result.count} transacciones</strong> importadas correctamente.
                </AlertDescription>
              </Alert>
            ) : (
              <Alert variant="destructive">
                <X className="h-4 w-4" />
                <AlertDescription>
                  {result.errors.map((e, i) => <div key={i}>{e}</div>)}
                </AlertDescription>
              </Alert>
            )}
            {result.warnings.length > 0 && (
              <Alert>
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                <AlertDescription>
                  <div className="font-medium mb-1">Advertencias ({result.warnings.length}):</div>
                  <ul className="text-xs space-y-0.5 max-h-32 overflow-y-auto">
                    {result.warnings.map((w, i) => <li key={i}>• {w}</li>)}
                  </ul>
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {/* CSV template download */}
        <div className="text-xs text-muted-foreground border-t pt-3">
          <p className="font-medium mb-1">Formato CSV esperado:</p>
          <code className="block bg-muted rounded p-2 font-mono">
            Fecha,Descripcion,Monto<br />
            2026-01-15,Supermercado Jumbo,-45000<br />
            2026-01-16,Sueldo enero,1500000
          </code>
          <Button
            variant="ghost"
            size="sm"
            className="mt-2 text-xs h-7"
            onClick={() => {
              const template = 'Fecha,Descripcion,Monto\n2026-01-15,Supermercado Jumbo,-45000\n2026-01-16,Sueldo enero,1500000\n2026-01-17,Metro BIP,-3500\n2026-01-18,Netflix,-9990';
              const blob = new Blob([template], { type: 'text/csv' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'template-estados-cuenta.csv';
              a.click();
              URL.revokeObjectURL(url);
            }}
          >
            Descargar template CSV
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
