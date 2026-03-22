import { createContext, useContext, useState, ReactNode } from 'react';

// ============================================================================
// TIPOS — Roles y Permisos
// ============================================================================

export type RoleName = 'admin' | 'gerente' | 'barista1' | 'barista2';

export type LineaNegocio = 'cafe' | 'hotdesk' | 'asesorias' | 'all';

export type Permission =
  | 'view:financial_analysis'
  | 'view:payback_analysis'
  | 'view:all_alerts'
  | 'view:config_panel'
  | 'edit:business_config'
  | 'edit:business_data'
  | 'export:executive_pdf'
  | 'export:operational_pdf'
  | 'view:operational_kpis'
  | 'view:own_line_metrics'
  | 'view:checklist';

export interface RoleProfile {
  role: RoleName;
  displayName: string;
  lineaResponsable: LineaNegocio;
  permissions: Permission[];
}

// ============================================================================
// MAPA CANÓNICO DE PERMISOS — Fuente de verdad
// ============================================================================

export const ROLE_PERMISSIONS: Record<RoleName, RoleProfile> = {
  admin: {
    role: 'admin',
    displayName: 'CFO / Admin',
    lineaResponsable: 'all',
    permissions: [
      'view:financial_analysis',
      'view:payback_analysis',
      'view:all_alerts',
      'view:config_panel',
      'edit:business_config',
      'edit:business_data',
      'export:executive_pdf',
      'view:operational_kpis',
      'view:own_line_metrics',
    ],
  },
  gerente: {
    role: 'gerente',
    displayName: 'Gerente Operativo',
    lineaResponsable: 'all',
    permissions: [
      'view:operational_kpis',
      'view:own_line_metrics',
      'export:operational_pdf',
      'view:checklist',
    ],
  },
  barista1: {
    role: 'barista1',
    displayName: 'Barista 1',
    lineaResponsable: 'cafe',
    permissions: ['view:own_line_metrics', 'view:checklist'],
  },
  barista2: {
    role: 'barista2',
    displayName: 'Barista 2',
    lineaResponsable: 'hotdesk',
    permissions: ['view:own_line_metrics', 'view:checklist'],
  },
};

// ============================================================================
// CONTEXT
// ============================================================================

interface RoleContextType {
  role: RoleName;
  setRole: (role: RoleName) => void;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

const ROLE_STORAGE_KEY = 'dashfin_role';

function loadRoleFromStorage(): RoleName {
  try {
    const stored = localStorage.getItem(ROLE_STORAGE_KEY);
    if (stored && stored in ROLE_PERMISSIONS) {
      return stored as RoleName;
    }
  } catch {
    // ignore
  }
  return 'admin';
}

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<RoleName>(loadRoleFromStorage);

  const setRole = (newRole: RoleName) => {
    setRoleState(newRole);
    try {
      localStorage.setItem(ROLE_STORAGE_KEY, newRole);
    } catch {
      // ignore
    }
  };

  return (
    <RoleContext.Provider value={{ role, setRole }}>
      {children}
    </RoleContext.Provider>
  );
}

// ============================================================================
// HOOK PRINCIPAL
// ============================================================================

export function useRole() {
  const ctx = useContext(RoleContext);
  if (!ctx) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return {
    role: ctx.role,
    setRole: ctx.setRole,
    profile: ROLE_PERMISSIONS[ctx.role],
    can: (permission: Permission) =>
      ROLE_PERMISSIONS[ctx.role].permissions.includes(permission),
    lineaResponsable: ROLE_PERMISSIONS[ctx.role].lineaResponsable,
  };
}
