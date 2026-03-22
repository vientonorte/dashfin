import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Coffee, Wifi, Users, TrendingUp } from 'lucide-react';
import { useDashboard } from '../contexts/DashboardContext';
import { useBusinessConfig } from '../contexts/BusinessConfigContext';

type Semaforo = 'verde' | 'amarillo' | 'rojo';

function getSemaforo(value: number, umbralOk: number, umbralWarn: number): Semaforo {
  if (value >= umbralOk) return 'verde';
  if (value >= umbralWarn) return 'amarillo';
  return 'rojo';
}

const SEMAFORO_COLORS: Record<Semaforo, string> = {
  verde: 'bg-emerald-500',
  amarillo: 'bg-amber-400',
  rojo: 'bg-red-500'
};

const SEMAFORO_BADGE: Record<Semaforo, 'default' | 'secondary' | 'destructive'> = {
  verde: 'default',
  amarillo: 'secondary',
  rojo: 'destructive'
};

interface KPICardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  meta: string;
  semaforo: Semaforo;
}

function KPICard({ icon, label, value, meta, semaforo }: KPICardProps) {
  return (
    <Card>
      <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
        <div className={`h-2.5 w-2.5 rounded-full ${SEMAFORO_COLORS[semaforo]}`} />
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">{icon}</span>
          <span className="text-2xl font-bold">{value}</span>
        </div>
        <Badge variant={SEMAFORO_BADGE[semaforo]} className="mt-2 text-xs">
          Meta: {meta}
        </Badge>
      </CardContent>
    </Card>
  );
}

export function SaludOperativa() {
  const { registros, metricas } = useDashboard();
  const { config } = useBusinessConfig();
  const ultimo = registros[0];

  if (!ultimo) {
    return (
      <Card>
        <CardContent className="pt-6 text-center text-muted-foreground">
          Sin datos disponibles
        </CardContent>
      </Card>
    );
  }

  const ventaTotal = ultimo.venta_total_clp;
  const revpsm = ultimo.revpsm_clp_m2;
  const margenNeto = ultimo.margen_neto_percent;
  const ticketCafe = ultimo.venta_cafe_clp > 0 ? ultimo.venta_cafe_clp / 100 : 0; // aproximado

  const fmt = (n: number) =>
    new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(n);
  const fmtPct = (n: number) => `${n.toFixed(1)}%`;

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      <KPICard
        icon={<TrendingUp className="h-4 w-4" />}
        label="Venta Total"
        value={fmt(ventaTotal)}
        meta={fmt(metricas.total_venta / Math.max(registros.length, 1))}
        semaforo={getSemaforo(ventaTotal, metricas.total_venta / Math.max(registros.length, 1) * 0.9, metricas.total_venta / Math.max(registros.length, 1) * 0.7)}
      />
      <KPICard
        icon={<Wifi className="h-4 w-4" />}
        label="RevPSM"
        value={fmt(revpsm)}
        meta={fmt(metricas.revpsm_promedio)}
        semaforo={getSemaforo(revpsm, metricas.revpsm_promedio * 0.9, metricas.revpsm_promedio * 0.7)}
      />
      <KPICard
        icon={<Users className="h-4 w-4" />}
        label="Margen Neto"
        value={fmtPct(margenNeto)}
        meta={fmtPct(config.umbral_margen_critico * 100)}
        semaforo={getSemaforo(margenNeto, config.umbral_margen_critico * 100, config.umbral_margen_critico * 60)}
      />
      <KPICard
        icon={<Coffee className="h-4 w-4" />}
        label="Ticket Café (est.)"
        value={fmt(ticketCafe)}
        meta="$5.000"
        semaforo={getSemaforo(ticketCafe, 5000, 3000)}
      />
    </div>
  );
}
