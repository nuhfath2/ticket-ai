export default function Sidebar({ activeTab, onTabChange }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/>
            <path d="M2 17l10 5 10-5"/>
            <path d="M2 12l10 5 10-5"/>
          </svg>
        </div>
        <div className="brand-text">
          <span className="brand-name">TicketAI</span>
          <span className="brand-tag">Support Platform</span>
        </div>
      </div>

      <div className="sidebar-menu">
        <div className="menu-group">
          <span className="menu-label">Navigation</span>
          <button
            className={`menu-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => onTabChange('dashboard')}
          >
            <svg className="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" rx="1"/>
              <rect x="14" y="3" width="7" height="7" rx="1"/>
              <rect x="3" y="14" width="7" height="7" rx="1"/>
              <rect x="14" y="14" width="7" height="7" rx="1"/>
            </svg>
            <span>Dashboard</span>
          </button>
        </div>
      </div>

      <div className="sidebar-bottom">
        <div className="ai-badge">
          <div className="ai-badge-dot"></div>
          <div>
            <span className="ai-badge-title">AI Agent Active</span>
            <span className="ai-badge-desc">Groq LLM</span>
          </div>
        </div>
      </div>
    </aside>
  )
}
