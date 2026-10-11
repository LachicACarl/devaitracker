alter table public.providers
  add column if not exists is_public boolean not null default false;

alter table public.models
  add column if not exists is_public boolean not null default false;

alter table public.api_catalog
  add column if not exists is_public boolean not null default false;

create index if not exists idx_providers_public_status
  on public.providers(status)
  where is_public = true;

create index if not exists idx_models_public_provider
  on public.models(provider_id)
  where is_public = true;

create index if not exists idx_api_catalog_public_category
  on public.api_catalog(category)
  where is_public = true;

create policy "Anonymous users can view published providers"
  on public.providers for select to anon
  using (is_public = true and status = 'active');

create policy "Anonymous users can view published models"
  on public.models for select to anon
  using (is_public = true and metadata_status in ('verified', 'unverified', 'stale'));

create policy "Anonymous users can view published API catalog"
  on public.api_catalog for select to anon
  using (is_public = true and metadata_status in ('verified', 'unverified', 'stale'));
