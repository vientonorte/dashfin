import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { 
  Bell, 
  AlertTriangle, 
  CheckCircle2,
  TrendingDown,
  Target,
  DollarSign,
  Activity,
  Zap
} from 'lucide-react';
import { useDashboard } from '../contexts/DashboardContext';
import { toast } from 'sonner';

interface AlertaConfig {
  id: string;
  nombre: string;
  descripcion: string;
  condicion: (registros: any[], metricas: any) => boolean;
  mensaje: string;
  icono: any;
  color: string;
  activa: boolean;
}

const CONFIGURACIONES_ALERTAS: AlertaConfig[] = [
  {
    id: 'margen_neto_bajo',
    nombre: 'Margen Neto Crítico',
    descripcion: 'Alerta cuando el margen neto cae bajo 30%',
    condicion: (registros) => {
      const ultimo = registros[0];
      return ultimo ? ultimo.margen_neto_percent < 30 : false;
    },
    mensaje: '🚨 ALERTA CRÍTICA: Margen neto bajo 30%',
    icono: AlertTriangle,
    color: 'red',
    activa: true
  },
  {
    id: 'venta_baja',
    nombre: 'Venta Mensual Baja',
    descripcion: 'Alerta cuando la venta del mes es 20% menor al promedio',
    condicion: (registros, metricas) => {
      if (registros.length < 2) return false;
      const ultimo = registros[0];
      const promedio = metricas.total_venta / registros.length;
      return ultimo.venta_total_clp < promedio * 0.8;
    },
    mensaje: '⚠️ Venta mensual 20% por debajo del promedio',
    icono: TrendingDown,
    color: 'amber',
    activa: true
  },
  {
    id: 'roi_negativo',
    nombre: 'ROI Negativo',
    descripcion: 'Alerta cuando el ROI del mes es negativo',
    condicion: (registros) => {
      const ultimo = registros[0];
      return ultimo ? ultimo.roi < 0 : false;
    },
    mensaje: '🔴 ROI negativo detectado en el último mes',
    icono: DollarSign,
    color: 'red',
    activa: true
  },
  {
    id: 'figura_consecutivo',
    nombre: 'Figura Consecutivo',
    descripcion: 'Alerta cuando se obtiene "Figura" 2 meses seguidos',
    condicion: (registros) => {
      if (registros.length < 2) return false;
      return registros[0].status === 'Figura' && registros[1].status === 'Figura';
    },
    mensaje: '⚠️ Status "Figura" por 2 meses consecutivos',
    icono: Target,
    color: 'amber',
    activa: true
  },
  {
    id: 'payback_estancado',
    nombre: 'Payback Estancado',
    descripcion: 'Alerta cuando el payback no mejora en 3 meses',
    condicion: (registros, metricas) => {
      if (registros.length < 3) return false;
      const ultimos3 = registros.slice(0, 3);
      const utilidades = ultimos3.map(r => r.utilidad_neta_clp);
      const promedio = utilidades.reduce((a, b) => a + b, 0) / 3;
      return promedio < metricas.total_utilidad_neta / registros.length * 0.9;
    },
    mensaje: '🔄 Payback sin mejora en los últimos 3 meses',
    icono: Activity,
    color: 'amber',
    activa: false
  }
];

