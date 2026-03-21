import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import {
  Camera,
  Upload,
  Eye,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Coffee,
  Zap,
  Users,
  TrendingUp,
  Send,
  FileJson,
  Download,
  ShieldAlert,
  Activity
} from 'lucide-react';
import { toast } from 'sonner';

interface AuditoriaInput {
  date: string;
  venta_cafe_clp: string;
  venta_hotdesk_clp: string;
  venta_asesorias_clp: string;
  gasto_insumos_clp: string;
  gasto_staff_fijo_clp: string;
  gasto_variable_compartido_clp: string;
  capex_total_clp: string;
  derecho_llaves_clp: string;
  reserva_sueldos_clp: string;
  baseline_venta_cafe_clp: string;
  threshold_revpsm_genio_clp_m2: string;
  threshold_utilidad_genio_day_clp: string;
}

interface DetectionResult {
  value: boolean | number | null;
  confidence: number;
  evidence: string;
}

interface AuditoriaOutput {
  date: string;
  site: {
    name: string;
    location: string;
    m2: number;
    seat_capacity_hotdesk: number;
  };
  inputs_raw: Record<string, number | null>;
  kpis: {
    venta_total_clp: number | null;
    revpsm_clp_m2: number | null;
    utilidad_neta_clp: number | null;
    roi_dia: number | null;
    payback_days_today: number | string;
    status_genio_figura: string;
  };
  detections: Record<string, DetectionResult>;
  classification: {
    status_operativo: string;
    day_label: string;
    needs_human_confirm: boolean;
    missing_fields: string[];
  };
  financial_impact: {
    lost_revenue_estimate_clp: number | null;
    investor_risk_note: string;
  };
  sop_actions: Array<{
    role: string;
    priority: string;
    action: string;
    deadline_hours: number;
  }>;
  to_be_targets: Array<{
    metric: string;
    target: string;
    owner: string;
    note: string;
  }>;
  summary_text_clp_formatted: {
    venta_total: string;
    revpsm: string;
    utilidad_neta: string;
    lost_revenue_estimate: string;
  };
}

