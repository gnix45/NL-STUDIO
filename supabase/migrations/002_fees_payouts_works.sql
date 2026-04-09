-- 002_fees_payouts_works.sql

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

create table if not exists public.works (
  id uuid primary key default uuid_generate_v4(),
  label text not null,
  title text not null,
  description text,
  color text not null default '#1A1A1A',
  image_url text,
  order_index integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.works enable row level security;
create policy "Public view works" on public.works for select using (active = true);

create table if not exists public.withdrawals (
  id uuid primary key default uuid_generate_v4(),
  amount integer not null,
  fee integer not null,
  net_amount integer not null,
  phone text not null,
  status text not null default 'pending', -- pending, successful, failed
  fapshi_trans_id text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.withdrawals enable row level security;
-- Service role bypasses RLS, avoiding additional complex policies for admins 
-- (as long as we fetch using the service role in /api/admin/withdrawals routes).

-- Add a trigger to automatically update updated_at for withdrawals
create trigger update_withdrawals_updated_at
  before update on public.withdrawals
  for each row
  execute function update_updated_at_column();
