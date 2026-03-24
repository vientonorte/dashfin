// ============================================================================
// AI INSIGHTS ENGINE - Analytical intelligence for DashFin
// Generates daily insights, weekly decisions, anomaly detection,
// and "next best action" recommendations with full explainability.
// ============================================================================

import type { RegistroMensualTriple } from '../contexts/DashboardContext';

// ---- Types ----

export type InsightSeverity = 'info' | 'warning' | 'critical' | 'positive';
export type InsightCategory = 'daily' | 'weekly' | 'anomaly' | 'action';

export interface AIInsight {
  id: string;
  category: InsightCategory;
  severity: InsightSeverity;
  title: string;
  description: string;
  explanation: string; // "Why this recommendation?" - explainability
  metric?: string;
  value?: string;
  trend?: 'up' | 'down' | 'stable';
  action?: NextBestAction;
  timestamp: string;
}

export interface NextBestAction {
  label: string;
  rationale: string; // Why this action is recommended
  impact: string;    // Expected impact
  priority: 'high' | 'medium' | 'low';
}

export interface AIAnalysis {
  dailyInsights: AIInsight[];
  weeklyDecisions: AIInsight[];
  anomalies: AIInsight[];
  nextBestActions: AIInsight[];
  summary: string;
  confidence: number; // 0-100, based on data quality
  dataPoints: number;
}

// ---- Utility Helpers ----

function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function stdDev(values: number[]): number {
  if (values.length < 2) return 0;
  const avg = mean(values);
  const squaredDiffs = values.map(v => Math.pow(v - avg, 2));
  return Math.sqrt(mean(squaredDiffs));
}

function percentChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / Math.abs(previous)) * 100;
}

function trendDirection(values: number[]): 'up' | 'down' | 'stable' {
  if (values.length < 2) return 'stable';
  const recent = mean(values.slice(-3));
  const earlier = mean(values.slice(0, Math.max(1, values.length - 3)));
  const change = percentChange(recent, earlier);
  if (change > 5) return 'up';
  if (change < -5) return 'down';
  return 'stable';
}

// Inversión total del negocio (usada para cálculo de ROI y payback)
const INVERSION_TOTAL = 37697000;

function formatCLP(num: number): string {
  return `$${Math.round(num).toLocaleString('es-CL')}`;
}

function makeId(prefix: string, index: number): string {
  return `${prefix}_${Date.now()}_${index}`;
}

// ---- Core Analysis Engine ----

export function generateAnalysis(registros: RegistroMensualTriple[]): AIAnalysis {
  const sorted = [...registros].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const dataPoints = sorted.length;
  const confidence = computeConfidence(dataPoints);

  if (dataPoints === 0) {
    return {
      dailyInsights: [{
        id: 'empty_0',
        category: 'daily',
        severity: 'info',
        title: 'Sin datos disponibles',
        description: 'Importa registros para activar el análisis inteligente.',
        explanation: 'El motor de insights necesita al menos 1 registro para generar análisis.',
        timestamp: new Date().toISOString(),
      }],
      weeklyDecisions: [],
      anomalies: [],
      nextBestActions: [],
      summary: 'Importa datos para comenzar a recibir insights.',
      confidence: 0,
      dataPoints: 0,
    };
  }

  const dailyInsights = generateDailyInsights(sorted);
  const weeklyDecisions = generateWeeklyDecisions(sorted);
  const anomalies = detectAnomalies(sorted);
  const nextBestActions = generateNextBestActions(sorted);
  const summary = generateSummary(sorted, anomalies.length);

  return {
    dailyInsights,
    weeklyDecisions,
    anomalies,
    nextBestActions,
    summary,
    confidence,
    dataPoints,
  };
}

// ---- Confidence Score ----

function computeConfidence(dataPoints: number): number {
  if (dataPoints === 0) return 0;
  if (dataPoints <= 2) return 25;
  if (dataPoints <= 5) return 50;
  if (dataPoints <= 8) return 75;
  return Math.min(95, 75 + dataPoints);
}

// ---- Daily Insights ----

