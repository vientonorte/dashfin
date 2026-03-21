import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Separator } from './ui/separator';
import { Progress } from './ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { 
  Target, 
  Users, 
  Coffee, 
  Wifi, 
  TrendingUp, 
  DollarSign, 
  AlertTriangle, 
  CheckCircle2, 
  Clock,
  ClipboardCheck,
  FileText,
  Calculator,
  ShieldAlert,
  Info,
  HelpCircle,
  BarChart3,
  Loader2
} from 'lucide-react';

interface KPIData {
  margenNeto: number;
  revPSM: number;
  ticketPromedio: number;
  ocupacionDigital: number;
  laborCost: number;
}

interface RolMeta {
  rol: string;
  responsable: string;
  kpiPrincipal: string;
  metaDiaria: string;
  metaMensual: string;
  status: 'cumplido' | 'alerta' | 'critico';
  icon: any;
  descripcion: string;
  accionSugerida: string;
}

const CAPEX_TOTAL = 37697000;

export function SOPMatrizMetas() {
  const [kpiData, setKpiData] = useState<KPIData>({
    margenNeto: 0,
    revPSM: 0,
    ticketPromedio: 0,
    ocupacionDigital: 0,
    laborCost: 0
  });

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);

  const formatChileno = (num: number): string => {
    return Math.round(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const getStatusColor = (status: 'cumplido' | 'alerta' | 'critico') => {
    switch (status) {
      case 'cumplido': return 'bg-green-500';
      case 'alerta': return 'bg-yellow-500';
      case 'critico': return 'bg-red-500';
    }
  };

  const getStatusTextColor = (status: 'cumplido' | 'alerta' | 'critico') => {
    switch (status) {
      case 'cumplido': return 'text-green-700';
      case 'alerta': return 'text-yellow-700';
      case 'critico': return 'text-red-700';
    }
  };

  const getStatusBgColor = (status: 'cumplido' | 'alerta' | 'critico') => {
    switch (status) {
      case 'cumplido': return 'bg-green-50';
      case 'alerta': return 'bg-yellow-50';
      case 'critico': return 'bg-red-50';
    }
  };

  const handleAnalizar = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      setHasAnalyzed(true);
    }, 1500);
  };

  const rolesMatrix: RolMeta[] = [
    {
      rol: 'Administrador',
      responsable: 'Control Financiero',
      kpiPrincipal: 'Margen Neto',
      metaDiaria: '> 30%',
      metaMensual: '> 32.7%',
      status: kpiData.margenNeto >= 30 ? 'cumplido' : kpiData.margenNeto >= 25 ? 'alerta' : 'critico',
      icon: Calculator,
      descripcion: 'Supervisa la rentabilidad diaria y asegura que los costos estén controlados',
      accionSugerida: kpiData.margenNeto < 30 ? 'Revisar costos operacionales y ajustar precios si es necesario' : 'Continuar con el control actual'
    },
    {
      rol: 'Barista Leader',
      responsable: 'Productividad Espacial',
      kpiPrincipal: 'RevPSM',
      metaDiaria: '> $25.000/m²',
      metaMensual: '> $635.440/m²',
      status: kpiData.revPSM >= 25000 ? 'cumplido' : kpiData.revPSM >= 20000 ? 'alerta' : 'critico',
      icon: Coffee,
      descripcion: 'Maximiza las ventas por metro cuadrado del local',
      accionSugerida: kpiData.revPSM < 25000 ? 'Implementar rotación de mesas y optimizar tiempos de atención' : 'Mantener el ritmo de servicio'
    },
    {
      rol: 'Soporte',
      responsable: 'Upselling',
      kpiPrincipal: 'Ticket Promedio',
      metaDiaria: '> $4.000',
      metaMensual: '> $4.500',
      status: kpiData.ticketPromedio >= 4000 ? 'cumplido' : kpiData.ticketPromedio >= 3000 ? 'alerta' : 'critico',
      icon: TrendingUp,
      descripcion: 'Aumenta el valor de cada transacción mediante ventas sugeridas',
      accionSugerida: kpiData.ticketPromedio < 4000 ? 'Sugerir combos y productos complementarios a cada cliente' : 'Excelente trabajo en upselling'
    },
    {
      rol: 'Hot Desk Host',
      responsable: 'Ocupación Digital',
      kpiPrincipal: 'Ocupación %',
      metaDiaria: '> 80%',
      metaMensual: '> 85%',
      status: kpiData.ocupacionDigital >= 80 ? 'cumplido' : kpiData.ocupacionDigital >= 60 ? 'alerta' : 'critico',
      icon: Wifi,
      descripcion: 'Gestiona la ocupación de espacios de trabajo compartido',
      accionSugerida: kpiData.ocupacionDigital < 80 ? 'Promocionar espacios en redes sociales y ofrecer descuentos' : 'Ocupación óptima alcanzada'
    }
  ];

  const controlesCriticos = [
    {
      nombre: 'Labor Cost',
      descripcion: 'Costo laboral vs ventas',
      umbral: '< 22%',
      actual: kpiData.laborCost,
      status: kpiData.laborCost <= 22 ? 'cumplido' : kpiData.laborCost <= 25 ? 'alerta' : 'critico',
      icon: Users,
      tooltip: 'Porcentaje del costo de personal sobre las ventas totales. Mantenerlo bajo 22% asegura rentabilidad.'
    },
    {
      nombre: 'Margen Neto',
      descripcion: 'Rentabilidad operacional',
      umbral: '> 30%',
      actual: kpiData.margenNeto,
      status: kpiData.margenNeto >= 30 ? 'cumplido' : kpiData.margenNeto >= 25 ? 'alerta' : 'critico',
      icon: DollarSign,
      tooltip: 'Ganancia neta después de todos los costos. Un margen superior al 30% es saludable.'
    },
    {
      nombre: 'RevPSM',
      descripcion: 'Venta por m²',
      umbral: '> $25.000',
      actual: kpiData.revPSM,
      status: kpiData.revPSM >= 25000 ? 'cumplido' : kpiData.revPSM >= 20000 ? 'alerta' : 'critico',
      icon: Target,
      tooltip: 'Revenue Per Square Meter: venta generada por cada metro cuadrado del local.'
    }
  ];

  const protocolosCierre = [
    { id: 1, paso: 'Cierre de caja física y digital', tiempo: '15 min', responsable: 'Barista Leader', prioridad: 'alta' },
    { id: 2, paso: 'Registro de ventas en Google Sheets', tiempo: '10 min', responsable: 'Administrador', prioridad: 'alta' },
    { id: 3, paso: 'Registro de gastos operacionales', tiempo: '10 min', responsable: 'Administrador', prioridad: 'alta' },
    { id: 4, paso: 'Cálculo de RevPSM del día', tiempo: '5 min', responsable: 'Administrador', prioridad: 'media' },
    { id: 5, paso: 'Verificación Labor Cost %', tiempo: '5 min', responsable: 'Administrador', prioridad: 'alta' },
    { id: 6, paso: 'Actualización Gap Payback', tiempo: '5 min', responsable: 'Administrador', prioridad: 'media' },
    { id: 7, paso: 'Reporte "Genio y Figura"', tiempo: '5 min', responsable: 'Administrador', prioridad: 'media' }
  ];

  const horarioOperacional = {
    dias: 'Lunes a Domingo',
    apertura: '8:00 AM',
    cierre: '11:00 PM',
    horasTotales: 15,
    horasPico: ['8:00-10:00 AM', '12:00-2:00 PM', '6:00-9:00 PM'],
    cartasDiferenciadas: [
      { nombre: 'Desayuno', horario: '8:00 AM - 12:00 PM', items: ['Café + Tostadas', 'Jugos naturales', 'Pasteles', 'Bowls'] },
      { nombre: 'Almuerzo', horario: '12:00 PM - 4:00 PM', items: ['Sandwiches', 'Ensaladas', 'Platos calientes', 'Smoothies'] },
      { nombre: 'Once/Merienda', horario: '4:00 PM - 7:00 PM', items: ['Café especialidad', 'Pastelería', 'Té', 'Snacks'] },
      { nombre: 'Cena ligera', horario: '7:00 PM - 11:00 PM', items: ['Sandwiches', 'Tablas', 'Café', 'Postres'] }
    ]
  };

  return (
    <div className="space-y-6">
      {/* Header con accesibilidad */}
      <div className="text-center space-y-2" role="banner">
        <div className="flex items-center justify-center gap-2">
          <ClipboardCheck className="h-8 w-8 text-blue-600" aria-hidden="true" />
          <h2 className="text-3xl font-bold">Manual de Operaciones & Matriz de Metas</h2>
        </div>
        <p className="text-gray-600">Local Irarrázaval 2100 • Objetivo: Recuperar ${formatChileno(CAPEX_TOTAL)} CLP</p>
        <div className="flex justify-center gap-2" role="status" aria-label="Leyenda de estados">
          <Badge variant="outline" className="bg-green-50" aria-label="Estado cumplido">
            <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-1" aria-hidden="true"></span>
            Cumplido
          </Badge>
          <Badge variant="outline" className="bg-yellow-50" aria-label="Estado en alerta">
            <span className="inline-block w-2 h-2 rounded-full bg-yellow-500 mr-1" aria-hidden="true"></span>
            Alerta
          </Badge>
          <Badge variant="outline" className="bg-red-50" aria-label="Estado crítico">
            <span className="inline-block w-2 h-2 rounded-full bg-red-500 mr-1" aria-hidden="true"></span>
            Crítico
          </Badge>
        </div>
      </div>

      {/* Tabs con accesibilidad */}
      <Tabs defaultValue="matriz" className="space-y-6">
        <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-3" role="tablist">
          <TabsTrigger value="matriz" aria-label="Ver matriz de metas por rol">
            <Target className="mr-2 h-4 w-4" aria-hidden="true" />
            Matriz de Metas
          </TabsTrigger>
          <TabsTrigger value="controles" aria-label="Ver controles críticos">
            <ShieldAlert className="mr-2 h-4 w-4" aria-hidden="true" />
            Controles Críticos
          </TabsTrigger>
          <TabsTrigger value="protocolos" aria-label="Ver protocolos SOP">
            <FileText className="mr-2 h-4 w-4" aria-hidden="true" />
            SOP Protocolos
          </TabsTrigger>
        </TabsList>

        {/* MATRIZ DE METAS */}
        <TabsContent value="matriz" className="space-y-6" role="tabpanel">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" aria-hidden="true" />
                Ingreso de KPIs Diarios
              </CardTitle>
              <CardDescription>Complete los valores del día para analizar el rendimiento de cada rol</CardDescription>
            </CardHeader>
            <CardContent>
              <form 
                onSubmit={(e) => { e.preventDefault(); handleAnalizar(); }}
                aria-label="Formulario de ingreso de KPIs"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  {/* Margen Neto */}
                  <div className="space-y-2">
                    <Label htmlFor="margenNeto" className="flex items-center gap-2">
                      Margen Neto (%)
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-3 w-3 text-gray-400 cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent><p className="max-w-xs">Utilidad después de costos. Meta: mayor a 30%</p></TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </Label>
                    <Input
                      id="margenNeto"
                      type="number"
                      placeholder="30"
                      min="0"
                      max="100"
                      step="0.1"
                      value={kpiData.margenNeto || ''}
                      onChange={(e) => setKpiData({ ...kpiData, margenNeto: Number(e.target.value) })}
                      aria-describedby="margenNeto-help"
                    />
                    <p id="margenNeto-help" className="text-xs text-gray-500">Meta: &gt; 30%</p>
                  </div>

                  {/* RevPSM */}
                  <div className="space-y-2">
                    <Label htmlFor="revPSM" className="flex items-center gap-2">
                      RevPSM (CLP/m²)
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-3 w-3 text-gray-400 cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent><p className="max-w-xs">Venta por metro cuadrado. Meta: mayor a $25.000/m²</p></TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </Label>
                    <Input
                      id="revPSM"
                      type="number"
                      placeholder="25000"
                      value={kpiData.revPSM || ''}
                      onChange={(e) => setKpiData({ ...kpiData, revPSM: Number(e.target.value) })}
                    />
                    <p className="text-xs text-gray-500">Meta: &gt; $25.000</p>
                  </div>

                  {/* Ticket Promedio */}
                  <div className="space-y-2">
                    <Label htmlFor="ticketPromedio" className="flex items-center gap-2">
                      Ticket Promedio (CLP)
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-3 w-3 text-gray-400 cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent><p className="max-w-xs">Valor promedio por transacción. Meta: mayor a $4.000</p></TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </Label>
                    <Input
                      id="ticketPromedio"
                      type="number"
                      placeholder="4000"
                      value={kpiData.ticketPromedio || ''}
                      onChange={(e) => setKpiData({ ...kpiData, ticketPromedio: Number(e.target.value) })}
                    />
                    <p className="text-xs text-gray-500">Meta: &gt; $4.000</p>
                  </div>

                  {/* Ocupación */}
                  <div className="space-y-2">
                    <Label htmlFor="ocupacionDigital" className="flex items-center gap-2">
                      Ocupación (%)
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-3 w-3 text-gray-400 cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent><p className="max-w-xs">% de espacios ocupados. Meta: mayor a 80%</p></TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </Label>
                    <Input
                      id="ocupacionDigital"
                      type="number"
                      placeholder="80"
                      max="100"
                      value={kpiData.ocupacionDigital || ''}
                      onChange={(e) => setKpiData({ ...kpiData, ocupacionDigital: Number(e.target.value) })}
                    />
                    <p className="text-xs text-gray-500">Meta: &gt; 80%</p>
                  </div>

                  {/* Labor Cost */}
                  <div className="space-y-2">
                    <Label htmlFor="laborCost" className="flex items-center gap-2">
                      Labor Cost (%)
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-3 w-3 text-gray-400 cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent><p className="max-w-xs">% de costo laboral. Meta: menor a 22%</p></TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </Label>
                    <Input
                      id="laborCost"
                      type="number"
                      placeholder="21"
                      max="100"
                      value={kpiData.laborCost || ''}
                      onChange={(e) => setKpiData({ ...kpiData, laborCost: Number(e.target.value) })}
                    />
                    <p className="text-xs text-gray-500">Meta: &lt; 22%</p>
                  </div>
                </div>

                <Button 
                  type="submit"
                  className="w-full mt-6 bg-black hover:bg-gray-800 text-white font-semibold py-6"
                  disabled={isAnalyzing}
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Analizando datos...
                    </>
                  ) : (
                    <>
                      <BarChart3 className="mr-2 h-5 w-5" />
                      Analizar Datos
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Resultados */}
          {hasAnalyzed && (
            <>
              <Alert className="border-blue-500 bg-blue-50" role="status">
                <CheckCircle2 className="h-4 w-4 text-blue-600" />
                <AlertTitle>Análisis completado</AlertTitle>
                <AlertDescription>Se han evaluado los KPIs de los 4 roles. Revisa los resultados a continuación.</AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {rolesMatrix.map((rol, index) => (
                  <Card 
                    key={index}
                    className={`border-2 transition-all hover:shadow-lg ${
                      rol.status === 'cumplido' ? 'border-green-500' :
                      rol.status === 'alerta' ? 'border-yellow-500' : 'border-red-500'
                    } ${getStatusBgColor(rol.status)}`}
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <rol.icon className="h-6 w-6" />
                          <div>
                            <CardTitle className="text-lg">{rol.rol}</CardTitle>
                            <CardDescription>{rol.responsable}</CardDescription>
                          </div>
                        </div>
                        <Badge className={`${getStatusColor(rol.status)} text-white px-3`}>
                          {rol.status === 'cumplido' ? '✓' : rol.status === 'alerta' ? '!' : '✗'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-gray-600">{rol.descripcion}</p>
                      <div>
                        <p className="text-sm font-semibold mb-1">KPI Principal</p>
                        <p className="text-2xl font-bold">{rol.kpiPrincipal}</p>
                      </div>
                      <Separator />
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-600">Meta Diaria</p>
                          <p className="text-sm font-bold">{rol.metaDiaria}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Meta Mensual</p>
                          <p className="text-sm font-bold">{rol.metaMensual}</p>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm font-medium">Estado Actual</span>
                          <span className={`font-bold ${getStatusTextColor(rol.status)}`}>
                            {rol.kpiPrincipal === 'Margen Neto' && `${kpiData.margenNeto}%`}
                            {rol.kpiPrincipal === 'RevPSM' && `$${formatChileno(kpiData.revPSM)}`}
                            {rol.kpiPrincipal === 'Ticket Promedio' && `$${formatChileno(kpiData.ticketPromedio)}`}
                            {rol.kpiPrincipal === 'Ocupación %' && `${kpiData.ocupacionDigital}%`}
                          </span>
                        </div>
                        <Progress 
                          value={
                            rol.kpiPrincipal === 'Margen Neto' ? Math.min((kpiData.margenNeto / 30) * 100, 100) :
                            rol.kpiPrincipal === 'RevPSM' ? Math.min((kpiData.revPSM / 25000) * 100, 100) :
                            rol.kpiPrincipal === 'Ticket Promedio' ? Math.min((kpiData.ticketPromedio / 4000) * 100, 100) :
                            Math.min(kpiData.ocupacionDigital, 100)
                          }
                          className="h-2"
                        />
                      </div>
                      <Separator />
                      <div className={`p-3 rounded-lg ${
                        rol.status === 'cumplido' ? 'bg-green-100 border border-green-300' :
                        rol.status === 'alerta' ? 'bg-yellow-100 border border-yellow-300' :
                        'bg-red-100 border border-red-300'
                      }`}>
                        <p className="text-xs font-semibold mb-1 flex items-center gap-1">
                          <HelpCircle className="h-3 w-3" />
                          Acción Sugerida:
                        </p>
                        <p className="text-sm">{rol.accionSugerida}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </TabsContent>

        {/* CONTROLES CRÍTICOS */}
        <TabsContent value="controles" className="space-y-6">
          <Alert>
            <ShieldAlert className="h-4 w-4" />
            <AlertTitle>Controles Críticos de Rentabilidad</AlertTitle>
            <AlertDescription>KPIs fundamentales para recuperar ${formatChileno(CAPEX_TOTAL)} CLP</AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {controlesCriticos.map((control, index) => (
              <Card key={index} className={`border-2 ${
                control.status === 'cumplido' ? 'border-green-500' :
                control.status === 'alerta' ? 'border-yellow-500' : 'border-red-500'
              }`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <control.icon className="h-8 w-8" />
                    <Badge className={`${getStatusColor(control.status)} text-white`}>
                      {control.status === 'cumplido' ? '✓' : control.status === 'alerta' ? '!' : '✗'}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl flex items-center gap-2">
                    {control.nombre}
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger><Info className="h-4 w-4 text-gray-400" /></TooltipTrigger>
                        <TooltipContent><p className="max-w-xs">{control.tooltip}</p></TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </CardTitle>
                  <CardDescription>{control.descripcion}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">Umbral</span>
                      <span className="font-bold">{control.umbral}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Actual</span>
                      <span className={`text-2xl font-bold ${
                        control.status === 'cumplido' ? 'text-green-600' :
                        control.status === 'alerta' ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {control.nombre === 'RevPSM' ? `$${formatChileno(control.actual)}` : `${control.actual}%`}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* SOP PROTOCOLOS */}
        <TabsContent value="protocolos" className="space-y-6">
          {/* HORARIO OPERACIONAL */}
          <Card className="border-purple-500 border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-purple-600" />
                Horario Operacional & Cartas Diferenciadas
              </CardTitle>
              <CardDescription>
                {horarioOperacional.dias} • {horarioOperacional.apertura} - {horarioOperacional.cierre} ({horarioOperacional.horasTotales} horas/día)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Horarios Pico */}
                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                  <p className="text-sm font-semibold mb-2 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-orange-600" />
                    Horarios Pico (Mayor demanda)
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {horarioOperacional.horasPico.map((horario, idx) => (
                      <Badge key={idx} variant="outline" className="bg-orange-100 border-orange-300">
                        {horario}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Cartas Diferenciadas */}
                <div>
                  <p className="text-sm font-semibold mb-3">Cartas por Horario</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {horarioOperacional.cartasDiferenciadas.map((carta, idx) => (
                      <div key={idx} className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-bold text-sm">{carta.nombre}</p>
                          <Badge variant="outline" className="text-xs">{carta.horario}</Badge>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {carta.items.map((item, itemIdx) => (
                            <span key={itemIdx} className="text-xs bg-white px-2 py-1 rounded border border-gray-200">
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Métricas Operacionales */}
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <p className="text-sm font-semibold mb-2">Métricas Operacionales por Hora</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                    <div>
                      <p className="text-gray-600">RevPSM/hora objetivo</p>
                      <p className="font-bold">${formatChileno(25000 / horarioOperacional.horasTotales)}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Venta mensual/hora</p>
                      <p className="font-bold">${formatChileno(15886000 / 30 / horarioOperacional.horasTotales)}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Días operacionales/mes</p>
                      <p className="font-bold">30 días</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Horas totales/mes</p>
                      <p className="font-bold">{horarioOperacional.horasTotales * 30}h</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-600" />
                Protocolo de Cierre Diario
              </CardTitle>
              <CardDescription>Tiempo total estimado: 55 minutos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {protocolosCierre.map((protocolo) => (
                  <div key={protocolo.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full font-bold">
                      {protocolo.id}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">{protocolo.paso}</p>
                      <div className="flex gap-4 mt-1">
                        <span className="text-xs text-gray-600"><Clock className="inline h-3 w-3 mr-1" />{protocolo.tiempo}</span>
                        <span className="text-xs text-gray-600"><Users className="inline h-3 w-3 mr-1" />{protocolo.responsable}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}