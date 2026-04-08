// ============================================================================
// NORMALIZER — Normalización y categorización automática de transacciones.
// ============================================================================

import type { ParsedTransaction, Transaction, Category } from '../types/transactions';

const CATEGORY_RULES: Array<{ pattern: RegExp; category: Category }> = [
  { pattern: /super(mercado)?|walmart|jumbo|lider|tottus|unimarc|santa\s?isabel/i, category: 'Alimentación' },
  { pattern: /restaurante|rest\.|caf[eé]|pizza|burger|sushi|delivery|rappi|uber\s?eats|pedidos/i, category: 'Alimentación' },
  { pattern: /metro|transantiago|bip|transporte|uber|taxi|cabify|bus|tren|combustible|bencin/i, category: 'Transporte' },
  { pattern: /farmacia|cl[íi]nica|hospital|m[eé]dico|salud|isapre|fonasa|dental/i, category: 'Salud' },
  { pattern: /universidad|colegio|instituto|libro|curso|udemy|coursera|educaci[oó]n/i, category: 'Educación' },
  { pattern: /netflix|spotify|amazon|disney|cine|teatro|juego|steam|entretenimiento/i, category: 'Entretenimiento' },
  { pattern: /luz|agua|gas|internet|telefon|celular|servicio|movistar|entel|vtr|claro/i, category: 'Servicios' },
  { pattern: /arriendo|alquiler|condominio|administraci[oó]n|vivienda/i, category: 'Arriendo/Vivienda' },
  { pattern: /tienda|falabella|ripley|paris|h&m|zara|ropa|zapatos|calzado/i, category: 'Ropa' },
  { pattern: /sueldo|salario|remuneraci[oó]n|honorario|pago\s+nomina/i, category: 'Sueldo' },
  { pattern: /dividendo|acci[oó]n|fondo|inversión|ahorr|deposito\s+plazo/i, category: 'Inversiones' },
  { pattern: /transferencia|traspaso|depósito|dep\./i, category: 'Transferencia' },
];

function guessCategory(description: string): Category {
  for (const rule of CATEGORY_RULES) {
    if (rule.pattern.test(description)) return rule.category;
  }
  return 'Otros';
}

function generateId(): string {
  return `txn_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function generateBatchId(): string {
  return `batch_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export interface NormalizeOptions {
  source: 'csv' | 'pdf' | 'manual';
  fileName?: string;
  account?: string;
  batchId?: string;
}

export function normalizeParsedTransactions(
  parsed: ParsedTransaction[],
  options: NormalizeOptions
): { transactions: Transaction[]; batchId: string } {
  const now = new Date().toISOString();
  const batchId = options.batchId ?? generateBatchId();

  const transactions: Transaction[] = parsed.map(p => {
    const amount = typeof p.amount === 'number' ? p.amount : 0;
    const type =
      amount > 0 ? 'income' : amount < 0 ? 'expense' : 'transfer';

    return {
      id: generateId(),
      date: p.date,
      description: (p.description ?? '').trim().slice(0, 255),
      amount,
      type,
      category: guessCategory(p.description ?? ''),
      account: options.account ?? p.account ?? 'Principal',
      source: options.source,
      importBatchId: batchId,
      notes: '',
      createdAt: now,
      updatedAt: now,
    };
  });

  return { transactions, batchId };
}
