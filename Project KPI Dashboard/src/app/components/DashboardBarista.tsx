import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Coffee, Wifi, TrendingUp, AlertTriangle } from 'lucide-react';
import { useDashboard } from '../contexts/DashboardContext';
import { LineaNegocio } from '../contexts/RoleContext';
import { ChecklistBarista } from './ChecklistBarista';
import { SyncIndicator } from './ui/SyncIndicator';

interface DashboardBaristaProps {
  linea: 'cafe' | 'hotdesk';
}

export function DashboardBarista({ linea }: DashboardBaristaProps) {
  const { registros } = useDashboard();
  const ultimo = registros[0];

  const fmt = (n: number) =>
    new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(n);

  const lineaLabel = linea === 'cafe' ? 'Cafetería' : 'Hotdesk';
  const LineaIcon = linea === 'cafe' ? Coffee : Wifi;

  const ventaLinea = ultimo
    ? (linea === 'cafe' ? ultimo.venta_cafe_clp : ultimo.venta_hotdesk_clp)
    : 0;

  const metaLinea = registros.length > 1
    ? registros.slice(0, 3).reduce((sum, r) =>
        sum + (linea === 'cafe' ? r.venta_cafe_clp : r.venta_hotdesk_clp), 0
      ) / Math.min(3, registros.length)
    : 0;

  const pctVsMeta = metaLinea > 0 ? (ventaLinea / metaLinea) * 100 : 0;
  const okVsMeta = pctVsMeta >= 80;

  // Alertas simples para el barista (máx 3, lenguaje simple)
  const alertas: string[] = [];
  if (ultimo) {
    if (linea === 'cafe') {
      const ticketEst = ultimo.venta_cafe_clp > 0 ? ultimo.venta_cafe_clp / 100 : 0;
      if (ticketEst < 5000) alertas.push('Ticket promedio bajo — recuerda ofrecer complementos');
      if (ultimo.venta_cafe_clp < metaLinea * 0.8) alertas.push('Venta de café por debajo de lo esperado hoy');
    } else {
      if (ultimo.venta_hotdesk_clp === 0) alertas.push('Sin ventas de Hotdesk registradas hoy');
    }
    if (alertas.length < 3 && ultimo.margen_neto_percent < 20) {
      alertas.push('Margen del día bajo — revisa gastos de turno');
    }
  }

  return (
    <div className="min-h-screen bg-background p-4 max-w-sm mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold flex items-center gap-2">
            <LineaIcon className="h-5 w-5" />
            {lineaLabel}
          </h1>
          <p className="text-xs text-muted-foreground">Vista de turno</p>
        </div>
        <SyncIndicator />
      </div>

      {/* KPI Principal */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground">Venta del día</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{fmt(ventaLinea)}</p>
          <div className="flex items-center gap-2 mt-2">
            <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />
            <Badge variant={okVsMeta ? 'default' : 'destructive'} className="text-xs">
              {pctVsMeta.toFixed(0)}% de meta
            </Badge>
            <span className="text-xs text-muted-foreground">Meta: {fmt(metaLinea)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Alertas del turno */}
      {alertas.length > 0 && (
        <div className="space-y-2">
          {alertas.map((alerta, i) => (
            <Alert key={i} className="border-amber-200 bg-amber-50">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800 text-sm">{alerta}</AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Checklist */}
      <ChecklistBarista linea={linea as LineaNegocio} />
    </div>
  );
}
