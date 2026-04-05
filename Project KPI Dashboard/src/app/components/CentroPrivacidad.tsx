// ============================================================================
// CENTRO DE PRIVACIDAD — Configuración de privacidad, logs y borrado total.
// ============================================================================

import { useState } from 'react';
import { Shield, Trash2, Download, Clock, Eye, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { usePrivacy } from '../contexts/PrivacyContext';
import { useTransactions } from '../contexts/TransactionContext';

export function CentroPrivacidad() {
  const { settings, updateSettings } = usePrivacy();
  const { transactions, auditLog, exportTransactions, purgeAll, isLoading } = useTransactions();
  const [showLogs, setShowLogs] = useState(false);
  const [confirmPurge, setConfirmPurge] = useState(false);

  async function handlePurge() {
    if (!confirmPurge) {
      setConfirmPurge(true);
      return;
    }
    await purgeAll();
    setConfirmPurge(false);
    toast.success('🗑️ Borrado total completado. Todos los datos han sido eliminados.');
  }

  function handleExport() {
    exportTransactions();
    toast.success('📥 Exportación iniciada');
  }

  const actionLabel: Record<string, string> = {
    import: 'Importación',
    edit: 'Edición',
    delete: 'Eliminación',
    export: 'Exportación',
    purge: 'Borrado total',
    undo: 'Deshacer',
  };

  const actionColor: Record<string, string> = {
    import: 'bg-blue-100 text-blue-700',
    edit: 'bg-yellow-100 text-yellow-700',
    delete: 'bg-red-100 text-red-700',
    export: 'bg-green-100 text-green-700',
    purge: 'bg-red-200 text-red-800',
    undo: 'bg-purple-100 text-purple-700',
  };

  return (
    <div className="space-y-4">
      {/* Privacy toggles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Shield className="h-4 w-4" />
            Configuración de Privacidad
          </CardTitle>
          <CardDescription>
            Controla cómo se almacenan y gestionan tus datos financieros.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">Cifrado AES-256</Label>
              <p className="text-xs text-muted-foreground">
                Cifra los datos en reposo usando Web Crypto API. Recomendado.
              </p>
            </div>
            <Switch
              checked={settings.encryptionEnabled}
              onCheckedChange={v => {
                updateSettings({ encryptionEnabled: v });
                toast.info(v ? '🔒 Cifrado activado' : '🔓 Cifrado desactivado');
              }}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">Importación automática</Label>
              <p className="text-xs text-muted-foreground">
                Permite importar archivos sin confirmación manual. Desactivado por defecto (privacy-first).
              </p>
            </div>
            <Switch
              checked={settings.autoImport}
              onCheckedChange={v => updateSettings({ autoImport: v })}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              Retención de datos
            </Label>
            <p className="text-xs text-muted-foreground">
              Los datos más antiguos que este período serán eliminados automáticamente.
            </p>
            <Select
              value={settings.retentionDays === null ? 'forever' : String(settings.retentionDays)}
              onValueChange={v => updateSettings({ retentionDays: v === 'forever' ? null : parseInt(v) })}
            >
              <SelectTrigger className="h-8 text-xs w-52">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="forever" className="text-xs">Sin límite</SelectItem>
                <SelectItem value="90" className="text-xs">90 días</SelectItem>
                <SelectItem value="180" className="text-xs">6 meses</SelectItem>
                <SelectItem value="365" className="text-xs">1 año</SelectItem>
                <SelectItem value="730" className="text-xs">2 años</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Retención de logs de auditoría</Label>
            <Select
              value={String(settings.logRetentionDays)}
              onValueChange={v => updateSettings({ logRetentionDays: parseInt(v) })}
            >
              <SelectTrigger className="h-8 text-xs w-52">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30" className="text-xs">30 días</SelectItem>
                <SelectItem value="90" className="text-xs">90 días</SelectItem>
                <SelectItem value="180" className="text-xs">180 días</SelectItem>
                <SelectItem value="365" className="text-xs">1 año</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Data actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Datos Personales</CardTitle>
          <CardDescription>
            {transactions.length} transacciones almacenadas
            {settings.encryptionEnabled && <Badge variant="outline" className="ml-2 text-xs">🔒 Cifrado</Badge>}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-3 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={handleExport}
              disabled={transactions.length === 0 || isLoading}
            >
              <Download className="h-4 w-4" />
              Exportar mis datos (CSV)
            </Button>

            <Button
              variant="destructive"
              size="sm"
              className="gap-2"
              onClick={handlePurge}
              disabled={isLoading}
            >
              <Trash2 className="h-4 w-4" />
              {confirmPurge ? '⚠️ Confirmar borrado total' : 'Borrar todo'}
            </Button>
            {confirmPurge && (
              <Button variant="ghost" size="sm" onClick={() => setConfirmPurge(false)}>
                Cancelar
              </Button>
            )}
          </div>

          {confirmPurge && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>¡Acción irreversible!</strong> Se eliminarán {transactions.length} transacciones
                y la clave de cifrado. Los datos cifrados no podrán recuperarse.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Audit log */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Log de Auditoría
              </CardTitle>
              <CardDescription>{auditLog.length} entradas registradas</CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs"
              onClick={() => setShowLogs(v => !v)}
            >
              {showLogs ? 'Ocultar' : 'Ver log'}
            </Button>
          </div>
        </CardHeader>
        {showLogs && (
          <CardContent className="p-0">
            {auditLog.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-muted-foreground">Sin actividad registrada.</p>
            ) : (
              <div className="overflow-x-auto max-h-80 overflow-y-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="px-3 py-2 text-left font-medium">Fecha y hora</th>
                      <th className="px-3 py-2 text-left font-medium">Acción</th>
                      <th className="px-3 py-2 text-left font-medium">Detalle</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLog.map(entry => (
                      <tr key={entry.id} className="border-b">
                        <td className="px-3 py-1.5 whitespace-nowrap text-muted-foreground">
                          {new Date(entry.timestamp).toLocaleString('es-CL')}
                        </td>
                        <td className="px-3 py-1.5">
                          <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${actionColor[entry.action] ?? 'bg-muted text-foreground'}`}>
                            {actionLabel[entry.action] ?? entry.action}
                          </span>
                        </td>
                        <td className="px-3 py-1.5 text-muted-foreground max-w-xs truncate" title={entry.details}>
                          {entry.details}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        )}
      </Card>
    </div>
  );
}
