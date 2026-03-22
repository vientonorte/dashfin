import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Sparkles, TrendingDown, Download, Calendar, Copy, CheckCircle2, DollarSign, FileSpreadsheet, Database, Clock } from 'lucide-react';
import { Separator } from './ui/separator';
import { useDashboard } from '../contexts/DashboardContext';
import { useRole } from '../contexts/RoleContext';
import { useBusinessConfig } from '../contexts/BusinessConfigContext';
import { toast } from 'sonner';

interface RowData {
  fecha: string;
  venta: number;
  revPSM: number;
  utilidad: number;
}

interface AnalisisGenioFigura {
  insight: string;
  payback_days: string;
  status: string;
}

// Umbral por defecto — se sobrescribe con config desde BusinessConfigContext
const UMBRAL_GENIO_UTILIDAD_DEFAULT = 150000;

// Función para formatear con puntos de miles chilenos
const formatChileno = (num: number): string => {
  return Math.round(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

// Función para normalizar valores monetarios
const normalizarValor = (texto: string): number => {
  if (!texto || texto.trim() === '') return 0;
  
  // Eliminar $, espacios, puntos de miles y punto final
  let valorLimpio = texto
    .replace(/\$/g, '')
    .replace(/\s/g, '')
    .replace(/\./g, '')
    .replace(/\.$/g, ''); // Eliminar punto final si existe
  
  // Si hay coma decimal, redondear al entero más cercano
  if (valorLimpio.includes(',')) {
    const partes = valorLimpio.split(',');
    const entero = parseInt(partes[0]) || 0;
    const decimal = partes[1] ? parseInt(partes[1].charAt(0)) || 0 : 0;
    // Redondear: si el primer decimal >= 5, sumar 1
    return decimal >= 5 ? entero + 1 : entero;
  }
  
  const valor = parseInt(valorLimpio);
  return isNaN(valor) ? 0 : valor;
};

export function GenioyFigura() {
  const { can } = useRole();
  const { config } = useBusinessConfig();

  const [rowData, setRowData] = useState<RowData>({
    fecha: '',
    venta: 0,
    revPSM: 0,
    utilidad: 0
  });

  const [analisis, setAnalisis] = useState<AnalisisGenioFigura | null>(null);
  const [jsonOutput, setJsonOutput] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [googleSheetsUrl] = useState(`https://docs.google.com/spreadsheets/d/${config.sheets_id}/edit?usp=sharing`);

  // Umbral configurable — inicializar desde BusinessConfig
  const [umbralGenio, setUmbralGenio] = useState(() => config.umbral_genio || UMBRAL_GENIO_UTILIDAD_DEFAULT);
  const [umbralInput, setUmbralInput] = useState(() => formatChileno(config.umbral_genio || UMBRAL_GENIO_UTILIDAD_DEFAULT));

  if (!can('view:payback_analysis')) return null;

  // CAPEX desde contexto
  const CAPEX = {
    derecho_llaves: config.derecho_llaves,
    total_invertido: config.capex_total
  };

  const calcularRevPSMDesdeVenta = (venta: number): number => {
    return Math.round(venta / config.metros_cuadrados);
  };

  const analizarDatos = () => {
    // Si no hay RevPSM calculado, calcularlo desde venta
    const revPSMFinal = rowData.revPSM > 0 ? rowData.revPSM : calcularRevPSMDesdeVenta(rowData.venta);
    
    // Determinar si es "Genio" o "Figura" basado en UTILIDAD
    const status = rowData.utilidad > umbralGenio ? 'GENIO' : 'FIGURA';
    
    // Calcular payback_days para derecho de llaves
    let paybackDays: string;
    if (rowData.utilidad > 0) {
      const dias = Math.ceil(CAPEX.derecho_llaves / rowData.utilidad);
      paybackDays = dias.toString();
    } else {
      paybackDays = 'N/A';
    }

    // Generar insight
    const ventaFormateada = formatChileno(rowData.venta);
    const revPSMFormateado = formatChileno(revPSMFinal);
    const utilidadFormateada = formatChileno(rowData.utilidad);
    
    const insight = `Fecha: ${rowData.fecha} | Venta: $${ventaFormateada} CLP | RevPSM: $${revPSMFormateado} CLP/m² | Utilidad: $${utilidadFormateada} CLP | Payback: ${paybackDays} días | Status: ${status}`;

    const resultado: AnalisisGenioFigura = {
      insight,
      payback_days: paybackDays,
      status
    };

    // Generar JSON limpio
    const jsonLimpio = JSON.stringify(resultado, null, 0);
    
    setAnalisis(resultado);
    setJsonOutput(jsonLimpio);
  };

  const procesarDatosDesdeSheets = (texto: string) => {
    // Espera formato: Fecha\tVenta\tRevPSM\tUtilidad (separados por tabs)
    const lineas = texto.trim().split('\n');
    
    if (lineas.length === 0) return;

    // Tomar la primera línea no vacía
    const primeraLinea = lineas.find(l => l.trim().length > 0);
    if (!primeraLinea) return;

    const columnas = primeraLinea.split('\t');
    
    if (columnas.length >= 4) {
      setRowData({
        fecha: columnas[0].trim(),
        venta: normalizarValor(columnas[1]),
        revPSM: normalizarValor(columnas[2]),
        utilidad: normalizarValor(columnas[3])
      });
    } else if (columnas.length >= 1) {
      // Si solo hay una columna, intentar parsear valores separados por espacios
      const valores = primeraLinea.split(/\s+/);
      setRowData({
        fecha: valores[0] || '',
        venta: valores[1] ? normalizarValor(valores[1]) : 0,
        revPSM: valores[2] ? normalizarValor(valores[2]) : 0,
        utilidad: valores[3] ? normalizarValor(valores[3]) : 0
      });
    }
  };

  const copiarJSON = async () => {
    if (jsonOutput) {
      try {
        // Intenta usar la API moderna del portapapeles
        await navigator.clipboard.writeText(jsonOutput);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        // Fallback: crea un textarea temporal
        const textarea = document.createElement('textarea');
        textarea.value = jsonOutput;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        try {
          document.execCommand('copy');
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch (e) {
          alert('❌ No se pudo copiar. Usa el botón de descarga.');
          console.error('Error al copiar:', e);
        }
        document.body.removeChild(textarea);
      }
    }
  };

  const descargarJSON = () => {
    if (!analisis) return;

    const blob = new Blob([jsonOutput], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `genio-figura-${rowData.fecha || 'analisis'}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Calcular payback del CAPEX total
  const calcularPaybackCapexTotal = () => {
    if (rowData.utilidad > 0) {
      return Math.ceil(CAPEX.total_invertido / rowData.utilidad);
    }
    return 0;
  };

  // ===== EXPORTADOR GOOGLE SHEETS CON VERSIONADO =====
  const { registros } = useDashboard();
  const [sheetExportado, setSheetExportado] = useState('');
  const [copiadoSheet, setCopiadoSheet] = useState(false);

  const generarExportGoogleSheets = () => {
    if (registros.length === 0) {
      toast.error('No hay datos', {
        description: 'Importa datos mensuales primero'
      });
      return;
    }

    // Header con versionado
    const version = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19); // 2026-02-22T14-30-00
    const timestamp = new Date().toLocaleString('es-CL', { 
      timeZone: 'America/Santiago',
      dateStyle: 'full',
      timeStyle: 'long'
    });

    let output = '';
    
    // Línea 1: Metadata del export
    output += `# EXPORT CFO DASHBOARD - RATIO IRARRÁZAVAL\n`;
    output += `# Versión: v${version}\n`;
    output += `# Timestamp: ${timestamp}\n`;
    output += `# Registros: ${registros.length}\n`;
    output += `# Local: ${config.nombre_local} (${config.metros_cuadrados} m²)\n`;
    output += `# CAPEX Total: $${formatChileno(CAPEX.total_invertido)} CLP\n`;
    output += `\n`;

    // Línea de headers (columnas A-U)
    const headers = [
      'date',
      'venta_cafe',
      'venta_hotdesk',
      'venta_asesoria',
      'cogs_cafe',
      'cogs_hotdesk',
      'cogs_asesoria',
      'margen_cafe',
      'margen_hotdesk',
      'margen_asesoria',
      'venta_total',
      'cogs_total',
      'margen_bruto',
      'gastos_operacion',
      'utilidad_neta',
      'margen_neto_%',
      'revpsm',
      'roi',
      'status',
      'linea_dominante',
      'alerta'
    ];

    output += headers.join('\t') + '\n';

    // Filas de datos (ordenadas por fecha descendente)
    const registrosOrdenados = [...registros].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    for (const reg of registrosOrdenados) {
      const fila = [
        reg.date,
        reg.venta_cafe_clp.toString(),
        reg.venta_hotdesk_clp.toString(),
        reg.venta_asesoria_clp.toString(),
        reg.cogs_cafe_clp.toString(),
        reg.cogs_hotdesk_clp.toString(),
        reg.cogs_asesoria_clp.toString(),
        reg.margen_cafe_clp.toString(),
        reg.margen_hotdesk_clp.toString(),
        reg.margen_asesoria_clp.toString(),
        reg.venta_total_clp.toString(),
        reg.cogs_total_clp.toString(),
        reg.margen_bruto_clp.toString(),
        reg.gastos_operacion_clp.toString(),
        reg.utilidad_neta_clp.toString(),
        reg.margen_neto_percent.toFixed(2),
        reg.revpsm_clp_m2.toString(),
        reg.roi.toFixed(4),
        reg.status,
        reg.linea_dominante,
        reg.alerta_canibalizacion || ''
      ];

      output += fila.join('\t') + '\n';
    }

    // Footer con estadísticas
    output += '\n';
    output += `# ESTADÍSTICAS DEL EXPORT\n`;
    output += `# Venta Total Acumulada: $${formatChileno(registros.reduce((sum, r) => sum + r.venta_total_clp, 0))} CLP\n`;
    output += `# Utilidad Neta Acumulada: $${formatChileno(registros.reduce((sum, r) => sum + r.utilidad_neta_clp, 0))} CLP\n`;
    output += `# Promedio RevPSM: $${formatChileno(registros.reduce((sum, r) => sum + r.revpsm_clp_m2, 0) / registros.length)} CLP/m²\n`;
    output += `# Genios: ${registros.filter(r => r.status === 'Genio').length} | Figuras: ${registros.filter(r => r.status === 'Figura').length}\n`;

    setSheetExportado(output);
    toast.success('Export generado', {
      description: `${registros.length} registros listos para copiar`
    });
  };

  const copiarExportSheet = async () => {
    if (!sheetExportado) {
      toast.error('Genera el export primero');
      return;
    }

    try {
      await navigator.clipboard.writeText(sheetExportado);
      setCopiadoSheet(true);
      toast.success('Export copiado', {
        description: 'Pégalo en Google Sheets'
      });
      setTimeout(() => setCopiadoSheet(false), 3000);
    } catch (error) {
      toast.error('Error al copiar', {
        description: 'Usa el botón de descarga'
      });
    }
  };

  const descargarExportSheet = () => {
    if (!sheetExportado) {
      toast.error('Genera el export primero');
      return;
    }

    const version = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
    const blob = new Blob([sheetExportado], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cfo-dashboard-export-v${version}.tsv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success('Archivo descargado', {
      description: 'Formato TSV compatible con Sheets'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <Sparkles className="h-8 w-8 text-yellow-500" />
          <h2 className="text-3xl font-bold">Análisis "Genio y Figura"</h2>
        </div>
        <p className="text-gray-600">{config.nombre_local} • {config.metros_cuadrados} m²</p>
        <div className="flex justify-center gap-2 flex-wrap">
          <Badge variant="outline">Derecho Llaves: ${formatChileno(CAPEX.derecho_llaves)}</Badge>
          <Badge variant="outline">Reserva 3M: ${formatChileno(CAPEX.reserva_sueldos_3m)}</Badge>
          <Badge variant="outline">CAPEX Total: ${formatChileno(CAPEX.total_invertido)}</Badge>
        </div>
        <p className="text-sm text-gray-500">Criterio: GENIO si Utilidad &gt; ${formatChileno(umbralGenio)}, sino FIGURA</p>
      </div>

      {/* Configurador de Umbral GENIO */}
      <Card className="border-2 border-yellow-500 bg-gradient-to-r from-yellow-50 to-amber-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-yellow-600" />
            Umbral GENIO Configurable
          </CardTitle>
          <CardDescription>
            Ajusta el umbral de utilidad diaria para clasificar GENIO vs FIGURA
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-3">
              <div className="flex items-end gap-3">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="umbralInput" className="text-sm font-semibold">
                    Utilidad Diaria Mínima (CLP)
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="umbralInput"
                      type="text"
                      placeholder="150.000"
                      value={umbralInput}
                      onChange={(e) => setUmbralInput(e.target.value)}
                      className="font-mono text-lg"
                    />
                    <Button 
                      onClick={() => {
                        const nuevoUmbral = normalizarValor(umbralInput);
                        if (nuevoUmbral > 0) {
                          setUmbralGenio(nuevoUmbral);
                          setUmbralInput(formatChileno(nuevoUmbral));
                          toast.success('Umbral actualizado', {
                            description: `GENIO si Utilidad > $${formatChileno(nuevoUmbral)}`
                          });
                          // Re-analizar si ya hay datos
                          if (analisis) {
                            setTimeout(() => analizarDatos(), 100);
                          }
                        } else {
                          toast.error('Valor inválido', {
                            description: 'Ingresa un monto mayor a 0'
                          });
                        }
                      }}
                      className="bg-yellow-600 hover:bg-yellow-700"
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Aplicar
                    </Button>
                  </div>
                  <p className="text-xs text-gray-600">
                    Normalizado: <span className="font-bold text-yellow-700">${formatChileno(normalizarValor(umbralInput))}</span>
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <p className="text-xs text-gray-600 w-full mb-1">⚡ Presets rápidos:</p>
                {[
                  { label: '$70k (18 meses)', valor: 70000 },
                  { label: '$105k (12 meses)', valor: 105000 },
                  { label: '$150k (8 meses)', valor: 150000 },
                  { label: '$210k (6 meses)', valor: 210000 }
                ].map((preset) => (
                  <Button
                    key={preset.valor}
                    variant="outline"
                    size="sm"
                    className={`text-xs ${umbralGenio === preset.valor ? 'border-yellow-600 bg-yellow-100' : 'border-gray-300'}`}
                    onClick={() => {
                      setUmbralGenio(preset.valor);
                      setUmbralInput(formatChileno(preset.valor));
                      toast.success('Preset aplicado', {
                        description: preset.label
                      });
                      if (analisis) {
                        setTimeout(() => analizarDatos(), 100);
                      }
                    }}
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg border-2 border-yellow-400">
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-600 mb-1">Umbral Actual</p>
                  <p className="text-2xl font-bold text-yellow-700">${formatChileno(umbralGenio)}</p>
                  <p className="text-xs text-gray-500">CLP/día</p>
                </div>
                <Separator />
                <div>
                  <p className="text-xs text-gray-600 mb-1">Proyección Payback</p>
                  <p className="text-lg font-bold text-blue-600">
                    {Math.ceil(CAPEX.total_invertido / umbralGenio)} días
                  </p>
                  <p className="text-xs text-gray-500">
                    ({(CAPEX.total_invertido / umbralGenio / 30).toFixed(1)} meses)
                  </p>
                </div>
                <Separator />
                <div>
                  <p className="text-xs text-gray-600 mb-1">Utilidad Anual</p>
                  <p className="text-lg font-bold text-green-600">
                    ${formatChileno(umbralGenio * 365)}
                  </p>
                  <p className="text-xs text-gray-500">ROI: {((umbralGenio * 365 / CAPEX.total_invertido) * 100).toFixed(0)}%</p>
                </div>
              </div>
            </div>
          </div>

          <Alert className="border-yellow-400 bg-yellow-50">
            <Sparkles className="h-4 w-4 text-yellow-600" />
            <AlertTitle className="text-sm font-bold">💡 Cómo elegir tu umbral</AlertTitle>
            <AlertDescription className="text-xs space-y-1">
              <p><strong>Agresivo ($210k):</strong> Payback 6 meses - Solo meses excepcionales son GENIO</p>
              <p><strong>Moderado ($150k):</strong> Payback 8 meses - Equilibrio entre exigencia y motivación</p>
              <p><strong>Realista ($105k):</strong> Payback 12 meses - Meta alcanzable para la mayoría</p>
              <p><strong>Conservador ($70k):</strong> Payback 18 meses - Más permisivo durante arranque</p>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Reglas de Normalización */}
      <Alert>
        <Calendar className="h-4 w-4" />
        <AlertTitle>Reglas de Análisis</AlertTitle>
        <AlertDescription className="text-sm space-y-1">
          <p>✓ Elimina "$", espacios, separadores "." y punto final</p>
          <p>✓ Redondea decimales (coma) al entero más cercano</p>
          <p>✓ Valores vacíos o inválidos = 0</p>
          <p>✓ Payback Derecho Llaves = ceil(${formatChileno(CAPEX.derecho_llaves)} / Utilidad) días</p>
          <p>✓ Status: GENIO si Utilidad &gt; ${formatChileno(umbralGenio)}, sino FIGURA</p>
        </AlertDescription>
      </Alert>

      {/* CAPEX Breakdown */}
      <Card className="border-blue-500 border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Estructura de Inversión - CAPEX
          </CardTitle>
          <CardDescription>Local {config.nombre_local}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Derecho de Llaves</p>
              <p className="text-2xl font-bold text-blue-600">${formatChileno(CAPEX.derecho_llaves)}</p>
              <p className="text-xs text-gray-500">CLP</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Reserva Sueldos (3 meses)</p>
              <p className="text-2xl font-bold text-blue-600">${formatChileno(CAPEX.reserva_sueldos_3m)}</p>
              <p className="text-xs text-gray-500">CLP</p>
            </div>
            <div className="bg-blue-100 p-4 rounded-lg border-2 border-blue-600">
              <p className="text-sm text-gray-600 mb-1 font-semibold">CAPEX Total Invertido</p>
              <p className="text-2xl font-bold text-blue-700">${formatChileno(CAPEX.total_invertido)}</p>
              <p className="text-xs text-gray-500">CLP</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Exportador Google Sheets con Versionado BD */}
      <Card className="border-2 border-purple-500 bg-gradient-to-r from-purple-50 to-pink-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-6 w-6 text-purple-600" />
            Exportador Google Sheets con Versionado BD
          </CardTitle>
          <CardDescription>
            Genera archivo TSV con todos tus registros mensuales + metadata versionada
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg border border-purple-300">
              <div className="flex items-center gap-2 mb-2">
                <FileSpreadsheet className="h-4 w-4 text-purple-600" />
                <p className="text-sm font-semibold text-purple-900">Registros</p>
              </div>
              <p className="text-3xl font-bold text-purple-700">{registros.length}</p>
              <p className="text-xs text-gray-600">Meses importados</p>
            </div>

            <div className="bg-white p-4 rounded-lg border border-purple-300">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-purple-600" />
                <p className="text-sm font-semibold text-purple-900">Formato</p>
              </div>
              <p className="text-lg font-bold text-purple-700">TSV</p>
              <p className="text-xs text-gray-600">Tab-separated (Sheets compatible)</p>
            </div>

            <div className="bg-white p-4 rounded-lg border border-purple-300">
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-purple-600 text-white text-xs">Versión</Badge>
              </div>
              <p className="text-xs font-mono text-purple-700">v{new Date().toISOString().substring(0, 10)}</p>
              <p className="text-xs text-gray-600">Auto-generado</p>
            </div>
          </div>

          <Alert className="border-purple-400 bg-purple-50">
            <Database className="h-4 w-4 text-purple-600" />
            <AlertTitle className="text-sm font-bold">💾 Base de Datos Versionada</AlertTitle>
            <AlertDescription className="text-xs space-y-2">
              <p>Cada export incluye:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li><strong>Metadata</strong>: Versión, timestamp, local, CAPEX</li>
                <li><strong>Headers</strong>: Columnas A-U estructuradas</li>
                <li><strong>Data</strong>: Todos los registros mensuales</li>
                <li><strong>Estadísticas</strong>: Resumen al final del archivo</li>
              </ul>
            </AlertDescription>
          </Alert>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={generarExportGoogleSheets} 
              className="flex-1 bg-purple-600 hover:bg-purple-700"
              size="lg"
            >
              <FileSpreadsheet className="mr-2 h-5 w-5" />
              Generar Export BD
            </Button>

            <Button 
              onClick={copiarExportSheet} 
              variant="outline"
              className="flex-1 border-purple-400 text-purple-700 hover:bg-purple-50"
              size="lg"
              disabled={!sheetExportado}
            >
              {copiadoSheet ? (
                <>
                  <CheckCircle2 className="mr-2 h-5 w-5" />
                  ¡Copiado!
                </>
              ) : (
                <>
                  <Copy className="mr-2 h-5 w-5" />
                  Copiar TSV
                </>
              )}
            </Button>

            <Button 
              onClick={descargarExportSheet} 
              variant="outline"
              className="flex-1 border-purple-400 text-purple-700 hover:bg-purple-50"
              size="lg"
              disabled={!sheetExportado}
            >
              <Download className="mr-2 h-5 w-5" />
              Descargar .tsv
            </Button>
          </div>

          {sheetExportado && (
            <div className="border-2 border-purple-300 rounded-lg p-4 bg-white">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-bold text-purple-900">Preview del Export:</p>
                <Badge className="bg-green-500 text-white">✓ Listo</Badge>
              </div>
              <pre className="p-3 bg-gray-900 text-green-400 rounded text-[10px] font-mono overflow-x-auto max-h-64">
{sheetExportado.substring(0, 1500)}
{sheetExportado.length > 1500 ? '\n\n... (contenido truncado, descarga para ver completo)' : ''}
              </pre>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-gray-600">Líneas:</span>{' '}
                  <span className="font-bold text-purple-700">{sheetExportado.split('\n').length}</span>
                </div>
                <div>
                  <span className="text-gray-600">Tamaño:</span>{' '}
                  <span className="font-bold text-purple-700">{(sheetExportado.length / 1024).toFixed(2)} KB</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Google Sheets Connection */}
      <Card>
        <CardHeader>
          <CardTitle>Entrada de Datos desde Google Sheets</CardTitle>
          <CardDescription>Copia columnas A, F, G, H (Fecha | Venta | RevPSM | Utilidad)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>URL de Google Sheets</Label>
            <Input 
              value={googleSheetsUrl} 
              readOnly 
              className="font-mono text-xs bg-gray-50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sheetsData">Pegar fila desde Google Sheets</Label>
            <Textarea
              id="sheetsData"
              placeholder="Ejemplo: 2024-02-22	$1.200.000.	$48.000.	$350.000."
              rows={3}
              onChange={(e) => procesarDatosDesdeSheets(e.target.value)}
              className="font-mono text-sm"
            />
            <p className="text-xs text-gray-500">
              Selecciona una fila completa en Google Sheets y pega aquí (mantiene tabs automáticamente)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Manual Input */}
      <Card>
        <CardHeader>
          <CardTitle>Entrada Manual de Datos</CardTitle>
          <CardDescription>Los valores serán normalizados automáticamente</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fecha">Fecha (Col A)</Label>
              <Input
                id="fecha"
                type="text"
                placeholder="2024-02-22"
                value={rowData.fecha}
                onChange={(e) => setRowData({ ...rowData, fecha: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="venta">Venta (Col F)</Label>
              <Input
                id="venta"
                type="text"
                placeholder="$1.200.000. o 1200000"
                value={rowData.venta || ''}
                onChange={(e) => setRowData({ ...rowData, venta: normalizarValor(e.target.value) })}
              />
              <p className="text-xs text-gray-500">Normalizado: {formatChileno(rowData.venta)}</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="revPSM">RevPSM (Col G)</Label>
              <Input
                id="revPSM"
                type="text"
                placeholder="$48.000. o 0 (auto)"
                value={rowData.revPSM || ''}
                onChange={(e) => setRowData({ ...rowData, revPSM: normalizarValor(e.target.value) })}
              />
              <p className="text-xs text-gray-500">
                {rowData.revPSM > 0 ? `Normalizado: ${formatChileno(rowData.revPSM)}` : 'Se calculará automático'}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="utilidad">Utilidad (Col H)</Label>
              <Input
                id="utilidad"
                type="text"
                placeholder="$350.000. o 350000"
                value={rowData.utilidad || ''}
                onChange={(e) => setRowData({ ...rowData, utilidad: normalizarValor(e.target.value) })}
              />
              <p className="text-xs text-gray-500">Normalizado: {formatChileno(rowData.utilidad)}</p>
            </div>
          </div>
          <Button onClick={analizarDatos} className="w-full mt-6" size="lg">
            <Sparkles className="mr-2 h-4 w-4" />
            Analizar "Genio y Figura"
          </Button>
        </CardContent>
      </Card>

      {/* Resultados */}
      {analisis && (
        <>
          {/* Status Badge */}
          <div className="flex justify-center">
            <Badge 
              variant={analisis.status === 'GENIO' ? 'default' : 'secondary'}
              className={`text-3xl py-4 px-8 ${
                analisis.status === 'GENIO' 
                  ? 'bg-green-500 hover:bg-green-600' 
                  : 'bg-orange-500 hover:bg-orange-600 text-white'
              }`}
            >
              {analisis.status === 'GENIO' ? '🎯 GENIO' : '📊 FIGURA'}
            </Badge>
          </div>

          {/* Criterio Aplicado */}
          <Alert className={analisis.status === 'GENIO' ? 'border-green-500 bg-green-50' : 'border-orange-500 bg-orange-50'}>
            <Sparkles className="h-4 w-4" />
            <AlertTitle>Criterio de Clasificación</AlertTitle>
            <AlertDescription>
              Utilidad del día: <strong>${formatChileno(rowData.utilidad)} CLP</strong>
              {analisis.status === 'GENIO' 
                ? ` > $${formatChileno(umbralGenio)} ✓ GENIO`
                : ` ≤ $${formatChileno(umbralGenio)} → FIGURA`
              }
            </AlertDescription>
          </Alert>

          {/* Insight Card */}
          <Card className={`border-2 ${
            analisis.status === 'GENIO' 
              ? 'border-green-500 bg-green-50' 
              : 'border-orange-500 bg-orange-50'
          }`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Insight Generado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-base font-mono">{analisis.insight}</p>
            </CardContent>
          </Card>

          {/* Métricas Clave */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Fecha Análisis</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{rowData.fecha || 'Sin fecha'}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Venta Consolidada</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">${formatChileno(rowData.venta)}</p>
                <p className="text-xs text-gray-500">CLP</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">RevPSM</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  ${formatChileno(rowData.revPSM > 0 ? rowData.revPSM : calcularRevPSMDesdeVenta(rowData.venta))}
                </p>
                <p className="text-xs text-gray-500">CLP/m²</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Utilidad Neta</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">${formatChileno(rowData.utilidad)}</p>
                <p className="text-xs text-gray-500">CLP (Umbral: ${formatChileno(umbralGenio)})</p>
              </CardContent>
            </Card>
          </div>

          {/* Payback Analysis - Dual */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Payback - Derecho de Llaves</CardTitle>
                <CardDescription>Cálculo: ceil(${formatChileno(CAPEX.derecho_llaves)} / Utilidad)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Derecho de Llaves</span>
                    <span className="font-bold">${formatChileno(CAPEX.derecho_llaves)} CLP</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Utilidad Diaria</span>
                    <span className="font-bold">${formatChileno(rowData.utilidad)} CLP</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-sm font-semibold">Payback</span>
                    <span className="text-2xl font-bold text-blue-600">
                      {analisis.payback_days === 'N/A' 
                        ? 'N/A' 
                        : `${analisis.payback_days} días`
                      }
                    </span>
                  </div>
                  {analisis.payback_days !== 'N/A' && (
                    <p className="text-xs text-gray-500 text-right">
                      ({Math.ceil(parseInt(analisis.payback_days) / 30)} meses)
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payback - CAPEX Total</CardTitle>
                <CardDescription>Inversión completa incluyendo reservas</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>CAPEX Total</span>
                    <span className="font-bold">${formatChileno(CAPEX.total_invertido)} CLP</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Utilidad Diaria</span>
                    <span className="font-bold">${formatChileno(rowData.utilidad)} CLP</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-sm font-semibold">Payback Total</span>
                    <span className="text-2xl font-bold text-purple-600">
                      {rowData.utilidad > 0 
                        ? `${calcularPaybackCapexTotal()} días` 
                        : 'N/A'
                      }
                    </span>
                  </div>
                  {rowData.utilidad > 0 && (
                    <p className="text-xs text-gray-500 text-right">
                      ({Math.ceil(calcularPaybackCapexTotal() / 30)} meses)
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Proyección */}
          <Card>
            <CardHeader>
              <CardTitle>💡 Proyección de Recuperación</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-blue-50 p-4 rounded-lg space-y-3">
                {rowData.utilidad > 0 ? (
                  <>
                    <p className="text-sm">
                      <strong>Derecho de Llaves:</strong> Con utilidad diaria de ${formatChileno(rowData.utilidad)}, 
                      se recuperará en {analisis.payback_days} días ({Math.ceil(parseInt(analisis.payback_days) / 30)} meses).
                    </p>
                    <p className="text-sm">
                      <strong>CAPEX Total:</strong> La inversión completa de ${formatChileno(CAPEX.total_invertido)} 
                      se recuperará en {calcularPaybackCapexTotal()} días ({Math.ceil(calcularPaybackCapexTotal() / 30)} meses).
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-orange-600">
                    No se puede calcular payback con utilidad cero o negativa. Revisa los costos operacionales.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* JSON Output - LIMPIO */}
          <Card className="border-green-600 border-2">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Salida JSON (LIMPIA)</span>
                <div className="flex gap-2">
                  <Button onClick={copiarJSON} variant="outline" size="sm">
                    {copied ? (
                      <>
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Copiado
                      </>
                    ) : (
                      <>
                        <Copy className="mr-2 h-4 w-4" />
                        Copiar
                      </>
                    )}
                  </Button>
                  <Button onClick={descargarJSON} variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Descargar
                  </Button>
                </div>
              </CardTitle>
              <CardDescription>JSON sin markdown, listo para integración</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="p-4 bg-gray-900 text-green-400 rounded-lg overflow-x-auto text-sm font-mono">
{jsonOutput}
              </pre>
            </CardContent>
          </Card>

          {/* JSON Expandido (para referencia) */}
          <Card>
            <CardHeader>
              <CardTitle>JSON Expandido (Referencia Completa)</CardTitle>
              <CardDescription>Incluye todos los datos del local y CAPEX</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="p-4 bg-gray-900 text-green-400 rounded-lg overflow-x-auto text-xs font-mono">
{JSON.stringify({
  local: config.nombre_local,
  capex: {
    derecho_llaves: formatChileno(CAPEX.derecho_llaves),
    reserva_sueldos_3m: formatChileno(CAPEX.reserva_sueldos_3m),
    total_invertido: formatChileno(CAPEX.total_invertido)
  },
  real_time_kpis: {
    venta_consolidada: formatChileno(rowData.venta),
    utilidad_neta: formatChileno(rowData.utilidad),
    rev_psm: formatChileno(rowData.revPSM > 0 ? rowData.revPSM : calcularRevPSMDesdeVenta(rowData.venta))
  },
  analisis: {
    ...analisis,
    criterio: `if(utilidad > ${formatChileno(umbralGenio)}; 'GENIO'; 'FIGURA')`,
    payback_capex_total_dias: rowData.utilidad > 0 ? calcularPaybackCapexTotal() : 'N/A',
    payback_capex_total_meses: rowData.utilidad > 0 ? Math.ceil(calcularPaybackCapexTotal() / 30) : 'N/A'
  },
  datos_entrada: {
    fecha: rowData.fecha,
    venta: rowData.venta,
    revPSM: rowData.revPSM > 0 ? rowData.revPSM : calcularRevPSMDesdeVenta(rowData.venta),
    utilidad: rowData.utilidad
  }
}, null, 2)}
              </pre>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}