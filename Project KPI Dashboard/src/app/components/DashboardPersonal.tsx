// ============================================================================
// DASHBOARD PERSONAL — Gráficos de ingresos/egresos y saldo interactivo.
// ============================================================================

import { useMemo, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import { TrendingUp, TrendingDown, Wallet, BarChart2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useTransactions } from '../contexts/TransactionContext';

const COLORS = [
  '#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#3b82f6',
  '#a855f7', '#14b8a6', '#f97316', '#84cc16', '#ec4899',
  '#64748b', '#0ea5e9',
];

function formatCLP(n: number): string {
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(n);
}

function getMonth(date: string): string {
  return date.slice(0, 7); // YYYY-MM
}

export function DashboardPersonal() {
  const { transactions, isLoading } = useTransactions();
  const [period, setPeriod] = useState<'3m' | '6m' | '12m' | 'all'>('6m');

  const filtered = useMemo(() => {
    if (period === 'all') return transactions;
    const months = period === '3m' ? 3 : period === '6m' ? 6 : 12;
    const cutoff = new Date();
    cutoff.setMonth(cutoff.getMonth() - months);
    const cutoffStr = cutoff.toISOString().slice(0, 10);
    return transactions.filter(t => t.date >= cutoffStr);
  }, [transactions, period]);

  const totals = useMemo(() => {
    const income = filtered.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
    const expenses = filtered.filter(t => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);
    return { income, expenses, balance: income - expenses };
  }, [filtered]);

  const monthlyData = useMemo(() => {
    const map = new Map<string, { month: string; income: number; expenses: number }>();
    for (const t of filtered) {
      const m = getMonth(t.date);
      if (!map.has(m)) map.set(m, { month: m, income: 0, expenses: 0 });
      const entry = map.get(m)!;
      if (t.amount > 0) entry.income += t.amount;
      else entry.expenses += Math.abs(t.amount);
    }
    return Array.from(map.values()).sort((a, b) => a.month.localeCompare(b.month));
  }, [filtered]);

  const categoryData = useMemo(() => {
    const map = new Map<string, number>();
    for (const t of filtered.filter(t => t.amount < 0)) {
      const cur = map.get(t.category) ?? 0;
      map.set(t.category, cur + Math.abs(t.amount));
    }
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [filtered]);

  if (isLoading) {
    return (
      <div className="py-16 text-center text-muted-foreground">Cargando datos…</div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="py-16 text-center text-muted-foreground">
        <BarChart2 className="h-10 w-10 mx-auto mb-3 opacity-30" />
        <p className="font-medium">Sin datos aún</p>
        <p className="text-sm">Importa un estado de cuenta para ver tu dashboard.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Period selector */}
      <div className="flex items-center justify-end">
        <Select value={period} onValueChange={v => setPeriod(v as typeof period)}>
          <SelectTrigger className="h-8 text-xs w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="3m" className="text-xs">Últimos 3 meses</SelectItem>
            <SelectItem value="6m" className="text-xs">Últimos 6 meses</SelectItem>
            <SelectItem value="12m" className="text-xs">Último año</SelectItem>
            <SelectItem value="all" className="text-xs">Todo el período</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/30">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Ingresos</p>
              <p className="text-lg font-bold text-green-600">{formatCLP(totals.income)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-full bg-red-100 dark:bg-red-900/30">
              <TrendingDown className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Egresos</p>
              <p className="text-lg font-bold text-red-500">{formatCLP(totals.expenses)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className={`p-2 rounded-full ${totals.balance >= 0 ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-orange-100 dark:bg-orange-900/30'}`}>
              <Wallet className={`h-5 w-5 ${totals.balance >= 0 ? 'text-blue-600' : 'text-orange-500'}`} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Saldo neto</p>
              <p className={`text-lg font-bold ${totals.balance >= 0 ? 'text-blue-600' : 'text-orange-500'}`}>
                {formatCLP(totals.balance)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly bar chart */}
      {monthlyData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Ingresos vs Egresos por Mes</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={monthlyData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                <YAxis
                  tickFormatter={v => {
                    if (Math.abs(v) >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
                    if (Math.abs(v) >= 1_000) return `${(v / 1_000).toFixed(0)}k`;
                    return String(v);
                  }}
                  tick={{ fontSize: 10 }}
                  width={55}
                />
                <Tooltip
                  formatter={(value: number) => formatCLP(value)}
                  labelStyle={{ fontSize: 11 }}
                  contentStyle={{ fontSize: 11 }}
                />
                <Bar dataKey="income" name="Ingresos" fill="#22c55e" radius={[3, 3, 0, 0]} />
                <Bar dataKey="expenses" name="Egresos" fill="#ef4444" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Category pie chart */}
      {categoryData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Egresos por Categoría</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={categoryData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {categoryData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => formatCLP(v)} contentStyle={{ fontSize: 11 }} />
                <Legend iconSize={10} iconType="circle" wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
