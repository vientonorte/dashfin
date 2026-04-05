import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { isSupabaseConfigured, fetchRegistros, upsertRegistros } from '../../lib/supabase';

// ============================================================================
// TIPOS - Triple Línea de Negocio (Café + Hotdesk + Asesorías)
// ============================================================================

interface DatoDiario {
  fecha: string; // YYYY-MM-DD
  venta_cafe: number;
  venta_hotdesk: number;
  venta_asesorias: number;
  gasto_insumos: number;
  gasto_staff_fijo: number;
  utilidad_neta: number;
  revpsm: number;
}

interface RegistroMensualTriple {
  id: string;
  date: string; // YYYY-MM-DD
  
  // LÍNEA 1: Cafetería Tradicional (COGS alto)
  venta_cafe_clp: number;
  cogs_cafe_clp: number; // Auto: 30-35% de venta_cafe
  margen_cafe_clp: number; // Auto: venta_cafe - cogs_cafe
  margen_cafe_percent: number; // Auto: 65-70%
  
  // LÍNEA 2: Hotdesk/Cowork (COGS bajo)
  venta_hotdesk_clp: number;
  cogs_hotdesk_clp: number; // Auto: 5-10% (electricidad/internet)
  margen_hotdesk_clp: number; // Auto: venta_hotdesk - cogs_hotdesk
  margen_hotdesk_percent: number; // Auto: 90-95%
  
  // LÍNEA 3: Asesorías/Consultoría (COGS = 0)
  venta_asesoria_clp: number;
  cogs_asesoria_clp: number; // Siempre 0%
  margen_asesoria_clp: number; // Auto: venta_asesoria (100%)
  margen_asesoria_percent: number; // Siempre 100%
  
  // CONSOLIDADO
  venta_total_clp: number; // Auto: suma 3 líneas
  cogs_total_clp: number; // Auto: suma 3 COGS
  margen_bruto_clp: number; // Auto: venta_total - cogs_total
  margen_bruto_percent: number; // Auto: margen_bruto / venta_total * 100
  
  gastos_operacion_clp: number; // Manual: sueldos, arriendo, servicios
  utilidad_neta_clp: number; // Auto: margen_bruto - gastos_operacion
  margen_neto_percent: number; // Auto: utilidad_neta / venta_total * 100
  
  // KPIs
  roi: number; // Auto: utilidad_neta / 37697000
  roi_mean_30d: number;
  roi_std_30d: number;
  revpsm_clp_m2: number; // Auto: venta_total / 25
  payback_days: number | null; // Auto: 18900000 / utilidad_neta
  status: 'Genio' | 'Figura'; // Auto: utilidad_neta > 150000
  
  // ALERTAS
  alerta_canibalizacion: string; // Auto: cuando margen_asesoria > margen_cafe * 0.5
  linea_dominante: 'cafe' | 'hotdesk' | 'asesoria'; // Auto: max margen
  
  nota: string;
  updated_at: string;
  
  // DATOS DIARIOS (opcional - solo si se importó desde CSV)
  datos_diarios?: DatoDiario[];
}

interface DashboardContextType {
  registros: RegistroMensualTriple[];
  setRegistros: (registros: RegistroMensualTriple[]) => void;
  registroActual: RegistroMensualTriple | null;
  setRegistroActual: (registro: RegistroMensualTriple | null) => void;
  rangoTemporal: '1M' | '3M' | '6M' | '1A' | 'H';
  setRangoTemporal: (rango: '1M' | '3M' | '6M' | '1A' | 'H') => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  cargarDatosDemo: () => void;
  registrosFiltrados: RegistroMensualTriple[];
  metricas: {
    recuperado: number;
    porcentajeRecuperado: number;
    mediaROI: number;
    desviacion: number;
    totalRegistros: number;
    genio: number;
    figura: number;
    paybackMeses: number;
    // Nuevas métricas por línea
    totalCafe: number;
    totalHotdesk: number;
    totalAsesoria: number;
    lineaDominante: 'cafe' | 'hotdesk' | 'asesoria' | null;
    // Métricas agregadas adicionales
    total_venta: number;
    total_venta_cafe: number;
    total_venta_hotdesk: number;
    total_venta_asesoria: number;
    total_utilidad_neta: number;
    total_gastos_operacion: number;
    revpsm_promedio: number;
    roi_promedio: number;
    roiMedio: number;
  };
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

const STORAGE_KEY = 'historial_kpi_log_triple';
const SCHEMA_VERSION = '2.0';

interface StorageEnvelope {
  version: string;
  data: RegistroMensualTriple[];
}

function cargarDesdeStorage(): RegistroMensualTriple[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);

