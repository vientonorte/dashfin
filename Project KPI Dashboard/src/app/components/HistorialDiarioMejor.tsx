import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Upload, TrendingUp } from 'lucide-react';
import { useDashboard } from '../contexts/DashboardContext';
import { IngresoDataUnificado } from './IngresoDataUnificado';
import { ImportadorGoogleSheets } from './ImportadorGoogleSheets';
import { TablaHistorial } from './TablaHistorial';

export function HistorialDiarioMejor() {
  const { registros, metricas } = useDashboard();

  const formatChileno = (num: number): string => {
    return Math.round(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const lineaDominanteInfo = {
    cafe: { nombre: 'Cafetería', emoji: '☕', color: 'orange', recomendacion: 'La cafetería genera el mayor margen. Optimizar rotación de mesas y ticket promedio.' },
    hotdesk: { nombre: 'Hotdesk', emoji: '💻', color: 'blue', recomendacion: 'Hotdesk lidera en margen. Evaluar expansión de espacios de coworking.' },
    asesoria: { nombre: 'Asesorías', emoji: '📊', color: 'purple', recomendacion: 'Asesorías dominan. Considerar más espacios para reuniones privadas.' },
  };

  const dominante = metricas.lineaDominante ? lineaDominanteInfo[metricas.lineaDominante] : null;

  return (
    <div className="space-y-4">
      {/* Header - CAPEX y Payback */}
      {registros.length > 0 && (
        <div className="bg-white border rounded-lg px-4 py-2 flex items-center justify-center gap-8">
          <div className="text-sm">
            <span className="text-gray-600">CAPEX: </span>
            <span className="font-bold text-gray-900">$37.697.000</span>
          </div>
          <div className="h-4 w-px bg-gray-300"></div>
          <div className="text-sm">
            <span className="text-gray-600">Payback: </span>
            <span className="font-bold text-gray-900">{metricas.paybackMeses} meses</span>
          </div>
        </div>
      )}

      {/* Estado Vacío - Dashboard sin datos */}
      {registros.length === 0 && (
        <Alert className="border-2 border-blue-600 bg-blue-50">
          <Upload className="h-5 w-5 text-blue-600" />
          <AlertTitle className="text-base font-bold">👋 Bienvenido a tu CFO Dashboard - Local "Da Pleisë"</AlertTitle>
          <AlertDescription className="space-y-3 text-sm">
            <p className="font-semibold">Para empezar, importa tus datos de venta reales usando el importador CSV 📊</p>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li><strong>Descarga la plantilla CSV</strong> desde el botón verde del importador ⬇️</li>
              <li><strong>Llena con tus datos reales</strong> de 30 días de venta</li>
              <li><strong>Sube el archivo</strong> y el sistema agregará automáticamente el mes</li>
              <li><strong>Expande cada mes</strong> en el historial con [+] para ver desglose día por día</li>
            </ol>
            <div className="bg-white p-3 rounded border border-blue-300 mt-3">
              <p className="text-xs font-semibold mb-2">📊 El sistema calculará automáticamente:</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>✅ Márgenes por línea (Café 68% / Hotdesk 92.5% / Asesorías 100%)</div>
                <div>✅ ROI y RevPSM por m²</div>
                <div>✅ Status Genio (&gt;$150K) / Figura (≤$150K)</div>
                <div>✅ Línea dominante (mayor margen)</div>
                <div>✅ Alertas de canibalización</div>
                <div>✅ Payback estimado (Derecho Llaves $18.9M)</div>
              </div>
            </div>
            <p className="text-xs text-gray-600 mt-2">
              💡 <strong>Tip:</strong> También puedes ingresar datos manualmente mes por mes usando el formulario.
            </p>
          </AlertDescription>
        </Alert>
      )}

      {/* ⭐ INGRESO DE DATOS UNIFICADO - Control Maestro */}
      <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-6 space-y-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Control Maestro - Ingreso de Datos</h2>
          <p className="text-sm text-gray-600 mt-1">Este es el punto de entrada principal del dashboard. Los datos ingresados aquí alimentan todas las demás vistas (Metas, Webhook, SOP, etc.).</p>
        </div>
        
        {/* Importador Google Sheets - Método Recomendado */}
        <ImportadorGoogleSheets />
        
        {/* CSV/Manual - Métodos Alternativos */}
        <IngresoDataUnificado />
      </div>

      {/* Alert - Línea Dominante */}
      {registros.length > 0 && dominante && (
        <Alert className={`border-2 ${
          dominante.color === 'orange' ? 'border-orange-400 bg-orange-50' :
          dominante.color === 'blue' ? 'border-blue-400 bg-blue-50' :
          'border-purple-400 bg-purple-50'
        }`}>
          <div className="flex items-center gap-2">
            <TrendingUp className={`h-5 w-5 ${
              dominante.color === 'orange' ? 'text-orange-600' :
              dominante.color === 'blue' ? 'text-blue-600' :
              'text-purple-600'
            }`} />
            <span className="text-2xl">{dominante.emoji}</span>
          </div>
          <AlertTitle className="text-base font-bold">
            Línea Dominante: {dominante.nombre}
          </AlertTitle>
          <AlertDescription className="text-sm">
            {dominante.recomendacion}
          </AlertDescription>
        </Alert>
      )}

      {/* HISTORIAL, GRÁFICOS Y ANÁLISIS */}
      <TablaHistorial />
    </div>
  );
}