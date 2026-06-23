-- Tabella polls
create table polls (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  options text[] not null,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- Tabella votes
create table votes (
  id uuid primary key default gen_random_uuid(),
  poll_id uuid references polls(id) on delete cascade,
  option_index integer not null,
  voter_name text not null,
  created_at timestamptz default now()
);

-- Indice per query e realtime filtrate per poll
create index votes_poll_id_idx on votes(poll_id);

-- RLS disabilitato (app pubblica senza auth)
alter table polls disable row level security;
alter table votes disable row level security;

-- Abilita Realtime sulla tabella votes
alter publication supabase_realtime add table votes;

-- Necessario per ricevere option_index negli eventi DELETE realtime
alter table votes replica identity full;