    // Si ya tiene envelope con versión
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed) && parsed.version) {
      if (parsed.version === SCHEMA_VERSION) {
        return Array.isArray(parsed.data) ? parsed.data : [];
      }
      // Versión distinta: intentar migrar si los datos son compatibles
      console.warn(`[DashboardContext] Schema version mismatch (${parsed.version} vs ${SCHEMA_VERSION}). Intentando migrar.`);
      return Array.isArray(parsed.data) ? parsed.data : [];
    }

    // Datos legados (array directo sin version): compatibles, migrar
    if (Array.isArray(parsed)) {
      console.info('[DashboardContext] Migrando datos legados al schema v2.0');
      return parsed as RegistroMensualTriple[];
    }

    return [];
  } catch {
    console.error('[DashboardContext] Error al leer localStorage, iniciando limpio.');
    return [];
  }
}

function guardarEnStorage(registros: RegistroMensualTriple[]): void {
  try {
    const envelope: StorageEnvelope = { version: SCHEMA_VERSION, data: registros };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(envelope));
  } catch {
    console.error('[DashboardContext] Error al guardar en localStorage.');
  }
}

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [registros, setRegistrosState] = useState<RegistroMensualTriple[]>([]);
  const [registroActual, setRegistroActual] = useState<RegistroMensualTriple | null>(null);
  const [rangoTemporal, setRangoTemporal] = useState<'1M' | '3M' | '6M' | '1A' | 'H'>('H');
  const [searchTerm, setSearchTerm] = useState('');

  // Cargar datos: Supabase primero, localStorage como fallback
  useEffect(() => {
    let cancelled = false;
    async function init() {
      if (isSupabaseConfigured()) {
        const remote = await fetchRegistros<RegistroMensualTriple>();
        if (!cancelled && remote.length > 0) {
          setRegistrosState(remote);
          guardarEnStorage(remote); // sync local cache
          return;
        }
      }
      const local = cargarDesdeStorage();
      if (!cancelled && local.length > 0) {
        setRegistrosState(local);
        // If Supabase is configured but empty, push local data up
        if (isSupabaseConfigured()) {
          upsertRegistros(local);
        }
      }
    }
    init();
    return () => { cancelled = true; };
  }, []);

  // Guardar en localStorage + Supabase cuando cambien los registros
  const setRegistros = useCallback((nuevosRegistros: RegistroMensualTriple[]) => {
    setRegistrosState(nuevosRegistros);
    guardarEnStorage(nuevosRegistros);
    if (isSupabaseConfigured()) {
      upsertRegistros(nuevosRegistros);
    }
  }, []);

  // Filtrar registros según rango temporal y búsqueda
  const applySearch = (list: RegistroMensualTriple[]) => {
    if (!searchTerm.trim()) return list;
    const term = searchTerm.trim().toLowerCase();
    return list.filter(r =>
      r.date.includes(term) ||
      r.nota.toLowerCase().includes(term) ||
      r.status.toLowerCase().includes(term) ||
      r.linea_dominante.toLowerCase().includes(term) ||
      r.alerta_canibalizacion.toLowerCase().includes(term)
    );
  };

  const registrosFiltrados = (() => {
    if (registros.length === 0) return [];
    if (rangoTemporal === 'H') return applySearch(registros);

    const mesesMap = {
      '1M': 1,
      '3M': 3,
      '6M': 6,
      '1A': 12
    };

    const meses = mesesMap[rangoTemporal];
    const fechaLimite = new Date();
    fechaLimite.setMonth(fechaLimite.getMonth() - meses);

    const filtrados = registros.filter(r => new Date(r.date) >= fechaLimite);
    
    return applySearch(filtrados);
  })();

  // Calcular métricas globales
  const metricas = (() => {
    const recuperado = registrosFiltrados.reduce((sum, r) => sum + r.utilidad_neta_clp, 0);
    const porcentajeRecuperado = (recuperado / 37697000) * 100;
    const mediaROI = registrosFiltrados.length > 0
      ? registrosFiltrados.reduce((sum, r) => sum + r.roi, 0) / registrosFiltrados.length * 100
      : 0;
    
    const calcularDesviacion = (valores: number[]): number => {
      if (valores.length < 2) return 0;
      const media = valores.reduce((a, b) => a + b, 0) / valores.length;
      const varianza = valores.reduce((sum, val) => sum + Math.pow(val - media, 2), 0) / valores.length;
      return Math.sqrt(varianza);
    };

    const desviacion = registrosFiltrados.length >= 2
      ? calcularDesviacion(registrosFiltrados.map(r => r.roi * 100))
      : 0;

    const genio = registrosFiltrados.filter(r => r.status === 'Genio').length;
    const figura = registrosFiltrados.filter(r => r.status === 'Figura').length;

    const paybackMeses = mediaROI > 0
      ? Math.ceil(((37697000 - recuperado) / 37697000) / (mediaROI / 100))
      : 999;

    // Nuevas métricas por línea
    const totalCafe = registrosFiltrados.reduce((sum, r) => sum + r.margen_cafe_clp, 0);
    const totalHotdesk = registrosFiltrados.reduce((sum, r) => sum + r.margen_hotdesk_clp, 0);
    const totalAsesoria = registrosFiltrados.reduce((sum, r) => sum + r.margen_asesoria_clp, 0);

    let lineaDominante: 'cafe' | 'hotdesk' | 'asesoria' | null = null;
    if (registrosFiltrados.length > 0) {
      const maxMargen = Math.max(totalCafe, totalHotdesk, totalAsesoria);
      if (maxMargen === totalCafe) lineaDominante = 'cafe';
      else if (maxMargen === totalHotdesk) lineaDominante = 'hotdesk';
      else if (maxMargen === totalAsesoria) lineaDominante = 'asesoria';
    }

    // Métricas agregadas adicionales
    const total_venta = registrosFiltrados.reduce((sum, r) => sum + r.venta_total_clp, 0);
    const total_venta_cafe = registrosFiltrados.reduce((sum, r) => sum + r.venta_cafe_clp, 0);
    const total_venta_hotdesk = registrosFiltrados.reduce((sum, r) => sum + r.venta_hotdesk_clp, 0);
    const total_venta_asesoria = registrosFiltrados.reduce((sum, r) => sum + r.venta_asesoria_clp, 0);
    const total_utilidad_neta = recuperado;
    const total_gastos_operacion = registrosFiltrados.reduce((sum, r) => sum + r.gastos_operacion_clp, 0);
    const revpsm_promedio = registrosFiltrados.length > 0
      ? registrosFiltrados.reduce((sum, r) => sum + r.revpsm_clp_m2, 0) / registrosFiltrados.length
      : 0;
    const roi_promedio = registrosFiltrados.length > 0
      ? registrosFiltrados.reduce((sum, r) => sum + r.roi, 0) / registrosFiltrados.length
      : 0;
    const roiMedio = mediaROI / 100;

    return {
      recuperado,
      porcentajeRecuperado,
      mediaROI,
      desviacion,
      totalRegistros: registrosFiltrados.length,
      genio,
      figura,
      paybackMeses,
      totalCafe,
      totalHotdesk,
      totalAsesoria,
      lineaDominante,
      total_venta,
      total_venta_cafe,
      total_venta_hotdesk,
      total_venta_asesoria,
      total_utilidad_neta,
      total_gastos_operacion,
      revpsm_promedio,
      roi_promedio,
      roiMedio
    };
  })();

  const cargarDatosDemo = () => {
    const demo = generarSimulacion12Meses();
    setRegistros(demo);
  };

  return (
    <DashboardContext.Provider value={{
      registros,
      setRegistros,
      registroActual,
      setRegistroActual,
      rangoTemporal,
      setRangoTemporal,
      searchTerm,
      setSearchTerm,
      cargarDatosDemo,
      registrosFiltrados,
      metricas
    }}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
}

