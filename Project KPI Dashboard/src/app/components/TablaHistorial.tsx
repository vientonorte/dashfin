import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { 
  TrendingUp, 
  BarChart3,
  Trash2,
  Zap,
  Calendar,
  History,
  Database,
  AlertCircle,
  Upload
} from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from './ui/alert-dialog';
import { useDashboard } from '../contexts/DashboardContext';
import type { DatoDiario } from '../contexts/DashboardContext';

const CAPEX_TOTAL = 37697000;
const DERECHO_LLAVES = 18900000;
const METROS_CUADRADOS = 25;
const UMBRAL_GENIO = 150000;

type VistaType = 'mensual' | 'diario';

// Componente del Selector de Rango (reutilizable)
function SelectorRango({ rangoTemporal, setRangoTemporal }: {
  rangoTemporal: '1M' | '3M' | '6M' | '1A' | 'H';
  setRangoTemporal: (rango: '1M' | '3M' | '6M' | '1A' | 'H') => void;
}) {
  const handleClick = (rango: '1M' | '3M' | '6M' | '1A' | 'H') => {
    console.log('🔵 Cambiando rango a:', rango);
    setRangoTemporal(rango);
  };

  return (
    <div className="flex items-center gap-2">
      <History className="h-3.5 w-3.5 text-gray-500" />
      <span className="text-xs text-gray-500">Rango:</span>
      <div className="flex gap-1">
        <button
          type="button"
          onClick={() => handleClick('1M')}
          className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
            rangoTemporal === '1M'
              ? 'bg-black text-white'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          1M
        </button>
        <button
          type="button"
          onClick={() => handleClick('3M')}
          className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
            rangoTemporal === '3M'
              ? 'bg-black text-white'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          3M
        </button>
        <button
          type="button"
          onClick={() => handleClick('6M')}
          className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
            rangoTemporal === '6M'
              ? 'bg-black text-white'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          6M
        </button>
        <button
          type="button"
          onClick={() => handleClick('1A')}
          className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
            rangoTemporal === '1A'
              ? 'bg-black text-white'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          1A
        </button>
        <button
          type="button"
          onClick={() => handleClick('H')}
          className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors inline-flex items-center gap-1 ${
            rangoTemporal === 'H'
              ? 'bg-black text-white'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          <Calendar className="h-3 w-3" />
          Histórico
        </button>
      </div>
    </div>
  );
}

export function TablaHistorial() {
  const { 
    registros, 
    setRegistros, 
    setRegistroActual,
    rangoTemporal,
    setRangoTemporal,
    registrosFiltrados
  } = useDashboard();

  const [vista, setVista] = useState<VistaType>('mensual');
  const [tipoGrafico, setTipoGrafico] = useState<'margen' | 'roi'>('margen');

  const formatChileno = (num: number): string => {
    return Math.round(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const formatCompact = (num: number): string => {
    if (num >= 1000000) {
      return `$${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `$${(num / 1000).toFixed(0)}K`;
    }
    return `$${formatChileno(num)}`;
  };

  const eliminarRegistro = (date: string) => {
    if (!confirm('¿Estás seguro de eliminar este registro?')) return;
    
    const nuevosRegistros = registros.filter(r => r.date !== date);
    setRegistros(nuevosRegistros);
  };

  const agregarDatosPruebaConDiarios = () => {
    const fechaBase = new Date('2024-01-01');
    const nuevosDatos: any[] = [];
    
    for (let mes = 0; mes < 3; mes++) {
      const fecha = new Date(fechaBase);
      fecha.setMonth(fecha.getMonth() + mes);
      const fechaStr = fecha.toISOString().split('T')[0];
      
      const datosDiarios: DatoDiario[] = [];
      let totalVentaCafe = 0;
      let totalVentaHotdesk = 0;
      let totalVentaAsesorias = 0;
      let totalGastosOperacion = 0;
      
      for (let dia = 1; dia <= 30; dia++) {
        const fechaDia = new Date(fecha);
        fechaDia.setDate(dia);
        const fechaDiaStr = fechaDia.toISOString().split('T')[0];
        
        const ventaCafe = Math.floor(250000 + Math.random() * 150000);
        const ventaHotdesk = Math.floor(100000 + Math.random() * 50000);
        const ventaAsesorias = Math.floor(50000 + Math.random() * 100000);
        const gastoStaff = Math.floor(180000);
        const gastoInsumos = Math.floor(ventaCafe * 0.32);
        
        const ventaTotal = ventaCafe + ventaHotdesk + ventaAsesorias;
        const utilidadNeta = ventaTotal - gastoInsumos - gastoStaff;
        const revpsm = ventaTotal / 25;
        
        datosDiarios.push({
          fecha: fechaDiaStr,
          venta_cafe: ventaCafe,
          venta_hotdesk: ventaHotdesk,
          venta_asesorias: ventaAsesorias,
          gasto_insumos: gastoInsumos,
          gasto_staff_fijo: gastoStaff,
          utilidad_neta: utilidadNeta,
          revpsm: revpsm
        });
        
        totalVentaCafe += ventaCafe;
        totalVentaHotdesk += ventaHotdesk;
        totalVentaAsesorias += ventaAsesorias;
        totalGastosOperacion += (gastoInsumos + gastoStaff);
      }
      
      const ventaTotal = totalVentaCafe + totalVentaHotdesk + totalVentaAsesorias;
      const cogsCafe = totalVentaCafe * 0.32;
      const cogsHotdesk = totalVentaHotdesk * 0.075;
      const cogsTotal = cogsCafe + cogsHotdesk;
      const margenBruto = ventaTotal - cogsTotal;
      const utilidadNeta = margenBruto - totalGastosOperacion;
      const roi = utilidadNeta / CAPEX_TOTAL;
      const status: 'Genio' | 'Figura' = utilidadNeta > UMBRAL_GENIO ? 'Genio' : 'Figura';
      
      const margenCafe = totalVentaCafe - cogsCafe;
      const margenHotdesk = totalVentaHotdesk - cogsHotdesk;
      const margenAsesorias = totalVentaAsesorias;
      
      const lineaDominante: 'cafe' | 'hotdesk' | 'asesoria' = 
        margenCafe >= margenHotdesk && margenCafe >= margenAsesorias ? 'cafe' :
        margenHotdesk >= margenCafe && margenHotdesk >= margenAsesorias ? 'hotdesk' : 'asesoria';
      
      nuevosDatos.push({
        id: `qa_${fechaStr}`,
        date: fechaStr,
        venta_cafe_clp: totalVentaCafe,
        cogs_cafe_clp: cogsCafe,
        margen_cafe_clp: margenCafe,
        margen_cafe_percent: (margenCafe / totalVentaCafe) * 100,
        venta_hotdesk_clp: totalVentaHotdesk,
        cogs_hotdesk_clp: cogsHotdesk,
        margen_hotdesk_clp: margenHotdesk,
        margen_hotdesk_percent: (margenHotdesk / totalVentaHotdesk) * 100,
        venta_asesoria_clp: totalVentaAsesorias,
        cogs_asesoria_clp: 0,
        margen_asesoria_clp: margenAsesorias,
        margen_asesoria_percent: 100,
        venta_total_clp: ventaTotal,
        cogs_total_clp: cogsTotal,
        margen_bruto_clp: margenBruto,
        margen_bruto_percent: (margenBruto / ventaTotal) * 100,
        gastos_operacion_clp: totalGastosOperacion,
        utilidad_neta_clp: utilidadNeta,
        margen_neto_percent: (utilidadNeta / ventaTotal) * 100,
        roi: roi,
        roi_mean_30d: 0,
        roi_std_30d: 0,
        revpsm_clp_m2: ventaTotal / METROS_CUADRADOS,
        payback_days: utilidadNeta > 0 ? Math.ceil(DERECHO_LLAVES / utilidadNeta) : null,
        status: status,
        alerta_canibalizacion: margenAsesorias > margenCafe * 0.5 ? '⚠️ Asesorías superan café' : '',
        linea_dominante: lineaDominante,
        nota: `QA - Mes ${mes + 1} con ${datosDiarios.length} días de datos`,
        updated_at: new Date().toISOString(),
        datos_diarios: datosDiarios
      });
    }
    
    const registrosActualizados = [...nuevosDatos, ...registros].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    setRegistros(registrosActualizados);
    alert(`✅ QA: Se agregaron ${nuevosDatos.length} meses con datos diarios (${nuevosDatos.length * 30} días totales)` );
  };

  // Datos para gráficos
  const datosGraficoROI = registrosFiltrados.length >= 2 
    ? registrosFiltrados.map(r => ({
        fecha: new Date(r.date).toLocaleDateString('es-CL', { day: 'numeric', month: 'short' }),
        fechaCompleta: new Date(r.date).toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' }),
        roi: (r.roi * 100).toFixed(4),
        roiNumerico: r.roi * 100,
        media: (r.roi_mean_30d * 100).toFixed(4),
        mediaNumerico: r.roi_mean_30d * 100,
      })).reverse()
    : [];

  const datosGraficoLineas = registrosFiltrados.length > 0
    ? registrosFiltrados.map(r => ({
        fecha: new Date(r.date).toLocaleDateString('es-CL', { month: 'short' }),
        Café: r.margen_cafe_clp,
        Hotdesk: r.margen_hotdesk_clp,
        Asesorías: r.margen_asesoria_clp,
      })).reverse()
    : [];

  // Obtener todos los datos diarios filtrados
  const datosDiariosFiltrados = (() => {
    const todosDatos: Array<DatoDiario & { mes: string }> = [];
    registrosFiltrados.forEach(registro => {
      if (registro.datos_diarios && registro.datos_diarios.length > 0) {
        const mesNombre = new Date(registro.date).toLocaleDateString('es-CL', { month: 'long', year: 'numeric' });
        registro.datos_diarios.forEach(dia => {
          todosDatos.push({ ...dia, mes: mesNombre });
        });
      }
    });
    return todosDatos.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
  })();

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-300 rounded-lg shadow-lg p-3">
          <p className="text-xs font-semibold text-gray-900 mb-2">{payload[0]?.payload?.fechaCompleta}</p>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-600"></div>
              <span className="text-xs text-gray-600">ROI Real:</span>
              <span className="text-xs font-bold text-blue-600">{payload[0]?.payload?.roi}%</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-1 bg-green-500"></div>
              <span className="text-xs text-gray-600">Media (30d):</span>
              <span className="text-xs font-bold text-green-600">{payload[0]?.payload?.media}%</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4">
      {registros.length > 0 && (
        <>
          {/* Gráfico Unificado con Switch (Margen / ROI) */}
          {(datosGraficoLineas.length > 0 || datosGraficoROI.length >= 2) && (
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        {tipoGrafico === 'margen' ? (
                          <BarChart3 className="h-5 w-5 text-blue-600" />
                        ) : (
                          <TrendingUp className="h-5 w-5 text-blue-600" />
                        )}
                        <CardTitle className="text-base font-semibold">
                          {tipoGrafico === 'margen' ? 'Margen por Línea de Negocio' : 'Evolución del ROI'}
                        </CardTitle>
                      </div>
                      <CardDescription className="text-sm">
                        {tipoGrafico === 'margen' 
                          ? 'Comparación de rentabilidad entre Café, Hotdesk y Asesorías'
                          : 'Retorno de inversión mensual vs media móvil 30 días'
                        }
                      </CardDescription>
                    </div>
                    
                    {/* Switch de Tipo de Gráfico */}
                    <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
                      <button
                        onClick={() => setTipoGrafico('margen')}
                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                          tipoGrafico === 'margen'
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        📊 Margen
                      </button>
                      <button
                        onClick={() => setTipoGrafico('roi')}
                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                          tipoGrafico === 'roi'
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                        disabled={datosGraficoROI.length < 2}
                      >
                        📈 ROI
                      </button>
                    </div>
                  </div>
                  <SelectorRango rangoTemporal={rangoTemporal} setRangoTemporal={setRangoTemporal} />
                </div>
              </CardHeader>
              <CardContent>
                {tipoGrafico === 'margen' && datosGraficoLineas.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={datosGraficoLineas}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="fecha" tick={{ fontSize: 11 }} stroke="#6b7280" />
                      <YAxis 
                        tick={{ fontSize: 11 }} 
                        tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`}
                        stroke="#6b7280"
                      />
                      <Tooltip 
                        formatter={(value: any) => `$${formatChileno(value)}`}
                        contentStyle={{ fontSize: '12px', borderRadius: '8px', border: '1px solid #e5e7eb' }}
                      />
                      <Legend wrapperStyle={{ fontSize: '12px' }} />
                      <Bar dataKey="Café" fill="#f97316" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Hotdesk" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Asesorías" fill="#a855f7" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : tipoGrafico === 'roi' && datosGraficoROI.length >= 2 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={datosGraficoROI}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="fecha" tick={{ fontSize: 11 }} stroke="#6b7280" />
                      <YAxis 
                        tick={{ fontSize: 11 }}
                        tickFormatter={(value) => `${Number(value).toFixed(1)}%`}
                        stroke="#6b7280"
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend wrapperStyle={{ fontSize: '12px' }} />
                      <Line type="monotone" dataKey="mediaNumerico" stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" name="Media 30d" dot={false} />
                      <Line type="monotone" dataKey="roiNumerico" stroke="#3b82f6" strokeWidth={3} name="ROI real" dot={{ r: 5, fill: '#3b82f6' }} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-gray-400">
                    <p className="text-sm">Necesitas al menos 2 meses de datos para ver el gráfico ROI</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Selector de Vista (Mensual/Diario) */}
          {registrosFiltrados.length > 0 && (
            <div className="bg-white rounded-lg border p-3">
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">Vista:</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setVista('mensual')}
                    className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                      vista === 'mensual'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    📅 Mensual
                  </button>
                  <button
                    onClick={() => setVista('diario')}
                    className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                      vista === 'diario'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                    }`}
                    disabled={datosDiariosFiltrados.length === 0}
                  >
                    📆 Diario {datosDiariosFiltrados.length === 0 && '(Sin datos)'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* VISTA MENSUAL */}
          {vista === 'mensual' && registrosFiltrados.length > 0 && (
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-4 border-b">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg font-semibold">
                      Historial ({registrosFiltrados.length} {registrosFiltrados.length === 1 ? 'mes' : 'meses'})
                    </CardTitle>
                    <CardDescription className="text-sm text-gray-500 mt-1">
                      Registros mensuales consolidados
                    </CardDescription>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        className="h-9 gap-2 bg-red-600 hover:bg-red-700"
                      >
                        <Database className="h-4 w-4" />
                        Borrar Todo
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                          <AlertCircle className="h-5 w-5 text-red-600" />
                          ¿Borrar Todo el Historial?
                        </AlertDialogTitle>
                        <AlertDialogDescription asChild>
                          <div className="space-y-2">
                            <p>Esta acción eliminará permanentemente:</p>
                            <ul className="list-disc list-inside space-y-1 text-sm">
                              <li><strong>{registros.length} registros mensuales</strong></li>
                              <li>Todos los datos diarios asociados</li>
                              <li>Gráficos históricos de ROI y márgenes</li>
                            </ul>
                            <p className="text-red-600 font-semibold mt-3">
                              ⚠️ Esta acción NO se puede deshacer
                            </p>
                          </div>
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => {
                            setRegistros([]);
                            setRegistroActual(null);
                            alert('✅ Historial completo eliminado');
                          }}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Sí, Borrar Todo
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50 hover:bg-gray-50">
                        <TableHead className="font-medium text-gray-700">Fecha</TableHead>
                        <TableHead className="font-medium">
                          <span className="inline-flex items-center gap-1 text-orange-600">
                            ☕ Café
                          </span>
                        </TableHead>
                        <TableHead className="font-medium">
                          <span className="inline-flex items-center gap-1 text-blue-600">
                            💻 Hotdesk
                          </span>
                        </TableHead>
                        <TableHead className="font-medium">
                          <span className="inline-flex items-center gap-1 text-purple-600">
                            📊 Asesorías
                          </span>
                        </TableHead>
                        <TableHead className="font-medium text-gray-700">Venta Total</TableHead>
                        <TableHead className="font-medium text-green-600">Utilidad Neta</TableHead>
                        <TableHead className="font-medium text-gray-700">Margen %</TableHead>
                        <TableHead className="font-medium text-gray-700">Status</TableHead>
                        <TableHead className="font-medium text-gray-700">ROI</TableHead>
                        <TableHead className="font-medium text-gray-700 text-center">Dominante</TableHead>
                        <TableHead className="w-10"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {registrosFiltrados.map((registro) => (
                        <TableRow key={registro.date} className="hover:bg-gray-50">
                          <TableCell className="py-3 font-medium text-gray-900">
                            {new Date(registro.date).toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </TableCell>
                          <TableCell className="py-3 font-semibold text-orange-600">
                            ${formatChileno(registro.venta_cafe_clp)}
                          </TableCell>
                          <TableCell className="py-3 font-semibold text-blue-600">
                            ${formatChileno(registro.venta_hotdesk_clp)}
                          </TableCell>
                          <TableCell className="py-3 font-semibold text-purple-600">
                            ${formatChileno(registro.venta_asesoria_clp)}
                          </TableCell>
                          <TableCell className="py-3 font-semibold text-gray-900">
                            ${formatChileno(registro.venta_total_clp)}
                          </TableCell>
                          <TableCell className="py-3 font-semibold text-green-600">
                            ${formatChileno(registro.utilidad_neta_clp)}
                          </TableCell>
                          <TableCell className="py-3">
                            <span className={`font-semibold ${registro.margen_neto_percent >= 30 ? 'text-green-600' : 'text-red-600'}`}>
                              {registro.margen_neto_percent.toFixed(1)}%
                            </span>
                          </TableCell>
                          <TableCell className="py-3">
                            <Badge className={`font-medium ${registro.status === 'Genio' ? 'bg-green-500 hover:bg-green-600' : 'bg-yellow-500 hover:bg-yellow-600'}`}>
                              {registro.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="py-3">
                            <span className={`font-semibold ${registro.roi >= 0.1439 ? 'text-blue-600' : 'text-gray-500'}`}>
                              {(registro.roi * 100).toFixed(2)}%
                            </span>
                          </TableCell>
                          <TableCell className="py-3 text-center">
                            <span className="text-xl">
                              {registro.linea_dominante === 'cafe' ? '☕' :
                               registro.linea_dominante === 'hotdesk' ? '💻' : '📊'}
                            </span>
                          </TableCell>
                          <TableCell className="py-3">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 w-7 p-0 hover:bg-red-50"
                              onClick={() => eliminarRegistro(registro.date)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* VISTA DIARIA */}
          {vista === 'diario' && datosDiariosFiltrados.length > 0 && (
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-4 border-b">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-600 rounded-lg p-2">
                    <Calendar className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold">
                      Desglose Diario ({datosDiariosFiltrados.length} días registrados)
                    </CardTitle>
                    <CardDescription className="text-sm text-gray-500 mt-1">
                      Todos los días de los meses con datos CSV importados
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50 hover:bg-gray-50 sticky top-0">
                        <TableHead className="font-medium text-gray-700">Fecha</TableHead>
                        <TableHead className="font-medium text-orange-600">☕ Café</TableHead>
                        <TableHead className="font-medium text-blue-600">💻 Hotdesk</TableHead>
                        <TableHead className="font-medium text-purple-600">📊 Asesorías</TableHead>
                        <TableHead className="font-medium text-gray-700">Staff</TableHead>
                        <TableHead className="font-medium text-green-600">Utilidad</TableHead>
                        <TableHead className="font-medium text-gray-700">RevPSM</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {datosDiariosFiltrados.map((dia) => (
                        <TableRow key={dia.fecha} className="hover:bg-gray-50">
                          <TableCell className="py-2.5 font-medium text-gray-700">
                            {new Date(dia.fecha).toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </TableCell>
                          <TableCell className="py-2.5 font-semibold text-orange-600">
                            ${formatChileno(dia.venta_cafe)}
                          </TableCell>
                          <TableCell className="py-2.5 font-semibold text-blue-600">
                            ${formatChileno(dia.venta_hotdesk)}
                          </TableCell>
                          <TableCell className="py-2.5 font-semibold text-purple-600">
                            ${formatChileno(dia.venta_asesorias)}
                          </TableCell>
                          <TableCell className="py-2.5 text-gray-600">
                            ${formatChileno(dia.gasto_staff_fijo)}
                          </TableCell>
                          <TableCell className="py-2.5 font-semibold text-green-600">
                            ${formatChileno(dia.utilidad_neta)}
                          </TableCell>
                          <TableCell className="py-2.5 text-gray-600">
                            ${formatChileno(dia.revpsm)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Schema Documentation */}
          <Alert className="border-purple-500 bg-purple-50">
            <Zap className="h-4 w-4 text-purple-600" />
            <AlertTitle className="text-sm">Google Sheets Schema - LOG_KPI_TRIPLE</AlertTitle>
            <AlertDescription className="text-xs space-y-2">
              <div className="bg-gray-900 text-green-400 p-3 rounded font-mono text-xs overflow-x-auto">
                <p className="text-white mb-1">Columnas:</p>
                <p>A: date | B: venta_cafe | C: venta_hotdesk | D: venta_asesoria</p>
                <p>E: cogs_cafe (=B*0.32) | F: cogs_hotdesk (=C*0.075) | G: cogs_asesoria (=0)</p>
                <p>H: margen_cafe | I: margen_hotdesk | J: margen_asesoria</p>
                <p>K: venta_total | L: cogs_total | M: margen_bruto</p>
                <p>N: gastos_operacion | O: utilidad_neta | P: margen_neto_%</p>
                <p>Q: revpsm | R: roi | S: status | T: linea_dominante | U: alerta</p>
                <p className="mt-2 text-yellow-400">⚠️ NO usar $ en celdas. Solo números puros.</p>
              </div>
              <p className="font-semibold">Make Scenario:</p>
              <p>1. Webhook con headers activados</p>
              <p>2. Google Sheets - Search Rows (buscar por date en Col A)</p>
              <p>3. Router → Si existe: Update Row | Si no: Add Row</p>
              <p>4. Response 200 OK</p>
            </AlertDescription>
          </Alert>

          {/* 🧪 BOTÓN QA */}
          <Card className="border-2 border-yellow-500 bg-yellow-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                🧪 QA - Generador de Datos de Prueba (Testing)
              </CardTitle>
              <CardDescription className="text-xs">
                Solo para pruebas: Genera 3 meses con 30 días diarios c/u (90 días totales)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={agregarDatosPruebaConDiarios}
                className="w-full bg-yellow-600 hover:bg-yellow-700"
                size="sm"
              >
                <Upload className="mr-2 h-4 w-4" />
                Generar 3 Meses de Prueba (con 30 días c/u)
              </Button>
              <p className="text-xs text-gray-600 mt-2">
                ⚠️ Solo para testing. Usa el importador CSV para datos reales.
              </p>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}