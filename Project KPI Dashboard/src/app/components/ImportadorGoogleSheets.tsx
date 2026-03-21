import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Badge } from './ui/badge';
import { Upload, CheckCircle2, XCircle, Loader2, Table as TableIcon, AlertCircle, FileSpreadsheet, Info, ExternalLink } from 'lucide-react';
import { useDashboard } from '../contexts/DashboardContext';
import type { RegistroMensualTriple } from '../contexts/DashboardContext';
import { toast } from 'sonner';

const CAPEX_TOTAL = 37697000;
const DERECHO_LLAVES = 18900000;
const METROS_CUADRADOS = 25;

// Estructura de columnas Google Sheets
// A: date | B: venta_cafe | C: venta_hotdesk | D: venta_asesoria
// E: cogs_cafe | F: cogs_hotdesk | G: cogs_asesoria
// H: margen_cafe | I: margen_hotdesk | J: margen_asesoria
// K: venta_total | L: cogs_total | M: margen_bruto
// N: gastos_operacion | O: utilidad_neta | P: margen_neto_%
// Q: revpsm | R: roi | S: status | T: linea_dominante | U: alerta

export function ImportadorGoogleSheets() {
  const { registros, setRegistros } = useDashboard();
  
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [registrosImportados, setRegistrosImportados] = useState(0);

  const SHEET_URL = 'https://docs.google.com/spreadsheets/d/1ZA6bh8Ztgjh2Da4IpciHwgMiXZ9rNPFfGQZi1Vpb9ro/edit?gid=0#gid=0';

  const parseNumero = (valor: string): number => {
    if (!valor || valor.trim() === '') return 0;
    // Remover espacios, comas y otros caracteres no numéricos excepto punto decimal
    const limpio = valor.replace(/[^\d.-]/g, '');
    const numero = parseFloat(limpio);
    return isNaN(numero) ? 0 : Math.round(numero);
  };

  const procesarDatosSheets = (texto: string) => {
    setProcessing(true);
    setError(null);
    setSuccess(false);
    toast.loading('Procesando datos de Google Sheets...', { id: 'import-sheets' });

    try {
      const lineas = texto.trim().split('\n').filter(l => l.trim().length > 0);
      
      if (lineas.length === 0) {
        throw new Error('No se encontraron datos. Copia las filas completas desde Google Sheets.');
      }

      const nuevosRegistros: RegistroMensualTriple[] = [];

      for (const linea of lineas) {
        // Separar por tabs (Google Sheets usa tabs al copiar)
        const cols = linea.split('\t');
        
        // Validación flexible: mínimo 19 columnas (hasta columna S: status)
        if (cols.length < 19) {
          console.warn('Fila incompleta, se omite:', linea);
          toast.warning(`Fila incompleta omitida (${cols.length} columnas)`, {
            description: 'Verifica que copiaste las columnas A-U completas',
            duration: 2000
          });
          continue;
        }

        // Columna A: date (formato esperado: YYYY-MM-DD o variantes)
        const fechaRaw = cols[0].trim();
        let fecha: string;
        
        // Intentar parsear diferentes formatos de fecha
        if (fechaRaw.match(/^\d{4}-\d{2}-\d{2}$/)) {
          // Ya está en formato correcto
          fecha = fechaRaw.substring(0, 7) + '-01'; // Primer día del mes
        } else if (fechaRaw.match(/^\d{1,2}\/\d{1,2}\/\d{4}$/)) {
          // Formato DD/MM/YYYY
          const partes = fechaRaw.split('/');
          fecha = `${partes[2]}-${partes[1].padStart(2, '0')}-01`;
        } else {
          console.warn('Formato de fecha no reconocido:', fechaRaw);
          continue;
        }

        // Columnas B-U: valores numéricos puros
        const venta_cafe = parseNumero(cols[1]);
        const venta_hotdesk = parseNumero(cols[2]);
        const venta_asesoria = parseNumero(cols[3]);
        
        const cogs_cafe = parseNumero(cols[4]);
        const cogs_hotdesk = parseNumero(cols[5]);
        const cogs_asesoria = parseNumero(cols[6]);
        
        const margen_cafe = parseNumero(cols[7]);
        const margen_hotdesk = parseNumero(cols[8]);
        const margen_asesoria = parseNumero(cols[9]);
        
        const venta_total = parseNumero(cols[10]);
        const cogs_total = parseNumero(cols[11]);
        const margen_bruto = parseNumero(cols[12]);
        
        const gastos_operacion = parseNumero(cols[13]);
        const utilidad_neta = parseNumero(cols[14]);
        const margen_neto_percent = parseFloat(cols[15]) || 0;
        
        const revpsm = parseNumero(cols[16]);
        const roi_valor = parseFloat(cols[17]) || 0;
        const status_raw = cols[18]?.trim().toLowerCase();
        const linea_dominante_raw = cols[19]?.trim().toLowerCase();
        const alerta = cols[20]?.trim() || '';

        // Normalizar status
        const status: 'Genio' | 'Figura' = 
          status_raw === 'genio' || status_raw === 'gênio' ? 'Genio' : 'Figura';

        // Normalizar línea dominante
        let lineaDominante: 'cafe' | 'hotdesk' | 'asesoria' = 'cafe';
        if (linea_dominante_raw.includes('hotdesk')) lineaDominante = 'hotdesk';
        else if (linea_dominante_raw.includes('asesor')) lineaDominante = 'asesoria';

        // Calcular métricas estadísticas (ROI mean/std)
        const registrosAnteriores = registros.filter(r => new Date(r.date) < new Date(fecha));
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

        // Calcular payback
        const paybackDays = utilidad_neta > 0 ? Math.ceil(DERECHO_LLAVES / utilidad_neta) : null;

        // Crear registro
        const registro: RegistroMensualTriple = {
          id: `${fecha}_${Date.now()}_${Math.random().toString(36).substring(7)}`,
          date: fecha,
          
          venta_cafe_clp: venta_cafe,
          cogs_cafe_clp: cogs_cafe,
          margen_cafe_clp: margen_cafe,
          margen_cafe_percent: venta_cafe > 0 ? (margen_cafe / venta_cafe) * 100 : 0,
          
          venta_hotdesk_clp: venta_hotdesk,
          cogs_hotdesk_clp: cogs_hotdesk,
          margen_hotdesk_clp: margen_hotdesk,
          margen_hotdesk_percent: venta_hotdesk > 0 ? (margen_hotdesk / venta_hotdesk) * 100 : 0,
          
          venta_asesoria_clp: venta_asesoria,
          cogs_asesoria_clp: cogs_asesoria,
          margen_asesoria_clp: margen_asesoria,
          margen_asesoria_percent: venta_asesoria > 0 ? (margen_asesoria / venta_asesoria) * 100 : 100,
          
          venta_total_clp: venta_total,
          cogs_total_clp: cogs_total,
          margen_bruto_clp: margen_bruto,
          margen_bruto_percent: venta_total > 0 ? (margen_bruto / venta_total) * 100 : 0,
          
          gastos_operacion_clp: gastos_operacion,
          utilidad_neta_clp: utilidad_neta,
          margen_neto_percent: margen_neto_percent,
          
          roi: roi_valor,
          roi_mean_30d,
          roi_std_30d,
          revpsm_clp_m2: revpsm,
          payback_days: paybackDays,
          status,
          
          alerta_canibalizacion: alerta,
          linea_dominante: lineaDominante,
          
          nota: 'Importado desde Google Sheets',
          updated_at: new Date().toISOString()
        };

        nuevosRegistros.push(registro);
      }

      if (nuevosRegistros.length === 0) {
        throw new Error('No se pudieron procesar las filas. Verifica el formato.');
      }

      // Combinar con registros existentes (evitar duplicados por fecha)
      const registrosActualizados = [...registros];
      let actualizados = 0;
      let agregados = 0;
      
      for (const nuevoReg of nuevosRegistros) {
        const indiceExistente = registrosActualizados.findIndex(r => r.date === nuevoReg.date);
        
        if (indiceExistente >= 0) {
          // Actualizar existente
          registrosActualizados[indiceExistente] = nuevoReg;
          actualizados++;
        } else {
          // Agregar nuevo
          registrosActualizados.push(nuevoReg);
          agregados++;
        }
      }

      // Ordenar por fecha descendente
      registrosActualizados.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      setRegistros(registrosActualizados);
      setRegistrosImportados(nuevosRegistros.length);
      setSuccess(true);
      
      toast.success('Importación completada exitosamente', { 
        id: 'import-sheets',
        description: `${agregados} nuevo${agregados !== 1 ? 's' : ''}, ${actualizados} actualizado${actualizados !== 1 ? 's' : ''}`
      });
      
      setTimeout(() => setSuccess(false), 5000);
    } catch (err: any) {
      setError(err.message || 'Error al procesar los datos');
      toast.error('Error en la importación', {
        id: 'import-sheets',
        description: err.message || 'Verifica el formato de los datos'
      });
      console.error('Error detallado:', err);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Card className="border-2 border-emerald-500 shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5 text-emerald-600" />
          Importador Google Sheets
        </CardTitle>
        <CardDescription>
          Copia filas completas (columnas A-U) desde tu hoja de cálculo
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Link directo al Google Sheet */}
        <Alert className="border-cyan-500 bg-gradient-to-r from-cyan-50 to-blue-50">
          <FileSpreadsheet className="h-4 w-4 text-cyan-600" />
          <AlertTitle className="text-sm font-bold text-cyan-900">📊 Template de Google Sheets</AlertTitle>
          <AlertDescription className="space-y-2 mt-2">
            <p className="text-xs text-gray-700">
              Usa el template oficial con la estructura de columnas correcta:
            </p>
            <Button
              variant="outline"
              size="sm"
              className="w-full border-cyan-400 text-cyan-700 hover:bg-cyan-100"
              onClick={() => window.open(SHEET_URL, '_blank')}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Abrir Google Sheet - Ratio Irarrázaval
            </Button>
            <p className="text-xs text-gray-600 italic">
              💡 Haz una copia del template, edita tus datos y luego copia las filas aquí
            </p>
          </AlertDescription>
        </Alert>

        {/* Estructura de Columnas */}
        <Alert className="border-blue-500 bg-blue-50">
          <TableIcon className="h-4 w-4" />
          <AlertTitle className="text-sm font-semibold">Estructura de Columnas (A-U)</AlertTitle>
          <AlertDescription className="text-xs space-y-1 mt-2">
            <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 font-mono">
              <div><Badge variant="outline" className="text-[10px] px-1 py-0">A</Badge> date</div>
              <div><Badge variant="outline" className="text-[10px] px-1 py-0">B</Badge> venta_cafe</div>
              <div><Badge variant="outline" className="text-[10px] px-1 py-0">C</Badge> venta_hotdesk</div>
              <div><Badge variant="outline" className="text-[10px] px-1 py-0">D</Badge> venta_asesoria</div>
              <div><Badge variant="outline" className="text-[10px] px-1 py-0">E</Badge> cogs_cafe</div>
              <div><Badge variant="outline" className="text-[10px] px-1 py-0">F</Badge> cogs_hotdesk</div>
              <div><Badge variant="outline" className="text-[10px] px-1 py-0">G</Badge> cogs_asesoria</div>
              <div><Badge variant="outline" className="text-[10px] px-1 py-0">H</Badge> margen_cafe</div>
              <div><Badge variant="outline" className="text-[10px] px-1 py-0">I</Badge> margen_hotdesk</div>
              <div><Badge variant="outline" className="text-[10px] px-1 py-0">J</Badge> margen_asesoria</div>
              <div><Badge variant="outline" className="text-[10px] px-1 py-0">K</Badge> venta_total</div>
              <div><Badge variant="outline" className="text-[10px] px-1 py-0">L</Badge> cogs_total</div>
              <div><Badge variant="outline" className="text-[10px] px-1 py-0">M</Badge> margen_bruto</div>
              <div><Badge variant="outline" className="text-[10px] px-1 py-0">N</Badge> gastos_operacion</div>
              <div><Badge variant="outline" className="text-[10px] px-1 py-0">O</Badge> utilidad_neta</div>
              <div><Badge variant="outline" className="text-[10px] px-1 py-0">P</Badge> margen_neto_%</div>
              <div><Badge variant="outline" className="text-[10px] px-1 py-0">Q</Badge> revpsm</div>
              <div><Badge variant="outline" className="text-[10px] px-1 py-0">R</Badge> roi</div>
              <div><Badge variant="outline" className="text-[10px] px-1 py-0">S</Badge> status</div>
              <div><Badge variant="outline" className="text-[10px] px-1 py-0">T</Badge> linea_dominante</div>
              <div><Badge variant="outline" className="text-[10px] px-1 py-0">U</Badge> alerta</div>
            </div>
          </AlertDescription>
        </Alert>

        {/* Instrucciones */}
        <Alert className="border-emerald-500 bg-emerald-50">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle className="text-sm">⚠️ IMPORTANTE: Solo números puros</AlertTitle>
          <AlertDescription className="text-xs space-y-1 mt-2">
            <p>✓ <strong>NO usar símbolos $</strong> en las celdas de Google Sheets</p>
            <p>✓ Solo valores numéricos: <code className="bg-white px-1 rounded">350000</code></p>
            <p>✓ Formato decimal con punto: <code className="bg-white px-1 rounded">0.32</code></p>
            <p>✓ Selecciona filas completas (A-U) y copia con Ctrl+C / Cmd+C</p>
          </AlertDescription>
        </Alert>

        {/* Área de pegado */}
        <div className="space-y-2">
          <Label htmlFor="sheetsData" className="text-sm font-semibold">
            Pegar datos desde Google Sheets
          </Label>
          <Textarea
            id="sheetsData"
            placeholder="Selecciona las filas completas (A-U) en Google Sheets y pega aquí (Ctrl+V / Cmd+V)..."
            rows={8}
            className="font-mono text-xs"
            disabled={processing}
          />
          <p className="text-xs text-gray-500">
            💡 Los tabs se mantienen automáticamente al copiar desde Google Sheets
          </p>
        </div>

        <Button
          onClick={() => {
            const textarea = document.getElementById('sheetsData') as HTMLTextAreaElement;
            if (textarea && textarea.value.trim()) {
              procesarDatosSheets(textarea.value);
            } else {
              setError('Pega los datos en el área de texto primero');
            }
          }}
          disabled={processing}
          className="w-full"
          size="lg"
        >
          {processing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Procesando...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Importar Datos
            </>
          )}
        </Button>

        {/* Feedback */}
        {success && (
          <Alert className="border-green-600 bg-green-100">
            <CheckCircle2 className="h-4 w-4" />
            <AlertTitle className="text-sm">✅ Importación Exitosa</AlertTitle>
            <AlertDescription className="text-xs">
              {registrosImportados} registro{registrosImportados !== 1 ? 's' : ''} importado{registrosImportados !== 1 ? 's' : ''} correctamente
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertTitle className="text-sm">Error en la Importación</AlertTitle>
            <AlertDescription className="text-xs">{error}</AlertDescription>
          </Alert>
        )}

        {/* Ejemplo visual */}
        <details className="text-xs">
          <summary className="cursor-pointer font-semibold text-gray-700 hover:text-gray-900">
            Ver ejemplo de datos válidos
          </summary>
          <pre className="mt-2 p-2 bg-gray-900 text-green-400 rounded overflow-x-auto text-[10px] font-mono">
{`2026-02-01	350000	120000	80000	112000	9000	0	238000	111000	80000	550000	121000	429000	180000	249000	45.27	22000	0.0066	Genio	cafe	
2026-02-02	320000	115000	90000	102400	8625	0	217600	106375	90000	525000	111025	413975	180000	233975	44.57	21000	0.0062	Genio	cafe	`}
          </pre>
          <p className="text-xs text-gray-500 mt-1">
            ☝️ Nota: Los espacios entre columnas son tabs (se generan automáticamente al copiar desde Sheets)
          </p>
        </details>
      </CardContent>
    </Card>
  );
}