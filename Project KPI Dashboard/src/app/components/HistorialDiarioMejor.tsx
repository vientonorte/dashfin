import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Upload, TrendingUp, FileSpreadsheet } from 'lucide-react';
import { useDashboard } from '../contexts/DashboardContext';
import { IngresoDataUnificado } from './IngresoDataUnificado';
import { ImportadorGoogleSheets } from './ImportadorGoogleSheets';
import { TablaHistorial } from './TablaHistorial';

export function HistorialDiarioMejor() {
  const { registros, metricas } = useDashboard();

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
            <p className="font-semibold">Para empezar, importa tus datos de venta reales usando uno de los métodos abajo 📊</p>
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
          </AlertDescription>
        </Alert>
      )}

      {/* ⭐ CARGA DE DATOS UNIFICADA */}
      <div className="bg-white border-2 border-blue-300 rounded-lg overflow-hidden">
        <div className="bg-blue-50 px-4 py-3 border-b border-blue-200">
          <h2 className="text-base font-bold text-gray-900">Carga de Datos</h2>
          <p className="text-xs text-gray-600 mt-0.5">Elige tu método: Google Sheets, CSV o ingreso manual</p>
        </div>
        <div className="p-4">
          <Tabs defaultValue="sheets" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="sheets" className="text-sm">
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Google Sheets
              </TabsTrigger>
              <TabsTrigger value="csv-manual" className="text-sm">
                <Upload className="h-4 w-4 mr-2" />
                CSV / Manual
              </TabsTrigger>
            </TabsList>
            <TabsContent value="sheets">
              <ImportadorGoogleSheets />
            </TabsContent>
            <TabsContent value="csv-manual">
              <IngresoDataUnificado />
            </TabsContent>
          </Tabs>
        </div>
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