// ============================================================================
// EXPORTAR TIPOS
// ============================================================================
export type { RegistroMensualTriple, DatoDiario };

// ============================================================================
// SIMULACIÓN DE DATOS
// ============================================================================

function generarSimulacion12Meses(): RegistroMensualTriple[] {
  const registros: RegistroMensualTriple[] = [];
  const fechaBase = new Date();
  fechaBase.setMonth(fechaBase.getMonth() - 11); // 12 meses atrás

  // Estacionalidad realista chilena
  const estacionalidad: { [key: number]: { factor: number; nota: string } } = {
    0: { factor: 1.2, nota: 'Verano - Temporada alta' }, // Enero
    1: { factor: 1.15, nota: 'Verano tardío' }, // Febrero
    2: { factor: 0.95, nota: 'Otoño - Inicio clases' }, // Marzo
    3: { factor: 0.85, nota: 'Otoño medio' }, // Abril
    4: { factor: 0.8, nota: 'Otoño - Pre invierno' }, // Mayo
    5: { factor: 0.75, nota: 'Invierno - Temporada baja' }, // Junio
    6: { factor: 0.8, nota: 'Invierno medio' }, // Julio
    7: { factor: 0.85, nota: 'Invierno tardío' }, // Agosto
    8: { factor: 1.4, nota: 'Fiestas Patrias 🎉' }, // Septiembre
    9: { factor: 1.0, nota: 'Primavera temprana' }, // Octubre
    10: { factor: 1.05, nota: 'Primavera tardía' }, // Noviembre
    11: { factor: 1.5, nota: 'Navidad 🎄 - Peak season' } // Diciembre
  };

  for (let i = 0; i < 12; i++) {
    const fecha = new Date(fechaBase);
    fecha.setMonth(fechaBase.getMonth() + i);
    const mes = fecha.getMonth();
    const id = `reg_${fecha.toISOString().split('T')[0]}`;
    const est = estacionalidad[mes];

    // LÍNEA 1: Café (base: $8M mensual) - Varía con estacionalidad
    const baseCafe = 8000000;
    const venta_cafe_clp = Math.floor(baseCafe * est.factor * (0.9 + Math.random() * 0.2));
    const cogs_cafe_clp = Math.floor(venta_cafe_clp * 0.32);
    const margen_cafe_clp = venta_cafe_clp - cogs_cafe_clp;
    const margen_cafe_percent = (margen_cafe_clp / venta_cafe_clp) * 100;

    // LÍNEA 2: Hotdesk (base: $3.2M mensual) - Menos afectado por estacionalidad
    const baseHotdesk = 3200000;
    const venta_hotdesk_clp = Math.floor(baseHotdesk * (0.95 + est.factor * 0.1) * (0.95 + Math.random() * 0.1));
    const cogs_hotdesk_clp = Math.floor(venta_hotdesk_clp * 0.075);
    const margen_hotdesk_clp = venta_hotdesk_clp - cogs_hotdesk_clp;
    const margen_hotdesk_percent = (margen_hotdesk_clp / venta_hotdesk_clp) * 100;

    // LÍNEA 3: Asesorías (base: $1.8M mensual) - Crece con el tiempo
    const baseAsesoria = 1800000;
    const factorCrecimiento = 1 + (i * 0.05); // 5% de crecimiento mensual
    const venta_asesoria_clp = Math.floor(baseAsesoria * factorCrecimiento * (0.8 + Math.random() * 0.4));
    const cogs_asesoria_clp = 0;
    const margen_asesoria_clp = venta_asesoria_clp;
    const margen_asesoria_percent = 100;

    // CONSOLIDADO
    const venta_total_clp = venta_cafe_clp + venta_hotdesk_clp + venta_asesoria_clp;
    const cogs_total_clp = cogs_cafe_clp + cogs_hotdesk_clp + cogs_asesoria_clp;
    const margen_bruto_clp = venta_total_clp - cogs_total_clp;
    const margen_bruto_percent = (margen_bruto_clp / venta_total_clp) * 100;

    // Gastos operación (relativamente fijos)
    const gastos_operacion_clp = Math.floor(5400000 * (0.98 + Math.random() * 0.04));
    const utilidad_neta_clp = margen_bruto_clp - gastos_operacion_clp;
    const margen_neto_percent = (utilidad_neta_clp / venta_total_clp) * 100;

    // KPIs
    const roi = utilidad_neta_clp / 37697000;
    
    // Calcular media y desviación de los registros anteriores
    const roi_mean_30d = registros.length > 0
      ? registros.slice(-Math.min(30, registros.length)).reduce((sum, r) => sum + r.roi, 0) / Math.min(30, registros.length)
      : 0;
    
    const roi_std_30d = registros.length >= 2
      ? (() => {
          const ultimos = registros.slice(-Math.min(30, registros.length));
          const media = ultimos.reduce((sum, r) => sum + r.roi, 0) / ultimos.length;
          const varianza = ultimos.reduce((sum, r) => sum + Math.pow(r.roi - media, 2), 0) / ultimos.length;
          return Math.sqrt(varianza);
        })()
      : 0;

    const revpsm_clp_m2 = venta_total_clp / 25;
    const payback_days = utilidad_neta_clp > 0 ? Math.ceil(18900000 / utilidad_neta_clp) : null;
    const status: 'Genio' | 'Figura' = utilidad_neta_clp > 150000 ? 'Genio' : 'Figura';

    // ALERTAS
    let alerta_canibalizacion = '';
    if (margen_asesoria_clp > margen_cafe_clp * 0.5) {
      alerta_canibalizacion = '⚠️ Asesorías generan más margen que café. Evaluar espacio reuniones.';
    }

    const linea_dominante: 'cafe' | 'hotdesk' | 'asesoria' = 
      margen_cafe_clp >= margen_hotdesk_clp && margen_cafe_clp >= margen_asesoria_clp
        ? 'cafe'
        : margen_hotdesk_clp >= margen_cafe_clp && margen_hotdesk_clp >= margen_asesoria_clp
          ? 'hotdesk'
          : 'asesoria';

    const nota = est.nota;
    const updated_at = new Date().toISOString();

    registros.push({
      id,
      date: fecha.toISOString().split('T')[0],
      venta_cafe_clp,
      cogs_cafe_clp,
      margen_cafe_clp,
      margen_cafe_percent,
      venta_hotdesk_clp,
      cogs_hotdesk_clp,
      margen_hotdesk_clp,
      margen_hotdesk_percent,
      venta_asesoria_clp,
      cogs_asesoria_clp,
      margen_asesoria_clp,
      margen_asesoria_percent,
      venta_total_clp,
      cogs_total_clp,
      margen_bruto_clp,
      margen_bruto_percent,
      gastos_operacion_clp,
      utilidad_neta_clp,
      margen_neto_percent,
      roi,
      roi_mean_30d,
      roi_std_30d,
      revpsm_clp_m2,
      payback_days,
      status,
      alerta_canibalizacion,
      linea_dominante,
      nota,
      updated_at
    });
  }

  // Ordenar por fecha descendente (más reciente primero)
  return registros.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}