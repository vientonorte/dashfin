import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Checkbox } from './ui/checkbox';
import { 
  AlertTriangle, 
  CheckCircle2, 
  XCircle,
  Coffee,
  Wifi,
  Zap,
  Users,
  TrendingDown,
  TrendingUp,
  Clock,
  DollarSign,
  ShieldAlert,
  Target,
  Activity,
  AlertOctagon,
  ThumbsUp,
  ThumbsDown,
  Wrench,
  Sparkles,
  Eye,
  BarChart3,
  Send,
  Calendar,
  Sun,
  Sunset,
  Moon,
  CheckSquare,
  Download,
  Loader2
} from 'lucide-react';
import { useDashboard } from '../contexts/DashboardContext';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface EstadoOperativo {
  fecha: string;
  status: 'CRÍTICO' | 'NORMAL' | 'ÓPTIMO';
  maquina_cafe_operativa: boolean;
  limpieza_score: number; // 0-100
  ocupacion_hotdesk: number; // personas
  capacidad_hotdesk: number; // máximo 10
  downtime_minutos: number;
  perdida_estimada_clp: number;
  incidentes: string[];
}

interface TareaChecklist {
  id: string;
  tarea: string;
  completado: boolean;
  critico: boolean;
  rol: 'barista' | 'admin' | 'cfo';
  horario?: 'AM' | 'PM' | 'Cierre' | 'Todo el día';
}

interface ReporteAutomatico {
  tipo: 'AM' | 'PM' | 'Cierre';
  hora: string;
  enviado: boolean;
  timestamp?: string;
}

