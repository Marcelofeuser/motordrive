create table if not exists public.maintenance (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null default current_date,
  category text not null default 'Outros',
  tipo text,
  valor numeric(10,2) not null default 0,
  km numeric(10,0) default 0,
  obs text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.maintenance enable row level security;

create policy "select own maintenance" on public.maintenance for select to authenticated using (auth.uid() = user_id);
create policy "insert own maintenance" on public.maintenance for insert to authenticated with check (auth.uid() = user_id);
create policy "delete own maintenance" on public.maintenance for delete to authenticated using (auth.uid() = user_id);
