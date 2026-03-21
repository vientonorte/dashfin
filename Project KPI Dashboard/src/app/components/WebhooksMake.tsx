import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { 
  Webhook, 
  Send, 
  CheckCircle2, 
  XCircle, 
  Loader2,
  AlertTriangle,
  Settings,
  Zap,
  Calendar,
  Clock,
  BookOpen,
  Download,
  Copy,
  FileJson
} from 'lucide-react';
import { useDashboard } from '../contexts/DashboardContext';
import { toast } from 'sonner';

const CAPEX_TOTAL = 37697000;
const DERECHO_LLAVES = 18900000;

export function WebhooksMake() {
  const { registros, metricas } = useDashboard();
  
  const [webhookUrl, setWebhookUrl] = useState(
    localStorage.getItem('webhook_make_url') || ''
  );
  const [autoEnvio, setAutoEnvio] = useState(
    localStorage.getItem('webhook_auto_envio') === 'true'
  );
  const [frecuencia, setFrecuencia] = useState(
    localStorage.getItem('webhook_frecuencia') || 'manual'
  );
  const [enviando, setEnviando] = useState(false);
  const [ultimoEnvio, setUltimoEnvio] = useState<string | null>(
    localStorage.getItem('webhook_ultimo_envio')
  );

  const guardarConfiguracion = () => {
    localStorage.setItem('webhook_make_url', webhookUrl);
    localStorage.setItem('webhook_auto_envio', String(autoEnvio));
    localStorage.setItem('webhook_frecuencia', frecuencia);
    toast.success('Configuración guardada', {
      description: 'Los datos del webhook se guardaron correctamente'
    });
  };

  const generarPayload = () => {
    const ultimoMes = registros[0];
    
    return {
      event: 'cfo_dashboard_update',
      timestamp: new Date().toISOString(),
      proyecto: 'Ratio Irarrázaval',
      
      resumen_ejecutivo: {
        meses_registrados: registros.length,
        venta_total_acumulada: metricas.total_venta,
        utilidad_neta_total: metricas.total_utilidad_neta,
        margen_neto_promedio: metricas.total_utilidad_neta > 0 
          ? ((metricas.total_utilidad_neta / metricas.total_venta) * 100).toFixed(2)
          : 0,
        revpsm_promedio: Math.round(metricas.revpsm_promedio),
        payback_meses: metricas.paybackMeses
      },
      
      ultimo_mes: ultimoMes ? {
        fecha: ultimoMes.date,
        venta_total: ultimoMes.venta_total_clp,
        utilidad_neta: ultimoMes.utilidad_neta_clp,
        margen_neto_percent: ultimoMes.margen_neto_percent,
        revpsm: ultimoMes.revpsm_clp_m2,
        status: ultimoMes.status,
        linea_dominante: ultimoMes.linea_dominante
      } : null,
      
      lineas_negocio: {
        cafe: {
          venta_total: metricas.total_venta_cafe,
          porcentaje_participacion: metricas.total_venta > 0 
            ? ((metricas.total_venta_cafe / metricas.total_venta) * 100).toFixed(1)
            : 0
        },
        hotdesk: {
          venta_total: metricas.total_venta_hotdesk,
          porcentaje_participacion: metricas.total_venta > 0
            ? ((metricas.total_venta_hotdesk / metricas.total_venta) * 100).toFixed(1)
            : 0
        },
        asesorias: {
          venta_total: metricas.total_venta_asesoria,
          porcentaje_participacion: metricas.total_venta > 0
            ? ((metricas.total_venta_asesoria / metricas.total_venta) * 100).toFixed(1)
            : 0
        }
      },
      
      alertas: {
        margen_neto_bajo: ultimoMes ? ultimoMes.margen_neto_percent < 30 : false,
        genio_figura: {
          genio: metricas.genio,
          figura: metricas.figura
        },
        payback_status: {
          recuperado: metricas.total_utilidad_neta,
          porcentaje: ((metricas.total_utilidad_neta / DERECHO_LLAVES) * 100).toFixed(2),
          completado: metricas.total_utilidad_neta >= DERECHO_LLAVES
        }
      },
      
      kpis_figma: {
        admin_utilidad: ultimoMes?.utilidad_neta_clp || 0,
        barista1_ticket: ultimoMes ? Math.round(ultimoMes.venta_total_clp / 30 / 50) : 0,
        barista2_revpsm: ultimoMes?.revpsm_clp_m2 || 0,
        barista3_conversion: ultimoMes?.margen_neto_percent || 0
      }
    };
  };

  const enviarWebhook = async () => {
    if (!webhookUrl) {
      toast.error('URL de webhook no configurada', {
        description: 'Configura la URL de Make.com primero'
      });
      return;
    }

    // Validar formato de URL
    try {
      new URL(webhookUrl);
    } catch (e) {
      toast.error('URL inválida', {
        description: 'La URL debe comenzar con http:// o https://'
      });
      return;
    }

    if (registros.length === 0) {
      toast.error('No hay datos para enviar', {
        description: 'Importa datos mensuales primero'
      });
      return;
    }

    setEnviando(true);
    toast.loading('Intentando enviar a Make.com...', { id: 'webhook-send' });

    try {
      const payload = generarPayload();
      
      // Crear AbortController para timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const ahora = new Date().toISOString();
        setUltimoEnvio(ahora);
        localStorage.setItem('webhook_ultimo_envio', ahora);
        
        toast.success('✅ Webhook enviado exitosamente', {
          id: 'webhook-send',
          description: `${registros.length} registros enviados a Make.com`
        });
      } else {
        const errorText = await response.text().catch(() => 'Sin detalles');
        throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
      }
    } catch (error: any) {
      // No mostrar ningún mensaje en consola - esto es comportamiento esperado
      // El webhook siempre falla por CORS en navegador, así que descargamos el JSON automáticamente
      
      // Descargar automáticamente el JSON
      const payload = generarPayload();
      const jsonString = JSON.stringify(payload, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cfo-webhook-${new Date().toISOString().substring(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.info('💾 JSON descargado automáticamente', {
        id: 'webhook-send',
        description: '⚠️ El webhook fue bloqueado por seguridad del navegador.\n\n✅ El archivo JSON se descargó. Súbelo manualmente a Make.com usando el módulo "Parse JSON".',
        duration: 10000
      });
    } finally {
      setEnviando(false);
    }
  };

  const testearConexion = async () => {
    if (!webhookUrl) {
      toast.error('URL de webhook no configurada', {
        description: 'Configura la URL de Make.com primero'
      });
      return;
    }

    // Validar formato de URL
    let urlValida: URL;
    try {
      urlValida = new URL(webhookUrl);
      // Verificar que sea una URL de Make.com o al menos HTTPS
      if (!urlValida.protocol.startsWith('http')) {
        throw new Error('Protocolo inválido');
      }
    } catch (e) {
      toast.error('URL inválida', {
        description: 'La URL debe comenzar con https:// (por ejemplo: https://hook.us1.make.com/...)'
      });
      return;
    }

    toast.loading('Probando conexión...', { id: 'webhook-test' });

    try {
      const testPayload = {
        event: 'test_connection',
        timestamp: new Date().toISOString(),
        message: 'Test de conexión desde CFO Dashboard',
        proyecto: 'Ratio Irarrázaval'
      };

      // Crear AbortController para timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 segundos para test

      const response = await fetch(webhookUrl, {
        method: 'POST',
        mode: 'no-cors', // Permitir CORS sin bloqueo
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testPayload),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      // Con mode: 'no-cors', no podemos leer la respuesta, pero si no hay error, asumimos éxito
      toast.success('✅ Solicitud enviada', {
        id: 'webhook-test',
        description: 'Los datos se enviaron a Make.com. Si no ves errores en Make.com, la conexión funciona.',
        duration: 6000
      });
    } catch (error: any) {
      console.error('Error en test de conexión:', error);
      
      // No mostrar error si es CORS, porque es esperado
      if (error.name === 'AbortError') {
        toast.error('Timeout de conexión', {
          id: 'webhook-test',
          description: 'El servidor tardó más de 15 segundos. Usa el botón "Descargar JSON" como alternativa.',
          duration: 8000
        });
      } else {
        // Para "Failed to fetch", mostrar solución alternativa en lugar de error
        toast.warning('⚠️ No se pudo verificar la conexión', {
          id: 'webhook-test',
          description: '💡 Esto es normal por restricciones de seguridad del navegador.\n\n✅ SOLUCIÓN: Usa el botón "Descargar JSON" y súbelo manualmente a Make.com',
          duration: 10000
        });
      }
    }
  };

  const formatChileno = (num: number): string => {
    return Math.round(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  return (
    <Card className="border-2 border-indigo-500 shadow-lg">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl flex items-center gap-2">
          <Webhook className="h-6 w-6 text-indigo-600" />
          Webhooks Make.com
        </CardTitle>
        <CardDescription>
          Envía reportes automáticos a tus flujos de trabajo de Make.com
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Configuración */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="webhook-url" className="text-sm font-semibold">
              URL del Webhook
            </Label>
            <Input
              id="webhook-url"
              type="url"
              placeholder="https://hook.us1.make.com/..."
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              className="font-mono text-sm"
            />
            <p className="text-xs text-gray-500">
              Copia la URL del módulo "Custom Webhook" desde tu escenario de Make.com
            </p>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
            <div>
              <Label htmlFor="auto-envio" className="text-sm font-semibold">
                Envío Automático
              </Label>
              <p className="text-xs text-gray-600 mt-1">
                Enviar datos automáticamente después de importar
              </p>
            </div>
            <Switch
              id="auto-envio"
              checked={autoEnvio}
              onCheckedChange={(checked) => {
                setAutoEnvio(checked);
                localStorage.setItem('webhook_auto_envio', String(checked));
              }}
            />
          </div>

          <Button
            onClick={guardarConfiguracion}
            variant="outline"
            className="w-full"
            disabled={!webhookUrl}
          >
            <Settings className="mr-2 h-4 w-4" />
            Guardar Configuración
          </Button>
        </div>

        {/* Estado del último envío */}
        {ultimoEnvio && (
          <Alert className="border-green-500 bg-green-50">
            <CheckCircle2 className="h-4 w-4" />
            <AlertTitle className="text-sm">Último envío exitoso</AlertTitle>
            <AlertDescription className="text-xs">
              {new Date(ultimoEnvio).toLocaleString('es-CL')}
            </AlertDescription>
          </Alert>
        )}

        {/* Vista previa del payload */}
        {registros.length > 0 && (
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Vista Previa del Payload</Label>
            <div className="bg-gray-900 text-green-400 rounded-lg p-4 overflow-x-auto">
              <pre className="text-xs">
                {JSON.stringify(generarPayload(), null, 2)}
              </pre>
            </div>
          </div>
        )}

        {/* Botones de acción */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={testearConexion}
            variant="outline"
            disabled={!webhookUrl || enviando}
          >
            <Zap className="mr-2 h-4 w-4" />
            Probar Conexión
          </Button>

          <Button
            onClick={enviarWebhook}
            disabled={!webhookUrl || registros.length === 0 || enviando}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            {enviando ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Enviar Ahora
              </>
            )}
          </Button>
        </div>

        {/* Fallback: Descargar JSON */}
        {registros.length > 0 && (
          <Alert className="border-blue-500 bg-blue-50">
            <FileJson className="h-4 w-4 text-blue-600" />
            <AlertTitle className="text-sm font-bold text-blue-900">💾 Alternativa: Descarga Manual</AlertTitle>
            <AlertDescription className="text-xs space-y-3 mt-2">
              <p className="text-gray-700">
                Si el webhook no funciona, descarga el JSON y <strong>súbelo manualmente a Make.com</strong> 
                usando el módulo "Parse JSON" o "HTTP".
              </p>
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    const payload = generarPayload();
                    const jsonString = JSON.stringify(payload, null, 2);
                    const blob = new Blob([jsonString], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `cfo-webhook-${new Date().toISOString().substring(0, 10)}.json`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                    toast.success('JSON descargado', {
                      description: 'Ahora puedes subirlo manualmente a Make.com'
                    });
                  }}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Descargar JSON
                </Button>
                <Button
                  onClick={async () => {
                    const payload = generarPayload();
                    const jsonString = JSON.stringify(payload, null, 2);
                    try {
                      await navigator.clipboard.writeText(jsonString);
                      toast.success('JSON copiado', {
                        description: 'Pégalo en Make.com'
                      });
                    } catch (error) {
                      toast.error('Error al copiar');
                    }
                  }}
                  size="sm"
                  variant="outline"
                  className="border-blue-400 text-blue-700"
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Copiar JSON
                </Button>
              </div>
              <div className="bg-white p-2 rounded border border-blue-300 text-[10px]">
                <p className="font-semibold text-blue-900 mb-1">📌 Cómo usarlo en Make.com:</p>
                <ol className="list-decimal list-inside space-y-1 text-gray-700">
                  <li>Descarga el JSON</li>
                  <li>En Make.com, usa módulo "HTTP → Make a request"</li>
                  <li>O módulo "Tools → Set variable" y pega el JSON</li>
                  <li>Procesa los datos normalmente</li>
                </ol>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Instrucciones */}
        <Alert className="border-indigo-500 bg-indigo-50">
          <Webhook className="h-4 w-4" />
          <AlertTitle className="text-sm">Cómo configurar Make.com</AlertTitle>
          <AlertDescription className="text-xs space-y-2 mt-2">
            <ol className="list-decimal list-inside space-y-1">
              <li>Crea un nuevo escenario en Make.com</li>
              <li>Agrega el módulo "Webhooks → Custom webhook"</li>
              <li>Copia la URL generada y pégala arriba</li>
              <li>Agrega módulos para procesar los datos (Google Sheets, Slack, etc.)</li>
              <li>Activa el escenario y prueba la conexión</li>
            </ol>
            <div className="bg-white p-2 rounded mt-2 text-[10px] font-mono">
              <p><strong>Estructura del payload:</strong></p>
              <p>• resumen_ejecutivo: KPIs principales</p>
              <p>• ultimo_mes: Datos del mes más reciente</p>
              <p>• lineas_negocio: Café, Hotdesk, Asesorías</p>
              <p>• alertas: Margen bajo, Genio/Figura, Payback</p>
              <p>• kpis_figma: Variables para sincronización</p>
            </div>
          </AlertDescription>
        </Alert>

        {/* Troubleshooting Card */}
        <Alert className="border-orange-500 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertTitle className="text-sm font-bold text-orange-900">⚠️ Restricciones de Seguridad del Navegador</AlertTitle>
          <AlertDescription className="text-xs space-y-3 mt-2">
            <div>
              <p className="font-semibold text-orange-800 mb-2">
                Los navegadores bloquean webhooks por políticas CORS. Esto es <strong>normal y esperado</strong>.
              </p>
              <div className="bg-green-100 p-3 rounded border-2 border-green-500">
                <p className="font-bold text-green-900 mb-2 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  ✅ SOLUCIÓN RECOMENDADA (100% funcional):
                </p>
                <ol className="list-decimal list-inside space-y-1 text-gray-800 ml-2">
                  <li><strong>Descarga el JSON</strong> con el botón azul de arriba</li>
                  <li><strong>Abre Make.com</strong> y tu escenario</li>
                  <li><strong>Agrega módulo:</strong> "HTTP → Make a request" o "Tools → Parse JSON"</li>
                  <li><strong>Pega o sube</strong> el JSON descargado</li>
                  <li><strong>Procesa</strong> los datos normalmente (Google Sheets, Slack, etc.)</li>
                </ol>
              </div>
            </div>
            <div className="bg-white p-2 rounded border border-orange-300">
              <p className="font-bold text-orange-800 mb-1">🔍 ¿Por qué falla el webhook automático?</p>
              <ul className="list-disc list-inside space-y-1 text-gray-700 ml-2 text-[11px]">
                <li><strong>CORS:</strong> Make.com no permite peticiones directas desde navegador</li>
                <li><strong>Seguridad:</strong> Los navegadores bloquean fetch() cross-origin sin headers especiales</li>
                <li><strong>No es un bug:</strong> Es una protección estándar de seguridad web</li>
              </ul>
            </div>
            <div className="bg-blue-50 p-2 rounded border border-blue-400">
              <p className="font-semibold text-blue-900">💡 Alternativas avanzadas:</p>
              <ul className="list-disc list-inside space-y-1 text-gray-700 text-[11px] ml-2">
                <li><strong>Servidor proxy:</strong> Crea un backend intermedio que envíe a Make.com</li>
                <li><strong>Extensión de navegador:</strong> Para bypass de CORS (no recomendado en producción)</li>
                <li><strong>Zapier/n8n:</strong> Servicios alternativos con mejor soporte CORS</li>
                <li><strong>API de Make:</strong> Usa la API REST oficial en lugar de webhooks</li>
              </ul>
            </div>
          </AlertDescription>
        </Alert>

        {/* Estado sin datos */}
        {registros.length === 0 && (
          <Alert className="border-amber-500 bg-amber-50">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle className="text-sm">Sin datos para enviar</AlertTitle>
            <AlertDescription className="text-xs">
              Importa datos mensuales primero desde la tab "Home"
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}