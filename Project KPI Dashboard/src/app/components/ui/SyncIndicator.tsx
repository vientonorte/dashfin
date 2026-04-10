import { useState, useEffect, useCallback } from 'react';
import { RefreshCw, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from './button';
import { useRole } from '../../contexts/RoleContext';

interface SyncIndicatorProps {
  lastSync: Date | null;
  isSyncing: boolean;
  error: string | null;
  onSync: () => void;
}

export function SyncIndicator({ lastSync, isSyncing, error, onSync }: SyncIndicatorProps) {
  const { can } = useRole();
  const [relativeTime, setRelativeTime] = useState('');

  const computeRelative = useCallback(() => {
    if (!lastSync) return 'Sin sincronizar';
    const diffMs = Date.now() - lastSync.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return 'Hace instantes';
    if (diffMin < 60) return `Hace ${diffMin} min`;
    const diffHrs = Math.floor(diffMin / 60);
    return `Hace ${diffHrs}h ${diffMin % 60}m`;
  }, [lastSync]);

  useEffect(() => {
    setRelativeTime(computeRelative());
    const id = setInterval(() => setRelativeTime(computeRelative()), 30_000);
    return () => clearInterval(id);
  }, [computeRelative]);

  return (
    <div className="flex items-center gap-2 text-xs">
      {error ? (
        <span className="flex items-center gap-1 text-amber-600">
          <AlertTriangle className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Error de sync</span>
        </span>
      ) : lastSync ? (
        <span className="flex items-center gap-1 text-emerald-600">
          <CheckCircle2 className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">{relativeTime}</span>
        </span>
      ) : (
        <span className="text-muted-foreground hidden sm:inline">Sin datos de Sheets</span>
      )}

      {can('edit:business_data') && (
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0"
          onClick={onSync}
          disabled={isSyncing}
          title="Sincronizar ahora"
        >
          {isSyncing ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <RefreshCw className="h-3.5 w-3.5" />
          )}
        </Button>
      )}
    </div>
  );
}
