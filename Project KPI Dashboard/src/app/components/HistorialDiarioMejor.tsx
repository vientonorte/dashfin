import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Upload, TrendingUp, FileSpreadsheet } from 'lucide-react';
import { useDashboard } from '../contexts/DashboardContext';
import { IngresoDataUnificado } from './IngresoDataUnificado';
import { ImportadorGoogleSheets } from './ImportadorGoogleSheets';
import { OnboardingDataIngestion } from './OnboardingDataIngestion';
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
        <Alert className="border-2 border-primary/30 bg-primary/5">
          <Upload className="h-5 w-5 text-primary" />
          <AlertTitle className="text-base font-bold">Bienvenido a tu Dashboard Financiero</AlertTitle>
          <AlertDescription className="text-sm">
            <p>Importa tus datos de venta para ver métricas, márgenes y ROI al instante.</p>
            <p className="text-xs text-muted-foreground mt-2">Solo necesitas un CSV o 3 números para empezar.</p>
          </AlertDescription>
        </Alert>
      )}

      {/* ⭐ ONBOARDING: Zero-friction data ingestion */}
      <OnboardingDataIngestion />

      {/* Carga avanzada: Google Sheets / CSV Legacy */}
      <details className="group">
        <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground transition-colors list-none flex items-center gap-2 px-4 py-2">
          <FileSpreadsheet className="h-3.5 w-3.5" />
          Más opciones: Google Sheets o importador CSV avanzado
        </summary>
        <div className="mt-2 bg-white border-2 border-muted rounded-lg overflow-hidden">
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
      </details>

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