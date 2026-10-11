import { useMemo, useState } from 'react';
import {
  Activity,
  Bell,
  Bot,
  Boxes,
  CheckCircle2,
  ChevronDown,
  CircleHelp,
  Code2,
  Database,
  ExternalLink,
  Gauge,
  LayoutDashboard,
  Menu,
  Moon,
  PlugZap,
  Search,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Users,
  X,
} from 'lucide-react';

type Icon = typeof LayoutDashboard;

type NavItem = {
  label: string;
  href: string;
  icon: Icon;
};

type Provider = {
  name: string;
  kind: string;
  status: 'Not connected' | 'Available';
  capabilities: string[];
};

const navGroups: { label: string; items: NavItem[] }[] = [
  {
    label: 'Workspace',
    items: [
      { label: 'Overview', href: '#overview', icon: LayoutDashboard },
      { label: 'AI Workspace', href: '#workspace', icon: Sparkles },
    ],
  },
  {
    label: 'Discover',
    items: [
      { label: 'API Hub', href: '#api-hub', icon: Boxes },
      { label: 'AI Models', href: '#models', icon: Bot },
      { label: 'AI Agents', href: '#agents', icon: Code2 },
    ],
  },
  {
    label: 'Manage',
    items: [
      { label: 'Connected Accounts', href: '#accounts', icon: PlugZap },
      { label: 'Subscriptions', href: '#subscriptions', icon: ShieldCheck },
      { label: 'Usage Monitor', href: '#usage', icon: Activity },
    ],
  },
];

const providers: Provider[] = [
  { name: 'OpenAI', kind: 'AI models', status: 'Not connected', capabilities: ['Text', 'Vision'] },
  { name: 'Anthropic', kind: 'AI models', status: 'Not connected', capabilities: ['Text', 'Reasoning'] },
  { name: 'Google Gemini', kind: 'AI models', status: 'Not connected', capabilities: ['Text', 'Long context'] },
];

const catalog = [
  { name: 'GitHub API', category: 'Developer tools', pricing: 'Unknown pricing', auth: 'OAuth / token' },
  { name: 'Stripe API', category: 'Payments', pricing: 'Paid API', auth: 'API key' },
  { name: 'Supabase', category: 'Infrastructure', pricing: 'Free tier available', auth: 'API key' },
];

