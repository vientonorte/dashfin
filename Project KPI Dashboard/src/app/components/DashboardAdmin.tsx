import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Bell, Settings, LayoutDashboard } from 'lucide-react';
import { CFODashboardConsolidado } from './CFODashboardConsolidado';
import { AlertasAutomaticas } from './AlertasAutomaticas';
import { PanelConfig } from './PanelConfig';
import { SyncIndicator } from './ui/SyncIndicator';
import { useBusinessConfig } from '../contexts/BusinessConfigContext';

export function DashboardAdmin() {
  const { config } = useBusinessConfig();

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
      <Tabs defaultValue="resumen" className="w-full">
        <div className="border-b bg-card px-6">
          <TabsList className="h-10 bg-transparent border-0 rounded-none gap-0">
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
          </TabsList>
        </div>

        <TabsContent value="resumen" className="p-0 mt-0">
          <CFODashboardConsolidado />
        </TabsContent>
        <TabsContent value="alertas" className="p-6">
          <AlertasAutomaticas />
        </TabsContent>
        <TabsContent value="config" className="p-6">
          <PanelConfig />
        </TabsContent>
      </Tabs>
    </div>
  );
}
