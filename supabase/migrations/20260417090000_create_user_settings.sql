create table if not exists public.user_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,

  notifications_enabled boolean not null default true,
  cnh_alert_enabled boolean not null default true,
  fines_alert_enabled boolean not null default true,
  discount_alert_enabled boolean not null default true,
  ipva_alert_enabled boolean not null default true,
  insurance_alert_enabled boolean not null default true,
  maintenance_alert_enabled boolean not null default true,

  ai_extract_documents boolean not null default true,
  ai_financial_copilot boolean not null default false,

  default_state text default 'GO',
  default_discount_percent numeric(5,2) default 40.00,

  theme text default 'dark',
  language text default 'pt-BR',
  currency text default 'BRL',

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.user_settings enable row level security;

drop policy if exists "select own settings" on public.user_settings;
create policy "select own settings"
on public.user_settings
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "insert own settings" on public.user_settings;
create policy "insert own settings"
on public.user_settings
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "update own settings" on public.user_settings;
create policy "update own settings"
on public.user_settings
for update
to authenticated
using (auth.uid() = user_id);

create or replace function public.touch_user_settings_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_touch_user_settings_updated_at on public.user_settings;
create trigger trg_touch_user_settings_updated_at
before update on public.user_settings
for each row
execute function public.touch_user_settings_updated_at();
