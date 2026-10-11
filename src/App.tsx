type Stat = {
  label: string;
  value: string;
  note: string;
};

type ApiCard = {
  name: string;
  category: string;
  status: string;
  description: string;
  latency: string;
};

type ModelCard = {
  name: string;
  provider: string;
  mode: string;
  cost: string;
  availability: string;
};

type Provider = {
  name: string;
  kind: string;
  status: string;
  plan: string;
};

const stats: Stat[] = [
  { label: 'Connected APIs', value: '128', note: '+18 this month' },
  { label: 'AI models', value: '24', note: '7 active workspaces' },
  { label: 'Accounts', value: '6', note: '2 team-linked' },
  { label: 'Usage spend', value: '$1,240', note: '12.4% under budget' },
];

const apiCards: ApiCard[] = [
  {
    name: 'GitHub API',
    category: 'Developer Tools',
    status: 'Healthy',
    description: 'Repository metadata, issue sync, and workflow automation.',
    latency: '240 ms',
  },
  {
    name: 'Stripe',
    category: 'Payments',
    status: 'Healthy',
    description: 'Billing events and subscription state monitoring for teams.',
    latency: '180 ms',
  },
  {
    name: 'OpenAI',
    category: 'AI Models',
    status: 'Burst ready',
    description: 'Model access, token tracking, and rate-limit controls.',
    latency: '350 ms',
  },
  {
    name: 'PubNub',
    category: 'Realtime',
    status: 'Watching',
    description: 'Events, notifications, and collaborative agent updates.',
    latency: '95 ms',
  },
];

const modelCards: ModelCard[] = [
  { name: 'GPT-4o', provider: 'OpenAI', mode: 'Chat + Vision', cost: '$0.06 / 1K tokens', availability: 'Available' },
  { name: 'Claude 3.5 Sonnet', provider: 'Anthropic', mode: 'Reasoning', cost: '$0.08 / 1K tokens', availability: 'Available' },
  { name: 'Gemini 1.5 Pro', provider: 'Google', mode: 'Long context', cost: '$0.04 / 1K tokens', availability: 'Queued' },
  { name: 'Llama 3.1 70B', provider: 'Together AI', mode: 'Open model', cost: '$0.03 / 1K tokens', availability: 'Available' },
];

const providers: Provider[] = [
  { name: 'GitHub', kind: 'Source code', status: 'Connected', plan: 'Team Pro' },
  { name: 'OpenAI', kind: 'Model access', status: 'Connected', plan: 'Usage-based' },
  { name: 'Anthropic', kind: 'Reasoning models', status: 'Connecting', plan: 'Trial' },
  { name: 'Supabase', kind: 'Postgres + Auth', status: 'Connected', plan: 'Pro' },
];

const usageBars = [72, 91, 64, 84, 58, 76, 88];

