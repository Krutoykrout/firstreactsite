-- Минимальная схема Supabase для сайта с общей админкой.
-- Абстрактные имена: settings, requests, media.

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

alter table public.settings enable row level security;
alter table public.requests enable row level security;

-- Посетители могут читать контент сайта.
drop policy if exists settings_read_public on public.settings;
create policy settings_read_public on public.settings
for select to anon, authenticated using (true);

-- Менять контент может только вошедший админ.
drop policy if exists settings_write_auth on public.settings;
create policy settings_write_auth on public.settings
for all to authenticated using (true) with check (true);

-- Заявку может отправить любой посетитель.
drop policy if exists requests_insert_public on public.requests;
create policy requests_insert_public on public.requests
for insert to anon, authenticated with check (true);

-- Читать и удалять заявки может только админ.
drop policy if exists requests_read_auth on public.requests;
create policy requests_read_auth on public.requests
for select to authenticated using (true);

drop policy if exists requests_delete_auth on public.requests;
create policy requests_delete_auth on public.requests
for delete to authenticated using (true);

-- Публичный bucket для фото машин.
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do update set public = true;

drop policy if exists media_read_public on storage.objects;
create policy media_read_public on storage.objects
for select to anon, authenticated using (bucket_id = 'media');

drop policy if exists media_insert_auth on storage.objects;
create policy media_insert_auth on storage.objects
for insert to authenticated with check (bucket_id = 'media');

drop policy if exists media_update_auth on storage.objects;
create policy media_update_auth on storage.objects
for update to authenticated using (bucket_id = 'media') with check (bucket_id = 'media');

drop policy if exists media_delete_auth on storage.objects;
create policy media_delete_auth on storage.objects
for delete to authenticated using (bucket_id = 'media');
