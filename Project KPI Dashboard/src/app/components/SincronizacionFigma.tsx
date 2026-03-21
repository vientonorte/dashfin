import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { 
  Figma, 
  RefreshCw, 
  CheckCircle2, 
  Copy, 
  Download,
  Circle,
  AlertCircle,
  TrendingUp,
  User,
  Coffee,
  Target,
  Loader2
} from 'lucide-react';
import { useDashboard } from '../contexts/DashboardContext';
import { toast } from 'sonner';

const DERECHO_LLAVES = 18900000;
const CAPEX_TOTAL = 37697000;

// Metas por rol (desde MetasPorRol.tsx)
const METAS = {
  admin_utilidad: 5198320,
  barista1_ticket: 7949, // Ticket promedio
  barista2_revpsm: 635440,
  barista3_conversion: 32.7 // Margen neto %
};

export function SincronizacionFigma() {
  const { registros, metricas } = useDashboard();
  const [copied, setCopied] = useState(false);
  const [sincronizando, setSincronizando] = useState(false);

  // Calcular acumulado total recuperado (Columna H equivalente)
  const totalRecuperado = registros.reduce((sum, r) => sum + r.utilidad_neta_clp, 0);
  const porcentajePayback = (totalRecuperado / DERECHO_LLAVES) * 100;
  const statusPayback = totalRecuperado >= DERECHO_LLAVES ? 'verde' : 'pendiente';

  // Último mes de datos (más reciente)
  const ultimoMes = registros[0];

  // Calcular métricas actuales para cada KPI
  const admin_utilidad_actual = ultimoMes?.utilidad_neta_clp || 0;
  const barista1_ticket_actual = ultimoMes ? 
    Math.round(ultimoMes.venta_total_clp / 30 / 50) : 0; // Asumiendo ~50 transacciones/día
  const barista2_revpsm_actual = ultimoMes?.revpsm_clp_m2 || 0;
  const barista3_conversion_actual = ultimoMes?.margen_neto_percent || 0;

  // Función para determinar color según cumplimiento
  const getColorCumplimiento = (actual: number, meta: number): 'verde' | 'amarillo' | 'rojo' => {
    const porcentaje = (actual / meta) * 100;
    if (porcentaje >= 100) return 'verde';
    if (porcentaje >= 80) return 'amarillo';
    return 'rojo';
  };

  const colorAdmin = getColorCumplimiento(admin_utilidad_actual, METAS.admin_utilidad);
  const colorBarista1 = getColorCumplimiento(barista1_ticket_actual, METAS.barista1_ticket);
  const colorBarista2 = getColorCumplimiento(barista2_revpsm_actual, METAS.barista2_revpsm);
  const colorBarista3 = getColorCumplimiento(barista3_conversion_actual, METAS.barista3_conversion);

  // Mapeo de colores Figma (hex)
  const colorMap = {
    verde: '#10B981',    // green-500
    amarillo: '#F59E0B', // amber-500
    rojo: '#EF4444'      // red-500
  };

  // Generar JSON de sincronización para Figma
  const figmaData = {
    project: 'Pouch Growl Reportes - CFO Dashboard',
    timestamp: new Date().toISOString(),
    sync_version: '1.0',
    
    // Variables principales
    variables: {
      // Admin - Utilidad Neta
      '#Admin_Utilidad': {
        value: admin_utilidad_actual,
        formatted: `$${Math.round(admin_utilidad_actual).toLocaleString('es-CL')}`,
        meta: METAS.admin_utilidad,
        cumplimiento_percent: Math.round((admin_utilidad_actual / METAS.admin_utilidad) * 100),
        color: colorMap[colorAdmin],
        status: colorAdmin
      },
      
      // Barista 1 - Ticket Promedio
      '#Barista1_Ticket': {
        value: barista1_ticket_actual,
        formatted: `$${Math.round(barista1_ticket_actual).toLocaleString('es-CL')}`,
        meta: METAS.barista1_ticket,
        cumplimiento_percent: Math.round((barista1_ticket_actual / METAS.barista1_ticket) * 100),
        color: colorMap[colorBarista1],
        status: colorBarista1
      },
      
      // Barista 2 - RevPSM
      '#Barista2_RevPSM': {
        value: barista2_revpsm_actual,
        formatted: `$${Math.round(barista2_revpsm_actual).toLocaleString('es-CL')}/m²`,
        meta: METAS.barista2_revpsm,
        cumplimiento_percent: Math.round((barista2_revpsm_actual / METAS.barista2_revpsm) * 100),
        color: colorMap[colorBarista2],
        status: colorBarista2
      },
      
      // Barista 3 - Margen Neto (Conversión)
      '#Barista3_Conversion': {
        value: barista3_conversion_actual,
        formatted: `${barista3_conversion_actual.toFixed(1)}%`,
        meta: METAS.barista3_conversion,
        cumplimiento_percent: Math.round((barista3_conversion_actual / METAS.barista3_conversion) * 100),
        color: colorMap[colorBarista3],
        status: colorBarista3
      },
      
      // Status Payback
      '#StatusPayback': {
        value: totalRecuperado,
        formatted: `$${Math.round(totalRecuperado).toLocaleString('es-CL')}`,
        objetivo: DERECHO_LLAVES,
        porcentaje: Math.round(porcentajePayback),
        color: statusPayback === 'verde' ? colorMap.verde : colorMap.amarillo,
        status: statusPayback,
        completado: totalRecuperado >= DERECHO_LLAVES
      }
    },
    
    // Datos adicionales para contexto
    context: {
      total_meses_historial: registros.length,
      fecha_ultimo_mes: ultimoMes?.date || 'N/A',
      capex_total: CAPEX_TOTAL,
      derecho_llaves: DERECHO_LLAVES,
      payback_meses: metricas.paybackMeses || 0,
      linea_dominante: metricas.lineaDominante || 'cafe',
      roi_promedio: metricas.roiMedio || 0
    }
  };

  const copiarJSON = async () => {
    const json = JSON.stringify(figmaData, null, 2);
    try {
      await navigator.clipboard.writeText(json);
      setCopied(true);
      toast.success('JSON copiado al portapapeles', {
        description: 'Ahora puedes pegarlo en el plugin Sync to Figma'
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback
      const textarea = document.createElement('textarea');
      textarea.value = json;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
        setCopied(true);
        toast.success('JSON copiado (fallback)', {
          description: 'Ahora puedes pegarlo en el plugin Sync to Figma'
        });
        setTimeout(() => setCopied(false), 2000);
      } catch (e) {
        toast.error('No se pudo copiar', {
          description: 'Intenta usar el botón de descarga'
        });
      }
      document.body.removeChild(textarea);
    }
  };

  const descargarJSON = () => {
    const json = JSON.stringify(figmaData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `figma-sync-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('JSON descargado exitosamente', {
      description: 'Archivo guardado en tu carpeta de descargas'
    });
  };

  const simularSincronizacion = () => {
    setSincronizando(true);
    toast.loading('Sincronizando con Figma...', { id: 'sync-figma' });
    setTimeout(() => {
      setSincronizando(false);
      toast.success('Sincronización completada', { 
        id: 'sync-figma',
        description: 'Las variables se actualizaron correctamente'
      });
    }, 2000);
  };

  const formatChileno = (num: number): string => {
    return Math.round(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const getColorClass = (color: 'verde' | 'amarillo' | 'rojo') => {
    switch (color) {
      case 'verde': return 'bg-green-500';
      case 'amarillo': return 'bg-amber-500';
      case 'rojo': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getColor = (percent: number): string => {
    if (percent >= 100) return '#10B981'; // verde
    if (percent >= 80) return '#F59E0B'; // amarillo
    return '#EF4444'; // rojo
  };

  return (
    <Card className="border-2 border-purple-500 shadow-lg">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl flex items-center gap-2">
          <Figma className="h-6 w-6 text-purple-600" />
          Sincronización con Figma
        </CardTitle>
        <CardDescription>
          Plugin: <strong>Sync to Figma</strong> • Proyecto: Pouch Growl Reportes
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Estado de registros */}
        {registros.length === 0 ? (
          <Alert className="border-amber-500 bg-amber-50">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle className="text-sm">Sin datos para sincronizar</AlertTitle>
            <AlertDescription className="text-xs">
              Importa datos mensuales primero para habilitar la sincronización con Figma.
            </AlertDescription>
          </Alert>
        ) : (
          <>
            {/* Status Payback - Visual Principal */}
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-4 rounded-lg border-2 border-purple-300">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Badge 
                    className={`${statusPayback === 'verde' ? 'bg-green-600' : 'bg-amber-500'} text-white px-3`}
                  >
                    #StatusPayback
                  </Badge>
                  {statusPayback === 'verde' ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : (
                    <Circle className="h-5 w-5 text-amber-500" />
                  )}
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">
                    ${formatChileno(totalRecuperado)}
                  </div>
                  <div className="text-xs text-gray-600">
                    de ${formatChileno(DERECHO_LLAVES)}
                  </div>
                </div>
              </div>
              <Progress value={Math.min(porcentajePayback, 100)} className="h-3" />
              <div className="text-xs text-gray-600 mt-2 text-right">
                {Math.round(porcentajePayback)}% recuperado
              </div>
              {statusPayback === 'verde' && (
                <div className="mt-2 text-sm font-semibold text-green-700 flex items-center gap-1">
                  <CheckCircle2 className="h-4 w-4" />
                  ¡Derecho de Llaves recuperado!
                </div>
              )}
            </div>

            {/* KPIs por Rol - Grid */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <Target className="h-4 w-4" />
                Variables por Rol (KPIs)
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Admin - Utilidad */}
                <div className="bg-white border-2 rounded-lg p-3 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-blue-600" />
                      <Badge variant="outline" className="text-xs">#Admin_Utilidad</Badge>
                    </div>
                    <div className={`w-3 h-3 rounded-full ${getColorClass(colorAdmin)}`}></div>
                  </div>
                  <div className="text-lg font-bold text-gray-900">
                    ${formatChileno(admin_utilidad_actual)}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    Meta: ${formatChileno(METAS.admin_utilidad)} • {Math.round((admin_utilidad_actual / METAS.admin_utilidad) * 100)}%
                  </div>
                </div>

                {/* Barista 1 - Ticket */}
                <div className="bg-white border-2 rounded-lg p-3 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Coffee className="h-4 w-4 text-orange-600" />
                      <Badge variant="outline" className="text-xs">#Barista1_Ticket</Badge>
                    </div>
                    <div className={`w-3 h-3 rounded-full ${getColorClass(colorBarista1)}`}></div>
                  </div>
                  <div className="text-lg font-bold text-gray-900">
                    ${formatChileno(barista1_ticket_actual)}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    Meta: ${formatChileno(METAS.barista1_ticket)} • {Math.round((barista1_ticket_actual / METAS.barista1_ticket) * 100)}%
                  </div>
                </div>

                {/* Barista 2 - RevPSM */}
                <div className="bg-white border-2 rounded-lg p-3 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      <Badge variant="outline" className="text-xs">#Barista2_RevPSM</Badge>
                    </div>
                    <div className={`w-3 h-3 rounded-full ${getColorClass(colorBarista2)}`}></div>
                  </div>
                  <div className="text-lg font-bold text-gray-900">
                    ${formatChileno(barista2_revpsm_actual)}/m²
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    Meta: ${formatChileno(METAS.barista2_revpsm)} • {Math.round((barista2_revpsm_actual / METAS.barista2_revpsm) * 100)}%
                  </div>
                </div>

                {/* Barista 3 - Conversión */}
                <div className="bg-white border-2 rounded-lg p-3 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-purple-600" />
                      <Badge variant="outline" className="text-xs">#Barista3_Conversion</Badge>
                    </div>
                    <div className={`w-3 h-3 rounded-full ${getColorClass(colorBarista3)}`}></div>
                  </div>
                  <div className="text-lg font-bold text-gray-900">
                    {barista3_conversion_actual.toFixed(1)}%
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    Meta: {METAS.barista3_conversion}% • {Math.round((barista3_conversion_actual / METAS.barista3_conversion) * 100)}%
                  </div>
                </div>
              </div>
            </div>

            {/* Instrucciones de uso del plugin */}
            <Alert className="border-purple-500 bg-purple-50">
              <Figma className="h-4 w-4" />
              <AlertTitle className="text-sm">📌 Pasos para sincronizar con Figma</AlertTitle>
              <AlertDescription className="text-xs space-y-2 mt-2">
                <ol className="list-decimal list-inside space-y-1">
                  <li>Copia el JSON de sincronización con el botón de abajo</li>
                  <li>Abre tu archivo de Figma "Pouch Growl Reportes"</li>
                  <li>Ejecuta el plugin <strong>Sync to Figma</strong></li>
                  <li>Pega el JSON y aplica la sincronización</li>
                  <li>Las variables se actualizarán automáticamente con colores</li>
                </ol>
                <div className="bg-white p-2 rounded mt-2 text-[10px] font-mono">
                  <p>• <strong>#StatusPayback</strong> → Verde si &gt; $18.9M</p>
                  <p>• <strong>#KPI_Rol</strong> → Verde (≥100%) / Amarillo (≥80%) / Rojo (&lt;80%)</p>
                </div>
              </AlertDescription>
            </Alert>

            {/* Botones de acción */}
            <div className="flex gap-2">
              <Button
                onClick={copiarJSON}
                variant="default"
                className="flex-1"
                disabled={registros.length === 0}
              >
                {copied ? (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Copiado
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 h-4 w-4" />
                    Copiar JSON
                  </>
                )}
              </Button>
              
              <Button
                onClick={descargarJSON}
                variant="outline"
                disabled={registros.length === 0}
              >
                <Download className="mr-2 h-4 w-4" />
                Descargar
              </Button>
              
              <Button
                onClick={simularSincronizacion}
                variant="outline"
                disabled={sincronizando || registros.length === 0}
              >
                {sincronizando ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Sincronizando...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Simular Sync
                  </>
                )}
              </Button>
            </div>

            {/* Preview del JSON */}
            <details className="text-xs">
              <summary className="cursor-pointer font-semibold text-gray-700 hover:text-gray-900">
                Ver preview del JSON de sincronización
              </summary>
              <pre className="mt-2 p-3 bg-gray-900 text-green-400 rounded overflow-x-auto text-[10px] font-mono max-h-64 overflow-y-auto">
                {JSON.stringify(figmaData, null, 2)}
              </pre>
            </details>
          </>
        )}
      </CardContent>
    </Card>
  );
}