function App() {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-mark">D</div>
          <div>
            <strong>DevHub AI</strong>
            <small>Developer tools, connected</small>
          </div>
        </div>

        <nav className="sidebar-nav" aria-label="Main navigation">
          <a href="#api-hub">API Hub</a>
          <a href="#workspace">AI Workspace</a>
          <a href="#accounts">Accounts</a>
          <a href="#usage">Usage Monitor</a>
        </nav>

        <div className="sidebar-footer">
          <span className="status-dot" />
          <div>
            <strong>All systems healthy</strong>
            <small>Free-first workspace</small>
          </div>
        </div>
      </aside>

      <div className="content-area">
        <header className="topbar">
          <div>
            <span className="eyebrow">Workspace overview</span>
            <h1>Good afternoon, developer.</h1>
          </div>
          <button className="primary-button">Launch dashboard</button>
        </header>

        <main>
        <section className="hero">
          <div className="hero-copy">
            <span className="eyebrow">Free-first platform</span>
            <h1>One unified developer platform for APIs, models, and usage.</h1>
            <p>
              Discover tools, connect provider accounts, monitor quotas, and manage AI work in one shared dashboard.
            </p>

            <div className="hero-actions">
              <button className="primary-button">Get started</button>
              <button className="secondary-button">View architecture</button>
            </div>

            <div className="hero-pills">
              <span>Marketplace</span>
              <span>Workbench</span>
              <span>Usage tracking</span>
            </div>
          </div>

          <div className="hero-panel">
            <div className="panel-header">
              <span className="status-dot" />
              Platform health
            </div>

            <div className="chart">
              {usageBars.map((value, index) => (
                <div key={index} className="bar-group">
                  <div className="bar" style={{ height: `${value}%` }} />
                </div>
              ))}
            </div>

            <div className="metric-grid">
              <div>
                <small>Requests</small>
                <strong>1.4M</strong>
              </div>
              <div>
                <small>Active agents</small>
                <strong>38</strong>
              </div>
              <div>
                <small>Avg. latency</small>
                <strong>268 ms</strong>
              </div>
            </div>
          </div>
        </section>

        <section className="stats-grid">
          {stats.map((stat) => (
            <article key={stat.label} className="stat-card">
              <span>{stat.label}</span>
              <strong>{stat.value}</strong>
              <small>{stat.note}</small>
            </article>
          ))}
        </section>

        <section id="api-hub" className="content-block">
          <div className="section-header">
            <div>
              <span className="eyebrow">API Hub</span>
              <h2>Discover and test APIs</h2>
            </div>
            <a href="#">Browse catalog</a>
          </div>

          <div className="card-grid">
            {apiCards.map((api) => (
              <article key={api.name} className="feature-card">
                <div className="feature-header">
                  <div>
                    <strong>{api.name}</strong>
                    <small>{api.category}</small>
                  </div>
                  <span className="pill success">{api.status}</span>
                </div>
                <p>{api.description}</p>
                <div className="meta-row">
                  <span>Latency</span>
                  <strong>{api.latency}</strong>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="workspace" className="content-block">
          <div className="section-header">
            <div>
              <span className="eyebrow">AI Workspace</span>
              <h2>Models and agent runs</h2>
            </div>
            <a href="#">Open workspace</a>
          </div>

          <div className="card-grid models-grid">
            {modelCards.map((model) => (
              <article key={model.name} className="feature-card compact">
                <div className="feature-header">
                  <div>
                    <strong>{model.name}</strong>
                    <small>{model.provider}</small>
                  </div>
                  <span className="pill neutral">{model.availability}</span>
                </div>
                <div className="meta-stack">
                  <span>{model.mode}</span>
                  <strong>{model.cost}</strong>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="accounts" className="content-block split-layout">
          <div>
            <div className="section-header narrow">
              <div>
                <span className="eyebrow">Accounts</span>
                <h2>Personal and team connections</h2>
              </div>
            </div>

            <div className="provider-list">
              {providers.map((provider) => (
                <div key={provider.name} className="provider-row">
                  <div>
                    <strong>{provider.name}</strong>
                    <small>{provider.kind}</small>
                  </div>
                  <span className="status-tag">{provider.status}</span>
                  <span className="plan-tag">{provider.plan}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="data-card">
            <h3>Platform principles</h3>
            <ul>
              <li>One shared interface over multiple independent providers.</li>
              <li>Provider adapters keep integrations isolated and replaceable.</li>
              <li>Usage data and account state remain auditable and secure.</li>
            </ul>
          </div>
        </section>

        <section id="usage" className="content-block">
          <div className="section-header">
            <div>
              <span className="eyebrow">Usage Monitor</span>
              <h2>Requests, quotas and costs</h2>
            </div>
            <a href="#">Download report</a>
          </div>

          <div className="usage-layout">
            <div className="usage-card">
              <div className="usage-header-row">
                <span>Monthly spend</span>
                <strong>$1,240</strong>
              </div>
              <div className="mini-bars" aria-label="Monthly usage chart">
                {[35, 48, 62, 39, 71, 84, 90].map((value, index) => (
                  <span key={index} style={{ height: `${value}%` }} />
                ))}
              </div>
            </div>

            <div className="usage-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Provider</th>
                    <th>Usage</th>
                    <th>Cost</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>OpenAI</td>
                    <td>41%</td>
                    <td>$480</td>
                  </tr>
                  <tr>
                    <td>Anthropic</td>
                    <td>28%</td>
                    <td>$290</td>
                  </tr>
                  <tr>
                    <td>GitHub</td>
                    <td>16%</td>
                    <td>$160</td>
                  </tr>
                  <tr>
                    <td>Other APIs</td>
                    <td>15%</td>
                    <td>$310</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="content-block architecture-block">
          <div className="section-header">
            <div>
              <span className="eyebrow">System architecture</span>
              <h2>Modular and provider-agnostic</h2>
            </div>
          </div>

          <div className="architecture-grid">
            <div className="architecture-item">Frontend</div>
            <div className="architecture-item">Dashboard</div>
            <div className="architecture-item">Provider adapters</div>
            <div className="architecture-item">API gateway</div>
            <div className="architecture-item">Usage engine</div>
            <div className="architecture-item">Supabase</div>
          </div>
        </section>
        </main>
      </div>
    </div>
  );
}

export default App;
