-- Минимальная схема Supabase для сайта с админкой через Vercel Proxy.
-- Таблицы: settings, requests. Фото машин сохраняются внутри settings как сжатые data-url.

create table if not exists public.settings (
  site_key text primary key default 'main',
  content jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

insert into public.settings (site_key, content)
values ('main', '{}'::jsonb)
on conflict (site_key) do nothing;

create table if not exists public.requests (
  id uuid primary key default gen_random_uuid(),
  name text not null default '',
  phone text not null default '',
  message text default '',
  created_at timestamptz not null default now()
);

grant usage on schema public to anon, authenticated;

grant select on public.settings to anon, authenticated;
grant select, insert, update, delete on public.settings to authenticated;

grant insert on public.requests to anon, authenticated;
grant select, insert, update, delete on public.requests to authenticated;

grant usage, select on all sequences in schema public to anon, authenticated;

alter table public.settings enable row level security;
alter table public.requests enable row level security;

drop policy if exists settings_read_public on public.settings;
create policy settings_read_public
on public.settings
for select
to anon, authenticated
using (true);

drop policy if exists settings_write_auth on public.settings;
create policy settings_write_auth
on public.settings
for all
to authenticated
using (true)
with check (true);

drop policy if exists requests_insert_public on public.requests;
create policy requests_insert_public
on public.requests
for insert
to anon, authenticated
with check (true);

drop policy if exists requests_read_auth on public.requests;
create policy requests_read_auth
on public.requests
for select
to authenticated
using (true);

drop policy if exists requests_delete_auth on public.requests;
create policy requests_delete_auth
on public.requests
for delete
to authenticated
using (true);
