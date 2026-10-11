create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 120),
  owner_id uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.workspace_members (
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('owner', 'admin', 'member', 'viewer')),
  created_at timestamptz not null default now(),
  primary key (workspace_id, user_id)
);

create table if not exists public.providers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  status text not null default 'active' check (status in ('active', 'maintenance', 'deprecated')),
  created_at timestamptz not null default now()
);

create table if not exists public.models (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references public.providers(id) on delete restrict,
  name text not null,
  slug text not null unique,
  description text,
  capabilities jsonb not null default '[]'::jsonb,
  pricing jsonb not null default '{}'::jsonb,
  context_window integer,
  documentation_url text,
  metadata_status text not null default 'unverified'
    check (metadata_status in ('verified', 'unverified', 'stale')),
  last_synced_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.api_catalog (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  category text not null,
  documentation_url text,
  website_url text,
  pricing_type text not null default 'unknown'
    check (pricing_type in ('free', 'trial', 'paid', 'open_source', 'unknown')),
  authentication_type text,
  metadata_status text not null default 'unverified'
    check (metadata_status in ('verified', 'unverified', 'stale')),
  last_verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.connected_accounts (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  provider_id uuid not null references public.providers(id) on delete restrict,
  external_account_id text not null,
  status text not null default 'pending'
    check (status in ('connected', 'pending', 'expired', 'revoked', 'error')),
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, provider_id, external_account_id)
);

create table if not exists public.provider_subscriptions (
  id uuid primary key default gen_random_uuid(),
  connected_account_id uuid not null references public.connected_accounts(id) on delete cascade,
  plan_name text,
  status text not null default 'unverified'
    check (status in ('verified', 'unverified', 'unsupported', 'pending', 'error', 'stale')),
  verification_source text,
  verified_at timestamptz,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.usage_records (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  connected_account_id uuid references public.connected_accounts(id) on delete set null,
  provider_id uuid not null references public.providers(id) on delete restrict,
  model_id uuid references public.models(id) on delete set null,
  request_id text,
  occurred_at timestamptz not null default now(),
  input_tokens integer,
  output_tokens integer,
  total_tokens integer generated always as (
    coalesce(input_tokens, 0) + coalesce(output_tokens, 0)
  ) stored,
  duration_ms integer,
  outcome text not null default 'success' check (outcome in ('success', 'failure')),
  provider_cost numeric(14, 6),
  estimated_cost numeric(14, 6),
  currency text not null default 'USD',
  cost_source text not null default 'unknown'
    check (cost_source in ('provider_reported', 'calculated', 'unknown'))
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references public.workspaces(id) on delete cascade,
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_workspace_members_user on public.workspace_members(user_id);
create index if not exists idx_models_provider on public.models(provider_id);
create index if not exists idx_connected_accounts_workspace on public.connected_accounts(workspace_id);
create index if not exists idx_usage_records_workspace_time
  on public.usage_records(workspace_id, occurred_at desc);
create index if not exists idx_audit_logs_workspace_time
  on public.audit_logs(workspace_id, created_at desc);

create or replace function public.is_workspace_member(target_workspace_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.workspace_members
    where workspace_id = target_workspace_id
      and user_id = auth.uid()
  );
$$;

create or replace function public.has_workspace_role(
  target_workspace_id uuid,
  allowed_roles text[]
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.workspace_members
    where workspace_id = target_workspace_id
      and user_id = auth.uid()
      and role = any(allowed_roles)
  );
$$;

alter table public.profiles enable row level security;
alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;
alter table public.providers enable row level security;
alter table public.models enable row level security;
alter table public.api_catalog enable row level security;
alter table public.connected_accounts enable row level security;
alter table public.provider_subscriptions enable row level security;
alter table public.usage_records enable row level security;
alter table public.audit_logs enable row level security;

create policy "Users can view their profile"
  on public.profiles for select using (id = auth.uid());
create policy "Users can update their profile"
  on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());

create policy "Members can view workspaces"
  on public.workspaces for select using (public.is_workspace_member(id));
create policy "Owners can update workspaces"
  on public.workspaces for update
  using (public.has_workspace_role(id, array['owner', 'admin']))
  with check (public.has_workspace_role(id, array['owner', 'admin']));

create policy "Members can view memberships"
  on public.workspace_members for select using (public.is_workspace_member(workspace_id));
create policy "Admins can manage memberships"
  on public.workspace_members for all
  using (public.has_workspace_role(workspace_id, array['owner', 'admin']))
  with check (public.has_workspace_role(workspace_id, array['owner', 'admin']));

create policy "Authenticated users can view providers"
  on public.providers for select to authenticated using (true);
create policy "Authenticated users can view models"
  on public.models for select to authenticated using (true);
create policy "Authenticated users can view API catalog"
  on public.api_catalog for select to authenticated using (true);

create policy "Members can view connected accounts"
  on public.connected_accounts for select using (public.is_workspace_member(workspace_id));
create policy "Admins can manage connected accounts"
  on public.connected_accounts for all
  using (public.has_workspace_role(workspace_id, array['owner', 'admin']))
  with check (public.has_workspace_role(workspace_id, array['owner', 'admin']));

create policy "Members can view subscription status"
  on public.provider_subscriptions for select
  using (exists (
    select 1 from public.connected_accounts account
    where account.id = connected_account_id
      and public.is_workspace_member(account.workspace_id)
  ));

create policy "Members can view usage"
  on public.usage_records for select using (public.is_workspace_member(workspace_id));
create policy "Members can view audit logs"
  on public.audit_logs for select using (public.is_workspace_member(workspace_id));

insert into public.providers (name, slug)
values
  ('OpenAI', 'openai'),
  ('Anthropic', 'anthropic'),
  ('Google Gemini', 'google-gemini'),
  ('OpenRouter', 'openrouter')
on conflict (slug) do nothing;
