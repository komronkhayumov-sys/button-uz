-- ==============================================================================
-- BUTTON Men's Wear (button.uz) — Supabase Database Schema
-- Execute this SQL in the Supabase Dashboard -> SQL Editor
-- ==============================================================================

-- 1. PRODUCTS TABLE
create table if not exists public.products (
  id text primary key,
  name text not null,
  name_ru text,
  description text default '',
  description_ru text default '',
  price numeric not null default 0,
  old_price numeric,
  category text not null default 'all',
  image text not null,
  images jsonb default '[]'::jsonb,
  sizes jsonb default '["M", "L", "XL"]'::jsonb,
  colors jsonb default '[]'::jsonb,
  is_available boolean default true,
  is_featured boolean default false,
  badge text,
  created_at timestamptz default now()
);

-- Enable RLS and public access policies
alter table public.products enable row level security;
create policy "Allow public read on products" on public.products for select using (true);
create policy "Allow insert on products" on public.products for insert with check (true);
create policy "Allow update on products" on public.products for update using (true);
create policy "Allow delete on products" on public.products for delete using (true);

-- 2. STORE SETTINGS TABLE
create table if not exists public.settings (
  id text primary key default 'store_settings',
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz default now()
);

alter table public.settings enable row level security;
create policy "Allow public read on settings" on public.settings for select using (true);
create policy "Allow insert/update on settings" on public.settings for all using (true);

-- 3. ORDERS TABLE
create table if not exists public.orders (
  id text primary key,
  customer_id text,
  customer_name text not null,
  customer_phone text not null,
  delivery_type text not null default 'delivery',
  branch_id text,
  branch_name text,
  address text,
  comment text,
  payment_method text not null default 'click',
  payment_status text not null default 'pending',
  payment_receipt text,
  payment_receipt_time text,
  payment_reject_reason text,
  items jsonb not null default '[]'::jsonb,
  total_amount numeric not null default 0,
  status text not null default 'new',
  telegram_sent boolean default false,
  created_at timestamptz default now()
);

alter table public.orders enable row level security;
create policy "Allow public read on orders" on public.orders for select using (true);
create policy "Allow insert on orders" on public.orders for insert with check (true);
create policy "Allow update on orders" on public.orders for update using (true);

-- 4. CUSTOMERS TABLE
create table if not exists public.customers (
  id text primary key,
  name text not null,
  phone text not null unique,
  address text,
  preferred_size text default 'L',
  measurements jsonb default '{}'::jsonb,
  orders_count integer default 0,
  total_spent numeric default 0,
  registered_at timestamptz default now()
);

alter table public.customers enable row level security;
create policy "Allow public read on customers" on public.customers for select using (true);
create policy "Allow insert on customers" on public.customers for insert with check (true);
create policy "Allow update on customers" on public.customers for update using (true);
