// ============================================================================
// CSV PARSER — Parseo determinístico de estados de cuenta bancarios.
// Admite formatos variados: fecha, descripción, monto (y combinaciones comunes).
// ============================================================================

import type { ParsedTransaction } from '../types/transactions';

interface ParseResult {
  transactions: ParsedTransaction[];
  errors: string[];
  warnings: string[];
}

/** Normaliza una cadena de monto a número (soporta comas/puntos como separadores) */
function parseAmount(raw: string): number | null {
  if (!raw) return null;
  // Remove currency symbols, spaces, and thousand separators
  const cleaned = raw
    .replace(/[$€£¥CLP\s]/gi, '')
    .replace(/[()]/g, match => (match === '(' ? '-' : ''))
    .replace(/,(?=\d{3})/g, '')  // remove thousand separators (1,000 -> 1000)
    .replace(/\.(?=\d{3})/g, '') // remove dot thousand separators (1.000 -> 1000)
    .replace(',', '.');           // decimal comma to dot
  const n = parseFloat(cleaned);
  return isNaN(n) ? null : n;
}

/** Normaliza fechas en formatos DD/MM/YYYY, MM/DD/YYYY, YYYY-MM-DD, DD-MM-YYYY */
function parseDate(raw: string): string | null {
  if (!raw) return null;
  const s = raw.trim();

  // ISO format
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;

  // DD/MM/YYYY or DD-MM-YYYY
  const dmy = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (dmy) {
    const [, d, m, y] = dmy;
    const date = new Date(`${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`);
    if (!isNaN(date.getTime())) return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }

  // MM/DD/YYYY (US format)
  const mdy = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (mdy) {
    const [, m, d, y] = mdy;
    const date = new Date(`${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`);
    if (!isNaN(date.getTime())) return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }

  return null;
}

function detectSeparator(header: string): string {
  const counts = { ',': 0, ';': 0, '\t': 0 };
  for (const ch of header) {
    if (ch in counts) counts[ch as keyof typeof counts]++;
  }
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
}

function parseCSVLine(line: string, sep: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === sep && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

/** Detecta los índices de columnas fecha, descripción y monto */
function detectColumns(headers: string[]): {
  dateIdx: number;
  descIdx: number;
  amountIdx: number;
  creditIdx: number;
  debitIdx: number;
} {
  const h = headers.map(x => x.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, ''));

  const dateIdx = h.findIndex(x =>
    x.includes('fecha') || x.includes('date') || x === 'dia' || x === 'day'
  );
  const descIdx = h.findIndex(x =>
    x.includes('descripcion') || x.includes('description') || x.includes('concepto') ||
    x.includes('detalle') || x.includes('glosa') || x.includes('movimiento')
  );
  const amountIdx = h.findIndex(x =>
    (x.includes('monto') || x.includes('amount') || x.includes('importe') || x.includes('valor')) &&
    !x.includes('credito') && !x.includes('debito') && !x.includes('credit') && !x.includes('debit')
  );
  const creditIdx = h.findIndex(x =>
    x.includes('abono') || x.includes('credito') || x.includes('credit') || x.includes('ingreso')
  );
  const debitIdx = h.findIndex(x =>
    x.includes('cargo') || x.includes('debito') || x.includes('debit') || x.includes('egreso')
  );

  return { dateIdx, descIdx, amountIdx, creditIdx, debitIdx };
}

export function parseCSV(content: string): ParseResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const transactions: ParsedTransaction[] = [];

  const lines = content.split(/\r?\n/).filter(l => l.trim().length > 0);
  if (lines.length < 2) {
    errors.push('El archivo CSV debe tener al menos una fila de encabezado y una de datos.');
    return { transactions, errors, warnings };
  }

  const sep = detectSeparator(lines[0]);
  const headers = parseCSVLine(lines[0], sep);
  const { dateIdx, descIdx, amountIdx, creditIdx, debitIdx } = detectColumns(headers);

  if (dateIdx === -1) {
    errors.push('No se encontró columna de fecha. Columnas detectadas: ' + headers.join(', '));
    return { transactions, errors, warnings };
  }
  if (descIdx === -1) {
    warnings.push('No se encontró columna de descripción; se usará texto vacío.');
  }

  const hasSplitAmounts = creditIdx !== -1 && debitIdx !== -1;
  if (amountIdx === -1 && !hasSplitAmounts) {
    errors.push('No se encontró columna de monto. Columnas detectadas: ' + headers.join(', '));
    return { transactions, errors, warnings };
  }

  const seen = new Set<string>();

  for (let i = 1; i < lines.length; i++) {
    const cols = parseCSVLine(lines[i], sep);
    const lineNum = i + 1;

    const rawDate = cols[dateIdx] ?? '';
    const date = parseDate(rawDate);
    if (!date) {
      warnings.push(`Línea ${lineNum}: fecha inválida "${rawDate}" — omitida.`);
      continue;
    }

    const description = descIdx !== -1 ? (cols[descIdx] ?? '') : '';

    let amount: number | null = null;
    if (hasSplitAmounts) {
      const credit = parseAmount(cols[creditIdx] ?? '') ?? 0;
      const debit = parseAmount(cols[debitIdx] ?? '') ?? 0;
      if (credit !== 0 || debit !== 0) {
        amount = credit > 0 ? credit : -Math.abs(debit);
      }
    } else {
      amount = parseAmount(cols[amountIdx] ?? '');
    }

    if (amount === null) {
      warnings.push(`Línea ${lineNum}: monto inválido — omitida.`);
      continue;
    }

    // Deduplication check
    const key = `${date}|${description}|${amount}`;
    if (seen.has(key)) {
      warnings.push(`Línea ${lineNum}: posible duplicado (${date} / ${description} / ${amount}) — omitido.`);
      continue;
    }
    seen.add(key);

    transactions.push({ date, description, amount });
  }

  if (transactions.length === 0 && errors.length === 0) {
    errors.push('No se encontraron transacciones válidas en el archivo.');
  }

  return { transactions, errors, warnings };
}

/** Extrae texto plano de un PDF usando la API del navegador (fallback básico sin OCR) */
export async function parsePDFText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      // Basic: try to extract readable strings from binary PDF
      const binary = reader.result as string;
      const textChunks: string[] = [];
      // PDF text streams are enclosed in BT...ET markers
      const btEt = /BT\s*([\s\S]*?)\s*ET/g;
      let match;
      while ((match = btEt.exec(binary)) !== null) {
        // Extract text from Tj/TJ operators
        const tjMatches = match[1].matchAll(/\(([^)]+)\)\s*T[jJ]/g);
        for (const tj of tjMatches) {
          textChunks.push(tj[1]);
        }
      }
      resolve(textChunks.join(' '));
    };
    reader.onerror = () => reject(new Error('No se pudo leer el archivo PDF.'));
    reader.readAsBinaryString(file);
  });
}
