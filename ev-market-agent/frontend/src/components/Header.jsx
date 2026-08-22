export default function Header({ loading, onRefresh }) {
  return (
    <header className="site-header">
      <a className="brand" href="/" aria-label="EV Market Intelligence home">
        <span className="brand-mark">EV</span>
        <span>
          <strong>EV Market Intelligence</strong>
          <small>Indian EV Market</small>
        </span>
      </a>
      <div className="header-actions">
        <span className={`live-status ${loading ? 'is-loading' : ''}`}>
          <span className="live-dot" aria-hidden="true" />
          {loading ? 'Updating' : 'Live data'}
        </span>
        <button className="refresh-button" type="button" onClick={onRefresh} disabled={loading}>
          <span aria-hidden="true">↻</span>
          {loading ? 'Refreshing...' : 'Refresh Data'}
        </button>
      </div>
    </header>
  );
}