export function AlertasAutomaticas() {
  const { registros, metricas } = useDashboard();
  
  const [alertasActivas, setAlertasActivas] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem('alertas_configuracion');
    if (saved) {
      return JSON.parse(saved);
    }
    // Default: todas activas excepto payback_estancado
    return CONFIGURACIONES_ALERTAS.reduce((acc, alerta) => {
      acc[alerta.id] = alerta.activa;
      return acc;
    }, {} as Record<string, boolean>);
  });

  const [alertasDetectadas, setAlertasDetectadas] = useState<AlertaConfig[]>([]);

  // Verificar alertas cuando cambien los registros
  useEffect(() => {
    if (registros.length === 0) {
      setAlertasDetectadas([]);
      return;
    }

    const alertasActivadas: AlertaConfig[] = [];

    CONFIGURACIONES_ALERTAS.forEach(config => {
      if (!alertasActivas[config.id]) return;

      if (config.condicion(registros, metricas)) {
        alertasActivadas.push(config);
      }
    });

    setAlertasDetectadas(alertasActivadas);

    // Mostrar toast solo si hay alertas nuevas
    if (alertasActivadas.length > 0) {
      const ultimaVerificacion = localStorage.getItem('ultima_verificacion_alertas');
      const ahora = new Date().toISOString();
      
      // Solo mostrar si pasó más de 1 hora desde la última verificación
      if (!ultimaVerificacion || 
          new Date(ahora).getTime() - new Date(ultimaVerificacion).getTime() > 3600000) {
        
        alertasActivadas.forEach(alerta => {
          toast.error(alerta.mensaje, {
            description: alerta.descripcion,
            duration: 5000
          });
        });

        localStorage.setItem('ultima_verificacion_alertas', ahora);
      }
    }
  }, [registros, metricas, alertasActivas]);

  const toggleAlerta = (id: string) => {
    const nuevasAlertas = {
      ...alertasActivas,
      [id]: !alertasActivas[id]
    };
    setAlertasActivas(nuevasAlertas);
    localStorage.setItem('alertas_configuracion', JSON.stringify(nuevasAlertas));
    
    toast.success(
      nuevasAlertas[id] ? 'Alerta activada' : 'Alerta desactivada',
      { duration: 2000 }
    );
  };

  const enviarAlertaPorWebhook = async (alerta: AlertaConfig) => {
    const webhookUrl = localStorage.getItem('webhook_make_url');
    
    if (!webhookUrl) {
      toast.error('Webhook no configurado', {
        description: 'Configura el webhook en la sección de Make.com primero'
      });
      return;
    }

    try {
      const payload = {
        event: 'alerta_automatica',
        timestamp: new Date().toISOString(),
        alerta: {
          id: alerta.id,
          nombre: alerta.nombre,
          mensaje: alerta.mensaje,
          descripcion: alerta.descripcion
        },
        datos_contexto: {
          ultimo_mes: registros[0] ? {
            fecha: registros[0].date,
            venta_total: registros[0].venta_total_clp,
            utilidad_neta: registros[0].utilidad_neta_clp,
            margen_neto_percent: registros[0].margen_neto_percent
          } : null
        }
      };

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        toast.success('Alerta enviada por webhook', {
          description: 'La notificación se envió a Make.com'
        });
      }
    } catch (error) {
      console.error('Error al enviar alerta:', error);
      toast.error('Error al enviar alerta');
    }
  };

  const getColorClass = (color: string) => {
    switch (color) {
      case 'red': return 'bg-red-50 border-red-500 text-red-900';
      case 'amber': return 'bg-amber-50 border-amber-500 text-amber-900';
      case 'green': return 'bg-green-50 border-green-500 text-green-900';
      default: return 'bg-gray-50 border-gray-500 text-gray-900';
    }
  };

  const getIconColorClass = (color: string) => {
    switch (color) {
      case 'red': return 'text-red-600';
      case 'amber': return 'text-amber-600';
      case 'green': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <Card className="border-2 border-orange-500 shadow-lg">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl flex items-center gap-2">
          <Bell className="h-6 w-6 text-orange-600" />
          Alertas Automáticas
        </CardTitle>
        <CardDescription>
          Notificaciones inteligentes cuando se detectan condiciones críticas
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Estado de alertas detectadas */}
        {alertasDetectadas.length > 0 ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-700">
                🔔 Alertas Activas ({alertasDetectadas.length})
              </h3>
              <Badge variant="destructive">
                Requiere atención
              </Badge>
            </div>

            {alertasDetectadas.map(alerta => {
              const Icono = alerta.icono;
              return (
                <Alert key={alerta.id} className={`border-2 ${getColorClass(alerta.color)}`}>
                  <Icono className={`h-5 w-5 ${getIconColorClass(alerta.color)}`} />
                  <AlertTitle className="text-sm font-bold">
                    {alerta.mensaje}
                  </AlertTitle>
                  <AlertDescription className="text-xs mt-2">
                    {alerta.descripcion}
                    <div className="mt-2 flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => enviarAlertaPorWebhook(alerta)}
                        className="h-7 text-xs"
                      >
                        <Zap className="mr-1 h-3 w-3" />
                        Enviar por Webhook
                      </Button>
                    </div>
                  </AlertDescription>
                </Alert>
              );
            })}
          </div>
        ) : (
          <Alert className="border-green-500 bg-green-50">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <AlertTitle className="text-sm">✅ Todo en orden</AlertTitle>
            <AlertDescription className="text-xs">
              No se detectaron alertas críticas en los datos actuales
            </AlertDescription>
          </Alert>
        )}

        {/* Configuración de alertas */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Configuración de Alertas
          </h3>

          <div className="space-y-2">
            {CONFIGURACIONES_ALERTAS.map(config => {
              const Icono = config.icono;
              return (
                <div
                  key={config.id}
                  className="flex items-start justify-between p-4 bg-gray-50 rounded-lg border hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`p-2 rounded-lg ${
                      alertasActivas[config.id] 
                        ? `bg-${config.color}-100` 
                        : 'bg-gray-200'
                    }`}>
                      <Icono className={`h-4 w-4 ${
                        alertasActivas[config.id]
                          ? getIconColorClass(config.color)
                          : 'text-gray-500'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900">
                        {config.nombre}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        {config.descripcion}
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={alertasActivas[config.id]}
                    onCheckedChange={() => toggleAlerta(config.id)}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Instrucciones */}
        <Alert className="border-orange-500 bg-orange-50">
          <Bell className="h-4 w-4" />
          <AlertTitle className="text-sm">💡 Cómo funcionan las alertas</AlertTitle>
          <AlertDescription className="text-xs space-y-2 mt-2">
            <ul className="list-disc list-inside space-y-1">
              <li>Las alertas se verifican automáticamente al importar datos</li>
              <li>Se muestran notificaciones toast cuando se detectan condiciones críticas</li>
              <li>Puedes enviar alertas individuales por webhook a Make.com</li>
              <li>Las alertas desactivadas no generan notificaciones</li>
              <li>La verificación se ejecuta máximo 1 vez por hora para evitar spam</li>
            </ul>
          </AlertDescription>
        </Alert>

        {/* Estado sin datos */}
        {registros.length === 0 && (
          <Alert className="border-amber-500 bg-amber-50">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle className="text-sm">Sin datos para analizar</AlertTitle>
            <AlertDescription className="text-xs">
              Importa datos mensuales desde la tab "Home" para activar las alertas automáticas
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