function generateDailyInsights(sorted: RegistroMensualTriple[]): AIInsight[] {
  const insights: AIInsight[] = [];
  const latest = sorted[sorted.length - 1];
  const previous = sorted.length >= 2 ? sorted[sorted.length - 2] : null;
  let idx = 0;

  // 1. Revenue trend
  const ventas = sorted.map(r => r.venta_total_clp);
  const ventaTrend = trendDirection(ventas);
  const ventaChange = previous ? percentChange(latest.venta_total_clp, previous.venta_total_clp) : 0;
  insights.push({
    id: makeId('daily', idx++),
    category: 'daily',
    severity: ventaTrend === 'up' ? 'positive' : ventaTrend === 'down' ? 'warning' : 'info',
    title: ventaTrend === 'up'
      ? 'Ventas en tendencia alcista'
      : ventaTrend === 'down'
        ? 'Ventas en tendencia bajista'
        : 'Ventas estables',
    description: `Venta actual: ${formatCLP(latest.venta_total_clp)}${previous ? ` (${ventaChange > 0 ? '+' : ''}${ventaChange.toFixed(1)}% vs período anterior)` : ''}.`,
    explanation: `Análisis basado en ${sorted.length} períodos. La tendencia se calcula comparando el promedio de los últimos 3 períodos vs los anteriores.`,
    metric: 'Venta Total',
    value: formatCLP(latest.venta_total_clp),
    trend: ventaTrend,
    timestamp: new Date().toISOString(),
  });

  // 2. Profitability check
  const utilidad = latest.utilidad_neta_clp;
  const margenNeto = latest.margen_neto_percent;
  insights.push({
    id: makeId('daily', idx++),
    category: 'daily',
    severity: margenNeto > 15 ? 'positive' : margenNeto > 5 ? 'info' : 'warning',
    title: margenNeto > 15
      ? 'Rentabilidad saludable'
      : margenNeto > 5
        ? 'Rentabilidad aceptable'
        : 'Rentabilidad bajo presión',
    description: `Margen neto: ${margenNeto.toFixed(1)}%. Utilidad: ${formatCLP(utilidad)}.`,
    explanation: `El margen neto mide qué porcentaje de cada peso vendido se convierte en utilidad después de todos los costos. Un margen >15% es saludable para este tipo de negocio.`,
    metric: 'Margen Neto',
    value: `${margenNeto.toFixed(1)}%`,
    trend: trendDirection(sorted.map(r => r.margen_neto_percent)),
    timestamp: new Date().toISOString(),
  });

  // 3. Dominant line insight
  const lineNames: Record<string, string> = { cafe: 'Café', hotdesk: 'Hotdesk', asesoria: 'Asesorías' };
  insights.push({
    id: makeId('daily', idx++),
    category: 'daily',
    severity: 'info',
    title: `Línea dominante: ${lineNames[latest.linea_dominante] || latest.linea_dominante}`,
    description: `Café: ${formatCLP(latest.margen_cafe_clp)} | Hotdesk: ${formatCLP(latest.margen_hotdesk_clp)} | Asesorías: ${formatCLP(latest.margen_asesoria_clp)}.`,
    explanation: `La línea dominante es la que genera mayor margen bruto en el período más reciente. Esto ayuda a priorizar recursos operativos.`,
    metric: 'Mix de Negocio',
    timestamp: new Date().toISOString(),
  });

  // 4. ROI progress
  const roiPercent = (latest.roi * 100);
  insights.push({
    id: makeId('daily', idx++),
    category: 'daily',
    severity: roiPercent > 2 ? 'positive' : roiPercent > 0 ? 'info' : 'critical',
    title: `ROI mensual: ${roiPercent.toFixed(2)}%`,
    description: latest.payback_days
      ? `Payback estimado: ${latest.payback_days} días al ritmo actual.`
      : 'Utilidad insuficiente para calcular payback.',
    explanation: `ROI = utilidad neta / inversión total. Un ROI mensual >2% indica recuperación saludable de la inversión inicial.`,
    metric: 'ROI',
    value: `${roiPercent.toFixed(2)}%`,
    trend: trendDirection(sorted.map(r => r.roi)),
    timestamp: new Date().toISOString(),
  });

  return insights;
}

// ---- Weekly Decisions ----

