import { createContext, useContext, useState } from 'react';

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

// Valores por defecto (plantilla "híbrido" = Da Pleisë.)
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
  sync_interval_min: 30
};

interface BusinessConfigContextType {
  config: BusinessConfig;
  updateConfig: (partial: Partial<BusinessConfig>) => void;
  resetConfig: () => void;
}

const BusinessConfigContext = createContext<BusinessConfigContextType>({
  config: DEFAULT_CONFIG,
  updateConfig: () => {},
  resetConfig: () => {}
});

const STORAGE_KEY = 'dashfin_business_config';

export function BusinessConfigProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<BusinessConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return { ...DEFAULT_CONFIG, ...JSON.parse(saved) };
      }
    } catch {
      // fallback to defaults
    }
    return DEFAULT_CONFIG;
  });

  const updateConfig = (partial: Partial<BusinessConfig>) => {
    setConfig(prev => {
      const next = { ...prev, ...partial };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  const resetConfig = () => {
    localStorage.removeItem(STORAGE_KEY);
    setConfig(DEFAULT_CONFIG);
  };

  return (
    <BusinessConfigContext.Provider value={{ config, updateConfig, resetConfig }}>
      {children}
    </BusinessConfigContext.Provider>
  );
}

export function useBusinessConfig() {
  return useContext(BusinessConfigContext);
}
