import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Upload, CheckCircle2, XCircle, Loader2, Download, AlertTriangle } from 'lucide-react';
import { useDashboard } from '../contexts/DashboardContext';
import type { RegistroMensualTriple, DatoDiario } from '../contexts/DashboardContext';
import { toast } from 'sonner';

const COGS_CAFE_PERCENT = 0.32;
const COGS_HOTDESK_PERCENT = 0.075;
const CAPEX_TOTAL = 37697000;
const DERECHO_LLAVES = 18900000;
const METROS_CUADRADOS = 25;
const UMBRAL_GENIO = 150000;

export function ImportadorCSV() {
  const { registros, setRegistros } = useDashboard();
  
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<string>('');
  const [erroresValidacion, setErroresValidacion] = useState<string[]>([]);
  const [advertenciasValidacion, setAdvertenciasValidacion] = useState<string[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);

  // US-004: Descargar Template CSV mejorado
  const descargarTemplateMejorado = () => {
    const fechaHoy = new Date();
    const csvContent = `Fecha,Venta_Cafe,Venta_Hotdesk,Venta_Asesorias,Gasto_Insumos,Gasto_Staff_Fijo,Utilidad_Neta,RevPSM
2026-02-01,350000,120000,80000,112000,180000,258000,22000
2026-02-02,320000,115000,90000,102400,180000,242600,21000
2026-02-03,380000,130000,75000,121600,180000,283400,23400
2026-02-04,340000,125000,85000,108800,180000,261200,22000
2026-02-05,360000,118000,95000,115200,180000,277800,22920
2026-02-06,370000,122000,88000,118400,180000,281600,23280
2026-02-07,355000,128000,92000,113600,180000,281400,22900
2026-02-08,345000,119000,78000,110400,180000,251600,21680
2026-02-09,365000,125000,85000,116800,180000,278200,23000
2026-02-10,375000,132000,95000,120000,180000,302000,24280
2026-02-11,360000,127000,88000,115200,180000,279800,23080
2026-02-12,350000,120000,82000,112000,180000,260000,22080
2026-02-13,340000,118000,90000,108800,180000,259200,21520
2026-02-14,380000,135000,95000,121600,180000,308400,24600
2026-02-15,370000,130000,88000,118400,180000,289600,23920
2026-02-16,360000,125000,85000,115200,180000,274800,22800
2026-02-17,355000,122000,90000,113600,180000,273400,22680
2026-02-18,345000,128000,78000,110400,180000,260600,22120
2026-02-19,365000,135000,92000,116800,180000,295200,23920
2026-02-20,375000,138000,95000,120000,180000,308000,24520
2026-02-21,360000,130000,88000,115200,180000,282800,23120
2026-02-22,350000,125000,85000,112000,180000,268000,22400
2026-02-23,340000,120000,90000,108800,180000,261200,21600
2026-02-24,380000,132000,95000,121600,180000,305400,24280
2026-02-25,370000,128000,88000,118400,180000,287600,23840
2026-02-26,360000,125000,85000,115200,180000,274800,22800
2026-02-27,355000,130000,92000,113600,180000,283400,23080
2026-02-28,345000,122000,78000,110400,180000,254600,21800`;
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `template-importacion-cfo-dashboard.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success('📥 Template descargado', {
      description: 'Llena los datos y vuelve a importar. Números SIN separador de miles.'
    });
  };

  // US-005: Validación mejorada con detección de errores línea por línea
  const validarCSV = (lines: string[]): { valido: boolean; errores: string[]; advertencias: string[] } => {
    const errores: string[] = [];
    const advertencias: string[] = [];
    
    // Validar header
    const header = lines[0].toLowerCase();
    const columnasRequeridas = ['fecha', 'venta_cafe', 'venta_hotdesk', 'venta_asesorias', 'gasto_insumos', 'gasto_staff_fijo'];
    
    for (const col of columnasRequeridas) {
      if (!header.includes(col.replace('_', ''))) {
        errores.push(`Columna faltante: ${col}`);
      }
    }
    
    // Validar cada línea de datos
    for (let i = 1; i < lines.length; i++) {
      const linea = lines[i].trim();
      if (!linea) continue; // Ignorar líneas vacías
      
      const valores = linea.split(',').map(v => v.trim());
      
      if (valores.length < 8) {
        errores.push(`Línea ${i + 1}: Faltan columnas (encontradas ${valores.length}, esperadas 8)`);
        continue;
      }
      
      // Validar formato de fecha
      const fecha = valores[0];
      if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
        errores.push(`Línea ${i + 1}: Fecha inválida "${fecha}". Use formato YYYY-MM-DD`);
      }
      
      // Validar que columnas numéricas sean números
      for (let j = 1; j < valores.length; j++) {
        const valorLimpio = valores[j].replace(/\./g, ''); // Remover separadores de miles
        if (isNaN(Number(valorLimpio))) {
          errores.push(`Línea ${i + 1}, Columna ${j + 1}: "${valores[j]}" no es un número válido`);
        } else if (valores[j].includes('.') && valores[j].split('.').length > 2) {
          // Si tiene puntos y no es un número decimal válido
          advertencias.push(`Línea ${i + 1}: Valor "${valores[j]}" contiene separador de miles. Se removerá automáticamente.`);
        }
      }
      
      // Validar margen neto razonable
      const ventaTotal = Number(valores[1].replace(/\./g, '')) + Number(valores[2].replace(/\./g, '')) + Number(valores[3].replace(/\./g, ''));
      const utilidadNeta = Number(valores[6].replace(/\./g, ''));
      const margenNeto = (utilidadNeta / ventaTotal) * 100;
      
      if (margenNeto < 15) {
        advertencias.push(`Línea ${i + 1}: Margen neto muy bajo (${margenNeto.toFixed(1)}%). Revisa si los datos son correctos.`);
      }
    }
    
    return {
      valido: errores.length === 0,
      errores,
      advertencias
    };
  };

  const procesarCSV = async (file: File) => {
    setProcessing(true);
    setError(null);
    setSuccess(false);
    setErroresValidacion([]);
    setAdvertenciasValidacion([]);

    try {
      const text = await file.text();
      const lines = text.trim().split('\n');
      
      // US-005: Validación mejorada
      const { valido, errores, advertencias } = validarCSV(lines);
      
      if (!valido) {
        setErroresValidacion(errores);
        setAdvertenciasValidacion(advertencias);
        throw new Error(`Se encontraron ${errores.length} errores de validación. Revisa los detalles abajo.`);
      }
      
      if (advertencias.length > 0) {
        setAdvertenciasValidacion(advertencias);
        toast.warning(`${advertencias.length} advertencias encontradas`, {
          description: 'Los datos se importarán pero revisa las advertencias'
        });
      }

      // Validar header
      const header = lines[0].toLowerCase();
      if (!header.includes('fecha') || !header.includes('venta_cafe')) {
        throw new Error('CSV inválido. Debe tener columnas: Fecha, Venta_Cafe, Venta_Hotdesk, Venta_Asesorias, etc.');
      }

      // Parsear datos diarios con limpieza de separadores
      const datosDiarios: DatoDiario[] = [];
      for (let i = 1; i < lines.length; i++) {
        const linea = lines[i].trim();
        if (!linea) continue;
        
        const valores = linea.split(',').map(v => v.trim().replace(/\./g, '')); // Remover separadores de miles
        if (valores.length >= 8) {
          // Normalizar fecha - asegurar formato YYYY-MM-DD
          let fechaNormalizada = valores[0].trim();
          // Si la fecha no comienza con 4 dígitos de año, intentar corregir
          if (!/^\d{4}-\d{2}-\d{2}$/.test(fechaNormalizada)) {
            // Si tiene formato incorrecto como "026-02-01", agregar el dígito faltante
            if (/^\d{3}-\d{2}-\d{2}$/.test(fechaNormalizada)) {
              fechaNormalizada = '2' + fechaNormalizada; // Asume año 2000s
            } else {
              throw new Error(`Formato de fecha no reconocido: ${fechaNormalizada}. Use formato YYYY-MM-DD`);
            }
          }
          
          datosDiarios.push({
            fecha: fechaNormalizada,
            venta_cafe: parseInt(valores[1]),
            venta_hotdesk: parseInt(valores[2]),
            venta_asesorias: parseInt(valores[3]),
            gasto_insumos: parseInt(valores[4]),
            gasto_staff_fijo: parseInt(valores[5]),
            utilidad_neta: parseInt(valores[6]),
            revpsm: parseInt(valores[7])
          });
        }
      }

      if (datosDiarios.length === 0) {
        throw new Error('No se encontraron datos válidos en el CSV');
      }

      // AGREGACIÓN MENSUAL
      const totalCafe = datosDiarios.reduce((sum, d) => sum + d.venta_cafe, 0);
      const totalHotdesk = datosDiarios.reduce((sum, d) => sum + d.venta_hotdesk, 0);
      const totalAsesorias = datosDiarios.reduce((sum, d) => sum + d.venta_asesorias, 0);
      const totalGastosStaff = datosDiarios.reduce((sum, d) => sum + d.gasto_staff_fijo, 0);

      // Calcular COGS
      const cogsCafe = totalCafe * COGS_CAFE_PERCENT;
      const cogsHotdesk = totalHotdesk * COGS_HOTDESK_PERCENT;
      const cogsAsesoria = 0;

      const margenCafe = totalCafe - cogsCafe;
      const margenHotdesk = totalHotdesk - cogsHotdesk;
      const margenAsesoria = totalAsesorias;

      const ventaTotal = totalCafe + totalHotdesk + totalAsesorias;
      const cogsTotal = cogsCafe + cogsHotdesk + cogsAsesoria;
      const margenBruto = ventaTotal - cogsTotal;
      const utilidadNeta = margenBruto - totalGastosStaff;

      // KPIs
      const roi = utilidadNeta / CAPEX_TOTAL;
      const revPSM = ventaTotal / METROS_CUADRADOS;
      const status: 'Genio' | 'Figura' = utilidadNeta > UMBRAL_GENIO ? 'Genio' : 'Figura';
      const paybackDays = utilidadNeta > 0 ? Math.ceil(DERECHO_LLAVES / utilidadNeta) : null;

      // Línea dominante
      let lineaDominante: 'cafe' | 'hotdesk' | 'asesoria';
      const maxMargen = Math.max(margenCafe, margenHotdesk, margenAsesoria);
      if (maxMargen === margenCafe) lineaDominante = 'cafe';
      else if (maxMargen === margenHotdesk) lineaDominante = 'hotdesk';
      else lineaDominante = 'asesoria';

      // Alerta canibalización
      let alertaCanibalizacion = '';
      if (margenAsesoria > margenCafe * 0.5) {
        alertaCanibalizacion = '⚠️ Asesorías generan más margen que café. Evaluar espacio reuniones.';
      }

      // Obtener fecha del mes (primer día)
      const fechaMes = datosDiarios[0].fecha.substring(0, 7) + '-01';

      // Calcular ROI 30d
      const registrosAnteriores = registros.filter(r => new Date(r.date) < new Date(fechaMes));
      const roi_mean_30d = registrosAnteriores.length > 0
        ? registrosAnteriores.slice(-30).reduce((sum, r) => sum + r.roi, 0) / Math.min(30, registrosAnteriores.length)
        : 0;
      
      const roi_std_30d = registrosAnteriores.length >= 2
        ? (() => {
            const ultimos = registrosAnteriores.slice(-30);
            const media = ultimos.reduce((sum, r) => sum + r.roi, 0) / ultimos.length;
            const varianza = ultimos.reduce((sum, r) => sum + Math.pow(r.roi - media, 2), 0) / ultimos.length;
            return Math.sqrt(varianza);
          })()
        : 0;

      // Crear registro mensual
      const registroMensual: RegistroMensualTriple = {
        id: `${fechaMes}_${Date.now()}`,
        date: fechaMes,
        
        venta_cafe_clp: totalCafe,
        cogs_cafe_clp: cogsCafe,
        margen_cafe_clp: margenCafe,
        margen_cafe_percent: (margenCafe / totalCafe) * 100,
        
        venta_hotdesk_clp: totalHotdesk,
        cogs_hotdesk_clp: cogsHotdesk,
        margen_hotdesk_clp: margenHotdesk,
        margen_hotdesk_percent: (margenHotdesk / totalHotdesk) * 100,
        
        venta_asesoria_clp: totalAsesorias,
        cogs_asesoria_clp: cogsAsesoria,
        margen_asesoria_clp: margenAsesoria,
        margen_asesoria_percent: 100,
        
        venta_total_clp: ventaTotal,
        cogs_total_clp: cogsTotal,
        margen_bruto_clp: margenBruto,
        margen_bruto_percent: (margenBruto / ventaTotal) * 100,
        
        gastos_operacion_clp: totalGastosStaff,
        utilidad_neta_clp: utilidadNeta,
        margen_neto_percent: (utilidadNeta / ventaTotal) * 100,
        
        roi,
        roi_mean_30d,
        roi_std_30d,
        revpsm_clp_m2: revPSM,
        payback_days: paybackDays,
        status,
        
        alerta_canibalizacion: alertaCanibalizacion,
        linea_dominante: lineaDominante,
        
        nota: `Importado desde CSV ${file.name} con ${datosDiarios.length} días`,
        updated_at: new Date().toISOString(),
        
        // Guardar datos diarios para vista expandible
        datos_diarios: datosDiarios
      };

      // Upsert en registros
      const indiceExistente = registros.findIndex(r => r.date === fechaMes);
      let nuevosRegistros;
      
      if (indiceExistente >= 0) {
        nuevosRegistros = [...registros];
        nuevosRegistros[indiceExistente] = registroMensual;
      } else {
        nuevosRegistros = [...registros, registroMensual].sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
      }

      setRegistros(nuevosRegistros);
      setSuccess(true);
      
      // US-008: Alerta automática si margen neto <30%
      const margenNetoPercent = (utilidadNeta / ventaTotal) * 100;
      if (margenNetoPercent < 30) {
        toast.error('🚨 ALERTA CRÍTICA: Margen Neto Bajo', {
          description: `Margen neto ${margenNetoPercent.toFixed(1)}% (objetivo: >30%). Revisa costos operacionales.`,
          duration: 10000,
          action: {
            label: 'Ver Detalle',
            onClick: () => console.log('Navegando a Análisis CFO')
          }
        });
        
        // Disparar webhook a Make.com (si está configurado)
        const webhookURL = localStorage.getItem('webhook_alertas_url');
        if (webhookURL) {
          try {
            const payload = {
              tipo_alerta: 'MARGEN_NETO_BAJO',
              fecha: fechaMes,
              margen_neto_percent: margenNetoPercent,
              venta_total_clp: ventaTotal,
              utilidad_neta_clp: utilidadNeta,
              gastos_operacion_clp: totalGastosStaff,
              timestamp: new Date().toISOString(),
              local: 'Irarrázaval 2100'
            };
            
            fetch(webhookURL, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
            }).then(response => {
              if (response.ok) {
                console.log('✅ Webhook enviado exitosamente');
                toast.info('📡 Alerta enviada a Make.com', {
                  description: 'Stakeholders notificados automáticamente'
                });
              } else {
                console.error('❌ Error enviando webhook:', response.statusText);
              }
            }).catch(error => {
              console.error('❌ Error enviando webhook:', error);
            });
          } catch (error) {
            console.error('❌ Error procesando webhook:', error);
          }
        }
      } else if (margenNetoPercent >= 35) {
        toast.success('✅ Margen Neto Saludable', {
          description: `Margen neto ${margenNetoPercent.toFixed(1)}% está en rango óptimo (>30%).`
        });
      }
      
      console.log('✅ CSV Importado:', {
        diasProcesados: datosDiarios.length,
        fechaMes,
        ventaTotal,
        utilidadNeta,
        margenNetoPercent,
        status
      });

      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message);
      console.error('❌ Error importando CSV:', err);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Card className="border-4 border-green-500 bg-green-50 shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl flex items-center gap-2 text-green-800">
          <Upload className="h-6 w-6" />
          📊 Importador CSV - Método Principal de Carga
        </CardTitle>
        <CardDescription className="text-sm font-semibold text-gray-700">
          ⭐ Recomendado: Sube un CSV con 30 días de ventas reales y el sistema calculará todo automáticamente
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Instrucciones visuales */}
        <div className="bg-white p-4 rounded-lg border-2 border-green-300">
          <p className="text-sm font-bold mb-3">📋 Cómo funciona (3 pasos):</p>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li><strong>Descarga la plantilla CSV</strong> y ábrela en Excel/Google Sheets</li>
            <li><strong>Llena con tus ventas reales</strong> (1 fila = 1 día, 30 filas = 1 mes)</li>
            <li><strong>Sube el archivo aquí</strong> y el sistema agregará el mes completo con todas las métricas</li>
          </ol>
        </div>

        {/* Botón de descarga plantilla */}
        <Button
          variant="outline"
          size="sm"
          className="w-full border-2 border-blue-500 hover:bg-blue-50"
          onClick={descargarTemplateMejorado}
        >
          ⬇️ Descargar Plantilla CSV (Ejemplo 30 días)
        </Button>

        <div className="space-y-1">
          <Label htmlFor="csvFile" className="text-sm font-semibold">Subir archivo CSV</Label>
          <div
            className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
              isDragOver
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
            }`}
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragOver(false);
              const file = e.dataTransfer.files?.[0];
              if (file && file.name.endsWith('.csv')) {
                setSelectedFile(file.name);
                procesarCSV(file);
              } else if (file) {
                setError('Solo se aceptan archivos .csv');
              }
            }}
            onClick={() => !processing && document.getElementById('csvFile')?.click()}
          >
            <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600">
              {isDragOver ? '¡Suelta el archivo aquí!' : 'Arrastra tu CSV aquí o haz clic para seleccionar'}
            </p>
            {selectedFile && !processing && (
              <p className="text-xs text-green-600 mt-1 font-medium">📄 {selectedFile}</p>
            )}
            <Input
              id="csvFile"
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setSelectedFile(file.name);
                  procesarCSV(file);
                }
              }}
              disabled={processing}
            />
          </div>
        </div>

        {processing && (
          <Alert className="border-blue-500 bg-blue-50">
            <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
            <AlertTitle className="text-sm">Procesando CSV...</AlertTitle>
            <AlertDescription className="text-xs">
              Leyendo datos diarios y agregando a nivel mensual
            </AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="border-green-600 bg-green-100">
            <CheckCircle2 className="h-5 w-5 text-green-700" />
            <AlertTitle className="text-base font-bold">✅ ¡Importación Exitosa!</AlertTitle>
            <AlertDescription className="text-sm">
              <p className="mb-2">El mes completo ha sido agregado automáticamente y guardado en el historial.</p>
              <p className="text-xs text-gray-700">💡 <strong>Tip:</strong> Ve al historial y haz click en [+] para ver el desglose día por día de los 30 días importados.</p>
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive" className="border-2">
            <XCircle className="h-5 w-5" />
            <AlertTitle className="text-base font-bold">❌ Error de Importación</AlertTitle>
            <AlertDescription className="text-sm">{error}</AlertDescription>
          </Alert>
        )}

        {/* Información de formato - Solo si no está procesando ni hay éxito */}
        {!processing && !success && (
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-300 text-xs space-y-2">
            <p className="font-bold text-sm">📄 Formato CSV esperado:</p>
            <code className="block bg-white p-3 rounded font-mono text-xs overflow-x-auto border">
              Fecha,Venta_Cafe,Venta_Hotdesk,Venta_Asesorias,Gasto_Insumos,Gasto_Staff_Fijo,Utilidad_Neta,RevPSM<br/>
              2026-02-01,350000,120000,80000,112000,180000,258000,22000<br/>
              2026-02-02,320000,115000,90000,102400,180000,242600,21000<br/>
              ... (30 días totales)
            </code>
            <div className="space-y-1 text-gray-700">
              <p>⚠️ <strong>Importante:</strong></p>
              <ul className="list-disc list-inside ml-2">
                <li>Sin símbolos $ ni puntos separadores de miles</li>
                <li>Solo números enteros (ejemplo: 350000 no $350.000)</li>
                <li>Formato fecha: YYYY-MM-DD</li>
                <li>Mínimo 7 días, recomendado 30 días</li>
              </ul>
            </div>
          </div>
        )}

        {/* Mostrar errores de validación */}
        {erroresValidacion.length > 0 && (
          <Alert variant="destructive" className="border-2">
            <AlertTriangle className="h-5 w-5" />
            <AlertTitle className="text-base font-bold">❌ Errores de Validación</AlertTitle>
            <AlertDescription className="text-sm">
              <ul className="list-disc list-inside ml-2">
                {erroresValidacion.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* Mostrar advertencias de validación */}
        {advertenciasValidacion.length > 0 && (
          <Alert className="border-yellow-500 bg-yellow-50">
            <AlertTriangle className="h-5 w-5" />
            <AlertTitle className="text-base font-bold">⚠️ Advertencias de Validación</AlertTitle>
            <AlertDescription className="text-sm">
              <ul className="list-disc list-inside ml-2">
                {advertenciasValidacion.map((advertencia, index) => (
                  <li key={index}>{advertencia}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}