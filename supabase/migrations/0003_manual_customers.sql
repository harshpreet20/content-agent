-- Manual/OCR-imported customers, kept separate from the order-derived
-- `customers_view` (which is generated from the orders table and isn't
-- redefined here since its source isn't tracked in this migrations folder).
-- Run this manually against the Supabase project (SQL editor, or
-- `mcp__Supabase__apply_migration`) -- nothing here is applied automatically.
--
-- Staff can bulk-import a customer list (e.g. scanned from a photo via OCR
-- in the dashboard) without those rows needing a matching order. The
-- Customers page merges this table with `customers_view` client-side,
-- deduped by phone.

create table if not exists public.manual_customers (
  id uuid primary key default gen_random_uuid(),
  phone text not null,
  name text,
  email text,
  address text,
  source text not null default 'manual',
  created_at timestamptz not null default now()
);

create unique index if not exists manual_customers_phone_key on public.manual_customers (phone);

alter table public.manual_customers enable row level security;

drop policy if exists "Staff manage manual customers" on public.manual_customers;
create policy "Staff manage manual customers"
  on public.manual_customers for all
  using (public.is_commerce_staff())
  with check (public.is_commerce_staff());
