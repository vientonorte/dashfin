// ============================================================================
// PRIVACY CONTEXT — Gestión de configuración de privacidad.
// ============================================================================

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { PrivacySettings } from '../types/transactions';
import { DEFAULT_PRIVACY_SETTINGS } from '../types/transactions';

const STORAGE_KEY = 'dashfin_privacy_settings';

interface PrivacyContextValue {
  settings: PrivacySettings;
  updateSettings: (partial: Partial<PrivacySettings>) => void;
  resetSettings: () => void;
}

const PrivacyContext = createContext<PrivacyContextValue | null>(null);

export function PrivacyProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<PrivacySettings>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return { ...DEFAULT_PRIVACY_SETTINGS, ...JSON.parse(stored) };
    } catch { /* ignore */ }
    return DEFAULT_PRIVACY_SETTINGS;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  function updateSettings(partial: Partial<PrivacySettings>) {
    setSettings(prev => ({ ...prev, ...partial }));
  }

  function resetSettings() {
    setSettings(DEFAULT_PRIVACY_SETTINGS);
    localStorage.removeItem(STORAGE_KEY);
  }

  return (
    <PrivacyContext.Provider value={{ settings, updateSettings, resetSettings }}>
      {children}
    </PrivacyContext.Provider>
  );
}

export function usePrivacy() {
  const ctx = useContext(PrivacyContext);
  if (!ctx) throw new Error('usePrivacy must be used inside PrivacyProvider');
  return ctx;
}
