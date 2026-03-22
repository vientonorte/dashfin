import type { BusinessConfig } from '../contexts/BusinessConfigContext';
import type { DatoDiario } from '../contexts/DashboardContext';

// ============================================================================
// TYPES
// ============================================================================

export interface RawSheetRow {
  fecha: string;
  venta_cafe: number;
  venta_hotdesk: number;
  venta_asesorias: number;
  gasto_insumos: number;
  gasto_staff_fijo: number;
  nota: string;
}

// ============================================================================
// CSV PARSER
// ============================================================================

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

function normalizeHeader(header: string): string {
  return header
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
}

// Map from various possible column names to our canonical field names
const HEADER_MAP: Record<string, keyof RawSheetRow> = {
  fecha: 'fecha',
  date: 'fecha',
  venta_cafe: 'venta_cafe',
  cafe: 'venta_cafe',
  venta_hotdesk: 'venta_hotdesk',
  hotdesk: 'venta_hotdesk',
  venta_asesorias: 'venta_asesorias',
  asesorias: 'venta_asesorias',
  gasto_insumos: 'gasto_insumos',
  insumos: 'gasto_insumos',
  gasto_staff_fijo: 'gasto_staff_fijo',
  staff_fijo: 'gasto_staff_fijo',
  staff: 'gasto_staff_fijo',
  nota: 'nota',
  notas: 'nota',
  observaciones: 'nota',
};

export function parseCSV(csv: string): RawSheetRow[] {
  const lines = csv.split('\n').filter((l) => l.trim().length > 0);
  if (lines.length < 2) return [];

  const headers = parseCSVLine(lines[0]).map(normalizeHeader);

  // Build column index map
  const colMap: Partial<Record<keyof RawSheetRow, number>> = {};
  headers.forEach((h, i) => {
    const canonical = HEADER_MAP[h];
    if (canonical) colMap[canonical] = i;
  });

  const rows: RawSheetRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cells = parseCSVLine(lines[i]);
    if (cells.length < 2) continue;

    const getValue = (field: keyof RawSheetRow): string => {
      const idx = colMap[field];
      return idx !== undefined && idx < cells.length ? cells[idx] : '';
    };

    const fecha = getValue('fecha');
    if (!fecha) continue;

    rows.push({
      fecha,
      venta_cafe: Number(getValue('venta_cafe')) || 0,
      venta_hotdesk: Number(getValue('venta_hotdesk')) || 0,
      venta_asesorias: Number(getValue('venta_asesorias')) || 0,
      gasto_insumos: Number(getValue('gasto_insumos')) || 0,
      gasto_staff_fijo: Number(getValue('gasto_staff_fijo')) || 0,
      nota: getValue('nota'),
    });
  }

  return rows;
}

// ============================================================================
// FETCH FROM GOOGLE SHEETS (Opción C: CSV export)
// ============================================================================

export async function fetchSheetData(config: BusinessConfig): Promise<RawSheetRow[]> {
  const url = `https://docs.google.com/spreadsheets/d/${encodeURIComponent(config.sheets_id)}/export?format=csv&gid=0`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Error al obtener datos de Google Sheets: ${response.status}`);
  }
  const csv = await response.text();
  return parseCSV(csv);
}

// ============================================================================
// CONVERT RAW ROWS TO DatoDiario (for DashboardContext)
// ============================================================================

export function rawRowsToDatosDiarios(rows: RawSheetRow[]): DatoDiario[] {
  return rows.map((row) => {
    const ventaTotal = row.venta_cafe + row.venta_hotdesk + row.venta_asesorias;
    const gastoTotal = row.gasto_insumos + row.gasto_staff_fijo;
    return {
      fecha: row.fecha,
      venta_cafe: row.venta_cafe,
      venta_hotdesk: row.venta_hotdesk,
      venta_asesorias: row.venta_asesorias,
      gasto_insumos: row.gasto_insumos,
      gasto_staff_fijo: row.gasto_staff_fijo,
      utilidad_neta: ventaTotal - gastoTotal,
      revpsm: ventaTotal / 25,
    };
  });
}
