import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Activity, BarChart3, FileText } from 'lucide-react';
import { useDashboard } from '../contexts/DashboardContext';
import { SaludOperativa } from './SaludOperativa';
import { AlertasAutomaticas } from './AlertasAutomaticas';
import { TablaHistorial } from './TablaHistorial';
import { SyncIndicator } from './ui/SyncIndicator';
import { useBusinessConfig } from '../contexts/BusinessConfigContext';

export function DashboardGerente() {
  const { registros, metricas } = useDashboard();
  const { config } = useBusinessConfig();
  const ultimo = registros[0];

  const fmt = (n: number) =>
    new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(n);
  const fmtPct = (n: number) => `${n.toFixed(1)}%`;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">{config.nombre_local}</h1>
            <p className="text-sm text-muted-foreground">Vista Gerente Operativo</p>
          </div>
          <SyncIndicator />
        </div>
      </header>

      <main className="p-6 space-y-6">
        {/* Semáforo de salud operativa */}
        <section>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Salud Operativa
          </h2>
          <SaludOperativa />
        </section>

        {/* Ventas del día por línea (sin datos de inversión) */}
        {ultimo && (
          <section>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Ventas por Línea — {new Date(ultimo.date).toLocaleDateString('es-CL', { month: 'long', year: 'numeric' })}
            </h2>
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Cafetería', venta: ultimo.venta_cafe_clp, margen: ultimo.margen_cafe_percent },
                { label: 'Hotdesk', venta: ultimo.venta_hotdesk_clp, margen: ultimo.margen_hotdesk_percent },
                { label: 'Asesorías', venta: ultimo.venta_asesoria_clp, margen: ultimo.margen_asesoria_percent },
              ].map(({ label, venta, margen }) => (
                <Card key={label}>
                  <CardHeader className="pb-1">
                    <CardTitle className="text-xs text-muted-foreground">{label}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xl font-bold">{fmt(venta)}</p>
                    <Badge
                      variant={margen >= 30 ? 'default' : 'destructive'}
                      className="mt-1 text-xs"
                    >
                      {fmtPct(margen)} margen
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Tabs: Alertas + Historial */}
        <Tabs defaultValue="alertas">
          <TabsList>
            <TabsTrigger value="alertas">Alertas operativas</TabsTrigger>
            <TabsTrigger value="historial">
              <FileText className="h-3.5 w-3.5 mr-1" />
              Historial
            </TabsTrigger>
          </TabsList>
          <TabsContent value="alertas" className="mt-4">
            <AlertasAutomaticas />
          </TabsContent>
          <TabsContent value="historial" className="mt-4">
            <TablaHistorial />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