function generateWeeklyDecisions(sorted: RegistroMensualTriple[]): AIInsight[] {
  const decisions: AIInsight[] = [];
  if (sorted.length < 2) return decisions;

  const latest = sorted[sorted.length - 1];
  const previous = sorted[sorted.length - 2];
  let idx = 0;

  // 1. Revenue mix shift
  const cafeShare = latest.venta_cafe_clp / latest.venta_total_clp * 100;
  const hotdeskShare = latest.venta_hotdesk_clp / latest.venta_total_clp * 100;
  const asesoriaShare = latest.venta_asesoria_clp / latest.venta_total_clp * 100;

  const prevCafeShare = previous.venta_cafe_clp / previous.venta_total_clp * 100;
  const cafeShift = cafeShare - prevCafeShare;

  if (Math.abs(cafeShift) > 3) {
    decisions.push({
      id: makeId('weekly', idx++),
      category: 'weekly',
      severity: cafeShift < -3 ? 'warning' : 'info',
      title: 'Cambio en mix de ventas',
      description: `Café: ${cafeShare.toFixed(1)}% (${cafeShift > 0 ? '+' : ''}${cafeShift.toFixed(1)}pp). Hotdesk: ${hotdeskShare.toFixed(1)}%. Asesorías: ${asesoriaShare.toFixed(1)}%.`,
      explanation: `Cuando el mix cambia >3 puntos porcentuales, conviene revisar si es por demanda o por capacidad ociosa. Un mix más diversificado reduce riesgo.`,
      timestamp: new Date().toISOString(),
    });
  }

  // 2. Operational efficiency
  const opexRatio = latest.gastos_operacion_clp / latest.venta_total_clp * 100;
  const prevOpexRatio = previous.gastos_operacion_clp / previous.venta_total_clp * 100;
  const opexChange = opexRatio - prevOpexRatio;

  decisions.push({
    id: makeId('weekly', idx++),
    category: 'weekly',
    severity: opexRatio > 50 ? 'warning' : opexRatio > 40 ? 'info' : 'positive',
    title: `Eficiencia operativa: ${opexRatio.toFixed(1)}%`,
    description: `Gastos operación representan ${opexRatio.toFixed(1)}% de ventas (${opexChange > 0 ? '+' : ''}${opexChange.toFixed(1)}pp vs anterior).`,
    explanation: `Mide cuánto de cada peso vendido se consume en gastos operativos (sueldos, arriendo, servicios). Ideal: <40%. >50% requiere acción inmediata.`,
    metric: 'OPEX Ratio',
    value: `${opexRatio.toFixed(1)}%`,
    trend: opexChange > 2 ? 'up' : opexChange < -2 ? 'down' : 'stable',
    timestamp: new Date().toISOString(),
    action: opexRatio > 45 ? {
      label: 'Revisar estructura de costos',
      rationale: 'Los gastos operativos superan el 45% de ventas, comprimiendo la utilidad.',
      impact: 'Reducir OPEX ratio en 5pp podría aumentar utilidad en ~' + formatCLP(latest.venta_total_clp * 0.05),
      priority: 'high',
    } : undefined,
  });

  // 3. COGS management
  const cogsRatio = latest.cogs_total_clp / latest.venta_total_clp * 100;
  decisions.push({
    id: makeId('weekly', idx++),
    category: 'weekly',
    severity: cogsRatio > 25 ? 'warning' : 'positive',
    title: `COGS consolidado: ${cogsRatio.toFixed(1)}%`,
    description: `Café COGS: ${latest.margen_cafe_percent.toFixed(0)}% margen. Hotdesk: ${latest.margen_hotdesk_percent.toFixed(0)}% margen.`,
    explanation: `El COGS ponderado refleja el costo directo de entregar cada línea de servicio. El mix de negocio impacta directamente este ratio.`,
    metric: 'COGS',
    value: `${cogsRatio.toFixed(1)}%`,
    timestamp: new Date().toISOString(),
  });

  // 4. RevPSM trend
  const revpsmValues = sorted.map(r => r.revpsm_clp_m2);
  const revpsmTrend = trendDirection(revpsmValues);
  decisions.push({
    id: makeId('weekly', idx++),
    category: 'weekly',
    severity: revpsmTrend === 'down' ? 'warning' : 'info',
    title: `RevPSM: ${formatCLP(latest.revpsm_clp_m2)}/m²`,
    description: `Ingreso por metro cuadrado ${revpsmTrend === 'up' ? 'mejorando' : revpsmTrend === 'down' ? 'cayendo' : 'estable'}.`,
    explanation: `Revenue Per Square Meter mide la productividad del espacio físico. Es clave para decisiones de layout y asignación de metros a cada línea.`,
    metric: 'RevPSM',
    value: formatCLP(latest.revpsm_clp_m2),
    trend: revpsmTrend,
    timestamp: new Date().toISOString(),
    action: revpsmTrend === 'down' ? {
      label: 'Optimizar uso del espacio',
      rationale: 'El ingreso por m² está cayendo, lo que sugiere subutilización.',
      impact: 'Reasignar espacio a la línea más rentable podría mejorar RevPSM en 10-20%.',
      priority: 'medium',
    } : undefined,
  });

  return decisions;
}