export function InformeEjecutivo() {
  const { registros, metricas } = useDashboard();
  const [exportandoPDF, setExportandoPDF] = useState(false);
  const [mostrarPreview, setMostrarPreview] = useState(false);
  const [pdfPreviewURL, setPdfPreviewURL] = useState<string | null>(null);
  
  const [estadoActual, setEstadoActual] = useState<EstadoOperativo>({
    fecha: new Date().toISOString().split('T')[0],
    status: 'NORMAL',
    maquina_cafe_operativa: true,
    limpieza_score: 85,
    ocupacion_hotdesk: 6,
    capacidad_hotdesk: 10,
    downtime_minutos: 0,
    perdida_estimada_clp: 0,
    incidentes: []
  });

  const [tareasChecklist, setTareasChecklist] = useState<TareaChecklist[]>([
    { id: '1', tarea: '¿Máquina operativa antes de abrir?', completado: estadoActual.maquina_cafe_operativa, critico: true, rol: 'barista' },
    { id: '2', tarea: 'Barra libre de carteles improvisados', completado: true, critico: false, rol: 'barista' },
    { id: '3', tarea: 'Stock de insumos verificado (leche, café)', completado: true, critico: true, rol: 'barista' },
    { id: '4', tarea: 'Limpieza de barra cada 2 horas', completado: estadoActual.limpieza_score >= 80, critico: false, rol: 'barista' },
    { id: '5', tarea: 'Suelo despejado y libre de basura (c/60min)', completado: estadoActual.limpieza_score >= 70, critico: true, rol: 'admin' },
    { id: '6', tarea: 'Cables canalizados por slots de escritorios', completado: estadoActual.limpieza_score >= 80, critico: false, rol: 'admin' },
    { id: '7', tarea: 'WiFi/Internet funcional (test velocidad)', completado: true, critico: true, rol: 'admin' },
    { id: '8', tarea: 'Enchufes libres y accesibles en Hotdesk', completado: true, critico: false, rol: 'admin' },
    { id: '9', tarea: 'Verificar RevPSM diario vs meta', completado: true, critico: true, rol: 'cfo' },
    { id: '10', tarea: 'Revisar downtime de máquina café', completado: estadoActual.downtime_minutos === 0, critico: true, rol: 'cfo' },
    { id: '11', tarea: 'Ocupación Hotdesk vs capacidad', completado: estadoActual.ocupacion_hotdesk >= 5, critico: false, rol: 'cfo' },
    { id: '12', tarea: 'Enviar reporte a inversores (semanal)', completado: false, critico: false, rol: 'cfo' }
  ]);

  const [reportesAutomaticos, setReportesAutomaticos] = useState<ReporteAutomatico[]>([
    { tipo: 'AM', hora: '08:00', enviado: false },
    { tipo: 'PM', hora: '14:00', enviado: false },
    { tipo: 'Cierre', hora: '18:00', enviado: false }
  ]);

  const formatChileno = (num: number): string => {
    return Math.round(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const calcularPerdidaPorDowntime = (minutos: number): number => {
    // Asumiendo que la línea de café genera $15.000/hora promedio
    const ingresoPorHora = 15000;
    const perdidaPorMinuto = ingresoPorHora / 60;
    return minutos * perdidaPorMinuto;
  };

  const evaluarEstadoOperativo = () => {
    const incidentes: string[] = [];
    let status: 'CRÍTICO' | 'NORMAL' | 'ÓPTIMO' = 'ÓPTIMO';

    // Verificar máquina de café
    if (!estadoActual.maquina_cafe_operativa) {
      incidentes.push('🚨 Máquina de café fuera de servicio');
      status = 'CRÍTICO';
    }

    // Verificar limpieza
    if (estadoActual.limpieza_score < 70) {
      incidentes.push('⚠️ Limpieza por debajo del estándar');
      if (status !== 'CRÍTICO') status = 'NORMAL';
    }

    // Verificar ocupación
    const tasaOcupacion = (estadoActual.ocupacion_hotdesk / estadoActual.capacidad_hotdesk) * 100;
    if (tasaOcupacion < 30) {
      incidentes.push('📉 Ocupación baja (menor al 30%)');
      if (status !== 'CRÍTICO') status = 'NORMAL';
    }

    // Verificar downtime
    if (estadoActual.downtime_minutos > 30) {
      incidentes.push(`⏱️ Downtime acumulado: ${estadoActual.downtime_minutos} minutos`);
      status = 'CRÍTICO';
    }

    const perdida = calcularPerdidaPorDowntime(estadoActual.downtime_minutos);

    setEstadoActual({
      ...estadoActual,
      status,
      incidentes,
      perdida_estimada_clp: perdida
    });

    // Mostrar toast según status
    if (status === 'CRÍTICO') {
      toast.error('Estado Operativo CRÍTICO', {
        description: `${incidentes.length} incidentes detectados. Pérdida estimada: $${formatChileno(perdida)}`
      });
    } else if (status === 'ÓPTIMO') {
      toast.success('Estado Operativo ÓPTIMO', {
        description: 'Todas las operaciones dentro de parámetros normales'
      });
    }
  };

  const blueprintAsIs = [
    {
      elemento: 'Máquina Café',
      riesgo: 'Cartel "Out of Order" (Pérdida L1)',
      status: estadoActual.maquina_cafe_operativa ? 'OK' : 'CRÍTICO',
      impacto: '$450.000/día'
    },
    {
      elemento: 'Suelo / Cables',
      riesgo: 'Riesgo de accidentes, estética degradada',
      status: estadoActual.limpieza_score >= 80 ? 'OK' : 'ALERTA',
      impacto: 'Imagen de marca'
    },
    {
      elemento: 'Hotdesk',
      riesgo: 'Baja ocupación, pérdida de ingresos L2',
      status: estadoActual.ocupacion_hotdesk >= 5 ? 'OK' : 'ALERTA',
      impacto: `$${formatChileno(3200000 * (1 - estadoActual.ocupacion_hotdesk / 10))}/mes`
    },
    {
      elemento: 'Take Away',
      riesgo: 'Barra vacía, sin flujo externo',
      status: 'ALERTA',
      impacto: '15% del flujo calle'
    }
  ];

  const blueprintToBe = [
    {
      elemento: 'Máquina Café',
      objetivo: '100% Up-time (Mantenimiento preventivo)',
      meta: '< 30 min downtime/mes'
    },
    {
      elemento: 'Suelo / Cables',
      objetivo: 'Gestión de cables oculta (Retroid style)',
      meta: 'Score limpieza > 90%'
    },
    {
      elemento: 'Hotdesk',
      objetivo: 'Conectividad 1Gbps garantizada',
      meta: '> 70% ocupación promedio'
    },
    {
      elemento: 'Take Away',
      objetivo: 'Fila activa capturando flujo calle',
      meta: '15% venta total'
    }
  ];

  const calcularDowntimeMensual = (): number => {
    // Simular downtime histórico
    return estadoActual.downtime_minutos * 30; // proyección mensual
  };

  const calcularOcupacionPromedio = (): number => {
    return (estadoActual.ocupacion_hotdesk / estadoActual.capacidad_hotdesk) * 100;
  };

  const calcularNetProfitDaily = (): number => {
    // Venta diaria promedio menos pérdidas
    const ventaDiariaPromedio = metricas.total_venta / (registros.length * 30);
    const perdidaPorDowntime = calcularPerdidaPorDowntime(estadoActual.downtime_minutos);
    return ventaDiariaPromedio - perdidaPorDowntime;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CRÍTICO': return 'red';
      case 'ALERTA': return 'amber';
      case 'OK': return 'green';
      default: return 'gray';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'CRÍTICO': return <XCircle className="h-5 w-5" />;
      case 'ALERTA': return <AlertTriangle className="h-5 w-5" />;
      case 'OK': return <CheckCircle2 className="h-5 w-5" />;
      default: return <Activity className="h-5 w-5" />;
    }
  };

  const handleTareaChecklist = (id: string) => {
    const nuevasTareas = tareasChecklist.map(tarea => {
      if (tarea.id === id) {
        return {
          ...tarea,
          completado: !tarea.completado
        };
      }
      return tarea;
    });
    setTareasChecklist(nuevasTareas);
  };

  const enviarReporteAutomatico = (tipo: 'AM' | 'PM' | 'Cierre') => {
    const nuevoReporte = reportesAutomaticos.map(reporte => {
      if (reporte.tipo === tipo) {
        return {
          ...reporte,
          enviado: true,
          timestamp: new Date().toISOString()
        };
      }
      return reporte;
    });
    setReportesAutomaticos(nuevoReporte);
    toast.success(`Reporte ${tipo} enviado`, {
      description: 'Reporte automático enviado a inversores'
    });
  };

  useEffect(() => {
    // Simular envío de reportes automáticos
    const interval = setInterval(() => {
      const horaActual = new Date().getHours();
      reportesAutomaticos.forEach(reporte => {
        const horaReporte = parseInt(reporte.hora.split(':')[0]);
        if (horaActual === horaReporte && !reporte.enviado) {
          enviarReporteAutomatico(reporte.tipo);
        }
      });
    }, 60000); // Cada minuto para pruebas

    return () => clearInterval(interval);
  }, [reportesAutomaticos]);

  const exportarAPDF = async () => {
    try {
      setExportandoPDF(true);
      toast.loading('Generando PDF...', { id: 'export-pdf' });

      // Obtener el elemento del informe
      const elemento = document.getElementById('informe-ejecutivo-content');
      if (!elemento) {
        toast.error('Error al generar PDF', { id: 'export-pdf' });
        return;
      }

      // Crear style tag temporal ANTES de html2canvas para sobrescribir oklch
      const tempStyle = document.createElement('style');
      tempStyle.id = 'temp-pdf-export-override';
      tempStyle.textContent = `
        #informe-ejecutivo-content {
          --foreground: rgb(37, 37, 37) !important;
          --card-foreground: rgb(37, 37, 37) !important;
          --popover: rgb(255, 255, 255) !important;
          --popover-foreground: rgb(37, 37, 37) !important;
          --primary-foreground: rgb(255, 255, 255) !important;
          --secondary: rgb(242, 242, 247) !important;
          --ring: rgb(180, 180, 180) !important;
          --chart-1: rgb(255, 140, 66) !important;
          --chart-2: rgb(66, 188, 212) !important;
          --chart-3: rgb(59, 82, 139) !important;
          --chart-4: rgb(234, 211, 88) !important;
          --chart-5: rgb(229, 181, 89) !important;
        }
        #informe-ejecutivo-content * {
          border-color: #e5e7eb !important;
        }
      `;
      document.head.appendChild(tempStyle);

      // Esperar que los estilos se apliquen
      await new Promise(resolve => setTimeout(resolve, 100));

      // Generar canvas (ahora sin onclone, los estilos ya están aplicados)
      const canvas = await html2canvas(elemento, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        imageTimeout: 15000,
        removeContainer: true,
      });

      // Remover el style temporal inmediatamente después de la captura
      const styleToRemove = document.getElementById('temp-pdf-export-override');
      if (styleToRemove) {
        styleToRemove.remove();
      }

      // Crear PDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true
      });

      // Agregar metadata al PDF
      const fecha = new Date().toISOString().split('T')[0];
      pdf.setProperties({
        title: `Informe Ejecutivo SOP - ${fecha}`,
        subject: 'Auditoría Operativa CFO Dashboard',
        author: 'CFO Dashboard - Irarrázaval 2100',
        keywords: 'CFO, Análisis, Operaciones, Retail',
        creator: 'CFO Dashboard v2.0'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth - 20; // Márgenes de 10mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 10;

      // Agregar primera página
      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= (pdfHeight - 20); // Restar márgenes

      // Agregar páginas adicionales si es necesario
      while (heightLeft > 0) {
        position = -(pdfHeight - 10);
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      // Generar nombre de archivo con formato YYYY-MM
      const nombreArchivo = `informe-ejecutivo-${new Date().toISOString().slice(0, 7)}.pdf`;

      // Descargar PDF
      pdf.save(nombreArchivo);

      toast.success('✅ PDF descargado exitosamente', { 
        id: 'export-pdf',
        description: `Archivo: ${nombreArchivo}`
      });
    } catch (error) {
      console.error('Error al exportar PDF:', error);
      toast.error('❌ Error al generar PDF. Intente de nuevo.', { 
        id: 'export-pdf'
      });
    } finally {
      setExportandoPDF(false);
    }
  };

  // US-002: Preview PDF antes de descargar
  const generarPreviewPDF = async () => {
    try {
      setExportandoPDF(true);
      toast.loading('Generando preview...', { id: 'preview-pdf' });

      const elemento = document.getElementById('informe-ejecutivo-content');
      if (!elemento) {
        toast.error('Error al generar preview', { id: 'preview-pdf' });
        return;
      }

      // Crear style tag temporal ANTES de html2canvas para sobrescribir oklch
      const tempStyle = document.createElement('style');
      tempStyle.id = 'temp-preview-export-override';
      tempStyle.textContent = `
        #informe-ejecutivo-content {
          --foreground: rgb(37, 37, 37) !important;
          --card-foreground: rgb(37, 37, 37) !important;
          --popover: rgb(255, 255, 255) !important;
          --popover-foreground: rgb(37, 37, 37) !important;
          --primary-foreground: rgb(255, 255, 255) !important;
          --secondary: rgb(242, 242, 247) !important;
          --ring: rgb(180, 180, 180) !important;
          --chart-1: rgb(255, 140, 66) !important;
          --chart-2: rgb(66, 188, 212) !important;
          --chart-3: rgb(59, 82, 139) !important;
          --chart-4: rgb(234, 211, 88) !important;
          --chart-5: rgb(229, 181, 89) !important;
        }
        #informe-ejecutivo-content * {
          border-color: #e5e7eb !important;
        }
      `;
      document.head.appendChild(tempStyle);

      // Esperar que los estilos se apliquen
      await new Promise(resolve => setTimeout(resolve, 100));

      const canvas = await html2canvas(elemento, {
        scale: 1.5,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      // Remover el style temporal inmediatamente después de la captura
      const styleToRemove = document.getElementById('temp-preview-export-override');
      if (styleToRemove) {
        styleToRemove.remove();
      }

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true
      });

      const fecha = new Date().toISOString().split('T')[0];
      pdf.setProperties({
        title: `Informe Ejecutivo SOP - ${fecha}`,
        subject: 'Auditoría Operativa CFO Dashboard',
        author: 'CFO Dashboard - Irarrázaval 2100'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const imgWidth = pdfWidth - 20;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);

      // Generar blob URL para preview
      const pdfBlob = pdf.output('blob');
      const url = URL.createObjectURL(pdfBlob);
      setPdfPreviewURL(url);
      setMostrarPreview(true);

      toast.success('Preview generado', { id: 'preview-pdf' });
    } catch (error) {
      console.error('Error al generar preview:', error);
      toast.error('Error al generar preview', { id: 'preview-pdf' });
    } finally {
      setExportandoPDF(false);
    }
  };

  const descargarDesdePreview = () => {
    if (pdfPreviewURL) {
      const fecha = new Date().toISOString().split('T')[0];
      const a = document.createElement('a');
      a.href = pdfPreviewURL;
      a.download = `informe-ejecutivo-${fecha}.pdf`;
      a.click();
      toast.success('✅ PDF descargado desde preview');
    }
  };

  return (
    <div className="space-y-6">
      {/* Botón de exportar PDF — posicionado en la parte superior */}
      <div className="flex justify-end gap-3">
        <Button
          onClick={generarPreviewPDF}
          size="lg"
          variant="outline"
          className="border-2 border-green-600 text-green-600 hover:bg-green-50"
          disabled={exportandoPDF}
        >
          {exportandoPDF ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Generando...
            </>
          ) : (
            <>
              <Eye className="mr-2 h-5 w-5" />
              👁️ Preview PDF
            </>
          )}
        </Button>

        <Button
          onClick={exportarAPDF}
          size="lg"
          className="bg-green-600 hover:bg-green-700 text-white shadow-lg"
          disabled={exportandoPDF}
        >
          {exportandoPDF ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Generando PDF...
            </>
          ) : (
            <>
              <Download className="mr-2 h-5 w-5" />
              📥 Exportar PDF
            </>
          )}
        </Button>
      </div>

      {/* Contenedor capturado para PDF */}
      <div id="informe-ejecutivo-content">
        {/* Header con Estado Global */}
        <Card className={`border-2 ${
          estadoActual.status === 'CRÍTICO' ? 'border-red-500 bg-red-50' :
          estadoActual.status === 'ÓPTIMO' ? 'border-green-500 bg-green-50' :
          'border-amber-500 bg-amber-50'
        }`}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl flex items-center gap-2">
                  {estadoActual.status === 'CRÍTICO' ? <ShieldAlert className="h-7 w-7 text-red-600" /> :
                   estadoActual.status === 'ÓPTIMO' ? <ThumbsUp className="h-7 w-7 text-green-600" /> :
                   <AlertTriangle className="h-7 w-7 text-amber-600" />}
                  Informe Ejecutivo - Auditoría Operativa
                </CardTitle>
                <CardDescription className="mt-2">
                  Estado: <Badge className={`ml-2 ${
                    estadoActual.status === 'CRÍTICO' ? 'bg-red-600' :
                    estadoActual.status === 'ÓPTIMO' ? 'bg-green-600' :
                    'bg-amber-600'
                  }`}>
                    {estadoActual.status}
                  </Badge>
                </CardDescription>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Protegiendo</p>
                <p className="text-2xl font-bold text-gray-900">$37.697.000</p>
                <p className="text-xs text-gray-500">CAPEX Total</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {estadoActual.incidentes.length > 0 ? (
              <Alert className="border-red-500 bg-red-50">
                <AlertOctagon className="h-4 w-4" />
                <AlertTitle className="text-sm font-bold">Incidentes Detectados</AlertTitle>
                <AlertDescription className="text-xs mt-2">
                  <ul className="list-disc list-inside space-y-1">
                    {estadoActual.incidentes.map((inc, idx) => (
                      <li key={idx}>{inc}</li>
                    ))}
                  </ul>
                  {estadoActual.perdida_estimada_clp > 0 && (
                    <div className="mt-3 p-2 bg-white rounded border-2 border-red-500">
                      <p className="font-bold text-red-900">
                        Pérdida Estimada Hoy: ${formatChileno(estadoActual.perdida_estimada_clp)} CLP
                      </p>
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            ) : (
              <Alert className="border-green-500 bg-green-50">
                <CheckCircle2 className="h-4 w-4" />
                <AlertTitle className="text-sm font-bold">✅ Operaciones Normales</AlertTitle>
                <AlertDescription className="text-xs">
                  Todos los sistemas funcionando dentro de parámetros esperados.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Panel de Control Rápido */}
        <Card className="border-2 border-blue-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-600" />
              Panel de Control Operativo
            </CardTitle>
            <CardDescription>Ajusta parámetros y evalúa el estado actual</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Máquina Café */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold flex items-center gap-2">
                    <Coffee className="h-4 w-4" />
                    Máquina Café
                  </label>
                  <Button
                    size="sm"
                    variant={estadoActual.maquina_cafe_operativa ? "default" : "destructive"}
                    onClick={() => setEstadoActual({
                      ...estadoActual,
                      maquina_cafe_operativa: !estadoActual.maquina_cafe_operativa
                    })}
                  >
                    {estadoActual.maquina_cafe_operativa ? '✓ OK' : '✗ Out of Order'}
                  </Button>
                </div>
              </div>

              {/* Limpieza Score */}
              <div className="space-y-2">
                <label className="text-sm font-semibold flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Limpieza: {estadoActual.limpieza_score}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={estadoActual.limpieza_score}
                  onChange={(e) => setEstadoActual({
                    ...estadoActual,
                    limpieza_score: Number(e.target.value)
                  })}
                  className="w-full"
                />
              </div>

              {/* Ocupación Hotdesk */}
              <div className="space-y-2">
                <label className="text-sm font-semibold flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Hotdesk: {estadoActual.ocupacion_hotdesk}/{estadoActual.capacidad_hotdesk}
                </label>
                <input
                  type="range"
                  min="0"
                  max={estadoActual.capacidad_hotdesk}
                  value={estadoActual.ocupacion_hotdesk}
                  onChange={(e) => setEstadoActual({
                    ...estadoActual,
                    ocupacion_hotdesk: Number(e.target.value)
                  })}
                  className="w-full"
                />
              </div>

              {/* Downtime */}
              <div className="space-y-2">
                <label className="text-sm font-semibold flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Downtime: {estadoActual.downtime_minutos} min
                </label>
                <input
                  type="number"
                  min="0"
                  max="480"
                  value={estadoActual.downtime_minutos}
                  onChange={(e) => setEstadoActual({
                    ...estadoActual,
                    downtime_minutos: Number(e.target.value)
                  })}
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>

            <Button
              onClick={evaluarEstadoOperativo}
              className="w-full bg-blue-600 hover:bg-blue-700"
              size="lg"
            >
              <Eye className="mr-2 h-5 w-5" />
              Evaluar Estado Operativo
            </Button>
          </CardContent>
        </Card>

        {/* Blueprint: As Is vs To Be */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* As Is */}
          <Card className="border-2 border-red-500">
            <CardHeader className="bg-red-50">
              <CardTitle className="flex items-center gap-2 text-red-900">
                <ThumbsDown className="h-5 w-5" />
                "As Is" - Estado Actual (Riesgos)
              </CardTitle>
              <CardDescription>Diagnóstico de problemas operativos</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-3">
                {blueprintAsIs.map((item, idx) => (
                  <div key={idx} className="border rounded-lg p-3 bg-white">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(item.status)}
                        <span className={`text-sm font-bold text-${getStatusColor(item.status)}-700`}>
                          {item.elemento}
                        </span>
                      </div>
                      <Badge className={`bg-${getStatusColor(item.status)}-100 text-${getStatusColor(item.status)}-800 border-${getStatusColor(item.status)}-500`}>
                        {item.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-700 mb-1">{item.riesgo}</p>
                    <p className="text-xs font-bold text-red-600">Impacto: {item.impacto}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* To Be */}
          <Card className="border-2 border-green-500">
            <CardHeader className="bg-green-50">
              <CardTitle className="flex items-center gap-2 text-green-900">
                <ThumbsUp className="h-5 w-5" />
                "To Be" - Estado Deseado (Objetivos)
              </CardTitle>
              <CardDescription>Metas para operación "Genio"</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-3">
                {blueprintToBe.map((item, idx) => (
                  <div key={idx} className="border rounded-lg p-3 bg-white">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-bold text-green-700">{item.elemento}</span>
                    </div>
                    <p className="text-xs text-gray-700 mb-1">{item.objetivo}</p>
                    <p className="text-xs font-bold text-green-600">Meta: {item.meta}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Checklist por Roles */}
        <Card className="border-2 border-purple-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5 text-purple-600" />
              Checklist Operativo por Rol (SOP)
            </CardTitle>
            <CardDescription>
              Tareas críticas para prevenir "Días Malos"
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="barista">
              <TabsList className="grid grid-cols-3">
                <TabsTrigger value="barista">
                  <Coffee className="h-4 w-4 mr-2" />
                  Barista
                </TabsTrigger>
                <TabsTrigger value="admin">
                  <Wrench className="h-4 w-4 mr-2" />
                  Admin Tech
                </TabsTrigger>
                <TabsTrigger value="cfo">
                  <DollarSign className="h-4 w-4 mr-2" />
                  CFO
                </TabsTrigger>
              </TabsList>

              <TabsContent value="barista" className="space-y-2 mt-4">
                {tareasChecklist.filter(tarea => tarea.rol === 'barista').map((item) => (
                  <div
                    key={item.id}
                    className={`flex items-center justify-between p-3 border rounded-lg ${
                      item.completado ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {item.completado ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600" />
                      )}
                      <span className={`text-sm ${item.completado ? 'text-green-900' : 'text-red-900'}`}>
                        {item.tarea}
                      </span>
                    </div>
                    {item.critico && (
                      <Badge variant="destructive" className="text-xs">CRÍTICO</Badge>
                    )}
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="admin" className="space-y-2 mt-4">
                {tareasChecklist.filter(tarea => tarea.rol === 'admin').map((item) => (
                  <div
                    key={item.id}
                    className={`flex items-center justify-between p-3 border rounded-lg ${
                      item.completado ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {item.completado ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600" />
                      )}
                      <span className={`text-sm ${item.completado ? 'text-green-900' : 'text-red-900'}`}>
                        {item.tarea}
                      </span>
                    </div>
                    {item.critico && (
                      <Badge variant="destructive" className="text-xs">CRÍTICO</Badge>
                    )}
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="cfo" className="space-y-2 mt-4">
                {tareasChecklist.filter(tarea => tarea.rol === 'cfo').map((item) => (
                  <div
                    key={item.id}
                    className={`flex items-center justify-between p-3 border rounded-lg ${
                      item.completado ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {item.completado ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600" />
                      )}
                      <span className={`text-sm ${item.completado ? 'text-green-900' : 'text-red-900'}`}>
                        {item.tarea}
                      </span>
                    </div>
                    {item.critico && (
                      <Badge variant="destructive" className="text-xs">CRÍTICO</Badge>
                    )}
                  </div>
                ))}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Reportes Automatizados AM/PM/Cierre */}
        <Card className="border-2 border-cyan-500">
          <CardHeader className="bg-gradient-to-r from-cyan-50 to-blue-50">
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5 text-cyan-600" />
              Reportes Automatizados
            </CardTitle>
            <CardDescription>
              Sistema de envío automático de reportes a inversores
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">{/* ... Reportes AM/PM/Cierre ... */}
              {/* Reporte AM */}
              <Card className={`border-2 ${
                reportesAutomaticos.find(r => r.tipo === 'AM')?.enviado 
                  ? 'border-green-500 bg-green-50' 
                  : 'border-amber-500 bg-amber-50'
              }`}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Sun className="h-4 w-4 text-amber-600" />
                    Reporte AM
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-600">Horario de envío</p>
                    <p className="text-lg font-bold text-gray-900">
                      {reportesAutomaticos.find(r => r.tipo === 'AM')?.hora}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Estado</p>
                    <Badge className={
                      reportesAutomaticos.find(r => r.tipo === 'AM')?.enviado
                        ? 'bg-green-600'
                        : 'bg-amber-600'
                    }>
                      {reportesAutomaticos.find(r => r.tipo === 'AM')?.enviado ? 'Enviado' : 'Pendiente'}
                    </Badge>
                  </div>
                  {reportesAutomaticos.find(r => r.tipo === 'AM')?.timestamp && (
                    <div>
                      <p className="text-xs text-gray-600">Último envío</p>
                      <p className="text-xs font-mono text-gray-700">
                        {new Date(reportesAutomaticos.find(r => r.tipo === 'AM')!.timestamp!).toLocaleString('es-CL')}
                      </p>
                    </div>
                  )}
                  <Button
                    onClick={() => enviarReporteAutomatico('AM')}
                    size="sm"
                    className="w-full"
                    variant={reportesAutomaticos.find(r => r.tipo === 'AM')?.enviado ? 'outline' : 'default'}
                  >
                    <Send className="mr-2 h-3 w-3" />
                    Enviar Ahora
                  </Button>
                </CardContent>
              </Card>

              {/* Reporte PM */}
              <Card className={`border-2 ${
                reportesAutomaticos.find(r => r.tipo === 'PM')?.enviado 
                  ? 'border-green-500 bg-green-50' 
                  : 'border-amber-500 bg-amber-50'
              }`}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Sunset className="h-4 w-4 text-orange-600" />
                    Reporte PM
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-600">Horario de envío</p>
                    <p className="text-lg font-bold text-gray-900">
                      {reportesAutomaticos.find(r => r.tipo === 'PM')?.hora}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Estado</p>
                    <Badge className={
                      reportesAutomaticos.find(r => r.tipo === 'PM')?.enviado
                        ? 'bg-green-600'
                        : 'bg-amber-600'
                    }>
                      {reportesAutomaticos.find(r => r.tipo === 'PM')?.enviado ? 'Enviado' : 'Pendiente'}
                    </Badge>
                  </div>
                  {reportesAutomaticos.find(r => r.tipo === 'PM')?.timestamp && (
                    <div>
                      <p className="text-xs text-gray-600">Último envío</p>
                      <p className="text-xs font-mono text-gray-700">
                        {new Date(reportesAutomaticos.find(r => r.tipo === 'PM')!.timestamp!).toLocaleString('es-CL')}
                      </p>
                    </div>
                  )}
                  <Button
                    onClick={() => enviarReporteAutomatico('PM')}
                    size="sm"
                    className="w-full"
                    variant={reportesAutomaticos.find(r => r.tipo === 'PM')?.enviado ? 'outline' : 'default'}
                  >
                    <Send className="mr-2 h-3 w-3" />
                    Enviar Ahora
                  </Button>
                </CardContent>
              </Card>

              {/* Reporte Cierre */}
              <Card className={`border-2 ${
                reportesAutomaticos.find(r => r.tipo === 'Cierre')?.enviado 
                  ? 'border-green-500 bg-green-50' 
                  : 'border-amber-500 bg-amber-50'
              }`}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Moon className="h-4 w-4 text-indigo-600" />
                    Reporte Cierre
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-600">Horario de envío</p>
                    <p className="text-lg font-bold text-gray-900">
                      {reportesAutomaticos.find(r => r.tipo === 'Cierre')?.hora}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Estado</p>
                    <Badge className={
                      reportesAutomaticos.find(r => r.tipo === 'Cierre')?.enviado
                        ? 'bg-green-600'
                        : 'bg-amber-600'
                    }>
                      {reportesAutomaticos.find(r => r.tipo === 'Cierre')?.enviado ? 'Enviado' : 'Pendiente'}
                    </Badge>
                  </div>
                  {reportesAutomaticos.find(r => r.tipo === 'Cierre')?.timestamp && (
                    <div>
                      <p className="text-xs text-gray-600">Último envío</p>
                      <p className="text-xs font-mono text-gray-700">
                        {new Date(reportesAutomaticos.find(r => r.tipo === 'Cierre')!.timestamp!).toLocaleString('es-CL')}
                      </p>
                    </div>
                  )}
                  <Button
                    onClick={() => enviarReporteAutomatico('Cierre')}
                    size="sm"
                    className="w-full"
                    variant={reportesAutomaticos.find(r => r.tipo === 'Cierre')?.enviado ? 'outline' : 'default'}
                  >
                    <Send className="mr-2 h-3 w-3" />
                    Enviar Ahora
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Información de automatización */}
            <Alert className="border-cyan-500 bg-cyan-50">
              <Calendar className="h-4 w-4" />
              <AlertTitle className="text-sm font-bold">🤖 Automatización Activa</AlertTitle>
              <AlertDescription className="text-xs space-y-1 mt-2">
                <p>✓ Los reportes se envían automáticamente a los horarios configurados</p>
                <p>✓ Cada reporte incluye: Estado operativo, métricas críticas, checklist completado</p>
                <p>✓ Integración con Make.com para envío a inversores vía email/Slack</p>
                <p className="font-semibold text-cyan-900 mt-2">
                  💡 También puedes enviar reportes manualmente usando los botones "Enviar Ahora"
                </p>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Métricas para Inversores */}
        <Card className="border-2 border-indigo-500">
          <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-indigo-600" />
              Métricas Críticas para Inversores
            </CardTitle>
            <CardDescription>
              Dashboard dinámico para prevenir "Días Malos"
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Downtime de Máquina */}
              <Card className="border-amber-500">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Clock className="h-4 w-4 text-amber-600" />
                    Downtime Café
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-amber-700">
                    {estadoActual.downtime_minutos} min
                  </div>
                  <p className="text-xs text-gray-600 mt-1">Hoy</p>
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-xs text-gray-600">Proyección Mensual</p>
                    <p className="text-lg font-bold text-gray-900">
                      {calcularDowntimeMensual()} min
                    </p>
                    <p className="text-xs text-red-600 font-semibold">
                      Meta: {'<'} 30 min/mes
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Ocupación Real vs Capacidad */}
              <Card className="border-blue-500">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Users className="h-4 w-4 text-blue-600" />
                    Ocupación Hotdesk
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-700">
                    {calcularOcupacionPromedio().toFixed(0)}%
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    {estadoActual.ocupacion_hotdesk} de {estadoActual.capacidad_hotdesk} puestos
                  </p>
                  <Progress 
                    value={calcularOcupacionPromedio()} 
                    className="mt-3 h-2"
                  />
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-xs text-gray-600">Ingresos Potenciales</p>
                    <p className="text-lg font-bold text-gray-900">
                      ${formatChileno(3200000 * (estadoActual.ocupacion_hotdesk / 10))}
                    </p>
                    <p className="text-xs text-green-600 font-semibold">
                      Meta: {'>'} 70% ocupación
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Net Profit Daily */}
              <Card className="border-green-500">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    Net Profit Diario
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-700">
                    ${formatChileno(calcularNetProfitDaily())}
                  </div>
                  <p className="text-xs text-gray-600 mt-1">Después de pérdidas</p>
                  {estadoActual.perdida_estimada_clp > 0 && (
                    <div className="mt-3 p-2 bg-red-50 rounded border border-red-200">
                      <p className="text-xs text-red-700">
                        Pérdida por downtime:
                      </p>
                      <p className="text-lg font-bold text-red-900">
                        -${formatChileno(estadoActual.perdida_estimada_clp)}
                      </p>
                    </div>
                  )}
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-xs text-gray-600">RevPSM Ajustado</p>
                    <p className="text-lg font-bold text-gray-900">
                      ${formatChileno(calcularNetProfitDaily() / 25)}/m²
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* Resumen Ejecutivo Final */}
        <Alert className={`border-2 ${
          estadoActual.status === 'CRÍTICO' ? 'border-red-500 bg-red-50' :
          estadoActual.status === 'ÓPTIMO' ? 'border-green-500 bg-green-50' :
          'border-amber-500 bg-amber-50'
        }`}>
          {estadoActual.status === 'CRÍTICO' ? <ShieldAlert className="h-5 w-5" /> :
           estadoActual.status === 'ÓPTIMO' ? <Sparkles className="h-5 w-5" /> :
           <AlertTriangle className="h-5 w-5" />}
          <AlertTitle className="text-lg font-bold">🎯 Conclusión de Auditoría</AlertTitle>
          <AlertDescription className="text-sm mt-3 space-y-2">
            {estadoActual.status === 'CRÍTICO' ? (
              <>
                <p className="font-semibold text-red-900">
                  La imagen muestra una falla de <strong>"Figura"</strong> (estética y orden) que arruina el <strong>"Genio"</strong> (negocio).
                </p>
                <p className="text-red-800">
                  El cartel "Out of Order" representa una pérdida directa de <strong>$450.000/día</strong>.
                  Downtime acumulado: <strong>{estadoActual.downtime_minutos} minutos</strong>.
                </p>
                <div className="p-3 bg-white rounded border-2 border-red-500 mt-2">
                  <p className="font-bold text-red-900">
                    🚨 ACCIÓN REQUERIDA: Llamar técnico INMEDIATAMENTE. Implementar mantenimiento preventivo mensual.
                  </p>
                </div>
              </>
            ) : estadoActual.status === 'ÓPTIMO' ? (
              <>
                <p className="font-semibold text-green-900">
                  ✅ Operación <strong>"Genio"</strong>: Todos los sistemas dentro de parámetros óptimos.
                </p>
                <p className="text-green-800">
                  Máquina operativa, limpieza {estadoActual.limpieza_score}%, ocupación {calcularOcupacionPromedio().toFixed(0)}%.
                  Sin downtime registrado.
                </p>
                <div className="p-3 bg-white rounded border-2 border-green-500 mt-2">
                  <p className="font-bold text-green-900">
                    🎉 Mantener estándares actuales. Inversión de $37.697.000 protegida.
                  </p>
                </div>
              </>
            ) : (
              <>
                <p className="font-semibold text-amber-900">
                  ⚠️ Operación <strong>"Normal"</strong> con áreas de mejora identificadas.
                </p>
                <p className="text-amber-800">
                  Algunas métricas por debajo del objetivo. Revisar checklist por roles.
                </p>
                <div className="p-3 bg-white rounded border-2 border-amber-500 mt-2">
                  <p className="font-bold text-amber-900">
                    💡 Implementar SOP para prevenir degradación a estado "CRÍTICO".
                  </p>
                </div>
              </>
            )}
          </AlertDescription>
        </Alert>
      </div>
      
      {/* Botones para exportar a PDF */}
      <div className="flex justify-end gap-3">
        <Button
          onClick={generarPreviewPDF}
          size="lg"
          variant="outline"
          className="border-2 border-green-600 text-green-600 hover:bg-green-50"
          disabled={exportandoPDF}
        >
          {exportandoPDF ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Generando...
            </>
          ) : (
            <>
              <Eye className="mr-2 h-5 w-5" />
              👁️ Preview PDF
            </>
          )}
        </Button>
        
        <Button
          onClick={exportarAPDF}
          size="lg"
          className="bg-green-600 hover:bg-green-700 text-white shadow-lg"
          disabled={exportandoPDF}
        >
          {exportandoPDF ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Generando PDF...
            </>
          ) : (
            <>
              <Download className="mr-2 h-5 w-5" />
              📥 Exportar PDF
            </>
          )}
        </Button>
      </div>

      {/* US-002: Modal de Preview PDF */}
      {mostrarPreview && pdfPreviewURL && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
            {/* Header del modal */}
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">Preview del Informe Ejecutivo</h3>
              <div className="flex items-center gap-2">
                <Button
                  onClick={descargarDesdePreview}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Descargar
                </Button>
                <Button
                  onClick={() => {
                    setMostrarPreview(false);
                    if (pdfPreviewURL) {
                      URL.revokeObjectURL(pdfPreviewURL);
                      setPdfPreviewURL(null);
                    }
                  }}
                  size="sm"
                  variant="outline"
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Cerrar
                </Button>
              </div>
            </div>
            
            {/* Contenido del preview */}
            <div className="flex-1 overflow-auto p-4">
              <iframe
                src={pdfPreviewURL}
                className="w-full h-full min-h-[600px] border rounded"
                title="Preview PDF"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}