import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { AlertTriangle, TrendingUp, DollarSign, Square, Users, Download, Target, Calendar, Wallet, Sparkles, Coffee, Laptop, Briefcase, FileText, Bell, Webhook, ShieldAlert, BarChart3, Camera, Zap, Eye, Layers, Globe } from 'lucide-react';
import { Progress } from './ui/progress';
import { WebhooksMake } from './WebhooksMake';
import { AlertasAutomaticas } from './AlertasAutomaticas';
import { InformeEjecutivo } from './InformeEjecutivo';
import { GenioyFigura } from './GenioyFigura';
import { MetasPorRol } from './MetasPorRol';
import { HistorialDiarioMejor } from './HistorialDiarioMejor';
import { ReportesEjecutivos } from './ReportesEjecutivos';
import { SincronizacionFigma } from './SincronizacionFigma';
import { AuditoriaOperativa } from './AuditoriaOperativa';
import { GuiaWebhookMake } from './GuiaWebhookMake';
import { TutorialMakeGoogleSheets } from './TutorialMakeGoogleSheets';
import { AnalisisUXAnalisis } from './AnalisisUXAnalisis';
import { ArquitecturaInformacion } from './ArquitecturaInformacion';
import { IntegracionB2C } from './IntegracionB2C';
import { useDashboard } from '../contexts/DashboardContext';

interface VentaData {
  fecha: string;
  ventaTotal: number;
  transacciones: number;
  costoLaboral: number;
  otrosCostos: number;
}

interface AnalisisResult {
  revPSM: number;
  laborCostPercent: number;
  ticketPromedio: number;
  margenBruto: number;
  margenNeto: number;
  alertaCritica: boolean;
  resumenEjecutivo: string;
}

interface ProyectoData {
  proyecto: string;
  kpis_principales: {
    venta_mensual_clp: number;
    utilidad_neta_clp: number;
    margen_neta_percent: number;
    rev_psm_clp: number;
  };
  inversion_status: {
    capex_total_clp: number;
    recuperado_acumulado_clp: number;
    meses_restantes_payback: number;
  };
  operacion_staff: {
    costo_diario_clp: number;
    eficiencia_laboral_percent: number;
  };
}

const datosProyecto: ProyectoData = {
  proyecto: "Ratio Irarrázaval",
  kpis_principales: {
    venta_mensual_clp: 15886000,
    utilidad_neta_clp: 5198320,
    margen_neta_percent: 32.7,
    rev_psm_clp: 635440
  },
  inversion_status: {
    capex_total_clp: 37697000,
    recuperado_acumulado_clp: 0,
    meses_restantes_payback: 7.2
  },
  operacion_staff: {
    costo_diario_clp: 114833,
    eficiencia_laboral_percent: 21.7
  }
};

