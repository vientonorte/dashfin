import { createContext, useContext, useState, ReactNode } from 'react';

// ============================================================================
// TIPOS — Configuración de Negocio
// ============================================================================

export interface BusinessConfig {
  // Identidad del negocio
  nombre_local: string;
  metros_cuadrados: number;

  // Inversión
  capex_total: number;
  derecho_llaves: number;

  // COGS por línea (porcentaje decimal)
  cogs_cafe_pct: number;
  cogs_hotdesk_pct: number;
  cogs_asesorias_pct: number;

  // Umbrales de alerta
  umbral_genio: number;
  umbral_margen_critico: number;
  umbral_ocupacion_minima: number;

  // Moneda y formato
  moneda: 'CLP';
  plantilla_base: 'cafe' | 'cowork' | 'hibrido' | 'custom';

  // Sincronización
  sheets_id: string;
  sheets_tab: string;
  sync_interval_min: number;
}

// ============================================================================
// VALORES POR DEFECTO — Plantilla "híbrido" = Da Pleisë.
// ============================================================================

export const DEFAULT_CONFIG: BusinessConfig = {
  nombre_local: 'Da Pleisë.',
  metros_cuadrados: 25,
  capex_total: 37_697_000,
  derecho_llaves: 18_900_000,
  cogs_cafe_pct: 0.32,
  cogs_hotdesk_pct: 0.075,
  cogs_asesorias_pct: 0,
  umbral_genio: 150_000,
  umbral_margen_critico: 0.30,
  umbral_ocupacion_minima: 0.50,
  moneda: 'CLP',
  plantilla_base: 'hibrido',
  sheets_id: '1ZA6bh8Ztgjh2Da4IpciHwgMiXZ9rNPFfGQZi1Vpb9ro',
  sheets_tab: 'Hoja1',
  sync_interval_min: 30,
};

// ============================================================================
// CONTEXT
// ============================================================================

interface BusinessConfigContextType {
  config: BusinessConfig;
  updateConfig: (partial: Partial<BusinessConfig>) => void;
  resetConfig: () => void;
}

const BusinessConfigContext = createContext<BusinessConfigContextType | undefined>(undefined);

const CONFIG_STORAGE_KEY = 'dashfin_business_config';

function loadConfigFromStorage(): BusinessConfig {
  try {
    const raw = localStorage.getItem(CONFIG_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_CONFIG, ...parsed };
    }
  } catch {
    // ignore
  }
  return DEFAULT_CONFIG;
}

function saveConfigToStorage(config: BusinessConfig): void {
  try {
    localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config));
  } catch {
    // ignore
  }
}

export function BusinessConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<BusinessConfig>(loadConfigFromStorage);

  const updateConfig = (partial: Partial<BusinessConfig>) => {
    setConfig((prev) => {
      const next = { ...prev, ...partial };
      saveConfigToStorage(next);
      return next;
    });
  };

  const resetConfig = () => {
    setConfig(DEFAULT_CONFIG);
    saveConfigToStorage(DEFAULT_CONFIG);
  };

  return (
    <BusinessConfigContext.Provider value={{ config, updateConfig, resetConfig }}>
      {children}
    </BusinessConfigContext.Provider>
  );
}

// ============================================================================
// HOOK PRINCIPAL
// ============================================================================

export function useBusinessConfig() {
  const ctx = useContext(BusinessConfigContext);
  if (!ctx) {
    throw new Error('useBusinessConfig must be used within a BusinessConfigProvider');
  }
  return ctx;
}
