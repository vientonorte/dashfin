import { useState, useMemo, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Skeleton } from './ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { BusinessLineCard } from './ui/BusinessLineCard';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Wallet, 
  Database, 
  FileText, 
  Settings, 
  Calendar, 
  AlertTriangle, 
  Target, 
  Coffee, 
  Laptop, 
  Briefcase, 
  Sparkles, 
  ChevronUp, 
  ChevronDown, 
  Webhook, 
  Zap, 
  Globe, 
  Eye,
  ArrowRight,
  CheckCircle2,
  Upload,
  Activity
} from 'lucide-react';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useDashboard } from '../contexts/DashboardContext';
import { TutorialMakeGoogleSheets } from './TutorialMakeGoogleSheets';
import { GuiaWebhookMake } from './GuiaWebhookMake';
import { IntegracionB2C } from './IntegracionB2C';
import { AnalisisUXAnalisis } from './AnalisisUXAnalisis';
import { AnalisisCFO } from './AnalisisCFO';
import { GenioyFigura } from './GenioyFigura';
import { MetasPorRol } from './MetasPorRol';
import { HistorialDiarioMejor } from './HistorialDiarioMejor';
import { InformeEjecutivo } from './InformeEjecutivo';
import { ReportesEjecutivos } from './ReportesEjecutivos';
import { WebhooksMake } from './WebhooksMake';
import { AlertasAutomaticas } from './AlertasAutomaticas';
import { GlosarioTooltip } from './GlosarioTooltip';

interface VentaData {
  fecha: string;
  ventaTotal: number;
  utilidadNeta: number;
  margenNeto: number;
}