export function CFODashboard() {
  // Conectar con el Context para usar datos reales del historial
  const { registros, metricas } = useDashboard();
  
  const [ventaData, setVentaData] = useState<VentaData>({
    fecha: new Date().toISOString().split('T')[0],
    ventaTotal: 0,
    transacciones: 0,
    costoLaboral: datosProyecto.operacion_staff.costo_diario_clp,
    otrosCostos: 0
  });

  const [analisis, setAnalisis] = useState<AnalisisResult | null>(null);

  const formatChileno = (num: number): string => {
    return Math.round(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const calcularAnalisis = () => {
    const metrosCuadrados = 25;
    const revPSM = ventaData.ventaTotal / metrosCuadrados;
    const laborCostPercent = ventaData.ventaTotal > 0 ? (ventaData.costoLaboral / ventaData.ventaTotal) * 100 : 0;
    const ticketPromedio = ventaData.transacciones > 0 ? ventaData.ventaTotal / ventaData.transacciones : 0;
    
    const costosOperacionales = ventaData.costoLaboral + ventaData.otrosCostos;
    const margenBruto = ventaData.ventaTotal - costosOperacionales;
    const margenNeto = ventaData.ventaTotal > 0 ? (margenBruto / ventaData.ventaTotal) * 100 : 0;
    
    const alertaCritica = margenNeto < 30;
    
    const resumenEjecutivo = `Local Irarrázaval (25m²): Venta diaria $${formatChileno(ventaData.ventaTotal)} CLP, RevPSM $${formatChileno(revPSM)}, Labor Cost ${laborCostPercent.toFixed(1)}%, Margen Neto ${margenNeto.toFixed(1)}%${alertaCritica ? ' - ALERTA CRÍTICA' : ''}.`;

    const resultado: AnalisisResult = {
      revPSM,
      laborCostPercent,
      ticketPromedio,
      margenBruto,
      margenNeto,
      alertaCritica,
      resumenEjecutivo
    };

    setAnalisis(resultado);
  };

  const exportarJSON = () => {
    const jsonData = {
      proyecto: datosProyecto.proyecto,
      vistaMensual: {
        kpis_principales: datosProyecto.kpis_principales,
        inversion_status: datosProyecto.inversion_status,
        operacion_staff: datosProyecto.operacion_staff
      },
      vistaDiaria: analisis ? {
        fecha: ventaData.fecha,
        local: {
          nombre: 'Irarrázaval',
          metrosCuadrados: 25
        },
        ventas: {
          total: ventaData.ventaTotal,
          totalFormateado: `$${formatChileno(ventaData.ventaTotal)} CLP`,
          transacciones: ventaData.transacciones,
          ticketPromedio: analisis.ticketPromedio,
          ticketPromedioFormateado: `$${formatChileno(analisis.ticketPromedio)} CLP`
        },
        costos: {
          laboral: ventaData.costoLaboral,
          laboralFormateado: `$${formatChileno(ventaData.costoLaboral)} CLP`,
          otros: ventaData.otrosCostos,
          otrosFormateados: `$${formatChileno(ventaData.otrosCostos)} CLP`,
          total: ventaData.costoLaboral + ventaData.otrosCostos,
          totalFormateado: `$${formatChileno(ventaData.costoLaboral + ventaData.otrosCostos)} CLP`
        },
        metricas: {
          revPSM: analisis.revPSM,
          revPSMFormateado: `$${formatChileno(analisis.revPSM)} CLP/m²`,
          laborCostPercent: analisis.laborCostPercent,
          laborCostPercentFormateado: `${analisis.laborCostPercent.toFixed(1)}%`,
          margenBruto: analisis.margenBruto,
          margenBrutoFormateado: `$${formatChileno(analisis.margenBruto)} CLP`,
          margenNeto: analisis.margenNeto,
          margenNetoFormateado: `${analisis.margenNeto.toFixed(1)}%`
        },
        alertas: {
          alertaCritica: analisis.alertaCritica,
          mensaje: analisis.alertaCritica ? 'MARGEN NETO BAJO 30% - ACCIÓN REQUERIDA' : 'Operación dentro de parámetros normales'
        },
        resumenEjecutivo: analisis.resumenEjecutivo
      } : null,
      timestamp: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analisis-cfo-ratio-irarrazaval-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const chartData = analisis ? [
    {
      name: 'Venta Total',
      valor: ventaData.ventaTotal,
      fill: '#10b981'
    },
    {
      name: 'Costo Laboral',
      valor: ventaData.costoLaboral,
      fill: '#f59e0b'
    },
    {
      name: 'Otros Costos',
      valor: ventaData.otrosCostos,
      fill: '#ef4444'
    },
    {
      name: 'Margen Bruto',
      valor: analisis.margenBruto,
      fill: '#3b82f6'
    }
  ] : [];

  const pieData = analisis ? [
    { name: 'Margen Bruto', value: analisis.margenBruto, fill: '#10b981' },
    { name: 'Costo Laboral', value: ventaData.costoLaboral, fill: '#f59e0b' },
    { name: 'Otros Costos', value: ventaData.otrosCostos, fill: '#ef4444' }
  ] : [];

  // Datos mensuales para gráficos
  const mensualChartData = [
    { name: 'Venta Mensual', valor: datosProyecto.kpis_principales.venta_mensual_clp, fill: '#10b981' },
    { name: 'Utilidad Neta', valor: datosProyecto.kpis_principales.utilidad_neta_clp, fill: '#3b82f6' },
    { name: 'Costos Totales', valor: datosProyecto.kpis_principales.venta_mensual_clp - datosProyecto.kpis_principales.utilidad_neta_clp, fill: '#f59e0b' }
  ];

  const paybackData = [
    { mes: 'Mes 0', recuperado: 0, objetivo: datosProyecto.inversion_status.capex_total_clp },
    { mes: 'Mes 1', recuperado: datosProyecto.kpis_principales.utilidad_neta_clp * 1, objetivo: datosProyecto.inversion_status.capex_total_clp },
    { mes: 'Mes 2', recuperado: datosProyecto.kpis_principales.utilidad_neta_clp * 2, objetivo: datosProyecto.inversion_status.capex_total_clp },
    { mes: 'Mes 3', recuperado: datosProyecto.kpis_principales.utilidad_neta_clp * 3, objetivo: datosProyecto.inversion_status.capex_total_clp },
    { mes: 'Mes 4', recuperado: datosProyecto.kpis_principales.utilidad_neta_clp * 4, objetivo: datosProyecto.inversion_status.capex_total_clp },
    { mes: 'Mes 5', recuperado: datosProyecto.kpis_principales.utilidad_neta_clp * 5, objetivo: datosProyecto.inversion_status.capex_total_clp },
    { mes: 'Mes 6', recuperado: datosProyecto.kpis_principales.utilidad_neta_clp * 6, objetivo: datosProyecto.inversion_status.capex_total_clp },
    { mes: 'Mes 7.2', recuperado: datosProyecto.inversion_status.capex_total_clp, objetivo: datosProyecto.inversion_status.capex_total_clp }
  ];

  const porcentajeRecuperacion = (datosProyecto.inversion_status.recuperado_acumulado_clp / datosProyecto.inversion_status.capex_total_clp) * 100;

  const alertaCriticaMensual = datosProyecto.kpis_principales.margen_neta_percent < 30;

  return (
    <div className="min-h-screen bg-gray-50 p-3 md:p-6">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Header Compacto */}
        <header className="text-center space-y-1">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">CFO Dashboard - {datosProyecto.proyecto}</h1>
          <p className="text-sm md:text-base text-gray-600">Local Irarrázaval • 25 m²</p>
          <div className="flex justify-center gap-2 flex-wrap" role="list" aria-label="Métricas principales">
            <Badge variant="outline" className="text-xs font-semibold" role="listitem">
              CAPEX: ${formatChileno(datosProyecto.inversion_status.capex_total_clp)}
            </Badge>
            <Badge variant="outline" className="text-xs font-semibold" role="listitem">
              Payback: {datosProyecto.inversion_status.meses_restantes_payback} meses
            </Badge>
          </div>
        </header>

        {/* Tabs Optimizados */}
        <Tabs defaultValue="historial" className="space-y-4">
          <TabsList className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-13 gap-1 bg-white p-1 h-auto border border-gray-200" role="tablist" aria-label="Navegación principal del dashboard">
            <TabsTrigger 
              value="historial" 
              className="text-xs sm:text-sm py-2 px-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white hover:bg-blue-50 transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              role="tab"
              aria-label="Vista principal de control e ingreso de datos"
            >
              <BarChart3 className="mr-0 sm:mr-1 h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Home</span>
              {registros.length > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-[10px]">
                  {registros.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger 
              value="informe" 
              className="text-xs sm:text-sm py-2 px-2 data-[state=active]:bg-red-600 data-[state=active]:text-white hover:bg-red-50 transition-colors focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              role="tab"
              aria-label="Informe ejecutivo - Auditoría operativa"
            >
              <ShieldAlert className="mr-0 sm:mr-1 h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Informe</span>
              <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-[10px] bg-red-100">
                SOP
              </Badge>
            </TabsTrigger>
            <TabsTrigger 
              value="auditoria" 
              className="text-xs sm:text-sm py-2 px-2 data-[state=active]:bg-indigo-600 data-[state=active]:text-white hover:bg-indigo-50 transition-colors focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              role="tab"
              aria-label="Auditoría operativa con imagen + datos"
            >
              <Camera className="mr-0 sm:mr-1 h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Auditoría</span>
              <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-[10px] bg-indigo-100">
                IA
              </Badge>
            </TabsTrigger>
            <TabsTrigger 
              value="reportes" 
              className="text-xs sm:text-sm py-2 px-2 data-[state=active]:bg-cyan-600 data-[state=active]:text-white hover:bg-cyan-50 transition-colors focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2"
              role="tab"
              aria-label="Reportes ejecutivos"
            >
              <FileText className="mr-0 sm:mr-1 h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Reportes</span>
            </TabsTrigger>
            <TabsTrigger 
              value="metas" 
              className="text-xs sm:text-sm py-2 px-2 data-[state=active]:bg-green-600 data-[state=active]:text-white hover:bg-green-50 transition-colors focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              role="tab"
              aria-label="Metas por rol"
            >
              <Target className="mr-0 sm:mr-1 h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Metas</span>
            </TabsTrigger>
            <TabsTrigger 
              value="figma" 
              className="text-xs sm:text-sm py-2 px-2 data-[state=active]:bg-purple-600 data-[state=active]:text-white hover:bg-purple-50 transition-colors focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
              role="tab"
              aria-label="Sincronización con Figma"
            >
              <svg className="mr-0 sm:mr-1 h-4 w-4" aria-hidden="true" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 12a4 4 0 1 1 8 0 4 4 0 0 1-8 0z"/>
                <path d="M4 20a4 4 0 0 1 4-4h4v4a4 4 0 1 1-8 0z"/>
                <path d="M4 12a4 4 0 0 1 4-4h4v8H8a4 4 0 0 1-4-4z"/>
                <path d="M4 4a4 4 0 0 1 4-4h4v8H8a4 4 0 0 1-4-4z"/>
                <path d="M12 0h4a4 4 0 1 1 0 8h-4V0z"/>
              </svg>
              <span className="hidden sm:inline">Figma</span>
              {registros.length > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-[10px] bg-purple-100">
                  ✓
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger 
              value="mensual" 
              className="text-xs sm:text-sm py-2 px-2 data-[state=active]:bg-teal-600 data-[state=active]:text-white hover:bg-teal-50 transition-colors focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
              role="tab"
              aria-label="Vista de análisis mensual"
            >
              <Calendar className="mr-0 sm:mr-1 h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Mensual</span>
            </TabsTrigger>
            <TabsTrigger 
              value="diaria" 
              className="text-xs sm:text-sm py-2 px-2 data-[state=active]:bg-orange-600 data-[state=active]:text-white hover:bg-orange-50 transition-colors focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
              role="tab"
              aria-label="Vista de análisis diario"
            >
              <TrendingUp className="mr-0 sm:mr-1 h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Diario</span>
            </TabsTrigger>
            <TabsTrigger 
              value="genio" 
              className="text-xs sm:text-sm py-2 px-2 data-[state=active]:bg-pink-600 data-[state=active]:text-white hover:bg-pink-50 transition-colors focus:ring-2 focus:ring-pink-500 focus:ring-offset-2"
              role="tab"
              aria-label="Sistema Genio y Figura"
            >
              <Sparkles className="mr-0 sm:mr-1 h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">G&F</span>
            </TabsTrigger>
            <TabsTrigger 
              value="tutorial-make" 
              className="text-xs sm:text-sm py-2 px-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-600 data-[state=active]:to-purple-600 data-[state=active]:text-white hover:bg-cyan-50 transition-colors focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2"
              role="tab"
              aria-label="Tutorial Make.com + Google Sheets + OpenAI"
            >
              <Zap className="mr-0 sm:mr-1 h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Tutorial Make</span>
              <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-[10px] bg-gradient-to-r from-cyan-100 to-purple-100">
                AI
              </Badge>
            </TabsTrigger>
            <TabsTrigger 
              value="heuristica-ux" 
              className="text-xs sm:text-sm py-2 px-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:to-purple-600 data-[state=active]:text-white hover:bg-indigo-50 transition-colors focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              role="tab"
              aria-label="Auditoría Heurística UX/UI"
            >
              <Eye className="mr-0 sm:mr-1 h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">UX Audit</span>
              <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-[10px] bg-gradient-to-r from-indigo-100 to-purple-100">
                NEW
              </Badge>
            </TabsTrigger>
            <TabsTrigger 
              value="arquitectura-ia" 
              className="text-xs sm:text-sm py-2 px-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-600 data-[state=active]:to-cyan-600 data-[state=active]:text-white hover:bg-teal-50 transition-colors focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
              role="tab"
              aria-label="Arquitectura de Información"
            >
              <Layers className="mr-0 sm:mr-1 h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">IA</span>
              <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-[10px] bg-gradient-to-r from-teal-100 to-cyan-100">
                🔥
              </Badge>
            </TabsTrigger>
            <TabsTrigger 
              value="integracion-b2c" 
              className="text-xs sm:text-sm py-2 px-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-cyan-600 data-[state=active]:text-white hover:bg-blue-50 transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              role="tab"
              aria-label="Integración B2C Ecommerce"
            >
              <Globe className="mr-0 sm:mr-1 h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">B2C</span>
              <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-[10px] bg-gradient-to-r from-blue-100 to-cyan-100">
                💰
              </Badge>
            </TabsTrigger>
          </TabsList>

          {/* HOME: CONTROL MAESTRO - Hub Central Optimizado */}
          <TabsContent value="historial" className="space-y-6">
            {/* Hero Status Card */}
            <Card className="border-2 border-blue-500 bg-gradient-to-br from-blue-50 via-white to-blue-50 shadow-lg">
              <CardHeader>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <CardTitle className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2">
                      <BarChart3 className="h-8 w-8 text-blue-600" />
                      Hub de Control Central
                    </CardTitle>
                    <CardDescription className="text-sm sm:text-base">
                      Punto de entrada y gestión principal de tu negocio
                    </CardDescription>
                  </div>
                  {registros.length > 0 && metricas && metricas.total_venta > 0 && (() => {
                    const margenPercent = (metricas.total_utilidad_neta / metricas.total_venta) * 100;
                    const estadoLabel = margenPercent >= 35 ? 'Excelente' : margenPercent >= 30 ? 'Normal' : 'Crítico';
                    return (
                    <div className="flex flex-col items-end gap-1">
                      <Badge 
                        aria-label={`Estado operativo: ${estadoLabel}`}
                        className={`text-lg px-4 py-2 ${
                          margenPercent >= 35 
                            ? 'bg-green-500 hover:bg-green-600' 
                            : margenPercent >= 30
                            ? 'bg-yellow-500 hover:bg-yellow-600'
                            : 'bg-red-500 hover:bg-red-600'
                        }`}
                      >
                        {margenPercent >= 35 
                          ? '🚀 Excelente' 
                          : margenPercent >= 30
                          ? '⚠️ Normal'
                          : '🔴 Crítico'
                        }
                      </Badge>
                      <p className="text-xs text-gray-600">
                        Estado Operativo
                      </p>
                    </div>
                    );
                  })()}
                </div>
              </CardHeader>
              <CardContent>
                {registros.length === 0 ? (
                  <Alert className="border-orange-500 bg-orange-50">
                    <Sparkles className="h-4 w-4 text-orange-600" />
                    <AlertTitle className="text-base font-bold">¡Comienza tu análisis financiero!</AlertTitle>
                    <AlertDescription className="text-sm space-y-2">
                      <p>
                        Este dashboard se alimenta de tus datos mensuales. Para comenzar:
                      </p>
                      <ol className="list-decimal list-inside space-y-1 text-xs">
                        <li>Desplázate abajo para ingresar tu primer mes de datos</li>
                        <li>Completa ventas por línea de negocio (Café, Hotdesk, Asesorías)</li>
                        <li>Ingresa costos operacionales del mes</li>
                        <li>Guarda y observa cómo se actualizan todos los análisis automáticamente</li>
                      </ol>
                    </AlertDescription>
                  </Alert>
                ) : metricas && metricas.total_venta > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Indicador de Salud Financiera */}
                    <div className="col-span-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg p-4 text-white">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="flex-1">
                          <p className="text-xs font-medium opacity-90">Salud Financiera Global</p>
                          <p className="text-3xl font-bold mt-1">
                            {((metricas.total_utilidad_neta / metricas.total_venta) * 100).toFixed(1)}%
                          </p>
                          <p className="text-xs mt-1 opacity-75">
                            Margen Neto Promedio • {registros.length} {registros.length === 1 ? 'mes' : 'meses'} registrado{registros.length === 1 ? '' : 's'}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-4xl mb-2">
                            {((metricas.total_utilidad_neta / metricas.total_venta) * 100) >= 35 
                              ? '🎯' 
                              : ((metricas.total_utilidad_neta / metricas.total_venta) * 100) >= 30
                              ? '📊'
                              : '⚠️'
                            }
                          </div>
                          <Progress 
                            value={Math.min(((metricas.total_utilidad_neta / metricas.total_venta) * 100) / 35 * 100, 100)} 
                            className="h-2 w-24 bg-white/30"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Quick Stats */}
                    <Card className="border-green-200 bg-gradient-to-br from-green-50 to-white">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-xs text-gray-600 flex items-center gap-1">
                          <Wallet className="h-3 w-3" />
                          Utilidad Acumulada
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-xl font-bold text-green-600">
                          ${formatChileno(metricas.total_utilidad_neta)}
                        </div>
                        <p className="text-[10px] text-gray-600">
                          Promedio: ${formatChileno(Math.round(metricas.total_utilidad_neta / registros.length))}/mes
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-xs text-gray-600 flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          Ventas Totales
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-xl font-bold text-blue-600">
                          ${formatChileno(metricas.total_venta)}
                        </div>
                        <p className="text-[10px] text-gray-600">
                          Promedio: ${formatChileno(Math.round(metricas.total_venta / registros.length))}/mes
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-white">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-xs text-gray-600 flex items-center gap-1">
                          <Target className="h-3 w-3" />
                          ROI Promedio
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-xl font-bold text-purple-600">
                          {(metricas.roi_promedio * 100).toFixed(2)}%
                        </div>
                        <p className="text-[10px] text-gray-600">
                          CAPEX: ${formatChileno(datosProyecto.inversion_status.capex_total_clp)}
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="border-indigo-200 bg-gradient-to-br from-indigo-50 to-white">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-xs text-gray-600 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Recuperación
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-xl font-bold text-indigo-600">
                          {((metricas.total_utilidad_neta / datosProyecto.inversion_status.capex_total_clp) * 100).toFixed(1)}%
                        </div>
                        <p className="text-[10px] text-gray-600">
                          ${formatChileno(metricas.total_utilidad_neta)} recuperados
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <Alert className="border-yellow-500 bg-yellow-50">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <AlertTitle className="text-base font-bold">Datos incompletos</AlertTitle>
                    <AlertDescription className="text-sm">
                      Hay registros pero faltan datos de ventas. Por favor, verifica la información ingresada.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions - Accesos Rápidos */}
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-yellow-500" />
                  Acciones Rápidas
                </CardTitle>
                <CardDescription className="text-xs">
                  Accede a las funciones más importantes del sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                  <Button 
                    variant="outline" 
                    className="h-auto flex-col gap-2 py-4 hover:bg-blue-50 hover:border-blue-400 hover:shadow-lg hover:scale-105 transition-all duration-200 cursor-pointer"
                    onClick={() => {
                      const tabsList = document.querySelector('[role="tablist"]');
                      const metasTab = tabsList?.querySelector('[value="metas"]') as HTMLButtonElement;
                      if (metasTab) metasTab.click();
                    }}
                    aria-label="Navegar a Metas por Rol - KPIs específicos por rol"
                  >
                    <Target className="h-6 w-6 text-blue-600 group-hover:scale-110 transition-transform" aria-hidden="true" />
                    <div className="text-center">
                      <p className="text-xs font-semibold">Metas por Rol</p>
                      <p className="text-[10px] text-gray-500">KPIs específicos</p>
                    </div>
                  </Button>

                  <Button 
                    variant="outline" 
                    className="h-auto flex-col gap-2 py-4 hover:bg-red-50 hover:border-red-400 hover:shadow-lg hover:scale-105 transition-all duration-200 cursor-pointer"
                    onClick={() => {
                      const tabsList = document.querySelector('[role="tablist"]');
                      const informeTab = tabsList?.querySelector('[value="informe"]') as HTMLButtonElement;
                      if (informeTab) informeTab.click();
                    }}
                    aria-label="Navegar a Informe SOP - Auditoría ejecutiva"
                  >
                    <ShieldAlert className="h-6 w-6 text-red-600 group-hover:scale-110 transition-transform" aria-hidden="true" />
                    <div className="text-center">
                      <p className="text-xs font-semibold">Informe SOP</p>
                      <p className="text-[10px] text-gray-500">Auditoría ejecutiva</p>
                    </div>
                  </Button>

                  <Button 
                    variant="outline" 
                    className="h-auto flex-col gap-2 py-4 hover:bg-cyan-50 hover:border-cyan-400 hover:shadow-lg hover:scale-105 transition-all duration-200 cursor-pointer"
                    onClick={() => {
                      const tabsList = document.querySelector('[role="tablist"]');
                      const reportesTab = tabsList?.querySelector('[value="reportes"]') as HTMLButtonElement;
                      if (reportesTab) reportesTab.click();
                    }}
                    aria-label="Navegar a Reportes - Exportar datos"
                  >
                    <FileText className="h-6 w-6 text-cyan-600 group-hover:scale-110 transition-transform" aria-hidden="true" />
                    <div className="text-center">
                      <p className="text-xs font-semibold">Reportes</p>
                      <p className="text-[10px] text-gray-500">Exportar datos</p>
                    </div>
                  </Button>

                  <Button 
                    variant="outline" 
                    className="h-auto flex-col gap-2 py-4 hover:bg-pink-50 hover:border-pink-400 hover:shadow-lg hover:scale-105 transition-all duration-200 cursor-pointer"
                    onClick={() => {
                      const tabsList = document.querySelector('[role="tablist"]');
                      const genioTab = tabsList?.querySelector('[value="genio"]') as HTMLButtonElement;
                      if (genioTab) genioTab.click();
                    }}
                    aria-label="Navegar a Genio y Figura - Sistema de clasificación"
                  >
                    <Sparkles className="h-6 w-6 text-pink-600 group-hover:scale-110 transition-transform" aria-hidden="true" />
                    <div className="text-center">
                      <p className="text-xs font-semibold">Genio y Figura</p>
                      <p className="text-[10px] text-gray-500">Clasificación</p>
                    </div>
                  </Button>

                  <Button 
                    variant="outline" 
                    className="h-auto flex-col gap-2 py-4 hover:bg-gradient-to-br hover:from-cyan-50 hover:to-purple-50 hover:border-cyan-400 hover:shadow-lg hover:scale-105 transition-all duration-200 relative overflow-hidden group cursor-pointer"
                    onClick={() => {
                      const tabsList = document.querySelector('[role="tablist"]');
                      const tutorialTab = tabsList?.querySelector('[value="tutorial-make"]') as HTMLButtonElement;
                      if (tutorialTab) tutorialTab.click();
                    }}
                    aria-label="Navegar a Tutorial Make.com + Google Sheets + OpenAI"
                  >
                    <div className="absolute top-0 right-0 bg-gradient-to-br from-cyan-500 to-purple-500 text-white text-[8px] px-1.5 py-0.5 rounded-bl font-bold">
                      NUEVO
                    </div>
                    <Zap className="h-6 w-6 text-purple-600 group-hover:text-cyan-600 transition-colors" aria-hidden="true" />
                    <div className="text-center">
                      <p className="text-xs font-semibold">Tutorial Make</p>
                      <p className="text-[10px] text-gray-500">Auto-llenado AI</p>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* KPIs por Línea de Negocio */}
            {registros.length > 0 && metricas && metricas.total_venta > 0 && (() => {
              // Calcular línea dominante dinámicamente
              const lineas = [
                { nombre: 'Cafetería', valor: metricas.total_venta_cafe, color: 'orange', margen: '68%' },
                { nombre: 'Hotdesk', valor: metricas.total_venta_hotdesk, color: 'blue', margen: '92.5%' },
                { nombre: 'Asesorías', valor: metricas.total_venta_asesoria, color: 'purple', margen: '100%' }
              ];
              const lineaDominante = lineas.reduce((max, linea) => 
                linea.valor > max.valor ? linea : max
              );
              
              return (
                <Card className="border-orange-200">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-orange-600" />
                      Desempeño por Línea de Negocio
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Análisis separado por margen y contribución (Café 68%, Hotdesk 92.5%, Asesorías 100%)
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {/* Cafetería */}
                      <Card className="bg-gradient-to-br from-orange-50 to-white border-orange-200">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm flex items-center gap-2 flex-wrap">
                            <Coffee className="h-4 w-4 text-orange-600" />
                            <span>Cafetería</span>
                            <Badge variant="outline" className="text-[10px] bg-orange-100">68% margen</Badge>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div>
                            <p className="text-xs text-gray-600">Ventas Totales</p>
                            <p className="text-xl font-bold text-orange-600 break-words">
                              ${formatChileno(metricas.total_venta_cafe)}
                            </p>
                          </div>
                          <div className="flex justify-between items-center gap-2">
                            <p className="text-xs text-gray-600">Contribución</p>
                            <Badge variant="secondary" className="text-xs shrink-0">
                              {((metricas.total_venta_cafe / metricas.total_venta) * 100).toFixed(1)}%
                            </Badge>
                          </div>
                          <Progress 
                            value={(metricas.total_venta_cafe / metricas.total_venta) * 100} 
                            className="h-2"
                          />
                        </CardContent>
                      </Card>

                      {/* Hotdesk */}
                      <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-200">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm flex items-center gap-2 flex-wrap">
                            <Laptop className="h-4 w-4 text-blue-600" />
                            <span>Hotdesk</span>
                            <Badge variant="outline" className="text-[10px] bg-blue-100">92.5% margen</Badge>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div>
                            <p className="text-xs text-gray-600">Ventas Totales</p>
                            <p className="text-xl font-bold text-blue-600 break-words">
                              ${formatChileno(metricas.total_venta_hotdesk)}
                            </p>
                          </div>
                          <div className="flex justify-between items-center gap-2">
                            <p className="text-xs text-gray-600">Contribución</p>
                            <Badge variant="secondary" className="text-xs shrink-0">
                              {((metricas.total_venta_hotdesk / metricas.total_venta) * 100).toFixed(1)}%
                            </Badge>
                          </div>
                          <Progress 
                            value={(metricas.total_venta_hotdesk / metricas.total_venta) * 100} 
                            className="h-2"
                          />
                        </CardContent>
                      </Card>

                      {/* Asesorías */}
                      <Card className="bg-gradient-to-br from-purple-50 to-white border-purple-200">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm flex items-center gap-2 flex-wrap">
                            <Briefcase className="h-4 w-4 text-purple-600" />
                            <span>Asesorías</span>
                            <Badge variant="outline" className="text-[10px] bg-purple-100">100% margen</Badge>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div>
                            <p className="text-xs text-gray-600">Ventas Totales</p>
                            <p className="text-xl font-bold text-purple-600 break-words">
                              ${formatChileno(metricas.total_venta_asesoria)}
                            </p>
                          </div>
                          <div className="flex justify-between items-center gap-2">
                            <p className="text-xs text-gray-600">Contribución</p>
                            <Badge variant="secondary" className="text-xs shrink-0">
                              {((metricas.total_venta_asesoria / metricas.total_venta) * 100).toFixed(1)}%
                            </Badge>
                          </div>
                          <Progress 
                            value={(metricas.total_venta_asesoria / metricas.total_venta) * 100} 
                            className="h-2"
                          />
                        </CardContent>
                      </Card>
                    </div>

                    {/* Análisis de Línea Dominante - Dinámico */}
                    <Alert className="mt-4 border-orange-500 bg-orange-50">
                      {lineaDominante.nombre === 'Cafetería' ? (
                        <Coffee className="h-4 w-4 text-orange-600" />
                      ) : lineaDominante.nombre === 'Hotdesk' ? (
                        <Laptop className="h-4 w-4 text-blue-600" />
                      ) : (
                        <Briefcase className="h-4 w-4 text-purple-600" />
                      )}
                      <AlertTitle className="text-sm font-bold flex items-center gap-2">
                        💡 Insight: Línea Dominante
                      </AlertTitle>
                      <AlertDescription className="text-xs space-y-1">
                        <p>
                          <strong>{lineaDominante.nombre}</strong> es tu línea principal con <strong>{((lineaDominante.valor / metricas.total_venta) * 100).toFixed(0)}%</strong> de las ventas totales (Margen: {lineaDominante.margen}).
                        </p>
                        <p className="text-[10px] text-gray-600">
                          💡 Estrategia: {lineaDominante.nombre === 'Cafetería' 
                            ? 'Optimizar rotación de mesas, aumentar ticket promedio con upselling, y mejorar experiencia del cliente.' 
                            : lineaDominante.nombre === 'Hotdesk'
                            ? 'Maximizar ocupación, crear planes de membresía recurrente, y mejorar amenidades del espacio.'
                            : 'Escalar servicios de consultoría, crear paquetes premium, y desarrollar relaciones de largo plazo con clientes.'}
                        </p>
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>
              );
            })()}

            {/* NUEVO: Tutorial Make.com + Google Sheets + OpenAI */}
            <Card className="border-2 border-gradient-to-r from-cyan-500 to-purple-500 bg-gradient-to-r from-cyan-50 via-purple-50 to-pink-50 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-gradient-to-br from-cyan-500 to-purple-500 text-white text-xs px-3 py-1 rounded-bl-lg font-bold flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                NUEVO
              </div>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Zap className="h-6 w-6 text-purple-600" />
                  🚀 Automatización Total: Make.com + Google Sheets + OpenAI
                </CardTitle>
                <CardDescription className="text-sm">
                  <strong>Implementa el flujo completo que salva tu inversión de $37.697.000</strong>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Alert className="border-cyan-500 bg-white">
                  <Sparkles className="h-4 w-4 text-cyan-600" />
                  <AlertTitle className="text-sm font-bold">💡 ¿Por qué necesitas esto?</AlertTitle>
                  <AlertDescription className="text-xs space-y-2 mt-2">
                    <p>
                      Al automatizar las <strong>21 columnas (A-U)</strong> en Google Sheets con fórmulas inteligentes y análisis de OpenAI:
                    </p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li><strong>Día Malo</strong>: Si Café = $0 (máquina rota), la columna U mostrará automáticamente "🔴 REVISAR COSTOS"</li>
                      <li><strong>Mes Genio</strong>: Cuando Asesorías marque $8M, el ROI saltará a 59% y verás "Payback en 1 mes"</li>
                      <li><strong>Alertas Inteligentes</strong>: OpenAI detecta costo laboral alto (29% vs 22% ideal) y sugiere optimizar turnos</li>
                      <li><strong>Gráficos Automáticos</strong>: Tu dashboard de Figma Make se actualiza solo con cada envío</li>
                    </ul>
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-white p-3 rounded-lg border border-cyan-200">
                    <p className="text-xs font-bold text-cyan-900 mb-1">✅ Lo que aprenderás:</p>
                    <ul className="text-[10px] space-y-0.5 text-gray-600">
                      <li>• Configurar las 21 columnas en Google Sheets</li>
                      <li>• Conectar webhook de Make.com</li>
                      <li>• Integrar OpenAI para análisis automático</li>
                      <li>• Mapear fórmulas (no datos crudos)</li>
                      <li>• Ver 3 casos reales (Día Malo, Genio, Alertas)</li>
                    </ul>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-3 rounded-lg border border-purple-200">
                    <p className="text-xs font-bold text-purple-900 mb-1">🎯 Resultado Final:</p>
                    <ul className="text-[10px] space-y-0.5 text-gray-600">
                      <li>• <strong>Payback automático</strong> del Derecho de Llaves ($18.9M)</li>
                      <li>• <strong>Sistema Genio y Figura</strong> basado en utilidad real</li>
                      <li>• <strong>14 métricas calculadas</strong> sin tocar Excel</li>
                      <li>• <strong>Detección de crisis</strong> en tiempo real</li>
                      <li>• <strong>Dashboard que se actualiza solo</strong> 🚀</li>
                    </ul>
                  </div>
                </div>

                <Button 
                  onClick={() => {
                    const tabsList = document.querySelector('[role="tablist"]');
                    const tutorialTab = tabsList?.querySelector('[value="tutorial-make"]') as HTMLButtonElement;
                    if (tutorialTab) tutorialTab.click();
                  }}
                  className="w-full bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700 text-white font-bold py-6 text-base"
                >
                  <Zap className="mr-2 h-5 w-5" />
                  Abrir Tutorial Completo (5 Pasos)
                  <Sparkles className="ml-2 h-5 w-5" />
                </Button>
              </CardContent>
            </Card>

            {/* Sistema de Alertas y Webhooks */}
            <Card className="border-purple-200">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Webhook className="h-5 w-5 text-purple-600" />
                  Automatizaciones y Alertas
                </CardTitle>
                <CardDescription className="text-xs">
                  Configura webhooks a Make.com y recibe alertas automáticas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <WebhooksMake />
                  <AlertasAutomaticas />
                </div>
              </CardContent>
            </Card>

            {/* Historial de Datos */}
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-gray-600" />
                  Gestión de Datos Mensuales
                </CardTitle>
                <CardDescription className="text-xs">
                  Ingresa y administra tus datos mensuales. Todos los dashboards se actualizan automáticamente.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <HistorialDiarioMejor />
              </CardContent>
            </Card>
          </TabsContent>

          {/* INFORME EJECUTIVO */}
          <TabsContent value="informe" className="space-y-6">
            <InformeEjecutivo />
          </TabsContent>

          {/* AUDITORÍA OPERATIVA */}
          <TabsContent value="auditoria" className="space-y-6">
            <AuditoriaOperativa />
          </TabsContent>

          {/* REPORTES EJECUTIVOS */}
          <TabsContent value="reportes" className="space-y-6">
            <ReportesEjecutivos />
          </TabsContent>

          {/* METAS POR ROL */}
          <TabsContent value="metas" className="space-y-6">
            <MetasPorRol />
          </TabsContent>

          {/* SINCRONIZACIÓN CON FIGMA */}
          <TabsContent value="figma" className="space-y-6">
            <SincronizacionFigma />
          </TabsContent>

          {/* VISTA MENSUAL */}
          <TabsContent value="mensual" className="space-y-6">
            {/* KPIs Mensuales */}
            {registros.length > 0 && metricas ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Venta Mensual Promedio</CardTitle>
                      <DollarSign className="h-4 w-4 text-gray-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">${formatChileno(metricas.total_venta / registros.length)}</div>
                      <p className="text-xs text-gray-600">CLP/mes promedio</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Utilidad Neta Promedio</CardTitle>
                      <Wallet className="h-4 w-4 text-gray-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">${formatChileno(metricas.total_utilidad_neta / registros.length)}</div>
                      <p className="text-xs text-gray-600">CLP/mes promedio</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Margen Neto Promedio</CardTitle>
                      <TrendingUp className="h-4 w-4 text-gray-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        <Badge variant={(metricas.total_utilidad_neta / metricas.total_venta * 100) < 30 ? 'destructive' : 'default'}>
                          {((metricas.total_utilidad_neta / metricas.total_venta) * 100).toFixed(1)}%
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600">Promedio general</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">RevPSM Promedio</CardTitle>
                      <Square className="h-4 w-4 text-gray-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">${formatChileno(metricas.revpsm_promedio)}</div>
                      <p className="text-xs text-gray-600">CLP/m²/mes</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Inversión y Payback */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Estado de Inversión</CardTitle>
                      <CardDescription>Recuperación de CAPEX</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>CAPEX Total</span>
                          <span className="font-bold">${formatChileno(datosProyecto.inversion_status.capex_total_clp)} CLP</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Recuperado (Total Utilidad Neta)</span>
                          <span className="font-bold text-green-600">${formatChileno(metricas.total_utilidad_neta)} CLP</span>
                        </div>
                        <Progress value={(metricas.total_utilidad_neta / datosProyecto.inversion_status.capex_total_clp) * 100} className="h-3" />
                        <div className="flex justify-between text-xs text-gray-600">
                          <span>{((metricas.total_utilidad_neta / datosProyecto.inversion_status.capex_total_clp) * 100).toFixed(1)}% recuperado</span>
                          <span>{metricas.paybackMeses ? `${metricas.paybackMeses.toFixed(1)} meses` : 'Calculando...'}</span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                        <div>
                          <p className="text-xs text-gray-600">Utilidad Mensual Promedio</p>
                          <p className="text-lg font-bold">${formatChileno(metricas.total_utilidad_neta / registros.length)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Meses Registrados</p>
                          <p className="text-lg font-bold">{registros.length}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Eficiencia Operacional</CardTitle>
                      <CardDescription>Costos y productividad</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <p className="text-xs text-gray-600">Gastos Operación Promedio</p>
                          <p className="text-xl font-bold">${formatChileno(metricas.total_gastos_operacion / registros.length)}</p>
                          <p className="text-xs text-gray-600">CLP/mes</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-gray-600">% Sobre Ventas</p>
                          <p className="text-xl font-bold">{((metricas.total_gastos_operacion / metricas.total_venta) * 100).toFixed(1)}%</p>
                          <p className="text-xs text-gray-600">Eficiencia laboral</p>
                        </div>
                      </div>

                      <div className="pt-4 border-t">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm">ROI Promedio</span>
                          <span className="text-lg font-bold">{(metricas.roi_promedio * 100).toFixed(2)}%</span>
                        </div>
                        <Progress value={metricas.roi_promedio * 100} className="h-3" />
                        <p className="text-xs text-gray-600 mt-2">
                          Retorno mensual sobre CAPEX total
                        </p>
                      </div>

                      <div className="pt-4 border-t">
                        <p className="text-xs text-gray-600">Venta por CLP en gastos de operación</p>
                        <p className="text-2xl font-bold">
                          ${formatChileno(metricas.total_venta / metricas.total_gastos_operacion)}
                        </p>
                        <p className="text-xs text-gray-600">CLP de venta por cada CLP gastado</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* JSON de datos reales */}
                <Card>
                  <CardHeader>
                    <CardTitle>Datos JSON - Vista Mensual</CardTitle>
                    <CardDescription>Formato exportable con datos reales del historial</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <pre className="p-4 bg-gray-900 text-green-400 rounded-lg overflow-x-auto text-xs">
{JSON.stringify({
  proyecto: "Ratio Irarrázaval",
  timestamp: new Date().toISOString(),
  periodo: {
    meses_registrados: registros.length,
    fecha_primer_registro: registros[registros.length - 1]?.date || 'N/A',
    fecha_ultimo_registro: registros[0]?.date || 'N/A'
  },
  kpis_principales: {
    venta_total_acumulada_clp: metricas.total_venta,
    venta_mensual_promedio_clp: Math.round(metricas.total_venta / registros.length),
    utilidad_neta_total_clp: metricas.total_utilidad_neta,
    utilidad_neta_promedio_clp: Math.round(metricas.total_utilidad_neta / registros.length),
    margen_neto_promedio_percent: parseFloat(((metricas.total_utilidad_neta / metricas.total_venta) * 100).toFixed(2)),
    rev_psm_promedio_clp: Math.round(metricas.revpsm_promedio),
    roi_promedio_percent: parseFloat((metricas.roi_promedio * 100).toFixed(2))
  },
  inversion_status: {
    capex_total_clp: datosProyecto.inversion_status.capex_total_clp,
    derecho_llaves_clp: 18900000,
    recuperado_acumulado_clp: metricas.total_utilidad_neta,
    porcentaje_recuperado: parseFloat(((metricas.total_utilidad_neta / datosProyecto.inversion_status.capex_total_clp) * 100).toFixed(2)),
    meses_para_payback: metricas.paybackMeses ? parseFloat(metricas.paybackMeses.toFixed(1)) : null
  },
  lineas_negocio: {
    cafe: {
      venta_total_clp: metricas.total_venta_cafe,
      margen_esperado_percent: 68,
      participacion_percent: parseFloat(((metricas.total_venta_cafe / metricas.total_venta) * 100).toFixed(1))
    },
    hotdesk: {
      venta_total_clp: metricas.total_venta_hotdesk,
      margen_esperado_percent: 92.5,
      participacion_percent: parseFloat(((metricas.total_venta_hotdesk / metricas.total_venta) * 100).toFixed(1))
    },
    asesorias: {
      venta_total_clp: metricas.total_venta_asesoria,
      margen_esperado_percent: 100,
      participacion_percent: parseFloat(((metricas.total_venta_asesoria / metricas.total_venta) * 100).toFixed(1))
    }
  },
  operacion: {
    gastos_operacion_total_clp: metricas.total_gastos_operacion,
    gastos_operacion_promedio_mensual_clp: Math.round(metricas.total_gastos_operacion / registros.length),
    eficiencia_laboral_percent: parseFloat(((metricas.total_gastos_operacion / metricas.total_venta) * 100).toFixed(1)),
    linea_dominante: metricas.lineaDominante
  },
  ultimos_6_meses: registros.slice(0, 6).map(r => ({
    fecha: r.date,
    venta_total: r.venta_total_clp,
    utilidad_neta: r.utilidad_neta_clp,
    margen_neto_percent: r.margen_neto_percent,
    roi_percent: (r.roi * 100).toFixed(2),
    status: r.status
  }))
}, null, 2)}
                    </pre>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card className="border-2 border-dashed border-gray-300">
                <CardContent className="pt-6 pb-6 text-center">
                  <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 font-semibold mb-2">
                    No hay datos mensuales para mostrar
                  </p>
                  <p className="text-sm text-gray-500">
                    Importa datos usando el importador Google Sheets en la tab "Home"
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* VISTA DIARIA */}
          <TabsContent value="diaria" className="space-y-6">
            {/* Input Form */}
            <Card>
              <CardHeader>
                <CardTitle>Datos de Venta Diaria</CardTitle>
                <CardDescription>Ingrese los datos del día para generar el análisis financiero</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fecha">Fecha</Label>
                    <Input
                      id="fecha"
                      type="date"
                      value={ventaData.fecha}
                      onChange={(e) => setVentaData({ ...ventaData, fecha: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ventaTotal">Venta Total (CLP)</Label>
                    <Input
                      id="ventaTotal"
                      type="number"
                      placeholder="0"
                      value={ventaData.ventaTotal || ''}
                      onChange={(e) => setVentaData({ ...ventaData, ventaTotal: Number(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="transacciones">N° Transacciones</Label>
                    <Input
                      id="transacciones"
                      type="number"
                      placeholder="0"
                      value={ventaData.transacciones || ''}
                      onChange={(e) => setVentaData({ ...ventaData, transacciones: Number(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="costoLaboral">Costo Laboral (CLP)</Label>
                    <Input
                      id="costoLaboral"
                      type="number"
                      placeholder="114833"
                      value={ventaData.costoLaboral || ''}
                      onChange={(e) => setVentaData({ ...ventaData, costoLaboral: Number(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="otrosCostos">Otros Costos (CLP)</Label>
                    <Input
                      id="otrosCostos"
                      type="number"
                      placeholder="0"
                      value={ventaData.otrosCostos || ''}
                      onChange={(e) => setVentaData({ ...ventaData, otrosCostos: Number(e.target.value) })}
                    />
                  </div>
                </div>
                <div className="flex gap-4 mt-6">
                  <Button onClick={calcularAnalisis} className="flex-1">
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Analizar Datos
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* KPI Cards Diarios */}
            {analisis && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">RevPSM Diario</CardTitle>
                      <Square className="h-4 w-4 text-gray-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">${formatChileno(analisis.revPSM)}</div>
                      <p className="text-xs text-gray-600">CLP por m²</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Labor Cost</CardTitle>
                      <Users className="h-4 w-4 text-gray-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{analisis.laborCostPercent.toFixed(1)}%</div>
                      <p className="text-xs text-gray-600">${formatChileno(ventaData.costoLaboral)} CLP</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Ticket Promedio</CardTitle>
                      <DollarSign className="h-4 w-4 text-gray-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">${formatChileno(analisis.ticketPromedio)}</div>
                      <p className="text-xs text-gray-600">{ventaData.transacciones} transacciones</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Margen Neto</CardTitle>
                      <TrendingUp className="h-4 w-4 text-gray-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        <Badge variant={analisis.alertaCritica ? 'destructive' : 'default'}>
                          {analisis.margenNeto.toFixed(1)}%
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600">${formatChileno(analisis.margenBruto)} CLP</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Charts Diarios */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Desglose Financiero Diario</CardTitle>
                      <CardDescription>Comparación de ventas, costos y margen</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" angle={-15} textAnchor="end" height={80} />
                          <YAxis tickFormatter={(value) => `$${formatChileno(value)}`} />
                          <Tooltip 
                            formatter={(value: number) => `$${formatChileno(value)} CLP`}
                            contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc' }}
                          />
                          <Bar dataKey="valor" fill="#3b82f6" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Distribución de Ingresos</CardTitle>
                      <CardDescription>Proporción de margen vs costos</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {pieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                          </Pie>
                          <Tooltip 
                            formatter={(value: number) => `$${formatChileno(value)} CLP`}
                            contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc' }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>

                {/* Resumen Ejecutivo */}
                <Card>
                  <CardHeader>
                    <CardTitle>Resumen Ejecutivo</CardTitle>
                    <CardDescription>Análisis consolidado en formato contable chileno</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="p-4 bg-gray-100 rounded-lg">
                      <p className="text-sm font-mono">{analisis.resumenEjecutivo}</p>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          {/* GENIO Y FIGURA */}
          <TabsContent value="genio" className="space-y-6">
            <GenioyFigura />
          </TabsContent>

          {/* TUTORIAL MAKE.COM + GOOGLE SHEETS + OPENAI */}
          <TabsContent value="tutorial-make" className="space-y-6">
            <TutorialMakeGoogleSheets />
          </TabsContent>

          {/* AUDITORÍA HEURÍSTICA UX/UI */}
          <TabsContent value="heuristica-ux" className="space-y-6">
            <AnalisisUXAnalisis />
          </TabsContent>

          {/* ARQUITECTURA DE INFORMACIÓN */}
          <TabsContent value="arquitectura-ia" className="space-y-6">
            <ArquitecturaInformacion />
          </TabsContent>

          {/* INTEGRACIÓN B2C ECOMMERCE */}
          <TabsContent value="integracion-b2c" className="space-y-6">
            <IntegracionB2C />
          </TabsContent>
        </Tabs>

        {/* Export Button */}
        <div className="flex justify-center">
          <Button onClick={exportarJSON} size="lg" className="min-w-[200px]">
            <Download className="mr-2 h-4 w-4" />
            Exportar JSON Completo
          </Button>
        </div>

        {/* Footer - Branding Pouch Growl Reportes */}
        <footer className="mt-12 pt-8 pb-6 border-t-2 border-gray-200">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                <Sparkles className="h-5 w-5 text-blue-600" />
                <p className="text-sm font-medium text-gray-700">
                  Un producto de{' '}
                  <a 
                    href="https://pouch-growl-74881457.figma.site/reportes" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="font-bold text-blue-600 hover:text-blue-700 hover:underline transition-all"
                  >
                    Pouch Growl Reportes
                  </a>
                </p>
              </div>
            </div>
            
            <div className="flex items-center justify-center gap-6 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <BarChart3 className="h-3 w-3" />
                <span>Análisis Financiero</span>
              </div>
              <span className="text-gray-300">•</span>
              <div className="flex items-center gap-1">
                <Target className="h-3 w-3" />
                <span>Sistema CFO Experto</span>
              </div>
              <span className="text-gray-300">•</span>
              <div className="flex items-center gap-1">
                <Coffee className="h-3 w-3" />
                <span>Retail de Café</span>
              </div>
            </div>

            <p className="text-xs text-gray-400">
              Dashboard profesional para análisis financiero retail • Irarrázaval 2100 (25 m²)
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}