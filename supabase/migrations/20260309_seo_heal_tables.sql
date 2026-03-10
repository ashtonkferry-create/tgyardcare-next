-- Self-Healing SEO System tables
-- Design: docs/plans/2026-03-09-self-healing-seo-design.md

-- Queue of detected issues awaiting auto-fix
create table if not exists seo_heal_queue (
  id uuid default gen_random_uuid() primary key,
  url text not null,
  issue_type text not null,
  severity text not null default 'standard',
  details jsonb default '{}',
  status text not null default 'pending',
  fixed_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(url, issue_type)
);

-- Permanent audit trail of all auto-fix actions
create table if not exists seo_heal_log (
  id uuid default gen_random_uuid() primary key,
  action text not null,
  url text not null,
  issue_type text,
  before_state jsonb default '{}',
  after_state jsonb default '{}',
  created_at timestamptz default now()
);

-- Dynamic redirects created by the heal system
create table if not exists seo_redirects (
  id uuid default gen_random_uuid() primary key,
  source_path text not null unique,
  destination_path text not null,
  status_code int default 301,
  created_by text default 'seo-heal',
  hit_count int default 0,
  created_at timestamptz default now()
);

-- Indexes for performance
create index if not exists idx_seo_heal_queue_status on seo_heal_queue(status);
create index if not exists idx_seo_heal_queue_url on seo_heal_queue(url);
create index if not exists idx_seo_heal_log_created on seo_heal_log(created_at desc);
create index if not exists idx_seo_redirects_source on seo_redirects(source_path);

-- RLS: service role only (cron routes use service role key)
alter table seo_heal_queue enable row level security;
alter table seo_heal_log enable row level security;
alter table seo_redirects enable row level security;

create policy "Service role full access" on seo_heal_queue for all using (true) with check (true);
create policy "Service role full access" on seo_heal_log for all using (true) with check (true);
create policy "Service role full access" on seo_redirects for all using (true) with check (true);

-- RPC for atomic hit_count increment (used by middleware)
create or replace function increment_redirect_hit(p_source text)
returns void as $$
begin
  update seo_redirects set hit_count = hit_count + 1 where source_path = p_source;
end;
$$ language plpgsql security definer;
