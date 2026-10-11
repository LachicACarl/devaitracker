insert into public.models (
  provider_id, name, slug, description, capabilities, pricing, metadata_status
)
select
  provider.id,
  seed.name,
  seed.slug,
  seed.description,
  seed.capabilities::jsonb,
  seed.pricing::jsonb,
  'unverified'
from (
  values
    ('openai', 'GPT-4o', 'gpt-4o', 'Multimodal general-purpose model.', '["text", "vision"]', '{"pricing_status":"unknown"}'),
    ('anthropic', 'Claude 3.5 Sonnet', 'claude-3-5-sonnet', 'Reasoning-focused general-purpose model.', '["text", "coding"]', '{"pricing_status":"unknown"}'),
    ('google-gemini', 'Gemini 1.5 Pro', 'gemini-1-5-pro', 'Long-context multimodal model.', '["text", "vision"]', '{"pricing_status":"unknown"}')
) as seed(provider_slug, name, slug, description, capabilities, pricing)
join public.providers provider on provider.slug = seed.provider_slug
on conflict (slug) do nothing;