// ---- Anomaly Detection ----

function detectAnomalies(sorted: RegistroMensualTriple[]): AIInsight[] {
  const anomalies: AIInsight[] = [];
  if (sorted.length < 3) return anomalies;

  let idx = 0;
  const latest = sorted[sorted.length - 1];

  // Z-score anomaly detection on key metrics
  const checks: {
    name: string;
    values: number[];
    latestVal: number;
    unit: string;
    threshold: number;
  }[] = [
    {
      name: 'Venta Total',
      values: sorted.map(r => r.venta_total_clp),
      latestVal: latest.venta_total_clp,
      unit: 'CLP',
      threshold: 1.8,
    },
    {
      name: 'Utilidad Neta',
      values: sorted.map(r => r.utilidad_neta_clp),
      latestVal: latest.utilidad_neta_clp,
      unit: 'CLP',
      threshold: 1.8,
    },
    {
      name: 'Margen Bruto %',
      values: sorted.map(r => r.margen_bruto_percent),
      latestVal: latest.margen_bruto_percent,
      unit: '%',
      threshold: 1.5,
    },
    {
      name: 'Gastos Operación',
      values: sorted.map(r => r.gastos_operacion_clp),
      latestVal: latest.gastos_operacion_clp,
      unit: 'CLP',
      threshold: 1.8,
    },
    {
      name: 'ROI',
      values: sorted.map(r => r.roi),
      latestVal: latest.roi,
      unit: '',
      threshold: 2.0,
    },
  ];

  for (const check of checks) {
    const avg = mean(check.values);
    const sd = stdDev(check.values);
    if (sd === 0) continue;

    const zScore = (check.latestVal - avg) / sd;

    if (Math.abs(zScore) >= check.threshold) {
      const isHigh = zScore > 0;
      const formatted = check.unit === 'CLP'
        ? formatCLP(check.latestVal)
        : check.unit === '%'
          ? `${check.latestVal.toFixed(1)}%`
          : check.latestVal.toFixed(4);

      anomalies.push({
        id: makeId('anomaly', idx++),
        category: 'anomaly',
        severity: isHigh && check.name !== 'Gastos Operación' ? 'positive' : 'critical',
        title: `${check.name}: valor ${isHigh ? 'inusualmente alto' : 'inusualmente bajo'}`,
        description: `Valor actual: ${formatted}. Promedio: ${check.unit === 'CLP' ? formatCLP(avg) : check.unit === '%' ? avg.toFixed(1) + '%' : avg.toFixed(4)}. Desviación: ${Math.abs(zScore).toFixed(1)}σ.`,
        explanation: `Se detectó que ${check.name} está a ${Math.abs(zScore).toFixed(1)} desviaciones estándar del promedio histórico. Valores fuera de ${check.threshold}σ son estadísticamente inusuales y merecen investigación.`,
        metric: check.name,
        value: formatted,
        trend: isHigh ? 'up' : 'down',
        timestamp: new Date().toISOString(),
      });
    }
  }

  // Cannibalization alert
  if (latest.alerta_canibalizacion) {
    anomalies.push({
      id: makeId('anomaly', idx++),
      category: 'anomaly',
      severity: 'warning',
      title: 'Alerta de canibalización',
      description: latest.alerta_canibalizacion,
      explanation: 'Se activa cuando asesorías generan más del 50% del margen de café. Puede indicar que el espacio destinado a café sería más rentable como zona de reuniones/asesorías.',
      timestamp: new Date().toISOString(),
    });
  }

  return anomalies;
}

// ---- Next Best Actions ----

