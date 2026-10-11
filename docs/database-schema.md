# Database schema

The Supabase schema is versioned in [`supabase/migrations`](../supabase/migrations). Apply it with the Supabase CLI or the SQL editor in a development project before enabling database-backed features.

## Project safety check

Before running any migration, confirm that the application configuration and the Supabase dashboard point at the same project. The frontend uses `VITE_SUPABASE_URL` from `.env`; the backend uses `SUPABASE_URL` from `apps/api/.env`. The project ref is the subdomain in the Supabase URL, for example:

```text
https://<project-ref>.supabase.co
```

Do not apply these migrations until the intended project ref is confirmed. If the Supabase CLI lists a different project than the app configuration, resolve that mismatch first.

The initial migration defines:

- Auth-linked profiles, workspaces, memberships, and roles.
- Provider and model catalog metadata.
- API catalog records.
- Connected accounts and explicit subscription verification states.
- Usage records that distinguish provider-reported and calculated cost.
- Workspace-scoped audit logs.

Row-level security is enabled for every user-accessible table. Workspace data is gated by membership, while catalog data is readable by authenticated users. Persistent provider credentials are intentionally not represented in this first migration; credential encryption and key management must be configured before adding that capability.

The separate legacy SQL draft at [`apps/api/sql/schema.sql`](../apps/api/sql/schema.sql) is not the source of truth for Supabase migrations. It mentions tables that the current migration does not create, including `agent_configs`, `platform_subscriptions`, and `tools`. Current application code does not reference `agent_configs`; do not add it to readiness requirements until a feature or repository actually depends on it.

## Credential rotation

The service-role key must be treated as compromised if it has been pasted into chat, logs, screenshots, or any shared document. Rotate it in the Supabase dashboard before using privileged backend operations.

Rotation procedure:

1. Open the confirmed Supabase project.
2. Rotate or revoke the exposed service-role key.
3. Store the replacement only in server-side secret storage or `apps/api/.env` for local development.
4. Never add the service-role key to `.env`, `VITE_*` variables, frontend code, Git, or chat.
5. Restart backend processes that legitimately require the replacement key.

The current backend does not perform privileged Supabase operations, so `SUPABASE_SERVICE_ROLE_KEY` can remain unset until a server-only feature needs it.

## Required configuration

Current frontend configuration:

- `VITE_API_BASE_URL`: required for frontend calls to the FastAPI backend.
- `VITE_SUPABASE_URL`: required before frontend Supabase features can be enabled.
- `VITE_SUPABASE_ANON_KEY`: required before frontend Supabase features can be enabled.

Current backend configuration:

- `SUPABASE_URL`: required by the database readiness check.
- `SUPABASE_ANON_KEY`: required by the database readiness check.
- `SUPABASE_SERVICE_ROLE_KEY`: optional in the current implementation. Keep it server-only when future privileged operations need it.
- `DATABASE_URL`: optional in the current implementation. Use it only for trusted backend database access, never in frontend code.

Never print, commit, or expose secret values. The service-role key must not be used in frontend code.

## Readiness check

The API exposes:

```text
GET /api/v1/readiness/database
```

It verifies required Supabase configuration and checks whether the current database dependencies are reachable. It reports table and configuration status without returning any configured key values.

The current check includes `providers`, `models`, and `api_catalog`, which are created by the initial Supabase migration. This endpoint reports database readiness only; it does not mean every application feature, auth flow, provider integration, or background job is production-ready.

The initial RLS policies make catalog tables readable by authenticated users. The current frontend does not yet include authentication, so unauthenticated browser reads may report permission errors after the tables exist.

If the API Hub should be public before login, review and apply [`supabase/migrations/20261011162000_public_catalog_read_access.sql`](../supabase/migrations/20261011162000_public_catalog_read_access.sql) after the initial schema. This migration adds `is_public` flags and anonymous read policies scoped to intentionally published rows only. It does not grant anonymous access to workspaces, connected accounts, subscriptions, usage records, audit logs, profiles, or credentials.

Rows are private by default after this migration. Publish only reviewed catalog metadata, for example:

```sql
update public.api_catalog
set is_public = true
where slug in ('reviewed-api-slug');
```

Use similarly explicit updates for `providers` and `models` if those records should be visible before login.

## Manual migration procedure

1. Confirm the intended Supabase project ref in the dashboard.
2. Confirm `.env` and `apps/api/.env` point at that same project.
3. Open the SQL editor for that confirmed project.
4. Review and run [`supabase/migrations/20261011150000_initial_schema.sql`](../supabase/migrations/20261011150000_initial_schema.sql).
5. If public pre-login catalog access is intended, review and run [`supabase/migrations/20261011162000_public_catalog_read_access.sql`](../supabase/migrations/20261011162000_public_catalog_read_access.sql).
6. Review and run [`supabase/seed.sql`](../supabase/seed.sql) only if unverified seed metadata is appropriate for the environment.
7. Insert or import reviewed `api_catalog` records. Set `is_public = true` only for records intended to be visible before login.
8. Run `GET /api/v1/readiness/database` and confirm any remaining issues are expected.
9. Run the local build and backend tests.

## Local setup

```powershell
supabase start
supabase db reset
```

The seed file contains deliberately unverified catalog metadata. It must not be presented as verified provider pricing or availability.
