import { useState, type FormEvent } from 'react';
import { Cable, Cpu, ExternalLink, Radio, Search, Sparkles, Zap } from 'lucide-react';

const categories = [
  { label: 'Microcontrollers', icon: Cpu },
  { label: 'Sensors', icon: Radio },
  { label: 'Development boards', icon: Sparkles },
  { label: 'Connectors', icon: Cable },
  { label: 'Semiconductors', icon: Zap },
];

function ElectronicsExplorer() {
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    if (!query.trim()) {
      event.preventDefault();
      setError('Enter a product name, manufacturer, or part number to search.');
      return;
    }

    setError('');
  };

  return (
    <section id="electronics-explorer" className="surface-card electronics-explorer">
      <div className="electronics-heading">
        <div>
          <span className="eyebrow">Discover</span>
          <h2>Electronics Explorer</h2>
          <p>Search electronic components from element14 Philippines.</p>
        </div>
        <div className="electronics-brand" aria-hidden="true">e14</div>
      </div>

      <form
        className="electronics-search"
        action="https://ph.element14.com/w/search"
        method="get"
        target="_blank"
        rel="noreferrer"
        onSubmit={handleSubmit}
      >
        <label htmlFor="electronics-query">Product name, manufacturer, or part number</label>
        <div className="electronics-search-controls">
          <div className="electronics-input-wrap">
            <Search size={18} aria-hidden="true" />
            <input
              id="electronics-query"
              name="st"
              type="search"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                if (error) setError('');
              }}
              placeholder="e.g. Arduino Uno, Raspberry Pi, LM358"
              maxLength={120}
              required
              aria-invalid={Boolean(error)}
              aria-describedby={error ? 'electronics-search-error' : undefined}
            />
          </div>
          <button className="primary-button" type="submit">
            Search element14 <ExternalLink size={15} aria-hidden="true" />
          </button>
        </div>
        {error && <p className="electronics-error" id="electronics-search-error" role="alert">{error}</p>}
      </form>

      <div className="electronics-categories">
        <span>Browse by category</span>
        <div className="electronics-category-list">
          {categories.map(({ label, icon: CategoryIcon }) => (
            <button
              className="electronics-category"
              key={label}
              onClick={() => {
                setQuery(label);
                setError('');
              }}
              type="button"
            >
              <CategoryIcon size={15} aria-hidden="true" />
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="electronics-notice" role="status">
        <ExternalLink size={16} aria-hidden="true" />
        <p>
          Searches open on the official element14 Philippines website. Results, pricing, and availability
          are provided by element14; this app does not display or estimate catalog data.
        </p>
      </div>
    </section>
  );
}

export default ElectronicsExplorer;