function generateNextBestActions(sorted: RegistroMensualTriple[]): AIInsight[] {
  const actions: AIInsight[] = [];
  const latest = sorted[sorted.length - 1];
  let idx = 0;

  // 1. Margin optimization
  if (latest.margen_cafe_percent < 65) {
    actions.push({
      id: makeId('action', idx++),
      category: 'action',
      severity: 'warning',
      title: 'Optimizar margen de café',
      description: `Margen café en ${latest.margen_cafe_percent.toFixed(1)}%, por debajo del objetivo de 65%.`,
      explanation: 'El margen de café depende del COGS (costo de insumos). Revisar proveedores, merma, y precios puede mejorar la rentabilidad sin afectar volumen.',
      action: {
        label: 'Renegociar con proveedores o ajustar precios',
        rationale: `Con margen actual de ${latest.margen_cafe_percent.toFixed(1)}%, cada punto porcentual de mejora equivale a ~${formatCLP(latest.venta_cafe_clp * 0.01)} adicionales.`,
        impact: `Potencial mejora: ${formatCLP(latest.venta_cafe_clp * 0.03)} mensuales (+3pp margen).`,
        priority: 'high',
      },
      timestamp: new Date().toISOString(),
    });
  }

  // 2. Revenue diversification
  const cafeRatio = latest.venta_cafe_clp / latest.venta_total_clp;
  if (cafeRatio > 0.65) {
    actions.push({
      id: makeId('action', idx++),
      category: 'action',
      severity: 'info',
      title: 'Diversificar fuentes de ingreso',
      description: `Café representa ${(cafeRatio * 100).toFixed(0)}% de ventas totales. Alta concentración.`,
      explanation: 'Depender de una sola línea >65% aumenta el riesgo. Hotdesk y asesorías ofrecen márgenes superiores y pueden balancear la estructura de ingresos.',
      action: {
        label: 'Potenciar hotdesk y asesorías',
        rationale: 'Hotdesk tiene ~92% margen vs ~68% de café. Cada peso migrado de café a hotdesk genera más utilidad.',
        impact: 'Reducir concentración a 55% café mejoraría margen ponderado en ~3-5pp.',
        priority: 'medium',
      },
      timestamp: new Date().toISOString(),
    });
  }

  // 3. Genio/Figura status
  if (latest.status === 'Figura') {
    actions.push({
      id: makeId('action', idx++),
      category: 'action',
      severity: 'critical',
      title: 'Recuperar status Genio',
      description: `Utilidad neta de ${formatCLP(latest.utilidad_neta_clp)} está por debajo del umbral de $150.000.`,
      explanation: 'El status "Genio" requiere utilidad neta >$150.000. Estar en "Figura" indica que los costos consumen casi toda la venta. Se necesita acción inmediata.',
      action: {
        label: 'Plan de emergencia: reducir costos o aumentar ticket promedio',
        rationale: `Faltan ${formatCLP(150000 - latest.utilidad_neta_clp)} para alcanzar status Genio.`,
        impact: 'Recuperar status Genio indica viabilidad financiera del negocio.',
        priority: 'high',
      },
      timestamp: new Date().toISOString(),
    });
  }

  // 4. Growth opportunity - always provide a positive action
  if (sorted.length >= 3) {
    const ventasTrend = trendDirection(sorted.map(r => r.venta_total_clp));
    if (ventasTrend === 'up') {
      actions.push({
        id: makeId('action', idx++),
        category: 'action',
        severity: 'positive',
        title: 'Capitalizar momentum de crecimiento',
        description: 'Las ventas muestran tendencia alcista. Buen momento para invertir en crecimiento.',
        explanation: 'Cuando las ventas están en tendencia positiva sostenida (3+ períodos), el retorno de acciones de crecimiento tiende a ser mayor.',
        action: {
          label: 'Considerar expansión de horario o servicios',
          rationale: 'La demanda creciente podría absorber más capacidad sin incrementar significativamente los costos fijos.',
          impact: 'Expansión modesta (10% más capacidad) podría generar ~10% más ingreso a costo marginal bajo.',
          priority: 'low',
        },
        timestamp: new Date().toISOString(),
      });
    }
  }

  // 5. Always have at least one positive action
  if (actions.length === 0) {
    actions.push({
      id: makeId('action', idx++),
      category: 'action',
      severity: 'positive',
      title: 'Negocio en buen estado',
      description: 'No se detectan acciones urgentes. Mantener el rumbo actual.',
      explanation: 'Todos los indicadores están dentro de rangos saludables. El foco debe estar en optimización continua y monitoreo de tendencias.',
      action: {
        label: 'Monitorear KPIs semanalmente',
        rationale: 'Mantener la disciplina de seguimiento permite detectar desvíos tempranamente.',
        impact: 'Detección temprana de problemas reduce tiempo de reacción y pérdidas potenciales.',
        priority: 'low',
      },
      timestamp: new Date().toISOString(),
    });
  }

  return actions;
}

