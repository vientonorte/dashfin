import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Settings, RotateCcw, Save } from 'lucide-react';
import { useBusinessConfig } from '../contexts/BusinessConfigContext';
import { useRole } from '../contexts/RoleContext';
import { AccessDenied } from './ui/AccessDenied';
import { toast } from 'sonner';

export function PanelConfig() {
  const { can } = useRole();
  const { config, updateConfig, resetConfig } = useBusinessConfig();

  // Local form state
  const [form, setForm] = useState({ ...config });

  if (!can('edit:business_config')) {
    return <AccessDenied message="Solo el CFO puede editar la configuración del negocio." />;
  }

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const isNum = typeof config[key] === 'number';
    setForm(prev => ({ ...prev, [key]: isNum ? parseFloat(raw) || 0 : raw }));
  };

  const handleSave = () => {
    updateConfig(form);
    toast.success('Configuración guardada');
  };

  const handleReset = () => {
    resetConfig();
    toast.info('Configuración restaurada a valores por defecto');
  };

  const field = (label: string, key: keyof typeof form, hint?: string) => (
    <div className="space-y-1">
      <Label className="text-xs">{label}</Label>
      <Input
        type={typeof config[key] === 'number' ? 'number' : 'text'}
        value={form[key] as string | number}
        onChange={set(key)}
        className="h-8 text-sm"
      />
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-2">
        <Settings className="h-5 w-5" />
        <h2 className="text-lg font-semibold">Configuración del Negocio</h2>
        <Badge variant="secondary">Solo Admin</Badge>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Identidad</CardTitle>
          <CardDescription className="text-xs">Nombre e información básica del local</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          {field('Nombre del local', 'nombre_local')}
          {field('Metros cuadrados', 'metros_cuadrados', 'm²')}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Inversión (CAPEX)</CardTitle>
          <CardDescription className="text-xs">Valores en CLP</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          {field('CAPEX Total', 'capex_total', 'Inversión total del proyecto')}
          {field('Derecho de Llaves', 'derecho_llaves', 'Costo de entrada al local')}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">COGS por Línea</CardTitle>
          <CardDescription className="text-xs">Porcentaje decimal (ej: 0.32 = 32%)</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-3 gap-4">
          {field('Cafetería', 'cogs_cafe_pct', '~32%')}
          {field('Hotdesk', 'cogs_hotdesk_pct', '~7.5%')}
          {field('Asesorías', 'cogs_asesorias_pct', '0%')}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Umbrales de Alerta</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-3 gap-4">
          {field('Umbral Genio (CLP)', 'umbral_genio', 'Utilidad mínima para "Genio"')}
          {field('Margen Crítico', 'umbral_margen_critico', 'Decimal (ej: 0.30)')}
          {field('Ocupación Mínima', 'umbral_ocupacion_minima', 'Decimal hotdesk')}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Google Sheets Sync</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          {field('Sheet ID', 'sheets_id')}
          {field('Nombre de la hoja', 'sheets_tab', 'Ej: Hoja1')}
          {field('Intervalo de sync (min)', 'sync_interval_min', 'Cada cuántos minutos sincronizar')}
        </CardContent>
      </Card>

      <Separator />

      <div className="flex gap-3">
        <Button onClick={handleSave} className="gap-2">
          <Save className="h-4 w-4" />
          Guardar cambios
        </Button>
        <Button variant="outline" onClick={handleReset} className="gap-2">
          <RotateCcw className="h-4 w-4" />
          Restaurar defaults
        </Button>
      </div>
    </div>
  );
}
