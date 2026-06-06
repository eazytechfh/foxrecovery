create table if not exists cadastros (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  cpf text,
  email text,
  name text not null,
  genero text,
  age integer,
  weight numeric,
  height numeric,
  state text,
  surgeon text,
  selected_surgeries jsonb default '[]',
  prev_surgery boolean default false,
  prev_surgery_desc text,
  notes text,
  op_date date,
  op_time time,
  drain_date date,
  klexane boolean default false,
  klexane_start date,
  klexane_end date,
  meia boolean default false,
  meia_start date,
  malha boolean default false,
  malha_start date,
  dreno boolean default false,
  dreno_retirada date,
  placa boolean default false,
  placa_start date,
  eletroterapia jsonb default '[]'
);

create index if not exists cadastros_cpf_idx on cadastros (cpf);
create index if not exists cadastros_email_idx on cadastros (email);

create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_updated_at on cadastros;
create trigger set_updated_at
before update on cadastros
for each row execute function update_updated_at();

alter table cadastros enable row level security;

drop policy if exists "insert_anon" on cadastros;
drop policy if exists "select_anon" on cadastros;
drop policy if exists "update_anon" on cadastros;

create policy "insert_anon" on cadastros for insert to anon with check (true);
create policy "select_anon" on cadastros for select to anon using (true);
create policy "update_anon" on cadastros for update to anon using (true);
