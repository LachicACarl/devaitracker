# Database schema

The Supabase schema is versioned in [`supabase/migrations`](../supabase/migrations). Apply it with the Supabase CLI or the SQL editor in a development project before enabling database-backed features.

The initial migration defines:

- Auth-linked profiles, workspaces, memberships, and roles.
- Provider and model catalog metadata.
- API catalog records.
- Connected accounts and explicit subscription verification states.
- Usage records that distinguish provider-reported and calculated cost.
- Workspace-scoped audit logs.

Row-level security is enabled for every user-accessible table. Workspace data is gated by membership, while catalog data is readable by authenticated users. Persistent provider credentials are intentionally not represented in this first migration; credential encryption and key management must be configured before adding that capability.

## Local setup

```powershell
supabase start
supabase db reset
```

The seed file contains deliberately unverified catalog metadata. It must not be presented as verified provider pricing or availability.
