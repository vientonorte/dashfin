-- =============================================================
-- dashfin — Supabase schema para persistencia multi-dispositivo
-- Ejecutar en el SQL Editor de Supabase Dashboard
-- =============================================================

-- 1. Tabla principal de registros mensuales
create table if not exists registros_mensuales (
  id text primary key,
  date date not null,

  -- Línea 1: Cafetería
  venta_cafe_clp numeric default 0,
  cogs_cafe_clp numeric default 0,
  margen_cafe_clp numeric default 0,
  margen_cafe_percent numeric default 0,

  -- Línea 2: Hotdesk/Cowork
  venta_hotdesk_clp numeric default 0,
  cogs_hotdesk_clp numeric default 0,
  margen_hotdesk_clp numeric default 0,
  margen_hotdesk_percent numeric default 0,

  -- Línea 3: Asesorías
  venta_asesoria_clp numeric default 0,
  cogs_asesoria_clp numeric default 0,
  margen_asesoria_clp numeric default 0,
  margen_asesoria_percent numeric default 0,

  -- Consolidado
  venta_total_clp numeric default 0,
  cogs_total_clp numeric default 0,
  margen_bruto_clp numeric default 0,
  margen_bruto_percent numeric default 0,
  gastos_operacion_clp numeric default 0,
  utilidad_neta_clp numeric default 0,
  margen_neto_percent numeric default 0,

  -- KPIs
  roi numeric default 0,
  roi_mean_30d numeric default 0,
  roi_std_30d numeric default 0,
  revpsm_clp_m2 numeric default 0,
  payback_days numeric,
  status text default 'Figura',

  -- Alertas
  alerta_canibalizacion text default '',
  linea_dominante text default 'cafe',
  nota text default '',

  -- Datos diarios (jsonb para flexibilidad)
  datos_diarios jsonb default '[]'::jsonb,

  -- Timestamps
  updated_at timestamptz default now(),
  created_at timestamptz default now()
);

-- 2. Índice por fecha para queries de rango
create index if not exists idx_registros_date on registros_mensuales (date desc);

-- 3. RLS (Row Level Security) — habilitar para producción
-- Por ahora, acceso público con anon key (single-user dashboard)
alter table registros_mensuales enable row level security;

create policy "Allow all for anon" on registros_mensuales
  for all
  using (true)
  with check (true);

-- 4. Función para upsert con updated_at automático
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_updated_at
  before update on registros_mensuales
  for each row execute function update_updated_at();