export function AuditoriaOperativa() {
  const [imagenLocal, setImagenLocal] = useState<string | null>(null);
  const [datosInput, setDatosInput] = useState<AuditoriaInput>({
    date: new Date().toISOString().split('T')[0],
    venta_cafe_clp: '',
    venta_hotdesk_clp: '',
    venta_asesorias_clp: '',
    gasto_insumos_clp: '',
    gasto_staff_fijo_clp: '',
    gasto_variable_compartido_clp: '',
    capex_total_clp: '37697000',
    derecho_llaves_clp: '18900000',
    reserva_sueldos_clp: '',
    baseline_venta_cafe_clp: '',
    threshold_revpsm_genio_clp_m2: '25000',
    threshold_utilidad_genio_day_clp: '150000'
  });
  const [procesando, setProcesando] = useState(false);
  const [resultado, setResultado] = useState<AuditoriaOutput | null>(null);
  const [jsonOutput, setJsonOutput] = useState<string>('');

  // URL del webhook de Make.com
  const WEBHOOK_URL = 'https://hook.us1.make.com/tu-webhook-auditoria-aqui';

  const normalizarNumero = (valor: string): number | null => {
    if (!valor || valor.trim() === '') return null;
    
    // Eliminar $, espacios, puntos de miles
    let limpio = valor.replace(/\$/g, '').replace(/\s/g, '').replace(/\./g, '');
    
    // Si hay coma decimal, reemplazar por punto y parsear
    limpio = limpio.replace(/,/g, '.');
    
    const numero = parseFloat(limpio);
    return isNaN(numero) ? null : Math.round(numero);
  };

  const formatearCLP = (numero: number | null): string => {
    if (numero === null) return 'N/D';
    return Math.round(numero).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const analizarImagen = (imagenBase64: string): Record<string, DetectionResult> => {
    // SIMULACIÓN DE ANÁLISIS DE IMAGEN CON IA
    // En producción, esto llamaría a GPT-4 Vision o similar
    
    // Por ahora, detectamos patrones básicos en la imagen simulada
    const detections: Record<string, DetectionResult> = {
      coffee_machine_out_of_order: {
        value: false,
        confidence: 0.0,
        evidence: 'Sin análisis de imagen real'
      },
      floor_hazard: {
        value: false,
        confidence: 0.0,
        evidence: 'Sin análisis de imagen real'
      },
      bar_disorder: {
        value: false,
        confidence: 0.0,
        evidence: 'Sin análisis de imagen real'
      },
      bar_dirty: {
        value: false,
        confidence: 0.0,
        evidence: 'Sin análisis de imagen real'
      },
      hotdesk_people_count: {
        value: null,
        confidence: 0.0,
        evidence: 'Sin análisis de imagen real'
      },
      take_away_queue_present: {
        value: false,
        confidence: 0.0,
        evidence: 'Sin análisis de imagen real'
      },
      stress_signal_present: {
        value: false,
        confidence: 0.0,
        evidence: 'Sin análisis de imagen real'
      }
    };

    // SIMULACIÓN: Si la imagen contiene ciertos patrones, activar detecciones
    // En un escenario real, esto sería procesado por un modelo de visión
    if (imagenBase64.length > 0) {
      // Simular detección de "Out of Order" (esto sería real con GPT-4 Vision)
      const randomCritical = Math.random();
      if (randomCritical > 0.7) {
        detections.coffee_machine_out_of_order = {
          value: true,
          confidence: 0.85,
          evidence: 'Cartel "OUT OF ORDER" visible en máquina de café'
        };
        detections.stress_signal_present = {
          value: true,
          confidence: 0.78,
          evidence: 'Señales de operación improvisada detectadas'
        };
      }

      // Simular detección de cables/basura
      const randomFloor = Math.random();
      if (randomFloor > 0.6) {
        detections.floor_hazard = {
          value: true,
          confidence: 0.72,
          evidence: 'Cables sueltos y objetos en el suelo detectados'
        };
      }

      // Simular ocupación hotdesk
      detections.hotdesk_people_count = {
        value: Math.floor(Math.random() * 10),
        confidence: 0.65,
        evidence: 'Conteo visual de personas en zona hotdesk'
      };
    }

    return detections;
  };

  const procesarAuditoria = async () => {
    setProcesando(true);

    try {
      // 1. NORMALIZAR INPUTS
      const inputs_raw = {
        venta_cafe_clp: normalizarNumero(datosInput.venta_cafe_clp),
        venta_hotdesk_clp: normalizarNumero(datosInput.venta_hotdesk_clp),
        venta_asesorias_clp: normalizarNumero(datosInput.venta_asesorias_clp),
        gasto_insumos_clp: normalizarNumero(datosInput.gasto_insumos_clp),
        gasto_staff_fijo_clp: normalizarNumero(datosInput.gasto_staff_fijo_clp),
        gasto_variable_compartido_clp: normalizarNumero(datosInput.gasto_variable_compartido_clp),
        capex_total_clp: normalizarNumero(datosInput.capex_total_clp),
        derecho_llaves_clp: normalizarNumero(datosInput.derecho_llaves_clp),
        reserva_sueldos_clp: normalizarNumero(datosInput.reserva_sueldos_clp),
        baseline_venta_cafe_clp: normalizarNumero(datosInput.baseline_venta_cafe_clp),
        threshold_revpsm_genio_clp_m2: normalizarNumero(datosInput.threshold_revpsm_genio_clp_m2),
        threshold_utilidad_genio_day_clp: normalizarNumero(datosInput.threshold_utilidad_genio_day_clp)
      };

      // 2. ANALIZAR IMAGEN
      const detections = imagenLocal 
        ? analizarImagen(imagenLocal)
        : {
            coffee_machine_out_of_order: { value: false, confidence: 0, evidence: 'Sin imagen proporcionada' },
            floor_hazard: { value: false, confidence: 0, evidence: 'Sin imagen proporcionada' },
            bar_disorder: { value: false, confidence: 0, evidence: 'Sin imagen proporcionada' },
            bar_dirty: { value: false, confidence: 0, evidence: 'Sin imagen proporcionada' },
            hotdesk_people_count: { value: null, confidence: 0, evidence: 'Sin imagen proporcionada' },
            take_away_queue_present: { value: false, confidence: 0, evidence: 'Sin imagen proporcionada' },
            stress_signal_present: { value: false, confidence: 0, evidence: 'Sin imagen proporcionada' }
          };

      // 3. CALCULAR KPIS
      const missing_fields: string[] = [];
      
      const venta_cafe = inputs_raw.venta_cafe_clp ?? 0;
      const venta_hotdesk = inputs_raw.venta_hotdesk_clp ?? 0;
      const venta_asesorias = inputs_raw.venta_asesorias_clp ?? 0;
      const venta_total_clp = venta_cafe + venta_hotdesk + venta_asesorias;

      if (inputs_raw.venta_cafe_clp === null) missing_fields.push('venta_cafe_clp');
      if (inputs_raw.venta_hotdesk_clp === null) missing_fields.push('venta_hotdesk_clp');
      if (inputs_raw.venta_asesorias_clp === null) missing_fields.push('venta_asesorias_clp');

      const revpsm_clp_m2 = venta_total_clp > 0 ? venta_total_clp / 25 : null;

      let utilidad_neta_clp: number | null = null;
      if (
        inputs_raw.venta_cafe_clp !== null &&
        inputs_raw.gasto_insumos_clp !== null &&
        inputs_raw.gasto_staff_fijo_clp !== null
      ) {
        const margen_cafe = venta_cafe - (inputs_raw.gasto_insumos_clp ?? 0);
        utilidad_neta_clp = margen_cafe + venta_hotdesk + venta_asesorias 
          - (inputs_raw.gasto_staff_fijo_clp ?? 0) 
          - (inputs_raw.gasto_variable_compartido_clp ?? 0);
      } else {
        if (inputs_raw.gasto_insumos_clp === null) missing_fields.push('gasto_insumos_clp');
        if (inputs_raw.gasto_staff_fijo_clp === null) missing_fields.push('gasto_staff_fijo_clp');
      }

      const roi_dia = 
        utilidad_neta_clp !== null && inputs_raw.capex_total_clp !== null
          ? utilidad_neta_clp / inputs_raw.capex_total_clp
          : null;

      let payback_days_today: number | string = 'N/A';
      if (
        inputs_raw.derecho_llaves_clp !== null &&
        utilidad_neta_clp !== null &&
        utilidad_neta_clp > 0
      ) {
        payback_days_today = Math.ceil(inputs_raw.derecho_llaves_clp / utilidad_neta_clp);
      }

      let status_genio_figura = 'N/D';
      if (
        inputs_raw.threshold_revpsm_genio_clp_m2 !== null &&
        revpsm_clp_m2 !== null
      ) {
        status_genio_figura = revpsm_clp_m2 > inputs_raw.threshold_revpsm_genio_clp_m2 ? 'Genio' : 'Figura';
      }

      // 4. CLASIFICACIÓN OPERATIVA
      let status_operativo = 'OK';
      let needs_human_confirm = false;

      if (
        (detections.coffee_machine_out_of_order.value === true) ||
        (detections.floor_hazard.value === true)
      ) {
        status_operativo = 'CRITICO';
      } else if (
        (detections.bar_disorder.value === true) ||
        (detections.bar_dirty.value === true) ||
        (detections.stress_signal_present.value === true)
      ) {
        status_operativo = 'ALERTA';
      }

      // Verificar confidence
      if (
        (detections.coffee_machine_out_of_order.value === true && detections.coffee_machine_out_of_order.confidence < 0.70) ||
        (detections.floor_hazard.value === true && detections.floor_hazard.confidence < 0.70)
      ) {
        needs_human_confirm = true;
      }

      let day_label = '';
      if (status_operativo === 'CRITICO') {
        day_label = 'DIA_MALO_FIGURA';
      } else if (status_operativo === 'ALERTA') {
        day_label = 'DIA_REGULAR';
      } else if (status_operativo === 'OK' && status_genio_figura === 'Genio') {
        day_label = 'DIA_BUENO_GENIO';
      } else if (status_operativo === 'OK') {
        day_label = 'OK_SIN_GENIO';
      }

      // 5. IMPACTO FINANCIERO
      let lost_revenue_estimate_clp: number | null = null;
      let investor_risk_note = '';

      if (detections.coffee_machine_out_of_order.value === true) {
        if (inputs_raw.baseline_venta_cafe_clp !== null) {
          lost_revenue_estimate_clp = inputs_raw.baseline_venta_cafe_clp;
          investor_risk_note = `Pérdida estimada de $${formatearCLP(lost_revenue_estimate_clp)} CLP por downtime de máquina café.`;
        } else {
          investor_risk_note = 'Máquina café fuera de servicio. Pérdida no cuantificable (falta baseline).';
        }
      } else {
        lost_revenue_estimate_clp = 0;
      }

      // 6. SOP ACTIONS
      const priority = status_operativo === 'CRITICO' ? 'P0' : status_operativo === 'ALERTA' ? 'P1' : 'P2';
      const deadline = status_operativo === 'CRITICO' ? 2 : 24;

      const sop_actions = [];

      if (detections.coffee_machine_out_of_order.value === true) {
        sop_actions.push({
          role: 'Barista',
          priority: 'P0',
          action: 'Llamar técnico certificado INMEDIATAMENTE. Ofrecer café instantáneo gratis como plan B. Registrar downtime cada 30 min.',
          deadline_hours: 2
        });
      } else {
        sop_actions.push({
          role: 'Barista',
          priority: priority,
          action: 'Verificar calibración de máquina antes de apertura. Mantener stock de insumos críticos.',
          deadline_hours: 24
        });
      }

      if (detections.floor_hazard.value === true) {
        sop_actions.push({
          role: 'Admin Tech',
          priority: 'P0',
          action: 'Despeje inmediato de cables y objetos. Canalización oculta de cables. Checklist cada 60 min.',
          deadline_hours: 2
        });
      } else {
        sop_actions.push({
          role: 'Admin Tech',
          priority: priority,
          action: 'Ronda de limpieza cada 45 min. Verificar WiFi/conectividad. Gestión proactiva de cables hotdesk.',
          deadline_hours: 24
        });
      }

      if (status_operativo === 'CRITICO') {
        sop_actions.push({
          role: 'CFO',
          priority: 'P0',
          action: `Recalcular impacto vs baseline. Pérdida estimada: $${formatearCLP(lost_revenue_estimate_clp)} CLP. Decisión operativa: ¿cierre temporal / horario reducido / promo hotdesk?`,
          deadline_hours: 4
        });
      } else {
        sop_actions.push({
          role: 'CFO',
          priority: priority,
          action: 'Monitoreo diario de RevPSM vs meta. Revisión de utilidad neta vs threshold. Análisis semanal de tendencias.',
          deadline_hours: 24
        });
      }

      // 7. TO BE TARGETS
      const to_be_targets = [
        {
          metric: 'coffee_machine_uptime',
          target: '100%',
          owner: 'Barista/Admin',
          note: 'Mantenimiento preventivo mensual. Downtime máx < 30 min/mes.'
        },
        {
          metric: 'floor_safety',
          target: '0 hazards',
          owner: 'Admin Tech',
          note: 'Gestión de cables oculta. Score limpieza > 90%. Ronda cada 45 min.'
        },
        {
          metric: 'hotdesk_occupancy',
          target: '>=0.70',
          owner: 'Admin Tech',
          note: 'Conectividad 1Gbps garantizada. Ambiente de alta productividad.'
        }
      ];

      // 8. SUMMARY TEXT
      const summary_text_clp_formatted = {
        venta_total: formatearCLP(venta_total_clp),
        revpsm: formatearCLP(revpsm_clp_m2),
        utilidad_neta: formatearCLP(utilidad_neta_clp),
        lost_revenue_estimate: formatearCLP(lost_revenue_estimate_clp)
      };

      // 9. CONSTRUIR OUTPUT
      const output: AuditoriaOutput = {
        date: datosInput.date,
        site: {
          name: 'Da Pleisë',
          location: 'Irarrázaval, Ñuñoa',
          m2: 25,
          seat_capacity_hotdesk: 10
        },
        inputs_raw,
        kpis: {
          venta_total_clp,
          revpsm_clp_m2,
          utilidad_neta_clp,
          roi_dia,
          payback_days_today,
          status_genio_figura
        },
        detections,
        classification: {
          status_operativo,
          day_label,
          needs_human_confirm,
          missing_fields
        },
        financial_impact: {
          lost_revenue_estimate_clp,
          investor_risk_note
        },
        sop_actions,
        to_be_targets,
        summary_text_clp_formatted
      };

      setResultado(output);
      const jsonString = JSON.stringify(output, null, 2);
      setJsonOutput(jsonString);

      toast.success('Auditoría completada', {
        description: `Status: ${status_operativo} | Label: ${day_label}`
      });

    } catch (error) {
      console.error('Error en auditoría:', error);
      toast.error('Error al procesar auditoría', {
        description: 'Verifica los datos ingresados'
      });
    } finally {
      setProcesando(false);
    }
  };

  const enviarAMake = async () => {
    if (!resultado) {
      toast.error('Sin resultado', {
        description: 'Ejecuta la auditoría primero'
      });
      return;
    }

    try {
      // SIMULACIÓN: Descomentar en producción
      /*
      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: jsonOutput
      });

      if (!response.ok) {
        throw new Error('Error al enviar a Make.com');
      }
      */

      console.log('📤 JSON enviado a Make.com:', resultado);
      
      toast.success('Enviado a Make.com', {
        description: 'Alertas y dashboard actualizados'
      });
    } catch (error) {
      console.error('Error al enviar a Make:', error);
      toast.error('Error al enviar', {
        description: 'Verifica la URL del webhook'
      });
    }
  };

  const descargarJSON = () => {
    if (!jsonOutput) return;

    const blob = new Blob([jsonOutput], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `auditoria_${datosInput.date}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success('JSON descargado');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setImagenLocal(event.target?.result as string);
      toast.success('Imagen cargada', {
        description: 'Lista para análisis'
      });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-2 border-indigo-500 bg-gradient-to-r from-indigo-50 to-purple-50">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Activity className="h-7 w-7 text-indigo-600" />
            Auditoría Operativa: Imagen + Datos Financieros
          </CardTitle>
          <CardDescription className="text-base">
            Sistema "Genio y Figura" - Detección visual + Cálculo de KPIs + JSON para Make.com
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Columna Izquierda: INPUT */}
        <div className="space-y-6">
          {/* Upload Imagen */}
          <Card className="border-2 border-blue-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5 text-blue-600" />
                1. Evidencia Visual del Local
              </CardTitle>
              <CardDescription>
                Sube foto del local (barra + máquina + suelo + hotdesk)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                {imagenLocal ? (
                  <div>
                    <img 
                      src={imagenLocal} 
                      alt="Local" 
                      className="max-h-64 mx-auto rounded-lg shadow-lg mb-3"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setImagenLocal(null)}
                    >
                      Cambiar Imagen
                    </Button>
                  </div>
                ) : (
                  <div>
                    <Upload className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="upload-imagen"
                    />
                    <label htmlFor="upload-imagen">
                      <Button asChild>
                        <span className="cursor-pointer">
                          <Upload className="mr-2 h-4 w-4" />
                          Subir Imagen
                        </span>
                      </Button>
                    </label>
                    <p className="text-xs text-gray-500 mt-2">
                      JPG, PNG (máx 5MB)
                    </p>
                  </div>
                )}
              </div>

              <Alert className="border-blue-500 bg-blue-50">
                <Eye className="h-4 w-4" />
                <AlertTitle className="text-sm font-bold">Detecciones Automáticas</AlertTitle>
                <AlertDescription className="text-xs mt-2">
                  <ul className="list-disc list-inside space-y-1">
                    <li>Máquina café "Out of Order"</li>
                    <li>Cables sueltos / Basura en suelo</li>
                    <li>Desorden en barra</li>
                    <li>Ocupación hotdesk</li>
                    <li>Fila take-away</li>
                    <li>Señales de estrés operativo</li>
                  </ul>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Datos Financieros */}
          <Card className="border-2 border-green-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                2. Datos Financieros (Fila Google Sheet)
              </CardTitle>
              <CardDescription>
                Ingresa los valores de la fila del día (con o sin formato)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-semibold">Fecha</Label>
                  <input
                    type="date"
                    value={datosInput.date}
                    onChange={(e) => setDatosInput({...datosInput, date: e.target.value})}
                    className="w-full p-2 border rounded text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold">Venta Café (CLP)</Label>
                  <input
                    type="text"
                    placeholder="$150.000 o 150000"
                    value={datosInput.venta_cafe_clp}
                    onChange={(e) => setDatosInput({...datosInput, venta_cafe_clp: e.target.value})}
                    className="w-full p-2 border rounded text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold">Venta Hotdesk (CLP)</Label>
                  <input
                    type="text"
                    placeholder="$80.000 o 80000"
                    value={datosInput.venta_hotdesk_clp}
                    onChange={(e) => setDatosInput({...datosInput, venta_hotdesk_clp: e.target.value})}
                    className="w-full p-2 border rounded text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold">Venta Asesorías (CLP)</Label>
                  <input
                    type="text"
                    placeholder="$50.000 o 50000"
                    value={datosInput.venta_asesorias_clp}
                    onChange={(e) => setDatosInput({...datosInput, venta_asesorias_clp: e.target.value})}
                    className="w-full p-2 border rounded text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold">Gasto Insumos (CLP)</Label>
                  <input
                    type="text"
                    placeholder="$45.000 o 45000"
                    value={datosInput.gasto_insumos_clp}
                    onChange={(e) => setDatosInput({...datosInput, gasto_insumos_clp: e.target.value})}
                    className="w-full p-2 border rounded text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold">Gasto Staff Fijo (CLP)</Label>
                  <input
                    type="text"
                    placeholder="$30.000 o 30000"
                    value={datosInput.gasto_staff_fijo_clp}
                    onChange={(e) => setDatosInput({...datosInput, gasto_staff_fijo_clp: e.target.value})}
                    className="w-full p-2 border rounded text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold">Gasto Variable (CLP)</Label>
                  <input
                    type="text"
                    placeholder="$10.000 o 10000"
                    value={datosInput.gasto_variable_compartido_clp}
                    onChange={(e) => setDatosInput({...datosInput, gasto_variable_compartido_clp: e.target.value})}
                    className="w-full p-2 border rounded text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold">Baseline Café (CLP)</Label>
                  <input
                    type="text"
                    placeholder="Promedio 30 días"
                    value={datosInput.baseline_venta_cafe_clp}
                    onChange={(e) => setDatosInput({...datosInput, baseline_venta_cafe_clp: e.target.value})}
                    className="w-full p-2 border rounded text-sm"
                  />
                </div>
              </div>

              <Alert className="border-green-500 bg-green-50">
                <CheckCircle2 className="h-4 w-4" />
                <AlertTitle className="text-xs font-bold">💡 Formato Flexible</AlertTitle>
                <AlertDescription className="text-[10px]">
                  Puedes ingresar: "$150.000", "150.000", "150000" - el sistema normaliza automáticamente
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>

        {/* Columna Derecha: OUTPUT */}
        <div className="space-y-6">
          {/* Botón Procesar */}
          <Card className="border-2 border-purple-500">
            <CardContent className="pt-6">
              <Button
                onClick={procesarAuditoria}
                disabled={procesando}
                size="lg"
                className="w-full h-16 bg-purple-600 hover:bg-purple-700 text-white font-bold text-lg"
              >
                {procesando ? (
                  <>
                    <Activity className="mr-3 h-6 w-6 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  <>
                    <Zap className="mr-3 h-6 w-6" />
                    EJECUTAR AUDITORÍA
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Resultado */}
          {resultado && (
            <>
              {/* Status Card */}
              <Card className={`border-2 ${
                resultado.classification.status_operativo === 'CRITICO' ? 'border-red-500 bg-red-50' :
                resultado.classification.status_operativo === 'ALERTA' ? 'border-amber-500 bg-amber-50' :
                'border-green-500 bg-green-50'
              }`}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {resultado.classification.status_operativo === 'CRITICO' ? <XCircle className="h-6 w-6 text-red-600" /> :
                     resultado.classification.status_operativo === 'ALERTA' ? <AlertTriangle className="h-6 w-6 text-amber-600" /> :
                     <CheckCircle2 className="h-6 w-6 text-green-600" />}
                    Resultado de Auditoría
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-gray-600">Status Operativo</p>
                      <Badge className={`text-sm ${
                        resultado.classification.status_operativo === 'CRITICO' ? 'bg-red-600' :
                        resultado.classification.status_operativo === 'ALERTA' ? 'bg-amber-600' :
                        'bg-green-600'
                      }`}>
                        {resultado.classification.status_operativo}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Label del Día</p>
                      <Badge variant="outline" className="text-xs font-mono">
                        {resultado.classification.day_label}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Genio y Figura</p>
                      <Badge className={
                        resultado.kpis.status_genio_figura === 'Genio' ? 'bg-blue-600' : 'bg-gray-600'
                      }>
                        {resultado.kpis.status_genio_figura}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Requiere Confirmación</p>
                      <Badge variant={resultado.classification.needs_human_confirm ? 'destructive' : 'outline'}>
                        {resultado.classification.needs_human_confirm ? 'Sí' : 'No'}
                      </Badge>
                    </div>
                  </div>

                  <div className="pt-3 border-t">
                    <p className="text-xs font-bold text-gray-700 mb-2">KPIs Financieros</p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-gray-600">Venta Total:</span>
                        <span className="font-bold ml-2">${resultado.summary_text_clp_formatted.venta_total}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">RevPSM:</span>
                        <span className="font-bold ml-2">${resultado.summary_text_clp_formatted.revpsm}/m²</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Utilidad Neta:</span>
                        <span className="font-bold ml-2">${resultado.summary_text_clp_formatted.utilidad_neta}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Payback:</span>
                        <span className="font-bold ml-2">{resultado.kpis.payback_days_today} días</span>
                      </div>
                    </div>
                  </div>

                  {resultado.financial_impact.lost_revenue_estimate_clp !== null && resultado.financial_impact.lost_revenue_estimate_clp > 0 && (
                    <Alert className="border-red-500 bg-red-50">
                      <ShieldAlert className="h-4 w-4" />
                      <AlertTitle className="text-xs font-bold">⚠️ Impacto Financiero</AlertTitle>
                      <AlertDescription className="text-xs mt-1">
                        {resultado.financial_impact.investor_risk_note}
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>

              {/* SOP Actions */}
              <Card className="border-2 border-orange-500">
                <CardHeader>
                  <CardTitle className="text-lg">SOP - Acciones 24-48h</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {resultado.sop_actions.map((action, idx) => (
                      <div key={idx} className="border rounded-lg p-3 bg-white">
                        <div className="flex items-start justify-between mb-1">
                          <span className="text-xs font-bold text-gray-900">{action.role}</span>
                          <Badge className={
                            action.priority === 'P0' ? 'bg-red-600' :
                            action.priority === 'P1' ? 'bg-amber-600' :
                            'bg-gray-600'
                          }>
                            {action.priority}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-700">{action.action}</p>
                        <p className="text-[10px] text-gray-500 mt-1">Deadline: {action.deadline_hours}h</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* JSON Output */}
              <Card className="border-2 border-gray-500">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileJson className="h-5 w-5 text-gray-600" />
                    JSON Output
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Textarea
                    value={jsonOutput}
                    readOnly
                    rows={10}
                    className="font-mono text-xs bg-gray-900 text-green-400 border-gray-700"
                  />
                  
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      onClick={descargarJSON}
                      variant="outline"
                      size="sm"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Descargar JSON
                    </Button>
                    <Button
                      onClick={enviarAMake}
                      size="sm"
                      className="bg-cyan-600 hover:bg-cyan-700"
                    >
                      <Send className="mr-2 h-4 w-4" />
                      Enviar a Make.com
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>

      {/* Configuración Webhook */}
      <Card className="border-2 border-blue-500 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-lg">📋 Configuración Make.com</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="border-blue-500 bg-white">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle className="text-sm font-bold">Instrucciones de Integración</AlertTitle>
            <AlertDescription className="text-xs space-y-2 mt-2">
              <p>1. En Make.com: Crea un escenario con módulo "Custom Webhook"</p>
              <p>2. Copia la URL del webhook (ej: https://hook.us1.make.com/...)</p>
              <p>3. En este archivo (<code>/src/app/components/AuditoriaOperativa.tsx</code>):</p>
              <ul className="list-disc list-inside ml-3">
                <li>Línea 24: Reemplaza <code>WEBHOOK_URL</code></li>
                <li>Líneas 469-479: Descomenta el bloque fetch()</li>
              </ul>
              <p className="font-semibold mt-2">El JSON enviado incluye:</p>
              <ul className="list-disc list-inside ml-3">
                <li>Detecciones visuales con confidence</li>
                <li>KPIs financieros calculados</li>
                <li>Status operativo y label del día</li>
                <li>SOP actions por rol con prioridad</li>
                <li>Impacto financiero estimado</li>
              </ul>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
