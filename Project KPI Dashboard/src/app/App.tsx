import { CFODashboardConsolidado } from './components/CFODashboardConsolidado';
import { DashboardProvider } from './contexts/DashboardContext';
import { RoleProvider, useRole, ROLE_PERMISSIONS } from './contexts/RoleContext';
import type { RoleName } from './contexts/RoleContext';
import { BusinessConfigProvider } from './contexts/BusinessConfigContext';
import { Toaster } from 'sonner';
import { ErrorBoundary } from './components/ErrorBoundary';
import { DashboardGerente } from './components/DashboardGerente';
import { DashboardBarista } from './components/DashboardBarista';
import { Button } from './components/ui/button';
import { Users } from 'lucide-react';

// ============================================================================
// ROLE SELECTOR (floating, always visible)
// ============================================================================

function RoleSelector() {
  const { role, setRole } = useRole();
  const roles = Object.values(ROLE_PERMISSIONS);

  return (
    <div className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border px-3 py-2">
      <Users className="h-4 w-4 text-muted-foreground" />
      <select
        value={role}
        onChange={(e) => setRole(e.target.value as RoleName)}
        className="text-xs font-medium bg-transparent border-none outline-none cursor-pointer pr-2"
        aria-label="Seleccionar rol"
      >
        {roles.map((r) => (
          <option key={r.role} value={r.role}>
            {r.displayName}
          </option>
        ))}
      </select>
    </div>
  );
}

// ============================================================================
// DASHBOARD VIEW BY ROLE
// ============================================================================

function DashboardByRole() {
  const { role } = useRole();

  switch (role) {
    case 'admin':
      return <CFODashboardConsolidado />;
    case 'gerente':
      return <DashboardGerente />;
    case 'barista1':
      return <DashboardBarista linea="cafe" />;
    case 'barista2':
      return <DashboardBarista linea="hotdesk" />;
    default:
      return <CFODashboardConsolidado />;
  }
}

// ============================================================================
// APP ROOT
// ============================================================================

export default function App() {
  return (
    <RoleProvider>
      <BusinessConfigProvider>
        <DashboardProvider>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:top-0 focus:left-0 focus:z-[9999] focus:bg-green-600 focus:text-white focus:px-4 focus:py-2 focus:text-sm"
          >
            Saltar al contenido principal
          </a>
          <Toaster
            position="top-right"
            richColors
            expand={false}
            duration={3000}
          />
          <RoleSelector />
          <main id="main-content" role="main" aria-label="Dashboard Principal">
            <ErrorBoundary>
              <DashboardByRole />
            </ErrorBoundary>
          </main>
        </DashboardProvider>
      </BusinessConfigProvider>
    </RoleProvider>
  );
}