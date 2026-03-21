import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { 
  Sheet,
  Cpu,
  Webhook, 
  ExternalLink, 
  Copy, 
  CheckCircle2,
  ArrowRight,
  Sparkles,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Zap,
  Brain,
  FileSpreadsheet,
  Calculator,
  RefreshCw
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export function TutorialMakeGoogleSheets() {
  const [copiado, setCopiado] = useState<string | null>(null);

  const copiarTexto = (texto: string, nombre: string) => {
    navigator.clipboard.writeText(texto);
    setCopiado(nombre);
    toast.success(`${nombre} copiado`, {
      description: 'Pegalo en Make.com'
    });
    setTimeout(() => setCopiado(null), 3000);
  };

  // URL del Blueprint público de Make.com
  const blueprintURL = 'https://us2.make.com/public/shared-scenario/a8AMgDBkt7W/da-pleise';

  // Prompt optimizado para OpenAI
  const promptOpenAI = 'Analiza estos datos financieros del café Ratio Irarrázaval y genera un análisis ejecutivo:\n\n' +
    'DATOS DEL MES:\n' +
    '- Fecha: {{fecha}}\n' +
    '- Venta Cafetería: ${{venta_cafe}}\n' +
    '- Venta Hotdesk: ${{venta_hotdesk}}\n' +
    '- Venta Asesorías: ${{venta_asesoria}}\n' +
    '- Costo Laboral: ${{costo_laboral}}\n' +
    '- Costo Mercadería: ${{costo_mercaderia}}\n' +
    '- Gastos Operacionales: ${{gastos_operacionales}}\n\n' +
    'CONTEXTO DEL NEGOCIO:\n' +
    '- Local: 25 m² en Irarrázaval 2100\n' +
    '- CAPEX Total: $37.697.000 CLP\n' +
    '- Derecho de Llaves: $18.900.000 CLP\n' +
    '- Márgenes de líneas:\n' +
    '  * Cafetería: 68%\n' +
    '  * Hotdesk: 92.5%\n' +
    '  * Asesorías: 100%\n\n' +
    'ANÁLISIS REQUERIDO:\n' +
    '1. Calcula la Venta Total sumando las 3 líneas de negocio\n' +
    '2. Calcula el Margen Bruto (Venta Total - Costo Mercadería)\n' +
    '3. Calcula el Margen Neto (Margen Bruto - Costo Laboral - Gastos Operacionales)\n' +
    '4. Calcula el RevPSM (Venta Total / 25 m²)\n' +
    '5. Identifica la línea dominante (mayor % de ventas)\n' +
    '6. Genera alertas si:\n' +
    '   - Margen Neto < 30% → CRÍTICO\n' +
    '   - RevPSM < $300.000 → BAJO RENDIMIENTO\n' +
    '   - Costo Laboral > 25% de ventas → REVISAR STAFFING\n\n' +
    'FORMATO DE RESPUESTA (devuelve SOLO JSON válido):\n' +
    '{\n' +
    '  "venta_total": 0,\n' +
    '  "margen_bruto": 0,\n' +
    '  "margen_bruto_percent": 0,\n' +
    '  "margen_neto": 0,\n' +
    '  "margen_neto_percent": 0,\n' +
    '  "revpsm": 0,\n' +
    '  "linea_dominante": "",\n' +
    '  "alertas": [],\n' +
    '  "clasificacion": "",\n' +
    '  "recomendacion": ""\n' +
    '}';

  const formulasGoogleSheets = [
    { col: 'H', formula: '=B2+C2+D2', nombre: 'Venta Total' },
    { col: 'I', formula: '=H2-E2', nombre: 'Margen Bruto' },
    { col: 'J', formula: '=IF(H2>0,(I2/H2)*100,0)', nombre: 'Margen Bruto %' },
    { col: 'K', formula: '=I2-F2-G2', nombre: 'Margen Neto' },
    { col: 'L', formula: '=IF(H2>0,(K2/H2)*100,0)', nombre: 'Margen Neto %' },
    { col: 'M', formula: '=H2/25', nombre: 'RevPSM' },
    { col: 'N', formula: '=IF(F2>0,(F2/H2)*100,0)', nombre: '% Costo Laboral' },
    { col: 'O', formula: '=IF(L2>=35,"🚀 GENIO",IF(L2>=30,"📊 FIGURA","🔴 CRÍTICO"))', nombre: 'Clasificación' },
    { col: 'P', formula: '=IF(B2=0,"⚠️ CAFÉ PARADO",IF(M2<300000,"⚠️ REVPSM BAJO","✅ OK"))', nombre: 'Alertas' },
    { col: 'Q', formula: '=IF(B2>C2,IF(B2>D2,"Cafetería","Asesorías"),IF(C2>D2,"Hotdesk","Asesorías"))', nombre: 'Línea Dominante' },
    { col: 'R', formula: '=SUM(K$2:K2)', nombre: 'Utilidad Acumulada' },
    { col: 'S', formula: '=IF($R2>0,($R2/37697000)*100,0)', nombre: '% Recuperación CAPEX' },
    { col: 'T', formula: '=IF(K2>0,(37697000-R2)/K2,999)', nombre: 'Meses Restantes Payback' },
    { col: 'U', formula: '=IF(L2<30,"🔴 REVISAR COSTOS",IF(T2<6,"🎯 PAYBACK CERCA","✅ EN CAMINO"))', nombre: 'Status Operativo' }
  ];

  const jsonMakeConfig = {
    "scenario": {
      "name": "CFO Dashboard - Auto Update Google Sheets con OpenAI",
      "description": "Recibe datos del dashboard, analiza con OpenAI, y actualiza Google Sheets automáticamente"
    },
    "modules": [
      {
        "id": 1,
        "type": "webhooks:CustomWebhook",
        "name": "Recibir datos del dashboard",
        "config": {
          "hookName": "cfo_dashboard_data",
          "dataStructure": {
            "fecha": "string",
            "venta_cafe": "number",
            "venta_hotdesk": "number",
            "venta_asesoria": "number",
            "costo_laboral": "number",
            "costo_mercaderia": "number",
            "gastos_operacionales": "number"
          }
        }
      },
      {
        "id": 2,
        "type": "openai:CreateCompletion",
        "name": "Analizar con OpenAI GPT-4",
        "config": {
          "model": "gpt-4",
          "prompt": "{{ver_prompt_arriba}}",
          "temperature": 0.3,
          "maxTokens": 500,
          "responseFormat": "json_object"
        }
      },
      {
        "id": 3,
        "type": "google-sheets:AddRow",
        "name": "Agregar fila a Google Sheet",
        "config": {
          "spreadsheetId": "TU_SPREADSHEET_ID_AQUI",
          "sheetName": "DatosFinancieros",
          "values": [
            "{{1.fecha}}",
            "{{1.venta_cafe}}",
            "{{1.venta_hotdesk}}",
            "{{1.venta_asesoria}}",
            "{{1.costo_mercaderia}}",
            "{{1.costo_laboral}}",
            "{{1.gastos_operacionales}}",
            "=B{{ROW}}+C{{ROW}}+D{{ROW}}",
            "=H{{ROW}}-E{{ROW}}",
            "=IF(H{{ROW}}>0,(I{{ROW}}/H{{ROW}})*100,0)",
            "=I{{ROW}}-F{{ROW}}-G{{ROW}}",
            "=IF(H{{ROW}}>0,(K{{ROW}}/H{{ROW}})*100,0)",
            "=H{{ROW}}/25",
            "=IF(F{{ROW}}>0,(F{{ROW}}/H{{ROW}})*100,0)",
            "{{2.clasificacion}}",
            "{{2.alertas}}",
            "{{2.linea_dominante}}",
            "=SUM(K$2:K{{ROW}})",
            "=IF($R{{ROW}}>0,($R{{ROW}}/37697000)*100,0)",
            "=IF(K{{ROW}}>0,(37697000-R{{ROW}})/K{{ROW}},999)",
            "=IF(L{{ROW}}<30,\"🔴 REVISAR COSTOS\",IF(T{{ROW}}<6,\"🎯 PAYBACK CERCA\",\"✅ EN CAMINO\"))"
          ]
        }
      },
      {
        "id": 4,
        "type": "tools:SetVariable",
        "name": "Notificar éxito",
        "config": {
          "variableName": "status",
          "value": "✅ Datos procesados y guardados en Google Sheets"
        }
      }
    ]
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Hero Header */}
      <Card className="border-2 border-cyan-500 bg-gradient-to-r from-cyan-50 via-blue-50 to-purple-50">
        <CardHeader>
          <CardTitle className="text-2xl sm:text-3xl flex items-center gap-2 flex-wrap">
            <Sparkles className="h-8 w-8 text-cyan-600" />
            Make.com + Google Sheets + OpenAI
            <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
              Automatización Total
            </Badge>
          </CardTitle>
          <CardDescription className="text-base">
            Implementación paso a paso del flujo completo: Dashboard → Make.com → OpenAI → Google Sheets → Figma
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="border-cyan-500 bg-white">
            <Zap className="h-5 w-5 text-cyan-600" />
            <AlertTitle className="text-base font-bold">🚀 Por qué esto salva tu inversión de $37.697.000</AlertTitle>
            <AlertDescription className="text-sm space-y-2 mt-2">
              <p>
                Al automatizar las <strong>21 columnas (A-U)</strong> en Google Sheets, tu dashboard en Figma Make mostrará:
              </p>
              <ul className="list-disc list-inside space-y-1 text-xs ml-2">
                <li><strong>Día Malo (Imagen)</strong>: Si Café = $0 por máquina rota, la columna U mostrará "🔴 REVISAR COSTOS"</li>
                <li><strong>Genio de Asesorías</strong>: Cuando Asesorías marque ingreso alto, el ROI (columna S) saltará visualmente</li>
                <li><strong>Payback Automático</strong>: La columna T calculará meses restantes para recuperar $18.900.000 del Derecho de Llaves</li>
                <li><strong>Alertas Inteligentes</strong>: OpenAI detectará patrones críticos y generará recomendaciones en tiempo real</li>
              </ul>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* NUEVO: Blueprint Público de Make.com - IMPORTAR EN 1 CLIC */}
      <Card className="border-4 border-gradient-to-r from-purple-500 to-pink-500 bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 bg-gradient-to-br from-purple-600 to-pink-600 text-white text-sm px-4 py-2 rounded-bl-xl font-bold flex items-center gap-1 shadow-lg animate-pulse">
          <Sparkles className="h-4 w-4" />
          ¡ATAJO RÁPIDO!
        </div>
        <CardHeader>
          <CardTitle className="text-xl sm:text-2xl flex items-center gap-2 pr-32">
            <Zap className="h-7 w-7 text-purple-600" />
            🎁 Blueprint Público: Importa el Escenario Completo en 1 Clic
          </CardTitle>
          <CardDescription className="text-base font-semibold text-purple-900">
            ¿No quieres construir módulo por módulo? Usa este link para importar TODO el escenario pre-configurado
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="border-purple-600 bg-white shadow-lg">
            <Sparkles className="h-5 w-5 text-purple-600" />
            <AlertTitle className="text-base font-bold text-purple-900">⚡ Ahorra 30 minutos de configuración</AlertTitle>
            <AlertDescription className="text-sm mt-2 space-y-3">
              <p className="font-semibold">
                Este Blueprint público incluye <strong>TODO pre-configurado</strong>:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                  <p className="font-bold text-purple-900 mb-1 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Módulos incluidos:
                  </p>
                  <ul className="space-y-0.5 ml-2">
                    <li>✅ Custom Webhook (listo para recibir)</li>
                    <li>✅ OpenAI GPT-4 (con prompt optimizado)</li>
                    <li>✅ Google Sheets Add Row (con fórmulas)</li>
                    <li>✅ Variables y rutas configuradas</li>
                  </ul>
                </div>
                <div className="bg-pink-50 p-3 rounded-lg border border-pink-200">
                  <p className="font-bold text-pink-900 mb-1 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Solo debes:
                  </p>
                  <ul className="space-y-0.5 ml-2">
                    <li>1️⃣ Hacer clic en el link</li>
                    <li>2️⃣ Presionar "Use Blueprint"</li>
                    <li>3️⃣ Conectar tus cuentas (Google, OpenAI)</li>
                    <li>4️⃣ ¡Listo para usar! 🎉</li>
                  </ul>
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4 rounded-lg shadow-lg">
                <p className="text-white text-xs font-bold mb-2 flex items-center gap-1">
                  <ExternalLink className="h-4 w-4" />
                  ENLACE AL BLUEPRINT PÚBLICO:
                </p>
                <div className="bg-white p-3 rounded-lg flex flex-col sm:flex-row items-center gap-3">
                  <code className="text-xs text-purple-700 break-all flex-1 font-mono">
                    {blueprintURL}
                  </code>
                  <div className="flex gap-2 flex-shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copiarTexto(blueprintURL, 'Blueprint URL')}
                      className="text-xs"
                    >
                      {copiado === 'Blueprint URL' ? (
                        <><CheckCircle2 className="h-3 w-3 mr-1" /> Copiado</>
                      ) : (
                        <><Copy className="h-3 w-3 mr-1" /> Copiar</>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      asChild
                      className="bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      <a href={blueprintURL} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Abrir
                      </a>
                    </Button>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-3">
                <p className="text-xs font-bold text-yellow-900 mb-1 flex items-center gap-1">
                  <AlertTriangle className="h-4 w-4" />
                  📝 Pasos después de importar:
                </p>
                <ol className="text-xs space-y-1 ml-4 list-decimal">
                  <li>Haz clic en "Use Blueprint" en Make.com</li>
                  <li>El escenario se copiará a tu cuenta</li>
                  <li>Haz clic en el módulo OpenAI → Conecta tu cuenta de OpenAI (necesitas API Key)</li>
                  <li>Haz clic en el módulo Google Sheets → Conecta tu cuenta de Google</li>
                  <li>Selecciona tu Google Sheet (copia el template del Paso 1 abajo)</li>
                  <li>Activa el escenario y copia la URL del webhook</li>
                  <li>Pega la URL en el card "Webhooks Make.com" del Home</li>
                </ol>
              </div>
            </AlertDescription>
          </Alert>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              asChild
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-6 text-base shadow-lg"
            >
              <a href={blueprintURL} target="_blank" rel="noopener noreferrer">
                <Zap className="mr-2 h-5 w-5" />
                Importar Blueprint en Make.com
                <ExternalLink className="ml-2 h-5 w-5" />
              </a>
            </Button>
            <Button
              variant="outline"
              className="flex-1 border-2 border-purple-600 text-purple-600 hover:bg-purple-50 py-6 text-base font-semibold"
              onClick={() => {
                const paso1 = document.getElementById('paso-1-sheets');
                if (paso1) paso1.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <ArrowRight className="mr-2 h-5 w-5" />
              O Sigue el Tutorial Paso a Paso
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Diagrama de Flujo */}
      <Card className="border-2 border-indigo-500">
        <CardHeader className="bg-indigo-50">
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-indigo-600" />
            Flujo de Automatización Completo
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4 bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-lg border-2 border-indigo-200">
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="bg-blue-600 text-white p-4 rounded-lg shadow-lg">
                <FileSpreadsheet className="h-8 w-8" />
              </div>
              <p className="text-xs font-bold">1. Dashboard Figma Make</p>
              <p className="text-[10px] text-gray-600">Ingresas datos mensuales</p>
            </div>

            <ArrowRight className="h-6 w-6 text-indigo-400 rotate-90 lg:rotate-0" />

            <div className="flex flex-col items-center gap-2 text-center">
              <div className="bg-purple-600 text-white p-4 rounded-lg shadow-lg">
                <Webhook className="h-8 w-8" />
              </div>
              <p className="text-xs font-bold">2. Webhook Make.com</p>
              <p className="text-[10px] text-gray-600">Recibe JSON del dashboard</p>
            </div>

            <ArrowRight className="h-6 w-6 text-indigo-400 rotate-90 lg:rotate-0" />

            <div className="flex flex-col items-center gap-2 text-center">
              <div className="bg-green-600 text-white p-4 rounded-lg shadow-lg">
                <Brain className="h-8 w-8" />
              </div>
              <p className="text-xs font-bold">3. OpenAI GPT-4</p>
              <p className="text-[10px] text-gray-600">Analiza y clasifica</p>
            </div>

            <ArrowRight className="h-6 w-6 text-indigo-400 rotate-90 lg:rotate-0" />

            <div className="flex flex-col items-center gap-2 text-center">
              <div className="bg-orange-600 text-white p-4 rounded-lg shadow-lg">
                <Sheet className="h-8 w-8" />
              </div>
              <p className="text-xs font-bold">4. Google Sheets</p>
              <p className="text-[10px] text-gray-600">Guarda con fórmulas</p>
            </div>

            <ArrowRight className="h-6 w-6 text-indigo-400 rotate-90 lg:rotate-0" />

            <div className="flex flex-col items-center gap-2 text-center">
              <div className="bg-cyan-600 text-white p-4 rounded-lg shadow-lg">
                <TrendingUp className="h-8 w-8" />
              </div>
              <p className="text-xs font-bold">5. Gráficos Actualizados</p>
              <p className="text-[10px] text-gray-600">Dashboard se actualiza solo</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* PASO 1: Configurar Google Sheets */}
      <Card className="border-2 border-green-500" id="paso-1-sheets">
        <CardHeader className="bg-green-50">
          <CardTitle className="flex items-center gap-2">
            <Badge className="bg-green-600 text-white w-8 h-8 flex items-center justify-center rounded-full">1</Badge>
            Configurar Google Sheets con las 21 Columnas
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <Alert className="border-green-500 bg-green-50">
            <Sheet className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-sm font-bold">📊 Template Pre-configurado</AlertTitle>
            <AlertDescription className="text-xs mt-2">
              <p className="mb-2">Usa este Google Sheet ya configurado con todas las fórmulas:</p>
              <a
                href="https://docs.google.com/spreadsheets/d/1ZA6bh8Ztgjh2Da4IpciHwgMiXZ9rNPFfGQZi1Vpb9ro/edit?gid=0#gid=0"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-blue-600 hover:underline bg-white p-2 rounded border"
              >
                <ExternalLink className="h-3 w-3" />
                Abrir Template - Ratio Irarrázaval CFO Dashboard
              </a>
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            <p className="text-sm font-bold">Estructura de Columnas (A-U):</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
              <div className="bg-blue-50 p-3 rounded border border-blue-200">
                <p className="font-bold text-blue-900 mb-2">📥 Columnas de Entrada (A-G)</p>
                <ul className="space-y-1">
                  <li><Badge variant="outline" className="mr-2">A</Badge>Fecha</li>
                  <li><Badge variant="outline" className="mr-2">B</Badge>Venta Cafetería</li>
                  <li><Badge variant="outline" className="mr-2">C</Badge>Venta Hotdesk</li>
                  <li><Badge variant="outline" className="mr-2">D</Badge>Venta Asesorías</li>
                  <li><Badge variant="outline" className="mr-2">E</Badge>Costo Mercadería</li>
                  <li><Badge variant="outline" className="mr-2">F</Badge>Costo Laboral</li>
                  <li><Badge variant="outline" className="mr-2">G</Badge>Gastos Operacionales</li>
                </ul>
              </div>

              <div className="bg-purple-50 p-3 rounded border border-purple-200">
                <p className="font-bold text-purple-900 mb-2">🔢 Columnas Calculadas (H-U)</p>
                <ul className="space-y-1">
                  <li><Badge variant="outline" className="mr-2">H</Badge>Venta Total (=B+C+D)</li>
                  <li><Badge variant="outline" className="mr-2">I</Badge>Margen Bruto</li>
                  <li><Badge variant="outline" className="mr-2">J</Badge>Margen Bruto %</li>
                  <li><Badge variant="outline" className="mr-2">K</Badge>Margen Neto (Utilidad)</li>
                  <li><Badge variant="outline" className="mr-2">L</Badge>Margen Neto %</li>
                  <li><Badge variant="outline" className="mr-2">M</Badge>RevPSM ($/m²)</li>
                  <li><Badge variant="outline" className="mr-2">N</Badge>% Costo Laboral</li>
                  <li><Badge variant="outline" className="mr-2">O</Badge>Clasificación (Genio/Figura)</li>
                  <li><Badge variant="outline" className="mr-2">P</Badge>Alertas</li>
                  <li><Badge variant="outline" className="mr-2">Q</Badge>Línea Dominante</li>
                  <li><Badge variant="outline" className="mr-2">R</Badge>Utilidad Acumulada</li>
                  <li><Badge variant="outline" className="mr-2">S</Badge>% Recuperación CAPEX</li>
                  <li><Badge variant="outline" className="mr-2">T</Badge>Meses Restantes Payback</li>
                  <li><Badge variant="outline" className="mr-2">U</Badge>Status Operativo</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded border border-gray-300">
            <p className="text-xs font-bold mb-3 flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              Fórmulas Clave para Copiar y Pegar:
            </p>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {formulasGoogleSheets.map((f, idx) => (
                <div key={idx} className="flex items-center justify-between bg-white p-2 rounded border border-gray-200 text-[11px]">
                  <div className="flex-1">
                    <span className="font-bold text-blue-600 mr-2">Col {f.col}:</span>
                    <span className="text-gray-700">{f.nombre}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <code className="bg-gray-100 px-2 py-1 rounded font-mono text-[10px]">{f.formula}</code>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copiarTexto(f.formula, `Fórmula ${f.col}`)}
                      className="h-6 w-6 p-0"
                    >
                      {copiado === `Fórmula ${f.col}` ? (
                        <CheckCircle2 className="h-3 w-3 text-green-600" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Alert className="border-orange-500 bg-orange-50">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertTitle className="text-sm font-bold">⚠️ CRÍTICO: Configuración de Fórmulas en Make</AlertTitle>
            <AlertDescription className="text-xs mt-2">
              <p className="font-semibold mb-1">Las columnas H-U NO deben recibir datos crudos de Make.com, sino FÓRMULAS.</p>
              <p>Ejemplo correcto en Make.com:</p>
              <div className="bg-gray-900 text-green-400 p-2 rounded mt-2 font-mono text-[10px]">
                <code>"=B2+C2+D2"</code> ← Esto es un STRING que Google interpreta como fórmula
              </div>
              <p className="mt-2">❌ Incorrecto: <code>15886000</code> (número crudo)</p>
              <p>✅ Correcto: <code>"=B2+C2+D2"</code> (fórmula como string)</p>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* PASO 2: Configurar OpenAI en Make */}
      <Card className="border-2 border-blue-500">
        <CardHeader className="bg-blue-50">
          <CardTitle className="flex items-center gap-2">
            <Badge className="bg-blue-600 text-white w-8 h-8 flex items-center justify-center rounded-full">2</Badge>
            Configurar Módulo OpenAI en Make.com
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <ArrowRight className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
              <div>
                <p className="font-semibold text-sm">Después del Webhook, agrega el módulo "OpenAI → Create a Completion"</p>
                <p className="text-xs text-gray-600">Busca "OpenAI" en el selector de módulos</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <ArrowRight className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
              <div>
                <p className="font-semibold text-sm">Configuración del módulo:</p>
                <ul className="text-xs text-gray-600 list-disc list-inside ml-3 space-y-1">
                  <li><strong>Model:</strong> gpt-4 (o gpt-3.5-turbo para más rápido/barato)</li>
                  <li><strong>Temperature:</strong> 0.3 (para respuestas consistentes)</li>
                  <li><strong>Max Tokens:</strong> 500</li>
                  <li><strong>Response Format:</strong> JSON Object</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded border border-gray-300">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold flex items-center gap-2">
                <Brain className="h-4 w-4 text-blue-600" />
                Prompt Optimizado para OpenAI (copiar y pegar):
              </p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => copiarTexto(promptOpenAI, 'Prompt de OpenAI')}
                className="text-xs"
              >
                {copiado === 'Prompt de OpenAI' ? (
                  <><CheckCircle2 className="h-3 w-3 mr-1" /> Copiado</>
                ) : (
                  <><Copy className="h-3 w-3 mr-1" /> Copiar Prompt</>
                )}
              </Button>
            </div>
            <pre className="bg-gray-900 text-green-400 p-3 rounded text-[10px] font-mono overflow-x-auto max-h-96">
              {promptOpenAI}
            </pre>
          </div>

          <Alert className="border-blue-500 bg-blue-50">
            <Cpu className="h-4 w-4 text-blue-600" />
            <AlertTitle className="text-sm font-bold">💡 Mapeo de Variables</AlertTitle>
            <AlertDescription className="text-xs mt-2">
              <p className="mb-2">En el prompt, reemplaza los placeholders con los datos del webhook:</p>
              <ul className="space-y-1 list-disc list-inside ml-2">
                <li><code>{'{{fecha}}'}</code> → Mapea a <code>1.fecha</code> del módulo webhook</li>
                <li><code>{'{{venta_cafe}}'}</code> → Mapea a <code>1.venta_cafe</code></li>
                <li><code>{'{{venta_hotdesk}}'}</code> → Mapea a <code>1.venta_hotdesk</code></li>
                <li>etc...</li>
              </ul>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* PASO 3: Conectar Google Sheets */}
      <Card className="border-2 border-orange-500">
        <CardHeader className="bg-orange-50">
          <CardTitle className="flex items-center gap-2">
            <Badge className="bg-orange-600 text-white w-8 h-8 flex items-center justify-center rounded-full">3</Badge>
            Agregar Módulo Google Sheets (Add a Row)
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <ArrowRight className="h-5 w-5 text-orange-600 mt-1 flex-shrink-0" />
              <div>
                <p className="font-semibold text-sm">Agrega el módulo "Google Sheets → Add a Row"</p>
                <p className="text-xs text-gray-600">Conecta tu cuenta de Google cuando te lo pida</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <ArrowRight className="h-5 w-5 text-orange-600 mt-1 flex-shrink-0" />
              <div>
                <p className="font-semibold text-sm">Selecciona tu Google Sheet copiado del template</p>
                <p className="text-xs text-gray-600">Hoja: "DatosFinancieros"</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded border border-gray-300">
            <p className="text-xs font-bold mb-3">📊 Mapeo de Columnas (exactamente en este orden):</p>
            <div className="space-y-2 text-[11px]">
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-blue-50 p-2 rounded border border-blue-200">
                  <p className="font-bold text-blue-900 mb-1">Columnas A-G (Datos Crudos)</p>
                  <ul className="space-y-1">
                    <li><Badge variant="outline" className="mr-1 text-[9px]">A</Badge><code>{'{{1.fecha}}'}</code></li>
                    <li><Badge variant="outline" className="mr-1 text-[9px]">B</Badge><code>{'{{1.venta_cafe}}'}</code></li>
                    <li><Badge variant="outline" className="mr-1 text-[9px]">C</Badge><code>{'{{1.venta_hotdesk}}'}</code></li>
                    <li><Badge variant="outline" className="mr-1 text-[9px]">D</Badge><code>{'{{1.venta_asesoria}}'}</code></li>
                    <li><Badge variant="outline" className="mr-1 text-[9px]">E</Badge><code>{'{{1.costo_mercaderia}}'}</code></li>
                    <li><Badge variant="outline" className="mr-1 text-[9px]">F</Badge><code>{'{{1.costo_laboral}}'}</code></li>
                    <li><Badge variant="outline" className="mr-1 text-[9px]">G</Badge><code>{'{{1.gastos_operacionales}}'}</code></li>
                  </ul>
                </div>

                <div className="bg-purple-50 p-2 rounded border border-purple-200">
                  <p className="font-bold text-purple-900 mb-1">Columnas H-U (Fórmulas)</p>
                  <ul className="space-y-1 font-mono text-[10px]">
                    <li><Badge variant="outline" className="mr-1 text-[9px]">H</Badge><code>"=B2+C2+D2"</code></li>
                    <li><Badge variant="outline" className="mr-1 text-[9px]">I</Badge><code>"=H2-E2"</code></li>
                    <li><Badge variant="outline" className="mr-1 text-[9px]">J</Badge><code>"=IF(H2&gt;0,(I2/H2)*100,0)"</code></li>
                    <li><Badge variant="outline" className="mr-1 text-[9px]">K</Badge><code>"=I2-F2-G2"</code></li>
                    <li><Badge variant="outline" className="mr-1 text-[9px]">L</Badge><code>"=IF(H2&gt;0,(K2/H2)*100,0)"</code></li>
                    <li className="text-[9px] text-gray-600">... (ver lista completa arriba)</li>
                  </ul>
                </div>
              </div>

              <Alert className="border-red-500 bg-red-50 mt-3">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertTitle className="text-xs font-bold">🚨 ERROR COMÚN</AlertTitle>
                <AlertDescription className="text-[10px]">
                  <p className="font-semibold mb-1">NO envíes las fórmulas con el número de fila hardcodeado (ej: "=B2+C2+D2")</p>
                  <p className="mb-1">En Make, usa el placeholder de fila dinámica:</p>
                  <code className="bg-gray-900 text-green-400 p-1 rounded">"=B{'{{row}}'}+C{'{{row}}'}+D{'{{row}}'}"</code>
                  <p className="mt-1">Esto asegura que cada fila nueva tenga las referencias correctas.</p>
                </AlertDescription>
              </Alert>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* PASO 4: JSON de Configuración Completo */}
      <Card className="border-2 border-purple-500">
        <CardHeader className="bg-purple-50">
          <CardTitle className="flex items-center gap-2">
            <Badge className="bg-purple-600 text-white w-8 h-8 flex items-center justify-center rounded-full">4</Badge>
            JSON Final de Configuración
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <Alert className="border-purple-500 bg-purple-50">
            <FileSpreadsheet className="h-4 w-4 text-purple-600" />
            <AlertTitle className="text-sm font-bold">📦 Configuración Completa del Escenario Make.com</AlertTitle>
            <AlertDescription className="text-xs mt-2">
              Este JSON describe la configuración completa. Úsalo como referencia al construir tu escenario.
            </AlertDescription>
          </Alert>

          <div className="bg-gray-50 p-4 rounded border border-gray-300">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold">Blueprint del Escenario (referencia):</p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => copiarTexto(JSON.stringify(jsonMakeConfig, null, 2), 'JSON Config')}
                className="text-xs"
              >
                {copiado === 'JSON Config' ? (
                  <><CheckCircle2 className="h-3 w-3 mr-1" /> Copiado</>
                ) : (
                  <><Copy className="h-3 w-3 mr-1" /> Copiar JSON</>
                )}
              </Button>
            </div>
            <pre className="bg-gray-900 text-green-400 p-3 rounded text-[9px] font-mono overflow-x-auto max-h-96">
              {JSON.stringify(jsonMakeConfig, null, 2)}
            </pre>
          </div>
        </CardContent>
      </Card>

      {/* PASO 5: Casos de Uso Reales */}
      <Card className="border-2 border-green-500">
        <CardHeader className="bg-green-50">
          <CardTitle className="flex items-center gap-2">
            <Badge className="bg-green-600 text-white w-8 h-8 flex items-center justify-center rounded-full">5</Badge>
            Casos de Uso: Por qué esto salva tu inversión
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-4">
            {/* Caso 1: Día Malo */}
            <Card className="border-red-200 bg-red-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  Caso 1: El "Día Malo" - Máquina de Café Rota
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs">
                <div className="bg-white p-3 rounded border border-red-200">
                  <p className="font-bold mb-2">📊 Datos que entran al Sheet:</p>
                  <ul className="space-y-1 list-disc list-inside ml-2">
                    <li>Columna B (Café): <strong className="text-red-600">$0</strong> ← Máquina rota</li>
                    <li>Columna C (Hotdesk): $2.500.000 ← Normal</li>
                    <li>Columna D (Asesorías): $500.000 ← Normal</li>
                  </ul>
                  <div className="mt-3 p-2 bg-red-100 rounded">
                    <p className="font-bold text-red-900">🚨 Alertas Automáticas:</p>
                    <ul className="mt-1 space-y-1">
                      <li>• Columna P: <Badge className="bg-red-600 text-white">"⚠️ CAFÉ PARADO"</Badge></li>
                      <li>• Columna U: <Badge className="bg-red-600 text-white">"🔴 REVISAR COSTOS"</Badge></li>
                      <li>• OpenAI detecta: "Venta de cafetería en $0 - Posible falla operativa"</li>
                    </ul>
                  </div>
                  <div className="mt-3 p-2 bg-blue-100 rounded">
                    <p className="font-bold text-blue-900">📈 En el Dashboard de Figma:</p>
                    <ul className="mt-1 space-y-1">
                      <li>• Gráfico de ventas por línea muestra Café en ROJO</li>
                      <li>• Card de alertas se ilumina en rojo con "🔴 CRÍTICO"</li>
                      <li>• RevPSM baja automáticamente a $120.000/m² (vs $635.000 normal)</li>
                    </ul>
                  </div>
                </div>
                <p className="text-[10px] text-gray-600 italic">
                  💡 Resultado: Detectas el problema en tiempo real y puedes actuar (llamar al técnico, avisar a clientes, activar plan B)
                </p>
              </CardContent>
            </Card>

            {/* Caso 2: Genio de Asesorías */}
            <Card className="border-green-200 bg-green-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-green-600" />
                  Caso 2: El "Genio" - Mes de Asesorías Explosivo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs">
                <div className="bg-white p-3 rounded border border-green-200">
                  <p className="font-bold mb-2">📊 Datos que entran al Sheet:</p>
                  <ul className="space-y-1 list-disc list-inside ml-2">
                    <li>Columna B (Café): $10.500.000 ← Bueno</li>
                    <li>Columna C (Hotdesk): $3.200.000 ← Bueno</li>
                    <li>Columna D (Asesorías): <strong className="text-green-600">$8.000.000</strong> ← ¡EXPLOSIVO! (100% margen)</li>
                  </ul>
                  <div className="mt-3 p-2 bg-green-100 rounded">
                    <p className="font-bold text-green-900">🎯 Métricas Calculadas:</p>
                    <ul className="mt-1 space-y-1">
                      <li>• Columna H (Venta Total): <strong>$21.700.000</strong></li>
                      <li>• Columna K (Utilidad Neta): <strong>$11.200.000</strong></li>
                      <li>• Columna L (Margen Neto): <strong>51.6%</strong> → Columna O: <Badge className="bg-green-600 text-white">"🚀 GENIO"</Badge></li>
                      <li>• Columna R (Acumulado): <strong>$22.347.985</strong></li>
                      <li>• Columna S (% Recuperación): <strong>59.3%</strong> del CAPEX</li>
                      <li>• Columna T (Payback): <strong>1.4 meses restantes</strong> ← ¡CERCA!</li>
                    </ul>
                  </div>
                  <div className="mt-3 p-2 bg-purple-100 rounded">
                    <p className="font-bold text-purple-900">📈 En el Dashboard de Figma:</p>
                    <ul className="mt-1 space-y-1">
                      <li>• Card "Genio y Figura" muestra <Badge className="bg-green-600">🚀 GENIO</Badge></li>
                      <li>• Gráfico de payback salta a 59% con barra verde brillante</li>
                      <li>• Proyección muestra: "Payback completo en ~1 mes más"</li>
                      <li>• Insight: "Asesorías es tu línea dominante con 37% de ventas"</li>
                    </ul>
                  </div>
                </div>
                <p className="text-[10px] text-gray-600 italic">
                  💡 Resultado: Validas que el Derecho de Llaves ($18.900.000) fue una GRAN decisión. Los $8M en asesorías justifican toda la inversión.
                </p>
              </CardContent>
            </Card>

            {/* Caso 3: Alertas Inteligentes */}
            <Card className="border-orange-200 bg-orange-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-orange-600" />
                  Caso 3: Alerta de Costo Laboral Alto
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs">
                <div className="bg-white p-3 rounded border border-orange-200">
                  <p className="font-bold mb-2">📊 Datos que entran al Sheet:</p>
                  <ul className="space-y-1 list-disc list-inside ml-2">
                    <li>Columna H (Venta Total): $12.000.000</li>
                    <li>Columna F (Costo Laboral): <strong className="text-orange-600">$3.500.000</strong> ← 29.2% de ventas</li>
                  </ul>
                  <div className="mt-3 p-2 bg-orange-100 rounded">
                    <p className="font-bold text-orange-900">⚠️ OpenAI Detecta:</p>
                    <ul className="mt-1 space-y-1">
                      <li>• Columna N: <strong>29.2%</strong> (óptimo es 20-22%)</li>
                      <li>• Alerta: "REVISAR STAFFING - Costo laboral 7 puntos sobre target"</li>
                      <li>• Recomendación: "Considera optimizar turnos o reducir horas extra"</li>
                    </ul>
                  </div>
                  <div className="mt-3 p-2 bg-blue-100 rounded">
                    <p className="font-bold text-blue-900">📱 Notificación Automática:</p>
                    <ul className="mt-1 space-y-1">
                      <li>• Make.com envía email/SMS al Admin</li>
                      <li>• Asunto: "⚠️ Ratio Irarrázaval - Costo Laboral Alto"</li>
                      <li>• Incluye análisis completo de OpenAI con sugerencias</li>
                    </ul>
                  </div>
                </div>
                <p className="text-[10px] text-gray-600 italic">
                  💡 Resultado: Detectas problemas antes de que afecten gravemente la rentabilidad. Puedes actuar proactivamente.
                </p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Resumen Final */}
      <Card className="border-2 border-cyan-500 bg-gradient-to-r from-cyan-50 to-blue-50">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <CheckCircle2 className="h-6 w-6 text-green-600" />
            Resumen: Todo Conectado en 5 Pasos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <Badge className="bg-green-600 text-white flex-shrink-0">1</Badge>
              <p>Configura Google Sheet con 21 columnas (A-U) usando el template</p>
            </div>
            <div className="flex items-start gap-2">
              <Badge className="bg-green-600 text-white flex-shrink-0">2</Badge>
              <p>En Make.com: Webhook → OpenAI (con prompt optimizado) → Google Sheets</p>
            </div>
            <div className="flex items-start gap-2">
              <Badge className="bg-green-600 text-white flex-shrink-0">3</Badge>
              <p>Las columnas H-U reciben FÓRMULAS (strings), no datos crudos</p>
            </div>
            <div className="flex items-start gap-2">
              <Badge className="bg-green-600 text-white flex-shrink-0">4</Badge>
              <p>Cada envío desde el dashboard actualiza automáticamente gráficos y payback</p>
            </div>
            <div className="flex items-start gap-2">
              <Badge className="bg-green-600 text-white flex-shrink-0">5</Badge>
              <p>OpenAI + Sheets detectan "Días Malos" y celebran "Genios" automáticamente</p>
            </div>
          </div>

          <Alert className="border-cyan-500 bg-white mt-4">
            <Sparkles className="h-5 w-5 text-cyan-600" />
            <AlertTitle className="text-base font-bold">🎉 ¡Sistema Completo Implementado!</AlertTitle>
            <AlertDescription className="text-sm mt-2">
              <p className="font-semibold mb-2">Ahora tienes:</p>
              <ul className="space-y-1 list-disc list-inside ml-2 text-xs">
                <li>Dashboard CFO con <strong>8 tabs completas</strong></li>
                <li>Webhook activo a Make.com</li>
                <li>OpenAI analizando tus datos en tiempo real</li>
                <li>Google Sheets calculando 14 métricas automáticas</li>
                <li>Alertas inteligentes (Días Malos, Genios, Payback)</li>
                <li>Visualización del progreso del Derecho de Llaves ($18.900.000)</li>
                <li>Sistema "Genio y Figura" basado en utilidad neta real</li>
              </ul>
              <p className="mt-3 text-sm font-bold text-cyan-900">
                ✅ Tu inversión de $37.697.000 está ahora completamente monitoreada y protegida.
              </p>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}