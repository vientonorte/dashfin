import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { useDashboard } from '../contexts/DashboardContext';
import { useBusinessConfig } from '../contexts/BusinessConfigContext';
import { useRole } from '../contexts/RoleContext';
import { ChecklistBarista } from './ChecklistBarista';
import { Coffee, Wifi, TrendingUp, Target } from 'lucide-react';
import type { LineaNegocio } from '../contexts/RoleContext';

function formatChileno(n: number): string {
  return Math.round(n).toLocaleString('es-CL');
}

interface DashboardBaristaProps {
  linea: 'cafe' | 'hotdesk';
}

export function DashboardBarista({ linea }: DashboardBaristaProps) {
  const { registrosFiltrados } = useDashboard();
  const { config } = useBusinessConfig();
  const { profile } = useRole();

  const ultimo = registrosFiltrados[0];

  const isCafe = linea === 'cafe';
  const lineaLabel = isCafe ? 'Cafetería' : 'Hotdesk';
  const lineaIcon = isCafe
    ? <Coffee className="h-5 w-5 text-amber-600" />
    : <Wifi className="h-5 w-5 text-blue-600" />;
  const accentBg = isCafe ? 'from-amber-50 to-orange-50' : 'from-blue-50 to-cyan-50';
  const accentBorder = isCafe ? 'border-amber-200' : 'border-blue-200';
  const accentText = isCafe ? 'text-amber-700' : 'text-blue-700';

  const venta = ultimo
    ? isCafe ? ultimo.venta_cafe_clp : ultimo.venta_hotdesk_clp
    : 0;
  const margen = ultimo
    ? isCafe ? ultimo.margen_cafe_percent : ultimo.margen_hotdesk_percent
    : 0;

  return (
    <div className={`min-h-screen bg-gradient-to-br ${accentBg} p-4`}>
      <div className="max-w-md mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {lineaIcon}
            <div>
              <h1 className="text-xl font-bold text-slate-800">{lineaLabel}</h1>
              <p className="text-xs text-muted-foreground">{config.nombre_local}</p>
            </div>
          </div>
          <Badge variant="outline" className={`${accentText} ${accentBorder}`}>
            {profile.displayName}
          </Badge>
        </div>

        {/* KPI de la línea */}
        <Card className={`border ${accentBorder}`}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Métricas de hoy</CardTitle>
          </CardHeader>
          <CardContent>
            {ultimo ? (
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 rounded-lg bg-white border">
                  <p className="text-xs text-muted-foreground mb-1">Venta</p>
                  <p className={`text-lg font-bold ${accentText}`}>
                    ${formatChileno(venta)}
                  </p>
                </div>
                <div className="text-center p-3 rounded-lg bg-white border">
                  <p className="text-xs text-muted-foreground mb-1">Margen</p>
                  <p className={`text-lg font-bold ${accentText}`}>
                    {margen.toFixed(1)}%
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                Sin datos disponibles
              </p>
            )}
          </CardContent>
        </Card>

        {/* Checklist */}
        <ChecklistBarista linea={linea} />

        {/* Tip del día */}
        <Card className="border-emerald-200 bg-emerald-50">
          <CardContent className="py-3">
            <div className="flex items-start gap-2">
              <Target className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
              <p className="text-xs text-emerald-700">
                {isCafe
                  ? '☕ Recuerda ofrecer pastelería con cada café — mejora el ticket promedio.'
                  : '💻 Ofrece un café "Refill" a los coworkers — aumenta la conversión cruzada.'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
