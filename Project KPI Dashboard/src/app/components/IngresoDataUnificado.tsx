import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Upload, CheckCircle2, XCircle, Loader2, BarChart3, Coffee, Laptop, Briefcase, Save, AlertCircle } from 'lucide-react';
import { useDashboard } from '../contexts/DashboardContext';
import type { RegistroMensualTriple, DatoDiario } from '../contexts/DashboardContext';

const COGS_CAFE_PERCENT = 0.32;
const COGS_HOTDESK_PERCENT = 0.075;
const CAPEX_TOTAL = 37697000;
const DERECHO_LLAVES = 18900000;
const METROS_CUADRADOS = 25;
const UMBRAL_GENIO = 150000;

export function IngresoDataUnificado() {
  const { registros, setRegistros } = useDashboard();
  
  // CSV State
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<string>('');
  
  // Manual State
  const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 7) + '-01');
  const [ventaCafe, setVentaCafe] = useState<number>(0);
  const [ventaHotdesk, setVentaHotdesk] = useState<number>(0);
  const [ventaAsesoria, setVentaAsesoria] = useState<number>(0);
  const [gastosStaff, setGastosStaff] = useState<number>(3450000);
  const [nota, setNota] = useState('');
  const [saving, setSaving] = useState(false);

  const procesarCSV = async (file: File) => {
    setProcessing(true);
    setError(null);
    setSuccess(false);

    try {
      const text = await file.text();
      const lines = text.trim().split('\n');
      
      const header = lines[0].toLowerCase();
      if (!header.includes('fecha') || !header.includes('venta_cafe')) {
        throw new Error('CSV inválido. Debe tener columnas: Fecha, Venta_Cafe, Venta_Hotdesk, Venta_Asesorias, etc.');
      }

      const datosDiarios: DatoDiario[] = [];
      for (let i = 1; i < lines.length; i++) {
        const valores = lines[i].split(',');
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

      const totalCafe = datosDiarios.reduce((sum, d) => sum + d.venta_cafe, 0);
      const totalHotdesk = datosDiarios.reduce((sum, d) => sum + d.venta_hotdesk, 0);
      const totalAsesorias = datosDiarios.reduce((sum, d) => sum + d.venta_asesorias, 0);
      const totalGastosStaff = datosDiarios.reduce((sum, d) => sum + d.gasto_staff_fijo, 0);

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

      const roi = utilidadNeta / CAPEX_TOTAL;
      const revPSM = ventaTotal / METROS_CUADRADOS;
      const status: 'Genio' | 'Figura' = utilidadNeta > UMBRAL_GENIO ? 'Genio' : 'Figura';
      const paybackDays = utilidadNeta > 0 ? Math.ceil(DERECHO_LLAVES / utilidadNeta) : null;

      let lineaDominante: 'cafe' | 'hotdesk' | 'asesoria';
      const maxMargen = Math.max(margenCafe, margenHotdesk, margenAsesoria);
      if (maxMargen === margenCafe) lineaDominante = 'cafe';
      else if (maxMargen === margenHotdesk) lineaDominante = 'hotdesk';
      else lineaDominante = 'asesoria';

      let alertaCanibalizacion = '';
      if (margenAsesoria > margenCafe * 0.5) {
        alertaCanibalizacion = '⚠️ Asesorías generan más margen que café. Evaluar espacio reuniones.';
      }

      const fechaMes = datosDiarios[0].fecha.substring(0, 7) + '-01';

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
        
        nota: `CSV ${file.name} (${datosDiarios.length} días)`,
        updated_at: new Date().toISOString(),
        
        datos_diarios: datosDiarios
      };

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
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  const guardarManual = () => {
    if (ventaCafe + ventaHotdesk + ventaAsesoria === 0) {
      setError('Debes ingresar al menos una venta');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const cogsCafe = ventaCafe * COGS_CAFE_PERCENT;
      const cogsHotdesk = ventaHotdesk * COGS_HOTDESK_PERCENT;
      const cogsAsesoria = 0;

      const margenCafe = ventaCafe - cogsCafe;
      const margenHotdesk = ventaHotdesk - cogsHotdesk;
      const margenAsesoria = ventaAsesoria;

      const ventaTotal = ventaCafe + ventaHotdesk + ventaAsesoria;
      const cogsTotal = cogsCafe + cogsHotdesk + cogsAsesoria;
      const margenBruto = ventaTotal - cogsTotal;
      const utilidadNeta = margenBruto - gastosStaff;

      const roi = utilidadNeta / CAPEX_TOTAL;
      const revPSM = ventaTotal / METROS_CUADRADOS;
      const status: 'Genio' | 'Figura' = utilidadNeta > UMBRAL_GENIO ? 'Genio' : 'Figura';
      const paybackDays = utilidadNeta > 0 ? Math.ceil(DERECHO_LLAVES / utilidadNeta) : null;

      let lineaDominante: 'cafe' | 'hotdesk' | 'asesoria';
      const maxMargen = Math.max(margenCafe, margenHotdesk, margenAsesoria);
      if (maxMargen === margenCafe) lineaDominante = 'cafe';
      else if (maxMargen === margenHotdesk) lineaDominante = 'hotdesk';
      else lineaDominante = 'asesoria';

      const alertaCanibalizacion = margenAsesoria > margenCafe * 0.5
        ? '⚠️ Asesorías generan más margen que café.'
        : '';

      const registrosAnteriores = registros.filter(r => new Date(r.date) < new Date(fecha));
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

      const registroMensual: RegistroMensualTriple = {
        id: `${fecha}_${Date.now()}`,
        date: fecha,
        
        venta_cafe_clp: ventaCafe,
        cogs_cafe_clp: cogsCafe,
        margen_cafe_clp: margenCafe,
        margen_cafe_percent: ventaCafe > 0 ? (margenCafe / ventaCafe) * 100 : 0,
        
        venta_hotdesk_clp: ventaHotdesk,
        cogs_hotdesk_clp: cogsHotdesk,
        margen_hotdesk_clp: margenHotdesk,
        margen_hotdesk_percent: ventaHotdesk > 0 ? (margenHotdesk / ventaHotdesk) * 100 : 0,
        
        venta_asesoria_clp: ventaAsesoria,
        cogs_asesoria_clp: cogsAsesoria,
        margen_asesoria_clp: margenAsesoria,
        margen_asesoria_percent: 100,
        
        venta_total_clp: ventaTotal,
        cogs_total_clp: cogsTotal,
        margen_bruto_clp: margenBruto,
        margen_bruto_percent: (margenBruto / ventaTotal) * 100,
        
        gastos_operacion_clp: gastosStaff,
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
        
        nota: nota,
        updated_at: new Date().toISOString()
      };

      const indiceExistente = registros.findIndex(r => r.date === fecha);
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
      
      // Reset form
      setVentaCafe(0);
      setVentaHotdesk(0);
      setVentaAsesoria(0);
      setNota('');
      
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="border-2 border-blue-500 shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Ingreso de Datos
        </CardTitle>
        <CardDescription>
          Elige tu método: CSV rápido o formulario manual
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="csv" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="csv" className="text-sm">
              <Upload className="h-4 w-4 mr-2" />
              CSV (Recomendado)
            </TabsTrigger>
            <TabsTrigger value="manual" className="text-sm">
              <Coffee className="h-4 w-4 mr-2" />
              Manual
            </TabsTrigger>
          </TabsList>

          {/* TAB CSV */}
          <TabsContent value="csv" className="space-y-3">
            <Alert className="border-green-500 bg-green-50">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle className="text-sm">Método Recomendado</AlertTitle>
              <AlertDescription className="text-xs">
                Sube un CSV con 30 días de datos. El sistema calcula todo automáticamente.
              </AlertDescription>
            </Alert>

            <div className="bg-white p-3 rounded border space-y-2 text-xs">
              <p className="font-semibold">📋 Pasos:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Descarga la plantilla</li>
                <li>Llena tus ventas (1 fila = 1 día)</li>
                <li>Sube el archivo</li>
              </ol>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => {
                const csv = `Fecha,Venta_Cafe,Venta_Hotdesk,Venta_Asesorias,Gasto_Insumos,Gasto_Staff_Fijo,Utilidad_Neta,RevPSM
2026-02-01,350000,120000,80000,112000,180000,258000,22000
2026-02-02,320000,115000,90000,102400,180000,242600,21000
... (hasta 30 días)`;
                const blob = new Blob([csv], { type: 'text/csv' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'plantilla.csv';
                a.click();
              }}
            >
              ⬇️ Descargar Plantilla
            </Button>

            <div className="space-y-1">
              <Label htmlFor="csvFile" className="text-sm">Subir CSV</Label>
              <Input
                id="csvFile"
                type="file"
                accept=".csv"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setSelectedFile(file.name);
                    procesarCSV(file);
                  }
                }}
                className="text-sm"
                disabled={processing}
              />
            </div>

            {processing && (
              <Alert className="border-blue-500 bg-blue-50">
                <Loader2 className="h-4 w-4 animate-spin" />
                <AlertTitle className="text-sm">Procesando...</AlertTitle>
              </Alert>
            )}

            {success && (
              <Alert className="border-green-600 bg-green-100">
                <CheckCircle2 className="h-4 w-4" />
                <AlertTitle className="text-sm">✅ Importado</AlertTitle>
              </Alert>
            )}

            {error && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertTitle className="text-sm">Error</AlertTitle>
                <AlertDescription className="text-xs">{error}</AlertDescription>
              </Alert>
            )}
          </TabsContent>

          {/* TAB MANUAL */}
          <TabsContent value="manual" className="space-y-3">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle className="text-sm">Ingreso Manual</AlertTitle>
              <AlertDescription className="text-xs">
                Solo para correcciones o meses sin CSV disponible.
              </AlertDescription>
            </Alert>

            <div className="space-y-1">
              <Label htmlFor="fecha" className="text-sm">Fecha (Mes)</Label>
              <Input
                id="fecha"
                type="month"
                value={fecha.substring(0, 7)}
                onChange={(e) => setFecha(e.target.value + '-01')}
                className="text-sm"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1">
                <Label className="text-xs flex items-center gap-1">
                  <Coffee className="h-3 w-3" />
                  Café
                </Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={ventaCafe || ''}
                  onChange={(e) => setVentaCafe(Number(e.target.value))}
                  className="text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs flex items-center gap-1">
                  <Laptop className="h-3 w-3" />
                  Hotdesk
                </Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={ventaHotdesk || ''}
                  onChange={(e) => setVentaHotdesk(Number(e.target.value))}
                  className="text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs flex items-center gap-1">
                  <Briefcase className="h-3 w-3" />
                  Asesorías
                </Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={ventaAsesoria || ''}
                  onChange={(e) => setVentaAsesoria(Number(e.target.value))}
                  className="text-sm"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="gastos" className="text-sm">Gastos Staff Mensual</Label>
              <Input
                id="gastos"
                type="number"
                placeholder="3450000"
                value={gastosStaff || ''}
                onChange={(e) => setGastosStaff(Number(e.target.value))}
                className="text-sm"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="nota" className="text-sm">Nota (opcional)</Label>
              <Textarea
                id="nota"
                placeholder="Ej: Temporada alta..."
                value={nota}
                onChange={(e) => setNota(e.target.value)}
                className="text-sm h-16"
              />
            </div>

            <Button
              onClick={guardarManual}
              disabled={saving}
              className="w-full"
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Guardar Mes
                </>
              )}
            </Button>

            {success && (
              <Alert className="border-green-600 bg-green-100">
                <CheckCircle2 className="h-4 w-4" />
                <AlertTitle className="text-sm">✅ Guardado</AlertTitle>
              </Alert>
            )}

            {error && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription className="text-xs">{error}</AlertDescription>
              </Alert>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}