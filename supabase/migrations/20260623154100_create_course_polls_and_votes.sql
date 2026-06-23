create table course_polls (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  options text[] not null,
  is_active boolean default true,
  created_at timestamptz default now()
);

create table course_votes (
  id uuid primary key default gen_random_uuid(),
  poll_id uuid references course_polls(id) on delete cascade,
  option_index integer not null,
  voter_name text not null,
  created_at timestamptz default now()
);

alter table course_polls disable row level security;
alter table course_votes disable row level security;

alter publication supabase_realtime add table course_votes;
