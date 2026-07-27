export default function Topbar({ activeTab, resultCount }) {
  const now = new Date()
  const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })

  return (
    <header className="topbar">
      <div className="topbar-left">
        <div className="breadcrumb">
          <span className="breadcrumb-root">Support</span>
          <span className="breadcrumb-sep">/</span>
          <span className="breadcrumb-current">
            {activeTab === 'dashboard' ? 'All Tickets' : 'New Ticket'}
          </span>
        </div>
      </div>
      <div className="topbar-right">
        <div className="topbar-search">
          <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input type="text" placeholder="Search tickets..." readOnly />
        </div>
        <div className="topbar-badge">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
          {resultCount > 0 && <span className="topbar-badge-count">{resultCount}</span>}
        </div>
        <div className="topbar-divider"></div>
        <div className="topbar-user">
          <div className="user-avatar">RA</div>
          <div className="user-info">
            <span className="user-name">Rooman AI</span>
            <span className="user-role">Admin</span>
          </div>
        </div>
      </div>
    </header>
  )
}
