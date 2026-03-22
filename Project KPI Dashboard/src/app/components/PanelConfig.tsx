import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { useBusinessConfig } from '../contexts/BusinessConfigContext';
import { useRole } from '../contexts/RoleContext';
import { AccessDenied } from './ui/AccessDenied';
import { Settings, Save, RotateCcw, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export function PanelConfig() {
  const { can } = useRole();
  const { config, updateConfig, resetConfig } = useBusinessConfig();
  const [draft, setDraft] = useState(config);
  const [saved, setSaved] = useState(false);

  if (!can('view:config_panel')) {
    return <AccessDenied message="Solo el administrador puede acceder a la configuración." />;
  }

  const handleSave = () => {
    updateConfig(draft);
    setSaved(true);
    toast.success('Configuración guardada');
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    resetConfig();
    setDraft(config);
    toast.info('Configuración restaurada a valores por defecto');
  };

  const field = (
    label: string,
    key: keyof typeof draft,
    type: 'text' | 'number' = 'number',
    hint?: string
  ) => (
    <div className="space-y-1">
      <Label htmlFor={key} className="text-xs font-medium">
        {label}
      </Label>
      <Input
        id={key}
        type={type}
        value={draft[key]}
        onChange={(e) =>
          setDraft((prev) => ({
            ...prev,
            [key]: type === 'number' ? Number(e.target.value) : e.target.value,
          }))
        }
        className="h-8 text-sm"
        disabled={!can('edit:business_config')}
      />
      {hint && <p className="text-[10px] text-muted-foreground">{hint}</p>}
    </div>
  );

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Configuración del Negocio
        </CardTitle>
        <CardDescription>
          Parámetros centralizados — se aplican a todo el dashboard
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Identidad */}
        <div>
          <h3 className="text-sm font-semibold mb-3">Identidad</h3>
          <div className="grid grid-cols-2 gap-4">
            {field('Nombre del local', 'nombre_local', 'text')}
            {field('Metros cuadrados', 'metros_cuadrados', 'number')}
          </div>
        </div>

        {/* Inversión */}
        <div>
          <h3 className="text-sm font-semibold mb-3">Inversión (CLP)</h3>
          <div className="grid grid-cols-2 gap-4">
            {field('CAPEX Total', 'capex_total')}
            {field('Derecho de Llaves', 'derecho_llaves')}
          </div>
        </div>

        {/* COGS */}
        <div>
          <h3 className="text-sm font-semibold mb-3">COGS por Línea (decimal)</h3>
          <div className="grid grid-cols-3 gap-4">
            {field('Café', 'cogs_cafe_pct', 'number', '0.32 = 32%')}
            {field('Hotdesk', 'cogs_hotdesk_pct', 'number', '0.075 = 7.5%')}
            {field('Asesorías', 'cogs_asesorias_pct', 'number', '0 = 0%')}
          </div>
        </div>

        {/* Umbrales */}
        <div>
          <h3 className="text-sm font-semibold mb-3">Umbrales de Alerta</h3>
          <div className="grid grid-cols-3 gap-4">
            {field('Genio (CLP)', 'umbral_genio', 'number', 'Utilidad mínima para Genio')}
            {field('Margen Crítico', 'umbral_margen_critico', 'number', '0.30 = 30%')}
            {field('Ocupación Mín.', 'umbral_ocupacion_minima', 'number', '0.50 = 50%')}
          </div>
        </div>

        {/* Sincronización */}
        <div>
          <h3 className="text-sm font-semibold mb-3">Google Sheets</h3>
          <div className="grid grid-cols-1 gap-4">
            {field('Sheet ID', 'sheets_id', 'text')}
            <div className="grid grid-cols-2 gap-4">
              {field('Tab', 'sheets_tab', 'text')}
              {field('Sync (min)', 'sync_interval_min', 'number', 'Intervalo de sincronización')}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button onClick={handleSave} className="flex-1" disabled={!can('edit:business_config')}>
            {saved ? (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Guardado
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Guardar Cambios
              </>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={!can('edit:business_config')}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Restaurar
          </Button>
        </div>

        {saved && (
          <Alert className="border-emerald-200 bg-emerald-50">
            <AlertDescription className="text-emerald-700 text-xs">
              ✅ Los cambios se aplicaron a todo el dashboard automáticamente.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
