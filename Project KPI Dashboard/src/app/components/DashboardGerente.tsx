import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { useDashboard } from '../contexts/DashboardContext';
import { useBusinessConfig } from '../contexts/BusinessConfigContext';
import { SaludOperativa } from './SaludOperativa';
import { AlertasAutomaticas } from './AlertasAutomaticas';
import { Coffee, Wifi, Briefcase, BarChart3, TrendingUp } from 'lucide-react';

function formatChileno(n: number): string {
  return Math.round(n).toLocaleString('es-CL');
}

export function DashboardGerente() {
  const { registrosFiltrados, metricas } = useDashboard();
  const { config } = useBusinessConfig();

  const ultimo = registrosFiltrados[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              📊 Panel Operativo
            </h1>
            <p className="text-sm text-muted-foreground">
              {config.nombre_local} · Vista Gerente
            </p>
          </div>
          <Badge variant="outline" className="text-blue-700 border-blue-300">
            Gerente
          </Badge>
        </div>

        {/* Semáforo de salud */}
        <SaludOperativa />

        {/* Ventas por línea (sin datos de inversión) */}
        {ultimo && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Ventas por Línea
              </CardTitle>
              <CardDescription>Período actual</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-amber-50 border border-amber-200">
                  <div className="flex items-center gap-3">
                    <Coffee className="h-5 w-5 text-amber-700" />
                    <div>
                      <p className="font-medium text-sm">Cafetería</p>
                      <p className="text-xs text-muted-foreground">
                        Margen: {ultimo.margen_cafe_percent.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                  <span className="font-bold text-amber-800">
                    ${formatChileno(ultimo.venta_cafe_clp)}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50 border border-blue-200">
                  <div className="flex items-center gap-3">
                    <Wifi className="h-5 w-5 text-blue-700" />
                    <div>
                      <p className="font-medium text-sm">Hotdesk</p>
                      <p className="text-xs text-muted-foreground">
                        Margen: {ultimo.margen_hotdesk_percent.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                  <span className="font-bold text-blue-800">
                    ${formatChileno(ultimo.venta_hotdesk_clp)}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-purple-50 border border-purple-200">
                  <div className="flex items-center gap-3">
                    <Briefcase className="h-5 w-5 text-purple-700" />
                    <div>
                      <p className="font-medium text-sm">Asesorías</p>
                      <p className="text-xs text-muted-foreground">
                        Margen: {ultimo.margen_asesoria_percent.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                  <span className="font-bold text-purple-800">
                    ${formatChileno(ultimo.venta_asesoria_clp)}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-100 border border-slate-300 mt-2">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-5 w-5 text-slate-700" />
                    <span className="font-medium text-sm">Total</span>
                  </div>
                  <span className="font-bold text-slate-800">
                    ${formatChileno(ultimo.venta_total_clp)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Alertas operativas */}
        <AlertasAutomaticas />
      </div>
    </div>
  );
}
