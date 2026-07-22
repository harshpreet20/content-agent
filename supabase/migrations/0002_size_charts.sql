-- Size charts, managed from the RCC CRM instead of hardcoded in the
-- storefront. Run this manually against the Supabase project (SQL editor,
-- or `mcp__Supabase__apply_migration`) -- nothing here is applied
-- automatically.
--
-- Each chart is a named measurement table (e.g. "Jersey", "Shorts", "Cap").
-- `rows` holds the actual measurements as a JSON array of
-- {label, values: (number|string)[]} objects, one entry per row (Chest,
-- Length, Waist, ...), so the shape of the table is entirely CRM-driven --
-- no code change needed to add a new garment type or measurement row.
--
-- A product opts into 0+ charts via products.size_chart_slugs, replacing
-- the old isJerseyKit name-matching hack in the storefront with an
-- explicit, CRM-managed choice.

create table if not exists public.size_charts (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  sizes text[] not null default '{}',
  nominal numeric[] not null default '{}',
  rows jsonb not null default '[]',
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.products
  add column if not exists size_chart_slugs text[] not null default '{}';

alter table public.size_charts enable row level security;

drop policy if exists "Public read active size charts" on public.size_charts;
create policy "Public read active size charts"
  on public.size_charts for select
  using (active = true);

drop policy if exists "Staff manage size charts" on public.size_charts;
create policy "Staff manage size charts"
  on public.size_charts for all
  using (public.is_commerce_staff())
  with check (public.is_commerce_staff());