// ---- Summary Generator ----

function generateSummary(sorted: RegistroMensualTriple[], anomalyCount: number): string {
  const latest = sorted[sorted.length - 1];
  const trend = trendDirection(sorted.map(r => r.venta_total_clp));

  const trendText = trend === 'up'
    ? 'tendencia positiva'
    : trend === 'down'
      ? 'tendencia a la baja'
      : 'tendencia estable';

  const statusText = latest.status === 'Genio'
    ? 'saludable (Genio)'
    : 'bajo presión (Figura)';

  const anomalyText = anomalyCount > 0
    ? ` Se detectaron ${anomalyCount} anomalía(s) que requieren atención.`
    : ' No se detectaron anomalías.';

  return `Negocio en estado ${statusText} con ${trendText} en ventas. Margen neto: ${latest.margen_neto_percent.toFixed(1)}%. Línea dominante: ${latest.linea_dominante}.${anomalyText}`;
}

// ---- Conversational Query Processor ----

export type QueryIntent =
  | 'revenue' | 'profit' | 'margin' | 'roi' | 'costs'
  | 'cafe' | 'hotdesk' | 'asesoria' | 'comparison'
  | 'trend' | 'anomaly' | 'action' | 'general';

interface ConversationalResponse {
  answer: string;
  relatedInsights: AIInsight[];
  followUp: string;
}

const INTENT_KEYWORDS: Record<QueryIntent, string[]> = {
  revenue: ['venta', 'ventas', 'ingreso', 'ingresos', 'facturación', 'revenue'],
  profit: ['utilidad', 'ganancia', 'profit', 'resultado', 'beneficio'],
  margin: ['margen', 'margin', 'rentabilidad'],
  roi: ['roi', 'retorno', 'inversión', 'payback', 'recuperación'],
  costs: ['costo', 'gasto', 'cogs', 'opex', 'gastos'],
  cafe: ['café', 'cafe', 'cafetería', 'cafeteria'],
  hotdesk: ['hotdesk', 'cowork', 'coworking', 'escritorio'],
  asesoria: ['asesoría', 'asesoria', 'consultoría', 'consultoria', 'consulting'],
  comparison: ['comparar', 'comparación', 'versus', 'vs', 'diferencia'],
  trend: ['tendencia', 'trend', 'evolución', 'crecimiento', 'caída'],
  anomaly: ['anomalía', 'anomalia', 'raro', 'inusual', 'alerta', 'problema'],
  action: ['qué hacer', 'que hacer', 'acción', 'accion', 'recomendar', 'recomendación', 'siguiente paso'],
  general: ['cómo va', 'como va', 'resumen', 'estado', 'salud', 'general'],
};

function detectIntent(query: string): QueryIntent {
  const lower = query.toLowerCase();
  let bestMatch: QueryIntent = 'general';
  let bestScore = 0;

  for (const [intent, keywords] of Object.entries(INTENT_KEYWORDS)) {
    const score = keywords.filter(kw => lower.includes(kw)).length;
    if (score > bestScore) {
      bestScore = score;
      bestMatch = intent as QueryIntent;
    }
  }

  return bestMatch;
}

