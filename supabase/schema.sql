-- Esquema del PoC Bocado (Supabase / Postgres)
-- El proyecto ya apunta al backend compartido del MVP.
-- Usa este SQL solo si montas un proyecto propio.

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  price integer not null,
  stock integer not null default 0,
  sold_out boolean not null default false,
  seller text not null,
  intent_count integer not null default 0,
  image_url text,
  category text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.metrics (
  id integer primary key,
  total_intents integer not null default 0,
  inventory_updates integer not null default 0,
  commission_accepted integer not null default 0,
  commission_rejected integer not null default 0,
  useful_yes integer not null default 0,
  useful_no integer not null default 0
);

insert into public.metrics (id)
values (1)
on conflict (id) do nothing;

alter table public.products enable row level security;
alter table public.metrics enable row level security;

create policy "public read products" on public.products for select using (true);
create policy "public insert products" on public.products for insert with check (true);
create policy "public update products" on public.products for update using (true);

create policy "public read metrics" on public.metrics for select using (true);
create policy "public update metrics" on public.metrics for update using (true);

-- Storage: bucket público `product-images` con políticas de lectura/escritura anónimas.
