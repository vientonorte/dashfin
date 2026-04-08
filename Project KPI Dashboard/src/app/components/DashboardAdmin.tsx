import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Bell, Settings, LayoutDashboard, Brain, CreditCard } from 'lucide-react';
import { CFODashboardConsolidado } from './CFODashboardConsolidado';
import { AlertasAutomaticas } from './AlertasAutomaticas';
import { PanelConfig } from './PanelConfig';
import { AICommandCenter } from './AICommandCenter';
import { EstadosCuenta } from './EstadosCuenta';
import { SyncIndicator } from './ui/SyncIndicator';
import { useBusinessConfig } from '../contexts/BusinessConfigContext';
import { useDashboard } from '../contexts/DashboardContext';

export function DashboardAdmin() {
  const { config } = useBusinessConfig();
  const { setSearchTerm, setRangoTemporal } = useDashboard();

  const handleTabChange = () => {
    setSearchTerm('');
    setRangoTemporal('H');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">{config.nombre_local}</h1>
            <p className="text-sm text-muted-foreground">CFO / Admin · Dashboard Ejecutivo</p>
          </div>
          <SyncIndicator />
        </div>
      </header>

      {/* Tabs del Admin */}
      <Tabs defaultValue="ai" className="w-full" onValueChange={handleTabChange}>
        <div className="border-b bg-card px-6">
          <TabsList className="h-10 bg-transparent border-0 rounded-none gap-0">
            <TabsTrigger
              value="ai"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4"
            >
              <Brain className="h-3.5 w-3.5 mr-1.5" />
              Inteligencia
            </TabsTrigger>
            <TabsTrigger
              value="resumen"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4"
            >
              <LayoutDashboard className="h-3.5 w-3.5 mr-1.5" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger
              value="alertas"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4"
            >
              <Bell className="h-3.5 w-3.5 mr-1.5" />
              Alertas
            </TabsTrigger>
            <TabsTrigger
              value="config"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4"
            >
              <Settings className="h-3.5 w-3.5 mr-1.5" />
              Configuración
            </TabsTrigger>
            <TabsTrigger
              value="estados"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4"
            >
              <CreditCard className="h-3.5 w-3.5 mr-1.5" />
              Estados de Cuenta
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="ai" className="p-0 mt-0">
          <AICommandCenter />
        </TabsContent>
        <TabsContent value="resumen" className="p-0 mt-0">
          <CFODashboardConsolidado />
        </TabsContent>
        <TabsContent value="alertas" className="p-6">
          <AlertasAutomaticas />
        </TabsContent>
        <TabsContent value="config" className="p-6">
          <PanelConfig />
        </TabsContent>
        <TabsContent value="estados" className="p-0 mt-0">
          <EstadosCuenta />
        </TabsContent>
      </Tabs>
    </div>
  );
}
