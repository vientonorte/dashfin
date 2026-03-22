import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Skeleton } from './ui/skeleton';
import { Progress } from './ui/progress';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  BarChart3, 
  PieChart,
  AlertTriangle,
  CheckCircle2,
  Zap,
  Target,
  Coffee,
  Wifi,
  Users,
  ShoppingCart,
  Percent,
  Calculator,
  LineChart,
  Activity,
  Scale,
  Lightbulb,
  XCircle
} from 'lucide-react';
import { useDashboard } from '../contexts/DashboardContext';
import { useRole } from '../contexts/RoleContext';
import { useBusinessConfig } from '../contexts/BusinessConfigContext';
import { AccessDenied } from './ui/AccessDenied';

// Márgenes de referencia por línea de negocio
const MARGENES_REFERENCIA = {
  cafe: 68,
  hotdesk: 92.5,
  asesorias: 100,
  online: 50 // promedio entre 45-55%
};

export function AnalisisCFO() {
  const { can } = useRole();
  const { config } = useBusinessConfig();
  const CAPEX_TOTAL = config.capex_total;
  const DERECHO_LLAVES = config.derecho_llaves;
  const AREA_M2 = config.metros_cuadrados;

  const { registros, metricas } = useDashboard();
  const [tipoAnalisis, setTipoAnalisis] = useState<'margenes' | 'revpsm' | 'mix' | 'escenarios'>('margenes');
  const [loading, setLoading] = useState(true);

  if (!can('view:financial_analysis')) {
    return <AccessDenied message="Solo disponible para CFO / Admin" />;
  }

  // US-011: Simular carga inicial con useEffect
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  // US-011: Loading State
  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96 mt-2" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-32" />
            </div>
            <Skeleton className="h-64 w-full" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatChileno = (num: number): string => {
    return Math.round(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  // Mapa estático de colores para evitar purga de clases dinámicas por Tailwind
  const revPSMColorMap: Record<string, { text: string; badge: string }> = {
    red: { text: 'text-red-600', badge: 'bg-red-500' },
    yellow: { text: 'text-yellow-600', badge: 'bg-yellow-500' },
    green: { text: 'text-green-600', badge: 'bg-green-500' },
    emerald: { text: 'text-emerald-600', badge: 'bg-emerald-500' },
  };

  // ========================================
  // ANÁLISIS DE MÁRGENES POR LÍNEA
  // ========================================
  const calcularAnalisisMargenes = () => {
    if (registros.length === 0) return null;

    const ultimoMes = registros[0];
    const ventaTotal = ultimoMes.venta_total_clp || 0;
    const utilidadNeta = ultimoMes.utilidad_neta_clp || 0;
    const margenNetoReal = ventaTotal > 0 ? (utilidadNeta / ventaTotal) * 100 : 0;

    const lineas = [
      {
        nombre: 'Cafetería',
        venta: ultimoMes.venta_cafe_clp || 0,
        margenTeorico: MARGENES_REFERENCIA.cafe,
        icon: Coffee,
        color: 'orange',
        participacion: ventaTotal > 0 ? ((ultimoMes.venta_cafe_clp || 0) / ventaTotal) * 100 : 0
      },
      {
        nombre: 'Hotdesk',
        venta: ultimoMes.venta_hotdesk_clp || 0,
        margenTeorico: MARGENES_REFERENCIA.hotdesk,
        icon: Wifi,
        color: 'blue',
        participacion: ventaTotal > 0 ? ((ultimoMes.venta_hotdesk_clp || 0) / ventaTotal) * 100 : 0
      },
      {
        nombre: 'Asesorías',
        venta: ultimoMes.venta_asesoria_clp || 0,
        margenTeorico: MARGENES_REFERENCIA.asesorias,
        icon: Users,
        color: 'purple',
        participacion: ventaTotal > 0 ? ((ultimoMes.venta_asesoria_clp || 0) / ventaTotal) * 100 : 0
      }
    ];

    // Calcular margen ponderado teórico (si todos los costos fueran teóricos)
    const margenPonderadoTeorico = lineas.reduce((acc, linea) => {
      return acc + (linea.margenTeorico * linea.participacion / 100);
    }, 0);

    // Diferencia entre margen teórico y real
    const desviacionMargen = margenPonderadoTeorico - margenNetoReal;

    // Determinar línea dominante
    const lineaDominante = lineas.reduce((prev, current) => 
      (current.venta > prev.venta) ? current : prev
    );

    return {
      lineas,
      ventaTotal,
      utilidadNeta,
      margenNetoReal,
      margenPonderadoTeorico,
      desviacionMargen,
      lineaDominante,
      ultimoMes
    };
  };

  // ========================================
  // ANÁLISIS DE RevPSM Y RENTABILIDAD POR M²
  // ========================================
  const calcularAnalisisRevPSM = () => {
    if (registros.length === 0) return null;

    const promedioMensual = metricas.revpsm_promedio || 0;
    const promedioAnual = promedioMensual * 12;
    
    // Benchmarks retail Chile (fuente: estimaciones mercado)
    const benchmarks = {
      bajo: 120000,    // CLP/m²/mes - retail básico
      medio: 250000,   // CLP/m²/mes - retail medio
      alto: 400000,    // CLP/m²/mes - retail premium
      excelente: 600000 // CLP/m²/mes - retail top
    };

    let clasificacion = 'Bajo';
    let color = 'red';
    if (promedioMensual >= benchmarks.excelente) {
      clasificacion = 'Excelente';
      color = 'emerald';
    } else if (promedioMensual >= benchmarks.alto) {
      clasificacion = 'Alto';
      color = 'green';
    } else if (promedioMensual >= benchmarks.medio) {
      clasificacion = 'Medio';
      color = 'yellow';
    }

    // Calcular RevPSM por línea de negocio
    const ultimoMes = registros[0];
    const lineasRevPSM = [
      {
        nombre: 'Cafetería',
        revpsm: (ultimoMes.venta_cafe_clp || 0) / AREA_M2,
        color: 'orange'
      },
      {
        nombre: 'Hotdesk',
        revpsm: (ultimoMes.venta_hotdesk_clp || 0) / AREA_M2,
        color: 'blue'
      },
      {
        nombre: 'Asesorías',
        revpsm: (ultimoMes.venta_asesoria_clp || 0) / AREA_M2,
        color: 'purple'
      }
    ];

    return {
      promedioMensual,
      promedioAnual,
      clasificacion,
      color,
      benchmarks,
      lineasRevPSM
    };
  };

  // ========================================
  // ANÁLISIS DE MIX DE NEGOCIO ÓPTIMO
  // ========================================
  const calcularMixOptimo = () => {
    if (registros.length === 0) return null;

    const ultimoMes = registros[0];
    const ventaTotal = ultimoMes.venta_total_clp || 0;

    // Mix actual
    const mixActual = {
      cafe: ventaTotal > 0 ? ((ultimoMes.venta_cafe_clp || 0) / ventaTotal) * 100 : 0,
      hotdesk: ventaTotal > 0 ? ((ultimoMes.venta_hotdesk_clp || 0) / ventaTotal) * 100 : 0,
      asesorias: ventaTotal > 0 ? ((ultimoMes.venta_asesoria_clp || 0) / ventaTotal) * 100 : 0
    };

    // Mix óptimo sugerido (basado en márgenes)
    // Priorizar líneas de mayor margen pero mantener balance operativo
    const mixOptimo = {
      cafe: 40,      // Reduce café (margen más bajo) pero mantén tráfico
      hotdesk: 40,   // Aumenta hotdesk (margen 92.5%)
      asesorias: 20  // Aumenta asesorías (margen 100%)
    };

    // Calcular margen neto si se aplicara mix óptimo
    const margenNetoActual = ultimoMes.margen_neto_percent || 0;
    const margenNetoOptimo = 
      (mixOptimo.cafe / 100 * MARGENES_REFERENCIA.cafe) +
      (mixOptimo.hotdesk / 100 * MARGENES_REFERENCIA.hotdesk) +
      (mixOptimo.asesorias / 100 * MARGENES_REFERENCIA.asesorias);

    // Calcular utilidad adicional si se mantiene venta total
    const utilidadActual = ultimoMes.utilidad_neta_clp || 0;
    const utilidadOptima = ventaTotal * (margenNetoOptimo / 100);
    const utilidadAdicional = utilidadOptima - utilidadActual;

    return {
      mixActual,
      mixOptimo,
      margenNetoActual,
      margenNetoOptimo,
      utilidadActual,
      utilidadOptima,
      utilidadAdicional,
      mejoraPorcentual: utilidadActual > 0 ? ((utilidadAdicional / utilidadActual) * 100) : 0
    };
  };

  // ========================================
  // ANÁLISIS DE ESCENARIOS Y RECOMENDACIONES
  // ========================================
  const calcularEscenarios = () => {
    if (registros.length === 0) return null;

    const ultimoMes = registros[0];
    const ventaTotal = ultimoMes.venta_total_clp || 0;
    const utilidadNeta = ultimoMes.utilidad_neta_clp || 0;
    const margenNeto = ultimoMes.margen_neto_percent || 0;

    // Escenario 1: ¿Qué pasa si aumento café 20%?
    const escenario1 = {
      nombre: 'Aumentar Café +20%',
      descripcion: 'Incrementar ventas de cafetería',
      ventaNueva: ventaTotal * 1.20,
      utilidadNueva: utilidadNeta + ((ultimoMes.venta_cafe_clp || 0) * 0.20 * MARGENES_REFERENCIA.cafe / 100),
      impacto: '+' + formatChileno((ultimoMes.venta_cafe_clp || 0) * 0.20 * MARGENES_REFERENCIA.cafe / 100)
    };

    // Escenario 2: ¿Qué pasa si aumento hotdesk 20%?
    const escenario2 = {
      nombre: 'Aumentar Hotdesk +20%',
      descripcion: 'Incrementar ventas de coworking',
      ventaNueva: ventaTotal * 1.20,
      utilidadNueva: utilidadNeta + ((ultimoMes.venta_hotdesk_clp || 0) * 0.20 * MARGENES_REFERENCIA.hotdesk / 100),
      impacto: '+' + formatChileno((ultimoMes.venta_hotdesk_clp || 0) * 0.20 * MARGENES_REFERENCIA.hotdesk / 100)
    };

    // Escenario 3: ¿Qué pasa si aumento asesorías 20%?
    const escenario3 = {
      nombre: 'Aumentar Asesorías +20%',
      descripcion: 'Incrementar ventas de asesorías',
      ventaNueva: ventaTotal * 1.20,
      utilidadNueva: utilidadNeta + ((ultimoMes.venta_asesoria_clp || 0) * 0.20 * MARGENES_REFERENCIA.asesorias / 100),
      impacto: '+' + formatChileno((ultimoMes.venta_asesoria_clp || 0) * 0.20 * MARGENES_REFERENCIA.asesorias / 100)
    };

    // Determinar cuál escenario genera más utilidad
    const escenarios = [escenario1, escenario2, escenario3];
    const mejorEscenario = escenarios.reduce((prev, current) => 
      (current.utilidadNueva > prev.utilidadNueva) ? current : prev
    );

    // Recomendaciones CFO
    const recomendaciones = [];

    if (margenNeto < 30) {
      recomendaciones.push({
        tipo: 'crítico',
        titulo: '🚨 Margen Neto Bajo 30%',
        descripcion: `Margen actual: ${margenNeto.toFixed(1)}%. URGENTE: Revisar costos operativos y mix de productos.`,
        accion: 'Reducir costos fijos o aumentar líneas de alto margen (Hotdesk, Asesorías)'
      });
    }

    if ((ultimoMes.venta_cafe_clp || 0) / ventaTotal > 0.60) {
      recomendaciones.push({
        tipo: 'advertencia',
        titulo: '⚠️ Dependencia Alta de Cafetería',
        descripcion: 'Más del 60% de ingresos vienen de cafetería (margen 68%)',
        accion: 'Diversificar hacia Hotdesk (92.5% margen) y Asesorías (100% margen)'
      });
    }

    if (metricas.revpsm_promedio < 250000) {
      recomendaciones.push({
        tipo: 'oportunidad',
        titulo: '💡 RevPSM Bajo Benchmark',
        descripcion: `RevPSM actual: $${formatChileno(metricas.revpsm_promedio)}/m²/mes. Benchmark medio: $250.000`,
        accion: 'Optimizar uso del espacio: más eventos, más hotdesks, horarios extendidos'
      });
    }

    if ((ultimoMes.venta_hotdesk_clp || 0) / ventaTotal < 0.30) {
      recomendaciones.push({
        tipo: 'oportunidad',
        titulo: '🎯 Potencial Hotdesk Subexplotado',
        descripcion: 'Hotdesk representa menos del 30% pero tiene margen 92.5%',
        accion: 'Incrementar marketing de coworking, planes mensuales, eventos networking'
      });
    }

    return {
      escenarios,
      mejorEscenario,
      recomendaciones
    };
  };

  const analisisMargenes = calcularAnalisisMargenes();
  const analisisRevPSM = calcularAnalisisRevPSM();
  const analisisMix = calcularMixOptimo();
  const analisisEscenarios = calcularEscenarios();

  if (registros.length === 0) {
    return (
      <Alert className="border-amber-500 bg-amber-50">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Sin datos para análisis</AlertTitle>
        <AlertDescription>
          Importa datos mensuales desde la tab "Datos" para ver análisis financiero avanzado.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-2 border-indigo-500 bg-gradient-to-r from-indigo-50 to-purple-50">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <BarChart3 className="h-7 w-7 text-indigo-600" />
            🎯 Análisis Estratégico CFO
          </CardTitle>
          <CardDescription className="text-base">
            Análisis financiero profundo por línea de negocio, RevPSM, mix óptimo y escenarios de crecimiento
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Selector de tipo de análisis */}
      <Tabs value={tipoAnalisis} onValueChange={(v) => setTipoAnalisis(v as any)} className="w-full">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="margenes" className="flex items-center gap-2">
            <Percent className="h-4 w-4" />
            Márgenes
          </TabsTrigger>
          <TabsTrigger value="revpsm" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            RevPSM
          </TabsTrigger>
          <TabsTrigger value="mix" className="flex items-center gap-2">
            <Scale className="h-4 w-4" />
            Mix Óptimo
          </TabsTrigger>
          <TabsTrigger value="escenarios" className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            Escenarios
          </TabsTrigger>
        </TabsList>

        {/* ==================== ANÁLISIS DE MÁRGENES ==================== */}
        <TabsContent value="margenes" className="space-y-6">
          {analisisMargenes && (
            <>
              {/* Resumen de márgenes */}
              <Card className="border-2 border-green-300">
                <CardHeader className="bg-green-50">
                  <CardTitle className="flex items-center gap-2">
                    <Percent className="h-5 w-5 text-green-600" />
                    Análisis de Márgenes por Línea de Negocio
                  </CardTitle>
                  <CardDescription>
                    Comparación entre márgenes teóricos y margen neto real
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  {/* KPIs principales */}
                  <div className="grid grid-cols-3 gap-4">
                    <Card className="border-blue-200">
                      <CardHeader className="pb-2">
                        <CardDescription>Margen Neto Real</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold text-blue-600">
                          {analisisMargenes.margenNetoReal.toFixed(1)}%
                        </div>
                        <Badge className={`mt-2 ${analisisMargenes.margenNetoReal >= 30 ? 'bg-green-500' : 'bg-red-500'}`}>
                          {analisisMargenes.margenNetoReal >= 30 ? 'Saludable' : 'Crítico'}
                        </Badge>
                      </CardContent>
                    </Card>

                    <Card className="border-purple-200">
                      <CardHeader className="pb-2">
                        <CardDescription>Margen Ponderado Teórico</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold text-purple-600">
                          {analisisMargenes.margenPonderadoTeorico.toFixed(1)}%
                        </div>
                        <p className="text-xs text-gray-600 mt-2">
                          Basado en mix actual de ventas
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="border-orange-200">
                      <CardHeader className="pb-2">
                        <CardDescription>Desviación vs Teórico</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className={`text-3xl font-bold ${analisisMargenes.desviacionMargen > 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {Math.abs(analisisMargenes.desviacionMargen).toFixed(1)}%
                        </div>
                        <Badge className={`mt-2 ${analisisMargenes.desviacionMargen <= 5 ? 'bg-green-500' : 'bg-orange-500'}`}>
                          {analisisMargenes.desviacionMargen <= 5 ? 'Alineado' : 'Revisar costos'}
                        </Badge>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Análisis por línea */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Detalle por Línea de Negocio</h3>
                    {analisisMargenes.lineas.map((linea) => {
                      const Icon = linea.icon;
                      const colorClasses = {
                        orange: { bg: 'bg-orange-50', border: 'border-orange-300', text: 'text-orange-600', badge: 'bg-orange-500' },
                        blue: { bg: 'bg-blue-50', border: 'border-blue-300', text: 'text-blue-600', badge: 'bg-blue-500' },
                        purple: { bg: 'bg-purple-50', border: 'border-purple-300', text: 'text-purple-600', badge: 'bg-purple-500' }
                      }[linea.color];

                      return (
                        <Card key={linea.nombre} className={`border-2 ${colorClasses.border}`}>
                          <CardContent className="pt-6">
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-3">
                                <div className={`p-3 rounded-lg ${colorClasses.bg}`}>
                                  <Icon className={`h-6 w-6 ${colorClasses.text}`} />
                                </div>
                                <div>
                                  <h4 className="font-semibold text-lg">{linea.nombre}</h4>
                                  <p className="text-sm text-gray-600">Venta: ${formatChileno(linea.venta)}</p>
                                </div>
                              </div>
                              <Badge className={colorClasses.badge}>
                                Margen: {linea.margenTeorico}%
                              </Badge>
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">Participación en venta total</span>
                                <span className="font-semibold">{linea.participacion.toFixed(1)}%</span>
                              </div>
                              <Progress value={linea.participacion} className="h-3" />
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>

                  {/* Alerta si desviación es alta */}
                  {analisisMargenes.desviacionMargen > 10 && (
                    <Alert className="border-red-500 bg-red-50">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      <AlertTitle className="text-red-900">⚠️ Desviación Alta de Márgenes</AlertTitle>
                      <AlertDescription className="text-red-800">
                        <p className="mb-2">
                          El margen neto real ({analisisMargenes.margenNetoReal.toFixed(1)}%) está {analisisMargenes.desviacionMargen.toFixed(1)}% por debajo del margen ponderado teórico ({analisisMargenes.margenPonderadoTeorico.toFixed(1)}%).
                        </p>
                        <p className="font-semibold">Posibles causas:</p>
                        <ul className="list-disc list-inside ml-2 mt-1 space-y-1">
                          <li>Costos fijos superiores a los estimados</li>
                          <li>Mermas o desperdicios en cafetería</li>
                          <li>Costos laborales no contemplados</li>
                          <li>Gastos operativos variables altos</li>
                        </ul>
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* ==================== ANÁLISIS RevPSM ==================== */}
        <TabsContent value="revpsm" className="space-y-6">
          {analisisRevPSM && (
            <>
              <Card className="border-2 border-cyan-300">
                <CardHeader className="bg-cyan-50">
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-cyan-600" />
                    Análisis de Revenue por m² (RevPSM)
                  </CardTitle>
                  <CardDescription>
                    Comparación con benchmarks de retail y análisis por línea
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  {/* KPI principal */}
                  <div className="text-center p-6 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-lg border-2 border-cyan-200">
                    <p className="text-sm text-gray-600 mb-2">RevPSM Promedio Mensual</p>
                    <div className={`text-5xl font-bold ${revPSMColorMap[analisisRevPSM.color]?.text ?? 'text-gray-600'} mb-2`}>
                      ${formatChileno(analisisRevPSM.promedioMensual)}
                    </div>
                    <Badge className={`${revPSMColorMap[analisisRevPSM.color]?.badge ?? 'bg-gray-500'} text-white text-lg px-4 py-1`}>
                      {analisisRevPSM.clasificacion}
                    </Badge>
                    <p className="text-sm text-gray-600 mt-3">
                      Proyección anual: ${formatChileno(analisisRevPSM.promedioAnual)} / m² / año
                    </p>
                  </div>

                  {/* Benchmarks */}
                  <div className="space-y-3">
                    <h3 className="font-semibold text-lg">Benchmarks Retail Chile</h3>
                    {[
                      { nombre: 'Retail Básico', valor: analisisRevPSM.benchmarks.bajo, color: 'red' },
                      { nombre: 'Retail Medio', valor: analisisRevPSM.benchmarks.medio, color: 'yellow' },
                      { nombre: 'Retail Premium', valor: analisisRevPSM.benchmarks.alto, color: 'green' },
                      { nombre: 'Retail Top', valor: analisisRevPSM.benchmarks.excelente, color: 'emerald' }
                    ].map((benchmark) => {
                      const superado = analisisRevPSM.promedioMensual >= benchmark.valor;
                      return (
                        <div key={benchmark.nombre} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                          <div className="flex items-center gap-3">
                            {superado ? (
                              <CheckCircle2 className="h-5 w-5 text-green-600" />
                            ) : (
                              <XCircle className="h-5 w-5 text-gray-400" />
                            )}
                            <span className={superado ? 'font-semibold' : ''}>{benchmark.nombre}</span>
                          </div>
                          <span className="font-mono">${formatChileno(benchmark.valor)}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* RevPSM por línea */}
                  <div className="space-y-3">
                    <h3 className="font-semibold text-lg">RevPSM por Línea de Negocio</h3>
                    {analisisRevPSM.lineasRevPSM.map((linea) => {
                      const colorClasses = {
                        orange: 'border-orange-300 bg-orange-50',
                        blue: 'border-blue-300 bg-blue-50',
                        purple: 'border-purple-300 bg-purple-50'
                      }[linea.color];

                      return (
                        <Card key={linea.nombre} className={`border-2 ${colorClasses}`}>
                          <CardContent className="pt-4">
                            <div className="flex items-center justify-between">
                              <span className="font-semibold">{linea.nombre}</span>
                              <span className="text-xl font-bold">${formatChileno(linea.revpsm)}/m²</span>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>

                  {/* Recomendación */}
                  {analisisRevPSM.promedioMensual < analisisRevPSM.benchmarks.medio && (
                    <Alert className="border-orange-500 bg-orange-50">
                      <Lightbulb className="h-4 w-4 text-orange-600" />
                      <AlertTitle className="text-orange-900">💡 Oportunidad de Mejora</AlertTitle>
                      <AlertDescription className="text-orange-800">
                        <p className="mb-2">
                          Tu RevPSM está por debajo del benchmark medio de retail ({formatChileno(analisisRevPSM.benchmarks.medio)}).
                        </p>
                        <p className="font-semibold">Estrategias para aumentar RevPSM:</p>
                        <ul className="list-disc list-inside ml-2 mt-1 space-y-1">
                          <li>Aumentar participación de líneas de alto margen (Hotdesk, Asesorías)</li>
                          <li>Extender horarios de operación</li>
                          <li>Eventos y activaciones en el local</li>
                          <li>Optimizar layout del espacio</li>
                          <li>Incrementar ticket promedio en cafetería</li>
                        </ul>
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* ==================== MIX ÓPTIMO ==================== */}
        <TabsContent value="mix" className="space-y-6">
          {analisisMix && (
            <>
              <Card className="border-2 border-indigo-300">
                <CardHeader className="bg-indigo-50">
                  <CardTitle className="flex items-center gap-2">
                    <Scale className="h-5 w-5 text-indigo-600" />
                    Mix de Negocio Óptimo
                  </CardTitle>
                  <CardDescription>
                    Comparación entre mix actual y mix óptimo sugerido basado en márgenes
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  {/* Comparación de márgenes */}
                  <div className="grid grid-cols-2 gap-4">
                    <Card className="border-blue-200">
                      <CardHeader className="pb-2">
                        <CardDescription>Margen Neto Actual</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="text-4xl font-bold text-blue-600">
                          {analisisMix.margenNetoActual.toFixed(1)}%
                        </div>
                        <p className="text-sm text-gray-600 mt-2">Con mix actual</p>
                      </CardContent>
                    </Card>

                    <Card className="border-green-200 bg-green-50">
                      <CardHeader className="pb-2">
                        <CardDescription>Margen Neto Óptimo</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="text-4xl font-bold text-green-600">
                          {analisisMix.margenNetoOptimo.toFixed(1)}%
                        </div>
                        <div className="flex items-center gap-1 mt-2">
                          <TrendingUp className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-semibold text-green-600">
                            +{(analisisMix.margenNetoOptimo - analisisMix.margenNetoActual).toFixed(1)}%
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Utilidad adicional */}
                  {analisisMix.utilidadAdicional > 0 && (
                    <Alert className="border-green-500 bg-green-50">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <AlertTitle className="text-green-900">💰 Potencial de Utilidad Adicional</AlertTitle>
                      <AlertDescription className="text-green-800">
                        <p className="text-lg font-bold mb-2">
                          ${formatChileno(analisisMix.utilidadAdicional)} CLP adicionales por mes
                        </p>
                        <p>
                          Al optimizar el mix de productos hacia líneas de mayor margen, podrías aumentar la utilidad en <strong>{analisisMix.mejoraPorcentual.toFixed(1)}%</strong> manteniendo el mismo volumen de ventas.
                        </p>
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Gráfico comparativo */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Comparación Mix Actual vs Óptimo</h3>
                    
                    {/* Mix Actual */}
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Mix Actual</p>
                      <div className="space-y-2">
                        <div>
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span>☕ Cafetería (68% margen)</span>
                            <span className="font-semibold">{analisisMix.mixActual.cafe.toFixed(1)}%</span>
                          </div>
                          <Progress value={analisisMix.mixActual.cafe} className="h-3 bg-orange-200" />
                        </div>
                        <div>
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span>💻 Hotdesk (92.5% margen)</span>
                            <span className="font-semibold">{analisisMix.mixActual.hotdesk.toFixed(1)}%</span>
                          </div>
                          <Progress value={analisisMix.mixActual.hotdesk} className="h-3 bg-blue-200" />
                        </div>
                        <div>
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span>💼 Asesorías (100% margen)</span>
                            <span className="font-semibold">{analisisMix.mixActual.asesorias.toFixed(1)}%</span>
                          </div>
                          <Progress value={analisisMix.mixActual.asesorias} className="h-3 bg-purple-200" />
                        </div>
                      </div>
                    </div>

                    {/* Mix Óptimo */}
                    <div className="p-4 bg-green-50 rounded-lg border-2 border-green-200">
                      <p className="text-sm font-semibold text-green-900 mb-2">✨ Mix Óptimo Sugerido</p>
                      <div className="space-y-2">
                        <div>
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span>☕ Cafetería</span>
                            <span className="font-semibold">{analisisMix.mixOptimo.cafe}%</span>
                          </div>
                          <Progress value={analisisMix.mixOptimo.cafe} className="h-3 bg-orange-400" />
                        </div>
                        <div>
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span>💻 Hotdesk</span>
                            <span className="font-semibold">{analisisMix.mixOptimo.hotdesk}%</span>
                          </div>
                          <Progress value={analisisMix.mixOptimo.hotdesk} className="h-3 bg-blue-400" />
                        </div>
                        <div>
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span>💼 Asesorías</span>
                            <span className="font-semibold">{analisisMix.mixOptimo.asesorias}%</span>
                          </div>
                          <Progress value={analisisMix.mixOptimo.asesorias} className="h-3 bg-purple-400" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Plan de acción */}
                  <Alert className="border-indigo-500 bg-indigo-50">
                    <Target className="h-4 w-4 text-indigo-600" />
                    <AlertTitle className="text-indigo-900">🎯 Plan de Acción para Optimizar Mix</AlertTitle>
                    <AlertDescription className="text-indigo-800">
                      <ol className="list-decimal list-inside space-y-2 mt-2">
                        <li><strong>Reducir dependencia de cafetería:</strong> Mantén calidad pero reduce promociones agresivas</li>
                        <li><strong>Aumentar Hotdesk:</strong> Marketing de coworking, planes mensuales atractivos, eventos</li>
                        <li><strong>Potenciar asesorías:</strong> Ofrecer consultoría empresarial, talleres, mentorías</li>
                        <li><strong>Medir impacto:</strong> Revisar mix mensualmente y ajustar estrategia</li>
                      </ol>
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* ==================== ESCENARIOS ==================== */}
        <TabsContent value="escenarios" className="space-y-6">
          {analisisEscenarios && (
            <>
              {/* Recomendaciones CFO */}
              {analisisEscenarios.recomendaciones.length > 0 && (
                <Card className="border-2 border-red-300 bg-red-50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-red-900">
                      <AlertTriangle className="h-5 w-5" />
                      🚨 Recomendaciones Críticas del CFO
                    </CardTitle>
                    <CardDescription className="text-red-700">
                      Acciones prioritarias basadas en análisis financiero
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {analisisEscenarios.recomendaciones.map((rec) => (
                      <Alert 
                        key={rec.titulo} 
                        className={`border-2 ${
                          rec.tipo === 'crítico' ? 'border-red-500 bg-red-100' :
                          rec.tipo === 'advertencia' ? 'border-orange-500 bg-orange-100' :
                          'border-blue-500 bg-blue-100'
                        }`}
                      >
                        <AlertTitle className="font-bold">{rec.titulo}</AlertTitle>
                        <AlertDescription className="space-y-2">
                          <p>{rec.descripcion}</p>
                          <div className="p-3 bg-white rounded border-2 border-dashed border-gray-300 mt-2">
                            <p className="font-semibold text-sm">✅ Acción recomendada:</p>
                            <p className="text-sm mt-1">{rec.accion}</p>
                          </div>
                        </AlertDescription>
                      </Alert>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Escenarios de crecimiento */}
              <Card className="border-2 border-purple-300">
                <CardHeader className="bg-purple-50">
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-purple-600" />
                    Simulación de Escenarios de Crecimiento
                  </CardTitle>
                  <CardDescription>
                    ¿Qué pasa si aumento cada línea de negocio en +20%?
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  {analisisEscenarios.escenarios.map((escenario) => {
                    const esMejor = escenario.nombre === analisisEscenarios.mejorEscenario.nombre;
                    return (
                      <Card 
                        key={escenario.nombre} 
                        className={`border-2 ${esMejor ? 'border-green-400 bg-green-50' : 'border-gray-200'}`}
                      >
                        <CardContent className="pt-4">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <h4 className="font-semibold text-lg">{escenario.nombre}</h4>
                              <p className="text-sm text-gray-600">{escenario.descripcion}</p>
                            </div>
                            {esMejor && (
                              <Badge className="bg-green-500 text-white">
                                ⭐ Mejor Escenario
                              </Badge>
                            )}
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs text-gray-600">Utilidad Adicional</p>
                              <p className="text-2xl font-bold text-green-600">${escenario.impacto}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-600">Nueva Utilidad Total</p>
                              <p className="text-2xl font-bold text-blue-600">${formatChileno(escenario.utilidadNueva)}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </CardContent>
              </Card>

              {/* Insight estratégico */}
              <Alert className="border-indigo-500 bg-indigo-50">
                <Zap className="h-4 w-4 text-indigo-600" />
                <AlertTitle className="text-indigo-900">⚡ Insight Estratégico</AlertTitle>
                <AlertDescription className="text-indigo-800">
                  <p className="mb-2">
                    El mejor escenario de crecimiento es: <strong className="text-lg">{analisisEscenarios.mejorEscenario.nombre}</strong>
                  </p>
                  <p className="bg-white p-3 rounded border-2 border-indigo-200 font-semibold">
                    💰 Genera ${analisisEscenarios.mejorEscenario.impacto} CLP adicionales con el mismo esfuerzo de crecimiento (+20%)
                  </p>
                  <p className="mt-3 text-sm">
                    <strong>Razón:</strong> Esta línea tiene el margen más alto, por lo que cada peso adicional de venta genera más utilidad neta.
                  </p>
                </AlertDescription>
              </Alert>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}