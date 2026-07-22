-- Product media: multi-image/video support + a public storage bucket for
-- the actual files. Run this manually against the Supabase project (SQL
-- editor, or `mcp__Supabase__apply_migration`) -- nothing here is applied
-- automatically.
--
-- `images[0]` mirrors the legacy `image` column on every write from the
-- CRM, so any existing consumer that only reads `products.image` (e.g. a
-- separate storefront reading this table directly) keeps working
-- unchanged after this migration.

alter table public.products
  add column if not exists images text[] not null default '{}',
  add column if not exists videos text[] not null default '{}';

-- One-time backfill: seed images[] from the existing single `image` column
-- for rows that don't have it yet. Safe to re-run.
update public.products
set images = array[image]
where image is not null and cardinality(images) = 0;

insert into storage.buckets (id, name, public)
values ('product-media', 'product-media', true)
on conflict (id) do nothing;

-- Product photos/videos are storefront-facing content, so anyone can read
-- them; only commerce staff can upload, replace, or remove.
drop policy if exists "Public read product media" on storage.objects;
create policy "Public read product media"
  on storage.objects for select
  using (bucket_id = 'product-media');

drop policy if exists "Staff write product media" on storage.objects;
create policy "Staff write product media"
  on storage.objects for insert
  with check (bucket_id = 'product-media' and public.is_commerce_staff());

drop policy if exists "Staff update product media" on storage.objects;
create policy "Staff update product media"
  on storage.objects for update
  using (bucket_id = 'product-media' and public.is_commerce_staff());

drop policy if exists "Staff delete product media" on storage.objects;
create policy "Staff delete product media"
  on storage.objects for delete
  using (bucket_id = 'product-media' and public.is_commerce_staff());
