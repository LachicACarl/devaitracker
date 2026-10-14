import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Activity,
  Bell,
  Bot,
  Boxes,
  ChevronDown,
  CircleHelp,
  Code2,
  Cpu,
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
  X,
} from 'lucide-react';
import { isSupabaseConfigured, supabase } from './lib/supabase';
import ElectronicsExplorer from './ElectronicsExplorer';

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

type ApiCatalogRecord = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category: string;
  documentation_url: string | null;
  website_url: string | null;
  pricing_type: 'free' | 'trial' | 'paid' | 'open_source' | 'unknown';
  authentication_type: string | null;
  metadata_status: 'verified' | 'unverified' | 'stale';
  is_public: boolean;
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
      { label: 'Electronics Explorer', href: '#electronics-explorer', icon: Cpu },
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

const pricingLabels: Record<ApiCatalogRecord['pricing_type'], string> = {
  free: 'Free',
  trial: 'Trial available',
  paid: 'Paid API',
  open_source: 'Open source',
  unknown: 'Unknown pricing',
};

const metadataLabels: Record<ApiCatalogRecord['metadata_status'], string> = {
  verified: 'Verified',
  unverified: 'Unverified metadata',
  stale: 'Needs review',
};

function catalogErrorMessage(message: string) {
  const lowerMessage = message.toLowerCase();
  if (lowerMessage.includes('permission') || lowerMessage.includes('row-level security') || lowerMessage.includes('403')) {
    return 'Catalog records are not readable with the current permissions.';
  }
  if (lowerMessage.includes('failed to fetch') || lowerMessage.includes('network')) {
    return 'The catalog could not be reached. Check the network and Supabase project configuration.';
  }
  if (lowerMessage.includes('could not find the table') || lowerMessage.includes('schema cache')) {
    return 'The catalog table is missing. Apply the reviewed Supabase migrations first.';
  }
  return message;
}

