import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { 
  ShoppingCart, 
  TrendingUp, 
  Users, 
  Package,
  DollarSign,
  BarChart3,
  Link2,
  Zap,
  Target,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Globe,
  Store,
  Truck,
  CreditCard,
  Calendar,
  Clock,
  MapPin,
  Coffee,
  Laptop,
  Briefcase,
  Workflow,
  Database,
  RefreshCw,
  Sparkles,
  Activity,
} from 'lucide-react';

interface Metrica {
  nombre: string;
  descripcion: string;
  formulaCalculo: string;
  fuenteDatos: string;
  impactoFinanciero: 'critico' | 'alto' | 'medio';
  frecuencia: 'tiempo-real' | 'diaria' | 'semanal' | 'mensual';
}

interface Integracion {
  nombre: string;
  icono: any;
  descripcion: string;
  metricas: string[];
  beneficios: string[];
  complejidad: 'baja' | 'media' | 'alta';
  roi: number;
}

interface GapAnalisis {
  titulo: string;
  problemaActual: string;
  impacto: string;
  solucionPropuesta: string;
  prioridad: number;
}

interface OportunidadNegocio {
  titulo: string;
  descripcion: string;
  metricasClave: string[];
  potencialIngreso: string;
  esfuerzo: string;
}

export function IntegracionB2C() {
  // MÉTRICAS B2C CRÍTICAS PARA CFO DASHBOARD
  const metricasB2C: Metrica[] = [
    {
      nombre: 'GMV (Gross Merchandise Value)',
      descripcion: 'Valor bruto total de productos vendidos online',
      formulaCalculo: 'Σ(Precio × Cantidad) por pedido',
      fuenteDatos: 'Plataforma ecommerce → API Ventas',
      impactoFinanciero: 'critico',
      frecuencia: 'tiempo-real'
    },
    {
      nombre: 'Tasa de Conversión Ecommerce',
      descripcion: 'Porcentaje de visitantes que completan compra',
      formulaCalculo: '(Pedidos / Visitantes únicos) × 100',
      fuenteDatos: 'Google Analytics + Checkout',
      impactoFinanciero: 'critico',
      frecuencia: 'diaria'
    },
    {
      nombre: 'AOV (Average Order Value)',
      descripcion: 'Valor promedio por pedido online',
      formulaCalculo: 'GMV / Número de pedidos',
      fuenteDatos: 'Base de datos pedidos',
      impactoFinanciero: 'alto',
      frecuencia: 'diaria'
    },
    {
      nombre: 'CAC (Customer Acquisition Cost)',
      descripcion: 'Costo de adquirir un cliente online',
      formulaCalculo: 'Gasto Marketing Digital / Clientes nuevos',
      fuenteDatos: 'Meta Ads + Google Ads + Analytics',
      impactoFinanciero: 'critico',
      frecuencia: 'semanal'
    },
    {
      nombre: 'LTV (Customer Lifetime Value)',
      descripcion: 'Valor total de un cliente durante su relación',
      formulaCalculo: 'AOV × Frecuencia compra × Tiempo retención',
      fuenteDatos: 'CRM + Historial compras',
      impactoFinanciero: 'critico',
      frecuencia: 'mensual'
    },
    {
      nombre: 'Tasa de Abandono de Carrito',
      descripcion: 'Porcentaje de carritos no completados',
      formulaCalculo: '(Carritos - Pedidos) / Carritos × 100',
      fuenteDatos: 'Sistema checkout',
      impactoFinanciero: 'alto',
      frecuencia: 'diaria'
    },
    {
      nombre: 'Costo de Envío vs Precio Producto',
      descripcion: 'Ratio de costos logísticos vs ventas',
      formulaCalculo: 'Costo Delivery / GMV × 100',
      fuenteDatos: 'Courier API + Base datos',
      impactoFinanciero: 'alto',
      frecuencia: 'semanal'
    },
    {
      nombre: 'Margen Neto Ecommerce',
      descripcion: 'Rentabilidad real del canal online',
      formulaCalculo: '(GMV - COGS - Delivery - Marketing - Fees) / GMV × 100',
      fuenteDatos: 'Dashboard CFO integrado',
      impactoFinanciero: 'critico',
      frecuencia: 'mensual'
    },
    {
      nombre: 'Tráfico Online vs Conversión Presencial',
      descripcion: 'Cuántos visitantes web vienen al local físico',
      formulaCalculo: 'Clientes local con email registrado / Total clientes',
      fuenteDatos: 'POS + Base datos clientes',
      impactoFinanciero: 'medio',
      frecuencia: 'mensual'
    },
    {
      nombre: 'Mix de Productos Online vs Presencial',
      descripcion: 'Diferencias en categorías vendidas por canal',
      formulaCalculo: 'Top 10 productos online vs Top 10 presencial',
      fuenteDatos: 'Analytics ecommerce + POS',
      impactoFinanciero: 'medio',
      frecuencia: 'mensual'
    }
  ];

  // INTEGRACIONES TÉCNICAS PROPUESTAS
  const integracionesPropuestas: Integracion[] = [
    {
      nombre: 'API Ventas Ecommerce → Dashboard',
      icono: ShoppingCart,
      descripcion: 'Sincronización automática de pedidos online hacia métricas del CFO Dashboard',
      metricas: ['GMV', 'AOV', 'Número de pedidos', 'Productos más vendidos'],
      beneficios: [
        'Vista unificada de ingresos online + presencial',
        'Alertas automáticas cuando GMV < meta',
        'Comparación canal online vs canal presencial',
        'Tracking de recovery inversión incluyendo ventas web'
      ],
      complejidad: 'media',
      roi: 9
    },
    {
      nombre: 'Google Analytics 4 Integration',
      icono: Activity,
      descripcion: 'Traer métricas de tráfico, conversión y comportamiento de usuarios',
      metricas: ['Visitantes únicos', 'Tasa de conversión', 'Páginas vistas', 'Fuentes de tráfico'],
      beneficios: [
        'Correlacionar gasto marketing con ventas reales',
        'Calcular ROI de campañas digitales',
        'Identificar productos con alta vista pero baja compra',
        'Optimizar funnel de conversión'
      ],
      complejidad: 'baja',
      roi: 8
    },
    {
      nombre: 'Webhook de Pedidos en Tiempo Real',
      icono: Zap,
      descripcion: 'Notificación instantánea de nuevos pedidos para actualizar métricas',
      metricas: ['Ventas del día en tiempo real', 'Alertas de stock', 'Peak hours online'],
      beneficios: [
        'Dashboard refleja ventas online instantáneamente',
        'Permite decisiones operativas rápidas',
        'Detecta picos de demanda para preparar inventario',
        'Alertas de productos sin stock que generan abandono'
      ],
      complejidad: 'media',
      roi: 7
    },
    {
      nombre: 'CRM/Klaviyo Integration',
      icono: Users,
      descripcion: 'Datos de clientes, segmentación y lifetime value',
      metricas: ['LTV', 'Frecuencia de compra', 'Segmentos de clientes', 'Churn rate'],
      beneficios: [
        'Identificar clientes más rentables',
        'Calcular CAC vs LTV ratio',
        'Campañas personalizadas basadas en data financiera',
        'Retención basada en valor del cliente'
      ],
      complejidad: 'alta',
      roi: 9
    },
    {
      nombre: 'Shopify/WooCommerce API',
      icono: Store,
      descripcion: 'Si usas plataforma ecommerce, integración nativa con sus métricas',
      metricas: ['Inventario', 'Devoluciones', 'Cupones usados', 'Métodos de pago'],
      beneficios: [
        'Sincronización bidireccional de datos',
        'Análisis de efectividad de cupones/descuentos',
        'Tracking de devoluciones que afectan margen',
        'Optimización de métodos de pago'
      ],
      complejidad: 'baja',
      roi: 8
    },
    {
      nombre: 'Meta Ads & Google Ads API',
      icono: Target,
      descripcion: 'Conectar gasto publicitario con ventas generadas',
      metricas: ['ROAS', 'CAC por canal', 'Impresiones', 'CTR'],
      beneficios: [
        'Calcular ROI real de campañas (ventas - gasto ads)',
        'Identificar canales más rentables',
        'Ajustar presupuesto marketing basado en data real',
        'Atribución de ventas a campañas específicas'
      ],
      complejidad: 'media',
      roi: 10
    }
  ];

  // GAP ANÁLISIS: PROBLEMAS ACTUALES SIN INTEGRACIÓN B2C
  const gapsActuales: GapAnalisis[] = [
    {
      titulo: '🚨 Visibilidad Ciega de Canal Online',
      problemaActual: 'El CFO Dashboard actual solo captura ventas presenciales. Si tienes ecommerce, las ventas online NO están siendo contabilizadas en métricas de Utilidad Neta, RevPSM, ni Payback CAPEX.',
      impacto: 'Subestimas ingresos reales en 15-40% dependiendo del volumen ecommerce. Decisiones estratégicas basadas en data incompleta.',
      solucionPropuesta: 'Crear nueva línea de negocio "Ecommerce" (4ta línea) con su propio input mensual de GMV, costos de delivery, marketing y fees de plataforma.',
      prioridad: 1
    },
    {
      titulo: '📊 No Separas Márgenes por Canal',
      problemaActual: 'Cafetería presencial (68% margen) vs Cafetería online (probablemente 45-55% por costos de envío y comisiones) tienen márgenes distintos pero no diferenciados.',
      impacto: 'Piensas que todas las ventas de café generan 68% margen, cuando online puede ser 20% menor. Esto infla proyecciones de utilidad.',
      solucionPropuesta: 'Segregar "Café Presencial" vs "Café Online" en formulario de ingreso con cálculos de margen independientes.',
      prioridad: 1
    },
    {
      titulo: '💰 CAC No Existe en Dashboard Actual',
      problemaActual: 'No hay tracking de costos de adquisición de clientes. En presencial es walk-in gratuito, pero online pagas Meta Ads, Google Ads, influencers.',
      impacto: 'Puedes estar gastando $50.000/mes en ads para generar $30.000 en utilidad neta y no darte cuenta (CAC > LTV).',
      solucionPropuesta: 'Agregar campo "Gasto Marketing Digital" en formulario mensual y calcular CAC, ROAS y LTV:CAC ratio.',
      prioridad: 1
    },
    {
      titulo: '🛒 Abandono de Carrito = Dinero Perdido',
      problemaActual: 'No trackeas cuántos clientes agregan productos pero no finalizan compra. Industria promedio: 70% abandono.',
      impacto: 'Si tienes $500.000 en carritos abandonados/mes, estás dejando ir ~$350.000 mensuales recuperables.',
      solucionPropuesta: 'Widget en Dashboard mostrando "Dinero en carritos abandonados" con botón para activar emails de recuperación automáticos.',
      prioridad: 2
    },
    {
      titulo: '📦 Costos de Delivery Ocultos',
      problemaActual: 'Vendes café a $5.000 online pero delivery cuesta $3.000. Cliente paga delivery pero tu margen se erosiona vs venta presencial.',
      impacto: 'Crees que vendes café con 68% margen pero después de delivery + fees de plataforma puede ser 35% o menos.',
      solucionPropuesta: 'Calcular "Margen Neto Post-Delivery" y mostrar comparación: "Café presencial: $3.400 utilidad vs Café online: $1.800 utilidad".',
      prioridad: 1
    },
    {
      titulo: '🎯 No Atribuyes Ventas Presenciales a Marketing Online',
      problemaActual: 'Cliente ve tu Instagram, visita tu web, pero termina comprando en el local físico. Marketing online generó venta presencial pero no se rastrea.',
      impacto: 'Subestimas ROI de marketing digital. Piensas que ads no funcionan cuando en realidad generan 30-50% de tráfico presencial.',
      solucionPropuesta: 'Implementar QR codes en local + cupones web para trackear conversión online → presencial.',
      prioridad: 3
    },
    {
      titulo: '📈 Stock-Outs en Ecommerce No Afectan Dashboard',
      problemaActual: 'Un producto se agota online y Dashboard no lo refleja. Pierdes ventas sin saberlo.',
      impacto: 'Pérdida de oportunidad de ingresos. Cliente frustrado compra en competencia.',
      solucionPropuesta: 'Alerta automática cuando producto con >20 vistas semanales llega a 0 stock.',
      prioridad: 2
    }
  ];

  // OPORTUNIDADES DE NEGOCIO CON INTEGRACIÓN B2C
  const oportunidadesNegocio: OportunidadNegocio[] = [
    {
      titulo: '🎯 Modelo de Suscripción Café',
      descripcion: 'Ofrecer suscripción mensual de café recurrente con entrega semanal. Predecibilidad de ingresos.',
      metricasClave: ['MRR (Monthly Recurring Revenue)', 'Churn Rate', 'LTV suscriptores'],
      potencialIngreso: '$2-4M CLP/mes con 100 suscriptores pagando $20-40k/mes',
      esfuerzo: 'Medio (configurar suscripciones + logística)'
    },
    {
      titulo: '🚀 Upselling Inteligente',
      descripcion: 'Dashboard identifica clientes con AOV >$15k y sugiere productos premium o bundles automáticamente.',
      metricasClave: ['AOV lift', 'Tasa de aceptación upsell', 'Margen incremental'],
      potencialIngreso: '+15-25% AOV = $300-500k/mes adicional',
      esfuerzo: 'Bajo (lógica de recomendación)'
    },
    {
      titulo: '📱 Click & Collect (Compra Online, Retira en Local)',
      descripcion: 'Elimina costos de delivery mientras capturas clientes online. Mayor margen que delivery.',
      metricasClave: ['% pedidos C&C', 'Margen C&C vs Delivery', 'Compras adicionales en pickup'],
      potencialIngreso: '+10-20% margen en pedidos que cambian de delivery a C&C',
      esfuerzo: 'Bajo (integración POS + notificaciones)'
    },
    {
      titulo: '💼 Productos Digitales (Cursos de Barismo, Masterclasses)',
      descripcion: 'Vender productos digitales con 0% COGS y 100% margen. Monetizar expertise.',
      metricasClave: ['Revenue productos digitales', 'Margen 100%', 'Costo adquisición'],
      potencialIngreso: '$500k-1M/mes con margen 100% (vs 68% café físico)',
      esfuerzo: 'Alto (crear contenido + plataforma)'
    },
    {
      titulo: '🌍 Expansión Geográfica sin Local Físico',
      descripcion: 'Vender café en Concepción, Valparaíso sin abrir local. Solo ecommerce + dark kitchen.',
      metricasClave: ['GMV por región', 'CAC regional', 'Costo logístico por zona'],
      potencialIngreso: '+$2-5M/mes por región nueva',
      esfuerzo: 'Alto (operaciones + marketing localizado)'
    }
  ];

  // PROPUESTA DE DASHBOARD MODIFICADO
  const nuevaArquitectura = {
    nuevaLinea: {
      nombre: '🌐 Ecommerce B2C',
      campos: [
        'GMV Total (Ventas brutas online)',
        'Costo Productos (COGS)',
        'Costo Delivery/Envío',
        'Comisiones Plataforma (Shopify/WooCommerce fees)',
        'Gasto Marketing Digital (Ads)',
        'Devoluciones/Reembolsos',
        'Número de pedidos',
        'Número de visitantes únicos'
      ],
      calculosAutomaticos: [
        'AOV = GMV / Pedidos',
        'Tasa Conversión = Pedidos / Visitantes × 100',
        'CAC = Gasto Marketing / Pedidos',
        'Margen Neto = (GMV - COGS - Delivery - Fees - Marketing) / GMV × 100',
        'RevPSM Virtual = GMV / Metros² Local (atribución)'
      ]
    },
    nuevosKPIs: [
      'GMV vs Ventas Presenciales (% mix)',
      'CAC vs LTV Ratio',
      'ROAS (Return on Ad Spend)',
      'Margen Neto Ecommerce vs Presencial',
      'Abandono de Carrito ($$ perdido)',
      'Payback CAPEX incluyendo ingresos online'
    ]
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-4 py-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-full text-sm font-bold shadow-lg">
            <Globe className="h-4 w-4" />
            INTEGRACIÓN B2C ECOMMERCE
          </div>
          <h1 className="text-4xl font-bold text-gray-900">
            Análisis de Integración: CFO Dashboard + Plataforma B2C
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Propuesta estratégica para unificar <strong>métricas presenciales + online</strong>, 
            capturar <strong>10 métricas B2C críticas</strong> y consolidar visión financiera 360°
          </p>
        </div>

        {/* Executive Alert */}
        <Alert className="border-2 border-red-500 bg-red-50 shadow-xl">
          <AlertTriangle className="h-5 w-5 text-red-600" />
          <AlertTitle className="text-red-900 text-xl font-bold">⚠️ ALERTA CFO: Dashboard Desconectado de Canal Online</AlertTitle>
          <AlertDescription className="text-red-800 space-y-2">
            <p className="text-base font-semibold">
              Tu CFO Dashboard actual solo trackea ventas presenciales. Si vendes online:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li><strong>Subestimas ingresos totales</strong> en 15-40% (ventas web no contabilizadas)</li>
              <li><strong>Margen Neto está inflado</strong> porque no incluyes costos de delivery, ads, fees de plataforma</li>
              <li><strong>Payback CAPEX es más largo</strong> porque no sumas utilidad neta de ecommerce</li>
              <li><strong>No sabes si marketing digital es rentable</strong> (no calculas CAC vs LTV)</li>
            </ul>
            <Badge className="mt-3 bg-red-600 text-white text-sm px-3 py-1">
              Prioridad: CRÍTICA | Impacto: Alto | Solución: 2-4 semanas de desarrollo
            </Badge>
          </AlertDescription>
        </Alert>

        {/* Gap Análisis */}
        <Card className="border-2 border-orange-300 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50">
            <CardTitle className="text-2xl flex items-center gap-2">
              <AlertTriangle className="h-6 w-6 text-orange-600" />
              Gap Análisis: 7 Problemas Críticos sin Integración B2C
            </CardTitle>
            <CardDescription className="text-base">
              Riesgos financieros de operar dashboard presencial + ecommerce sin conexión
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            {gapsActuales.map((gap, idx) => (
              <Card key={idx} className="border-l-4 border-red-500 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-white to-red-50">
                  <div className="flex items-start justify-between gap-4">
                    <CardTitle className="text-lg text-red-900">{gap.titulo}</CardTitle>
                    <Badge className="bg-gradient-to-r from-red-600 to-orange-600 text-white shrink-0">
                      P{gap.prioridad}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-4 space-y-3">
                  <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                    <div className="font-semibold text-red-800 text-sm mb-1">🚨 Problema Actual:</div>
                    <p className="text-sm text-red-700">{gap.problemaActual}</p>
                  </div>
                  <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
                    <div className="font-semibold text-orange-800 text-sm mb-1">💥 Impacto Financiero:</div>
                    <p className="text-sm text-orange-700">{gap.impacto}</p>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                    <div className="font-semibold text-green-800 text-sm mb-1">✅ Solución Propuesta:</div>
                    <p className="text-sm text-green-700">{gap.solucionPropuesta}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>

        {/* Métricas B2C Críticas */}
        <Card className="border-2 border-blue-300 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50">
            <CardTitle className="text-2xl flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-blue-600" />
              10 Métricas B2C que DEBES Integrar al Dashboard
            </CardTitle>
            <CardDescription className="text-base">
              KPIs ecommerce esenciales para visión financiera 360° del negocio
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {metricasB2C.map((metrica, idx) => (
                <Card key={idx} className={`border-l-4 ${
                  metrica.impactoFinanciero === 'critico' ? 'border-red-500 bg-red-50/30' :
                  metrica.impactoFinanciero === 'alto' ? 'border-orange-500 bg-orange-50/30' :
                  'border-yellow-500 bg-yellow-50/30'
                } shadow-md`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-base font-bold text-gray-900">{metrica.nombre}</CardTitle>
                      <Badge className={`text-xs shrink-0 ${
                        metrica.impactoFinanciero === 'critico' ? 'bg-red-600' :
                        metrica.impactoFinanciero === 'alto' ? 'bg-orange-600' :
                        'bg-yellow-600'
                      } text-white`}>
                        {metrica.impactoFinanciero.toUpperCase()}
                      </Badge>
                    </div>
                    <CardDescription className="text-xs">{metrica.descripcion}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2 text-xs">
                    <div className="bg-blue-50 p-2 rounded border border-blue-200">
                      <span className="font-semibold text-blue-900">Cálculo:</span>
                      <code className="block mt-1 text-blue-700 font-mono">{metrica.formulaCalculo}</code>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-gray-600">
                        <Database className="h-3 w-3" />
                        <span className="text-[10px]">{metrica.fuenteDatos}</span>
                      </div>
                      <Badge variant="outline" className="text-[10px]">
                        <Clock className="h-3 w-3 mr-1" />
                        {metrica.frecuencia}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Integraciones Técnicas */}
        <Card className="border-2 border-purple-300 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
            <CardTitle className="text-2xl flex items-center gap-2">
              <Link2 className="h-6 w-6 text-purple-600" />
              6 Integraciones Técnicas Prioritarias
            </CardTitle>
            <CardDescription className="text-base">
              Stack tecnológico para conectar plataforma B2C con CFO Dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            {integracionesPropuestas.map((integracion, idx) => {
              const Icon = integracion.icono;
              return (
                <Card key={idx} className="border-2 border-purple-200 shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-white to-purple-50">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-purple-100 rounded-lg">
                          <Icon className="h-6 w-6 text-purple-600" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{integracion.nombre}</CardTitle>
                          <CardDescription className="text-sm mt-1">{integracion.descripcion}</CardDescription>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1 items-end shrink-0">
                        <Badge className="bg-gradient-to-r from-green-600 to-blue-600 text-white text-sm px-2">
                          ROI: {integracion.roi}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {integracion.complejidad}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                      <div className="font-semibold text-blue-900 mb-2 flex items-center gap-2 text-sm">
                        <BarChart3 className="h-4 w-4" />
                        Métricas Capturadas:
                      </div>
                      <ul className="space-y-1">
                        {integracion.metricas.map((metrica, mIdx) => (
                          <li key={mIdx} className="text-xs text-blue-800 flex items-start gap-1">
                            <CheckCircle2 className="h-3 w-3 text-blue-600 mt-0.5 shrink-0" />
                            <span>{metrica}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                      <div className="font-semibold text-green-900 mb-2 flex items-center gap-2 text-sm">
                        <TrendingUp className="h-4 w-4" />
                        Beneficios:
                      </div>
                      <ul className="space-y-1">
                        {integracion.beneficios.map((beneficio, bIdx) => (
                          <li key={bIdx} className="text-xs text-green-800 flex items-start gap-1">
                            <CheckCircle2 className="h-3 w-3 text-green-600 mt-0.5 shrink-0" />
                            <span>{beneficio}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </CardContent>
        </Card>

        {/* Propuesta de Nueva Arquitectura */}
        <Card className="border-2 border-indigo-300 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50">
            <CardTitle className="text-2xl flex items-center gap-2">
              <Workflow className="h-6 w-6 text-indigo-600" />
              Propuesta: Nueva Arquitectura Dashboard con 4 Líneas de Negocio
            </CardTitle>
            <CardDescription className="text-base">
              Actualización del formulario de ingreso mensual para capturar métricas B2C
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            
            {/* Arquitectura Actual */}
            <div className="bg-gray-50 p-6 rounded-lg border-2 border-gray-300">
              <h3 className="font-bold text-gray-900 text-lg mb-4 flex items-center gap-2">
                <Store className="h-5 w-5" />
                📋 Arquitectura Actual (3 Líneas)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Coffee className="h-5 w-5 text-orange-600" />
                    <h4 className="font-semibold text-gray-900">Cafetería</h4>
                  </div>
                  <Badge className="bg-orange-500 text-white">Margen: 68%</Badge>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Laptop className="h-5 w-5 text-blue-600" />
                    <h4 className="font-semibold text-gray-900">Hotdesk</h4>
                  </div>
                  <Badge className="bg-blue-500 text-white">Margen: 92.5%</Badge>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Briefcase className="h-5 w-5 text-purple-600" />
                    <h4 className="font-semibold text-gray-900">Asesorías</h4>
                  </div>
                  <Badge className="bg-purple-500 text-white">Margen: 100%</Badge>
                </div>
              </div>
            </div>

            {/* Nueva Arquitectura */}
            <div className="bg-gradient-to-br from-cyan-50 to-blue-100 p-6 rounded-lg border-2 border-cyan-400 shadow-lg">
              <h3 className="font-bold text-cyan-900 text-xl mb-4 flex items-center gap-2">
                <Sparkles className="h-6 w-6" />
                ✨ Nueva Arquitectura Propuesta (4 Líneas + Métricas Online)
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-white p-4 rounded-lg border-2 border-orange-300">
                  <div className="flex items-center gap-2 mb-2">
                    <Store className="h-5 w-5 text-orange-600" />
                    <h4 className="font-semibold text-gray-900">Cafetería Presencial</h4>
                  </div>
                  <Badge className="bg-orange-500 text-white mb-2">Margen: 68%</Badge>
                  <p className="text-xs text-gray-600">Sin costos de delivery ni comisiones</p>
                </div>
                
                <div className="bg-white p-4 rounded-lg border-2 border-cyan-400 shadow-md">
                  <div className="flex items-center gap-2 mb-2">
                    <Globe className="h-5 w-5 text-cyan-600" />
                    <h4 className="font-semibold text-cyan-900">🆕 Cafetería Online (B2C)</h4>
                  </div>
                  <Badge className="bg-cyan-600 text-white mb-2">Margen: 45-55%</Badge>
                  <p className="text-xs text-cyan-700">Incluye delivery, ads, fees plataforma</p>
                </div>

                <div className="bg-white p-4 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Laptop className="h-5 w-5 text-blue-600" />
                    <h4 className="font-semibold text-gray-900">Hotdesk</h4>
                  </div>
                  <Badge className="bg-blue-500 text-white">Margen: 92.5%</Badge>
                </div>

                <div className="bg-white p-4 rounded-lg border border-purple-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Briefcase className="h-5 w-5 text-purple-600" />
                    <h4 className="font-semibold text-gray-900">Asesorías</h4>
                  </div>
                  <Badge className="bg-purple-500 text-white">Margen: 100%</Badge>
                </div>
              </div>

              {/* Nuevos Campos */}
              <Card className="border-2 border-cyan-500">
                <CardHeader className="bg-cyan-50">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5 text-cyan-600" />
                    Nuevos Campos de Ingreso - Línea "Ecommerce B2C"
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {nuevaArquitectura.nuevaLinea.campos.map((campo, idx) => (
                      <div key={idx} className="flex items-start gap-2 bg-white p-2 rounded border border-cyan-200">
                        <CheckCircle2 className="h-4 w-4 text-cyan-600 mt-0.5 shrink-0" />
                        <span className="text-sm text-gray-800">{campo}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                      <Activity className="h-4 w-4" />
                      Cálculos Automáticos:
                    </h4>
                    <ul className="space-y-1">
                      {nuevaArquitectura.nuevaLinea.calculosAutomaticos.map((calculo, idx) => (
                        <li key={idx} className="text-sm text-blue-800 font-mono">• {calculo}</li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Nuevos KPIs Dashboard */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg border-2 border-green-300">
              <h3 className="font-bold text-green-900 text-lg mb-4 flex items-center gap-2">
                <Target className="h-5 w-5" />
                🎯 6 Nuevos KPIs en Dashboard Principal
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {nuevaArquitectura.nuevosKPIs.map((kpi, idx) => (
                  <div key={idx} className="bg-white p-3 rounded-lg border border-green-200 shadow-sm">
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                      <span className="text-sm font-semibold text-gray-900">{kpi}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </CardContent>
        </Card>

        {/* Oportunidades de Negocio */}
        <Card className="border-2 border-green-300 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
            <CardTitle className="text-2xl flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-green-600" />
              5 Oportunidades de Negocio con Integración B2C
            </CardTitle>
            <CardDescription className="text-base">
              Nuevas líneas de ingreso habilitadas por visión unificada presencial + online
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            {oportunidadesNegocio.map((opp, idx) => (
              <Card key={idx} className="border-l-4 border-green-500 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-white to-green-50">
                  <CardTitle className="text-lg text-green-900">{opp.titulo}</CardTitle>
                  <CardDescription className="text-sm">{opp.descripcion}</CardDescription>
                </CardHeader>
                <CardContent className="pt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                    <div className="font-semibold text-blue-900 text-xs mb-2">📊 Métricas Clave:</div>
                    <ul className="space-y-1">
                      {opp.metricasClave.map((metrica, mIdx) => (
                        <li key={mIdx} className="text-xs text-blue-800">• {metrica}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                    <div className="font-semibold text-green-900 text-xs mb-2">💰 Potencial:</div>
                    <p className="text-sm text-green-800 font-bold">{opp.potencialIngreso}</p>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                    <div className="font-semibold text-purple-900 text-xs mb-2">⚡ Esfuerzo:</div>
                    <Badge className={`${
                      opp.esfuerzo.includes('Bajo') ? 'bg-green-600' :
                      opp.esfuerzo.includes('Medio') ? 'bg-yellow-600' :
                      'bg-red-600'
                    } text-white`}>
                      {opp.esfuerzo}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>

        {/* Roadmap de Implementación */}
        <Card className="border-2 border-indigo-300 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50">
            <CardTitle className="text-2xl flex items-center gap-2">
              <Calendar className="h-6 w-6 text-indigo-600" />
              Roadmap de Implementación: Dashboard + B2C
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            
            <div className="border-l-4 border-blue-500 pl-4 py-4 bg-blue-50 rounded-r-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="font-bold text-blue-900 text-lg">🔷 Fase 1: Setup Básico (Semana 1-2)</div>
                <Badge className="bg-blue-600 text-white">Prioridad: Alta</Badge>
              </div>
              <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                <li>Agregar 4ta línea "Ecommerce B2C" en formulario ingreso</li>
                <li>Crear campos: GMV, COGS, Delivery, Fees, Marketing</li>
                <li>Calcular margen neto ecommerce separado de presencial</li>
                <li>Widget comparativo: "Presencial vs Online"</li>
              </ul>
              <Progress value={0} className="mt-3 h-2" />
              <p className="text-xs text-blue-600 mt-1">0% completado • Esfuerzo: 12-16 horas</p>
            </div>

            <div className="border-l-4 border-purple-500 pl-4 py-4 bg-purple-50 rounded-r-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="font-bold text-purple-900 text-lg">🔷 Fase 2: Integraciones API (Semana 3-4)</div>
                <Badge className="bg-purple-600 text-white">Prioridad: Alta</Badge>
              </div>
              <ul className="text-sm text-purple-800 space-y-1 list-disc list-inside">
                <li>Conectar API plataforma ecommerce (Shopify/WooCommerce)</li>
                <li>Webhook de pedidos en tiempo real</li>
                <li>Google Analytics 4 integration</li>
                <li>Sincronización automática GMV diario</li>
              </ul>
              <Progress value={0} className="mt-3 h-2" />
              <p className="text-xs text-purple-600 mt-1">0% completado • Esfuerzo: 20-24 horas</p>
            </div>

            <div className="border-l-4 border-green-500 pl-4 py-4 bg-green-50 rounded-r-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="font-bold text-green-900 text-lg">🔷 Fase 3: Métricas Avanzadas (Semana 5-6)</div>
                <Badge className="bg-green-600 text-white">Prioridad: Media</Badge>
              </div>
              <ul className="text-sm text-green-800 space-y-1 list-disc list-inside">
                <li>Calcular CAC, LTV, ROAS automáticamente</li>
                <li>Alertas: CAC &gt; LTV, Abandono carrito &gt; 75%</li>
                <li>Dashboard comparativo margen por canal</li>
                <li>Widget: "Dinero en carritos abandonados"</li>
              </ul>
              <Progress value={0} className="mt-3 h-2" />
              <p className="text-xs text-green-600 mt-1">0% completado • Esfuerzo: 16-20 horas</p>
            </div>

            <div className="border-l-4 border-orange-500 pl-4 py-4 bg-orange-50 rounded-r-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="font-bold text-orange-900 text-lg">🔷 Fase 4: Optimizaciones (Semana 7-8)</div>
                <Badge className="bg-orange-600 text-white">Prioridad: Media-Baja</Badge>
              </div>
              <ul className="text-sm text-orange-800 space-y-1 list-disc list-inside">
                <li>Integrar Meta Ads + Google Ads API</li>
                <li>Atribución multi-canal (online → presencial)</li>
                <li>Análisis de mix de productos por canal</li>
                <li>Forecasting con ML: proyección GMV próximos 3 meses</li>
              </ul>
              <Progress value={0} className="mt-3 h-2" />
              <p className="text-xs text-orange-600 mt-1">0% completado • Esfuerzo: 24-32 horas</p>
            </div>

          </CardContent>
        </Card>

        {/* Call to Action Final */}
        <Card className="border-2 border-cyan-400 bg-gradient-to-br from-cyan-50 to-blue-100 shadow-2xl">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="text-5xl">🚀</div>
              <h2 className="text-3xl font-bold text-cyan-900">Próximos Pasos Recomendados</h2>
              <p className="text-lg text-cyan-800 max-w-2xl mx-auto">
                Para maximizar el ROI de tu plataforma B2C y tener visión financiera completa:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="bg-white p-6 rounded-xl shadow-md border-2 border-cyan-300">
                  <div className="text-3xl mb-3">1️⃣</div>
                  <h3 className="font-bold text-cyan-900 mb-2">Auditar Ecommerce</h3>
                  <p className="text-sm text-gray-700">
                    Revisar tu plataforma B2C actual (Shopify/WooCommerce/custom) e identificar datos disponibles vía API
                  </p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-md border-2 border-purple-300">
                  <div className="text-3xl mb-3">2️⃣</div>
                  <h3 className="font-bold text-purple-900 mb-2">Implementar Fase 1</h3>
                  <p className="text-sm text-gray-700">
                    Agregar 4ta línea de negocio "Ecommerce" al dashboard con ingreso manual de GMV y costos (2 semanas)
                  </p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-md border-2 border-green-300">
                  <div className="text-3xl mb-3">3️⃣</div>
                  <h3 className="font-bold text-green-900 mb-2">Automatizar APIs</h3>
                  <p className="text-sm text-gray-700">
                    Conectar webhooks y sincronización automática para eliminar ingreso manual (4 semanas)
                  </p>
                </div>
              </div>

              <Alert className="mt-6 border-indigo-300 bg-indigo-50 text-left">
                <Zap className="h-5 w-5 text-indigo-600" />
                <AlertTitle className="text-indigo-900 font-bold">💡 Quick Win Inmediato</AlertTitle>
                <AlertDescription className="text-indigo-800">
                  Mientras implementas integraciones, <strong>empieza HOY</strong> registrando manualmente GMV ecommerce 
                  mensual en una hoja auxiliar. Esto te permitirá calcular tu <strong>margen neto real</strong> y detectar 
                  si estás <strong>perdiendo dinero en el canal online</strong> sin darte cuenta.
                </AlertDescription>
              </Alert>

              <div className="pt-4 text-sm text-gray-600">
                <p>
                  <strong>Tiempo total de implementación:</strong> 8-12 semanas • 
                  <strong> Esfuerzo:</strong> 72-92 horas de desarrollo • 
                  <strong> ROI esperado:</strong> 300-500%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <Card className="border-cyan-200">
          <CardContent className="pt-6">
            <div className="text-center text-sm text-gray-600 space-y-2">
              <p className="font-semibold text-gray-800">🎯 Análisis de Integración B2C</p>
              <p>
                Este documento analiza la desconexión entre tu <strong>CFO Dashboard retail presencial</strong> y tu 
                <strong> plataforma B2C ecommerce</strong>, proponiendo arquitectura unificada para visión financiera 360°.
              </p>
              <p className="text-xs text-gray-500 mt-4">
                Análisis realizado: {new Date().toLocaleDateString('es-CL', {dateStyle: 'long'})} | 
                Métricas B2C: 10 | Integraciones: 6 | Oportunidades: 5 | ROI promedio: 8.5/10
              </p>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}