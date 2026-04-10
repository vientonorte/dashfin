// ============================================================================
// TRANSACTION CONTEXT — Estado central de transacciones personales.
// Almacena transacciones cifradas en localStorage cuando encryptionEnabled=true.
// ============================================================================

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import type {
  Transaction,
  ImportBatch,
  AuditLogEntry,
} from '../types/transactions';
import { encryptData, decryptData, destroyKey } from '../utils/crypto';
import { usePrivacy } from './PrivacyContext';

const TXN_KEY = 'dashfin_transactions_v1';
const BATCH_KEY = 'dashfin_batches_v1';
const LOG_KEY = 'dashfin_audit_log_v1';

interface TransactionContextValue {
  transactions: Transaction[];
  batches: ImportBatch[];
  auditLog: AuditLogEntry[];
  addTransactions: (txns: Transaction[], batch: ImportBatch) => Promise<void>;
  updateTransaction: (id: string, patch: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  undoBatch: (batchId: string) => void;
  exportTransactions: () => void;
  purgeAll: () => Promise<void>;
  isLoading: boolean;
}

const TransactionContext = createContext<TransactionContextValue | null>(null);

async function loadEncrypted<T>(key: string, encrypt: boolean): Promise<T[]> {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const json = encrypt ? await decryptData(raw) : raw;
    return JSON.parse(json) as T[];
  } catch {
    return [];
  }
}

async function saveEncrypted<T>(key: string, data: T[], encrypt: boolean): Promise<void> {
  const json = JSON.stringify(data);
  const toStore = encrypt ? await encryptData(json) : json;
  localStorage.setItem(key, toStore);
}

function appendAuditEntry(
  log: AuditLogEntry[],
  entry: Omit<AuditLogEntry, 'id' | 'timestamp'>
): AuditLogEntry[] {
  const newEntry: AuditLogEntry = {
    id: `log_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    timestamp: new Date().toISOString(),
    ...entry,
  };
  return [newEntry, ...log].slice(0, 500); // Keep last 500 entries
}

export function TransactionProvider({ children }: { children: ReactNode }) {
  const { settings } = usePrivacy();
  const enc = settings.encryptionEnabled;

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [batches, setBatches] = useState<ImportBatch[]>([]);
  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load on mount and when encryption setting changes
  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      loadEncrypted<Transaction>(TXN_KEY, enc),
      loadEncrypted<ImportBatch>(BATCH_KEY, false),
      loadEncrypted<AuditLogEntry>(LOG_KEY, false),
    ]).then(([txns, btchs, logs]) => {
      setTransactions(txns);
      setBatches(btchs);
      setAuditLog(logs);
      setIsLoading(false);
    });
  }, [enc]);

  const persistTransactions = useCallback(
    (txns: Transaction[]) => saveEncrypted(TXN_KEY, txns, enc),
    [enc]
  );

  const addTransactions = useCallback(
    async (newTxns: Transaction[], batch: ImportBatch) => {
      const updated = [...transactions, ...newTxns];
      const updatedBatches = [...batches, batch];
      const updatedLog = appendAuditEntry(auditLog, {
        action: 'import',
        details: `Importadas ${newTxns.length} transacciones desde ${batch.fileName}`,
        batchId: batch.id,
      });

      setTransactions(updated);
      setBatches(updatedBatches);
      setAuditLog(updatedLog);

      await persistTransactions(updated);
      localStorage.setItem(BATCH_KEY, JSON.stringify(updatedBatches));
      localStorage.setItem(LOG_KEY, JSON.stringify(updatedLog));
    },
    [transactions, batches, auditLog, persistTransactions]
  );

  const updateTransaction = useCallback(
    (id: string, patch: Partial<Transaction>) => {
      const updated = transactions.map(t =>
        t.id === id ? { ...t, ...patch, updatedAt: new Date().toISOString() } : t
      );
      const updatedLog = appendAuditEntry(auditLog, {
        action: 'edit',
        details: `Editada transacción ${id}: ${JSON.stringify(patch)}`,
        transactionId: id,
      });
      setTransactions(updated);
      setAuditLog(updatedLog);
      persistTransactions(updated);
      localStorage.setItem(LOG_KEY, JSON.stringify(updatedLog));
    },
    [transactions, auditLog, persistTransactions]
  );

  const deleteTransaction = useCallback(
    (id: string) => {
      const updated = transactions.filter(t => t.id !== id);
      const updatedLog = appendAuditEntry(auditLog, {
        action: 'delete',
        details: `Eliminada transacción ${id}`,
        transactionId: id,
      });
      setTransactions(updated);
      setAuditLog(updatedLog);
      persistTransactions(updated);
      localStorage.setItem(LOG_KEY, JSON.stringify(updatedLog));
    },
    [transactions, auditLog, persistTransactions]
  );

  const undoBatch = useCallback(
    (batchId: string) => {
      const updated = transactions.filter(t => t.importBatchId !== batchId);
      const updatedBatches = batches.filter(b => b.id !== batchId);
      const updatedLog = appendAuditEntry(auditLog, {
        action: 'undo',
        details: `Deshecha importación del lote ${batchId}`,
        batchId,
      });
      setTransactions(updated);
      setBatches(updatedBatches);
      setAuditLog(updatedLog);
      persistTransactions(updated);
      localStorage.setItem(BATCH_KEY, JSON.stringify(updatedBatches));
      localStorage.setItem(LOG_KEY, JSON.stringify(updatedLog));
    },
    [transactions, batches, auditLog, persistTransactions]
  );

  const exportTransactions = useCallback(() => {
    const headers = ['Fecha', 'Descripción', 'Monto', 'Tipo', 'Categoría', 'Cuenta', 'Notas'];
    const rows = transactions.map(t => [
      t.date,
      `"${t.description.replace(/"/g, '""')}"`,
      t.amount,
      t.type,
      t.category,
      t.account,
      `"${t.notes.replace(/"/g, '""')}"`,
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dashfin-export-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    const updatedLog = appendAuditEntry(auditLog, {
      action: 'export',
      details: `Exportadas ${transactions.length} transacciones`,
    });
    setAuditLog(updatedLog);
    localStorage.setItem(LOG_KEY, JSON.stringify(updatedLog));
  }, [transactions, auditLog]);

  const purgeAll = useCallback(async () => {
    // Log the purge action BEFORE deleting logs
    const purgeLog: AuditLogEntry[] = appendAuditEntry(auditLog, {
      action: 'purge',
      details: `Borrado total: ${transactions.length} transacciones eliminadas`,
    });

    setTransactions([]);
    setBatches([]);
    setAuditLog(purgeLog);

    localStorage.removeItem(TXN_KEY);
    localStorage.removeItem(BATCH_KEY);
    localStorage.setItem(LOG_KEY, JSON.stringify(purgeLog));

    // Destroy encryption key — previously encrypted data becomes unreadable
    destroyKey();
  }, [transactions, auditLog]);

  return (
    <TransactionContext.Provider
      value={{
        transactions,
        batches,
        auditLog,
        addTransactions,
        updateTransaction,
        deleteTransaction,
        undoBatch,
        exportTransactions,
        purgeAll,
        isLoading,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
}

export function useTransactions() {
  const ctx = useContext(TransactionContext);
  if (!ctx) throw new Error('useTransactions must be used inside TransactionProvider');
  return ctx;
}
