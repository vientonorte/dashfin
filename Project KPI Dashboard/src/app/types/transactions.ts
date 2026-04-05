// ============================================================================
// TIPOS — Módulo de Estados de Cuenta Personal
// ============================================================================

export type TransactionType = 'income' | 'expense' | 'transfer';

export const CATEGORIES = [
  'Alimentación',
  'Transporte',
  'Salud',
  'Educación',
  'Entretenimiento',
  'Servicios',
  'Arriendo/Vivienda',
  'Ropa',
  'Sueldo',
  'Inversiones',
  'Transferencia',
  'Otros',
] as const;

export type Category = (typeof CATEGORIES)[number];

export interface Transaction {
  id: string;
  date: string;        // YYYY-MM-DD
  description: string;
  amount: number;      // Positive = income, Negative = expense
  type: TransactionType;
  category: Category;
  account: string;
  source: 'csv' | 'pdf' | 'manual';
  importBatchId: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface ImportBatch {
  id: string;
  createdAt: string;
  source: 'csv' | 'pdf' | 'manual';
  fileName: string;
  count: number;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  action: 'import' | 'edit' | 'delete' | 'export' | 'purge' | 'undo';
  details: string;
  batchId?: string;
  transactionId?: string;
}

export interface PrivacySettings {
  autoImport: boolean;
  retentionDays: number | null; // null = forever
  encryptionEnabled: boolean;
  logRetentionDays: number;
}

export const DEFAULT_PRIVACY_SETTINGS: PrivacySettings = {
  autoImport: false,
  retentionDays: null,
  encryptionEnabled: true,
  logRetentionDays: 90,
};

export interface ParsedTransaction {
  date: string;
  description: string;
  amount: number;
  account?: string;
}
