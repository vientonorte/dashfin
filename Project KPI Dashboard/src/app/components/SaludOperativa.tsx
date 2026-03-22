import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { useDashboard } from '../contexts/DashboardContext';
import { useBusinessConfig } from '../contexts/BusinessConfigContext';
import { Coffee, Wifi, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';

function formatChileno(n: number): string {
  return Math.round(n).toLocaleString('es-CL');
}

interface SaludItem {
  label: string;
  value: string;
  icon: React.ReactNode;
  status: 'verde' | 'amarillo' | 'rojo';
}

export function SaludOperativa() {
  const { registrosFiltrados, metricas } = useDashboard();
  const { config } = useBusinessConfig();

  const ultimo = registrosFiltrados[0];
  if (!ultimo) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Salud Operativa</CardTitle>
          <CardDescription>Sin datos disponibles</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const margenNeto = ultimo.margen_neto_percent;
  const revpsm = ultimo.revpsm_clp_m2;
  const ticketCafe = ultimo.venta_cafe_clp > 0 ? ultimo.venta_cafe_clp / 100 : 0; // Approx: assumes ~100 daily transactions
  const ventaTotal = ultimo.venta_total_clp;

  const items: SaludItem[] = [
    {
      label: 'Venta del día',
      value: `$${formatChileno(ventaTotal)}`,
      icon: <DollarSign className="h-5 w-5" />,
      status: ventaTotal > 0 ? 'verde' : 'rojo',
    },
    {
      label: 'Margen Neto',
      value: `${margenNeto.toFixed(1)}%`,
      icon: margenNeto >= config.umbral_margen_critico * 100
        ? <TrendingUp className="h-5 w-5" />
        : <TrendingDown className="h-5 w-5" />,
      status: margenNeto >= config.umbral_margen_critico * 100 ? 'verde'
        : margenNeto >= 20 ? 'amarillo' : 'rojo',
    },
    {
      label: 'RevPSM',
      value: `$${formatChileno(revpsm)}/m²`,
      icon: <Wifi className="h-5 w-5" />,
      status: revpsm >= 250_000 ? 'verde' : revpsm >= 120_000 ? 'amarillo' : 'rojo',
    },
    {
      label: 'Ticket Café',
      value: `$${formatChileno(ticketCafe)}`,
      icon: <Coffee className="h-5 w-5" />,
      status: ticketCafe >= 6_500 ? 'verde' : ticketCafe >= 4_000 ? 'amarillo' : 'rojo',
    },
  ];

  const colorMap = {
    verde: 'bg-emerald-100 text-emerald-700 border-emerald-300',
    amarillo: 'bg-amber-100 text-amber-700 border-amber-300',
    rojo: 'bg-red-100 text-red-700 border-red-300',
  };

  const dotMap = {
    verde: 'bg-emerald-500',
    amarillo: 'bg-amber-500',
    rojo: 'bg-red-500',
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">🚦 Salud Operativa</CardTitle>
        <CardDescription>Resumen rápido del negocio</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {items.map((item) => (
            <div
              key={item.label}
              className={`rounded-lg border p-3 ${colorMap[item.status]}`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className={`h-2 w-2 rounded-full ${dotMap[item.status]}`} />
                <span className="text-xs font-medium">{item.label}</span>
              </div>
              <div className="flex items-center gap-2">
                {item.icon}
                <span className="text-lg font-bold">{item.value}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
