import { useState, useEffect } from 'react';
import { RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { Button } from './button';
import { fetchSheetData, minutesSinceLastSync } from '../../services/sheetsSync';
import { useBusinessConfig } from '../../contexts/BusinessConfigContext';

interface SyncIndicatorProps {
  onSyncComplete?: (rows: any[]) => void;
}

export function SyncIndicator({ onSyncComplete }: SyncIndicatorProps) {
  const { config } = useBusinessConfig();
  const [syncing, setSyncing] = useState(false);
  const [minutesAgo, setMinutesAgo] = useState<number | null>(minutesSinceLastSync());
  const [lastError, setLastError] = useState(false);

  // Update "X min ago" label every minute
  useEffect(() => {
    const id = setInterval(() => setMinutesAgo(minutesSinceLastSync()), 60_000);
    return () => clearInterval(id);
  }, []);

  // Auto-sync on mount and then every sync_interval_min minutes
  useEffect(() => {
    const doSync = async () => {
      setSyncing(true);
      setLastError(false);
      try {
        const rows = await fetchSheetData(config);
        setMinutesAgo(0);
        onSyncComplete?.(rows);
      } catch {
        setLastError(true);
      } finally {
        setSyncing(false);
      }
    };

    doSync();
    const id = setInterval(doSync, config.sync_interval_min * 60_000);
    return () => clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.sheets_id, config.sync_interval_min]);

  const handleManualSync = async () => {
    setSyncing(true);
    setLastError(false);
    try {
      const rows = await fetchSheetData(config);
      setMinutesAgo(0);
      onSyncComplete?.(rows);
    } catch {
      setLastError(true);
    } finally {
      setSyncing(false);
    }
  };

  const label = (() => {
    if (syncing) return 'Sincronizando...';
    if (lastError) return 'Sin conexión (datos locales)';
    if (minutesAgo === null) return 'Sin sincronizar';
    if (minutesAgo === 0) return 'Actualizado ahora';
    if (minutesAgo === 1) return 'Actualizado hace 1 min';
    return `Actualizado hace ${minutesAgo} min`;
  })();

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      {lastError ? (
        <WifiOff className="h-3.5 w-3.5 text-amber-500" />
      ) : (
        <Wifi className="h-3.5 w-3.5 text-emerald-500" />
      )}
      <span>{label}</span>
      <Button
        variant="ghost"
        size="sm"
        className="h-6 px-2 text-xs"
        onClick={handleManualSync}
        disabled={syncing}
      >
        <RefreshCw className={`h-3 w-3 mr-1 ${syncing ? 'animate-spin' : ''}`} />
        Sincronizar
      </Button>
    </div>
  );
}
