import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { 
  DollarSign, 
  Users, 
  Package, 
  AlertTriangle, 
  Award, 
  CreditCard,
  TrendingUp,
  Coffee,
  Laptop,
  Briefcase,
  ArrowRight,
  BarChart3,
  PieChart,
  Activity,
  Target
} from 'lucide-react';
import { useDashboard } from '../contexts/DashboardContext';

interface ReporteCard {
  id: string;
  titulo: string;
  descripcion: string;
  icono: any;
  color: string;
  bgColor: string;
  borderColor: string;
  categoria: 'ventas' | 'clientes' | 'operaciones' | 'finanzas';
}

const reportesDisponibles: ReporteCard[] = [
  {
    id: 'ventas-mensuales',
    titulo: 'Ventas Mensuales',
    descripcion: 'Reporte detallado de ventas del mes',
    icono: DollarSign,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    categoria: 'ventas'
  },
  {
    id: 'analisis-clientes',
    titulo: 'Análisis de Clientes',
    descripcion: 'Comportamiento y segmentación',
    icono: Users,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    categoria: 'clientes'
  },
  {
    id: 'inventario-rotacion',
    titulo: 'Inventario y Rotación',
    descripcion: 'Estado del inventario y rotación',
    icono: Package,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    categoria: 'operaciones'
  },
  {
    id: 'riesgo-crediticio',
    titulo: 'Riesgo Crediticio',
    descripcion: 'Evaluación de cartera y credibilidad',
    icono: AlertTriangle,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    categoria: 'finanzas'
  },
  {
    id: 'programa-fidelizacion',
    titulo: 'Programa de Fidelización',
    descripcion: 'Métricas de tarjeta RA10',
    icono: Award,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    categoria: 'clientes'
  },
  {
    id: 'transacciones-pos',
    titulo: 'Transacciones POS',
    descripcion: 'Análisis de puntos de venta',
    icono: CreditCard,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200',
    categoria: 'ventas'
  },
  {
    id: 'desempeno-lineas',
    titulo: 'Desempeño por Línea',
    descripcion: 'Café, Hotdesk y Asesorías',
    icono: BarChart3,
    color: 'text-teal-600',
    bgColor: 'bg-teal-50',
    borderColor: 'border-teal-200',
    categoria: 'ventas'
  },
  {
    id: 'margen-contribucion',
    titulo: 'Margen de Contribución',
    descripcion: 'Análisis de márgenes por línea',
    icono: PieChart,
    color: 'text-pink-600',
    bgColor: 'bg-pink-50',
    borderColor: 'border-pink-200',
    categoria: 'finanzas'
  },
  {
    id: 'eficiencia-operacional',
    titulo: 'Eficiencia Operacional',
    descripcion: 'RevPSM y productividad',
    icono: Activity,
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-50',
    borderColor: 'border-cyan-200',
    categoria: 'operaciones'
  },
  {
    id: 'cumplimiento-metas',
    titulo: 'Cumplimiento de Metas',
    descripcion: 'Seguimiento de objetivos por rol',
    icono: Target,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    categoria: 'finanzas'
  }
];