export function CFODashboardConsolidado() {
  const { registros } = useDashboard();
  const [mesFiltro, setMesFiltro] = useState<string>('todos');
  const [rolFiltro, setRolFiltro] = useState<'cfo' | 'socio-gerente' | 'colaborador'>('cfo');
  const [loadingAnalisis, setLoadingAnalisis] = useState(false);
  
  // Estado de secciones colapsables
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mostrarDiario, setMostrarDiario] = useState(false);
  const [mostrarConfigAvanzada, setMostrarConfigAvanzada] = useState(false);
  const [mostrarMetasSecundarias, setMostrarMetasSecundarias] = useState(false);

  // Scroll detection for sticky bar smooth appearance
  const [isSticky, setIsSticky] = useState(false);
  const stickyBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 80);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // CÁLCULOS
  const formatChileno = (valor: number) => {
    return new Intl.NumberFormat('es-CL', { maximumFractionDigits: 0 }).format(valor);
  };

  // Bug #2 fix: wrap metrics in useMemo to avoid recalculation on every render
  const metricas = useMemo(() => {
    if (registros.length === 0) return null;
    const total_venta = registros.reduce((acc, r) => acc + r.cafe + r.hotdesk + r.asesorias, 0);
    const total_costos = registros.reduce((acc, r) => acc + r.costo_cafe + r.costo_hotdesk + r.costo_asesorias + r.costo_laboral + r.costo_fijo, 0);
    const cafe = registros.reduce((acc, r) => acc + r.cafe, 0);
    const hotdesk = registros.reduce((acc, r) => acc + r.hotdesk, 0);
    const asesorias = registros.reduce((acc, r) => acc + r.asesorias, 0);
    return {
      total_venta,
      total_costos,
      total_utilidad_neta: total_venta - total_costos,
      cafe,
      hotdesk,
      asesorias,
    };
  }, [registros]);

  const margenNeto = metricas ? (metricas.total_utilidad_neta / metricas.total_venta) * 100 : 0;
  const derechoLlaves = 18900000;
  const capexTotal = 37697000;
  const utilidadAcumulada = metricas?.total_utilidad_neta || 0;
  const paybackDerecho = utilidadAcumulada > 0 ? (derechoLlaves / utilidadAcumulada * registros.length).toFixed(1) : '∞';
  const paybackCapex = utilidadAcumulada > 0 ? (capexTotal / utilidadAcumulada * registros.length).toFixed(1) : '∞';
  const revPSM = metricas ? metricas.total_venta / 25 / registros.length : 0;

  // Estado de salud financiera
  const saludFinanciera = margenNeto >= 40 ? 'excelente' : margenNeto >= 30 ? 'buena' : margenNeto >= 20 ? 'regular' : 'crítica';
  const colorSalud = saludFinanciera === 'excelente' ? 'text-green-600 bg-green-50 border-green-200' :
                     saludFinanciera === 'buena' ? 'text-blue-600 bg-blue-50 border-blue-200' :
                     saludFinanciera === 'regular' ? 'text-yellow-600 bg-yellow-50 border-yellow-200' :
                     'text-red-600 bg-red-50 border-red-200';

  // Data para gráficos
  const chartData: VentaData[] = registros.map(r => ({
    fecha: r.fecha,
    ventaTotal: r.cafe + r.hotdesk + r.asesorias,
    utilidadNeta: (r.cafe + r.hotdesk + r.asesorias) - (r.costo_cafe + r.costo_hotdesk + r.costo_asesorias + r.costo_laboral + r.costo_fijo),
    margenNeto: ((r.cafe + r.hotdesk + r.asesorias) - (r.costo_cafe + r.costo_hotdesk + r.costo_asesorias + r.costo_laboral + r.costo_fijo)) / (r.cafe + r.hotdesk + r.asesorias) * 100
  }));

  const lineaData = metricas ? [
    { nombre: 'Cafetería', valor: metricas.cafe, margen: '68%', color: '#f97316' },
    { nombre: 'Hotdesk', valor: metricas.hotdesk, margen: '92.5%', color: '#3b82f6' },
    { nombre: 'Asesorías', valor: metricas.asesorias, margen: '100%', color: '#a855f7' },
  ] : [];

  const COLORS = ['#f97316', '#3b82f6', '#a855f7'];

  // Handler para cambio de tab con skeleton en análisis
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (value === 'analisis') {
      setLoadingAnalisis(true);
      setTimeout(() => setLoadingAnalisis(false), 400);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      <div className="max-w-[1600px] mx-auto p-4 sm:p-6 space-y-6">
        
        {/* HEADER CON BADGE DE CONSOLIDACIÓN */}
        <Card className="border-2 border-cyan-300 bg-gradient-to-r from-cyan-50 to-blue-50 shadow-xl">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 bg-gradient-to-br from-cyan-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <BarChart3 className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">CFO Dashboard - Irarrázaval 2100</h1>
                  <p className="text-sm text-gray-600">Retail de Café • 25 m² • 3 Líneas de Negocio</p>
                </div>
              </div>
              <Badge className={
                rolFiltro === 'cfo' ? 'bg-blue-600 text-white text-sm px-3 py-1.5' :
                rolFiltro === 'socio-gerente' ? 'bg-green-600 text-white text-sm px-3 py-1.5' :
                'bg-purple-600 text-white text-sm px-3 py-1.5'
              }>
                {rolFiltro === 'cfo' ? '👔 CFO' : rolFiltro === 'socio-gerente' ? '🤝 Socio-Gerente' : '👥 Colaborador'}
              </Badge>
            </div>
          </CardContent>
        </Card>


        {/* BARRA STICKY DE ROL */}
        <div
          ref={stickyBarRef}
          className={`sticky top-0 z-40 border border-gray-200 rounded-xl px-4 py-2 flex items-center justify-between
            transition-all duration-300 ease-in-out
            ${isSticky
              ? 'bg-white/95 backdrop-blur-md shadow-md scale-[1.002]'
              : 'bg-white/90 backdrop-blur-sm shadow-sm'
            }`}
        >
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Vista activa</span>
          <div className="flex gap-1.5">
            <Button
              size="sm"
              variant={rolFiltro === 'cfo' ? 'default' : 'outline'}
              onClick={() => setRolFiltro('cfo')}
              className={rolFiltro === 'cfo' ? 'bg-blue-600 hover:bg-blue-700 h-8 text-xs' : 'h-8 text-xs'}
            >
              👔 CFO
            </Button>
            <Button
              size="sm"
              variant={rolFiltro === 'socio-gerente' ? 'default' : 'outline'}
              onClick={() => setRolFiltro('socio-gerente')}
              className={rolFiltro === 'socio-gerente' ? 'bg-green-600 hover:bg-green-700 h-8 text-xs' : 'h-8 text-xs'}
            >
              🤝 Socio
            </Button>
            <Button
              size="sm"
              variant={rolFiltro === 'colaborador' ? 'default' : 'outline'}
              onClick={() => setRolFiltro('colaborador')}
              className={rolFiltro === 'colaborador' ? 'bg-purple-600 hover:bg-purple-700 h-8 text-xs' : 'h-8 text-xs'}
            >
              👥 Colaborador
            </Button>
          </div>
        </div>

        {/* TABS CONSOLIDADAS */}
        <Tabs value={activeTab} className="space-y-6" onValueChange={handleTabChange}>
          <TabsList className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-white p-2 h-auto border-2 border-gray-200 shadow-md">
            <TabsTrigger 
              value="dashboard" 
              className="text-sm py-3 px-4 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-cyan-600 data-[state=active]:text-white hover:bg-blue-50 transition-all font-semibold"
            >
              <BarChart3 className="mr-2 h-5 w-5" />
              Dashboard
              {registros.length > 0 && (
                <Badge variant="secondary" className="ml-2">{registros.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger 
              value="datos" 
              className="text-sm py-3 px-4 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-emerald-600 data-[state=active]:text-white hover:bg-green-50 transition-all font-semibold"
            >
              <Database className="mr-2 h-5 w-5" />
              Datos
            </TabsTrigger>
            <TabsTrigger 
              value="analisis" 
              className="text-sm py-3 px-4 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white hover:bg-purple-50 transition-all font-semibold"
            >
              <FileText className="mr-2 h-5 w-5" />
              Análisis
            </TabsTrigger>
            <TabsTrigger
              value="config"
              className="text-sm py-3 px-4 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-amber-500 data-[state=active]:text-white hover:bg-orange-50 transition-all font-semibold"
            >
              <Zap className="mr-2 h-5 w-5" />
              Automatización
            </TabsTrigger>
          </TabsList>

          {/* ============================================ */}
          {/* TAB 1: DASHBOARD EJECUTIVO                   */}
          {/* ============================================ */}
          <TabsContent value="dashboard" className="space-y-6">

            {/* KPIs PRINCIPALES */}
            {registros.length > 0 && metricas ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Salud Financiera */}
                  <Card className={`border-2 ${colorSalud}`}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Estado Financiero</CardTitle>
                      <TrendingUp className="h-5 w-5" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold capitalize">{saludFinanciera}</div>
                      <p className="text-xs mt-1">Margen Neto: {margenNeto.toFixed(1)}%</p>
                      <Progress value={margenNeto} className="mt-2 h-2" />
                    </CardContent>
                  </Card>

                  {/* Ventas Totales */}
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Ventas Totales</CardTitle>
                      <DollarSign className="h-5 w-5 text-green-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">${formatChileno(metricas.total_venta)}</div>
                      <p className="text-xs text-gray-600">Acumulado de {registros.length} meses</p>
                    </CardContent>
                  </Card>

                  {/* Utilidad Neta */}
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Utilidad Neta</CardTitle>
                      <Wallet className="h-5 w-5 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">${formatChileno(metricas.total_utilidad_neta)}</div>
                      <p className="text-xs text-gray-600">Margen: {margenNeto.toFixed(1)}%</p>
                      {margenNeto < 30 && (
                        <Badge variant="destructive" className="mt-1 text-xs">⚠️ Bajo 30%</Badge>
                      )}
                    </CardContent>
                  </Card>

                  {/* RevPSM */}
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium"><GlosarioTooltip termino="RevPSM" /></CardTitle>
                      <BarChart3 className="h-5 w-5 text-purple-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">${formatChileno(revPSM)}</div>
                      <p className="text-xs text-gray-600">Por m² al mes</p>
                    </CardContent>
                  </Card>
                </div>

                {/* PAYBACK CAPEX */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="border-2 border-orange-200">
                    <CardHeader>
                      <CardTitle className="text-lg">📊 <GlosarioTooltip termino="Payback" /> Derecho de Llaves</CardTitle>
                      <CardDescription>Recuperación de inversión de $18.900.000</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Inversión Inicial:</span>
                        <span className="font-bold">${formatChileno(derechoLlaves)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Utilidad Acumulada:</span>
                        <span className="font-bold text-green-600">${formatChileno(utilidadAcumulada)}</span>
                      </div>
                      <Progress value={(utilidadAcumulada / derechoLlaves) * 100} className="h-3" />
                      <div className="text-center pt-2">
                        <div className="text-3xl font-bold text-orange-600">{paybackDerecho} meses</div>
                        <p className="text-xs text-gray-600">Tiempo estimado de recuperación</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-2 border-blue-200">
                    <CardHeader>
                      <CardTitle className="text-lg">💰 Payback CAPEX Total</CardTitle>
                      <CardDescription>Recuperación de inversión total de $37.697.000</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">CAPEX Total:</span>
                        <span className="font-bold">${formatChileno(capexTotal)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Utilidad Acumulada:</span>
                        <span className="font-bold text-green-600">${formatChileno(utilidadAcumulada)}</span>
                      </div>
                      <Progress value={(utilidadAcumulada / capexTotal) * 100} className="h-3" />
                      <div className="text-center pt-2">
                        <div className="text-3xl font-bold text-blue-600">{paybackCapex} meses</div>
                        <p className="text-xs text-gray-600">Tiempo estimado de recuperación</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* WIDGET: GENIO Y FIGURA */}
                <Card className="border-2 border-pink-200 bg-gradient-to-r from-pink-50 to-purple-50">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Sparkles className="h-5 w-5 text-pink-600" />
                          🎭 Sistema Genio y Figura
                        </CardTitle>
                        <CardDescription>Clasificación gamificada basada en utilidad neta</CardDescription>
                      </div>
                      <Badge className="bg-gradient-to-r from-pink-600 to-purple-600 text-white">
                        Widget
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <GenioyFigura />
                  </CardContent>
                </Card>

                {/* GRÁFICOS */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Evolución Temporal */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">📈 Evolución Ventas y Utilidad</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="fecha" style={{ fontSize: '12px' }} />
                          <YAxis style={{ fontSize: '12px' }} />
                          <Tooltip 
                            formatter={(value: number) => `$${formatChileno(value)}`}
                            contentStyle={{ fontSize: '12px' }}
                          />
                          <Legend />
                          <Line type="monotone" dataKey="ventaTotal" stroke="#3b82f6" name="Venta Total" strokeWidth={2} />
                          <Line type="monotone" dataKey="utilidadNeta" stroke="#10b981" name="Utilidad Neta" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Mix de Líneas */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">🍰 Mix de Líneas de Negocio</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={lineaData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={(entry) => `${entry.nombre} (${entry.margen})`}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="valor"
                          >
                            {lineaData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value: number) => `$${formatChileno(value)}`} />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>

                {/* METAS POR ROL (Widget según filtro) */}
                {rolFiltro && (
                  <Card className="border-2 border-green-200">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Target className="h-5 w-5 text-green-600" />
                            🎯 Metas para {rolFiltro === 'cfo' ? 'CFO' : rolFiltro === 'socio-gerente' ? 'Socio-Gerente' : 'Colaborador'}
                          </CardTitle>
                          <CardDescription>KPIs específicos para tu rol</CardDescription>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setMostrarMetasSecundarias(!mostrarMetasSecundarias)}
                        >
                          {mostrarMetasSecundarias ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          {mostrarMetasSecundarias ? 'Ocultar' : 'Ver detalle'}
                        </Button>
                      </div>
                    </CardHeader>
                    {mostrarMetasSecundarias && (
                      <CardContent>
                        <MetasPorRol />
                      </CardContent>
                    )}
                  </Card>
                )}
              </>
            ) : (
              <Card className="border-2 border-dashed border-gray-300 bg-white">
                <CardContent className="flex flex-col items-center justify-center py-12 gap-8 text-center">
                  {/* Hero icon */}
                  <div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center shadow-inner">
                    <Activity className="h-10 w-10 text-blue-500" />
                  </div>

                  {/* Headline */}
                  <div className="space-y-2 max-w-sm">
                    <h2 className="text-2xl font-bold text-gray-800">Comienza tu análisis financiero</h2>
                    <p className="text-gray-500 text-sm">
                      Ingresa el primer mes de ventas para ver tus KPIs, payback y estado Genio/Figura en tiempo real.
                    </p>
                  </div>

                  {/* 3-step guide */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-lg text-left">
                    {[
                      {
                        step: 1,
                        icon: Upload,
                        title: 'Carga datos',
                        desc: 'CSV, Google Sheets o ingreso manual',
                        color: 'bg-green-50 border-green-200 text-green-700',
                        iconBg: 'bg-green-100',
                        iconColor: 'text-green-600',
                      },
                      {
                        step: 2,
                        icon: BarChart3,
                        title: 'Revisa KPIs',
                        desc: 'Margen, payback y mix de negocio',
                        color: 'bg-blue-50 border-blue-200 text-blue-700',
                        iconBg: 'bg-blue-100',
                        iconColor: 'text-blue-600',
                      },
                      {
                        step: 3,
                        icon: CheckCircle2,
                        title: 'Decide y actúa',
                        desc: 'Alertas automáticas y reportes ejecutivos',
                        color: 'bg-purple-50 border-purple-200 text-purple-700',
                        iconBg: 'bg-purple-100',
                        iconColor: 'text-purple-600',
                      },
                    ].map(({ step, icon: Icon, title, desc, color, iconBg, iconColor }) => (
                      <div key={step} className={`rounded-xl border-2 ${color} p-4 flex flex-col gap-3`}>
                        <div className="flex items-center gap-2">
                          <span className={`rounded-lg p-1.5 ${iconBg}`}>
                            <Icon className={`h-4 w-4 ${iconColor}`} />
                          </span>
                          <span className="text-xs font-bold uppercase tracking-wide opacity-60">Paso {step}</span>
                        </div>
                        <div>
                          <p className="font-semibold text-sm">{title}</p>
                          <p className="text-xs opacity-75 mt-0.5">{desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Business lines preview */}
                  <div className="grid grid-cols-3 gap-3 w-full max-w-sm">
                    {[
                      { icon: Coffee, label: 'Cafetería', color: 'bg-orange-50 border-orange-200', iconBg: 'bg-orange-100', iconColor: 'text-orange-600' },
                      { icon: Laptop, label: 'Hotdesk', color: 'bg-blue-50 border-blue-200', iconBg: 'bg-blue-100', iconColor: 'text-blue-600' },
                      { icon: Briefcase, label: 'Asesorías', color: 'bg-purple-50 border-purple-200', iconBg: 'bg-purple-100', iconColor: 'text-purple-600' },
                    ].map(({ icon: Icon, label, color, iconBg, iconColor }) => (
                      <div key={label} className={`rounded-lg border-2 ${color} p-3 flex flex-col items-center gap-2`}>
                        <span className={`rounded-lg p-2 ${iconBg}`}>
                          <Icon className={`h-5 w-5 ${iconColor}`} />
                        </span>
                        <span className="text-xs font-medium text-gray-600">{label}</span>
                      </div>
                    ))}
                  </div>

                  {/* Primary CTA */}
                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <Button
                      size="lg"
                      className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 transition-all duration-200 hover:shadow-lg hover:scale-[1.02]"
                      onClick={() => handleTabChange('datos')}
                    >
                      <Database className="mr-2 h-5 w-5" />
                      Cargar primer mes
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* ============================================ */}
          {/* TAB 2: GESTIÓN DE DATOS                      */}
          {/* ============================================ */}
          <TabsContent value="datos" className="space-y-6">
            <Card className="border-2 border-green-300">
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
                <CardTitle className="text-xl flex items-center gap-2">
                  <Database className="h-6 w-6 text-green-600" />
                  📝 Gestión de Datos - Ingreso y Edición
                </CardTitle>
                <CardDescription>
                  Unificación de ingreso mensual/diario + Historial centralizado
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                
                {/* TOGGLE: Mensual / Diario */}
                <div className="flex items-center gap-4 justify-center">
                  <Button 
                    variant={mostrarDiario ? 'outline' : 'default'}
                    onClick={() => setMostrarDiario(false)}
                    className="flex items-center gap-2"
                  >
                    <Calendar className="h-4 w-4" />
                    Ingreso Mensual
                  </Button>
                  <Button 
                    variant={mostrarDiario ? 'default' : 'outline'}
                    onClick={() => setMostrarDiario(true)}
                    className="flex items-center gap-2"
                  >
                    <TrendingUp className="h-4 w-4" />
                    Ingreso Diario
                  </Button>
                </div>

                {/* INGRESO MENSUAL (Principal) */}
                {!mostrarDiario && (
                  <Card className="border-green-200">
                    <CardHeader>
                      <CardTitle className="text-lg">📊 Ingreso de Datos Mensual</CardTitle>
                      <CardDescription>Formulario principal - 3 líneas de negocio separadas</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <HistorialDiarioMejor />
                    </CardContent>
                  </Card>
                )}

                {/* INGRESO DIARIO (Colapsado) */}
                {mostrarDiario && (
                  <Alert className="border-orange-200 bg-orange-50">
                    <AlertTriangle className="h-4 w-4 text-orange-600" />
                    <AlertTitle className="text-orange-900">⚠️ Funcionalidad Opcional</AlertTitle>
                    <AlertDescription className="text-orange-800">
                      El <strong>ingreso diario</strong> es útil para tracking granular, pero crea flujos paralelos confusos.
                      <br />
                      <strong>Recomendación CFO:</strong> Usa ingreso mensual como fuente principal de verdad.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* SEPARACIÓN DE 3 LÍNEAS */}
            {registros.length > 0 && metricas && (
              <Card className="border-2 border-blue-200">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                    🔍 Breakdown por Línea de Negocio
                  </CardTitle>
                  <CardDescription>
                    Análisis separado porque márgenes distintos (68% / 92.5% / 100%) distorsionan si se mezclan
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <BusinessLineCard
                      icon={Coffee}
                      label="Cafetería"
                      value={metricas.cafe}
                      marginPercent="68%"
                      sharePercent={(metricas.cafe / metricas.total_venta) * 100}
                      accentColor="orange"
                      formatter={(n) => `$${formatChileno(n)}`}
                    />
                    <BusinessLineCard
                      icon={Laptop}
                      label="Hotdesk"
                      value={metricas.hotdesk}
                      marginPercent="92.5%"
                      sharePercent={(metricas.hotdesk / metricas.total_venta) * 100}
                      accentColor="blue"
                      formatter={(n) => `$${formatChileno(n)}`}
                    />
                    <BusinessLineCard
                      icon={Briefcase}
                      label="Asesorías"
                      value={metricas.asesorias}
                      marginPercent="100%"
                      sharePercent={(metricas.asesorias / metricas.total_venta) * 100}
                      accentColor="purple"
                      formatter={(n) => `$${formatChileno(n)}`}
                    />
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* ============================================ */}
          {/* TAB 3: ANÁLISIS Y REPORTES                   */}
          {/* ============================================ */}
          <TabsContent value="analisis" className="space-y-6">
            {loadingAnalisis ? (
              <div className="space-y-4 p-2">
                <Skeleton className="h-24 w-full rounded-xl" />
                <Skeleton className="h-48 w-full rounded-xl" />
                <Skeleton className="h-64 w-full rounded-xl" />
              </div>
            ) : (
            <>
            <Card className="border-2 border-purple-300">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
                <CardTitle className="text-xl flex items-center gap-2">
                  <FileText className="h-6 w-6 text-purple-600" />
                  📈 Análisis y Reportes Ejecutivos
                </CardTitle>
                <CardDescription>
                  Consolidación de Informe SOP + Reportes + Integración B2C
                </CardDescription>
              </CardHeader>
            </Card>

            {/* INFORME EJECUTIVO SOP */}
            <Card className="border-red-200">
              <CardHeader className="bg-red-50">
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5 text-red-600" />
                  📄 Informe Ejecutivo SOP
                </CardTitle>
                <CardDescription>Análisis completo estilo Standard Operating Procedure</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <InformeEjecutivo />
              </CardContent>
            </Card>

            {/* ANÁLISIS CFO - ESTRATÉGICO */}
            <Card className="border-2 border-indigo-300 bg-gradient-to-r from-indigo-50 to-purple-50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-indigo-600" />
                  🎯 Análisis Estratégico CFO
                </CardTitle>
                <CardDescription>Análisis financiero avanzado: Márgenes, <GlosarioTooltip termino="RevPSM" />, <GlosarioTooltip termino="Mix de Negocio" />, Escenarios</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <AnalisisCFO />
              </CardContent>
            </Card>

            {/* REPORTES EJECUTIVOS */}
            <Card className="border-cyan-200">
              <CardHeader className="bg-cyan-50">
                <CardTitle className="text-lg flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-cyan-600" />
                  📊 Reportes Ejecutivos
                </CardTitle>
                <CardDescription>Dashboards y métricas avanzadas</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <ReportesEjecutivos />
              </CardContent>
            </Card>

            {/* INTEGRACIÓN B2C ECOMMERCE */}
            <Card className="border-blue-200">
              <CardHeader className="bg-blue-50">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Globe className="h-5 w-5 text-blue-600" />
                  🌐 Integración B2C Ecommerce
                </CardTitle>
                <CardDescription>Análisis de plataforma online + propuesta de integración</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <IntegracionB2C />
              </CardContent>
            </Card>

            {/* ANÁLISIS UX/UI SECCIÓN ANÁLISIS */}
            <Card className="border-purple-200">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Eye className="h-5 w-5 text-purple-600" />
                  👁️ Análisis Heurístico y Usabilidad - Sección Análisis
                </CardTitle>
                <CardDescription>Evaluación UX/UI completa de la sección "Análisis y Reportes"</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setMostrarMetasSecundarias(!mostrarMetasSecundarias)}
                  className="mb-4"
                >
                  {mostrarMetasSecundarias ? <ChevronUp className="h-4 w-4 mr-2" /> : <ChevronDown className="h-4 w-4 mr-2" />}
                  {mostrarMetasSecundarias ? 'Ocultar Análisis UX/UI' : 'Ver Análisis Completo'}
                </Button>
                
                {mostrarMetasSecundarias && (
                  <div className="border-t pt-4">
                    <AnalisisUXAnalisis />
                  </div>
                )}
              </CardContent>
            </Card>
            </>
            )}
          </TabsContent>

          {/* ============================================ */}
          {/* TAB 4: CONFIGURACIÓN                         */}
          {/* ============================================ */}
          <TabsContent value="config" className="space-y-6">
            <Card className="border-2 border-gray-300">
              <CardHeader className="bg-gradient-to-r from-gray-50 to-slate-50">
                <CardTitle className="text-xl flex items-center gap-2">
                  <Settings className="h-6 w-6 text-gray-600" />
                  ⚙️ Configuración y Automatizaciones
                </CardTitle>
                <CardDescription>
                  Webhooks, alertas, integraciones y tutoriales técnicos
                </CardDescription>
              </CardHeader>
            </Card>

            {/* WEBHOOKS + ALERTAS */}
            <Card className="border-purple-200">
              <CardHeader className="bg-purple-50">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Webhook className="h-5 w-5 text-purple-600" />
                  🔗 Webhooks Make.com + Alertas Automáticas
                </CardTitle>
                <CardDescription>Notificaciones en tiempo real cuando margen &lt; 30%</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <WebhooksMake />
                  <AlertasAutomaticas />
                </div>
              </CardContent>
            </Card>

            {/* TUTORIAL MAKE.COM */}
            <Card className="border-cyan-200">
              <CardHeader className="bg-gradient-to-r from-cyan-50 to-purple-50">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Zap className="h-5 w-5 text-cyan-600" />
                  ⚡ Tutorial Make.com + Google Sheets + OpenAI
                </CardTitle>
                <CardDescription>Guía completa de automatización con 5 pasos detallados</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setMostrarConfigAvanzada(!mostrarConfigAvanzada)}
                  className="mb-4"
                >
                  {mostrarConfigAvanzada ? <ChevronUp className="h-4 w-4 mr-2" /> : <ChevronDown className="h-4 w-4 mr-2" />}
                  {mostrarConfigAvanzada ? 'Ocultar Tutorial' : 'Ver Tutorial Completo'}
                </Button>
                
                {mostrarConfigAvanzada && <TutorialMakeGoogleSheets />}
              </CardContent>
            </Card>

            {/* GUÍA WEBHOOK MAKE */}
            <Card className="border-blue-200">
              <CardHeader className="bg-blue-50">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Webhook className="h-5 w-5 text-blue-600" />
                  📘 Guía Técnica: Configurar Webhook Make
                </CardTitle>
                <CardDescription>Documentación paso a paso para desarrolladores</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <GuiaWebhookMake />
              </CardContent>
            </Card>

            {/* FUNCIONES OCULTAS/REMOVIDAS */}
            <Alert className="border-2 border-red-200 bg-red-50">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <AlertTitle className="text-red-900 font-bold">🗑️ Funciones Removidas en Consolidación</AlertTitle>
              <AlertDescription className="text-red-800 text-sm">
                <p className="mb-2">Para reducir complejidad, estas funciones fueron <strong>eliminadas u ocultadas</strong>:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li><strong>Acciones Rápidas:</strong> Redundante (navegación disponible en tabs)</li>
                  <li><strong>Auditoría Operativa:</strong> Movida a beta/desarrollo</li>
                  <li><strong>Sincronización Figma:</strong> Solo para desarrolladores (oculta en producción)</li>
                  <li><strong>Auditoría Heurística UX:</strong> Movida a documentos externos</li>
                </ul>
                <p className="mt-2 text-xs">
                  <strong>Justificación:</strong> Usuarios finales (CFO, Socio-Gerente, Colaborador) no necesitan herramientas meta/desarrollo en interfaz principal.
                </p>
              </AlertDescription>
            </Alert>
          </TabsContent>
        </Tabs>

      </div>
    </div>
  );
}