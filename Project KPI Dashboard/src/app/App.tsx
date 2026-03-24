import { Toaster } from 'sonner';
import { DashboardProvider } from './contexts/DashboardContext';
import { RoleProvider, useRole, ROLE_PERMISSIONS, RoleName } from './contexts/RoleContext';
import { BusinessConfigProvider } from './contexts/BusinessConfigContext';
import { AIInsightsProvider } from './contexts/AIInsightsContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { DashboardAdmin } from './components/DashboardAdmin';
import { DashboardGerente } from './components/DashboardGerente';
import { DashboardBarista } from './components/DashboardBarista';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select';

const isDebug = new URLSearchParams(window.location.search).has('debug');

// Role switcher — visible solo en modo debug (?debug=true)
function RoleSwitcher() {
  const { role, setRole, profile } = useRole();
  if (!isDebug) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-card border rounded-lg shadow-lg p-2">
      <span className="text-xs text-muted-foreground">Rol:</span>
      <Select value={role} onValueChange={v => setRole(v as RoleName)}>
        <SelectTrigger className="h-7 text-xs w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {(Object.keys(ROLE_PERMISSIONS) as RoleName[]).map(r => (
            <SelectItem key={r} value={r} className="text-xs">
              {ROLE_PERMISSIONS[r].displayName}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function AppRoutes() {
  const { role } = useRole();

  return (
    <main id="main-content" role="main" aria-label="Dashboard Principal">
      <ErrorBoundary>
        {role === 'admin'    && <DashboardAdmin />}
        {role === 'gerente'  && <DashboardGerente />}
        {role === 'barista1' && <DashboardBarista linea="cafe" />}
        {role === 'barista2' && <DashboardBarista linea="hotdesk" />}
      </ErrorBoundary>
    </main>
  );
}

export default function App() {
  return (
    <RoleProvider>
      <BusinessConfigProvider>
        <DashboardProvider>
          <AIInsightsProvider>
            <Toaster
              position="top-right"
              richColors
              expand={false}
              duration={3000}
            />
            <RoleSwitcher />
            <AppRoutes />
          </AIInsightsProvider>
        </DashboardProvider>
      </BusinessConfigProvider>
    </RoleProvider>
  );
}