export function ReportesEjecutivos() {
  const { registros, metricas } = useDashboard();

  const formatChileno = (num: number): string => {
    return Math.round(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const handleVerReporte = (reporteId: string) => {
    console.log(`📊 Generando reporte: ${reporteId}`);
    // TODO: Implementar generación de reporte específico
    alert(`Generando reporte: ${reporteId}\n\nEsta funcionalidad se conectará con Google Sheets para generar reportes detallados.`);
  };

  const categoriasConfig = {
    ventas: { nombre: 'Ventas', icono: TrendingUp, color: 'text-blue-600' },
    clientes: { nombre: 'Clientes', icono: Users, color: 'text-purple-600' },
    operaciones: { nombre: 'Operaciones', icono: Coffee, color: 'text-green-600' },
    finanzas: { nombre: 'Finanzas', icono: DollarSign, color: 'text-orange-600' }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">📊 Reportes Ejecutivos</h2>
            <p className="text-blue-100 text-sm">
              Central de reportes CFO para Ratio Irarrázaval • 25 m²
            </p>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs text-blue-100">Registros Cargados</p>
              <p className="text-2xl font-bold">{registros.length}</p>
            </div>
            {metricas && (
              <div className="text-right">
                <p className="text-xs text-blue-100">Total Recuperado</p>
                <p className="text-xl font-bold">${formatChileno(metricas.total_utilidad_neta)}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Métricas Rápidas por Línea de Negocio */}
      {metricas && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Coffee className="h-4 w-4 text-orange-600" />
                Cafetería
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">Venta Total</span>
                  <span className="font-bold text-orange-600">${formatChileno(metricas.total_venta_cafe)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">Margen</span>
                  <span className="font-bold text-orange-600">68%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">% del Total</span>
                  <span className="font-bold text-orange-600">
                    {((metricas.total_venta_cafe / metricas.total_venta) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Laptop className="h-4 w-4 text-blue-600" />
                Hotdesk
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">Venta Total</span>
                  <span className="font-bold text-blue-600">${formatChileno(metricas.total_venta_hotdesk)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">Margen</span>
                  <span className="font-bold text-blue-600">92.5%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">% del Total</span>
                  <span className="font-bold text-blue-600">
                    {((metricas.total_venta_hotdesk / metricas.total_venta) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-purple-600" />
                Asesorías
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">Venta Total</span>
                  <span className="font-bold text-purple-600">${formatChileno(metricas.total_venta_asesoria)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">Margen</span>
                  <span className="font-bold text-purple-600">100%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">% del Total</span>
                  <span className="font-bold text-purple-600">
                    {((metricas.total_venta_asesoria / metricas.total_venta) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Reportes por Categoría */}
      {Object.entries(categoriasConfig).map(([key, config]) => {
        const reportesCategoria = reportesDisponibles.filter(r => r.categoria === key);
        const CategoriaIcono = config.icono;

        return (
          <div key={key}>
            <div className="flex items-center gap-2 mb-4">
              <CategoriaIcono className={`h-5 w-5 ${config.color}`} />
              <h3 className="text-lg font-bold">{config.nombre}</h3>
              <div className="flex-1 h-px bg-gray-200"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {reportesCategoria.map((reporte) => {
                const IconoReporte = reporte.icono;
                return (
                  <Card 
                    key={reporte.id} 
                    className={`${reporte.borderColor} hover:shadow-lg transition-shadow cursor-pointer`}
                  >
                    <CardHeader className={reporte.bgColor}>
                      <CardTitle className="flex items-center gap-2 text-base">
                        <div className={`${reporte.bgColor} p-2 rounded-lg border ${reporte.borderColor}`}>
                          <IconoReporte className={`h-5 w-5 ${reporte.color}`} />
                        </div>
                        <span>{reporte.titulo}</span>
                      </CardTitle>
                      <CardDescription className="text-xs">
                        {reporte.descripcion}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <Button 
                        onClick={() => handleVerReporte(reporte.id)}
                        variant="outline"
                        size="sm"
                        className="w-full group"
                      >
                        Ver reporte
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Estado Sin Datos */}
      {registros.length === 0 && (
        <Card className="border-2 border-dashed border-gray-300">
          <CardContent className="pt-6 pb-6 text-center">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 font-semibold mb-2">
              No hay datos para generar reportes
            </p>
            <p className="text-sm text-gray-500">
              Importa datos usando el importador CSV en la tab "Home" para comenzar
            </p>
          </CardContent>
        </Card>
      )}

      {/* Footer Informativo */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-sm text-blue-900 mb-1">
                💡 Tip: Reportes Automáticos
              </h4>
              <p className="text-xs text-blue-800">
                Estos reportes se pueden configurar para enviarse automáticamente vía webhook a Make.com 
                y sincronizarse con Google Sheets. Los datos se actualizan en tiempo real desde el historial mensual.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
