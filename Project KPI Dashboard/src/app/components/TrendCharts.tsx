import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import {
  AreaChart, Area,
  LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { TrendingUp } from 'lucide-react';
import { useDashboard } from '../contexts/DashboardContext';

// ─── helpers ───────────────────────────────────────────────────────────────

function fmtMes(dateStr: string) {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('es-CL', { month: 'short', year: '2-digit' });
}

function fmtCLP(value: number) {
  return new Intl.NumberFormat('es-CL', { maximumFractionDigits: 0 }).format(value);
}

const COLORS = {
  cafe:     '#f97316',
  hotdesk:  '#3b82f6',
  asesoria: '#a855f7',
  neto:     '#10b981',
  roi:      '#f59e0b',
};

// ─── component ─────────────────────────────────────────────────────────────

export function TrendCharts() {
  const { registrosFiltrados } = useDashboard();

  const areaData = useMemo(
    () =>
      [...registrosFiltrados]
        .sort((a, b) => a.date.localeCompare(b.date))
        .map(r => ({
          mes:      fmtMes(r.date),
          cafe:     r.venta_cafe_clp,
          hotdesk:  r.venta_hotdesk_clp,
          asesoria: r.venta_asesoria_clp,
        })),
    [registrosFiltrados],
  );

  const lineData = useMemo(
    () =>
      [...registrosFiltrados]
        .sort((a, b) => a.date.localeCompare(b.date))
        .map(r => ({
          mes:          fmtMes(r.date),
          margenNeto:   Number(r.margen_neto_percent.toFixed(1)),
          margenBruto:  Number(r.margen_bruto_percent.toFixed(1)),
          roi:          Number((r.roi * 100).toFixed(2)),
        })),
    [registrosFiltrados],
  );

  if (registrosFiltrados.length < 2) {
    return (
      <Card className="border-dashed border-2 border-gray-200">
        <CardContent className="py-10 text-center text-sm text-muted-foreground">
          Carga al menos 2 meses de datos para ver las tendencias.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      {/* ── Ingresos por línea ───────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-blue-500" />
            Ingresos por línea
          </CardTitle>
          <CardDescription>Café · Hotdesk · Asesorías — evolución mensual</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={areaData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="gradCafe" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={COLORS.cafe}    stopOpacity={0.35} />
                  <stop offset="95%" stopColor={COLORS.cafe}    stopOpacity={0.04} />
                </linearGradient>
                <linearGradient id="gradHotdesk" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={COLORS.hotdesk} stopOpacity={0.35} />
                  <stop offset="95%" stopColor={COLORS.hotdesk} stopOpacity={0.04} />
                </linearGradient>
                <linearGradient id="gradAsesoria" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={COLORS.asesoria} stopOpacity={0.35} />
                  <stop offset="95%" stopColor={COLORS.asesoria} stopOpacity={0.04} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="opacity-40" />
              <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
              <YAxis
                tick={{ fontSize: 11 }}
                tickFormatter={(v: number) => `$${fmtCLP(v)}`}
                width={72}
              />
              <Tooltip
                formatter={(value: number, name: string) => [
                  `$${fmtCLP(value)}`,
                  name === 'cafe' ? 'Cafetería' : name === 'hotdesk' ? 'Hotdesk' : 'Asesorías',
                ]}
                contentStyle={{ fontSize: 12 }}
              />
              <Legend
                formatter={(v: string) =>
                  v === 'cafe' ? 'Cafetería' : v === 'hotdesk' ? 'Hotdesk' : 'Asesorías'
                }
                wrapperStyle={{ fontSize: 12 }}
              />
              <Area type="monotone" dataKey="cafe"     stroke={COLORS.cafe}    fill="url(#gradCafe)"     strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
              <Area type="monotone" dataKey="hotdesk"  stroke={COLORS.hotdesk} fill="url(#gradHotdesk)"  strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
              <Area type="monotone" dataKey="asesoria" stroke={COLORS.asesoria} fill="url(#gradAsesoria)" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* ── Márgenes y ROI ───────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-emerald-500" />
            Márgenes y ROI
          </CardTitle>
          <CardDescription>Margen neto % · Margen bruto % · ROI % mensual</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={lineData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-40" />
              <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
              <YAxis
                tick={{ fontSize: 11 }}
                tickFormatter={(v: number) => `${v}%`}
                width={48}
              />
              <Tooltip
                formatter={(value: number, name: string) => [
                  `${value}%`,
                  name === 'margenNeto' ? 'Margen Neto' : name === 'margenBruto' ? 'Margen Bruto' : 'ROI',
                ]}
                contentStyle={{ fontSize: 12 }}
              />
              <Legend
                formatter={(v: string) =>
                  v === 'margenNeto' ? 'Margen Neto' : v === 'margenBruto' ? 'Margen Bruto' : 'ROI'
                }
                wrapperStyle={{ fontSize: 12 }}
              />
              {/* Umbral visual: margen neto saludable ≥ 30 % */}
              <ReferenceLine y={30} stroke="#6b7280" strokeDasharray="4 4" label={{ value: 'meta 30%', fontSize: 10, fill: '#6b7280' }} />
              <Line type="monotone" dataKey="margenBruto" stroke={COLORS.cafe}    strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
              <Line type="monotone" dataKey="margenNeto"  stroke={COLORS.neto}    strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
              <Line type="monotone" dataKey="roi"         stroke={COLORS.roi}     strokeWidth={2} dot={false} activeDot={{ r: 4 }} strokeDasharray="5 3" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