function EmptyState({ title, message, action, onAction }: { title: string; message: string; action?: string; onAction?: () => void }) {
  return (
    <div className="empty-state">
      <div className="empty-icon"><CircleHelp size={18} /></div>
      <div>
        <strong>{title}</strong>
        <p>{message}</p>
      </div>
      {action && onAction && <button className="text-button" onClick={onAction}>{action}</button>}
    </div>
  );
}

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeHref, setActiveHref] = useState('#overview');
  const [search, setSearch] = useState('');
  const [catalogFilter, setCatalogFilter] = useState('All');
  const [catalogItems, setCatalogItems] = useState<ApiCatalogRecord[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(isSupabaseConfigured);
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(false);

  const loadCatalog = useCallback(async () => {
    if (!supabase) {
      setCatalogLoading(false);
      setCatalogError('Supabase is not configured for this environment.');
      return;
    }

    setCatalogLoading(true);
    setCatalogError(null);
    const { data, error } = await supabase
      .from('api_catalog')
      .select('id,name,slug,description,category,documentation_url,website_url,pricing_type,authentication_type,metadata_status,is_public')
      .eq('is_public', true)
      .order('name', { ascending: true });

    if (error) {
      setCatalogItems([]);
      setCatalogError(catalogErrorMessage(error.message));
    } else {
      setCatalogItems((data ?? []) as ApiCatalogRecord[]);
    }
    setCatalogLoading(false);
  }, []);

  useEffect(() => {
    void loadCatalog();
  }, [loadCatalog]);

  useEffect(() => {
    if (!notice) {
      return;
    }
    const timeout = window.setTimeout(() => setNotice(null), 3500);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  useEffect(() => {
    document.title = darkMode ? 'DevHub AI (dark preview)' : 'DevHub AI';
  }, [darkMode]);

  const catalogCategories = useMemo(() => {
    return ['All', ...Array.from(new Set(catalogItems.map((item) => item.category))).sort()];
  }, [catalogItems]);

  const filteredCatalog = useMemo(() => {
    const term = search.trim().toLowerCase();
    return catalogItems.filter((item) => {
      const searchable = [
        item.name,
        item.category,
        item.description,
        item.authentication_type,
      ].filter(Boolean).join(' ').toLowerCase();
      const matchesTerm = !term || searchable.includes(term);
      const matchesFilter = catalogFilter === 'All' || item.category === catalogFilter;
      return matchesTerm && matchesFilter;
    });
  }, [catalogFilter, catalogItems, search]);

  const navigate = (href: string) => {
    setActiveHref(href);
    setSidebarOpen(false);
    window.requestAnimationFrame(() => {
      document.querySelector(href)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  return (
    <div className={`app-shell ${darkMode ? 'dark-preview' : ''}`}>
      {notice && <div className="toast" role="status">{notice}</div>}
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

        <button className="sidebar-footer" onClick={() => setNotice('Workspace switching will be available with multi-workspace support')}>
          <div className="workspace-avatar">W</div>
          <div><strong>Personal workspace</strong><small>Free plan</small></div>
          <ChevronDown size={15} />
        </button>
      </aside>

      <div className="content-area">
        <header className="topbar">
          <button className="mobile-menu" aria-label="Open navigation" onClick={() => setSidebarOpen(true)}><Menu size={20} /></button>
          <div className="breadcrumbs"><span>Workspace</span><span>/</span><strong>Overview</strong></div>
          <div className="topbar-actions">
            <label className="global-search">
              <Search size={16} aria-hidden="true" />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search workspace" aria-label="Search workspace" />
              <kbd>Ctrl K</kbd>
            </label>
            <button className="icon-button" aria-label="Toggle theme" title="Toggle theme" onClick={() => setDarkMode((current) => !current)}><Moon size={17} /></button>
            <button className="icon-button notification-button" aria-label="Notifications" title="Notifications" onClick={() => setNotice('No new notifications')}><Bell size={17} /><span /></button>
            <button className="profile-avatar" aria-label="Open user profile" title="User profile" onClick={() => setNotice('Profile settings are not available until authentication is enabled')}>L</button>
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
              { label: 'Connected providers', icon: PlugZap, value: '-', note: 'Connect an account to get started' },
              { label: 'Available models', icon: Bot, value: '-', note: 'Requires provider metadata' },
              { label: 'API requests', icon: Activity, value: '-', note: 'No usage records yet' },
              { label: 'Usage cost', icon: Gauge, value: '-', note: 'No cost data available' },
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
              <EmptyState title="No usage data yet" message="Connect a provider and send a request to see usage trends here." action="Connect provider" onAction={() => navigate('#accounts')} />
            </article>

            <article id="accounts" className="surface-card">
              <div className="section-header"><div><h2>Connected providers</h2><p>Manage your provider connections</p></div><a href="#accounts">View all</a></div>
              <div className="provider-list">
                {providers.map((provider) => (
                  <div className="provider-row" key={provider.name}>
                    <div className="provider-logo">{provider.name.slice(0, 1)}</div>
                    <div className="provider-info"><strong>{provider.name}</strong><small>{provider.kind} / {provider.capabilities.join(' / ')}</small></div>
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
                  {catalogCategories.map((category) => <option key={category}>{category}</option>)}
                </select>
              </div>
            </div>
            {catalogLoading && <EmptyState title="Loading API catalog" message="Retrieving catalog records from Supabase." />}
            {!catalogLoading && catalogError && (
              <EmptyState title="Catalog unavailable" message={catalogError} action="Retry" onAction={() => void loadCatalog()} />
            )}
            {!catalogLoading && !catalogError && filteredCatalog.length === 0 && (
              <EmptyState
                title={catalogItems.length === 0 ? 'No APIs in the catalog' : 'No matching APIs'}
                message={catalogItems.length === 0 ? 'Apply the database migration and add catalog records to show APIs here.' : 'Adjust search or category filters to broaden the results.'}
              />
            )}
            {!catalogLoading && !catalogError && filteredCatalog.length > 0 && (
              <div className="catalog-list">
                {filteredCatalog.map((item) => (
                  <div className="catalog-row" key={item.id}>
                    <div className="catalog-icon"><Database size={17} /></div>
                    <div>
                      <strong>{item.name}</strong>
                      <small>{item.category} / {item.authentication_type ?? 'Auth unknown'}</small>
                    </div>
                    <span className={`metadata-badge metadata-${item.metadata_status}`}>{metadataLabels[item.metadata_status]}</span>
                    <span className="pricing-label">{pricingLabels[item.pricing_type]}</span>
                    {item.documentation_url || item.website_url ? (
                      <a href={item.documentation_url ?? item.website_url ?? undefined} aria-label={`Open ${item.name} documentation`} target="_blank" rel="noreferrer"><ExternalLink size={16} /></a>
                    ) : (
                      <span className="catalog-link-placeholder" aria-hidden="true" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

          <ElectronicsExplorer />

          <section id="models" className="surface-card models-card">
            <div className="section-header"><div><span className="eyebrow">Discover</span><h2>AI Models</h2><p>Model availability will appear after provider metadata is synchronized.</p></div><button className="secondary-button" onClick={() => navigate('#workspace')}><Sparkles size={16} /> Open workspace</button></div>
            <EmptyState title="No verified models available" message="Connect a provider or synchronize the catalog to view model capabilities and pricing." />
          </section>

          <section id="workspace" className="workspace-placeholder">
            <div><Sparkles size={18} /><strong>AI Workspace</strong><p>Select a verified model and connected provider to start a conversation.</p></div>
            <button className="secondary-button" onClick={() => navigate('#accounts')}>Manage connections</button>
          </section>

          {[
            ['agents', 'AI Agents', 'Agent configuration is not available until the agent execution service is connected.'],
            ['subscriptions', 'Subscriptions', 'Subscription verification will appear here when a supported provider account is connected.'],
            ['usage', 'Usage Monitor', 'Usage records will appear here after a provider request is completed.'],
            ['settings', 'Workspace Settings', 'Workspace settings require authentication and a selected workspace.'],
            ['preferences', 'Preferences', 'User preferences require authentication.'],
          ].map(([id, title, message]) => (
            <section id={id} className="surface-card module-placeholder" key={id}>
              <h2>{title}</h2>
              <p>{message}</p>
            </section>
          ))}
        </main>
      </div>
    </div>
  );
}

export default App;