export function processQuery(
  query: string,
  registros: RegistroMensualTriple[],
  analysis: AIAnalysis
): ConversationalResponse {
  const intent = detectIntent(query);
  const sorted = [...registros].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  if (sorted.length === 0) {
    return {
      answer: 'Aún no hay datos cargados. Importa registros desde CSV o Google Sheets para que pueda analizar tu negocio.',
      relatedInsights: [],
      followUp: '¿Necesitas ayuda para importar datos?',
    };
  }

  const latest = sorted[sorted.length - 1];

  switch (intent) {
    case 'revenue':
      return {
        answer: `La venta total del último período es ${formatCLP(latest.venta_total_clp)}. Desglose: Café ${formatCLP(latest.venta_cafe_clp)}, Hotdesk ${formatCLP(latest.venta_hotdesk_clp)}, Asesorías ${formatCLP(latest.venta_asesoria_clp)}. La tendencia general es ${trendDirection(sorted.map(r => r.venta_total_clp)) === 'up' ? 'alcista ↑' : trendDirection(sorted.map(r => r.venta_total_clp)) === 'down' ? 'bajista ↓' : 'estable →'}.`,
        relatedInsights: analysis.dailyInsights.filter(i => i.metric === 'Venta Total' || i.metric === 'Mix de Negocio'),
        followUp: '¿Quieres ver la tendencia de una línea específica?',
      };

    case 'profit':
      return {
        answer: `La utilidad neta es ${formatCLP(latest.utilidad_neta_clp)} (margen neto: ${latest.margen_neto_percent.toFixed(1)}%). Status: ${latest.status}. ${latest.status === 'Genio' ? 'El negocio es rentable.' : 'Atención: la utilidad está por debajo del umbral de $150.000.'}`,
        relatedInsights: analysis.dailyInsights.filter(i => i.metric === 'Margen Neto'),
        followUp: '¿Quieres analizar qué factores impactan la utilidad?',
      };

    case 'margin':
      return {
        answer: `Márgenes por línea: Café ${latest.margen_cafe_percent.toFixed(1)}% (${formatCLP(latest.margen_cafe_clp)}), Hotdesk ${latest.margen_hotdesk_percent.toFixed(1)}% (${formatCLP(latest.margen_hotdesk_clp)}), Asesorías ${latest.margen_asesoria_percent.toFixed(1)}% (${formatCLP(latest.margen_asesoria_clp)}). Margen bruto consolidado: ${latest.margen_bruto_percent.toFixed(1)}%.`,
        relatedInsights: analysis.weeklyDecisions.filter(i => i.metric === 'COGS'),
        followUp: '¿Quieres ver cómo optimizar los márgenes?',
      };

    case 'roi':
      return {
        answer: `ROI mensual: ${(latest.roi * 100).toFixed(2)}%. ${latest.payback_days ? `Payback estimado: ${latest.payback_days} días.` : 'Payback no calculable con utilidad actual.'} Recuperación acumulada: ${((sorted.reduce((s, r) => s + r.utilidad_neta_clp, 0) / INVERSION_TOTAL) * 100).toFixed(1)}% de la inversión.`,
        relatedInsights: analysis.dailyInsights.filter(i => i.metric === 'ROI'),
        followUp: '¿Quieres ver escenarios de recuperación?',
      };

    case 'costs':
      return {
        answer: `Costos del último período: COGS total ${formatCLP(latest.cogs_total_clp)} (${(latest.cogs_total_clp / latest.venta_total_clp * 100).toFixed(1)}% de ventas). Gastos operación: ${formatCLP(latest.gastos_operacion_clp)} (${(latest.gastos_operacion_clp / latest.venta_total_clp * 100).toFixed(1)}% de ventas). COGS café es el principal driver con ${formatCLP(latest.cogs_cafe_clp)}.`,
        relatedInsights: analysis.weeklyDecisions.filter(i => i.metric === 'OPEX Ratio' || i.metric === 'COGS'),
        followUp: '¿Quieres recomendaciones para reducir costos?',
      };

    case 'cafe':
      return {
        answer: `Línea Café: Venta ${formatCLP(latest.venta_cafe_clp)}, COGS ${formatCLP(latest.cogs_cafe_clp)} (${(100 - latest.margen_cafe_percent).toFixed(1)}%), Margen ${formatCLP(latest.margen_cafe_clp)} (${latest.margen_cafe_percent.toFixed(1)}%). ${latest.linea_dominante === 'cafe' ? 'Es la línea dominante.' : `Línea dominante actual: ${latest.linea_dominante}.`}`,
        relatedInsights: analysis.nextBestActions.filter(i => i.title.toLowerCase().includes('café')),
        followUp: '¿Quieres comparar café con otras líneas?',
      };

    case 'hotdesk':
      return {
        answer: `Línea Hotdesk: Venta ${formatCLP(latest.venta_hotdesk_clp)}, COGS ${formatCLP(latest.cogs_hotdesk_clp)} (${(100 - latest.margen_hotdesk_percent).toFixed(1)}%), Margen ${formatCLP(latest.margen_hotdesk_clp)} (${latest.margen_hotdesk_percent.toFixed(1)}%). Alto margen por bajo costo operativo.`,
        relatedInsights: [],
        followUp: '¿Quieres ver cómo optimizar la ocupación del cowork?',
      };

    case 'asesoria':
      return {
        answer: `Línea Asesorías: Venta ${formatCLP(latest.venta_asesoria_clp)}, COGS $0 (100% margen), Margen ${formatCLP(latest.margen_asesoria_clp)}. ${latest.alerta_canibalizacion || 'Sin alerta de canibalización.'}`,
        relatedInsights: analysis.anomalies.filter(i => i.title.includes('canibalización')),
        followUp: '¿Quieres estrategias para crecer asesorías?',
      };

    case 'comparison':
      return {
        answer: `Comparación de líneas (último período):\n• Café: ${formatCLP(latest.venta_cafe_clp)} venta → ${formatCLP(latest.margen_cafe_clp)} margen (${latest.margen_cafe_percent.toFixed(0)}%)\n• Hotdesk: ${formatCLP(latest.venta_hotdesk_clp)} venta → ${formatCLP(latest.margen_hotdesk_clp)} margen (${latest.margen_hotdesk_percent.toFixed(0)}%)\n• Asesorías: ${formatCLP(latest.venta_asesoria_clp)} venta → ${formatCLP(latest.margen_asesoria_clp)} margen (100%)\nLínea dominante en margen: ${latest.linea_dominante}.`,
        relatedInsights: analysis.dailyInsights.filter(i => i.metric === 'Mix de Negocio'),
        followUp: '¿Quieres ver la evolución histórica del mix?',
      };

    case 'trend':
      return {
        answer: `Tendencias (${sorted.length} períodos): Ventas ${trendDirection(sorted.map(r => r.venta_total_clp)) === 'up' ? '↑ alcista' : trendDirection(sorted.map(r => r.venta_total_clp)) === 'down' ? '↓ bajista' : '→ estable'}. Margen neto ${trendDirection(sorted.map(r => r.margen_neto_percent)) === 'up' ? '↑ mejorando' : trendDirection(sorted.map(r => r.margen_neto_percent)) === 'down' ? '↓ deteriorándose' : '→ estable'}. ROI ${trendDirection(sorted.map(r => r.roi)) === 'up' ? '↑ acelerando' : trendDirection(sorted.map(r => r.roi)) === 'down' ? '↓ desacelerando' : '→ estable'}.`,
        relatedInsights: analysis.dailyInsights,
        followUp: '¿Quieres profundizar en alguna tendencia específica?',
      };

    case 'anomaly':
      return {
        answer: analysis.anomalies.length > 0
          ? `Se detectaron ${analysis.anomalies.length} anomalía(s):\n${analysis.anomalies.map(a => `• ${a.title}: ${a.description}`).join('\n')}`
          : 'No se detectaron anomalías significativas en el período actual. Todos los indicadores están dentro de rangos normales.',
        relatedInsights: analysis.anomalies,
        followUp: '¿Quieres entender por qué se activó alguna alerta?',
      };

    case 'action':
      return {
        answer: analysis.nextBestActions.length > 0
          ? `Acciones recomendadas:\n${analysis.nextBestActions.map(a => `• ${a.action?.priority === 'high' ? '🔴' : a.action?.priority === 'medium' ? '🟡' : '🟢'} ${a.title}: ${a.action?.label || a.description}`).join('\n')}`
          : 'No hay acciones urgentes. El negocio está en buen estado.',
        relatedInsights: analysis.nextBestActions,
        followUp: '¿Quieres más detalle sobre alguna acción?',
      };

    case 'general':
    default:
      return {
        answer: analysis.summary,
        relatedInsights: [...analysis.dailyInsights.slice(0, 2), ...analysis.nextBestActions.slice(0, 1)],
        followUp: '¿Sobre qué aspecto quieres profundizar? Ventas, márgenes, costos, ROI, o tendencias.',
      };
  }
}
