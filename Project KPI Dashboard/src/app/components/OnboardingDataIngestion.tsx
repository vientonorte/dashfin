import { useState, useRef, useCallback, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import {
  Upload,
  CheckCircle2,
  XCircle,
  Loader2,
  Coffee,
  Laptop,
  Briefcase,
  Save,
  AlertCircle,
  FileSpreadsheet,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  Copy,
  RotateCcw,
  Zap,
} from 'lucide-react';
import { useDashboard } from '../contexts/DashboardContext';
import { useBusinessConfig } from '../contexts/BusinessConfigContext';
import type { RegistroMensualTriple, DatoDiario } from '../contexts/DashboardContext';
import { toast } from 'sonner';

// ============================================================================
// TYPES
// ============================================================================

type IngestionStep = 'choose' | 'upload' | 'preview' | 'success';
type IngestionMethod = 'csv' | 'quick' | null;

interface ParsedRow {
  rowIndex: number;
  fecha: string;
  venta_cafe: number;
  venta_hotdesk: number;
  venta_asesorias: number;
  gasto_insumos: number;
  gasto_staff_fijo: number;
  utilidad_neta: number;
  revpsm: number;
  warnings: string[];
  errors: string[];
}

interface ParseResult {
  rows: ParsedRow[];
  totalErrors: number;
  totalWarnings: number;
  duplicateMonths: string[];
  autoCorrections: string[];
}

// ============================================================================
// CONSTANTS
// ============================================================================

const STEP_LABELS: Record<IngestionStep, string> = {
  choose: 'Elegir método',
  upload: 'Cargar datos',
  preview: 'Verificar',
  success: 'Listo',
};

const STEP_ORDER: IngestionStep[] = ['choose', 'upload', 'preview', 'success'];

// ============================================================================
// COMPONENT
// ============================================================================

export function OnboardingDataIngestion() {
  const { registros, setRegistros } = useDashboard();
  const { config } = useBusinessConfig();

  // Flow state
  const [step, setStep] = useState<IngestionStep>('choose');
  const [method, setMethod] = useState<IngestionMethod>(null);

  // Upload state
  const [isDragOver, setIsDragOver] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [rawFile, setRawFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Quick entry state
  const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 7) + '-01');
  const [ventaCafe, setVentaCafe] = useState<number>(0);
  const [ventaHotdesk, setVentaHotdesk] = useState<number>(0);
  const [ventaAsesoria, setVentaAsesoria] = useState<number>(0);
  const [gastosStaff, setGastosStaff] = useState<number>(3450000);
  const [nota, setNota] = useState('');
  const [saving, setSaving] = useState(false);

  // Saved record reference for success screen
  const [savedRecord, setSavedRecord] = useState<RegistroMensualTriple | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const stepRef = useRef<HTMLDivElement>(null);

  // Business config values
  const COGS_CAFE_PERCENT = config.cogs_cafe_pct;
  const COGS_HOTDESK_PERCENT = config.cogs_hotdesk_pct;
  const CAPEX_TOTAL = config.capex_total;
  const DERECHO_LLAVES = config.derecho_llaves;
  const METROS_CUADRADOS = config.metros_cuadrados;
  const UMBRAL_GENIO = config.umbral_genio;

  // Focus management for accessibility
  useEffect(() => {
    if (stepRef.current) {
      stepRef.current.focus();
    }
  }, [step]);

  // ============================================================================
  // CSV PARSING with AI auto-categorization
  // ============================================================================

  const parseCSV = useCallback((text: string): ParseResult => {
    const lines = text.trim().split('\n').filter(l => l.trim());
    const rows: ParsedRow[] = [];
    const autoCorrections: string[] = [];
    let totalErrors = 0;
    let totalWarnings = 0;

    if (lines.length < 2) {
      return { rows: [], totalErrors: 1, totalWarnings: 0, duplicateMonths: [], autoCorrections: [] };
    }

    // AI-like column detection: flexible header matching
    const headerRaw = lines[0].toLowerCase().replace(/\s+/g, '_');
    const headerCols = headerRaw.split(',').map(h => h.trim());

    // Map columns intelligently
    const colMap: Record<string, number> = {};
    const patterns: Record<string, RegExp[]> = {
      fecha: [/fecha/, /date/, /dia/],
      venta_cafe: [/venta.*cafe/, /cafe.*venta/, /revenue.*cafe/, /cafe/],
      venta_hotdesk: [/venta.*hotdesk/, /hotdesk/, /cowork/, /revenue.*hotdesk/],
      venta_asesorias: [/venta.*asesor/, /asesor/, /consult/, /revenue.*asesor/],
      gasto_insumos: [/gasto.*insumo/, /insumo/, /cogs/, /cost.*good/],
      gasto_staff_fijo: [/gasto.*staff/, /staff/, /salario/, /payroll/],
      utilidad_neta: [/utilidad/, /net.*income/, /profit/],
      revpsm: [/revpsm/, /revenue.*per.*sq/, /rev.*m2/],
    };

    for (const [field, regexes] of Object.entries(patterns)) {
      for (let i = 0; i < headerCols.length; i++) {
        if (regexes.some(r => r.test(headerCols[i]))) {
          colMap[field] = i;
          break;
        }
      }
    }

    // Check required columns
    const required = ['fecha', 'venta_cafe'];
    const missing = required.filter(r => colMap[r] === undefined);
    if (missing.length > 0) {
      return {
        rows: [],
        totalErrors: 1,
        totalWarnings: 0,
        duplicateMonths: [],
        autoCorrections: [`No se detectaron columnas requeridas: ${missing.join(', ')}`],
      };
    }

    // Auto-detected columns notification
    const detectedCols = Object.keys(colMap);
    if (detectedCols.length > 2) {
      autoCorrections.push(`Columnas detectadas automáticamente: ${detectedCols.join(', ')}`);
    }

    // Parse data rows
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const vals = line.split(',').map(v => v.trim());
      const rowWarnings: string[] = [];
      const rowErrors: string[] = [];

      // Parse fecha with auto-correction
      let fechaVal = vals[colMap.fecha] || '';
      if (/^\d{3}-\d{2}-\d{2}$/.test(fechaVal)) {
        const corrected = '2' + fechaVal;
        const year = parseInt(corrected.substring(0, 4), 10);
        if (year >= 2000 && year <= 2099) {
          fechaVal = corrected;
          autoCorrections.push(`Fila ${i + 1}: Fecha corregida a ${fechaVal}`);
        } else {
          rowErrors.push(`Fecha inválida: "${fechaVal}"`);
        }
      } else if (!/^\d{4}-\d{2}-\d{2}$/.test(fechaVal)) {
        rowErrors.push(`Fecha inválida: "${fechaVal}"`);
      }

      // Parse numeric values with thousand-separator cleanup
      const parseNum = (idx: number | undefined): number => {
        if (idx === undefined) return 0;
        const raw = vals[idx] || '0';
        const cleaned = raw.replace(/\./g, '').replace(/\$/g, '').replace(/\s/g, '');
        const num = parseInt(cleaned, 10);
        if (isNaN(num)) {
          rowErrors.push(`Valor no numérico: "${raw}"`);
          return 0;
        }
        if (raw !== cleaned && raw.includes('.')) {
          rowWarnings.push(`Separador de miles removido: "${raw}" → ${num}`);
        }
        return num;
      };

      const row: ParsedRow = {
        rowIndex: i + 1,
        fecha: fechaVal,
        venta_cafe: parseNum(colMap.venta_cafe),
        venta_hotdesk: parseNum(colMap.venta_hotdesk),
        venta_asesorias: parseNum(colMap.venta_asesorias),
        gasto_insumos: parseNum(colMap.gasto_insumos),
        gasto_staff_fijo: parseNum(colMap.gasto_staff_fijo),
        utilidad_neta: parseNum(colMap.utilidad_neta),
        revpsm: parseNum(colMap.revpsm),
        warnings: rowWarnings,
        errors: rowErrors,
      };

      totalErrors += rowErrors.length;
      totalWarnings += rowWarnings.length;
      rows.push(row);
    }

    // Detect duplicate months in existing data
    const months = new Set(rows.map(r => r.fecha.substring(0, 7)));
    const existingMonths = registros.map(r => r.date.substring(0, 7));
    const duplicateMonths = [...months].filter(m => existingMonths.includes(m));

    return { rows, totalErrors, totalWarnings, duplicateMonths, autoCorrections };
  }, [registros]);

  const handleFileSelect = useCallback(async (file: File) => {
    if (!file.name.endsWith('.csv')) {
      setError('Solo se aceptan archivos .csv');
      return;
    }

    setProcessing(true);
    setError(null);
    setRawFile(file);

    try {
      const text = await file.text();
      const result = parseCSV(text);

      if (result.rows.length === 0) {
        const msg = result.autoCorrections.length > 0
          ? result.autoCorrections[0]
          : 'No se encontraron datos válidos en el archivo.';
        setError(msg);
        setProcessing(false);
        return;
      }

      setParseResult(result);

      // If no blocking errors, auto-advance to preview
      if (result.totalErrors === 0) {
        setStep('preview');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al leer el archivo';
      setError(message);
    } finally {
      setProcessing(false);
    }
  }, [parseCSV]);

  // ============================================================================
  // RECORD CREATION (shared logic for CSV & quick entry)
  // ============================================================================

  const createMonthlyRecord = useCallback((
    totalCafe: number,
    totalHotdesk: number,
    totalAsesorias: number,
    totalGastosStaff: number,
    fechaMes: string,
    notaText: string,
    datosDiarios?: DatoDiario[]
  ): RegistroMensualTriple => {
    const cogsCafe = totalCafe * COGS_CAFE_PERCENT;
    const cogsHotdesk = totalHotdesk * COGS_HOTDESK_PERCENT;
    const cogsAsesoria = 0;

    const margenCafe = totalCafe - cogsCafe;
    const margenHotdesk = totalHotdesk - cogsHotdesk;
    const margenAsesoria = totalAsesorias;

    const ventaTotal = totalCafe + totalHotdesk + totalAsesorias;
    const cogsTotal = cogsCafe + cogsHotdesk + cogsAsesoria;
    const margenBruto = ventaTotal - cogsTotal;
    const utilidadNeta = margenBruto - totalGastosStaff;

    const roi = CAPEX_TOTAL > 0 ? utilidadNeta / CAPEX_TOTAL : 0;
    const revPSM = METROS_CUADRADOS > 0 ? ventaTotal / METROS_CUADRADOS : 0;
    const status: 'Genio' | 'Figura' = utilidadNeta > UMBRAL_GENIO ? 'Genio' : 'Figura';
    const paybackDays = utilidadNeta > 0 ? Math.ceil(DERECHO_LLAVES / utilidadNeta) : null;

    let lineaDominante: 'cafe' | 'hotdesk' | 'asesoria';
    const maxMargen = Math.max(margenCafe, margenHotdesk, margenAsesoria);
    if (maxMargen === margenCafe) lineaDominante = 'cafe';
    else if (maxMargen === margenHotdesk) lineaDominante = 'hotdesk';
    else lineaDominante = 'asesoria';

    const alertaCanibalizacion = margenAsesoria > margenCafe * 0.5
      ? '⚠️ Asesorías generan más margen que café. Evaluar espacio reuniones.'
      : '';

    const registrosAnteriores = registros.filter(r => new Date(r.date) < new Date(fechaMes));
    const roi_mean_30d = registrosAnteriores.length > 0
      ? registrosAnteriores.slice(-30).reduce((sum, r) => sum + r.roi, 0) / Math.min(30, registrosAnteriores.length)
      : 0;

    const roi_std_30d = registrosAnteriores.length >= 2
      ? (() => {
          const ultimos = registrosAnteriores.slice(-30);
          const media = ultimos.reduce((sum, r) => sum + r.roi, 0) / ultimos.length;
          const varianza = ultimos.reduce((sum, r) => sum + Math.pow(r.roi - media, 2), 0) / ultimos.length;
          return Math.sqrt(varianza);
        })()
      : 0;

    return {
      id: `${fechaMes}_${Date.now()}`,
      date: fechaMes,

      venta_cafe_clp: totalCafe,
      cogs_cafe_clp: cogsCafe,
      margen_cafe_clp: margenCafe,
      margen_cafe_percent: totalCafe > 0 ? (margenCafe / totalCafe) * 100 : 0,

      venta_hotdesk_clp: totalHotdesk,
      cogs_hotdesk_clp: cogsHotdesk,
      margen_hotdesk_clp: margenHotdesk,
      margen_hotdesk_percent: totalHotdesk > 0 ? (margenHotdesk / totalHotdesk) * 100 : 0,

      venta_asesoria_clp: totalAsesorias,
      cogs_asesoria_clp: cogsAsesoria,
      margen_asesoria_clp: margenAsesoria,
      margen_asesoria_percent: 100,

      venta_total_clp: ventaTotal,
      cogs_total_clp: cogsTotal,
      margen_bruto_clp: margenBruto,
      margen_bruto_percent: ventaTotal > 0 ? (margenBruto / ventaTotal) * 100 : 0,

      gastos_operacion_clp: totalGastosStaff,
      utilidad_neta_clp: utilidadNeta,
      margen_neto_percent: ventaTotal > 0 ? (utilidadNeta / ventaTotal) * 100 : 0,

      roi,
      roi_mean_30d,
      roi_std_30d,
      revpsm_clp_m2: revPSM,
      payback_days: paybackDays,
      status,

      alerta_canibalizacion: alertaCanibalizacion,
      linea_dominante: lineaDominante,

      nota: notaText,
      updated_at: new Date().toISOString(),
      ...(datosDiarios ? { datos_diarios: datosDiarios } : {}),
    };
  }, [registros, COGS_CAFE_PERCENT, COGS_HOTDESK_PERCENT, CAPEX_TOTAL, DERECHO_LLAVES, METROS_CUADRADOS, UMBRAL_GENIO]);

  const saveRecord = useCallback((record: RegistroMensualTriple) => {
    const indiceExistente = registros.findIndex(r => r.date === record.date);
    let nuevosRegistros;

    if (indiceExistente >= 0) {
      nuevosRegistros = [...registros];
      nuevosRegistros[indiceExistente] = record;
    } else {
      nuevosRegistros = [...registros, record].sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
    }

    setRegistros(nuevosRegistros);
    setSavedRecord(record);

    // Alert for low margin
    const margenNetoPercent = record.margen_neto_percent;
    if (margenNetoPercent < 30) {
      toast.error('Margen neto bajo', {
        description: `${margenNetoPercent.toFixed(1)}% — Revisa costos operacionales.`,
        duration: 8000,
      });
    } else if (margenNetoPercent >= 35) {
      toast.success('Margen neto saludable', {
        description: `${margenNetoPercent.toFixed(1)}% — En rango óptimo.`,
      });
    }
  }, [registros, setRegistros]);

  // ============================================================================
  // CONFIRM CSV IMPORT
  // ============================================================================

  const confirmCSVImport = useCallback(() => {
    if (!parseResult || parseResult.rows.length === 0) return;

    setSaving(true);
    try {
      const validRows = parseResult.rows.filter(r => r.errors.length === 0);
      const datosDiarios: DatoDiario[] = validRows.map(r => ({
        fecha: r.fecha,
        venta_cafe: r.venta_cafe,
        venta_hotdesk: r.venta_hotdesk,
        venta_asesorias: r.venta_asesorias,
        gasto_insumos: r.gasto_insumos,
        gasto_staff_fijo: r.gasto_staff_fijo,
        utilidad_neta: r.utilidad_neta,
        revpsm: r.revpsm,
      }));

      const totalCafe = datosDiarios.reduce((s, d) => s + d.venta_cafe, 0);
      const totalHotdesk = datosDiarios.reduce((s, d) => s + d.venta_hotdesk, 0);
      const totalAsesorias = datosDiarios.reduce((s, d) => s + d.venta_asesorias, 0);
      const totalGastosStaff = datosDiarios.reduce((s, d) => s + d.gasto_staff_fijo, 0);
      const fechaMes = validRows[0].fecha.substring(0, 7) + '-01';
      const notaText = rawFile
        ? `CSV ${rawFile.name} (${datosDiarios.length} días)`
        : `CSV importado (${datosDiarios.length} días)`;

      const record = createMonthlyRecord(
        totalCafe, totalHotdesk, totalAsesorias, totalGastosStaff,
        fechaMes, notaText, datosDiarios
      );

      saveRecord(record);
      setStep('success');
      toast.success('Datos importados correctamente');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al guardar';
      setError(message);
    } finally {
      setSaving(false);
    }
  }, [parseResult, rawFile, createMonthlyRecord, saveRecord]);

  // ============================================================================
  // QUICK ENTRY SAVE
  // ============================================================================

  const guardarQuick = useCallback(() => {
    if (ventaCafe + ventaHotdesk + ventaAsesoria === 0) {
      setError('Ingresa al menos un monto de venta.');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const record = createMonthlyRecord(
        ventaCafe, ventaHotdesk, ventaAsesoria, gastosStaff,
        fecha, nota || 'Ingreso rápido'
      );

      saveRecord(record);
      setStep('success');

      // Reset
      setVentaCafe(0);
      setVentaHotdesk(0);
      setVentaAsesoria(0);
      setNota('');
      toast.success('Registro guardado');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al guardar';
      setError(message);
    } finally {
      setSaving(false);
    }
  }, [ventaCafe, ventaHotdesk, ventaAsesoria, gastosStaff, fecha, nota, createMonthlyRecord, saveRecord]);

  // ============================================================================
  // TEMPLATE DOWNLOAD
  // ============================================================================

  const downloadTemplate = () => {
    const csvContent = `Fecha,Venta_Cafe,Venta_Hotdesk,Venta_Asesorias,Gasto_Insumos,Gasto_Staff_Fijo,Utilidad_Neta,RevPSM
2026-02-01,350000,120000,80000,112000,180000,258000,22000
2026-02-02,320000,115000,90000,102400,180000,242600,21000
2026-02-03,380000,130000,75000,121600,180000,283400,23400`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'plantilla-dashfin.csv';
    a.click();
    URL.revokeObjectURL(url);

    toast.success('Plantilla descargada', {
      description: 'Llena los datos y vuelve a importar.',
    });
  };

  // ============================================================================
  // RESET
  // ============================================================================

  const resetFlow = () => {
    setStep('choose');
    setMethod(null);
    setError(null);
    setParseResult(null);
    setRawFile(null);
    setSavedRecord(null);
    setProcessing(false);
    setSaving(false);
  };

  // ============================================================================
  // FORMAT HELPERS
  // ============================================================================

  const fmt = (n: number) =>
    new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0,
    }).format(n);

  // ============================================================================
  // STEP PROGRESS BAR
  // ============================================================================

  const currentStepIndex = STEP_ORDER.indexOf(step);
  const progressPercent = ((currentStepIndex + 1) / STEP_ORDER.length) * 100;

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <Card className="border-2 border-primary/20 shadow-md" role="region" aria-label="Ingreso de datos financieros">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" aria-hidden="true" />
              Ingreso Rápido de Datos
            </CardTitle>
            <CardDescription className="mt-1">
              {step === 'choose' && 'Tus datos financieros en menos de 2 minutos'}
              {step === 'upload' && method === 'csv' && 'Sube tu archivo CSV con datos de venta'}
              {step === 'upload' && method === 'quick' && 'Ingresa los totales del mes'}
              {step === 'preview' && 'Verifica los datos antes de guardar'}
              {step === 'success' && 'Datos guardados exitosamente'}
            </CardDescription>
          </div>
          {step !== 'choose' && step !== 'success' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFlow}
              aria-label="Volver al inicio"
            >
              <RotateCcw className="h-4 w-4 mr-1" aria-hidden="true" />
              Reiniciar
            </Button>
          )}
        </div>

        {/* Progress indicator */}
        <div className="mt-3" role="progressbar" aria-valuenow={progressPercent} aria-valuemin={0} aria-valuemax={100} aria-label={`Paso ${currentStepIndex + 1} de ${STEP_ORDER.length}: ${STEP_LABELS[step]}`}>
          <Progress value={progressPercent} className="h-1.5" />
          <div className="flex justify-between mt-1.5">
            {STEP_ORDER.map((s, i) => (
              <span
                key={s}
                className={`text-xs ${i <= currentStepIndex ? 'text-primary font-medium' : 'text-muted-foreground'}`}
              >
                {STEP_LABELS[s]}
              </span>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent ref={stepRef} tabIndex={-1} className="outline-none">
        {/* ============================================================ */}
        {/* STEP 1: CHOOSE METHOD */}
        {/* ============================================================ */}
        {step === 'choose' && (
          <div className="space-y-3" role="group" aria-label="Selecciona un método de ingreso">
            {/* CSV Option */}
            <button
              type="button"
              className="w-full text-left p-4 rounded-lg border-2 border-transparent hover:border-primary/30 bg-muted/50 hover:bg-muted transition-colors focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
              onClick={() => { setMethod('csv'); setStep('upload'); }}
              aria-label="Importar archivo CSV con datos de venta"
            >
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-primary/10 p-2 shrink-0" aria-hidden="true">
                  <FileSpreadsheet className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm">Importar CSV</span>
                    <Badge variant="secondary" className="text-xs">Recomendado</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Sube un archivo con tus ventas diarias. Auto-detección de columnas y categorías.
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1" aria-hidden="true" />
              </div>
            </button>

            {/* Quick Entry Option */}
            <button
              type="button"
              className="w-full text-left p-4 rounded-lg border-2 border-transparent hover:border-primary/30 bg-muted/50 hover:bg-muted transition-colors focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
              onClick={() => { setMethod('quick'); setStep('upload'); }}
              aria-label="Ingreso rápido de totales mensuales"
            >
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-primary/10 p-2 shrink-0" aria-hidden="true">
                  <Zap className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <span className="font-semibold text-sm">Ingreso rápido</span>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Solo 3 campos: ventas de Café, Hotdesk y Asesorías. Lo demás se calcula solo.
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1" aria-hidden="true" />
              </div>
            </button>

            {/* Privacy notice */}
            <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/30 text-xs text-muted-foreground" role="note">
              <ShieldCheck className="h-4 w-4 shrink-0 mt-0.5" aria-hidden="true" />
              <span>Tus datos se procesan localmente en tu dispositivo. No se envían a servidores externos.</span>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* STEP 2: UPLOAD / ENTER DATA */}
        {/* ============================================================ */}
        {step === 'upload' && method === 'csv' && (
          <div className="space-y-4">
            {/* Drag-and-drop zone */}
            <div
              className={`relative rounded-lg border-2 border-dashed p-8 text-center transition-colors cursor-pointer ${
                isDragOver
                  ? 'border-primary bg-primary/5'
                  : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30'
              }`}
              role="button"
              tabIndex={0}
              aria-label="Zona de carga de archivos. Arrastra un CSV aquí o presiona para seleccionar."
              onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragOver(false);
                const file = e.dataTransfer.files?.[0];
                if (file) handleFileSelect(file);
              }}
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileInputRef.current?.click(); } }}
            >
              {processing ? (
                <div className="space-y-2">
                  <Loader2 className="h-8 w-8 text-primary mx-auto animate-spin" aria-hidden="true" />
                  <p className="text-sm font-medium">Analizando tu archivo…</p>
                  <p className="text-xs text-muted-foreground">Detectando columnas y validando datos</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="h-8 w-8 text-muted-foreground mx-auto" aria-hidden="true" />
                  <p className="text-sm font-medium">
                    {isDragOver ? 'Suelta el archivo aquí' : 'Arrastra tu CSV aquí'}
                  </p>
                  <p className="text-xs text-muted-foreground">o haz clic para seleccionar</p>
                  {rawFile && (
                    <Badge variant="outline" className="mt-1">
                      {rawFile.name}
                    </Badge>
                  )}
                </div>
              )}
              <Input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                className="hidden"
                tabIndex={-1}
                aria-hidden="true"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileSelect(file);
                }}
                disabled={processing}
              />
            </div>

            {/* Template download */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={downloadTemplate}
                className="text-xs"
              >
                <Copy className="h-3 w-3 mr-1" aria-hidden="true" />
                Descargar plantilla CSV
              </Button>
              <span className="text-xs text-muted-foreground">Ejemplo con 3 días de datos</span>
            </div>

            {/* Errors with parse result */}
            {parseResult && parseResult.totalErrors > 0 && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle className="text-sm">
                  {parseResult.totalErrors} error{parseResult.totalErrors > 1 ? 'es' : ''} encontrado{parseResult.totalErrors > 1 ? 's' : ''}
                </AlertTitle>
                <AlertDescription className="text-xs space-y-1 mt-1">
                  {parseResult.rows
                    .filter(r => r.errors.length > 0)
                    .slice(0, 5)
                    .map((r, i) => (
                      <p key={i}>Fila {r.rowIndex}: {r.errors.join(', ')}</p>
                    ))}
                  <p className="mt-2 font-medium">Corrige el archivo y vuelve a cargarlo.</p>
                </AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertTitle className="text-sm">Error</AlertTitle>
                <AlertDescription className="text-xs">{error}</AlertDescription>
              </Alert>
            )}

            {/* Navigation */}
            <div className="flex justify-between pt-2">
              <Button variant="ghost" size="sm" onClick={() => { setStep('choose'); setError(null); setParseResult(null); }}>
                <ArrowLeft className="h-4 w-4 mr-1" aria-hidden="true" />
                Atrás
              </Button>
              {parseResult && parseResult.totalErrors === 0 && parseResult.rows.length > 0 && (
                <Button size="sm" onClick={() => setStep('preview')}>
                  Verificar datos
                  <ArrowRight className="h-4 w-4 ml-1" aria-hidden="true" />
                </Button>
              )}
            </div>
          </div>
        )}

        {step === 'upload' && method === 'quick' && (
          <div className="space-y-4">
            {/* Month selector */}
            <div className="space-y-1.5">
              <Label htmlFor="onb-fecha" className="text-sm font-medium">Mes</Label>
              <Input
                id="onb-fecha"
                type="month"
                value={fecha.substring(0, 7)}
                onChange={(e) => setFecha(e.target.value + '-01')}
                className="text-sm"
                aria-describedby="onb-fecha-help"
              />
              <p id="onb-fecha-help" className="text-xs text-muted-foreground">Selecciona el mes a registrar</p>
            </div>

            {/* Revenue fields - progressive: only 3 essential fields */}
            <fieldset className="space-y-3">
              <legend className="text-sm font-medium">Ventas del mes (CLP)</legend>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="onb-cafe" className="text-xs flex items-center gap-1">
                    <Coffee className="h-3 w-3" aria-hidden="true" />
                    Café
                  </Label>
                  <Input
                    id="onb-cafe"
                    type="number"
                    inputMode="numeric"
                    placeholder="0"
                    value={ventaCafe || ''}
                    onChange={(e) => setVentaCafe(Number(e.target.value))}
                    className="text-sm"
                    min={0}
                    aria-describedby="onb-cafe-help"
                  />
                  <p id="onb-cafe-help" className="sr-only">Venta total de cafetería en pesos chilenos</p>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="onb-hotdesk" className="text-xs flex items-center gap-1">
                    <Laptop className="h-3 w-3" aria-hidden="true" />
                    Hotdesk
                  </Label>
                  <Input
                    id="onb-hotdesk"
                    type="number"
                    inputMode="numeric"
                    placeholder="0"
                    value={ventaHotdesk || ''}
                    onChange={(e) => setVentaHotdesk(Number(e.target.value))}
                    className="text-sm"
                    min={0}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="onb-asesoria" className="text-xs flex items-center gap-1">
                    <Briefcase className="h-3 w-3" aria-hidden="true" />
                    Asesorías
                  </Label>
                  <Input
                    id="onb-asesoria"
                    type="number"
                    inputMode="numeric"
                    placeholder="0"
                    value={ventaAsesoria || ''}
                    onChange={(e) => setVentaAsesoria(Number(e.target.value))}
                    className="text-sm"
                    min={0}
                  />
                </div>
              </div>
            </fieldset>

            {/* Progressive disclosure: optional fields */}
            <details className="group">
              <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground transition-colors list-none flex items-center gap-1">
                <ArrowRight className="h-3 w-3 transition-transform group-open:rotate-90" aria-hidden="true" />
                Opciones avanzadas
              </summary>
              <div className="mt-3 space-y-3 pl-4 border-l-2 border-muted">
                <div className="space-y-1">
                  <Label htmlFor="onb-gastos" className="text-xs">Gastos staff mensual</Label>
                  <Input
                    id="onb-gastos"
                    type="number"
                    inputMode="numeric"
                    placeholder="3450000"
                    value={gastosStaff || ''}
                    onChange={(e) => setGastosStaff(Number(e.target.value))}
                    className="text-sm"
                    min={0}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="onb-nota" className="text-xs">Nota (opcional)</Label>
                  <Textarea
                    id="onb-nota"
                    placeholder="Ej: Temporada alta…"
                    value={nota}
                    onChange={(e) => setNota(e.target.value)}
                    className="text-sm h-16"
                    maxLength={500}
                  />
                </div>
              </div>
            </details>

            {/* Duplicate warning */}
            {registros.some(r => r.date === fecha) && (
              <Alert className="border-yellow-500/50 bg-yellow-50 dark:bg-yellow-950/20">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <AlertTitle className="text-sm">Mes ya registrado</AlertTitle>
                <AlertDescription className="text-xs">
                  Ya existe un registro para este mes. Los datos se actualizarán.
                </AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription className="text-xs">{error}</AlertDescription>
              </Alert>
            )}

            {/* Navigation */}
            <div className="flex justify-between pt-2">
              <Button variant="ghost" size="sm" onClick={() => { setStep('choose'); setError(null); }}>
                <ArrowLeft className="h-4 w-4 mr-1" aria-hidden="true" />
                Atrás
              </Button>
              <Button
                size="sm"
                onClick={guardarQuick}
                disabled={saving || (ventaCafe + ventaHotdesk + ventaAsesoria === 0)}
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" aria-hidden="true" />
                    Guardando…
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-1" aria-hidden="true" />
                    Guardar
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* STEP 3: PREVIEW (CSV only) */}
        {/* ============================================================ */}
        {step === 'preview' && parseResult && (
          <div className="space-y-4">
            {/* Auto-corrections banner */}
            {parseResult.autoCorrections.length > 0 && (
              <Alert className="border-primary/30 bg-primary/5">
                <Sparkles className="h-4 w-4 text-primary" />
                <AlertTitle className="text-sm">Auto-categorización</AlertTitle>
                <AlertDescription className="text-xs space-y-0.5 mt-1">
                  {parseResult.autoCorrections.map((c, i) => (
                    <p key={i}>{c}</p>
                  ))}
                </AlertDescription>
              </Alert>
            )}

            {/* Summary cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="rounded-lg bg-muted/50 p-3 text-center">
                <p className="text-xs text-muted-foreground">Filas</p>
                <p className="text-lg font-bold">{parseResult.rows.filter(r => r.errors.length === 0).length}</p>
              </div>
              <div className="rounded-lg bg-muted/50 p-3 text-center">
                <p className="text-xs text-muted-foreground">Café total</p>
                <p className="text-sm font-semibold">{fmt(parseResult.rows.reduce((s, r) => s + r.venta_cafe, 0))}</p>
              </div>
              <div className="rounded-lg bg-muted/50 p-3 text-center">
                <p className="text-xs text-muted-foreground">Hotdesk total</p>
                <p className="text-sm font-semibold">{fmt(parseResult.rows.reduce((s, r) => s + r.venta_hotdesk, 0))}</p>
              </div>
              <div className="rounded-lg bg-muted/50 p-3 text-center">
                <p className="text-xs text-muted-foreground">Asesorías total</p>
                <p className="text-sm font-semibold">{fmt(parseResult.rows.reduce((s, r) => s + r.venta_asesorias, 0))}</p>
              </div>
            </div>

            {/* Duplicate months warning */}
            {parseResult.duplicateMonths.length > 0 && (
              <Alert className="border-yellow-500/50 bg-yellow-50 dark:bg-yellow-950/20">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <AlertTitle className="text-sm">Datos existentes</AlertTitle>
                <AlertDescription className="text-xs">
                  Se actualizarán los datos para: {parseResult.duplicateMonths.join(', ')}
                </AlertDescription>
              </Alert>
            )}

            {/* Warnings */}
            {parseResult.totalWarnings > 0 && (
              <Alert className="border-yellow-500/50 bg-yellow-50 dark:bg-yellow-950/20">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <AlertTitle className="text-sm">{parseResult.totalWarnings} advertencia{parseResult.totalWarnings > 1 ? 's' : ''}</AlertTitle>
                <AlertDescription className="text-xs space-y-0.5 mt-1">
                  {parseResult.rows
                    .flatMap(r => r.warnings.map(w => `Fila ${r.rowIndex}: ${w}`))
                    .slice(0, 5)
                    .map((w, i) => (
                      <p key={i}>{w}</p>
                    ))}
                </AlertDescription>
              </Alert>
            )}

            {/* Data preview table */}
            <div className="overflow-x-auto rounded-lg border max-h-48">
              <table className="w-full text-xs" role="table" aria-label="Vista previa de datos importados">
                <thead className="bg-muted/50 sticky top-0">
                  <tr>
                    <th className="px-2 py-1.5 text-left font-medium" scope="col">Fecha</th>
                    <th className="px-2 py-1.5 text-right font-medium" scope="col">Café</th>
                    <th className="px-2 py-1.5 text-right font-medium" scope="col">Hotdesk</th>
                    <th className="px-2 py-1.5 text-right font-medium" scope="col">Asesorías</th>
                  </tr>
                </thead>
                <tbody>
                  {parseResult.rows.slice(0, 10).map((row, i) => (
                    <tr key={i} className={row.errors.length > 0 ? 'bg-destructive/5' : i % 2 === 0 ? '' : 'bg-muted/20'}>
                      <td className="px-2 py-1">{row.fecha}</td>
                      <td className="px-2 py-1 text-right tabular-nums">{fmt(row.venta_cafe)}</td>
                      <td className="px-2 py-1 text-right tabular-nums">{fmt(row.venta_hotdesk)}</td>
                      <td className="px-2 py-1 text-right tabular-nums">{fmt(row.venta_asesorias)}</td>
                    </tr>
                  ))}
                  {parseResult.rows.length > 10 && (
                    <tr>
                      <td colSpan={4} className="px-2 py-1 text-center text-muted-foreground">
                        … y {parseResult.rows.length - 10} filas más
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Navigation */}
            <div className="flex justify-between pt-2">
              <Button variant="ghost" size="sm" onClick={() => setStep('upload')}>
                <ArrowLeft className="h-4 w-4 mr-1" aria-hidden="true" />
                Atrás
              </Button>
              <Button
                size="sm"
                onClick={confirmCSVImport}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" aria-hidden="true" />
                    Guardando…
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-1" aria-hidden="true" />
                    Confirmar importación
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* STEP 4: SUCCESS */}
        {/* ============================================================ */}
        {step === 'success' && (
          <div className="space-y-4 text-center py-4" role="status" aria-live="polite">
            <div className="mx-auto w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" aria-hidden="true" />
            </div>
            <div>
              <h3 className="text-base font-semibold">¡Datos guardados!</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Tu dashboard se actualizó con las métricas calculadas automáticamente.
              </p>
            </div>

            {savedRecord && (
              <div className="grid grid-cols-2 gap-2 text-xs max-w-sm mx-auto">
                <div className="rounded-lg bg-muted/50 p-2">
                  <p className="text-muted-foreground">Venta total</p>
                  <p className="font-semibold">{fmt(savedRecord.venta_total_clp)}</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-2">
                  <p className="text-muted-foreground">Utilidad neta</p>
                  <p className="font-semibold">{fmt(savedRecord.utilidad_neta_clp)}</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-2">
                  <p className="text-muted-foreground">Margen neto</p>
                  <p className="font-semibold">{savedRecord.margen_neto_percent.toFixed(1)}%</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-2">
                  <p className="text-muted-foreground">Status</p>
                  <Badge variant={savedRecord.status === 'Genio' ? 'default' : 'secondary'}>
                    {savedRecord.status}
                  </Badge>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-2 justify-center pt-2">
              <Button variant="outline" size="sm" onClick={resetFlow}>
                <RotateCcw className="h-4 w-4 mr-1" aria-hidden="true" />
                Cargar otro periodo
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
