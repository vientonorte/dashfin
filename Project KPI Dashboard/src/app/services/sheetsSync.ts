import { BusinessConfig } from '../contexts/BusinessConfigContext';

export interface RawSheetRow {
  fecha: string;
  venta_cafe: number;
  venta_hotdesk: number;
  venta_asesorias: number;
  gasto_insumos: number;
  gasto_staff_fijo: number;
  nota: string;
}

// Parsea CSV con encabezados. Retorna array de objetos con claves normalizadas.
function parseCSV(csv: string): RawSheetRow[] {
  const lines = csv.trim().split('\n').filter(l => l.trim());
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_'));

  return lines.slice(1).map(line => {
    // Handle quoted fields with commas inside
    const values: string[] = [];
    let current = '';
    let inQuotes = false;
    for (const ch of line) {
      if (ch === '"') { inQuotes = !inQuotes; continue; }
      if (ch === ',' && !inQuotes) { values.push(current.trim()); current = ''; continue; }
      current += ch;
    }
    values.push(current.trim());

    const obj: Record<string, string> = {};
    headers.forEach((h, i) => { obj[h] = values[i] ?? ''; });

    // Normalize column names from sheet to internal schema
    return normalizeRow(obj);
  }).filter(row => row.fecha && row.fecha !== '');
}

// Adapter: maps raw sheet columns → internal RawSheetRow schema
function normalizeRow(raw: Record<string, string>): RawSheetRow {
  const num = (key: string, ...aliases: string[]) => {
    const val = [key, ...aliases].map(k => raw[k]).find(v => v !== undefined && v !== '');
    return val ? parseFloat(val.replace(/[^0-9.-]/g, '')) || 0 : 0;
  };
  const str = (key: string, ...aliases: string[]) => {
    return [key, ...aliases].map(k => raw[k]).find(v => v !== undefined && v !== '') ?? '';
  };

  return {
    fecha: str('fecha', 'date', 'f'),
    venta_cafe: num('venta_cafe', 'cafe', 'cafeteria', 'venta_cafeter_a'),
    venta_hotdesk: num('venta_hotdesk', 'hotdesk', 'cowork'),
    venta_asesorias: num('venta_asesorias', 'asesorias', 'asesor_as', 'consultoria'),
    gasto_insumos: num('gasto_insumos', 'insumos', 'cogs'),
    gasto_staff_fijo: num('gasto_staff_fijo', 'staff', 'staff_fijo', 'personal'),
    nota: str('nota', 'notas', 'notes', 'comment')
  };
}

const CACHE_KEY = 'dashfin_sheets_cache';
const CACHE_TS_KEY = 'dashfin_sheets_cache_ts';

// Opción C: Google Sheets CSV export URL (sin auth, para MVP)
export async function fetchSheetData(config: BusinessConfig): Promise<RawSheetRow[]> {
  const url = `https://docs.google.com/spreadsheets/d/${config.sheets_id}/export?format=csv&gid=0`;

  try {
    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const csv = await response.text();
    const rows = parseCSV(csv);

    // Persist to localStorage as fallback
    localStorage.setItem(CACHE_KEY, JSON.stringify(rows));
    localStorage.setItem(CACHE_TS_KEY, Date.now().toString());

    return rows;
  } catch (err) {
    console.warn('[sheetsSync] fetch failed, using localStorage fallback', err);
    const cached = localStorage.getItem(CACHE_KEY);
    return cached ? JSON.parse(cached) : [];
  }
}

// Returns minutes since last successful sync, or null if never synced
export function minutesSinceLastSync(): number | null {
  const ts = localStorage.getItem(CACHE_TS_KEY);
  if (!ts) return null;
  return Math.floor((Date.now() - parseInt(ts)) / 60_000);
}
