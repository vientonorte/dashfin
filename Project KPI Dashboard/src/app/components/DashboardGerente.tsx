import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Activity, BarChart3, FileText, Coffee, Laptop, Briefcase } from 'lucide-react';
import { useDashboard } from '../contexts/DashboardContext';
import { SaludOperativa } from './SaludOperativa';
import { AlertasAutomaticas } from './AlertasAutomaticas';
import { TablaHistorial } from './TablaHistorial';
import { SyncIndicator } from './ui/SyncIndicator';
import { BusinessLineCard } from './ui/BusinessLineCard';
import { useBusinessConfig } from '../contexts/BusinessConfigContext';

export function DashboardGerente() {
  const { registros } = useDashboard();
  const { config } = useBusinessConfig();
  const ultimo = registros[0];

  const fmt = (n: number) =>
    new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(n);
  const fmtPct = (n: number) => `${n.toFixed(1)}%`;

  const totalVenta = ultimo
    ? ultimo.venta_cafe_clp + ultimo.venta_hotdesk_clp + ultimo.venta_asesoria_clp
    : 1;

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
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <BusinessLineCard
                icon={Coffee}
                label="Cafetería"
                value={ultimo.venta_cafe_clp}
                marginPercent={fmtPct(ultimo.margen_cafe_percent)}
                sharePercent={(ultimo.venta_cafe_clp / totalVenta) * 100}
                accentColor="orange"
                formatter={fmt}
              />
              <BusinessLineCard
                icon={Laptop}
                label="Hotdesk"
                value={ultimo.venta_hotdesk_clp}
                marginPercent={fmtPct(ultimo.margen_hotdesk_percent)}
                sharePercent={(ultimo.venta_hotdesk_clp / totalVenta) * 100}
                accentColor="blue"
                formatter={fmt}
              />
              <BusinessLineCard
                icon={Briefcase}
                label="Asesorías"
                value={ultimo.venta_asesoria_clp}
                marginPercent={fmtPct(ultimo.margen_asesoria_percent)}
                sharePercent={(ultimo.venta_asesoria_clp / totalVenta) * 100}
                accentColor="purple"
                formatter={fmt}
              />
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
