import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Badge } from './ui/badge';
import { 
  Webhook, 
  ExternalLink, 
  Copy, 
  CheckCircle2,
  ArrowRight,
  MousePointerClick,
  Link2,
  FileCode,
  AlertTriangle,
  Zap,
  Sheet
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export function GuiaWebhookMake() {
  const [urlCopiada, setUrlCopiada] = useState(false);

  const copiarTexto = (texto: string, nombre: string) => {
    navigator.clipboard.writeText(texto);
    setUrlCopiada(true);
    toast.success(`${nombre} copiado`, {
      description: 'Pegalo en tu código'
    });
    setTimeout(() => setUrlCopiada(false), 3000);
  };

  const ejemploURL = 'https://hook.us1.make.com/abc123xyz456';

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-2 border-cyan-500 bg-gradient-to-r from-cyan-50 to-blue-50">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Webhook className="h-7 w-7 text-cyan-600" />
            Guía Completa: Cómo Obtener la URL del Webhook de Make.com
          </CardTitle>
          <CardDescription className="text-base">
            Sigue estos pasos para conectar tu dashboard con Make.com y automatizar alertas
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Aclaración Figma Make vs Make.com */}
      <Card className="border-2 border-indigo-500 bg-gradient-to-r from-indigo-50 to-purple-50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2 text-indigo-900">
            💡 Aclaración Importante
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="border-2 border-indigo-400 rounded-lg p-4 bg-white">
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-indigo-600">Figma Make</Badge>
              </div>
              <p className="text-sm font-semibold text-indigo-900 mb-1">
                Esta herramienta (donde estás ahora)
              </p>
              <p className="text-xs text-gray-700">
                Es la plataforma de Figma para construir aplicaciones web. Aquí creaste tu CFO Dashboard.
              </p>
            </div>

            <div className="border-2 border-purple-400 rounded-lg p-4 bg-white">
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-purple-600">Make.com</Badge>
              </div>
              <p className="text-sm font-semibold text-purple-900 mb-1">
                Plataforma de automatización externa
              </p>
              <p className="text-xs text-gray-700">
                Es un servicio externo (como Zapier) donde envías datos vía webhook para automatizar acciones (emails, SMS, Sheets).
              </p>
            </div>
          </div>

          <Alert className="border-indigo-400 bg-indigo-50">
            <Zap className="h-4 w-4 text-indigo-600" />
            <AlertTitle className="text-sm font-bold">🔗 Cómo se conectan</AlertTitle>
            <AlertDescription className="text-xs mt-2">
              <p className="font-semibold mb-1">Flujo de Datos:</p>
              <div className="flex items-center gap-2 text-xs bg-white rounded p-2 font-mono">
                <span className="text-indigo-600 font-bold">Figma Make (Dashboard)</span>
                <ArrowRight className="h-3 w-3" />
                <span className="text-purple-600 font-bold">Webhook URL</span>
                <ArrowRight className="h-3 w-3" />
                <span className="text-green-600 font-bold">Make.com</span>
                <ArrowRight className="h-3 w-3" />
                <span className="text-orange-600 font-bold">Gmail/Slack/Sheets</span>
              </div>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Paso 1: Crear cuenta y escenario */}
      <Card className="border-2 border-blue-500">
        <CardHeader className="bg-blue-50">
          <CardTitle className="flex items-center gap-2">
            <Badge className="bg-blue-600 text-white w-8 h-8 flex items-center justify-center rounded-full">1</Badge>
            Crear Cuenta en Make.com (Si no tienes)
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <ArrowRight className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
              <div>
                <p className="font-semibold text-sm">Accede a Make.com</p>
                <a 
                  href="https://www.make.com/en/register" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-sm flex items-center gap-1"
                >
                  https://www.make.com/en/register
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <ArrowRight className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
              <div>
                <p className="font-semibold text-sm">Crea una cuenta gratuita</p>
                <p className="text-xs text-gray-600">Make ofrece 1,000 operaciones gratis al mes</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <ArrowRight className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
              <div>
                <p className="font-semibold text-sm">Una vez dentro, haz clic en "Create a new scenario"</p>
                <p className="text-xs text-gray-600">Esto abrirá el editor visual de automatizaciones</p>
              </div>
            </div>
          </div>

          <Alert className="border-blue-400 bg-blue-50">
            <CheckCircle2 className="h-4 w-4 text-blue-600" />
            <AlertTitle className="text-sm font-bold">💡 Consejo</AlertTitle>
            <AlertDescription className="text-xs">
              Make.com es GRATIS para empezar. No necesitas tarjeta de crédito para probar.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Paso 2: Agregar módulo Webhook */}
      <Card className="border-2 border-green-500">
        <CardHeader className="bg-green-50">
          <CardTitle className="flex items-center gap-2">
            <Badge className="bg-green-600 text-white w-8 h-8 flex items-center justify-center rounded-full">2</Badge>
            Agregar el Módulo "Custom Webhook"
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <MousePointerClick className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
              <div>
                <p className="font-semibold text-sm">Haz clic en el botón "+" (círculo grande en el centro)</p>
                <p className="text-xs text-gray-600">Esto abre el selector de módulos</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <ArrowRight className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
              <div>
                <p className="font-semibold text-sm">En el buscador, escribe: "webhook"</p>
                <p className="text-xs text-gray-600">Aparecerán varios módulos con nombre "Webhooks"</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <ArrowRight className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
              <div>
                <p className="font-semibold text-sm">Selecciona: "Webhooks" → "Custom webhook"</p>
                <p className="text-xs text-gray-600">Este es el módulo que recibirá los datos de tu dashboard</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <ArrowRight className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
              <div>
                <p className="font-semibold text-sm">Haz clic en "Add" (botón azul)</p>
                <p className="text-xs text-gray-600">Esto creará un nuevo webhook</p>
              </div>
            </div>
          </div>

          <Alert className="border-green-400 bg-green-50">
            <Webhook className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-sm font-bold">✅ Resultado Esperado</AlertTitle>
            <AlertDescription className="text-xs">
              Verás un módulo verde con un icono de gancho (🪝) en tu escenario
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Paso 3: Copiar URL */}
      <Card className="border-2 border-purple-500">
        <CardHeader className="bg-purple-50">
          <CardTitle className="flex items-center gap-2">
            <Badge className="bg-purple-600 text-white w-8 h-8 flex items-center justify-center rounded-full">3</Badge>
            Copiar la URL del Webhook
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <MousePointerClick className="h-5 w-5 text-purple-600 mt-1 flex-shrink-0" />
              <div>
                <p className="font-semibold text-sm">Haz clic en el módulo "Webhooks" que acabas de crear</p>
                <p className="text-xs text-gray-600">Se abrirá un panel lateral derecho</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Link2 className="h-5 w-5 text-purple-600 mt-1 flex-shrink-0" />
              <div>
                <p className="font-semibold text-sm">Verás un recuadro con una URL larga que empieza con:</p>
                <div className="bg-gray-900 text-green-400 p-3 rounded-lg mt-2 font-mono text-xs break-all">
                  https://hook.us1.make.com/abc123xyz456...
                </div>
                <p className="text-xs text-gray-600 mt-1">Esta es tu URL única del webhook</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Copy className="h-5 w-5 text-purple-600 mt-1 flex-shrink-0" />
              <div>
                <p className="font-semibold text-sm">Haz clic en el botón azul "Copy address to clipboard"</p>
                <p className="text-xs text-gray-600">La URL quedará copiada en tu portapapeles</p>
              </div>
            </div>
          </div>

          <Alert className="border-purple-400 bg-purple-50">
            <AlertTriangle className="h-4 w-4 text-purple-600" />
            <AlertTitle className="text-sm font-bold">⚠️ Importante</AlertTitle>
            <AlertDescription className="text-xs space-y-1">
              <p>• Esta URL es ÚNICA para tu cuenta - no la compartas públicamente</p>
              <p>• Cada webhook tiene su propia URL diferente</p>
              <p>• Si eliminas el webhook, la URL dejará de funcionar</p>
            </AlertDescription>
          </Alert>

          <div className="border-2 border-dashed border-purple-300 rounded-lg p-4 bg-purple-50">
            <p className="text-xs font-bold text-purple-900 mb-2">📋 Ejemplo de URL:</p>
            <div className="bg-white p-3 rounded border border-purple-200 flex items-center justify-between">
              <code className="text-xs text-purple-700 break-all">{ejemploURL}</code>
              <button
                onClick={() => copiarTexto(ejemploURL, 'Ejemplo de URL')}
                className="ml-2 p-2 hover:bg-purple-100 rounded transition-colors flex-shrink-0"
                title="Copiar ejemplo"
              >
                {urlCopiada ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4 text-purple-600" />
                )}
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Paso 4: Pegar en el código */}
      <Card className="border-2 border-orange-500">
        <CardHeader className="bg-orange-50">
          <CardTitle className="flex items-center gap-2">
            <Badge className="bg-orange-600 text-white w-8 h-8 flex items-center justify-center rounded-full">4</Badge>
            Pegar la URL en Tu Código
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <Alert className="border-orange-400 bg-orange-50">
            <FileCode className="h-4 w-4 text-orange-600" />
            <AlertTitle className="text-sm font-bold">📝 Archivos a Modificar</AlertTitle>
            <AlertDescription className="text-xs mt-2">
              Debes pegar la URL en 2 archivos diferentes dependiendo de qué sistema uses:
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            {/* BotonPanico */}
            <div className="border rounded-lg p-4 bg-white">
              <div className="flex items-center gap-2 mb-3">
                <Badge className="bg-red-600">1</Badge>
                <p className="font-bold text-sm">Botón de Pánico (Alertas de Emergencia)</p>
              </div>
              
              <div className="space-y-2">
                <p className="text-xs text-gray-700">
                  <strong>Archivo:</strong> <code className="bg-gray-100 px-2 py-1 rounded">/src/app/components/BotonPanico.tsx</code>
                </p>
                <p className="text-xs text-gray-700">
                  <strong>Línea:</strong> 30
                </p>
                <div className="bg-gray-900 text-green-400 p-3 rounded mt-2 text-xs font-mono overflow-x-auto">
                  <div className="space-y-1">
                    <div className="text-gray-500">// Línea 30 - ANTES:</div>
                    <div className="text-red-400">const WEBHOOK_URL = 'https://hook.us1.make.com/tu-webhook-id-aqui';</div>
                    <div className="text-gray-500 mt-3">// Línea 30 - DESPUÉS:</div>
                    <div className="text-green-400">const WEBHOOK_URL = 'https://hook.us1.make.com/TU_URL_REAL_AQUI';</div>
                  </div>
                </div>
              </div>
            </div>

            {/* AuditoriaOperativa */}
            <div className="border rounded-lg p-4 bg-white">
              <div className="flex items-center gap-2 mb-3">
                <Badge className="bg-indigo-600">2</Badge>
                <p className="font-bold text-sm">Auditoría Operativa (Análisis con IA)</p>
              </div>
              
              <div className="space-y-2">
                <p className="text-xs text-gray-700">
                  <strong>Archivo:</strong> <code className="bg-gray-100 px-2 py-1 rounded">/src/app/components/AuditoriaOperativa.tsx</code>
                </p>
                <p className="text-xs text-gray-700">
                  <strong>Línea:</strong> 24
                </p>
                <div className="bg-gray-900 text-green-400 p-3 rounded mt-2 text-xs font-mono overflow-x-auto">
                  <div className="space-y-1">
                    <div className="text-gray-500">// Línea 24 - ANTES:</div>
                    <div className="text-red-400">const WEBHOOK_URL = 'https://hook.us1.make.com/tu-webhook-auditoria-aqui';</div>
                    <div className="text-gray-500 mt-3">// Línea 24 - DESPUÉS:</div>
                    <div className="text-green-400">const WEBHOOK_URL = 'https://hook.us1.make.com/TU_URL_REAL_AQUI';</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Alert className="border-orange-400 bg-orange-50">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertTitle className="text-sm font-bold">💡 Consejo Pro</AlertTitle>
            <AlertDescription className="text-xs">
              Puedes usar la MISMA URL para ambos archivos, o crear 2 webhooks diferentes (uno para emergencias, otro para auditorías) si quieres separarlos.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Paso 5: Descomentar código */}
      <Card className="border-2 border-red-500">
        <CardHeader className="bg-red-50">
          <CardTitle className="flex items-center gap-2">
            <Badge className="bg-red-600 text-white w-8 h-8 flex items-center justify-center rounded-full">5</Badge>
            Activar el Envío (Descomentar Código)
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <Alert className="border-red-400 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertTitle className="text-sm font-bold">⚠️ Paso Crítico - NO OLVIDAR</AlertTitle>
            <AlertDescription className="text-xs">
              Por defecto, el código está comentado para evitar errores. Debes descomentarlo para activar el envío real.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            {/* BotonPanico descomentar */}
            <div className="border rounded-lg p-4 bg-white">
              <p className="font-bold text-sm mb-3">En BotonPanico.tsx (líneas 128-137):</p>
              <div className="bg-gray-900 text-green-400 p-3 rounded text-xs font-mono overflow-x-auto">
                <div className="space-y-1">
                  <div className="text-gray-500">// ANTES (comentado - NO funciona):</div>
                  <div className="text-gray-500">/*</div>
                  <div className="text-gray-500">const response = await fetch(WEBHOOK_URL, {'{'}</div>
                  <div className="text-gray-500">  method: 'POST',</div>
                  <div className="text-gray-500">  headers: {'{'} 'Content-Type': 'application/json' {'}'},</div>
                  <div className="text-gray-500">  body: JSON.stringify(payloadMake)</div>
                  <div className="text-gray-500">{'});'}</div>
                  <div className="text-gray-500">*/</div>
                  
                  <div className="text-gray-500 mt-3">// DESPUÉS (descomentado - FUNCIONA):</div>
                  <div className="text-green-400">const response = await fetch(WEBHOOK_URL, {'{'}</div>
                  <div className="text-green-400">  method: 'POST',</div>
                  <div className="text-green-400">  headers: {'{'} 'Content-Type': 'application/json' {'}'},</div>
                  <div className="text-green-400">  body: JSON.stringify(payloadMake)</div>
                  <div className="text-green-400">{'});'}</div>
                  <div className="text-green-400 mt-2">if (!response.ok) {'{'}</div>
                  <div className="text-green-400">  throw new Error('Error al enviar a Make.com');</div>
                  <div className="text-green-400">{'}'}</div>
                </div>
              </div>
            </div>

            {/* AuditoriaOperativa descomentar */}
            <div className="border rounded-lg p-4 bg-white">
              <p className="font-bold text-sm mb-3">En AuditoriaOperativa.tsx (líneas 469-479):</p>
              <div className="bg-gray-900 text-green-400 p-3 rounded text-xs font-mono overflow-x-auto">
                <div className="space-y-1">
                  <div className="text-gray-500">// ANTES (comentado):</div>
                  <div className="text-gray-500">/*</div>
                  <div className="text-gray-500">const response = await fetch(WEBHOOK_URL, ...</div>
                  <div className="text-gray-500">*/</div>
                  
                  <div className="text-gray-500 mt-3">// DESPUÉS (descomentado):</div>
                  <div className="text-green-400">const response = await fetch(WEBHOOK_URL, {'{'}</div>
                  <div className="text-green-400">  method: 'POST',</div>
                  <div className="text-green-400">  headers: {'{'} 'Content-Type': 'application/json' {'}'},</div>
                  <div className="text-green-400">  body: jsonOutput</div>
                  <div className="text-green-400">{'});'}</div>
                </div>
              </div>
            </div>
          </div>

          <Alert className="border-green-400 bg-green-50">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-sm font-bold">✅ Listo para Producción</AlertTitle>
            <AlertDescription className="text-xs">
              Una vez descomentado, cada vez que presiones los botones "DISPARAR ALERTA" o "Enviar a Make.com", se enviará el JSON real a tu webhook.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Paso 6: Probar */}
      <Card className="border-2 border-green-500">
        <CardHeader className="bg-green-50">
          <CardTitle className="flex items-center gap-2">
            <Badge className="bg-green-600 text-white w-8 h-8 flex items-center justify-center rounded-full">6</Badge>
            Probar la Conexión y Ver Datos
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <ArrowRight className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
              <div>
                <p className="font-semibold text-sm">En el dashboard de Figma Make, ve a la tab "Home"</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <ArrowRight className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
              <div>
                <p className="font-semibold text-sm">Busca el card "Webhooks Make.com" y pega tu URL</p>
                <p className="text-xs text-gray-600">La URL que copiaste de Make.com</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <ArrowRight className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
              <div>
                <p className="font-semibold text-sm">Presiona "Enviar a Make.com"</p>
                <p className="text-xs text-gray-600">Esto enviará todos los datos del dashboard</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <ArrowRight className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
              <div>
                <p className="font-semibold text-sm">Ve a Make.com → Tu escenario → Haz clic en "Run once"</p>
                <p className="text-xs text-gray-600">Deberías ver los datos aparecer en el módulo webhook</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
              <div>
                <p className="font-semibold text-sm">Si ves datos, ¡FUNCIONA! 🎉</p>
                <p className="text-xs text-gray-600">Ahora puedes agregar más módulos para enviar emails, SMS, actualizar Google Sheets, etc.</p>
              </div>
            </div>
          </div>

          <div className="border-2 border-dashed border-green-300 rounded-lg p-4 bg-green-50">
            <p className="text-xs font-bold text-green-900 mb-2">📊 Estructura del Payload Enviado:</p>
            <div className="bg-gray-900 p-3 rounded border border-green-200 text-green-400 text-[10px] font-mono overflow-x-auto">
              <pre>{`{
  "event": "cfo_dashboard_update",
  "timestamp": "2026-02-22T...",
  "proyecto": "Ratio Irarrázaval",
  
  "resumen_ejecutivo": {
    "meses_registrados": 2,
    "venta_total_acumulada": 19775000,
    "utilidad_neta_total": 11147985,
    "margen_neto_promedio": "56.37",
    "revpsm_promedio": 395500,
    "payback_meses": 5
  },
  
  "ultimo_mes": {
    "fecha": "2026-02",
    "venta_total": 9025000,
    "utilidad_neta": 5087485,
    "margen_neto_percent": 56.4,
    "revpsm": 361000,
    "status": "GENIO",
    "linea_dominante": "Cafetería"
  },
  
  "lineas_negocio": {
    "cafe": {
      "venta_total": 13447000,
      "porcentaje_participacion": "68.0"
    },
    "hotdesk": {
      "venta_total": 5328000,
      "porcentaje_participacion": "26.9"
    },
    "asesorias": {
      "venta_total": 1000000,
      "porcentaje_participacion": "5.1"
    }
  },
  
  "alertas": {
    "margen_neto_bajo": false,
    "genio_figura": {
      "genio": 2,
      "figura": 0
    },
    "payback_status": {
      "recuperado": 11147985,
      "porcentaje": "58.98",
      "completado": false
    }
  },
  
  "kpis_figma": {
    "admin_utilidad": 5087485,
    "barista1_ticket": 6017,
    "barista2_revpsm": 361000,
    "barista3_conversion": 56.4
  }
}`}</pre>
            </div>
          </div>

          <Alert className="border-green-400 bg-green-50">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-sm font-bold">🎯 Próximos Pasos en Make.com</AlertTitle>
            <AlertDescription className="text-xs space-y-1">
              <p>Después del webhook, puedes agregar módulos para:</p>
              <ul className="list-disc list-inside ml-3 mt-2 space-y-1">
                <li><strong>Google Sheets</strong>: Agregar fila con resumen_ejecutivo</li>
                <li><strong>Gmail</strong>: Enviar reporte si margen_neto_bajo = true</li>
                <li><strong>Slack</strong>: Notificar cuando status = "GENIO"</li>
                <li><strong>SMS (Twilio)</strong>: Alerta si payback completado = true</li>
                <li><strong>Airtable/Notion</strong>: Guardar histórico de KPIs</li>
              </ul>
            </AlertDescription>
          </Alert>

          <div className="border-2 border-cyan-500 rounded-lg p-4 bg-gradient-to-r from-cyan-50 to-blue-50">
            <div className="flex items-center gap-2 mb-3">
              <Sheet className="h-5 w-5 text-cyan-600" />
              <p className="font-bold text-sm text-cyan-900">📊 Template de Google Sheets</p>
            </div>
            <p className="text-xs text-gray-700 mb-3">
              Usa este template como destino para los datos del webhook en Make.com:
            </p>
            <a
              href="https://docs.google.com/spreadsheets/d/1ZA6bh8Ztgjh2Da4IpciHwgMiXZ9rNPFfGQZi1Vpb9ro/edit?gid=0#gid=0"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-blue-600 hover:underline bg-white p-3 rounded border border-cyan-300"
            >
              <ExternalLink className="h-4 w-4 flex-shrink-0" />
              <span className="break-all">Abrir Google Sheet Template - Ratio Irarrázaval</span>
            </a>
            <div className="mt-3 space-y-2">
              <p className="text-xs text-gray-600"><strong>Cómo usarlo:</strong></p>
              <ol className="text-xs text-gray-600 list-decimal list-inside space-y-1 ml-2">
                <li>Abre el link y haz clic en "Archivo" → "Hacer una copia"</li>
                <li>En Make.com, agrega el módulo "Google Sheets → Add a row"</li>
                <li>Conecta tu cuenta de Google y selecciona tu copia</li>
                <li>Mapea los campos del webhook a las columnas del Sheet</li>
                <li>¡Listo! Cada envío agregará una fila automáticamente</li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Troubleshooting */}
      <Card className="border-2 border-yellow-500">
        <CardHeader className="bg-yellow-50">
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-yellow-600" />
            Problemas Comunes y Soluciones
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="border-l-4 border-yellow-500 pl-4">
              <p className="font-bold text-sm mb-1">❌ Error: "Network Error" o "Failed to fetch"</p>
              <p className="text-xs text-gray-700 mb-2">Solución:</p>
              <ul className="text-xs text-gray-600 list-disc list-inside space-y-1">
                <li>Verifica que la URL del webhook sea correcta</li>
                <li>Asegúrate de haber descomentado el bloque fetch()</li>
                <li>Revisa la consola del navegador (F12) para más detalles</li>
              </ul>
            </div>

            <div className="border-l-4 border-yellow-500 pl-4">
              <p className="font-bold text-sm mb-1">❌ No llegan datos a Make.com</p>
              <p className="text-xs text-gray-700 mb-2">Solución:</p>
              <ul className="text-xs text-gray-600 list-disc list-inside space-y-1">
                <li>Haz clic en "Run once" en el escenario de Make ANTES de enviar desde el dashboard</li>
                <li>Verifica que el webhook esté "activo" (círculo verde)</li>
                <li>Revisa que el escenario esté guardado (botón "Save")</li>
              </ul>
            </div>

            <div className="border-l-4 border-yellow-500 pl-4">
              <p className="font-bold text-sm mb-1">❌ Webhook dice "Invalid"</p>
              <p className="text-xs text-gray-700 mb-2">Solución:</p>
              <ul className="text-xs text-gray-600 list-disc list-inside space-y-1">
                <li>Copia nuevamente la URL del webhook (puede haber expirado)</li>
                <li>Asegúrate de no haber modificado la URL accidentalmente</li>
                <li>Verifica que no haya espacios extra al pegar</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recursos adicionales */}
      <Card className="border-2 border-gray-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ExternalLink className="h-5 w-5 text-gray-600" />
            Recursos Adicionales
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <a 
              href="https://www.make.com/en/help/tools/webhooks" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
            >
              <ExternalLink className="h-4 w-4" />
              Documentación oficial de Webhooks en Make
            </a>
            <a 
              href="https://www.make.com/en/help/scenarios/scenario-settings" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
            >
              <ExternalLink className="h-4 w-4" />
              Cómo configurar escenarios en Make
            </a>
            <a 
              href="https://community.make.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
            >
              <ExternalLink className="h-4 w-4" />
              Comunidad Make (foro de ayuda)
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}