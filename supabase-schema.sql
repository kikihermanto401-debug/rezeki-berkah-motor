create table if not exists public.transactions(user_id uuid not null references auth.users(id) on delete cascade,id text not null,date timestamptz not null default now(),customer text not null default 'Umum',name text not null default '',notes text not null default '',qty integer not null default 1,unit text not null default 'pcs',price numeric not null default 0,cost numeric not null default 0,created_at timestamptz not null default now(),primary key(user_id,id));
create table if not exists public.cash_flows(user_id uuid not null references auth.users(id) on delete cascade,id text not null,date timestamptz not null default now(),type text not null check(type in('in','out')),amount numeric not null default 0,notes text not null default '',created_at timestamptz not null default now(),primary key(user_id,id));
create table if not exists public.store_profiles(user_id uuid primary key references auth.users(id) on delete cascade,store_name text not null default 'Rezeki Berkah Motor',phone text not null default '',address text not null default '',updated_at timestamptz not null default now());
create table if not exists public.app_backups(id bigint generated always as identity primary key,user_id uuid not null references auth.users(id) on delete cascade,payload jsonb not null default '{}'::jsonb,created_at timestamptz not null default now());

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

create index if not exists transactions_user_date_idx on public.transactions(user_id,date desc);
create index if not exists cash_flows_user_date_idx on public.cash_flows(user_id,date desc);
create index if not exists app_backups_user_created_idx on public.app_backups(user_id,created_at desc);
create index if not exists product_summaries_user_name_idx on public.product_summaries(user_id,name);
create index if not exists customer_summaries_user_name_idx on public.customer_summaries(user_id,name);

alter table public.transactions enable row level security;
alter table public.cash_flows enable row level security;
alter table public.store_profiles enable row level security;
alter table public.app_backups enable row level security;
alter table public.product_summaries enable row level security;
alter table public.customer_summaries enable row level security;

grant select,insert,update,delete on public.transactions to authenticated;
grant select,insert,update,delete on public.cash_flows to authenticated;
grant select,insert,update,delete on public.store_profiles to authenticated;
grant select,insert,delete on public.app_backups to authenticated;
grant select,insert,update,delete on public.product_summaries to authenticated;
grant select,insert,update,delete on public.customer_summaries to authenticated;

drop policy if exists transactions_own_rows on public.transactions;
create policy transactions_own_rows on public.transactions for all to authenticated using((select auth.uid())=user_id) with check((select auth.uid())=user_id);
drop policy if exists cash_flows_own_rows on public.cash_flows;
create policy cash_flows_own_rows on public.cash_flows for all to authenticated using((select auth.uid())=user_id) with check((select auth.uid())=user_id);
drop policy if exists store_profiles_own_row on public.store_profiles;
create policy store_profiles_own_row on public.store_profiles for all to authenticated using((select auth.uid())=user_id) with check((select auth.uid())=user_id);
drop policy if exists app_backups_own_rows on public.app_backups;
create policy app_backups_own_rows on public.app_backups for all to authenticated using((select auth.uid())=user_id) with check((select auth.uid())=user_id);
drop policy if exists product_summaries_own_rows on public.product_summaries;
create policy product_summaries_own_rows on public.product_summaries for all to authenticated using((select auth.uid())=user_id) with check((select auth.uid())=user_id);
drop policy if exists customer_summaries_own_rows on public.customer_summaries;
create policy customer_summaries_own_rows on public.customer_summaries for all to authenticated using((select auth.uid())=user_id) with check((select auth.uid())=user_id);