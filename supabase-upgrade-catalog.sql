-- RBM ONLINE - UPGRADE PRODUK & PELANGGAN
-- Jalankan sekali di Supabase > SQL Editor

create table if not exists public.product_summaries(
 user_id uuid not null references auth.users(id) on delete cascade,
 product_key text not null,
 name text not null default '',
 unit text not null default 'pcs',
 last_price numeric not null default 0,
 last_cost numeric not null default 0,
 total_qty numeric not null default 0,
 total_revenue numeric not null default 0,
 last_sale timestamptz,
 updated_at timestamptz not null default now(),
 primary key(user_id,product_key)
);

create table if not exists public.customer_summaries(
 user_id uuid not null references auth.users(id) on delete cascade,
 customer_key text not null,
 name text not null default '',
 total_transactions integer not null default 0,
 total_spent numeric not null default 0,
 last_purchase timestamptz,
 updated_at timestamptz not null default now(),
 primary key(user_id,customer_key)
);

create index if not exists product_summaries_user_name_idx on public.product_summaries(user_id,name);
create index if not exists customer_summaries_user_name_idx on public.customer_summaries(user_id,name);

alter table public.product_summaries enable row level security;
alter table public.customer_summaries enable row level security;

grant select,insert,update,delete on public.product_summaries to authenticated;
grant select,insert,update,delete on public.customer_summaries to authenticated;

drop policy if exists product_summaries_own_rows on public.product_summaries;
create policy product_summaries_own_rows on public.product_summaries for all to authenticated using((select auth.uid())=user_id) with check((select auth.uid())=user_id);

drop policy if exists customer_summaries_own_rows on public.customer_summaries;
create policy customer_summaries_own_rows on public.customer_summaries for all to authenticated using((select auth.uid())=user_id) with check((select auth.uid())=user_id);