function EmptyState({ title, message, action }: { title: string; message: string; action?: string }) {
  return (
    <div className="empty-state">
      <div className="empty-icon"><CircleHelp size={18} /></div>
      <div>
        <strong>{title}</strong>
        <p>{message}</p>
      </div>
      {action && <button className="text-button">{action}</button>}
    </div>
  );
}

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeHref, setActiveHref] = useState('#overview');
  const [search, setSearch] = useState('');
  const [catalogFilter, setCatalogFilter] = useState('All');

  const filteredCatalog = useMemo(() => {
    const term = search.trim().toLowerCase();
    return catalog.filter((item) => {
      const matchesTerm = !term || `${item.name} ${item.category}`.toLowerCase().includes(term);
      const matchesFilter = catalogFilter === 'All' || item.category === catalogFilter;
      return matchesTerm && matchesFilter;
    });
  }, [catalogFilter, search]);

  const navigate = (href: string) => {
    setActiveHref(href);
    setSidebarOpen(false);
    window.requestAnimationFrame(() => {
      document.querySelector(href)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  return (
    <div className="app-shell">
      {sidebarOpen && <button className="sidebar-backdrop" aria-label="Close navigation" onClick={() => setSidebarOpen(false)} />}
      <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-brand">
          <div className="brand-mark">D</div>
          <div><strong>DevHub AI</strong><small>Developer platform</small></div>
          <button className="mobile-close" aria-label="Close navigation" onClick={() => setSidebarOpen(false)}><X size={18} /></button>
        </div>

        <nav className="sidebar-nav" aria-label="Main navigation">
          {navGroups.map((group) => (
            <div className="nav-group" key={group.label}>
              <span className="nav-group-label">{group.label}</span>
              {group.items.map(({ label, href, icon: NavIcon }) => (
                <a
                  className={activeHref === href ? 'active' : ''}
                  href={href}
                  key={href}
                  onClick={() => navigate(href)}
                >
                  <NavIcon size={16} aria-hidden="true" /> {label}
                </a>
              ))}
            </div>
          ))}
          <div className="nav-group">
            <span className="nav-group-label">Settings</span>
            <a href="#settings" onClick={() => navigate('#settings')}><Settings size={16} aria-hidden="true" /> Workspace settings</a>
            <a href="#preferences" onClick={() => navigate('#preferences')}><SlidersHorizontal size={16} aria-hidden="true" /> Preferences</a>
          </div>
        </nav>

        <div className="sidebar-footer">
          <div className="workspace-avatar">W</div>
          <div><strong>Personal workspace</strong><small>Free plan</small></div>
          <ChevronDown size={15} />
        </div>
      </aside>

      <div className="content-area">
        <header className="topbar">
          <button className="mobile-menu" aria-label="Open navigation" onClick={() => setSidebarOpen(true)}><Menu size={20} /></button>
          <div className="breadcrumbs"><span>Workspace</span><span>/</span><strong>Overview</strong></div>
          <div className="topbar-actions">
            <label className="global-search">
              <Search size={16} aria-hidden="true" />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search workspace" aria-label="Search workspace" />
              <kbd>⌘ K</kbd>
            </label>
            <button className="icon-button" aria-label="Toggle theme"><Moon size={17} /></button>
            <button className="icon-button notification-button" aria-label="Notifications"><Bell size={17} /><span /></button>
            <div className="profile-avatar" aria-label="User profile">L</div>
          </div>
        </header>

        <main>
          <section id="overview" className="page-heading">
            <div>
              <span className="eyebrow">Workspace overview</span>
              <h1>Overview</h1>
              <p>Monitor your AI tools, connected providers, and usage in one place.</p>
            </div>
            <div className="heading-actions">
              <button className="secondary-button" onClick={() => navigate('#models')}><Bot size={16} /> Explore models</button>
              <button className="primary-button" onClick={() => navigate('#accounts')}><PlugZap size={16} /> Connect provider</button>
            </div>
          </section>

          <section className="summary-grid" aria-label="Workspace summary">
            {[
              { label: 'Connected providers', icon: PlugZap, value: '—', note: 'Connect an account to get started' },
              { label: 'Available models', icon: Bot, value: '—', note: 'Requires provider metadata' },
              { label: 'API requests', icon: Activity, value: '—', note: 'No usage records yet' },
              { label: 'Usage cost', icon: Gauge, value: '—', note: 'No cost data available' },
            ].map(({ label, icon: SummaryIcon, value, note }) => (
              <article className="summary-card" key={label}>
                <div className="summary-card-top"><span>{label}</span><SummaryIcon size={17} /></div>
                <strong>{value}</strong>
                <small>{note}</small>
              </article>
            ))}
          </section>

          <section className="overview-grid">
            <article className="surface-card usage-overview">
              <div className="section-header">
                <div><h2>Usage overview</h2><p>Requests and tokens over time</p></div>
                <select aria-label="Usage date range" defaultValue="30"><option value="7">Last 7 days</option><option value="30">Last 30 days</option><option value="90">Last 90 days</option></select>
              </div>
              <EmptyState title="No usage data yet" message="Connect a provider and send a request to see usage trends here." action="Connect provider" />
            </article>

            <article id="accounts" className="surface-card">
              <div className="section-header"><div><h2>Connected providers</h2><p>Manage your provider connections</p></div><a href="#accounts">View all</a></div>
              <div className="provider-list">
                {providers.map((provider) => (
                  <div className="provider-row" key={provider.name}>
                    <div className="provider-logo">{provider.name.slice(0, 1)}</div>
                    <div className="provider-info"><strong>{provider.name}</strong><small>{provider.kind} · {provider.capabilities.join(' / ')}</small></div>
                    <span className="status-tag neutral">{provider.status}</span>
                  </div>
                ))}
              </div>
              <button className="outline-full-button" onClick={() => navigate('#accounts')}><PlugZap size={16} /> Connect a provider</button>
            </article>
          </section>

          <section className="surface-card activity-card">
            <div className="section-header"><div><h2>Recent activity</h2><p>Requests from connected providers</p></div><a href="#usage">Usage monitor</a></div>
            <EmptyState title="No recent activity" message="Your completed AI requests will appear here with provider, model, timing, and cost details." />
          </section>

          <section id="api-hub" className="surface-card catalog-card">
            <div className="section-header">
              <div><span className="eyebrow">Discover</span><h2>API Hub</h2><p>Explore developer APIs with transparent metadata.</p></div>
              <div className="catalog-controls">
                <select aria-label="Filter API catalog" value={catalogFilter} onChange={(event) => setCatalogFilter(event.target.value)}>
                  <option>All</option><option>Developer tools</option><option>Payments</option><option>Infrastructure</option>
                </select>
              </div>
            </div>
            <div className="catalog-list">
              {filteredCatalog.map((item) => (
                <div className="catalog-row" key={item.name}>
                  <div className="catalog-icon"><Database size={17} /></div>
                  <div><strong>{item.name}</strong><small>{item.category} · {item.auth}</small></div>
                  <span className="metadata-badge">Unverified metadata</span>
                  <span className="pricing-label">{item.pricing}</span>
                  <a href="#api-hub" aria-label={`Open ${item.name} details`}><ExternalLink size={16} /></a>
                </div>
              ))}
            </div>
          </section>

          <section id="models" className="surface-card models-card">
            <div className="section-header"><div><span className="eyebrow">Discover</span><h2>AI Models</h2><p>Model availability will appear after provider metadata is synchronized.</p></div><button className="secondary-button" onClick={() => navigate('#workspace')}><Sparkles size={16} /> Open workspace</button></div>
            <EmptyState title="No verified models available" message="Connect a provider or synchronize the catalog to view model capabilities and pricing." />
          </section>

          <section id="workspace" className="workspace-placeholder">
            <div><Sparkles size={18} /><strong>AI Workspace</strong><p>Select a verified model and connected provider to start a conversation.</p></div>
            <button className="secondary-button" onClick={() => navigate('#accounts')}>Manage connections</button>
          </section>
        </main>
      </div>
    </div>
  );
}

export default App;
