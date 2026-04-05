import { createContext, useContext, useState } from 'react';

// Roles del negocio
export type RoleName = 'admin' | 'gerente' | 'barista1' | 'barista2';

// Línea de negocio asignada por rol
export type LineaNegocio = 'cafe' | 'hotdesk' | 'asesorias' | 'all';

// Permisos granulares
export type Permission =
  | 'view:financial_analysis'   // AnalisisCFO, GenioyFigura, simulador
  | 'view:payback_analysis'     // Payback, derecho de llaves, ROI total
  | 'view:all_alerts'           // Todas las alertas financieras
  | 'view:config_panel'         // Panel de configuración de negocio
  | 'edit:business_config'      // Editar CAPEX, COGS, umbrales
  | 'edit:business_data'        // Importar/editar registros
  | 'export:executive_pdf'      // PDF ejecutivo con datos financieros
  | 'export:operational_pdf'    // PDF operativo sin datos de inversión
  | 'view:operational_kpis'     // Vista Gerente: ocupación, ticket, RevPSM
  | 'view:own_line_metrics'     // Vista Barista: KPIs de su línea asignada
  | 'view:checklist';           // Checklist operativo de turno

export interface RoleProfile {
  role: RoleName;
  displayName: string;
  lineaResponsable: LineaNegocio;
  permissions: Permission[];
}

// Mapa canónico de permisos — fuente de verdad
export const ROLE_PERMISSIONS: Record<RoleName, RoleProfile> = {
  admin: {
    role: 'admin',
    displayName: 'CFO / Admin',
    lineaResponsable: 'all',
    permissions: [
      'view:financial_analysis', 'view:payback_analysis', 'view:all_alerts',
      'view:config_panel', 'edit:business_config', 'edit:business_data',
      'export:executive_pdf', 'view:operational_kpis', 'view:own_line_metrics'
    ]
  },
  gerente: {
    role: 'gerente',
    displayName: 'Gerente Operativo',
    lineaResponsable: 'all',
    permissions: [
      'view:operational_kpis', 'view:own_line_metrics',
      'export:operational_pdf', 'view:checklist'
    ]
  },
  barista1: {
    role: 'barista1',
    displayName: 'Barista 1',
    lineaResponsable: 'cafe',
    permissions: ['view:own_line_metrics', 'view:checklist']
  },
  barista2: {
    role: 'barista2',
    displayName: 'Barista 2',
    lineaResponsable: 'hotdesk',
    permissions: ['view:own_line_metrics', 'view:checklist']
  }
};

interface RoleContextType {
  role: RoleName;
  setRole: (role: RoleName) => void;
}

const RoleContext = createContext<RoleContextType>({
  role: 'admin',
  setRole: () => {}
});

const VALID_ROLES = Object.keys(ROLE_PERMISSIONS) as RoleName[];

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<RoleName>(() => {
    const saved = localStorage.getItem('dashfin_role');
    return saved && VALID_ROLES.includes(saved as RoleName) ? (saved as RoleName) : 'admin';
  });

  const handleSetRole = (newRole: RoleName) => {
    localStorage.setItem('dashfin_role', newRole);
    setRole(newRole);
  };

  return (
    <RoleContext.Provider value={{ role, setRole: handleSetRole }}>
      {children}
    </RoleContext.Provider>
  );
}

// Hook principal
export function useRole() {
  const ctx = useContext(RoleContext);
  return {
    role: ctx.role,
    setRole: ctx.setRole,
    profile: ROLE_PERMISSIONS[ctx.role],
    can: (permission: Permission) =>
      ROLE_PERMISSIONS[ctx.role].permissions.includes(permission),
    lineaResponsable: ROLE_PERMISSIONS[ctx.role].lineaResponsable
  };
}
