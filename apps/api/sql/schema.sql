CREATE TABLE IF NOT EXISTS workspaces (
    id UUID PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS providers (
    id UUID PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tools (
    id UUID PRIMARY KEY,
    provider_id UUID NOT NULL REFERENCES providers(id),
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    pricing_type TEXT NOT NULL,
    capabilities JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS connected_accounts (
    id UUID PRIMARY KEY,
    workspace_id UUID NOT NULL REFERENCES workspaces(id),
    provider_id UUID NOT NULL REFERENCES providers(id),
    status TEXT NOT NULL,
    external_account_id TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (workspace_id, provider_id, external_account_id)
);

CREATE TABLE IF NOT EXISTS provider_subscriptions (
    id UUID PRIMARY KEY,
    connected_account_id UUID NOT NULL REFERENCES connected_accounts(id),
    plan_name TEXT NOT NULL,
    status TEXT NOT NULL,
    verified_at TIMESTAMPTZ,
    verification_source TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS usage_records (
    id UUID PRIMARY KEY,
    workspace_id UUID NOT NULL REFERENCES workspaces(id),
    connected_account_id UUID NOT NULL REFERENCES connected_accounts(id),
    tool_id UUID NOT NULL REFERENCES tools(id),
    request_count INTEGER NOT NULL DEFAULT 0,
    tokens_in INTEGER NOT NULL DEFAULT 0,
    tokens_out INTEGER NOT NULL DEFAULT 0,
    cost_amount NUMERIC(12, 4) NOT NULL DEFAULT 0,
    occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS agent_configs (
    id UUID PRIMARY KEY,
    workspace_id UUID NOT NULL REFERENCES workspaces(id),
    name TEXT NOT NULL,
    model_id TEXT NOT NULL,
    instructions TEXT,
    configuration JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS platform_subscriptions (
    id UUID PRIMARY KEY,
    workspace_id UUID NOT NULL REFERENCES workspaces(id),
    plan_id TEXT NOT NULL,
    status TEXT NOT NULL,
    current_period_end TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY,
    workspace_id UUID NOT NULL REFERENCES workspaces(id),
    actor_id UUID,
    action TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tools_provider_id ON tools (provider_id);
CREATE INDEX IF NOT EXISTS idx_connected_accounts_workspace_id ON connected_accounts (workspace_id);
CREATE INDEX IF NOT EXISTS idx_connected_accounts_provider_id ON connected_accounts (provider_id);
CREATE INDEX IF NOT EXISTS idx_connected_accounts_status ON connected_accounts (status);
CREATE INDEX IF NOT EXISTS idx_usage_records_workspace_id ON usage_records (workspace_id);
CREATE INDEX IF NOT EXISTS idx_usage_records_occurred_at ON usage_records (occurred_at);
CREATE INDEX IF NOT EXISTS idx_agent_configs_workspace_id ON agent_configs (workspace_id);
CREATE INDEX IF NOT EXISTS idx_platform_subscriptions_workspace_id ON platform_subscriptions (workspace_id);
