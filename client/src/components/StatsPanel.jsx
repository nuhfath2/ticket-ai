import { useState, useEffect } from 'react'

export default function StatsPanel({ results }) {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    fetch('/api/stats')
      .then(r => r.json())
      .then(data => { if (data.success) setStats(data.stats) })
      .catch(() => {})
  }, [results.length])

  const total = stats?.total || results.length
  const urgent = stats?.urgent || results.filter(r => r.urgency === 'critical' || r.urgency === 'high').length
  const needsHuman = stats?.needsHuman || results.filter(r => r.needs_human_review).length
  const avgConfidence = stats?.avgConfidence
    ? (stats.avgConfidence * 100).toFixed(0)
    : total > 0 ? (results.reduce((sum, r) => sum + r.confidence, 0) / total * 100).toFixed(0) : 0
  const categories = stats?.categories || []
  const statusCounts = stats?.statusCounts || []

  const categoryColors = {
    billing: '#4f46e5', technical: '#7c3aed', account: '#0d9488',
    bug_report: '#dc2626', feature_request: '#16a34a', general_inquiry: '#6b7280',
  }

  const cards = [
    { label: 'Total Tickets', value: total },
    { label: 'Urgent / Critical', value: urgent },
    { label: 'Avg Confidence', value: `${avgConfidence}%` },
    { label: 'Needs Review', value: needsHuman },
  ]

  return (
    <div className="stats-section">
      <div className="stats-row">
        {cards.map((c, i) => (
          <div key={i} className="stat-card">
            <span className="stat-card-value">{c.value}</span>
            <span className="stat-card-label">{c.label}</span>
          </div>
        ))}
      </div>

      <div className="stats-bottom-row">
        {total > 0 && categories.length > 0 && (
          <div className="category-breakdown card">
            <h3 className="section-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                <line x1="18" y1="20" x2="18" y2="10"/>
                <line x1="12" y1="20" x2="12" y2="4"/>
                <line x1="6" y1="20" x2="6" y2="14"/>
              </svg>
              Category Breakdown
            </h3>
            <div className="breakdown-list">
              {categories.map(({ category, count }) => (
                <div key={category} className="breakdown-row">
                  <div className="breakdown-info">
                    <span className="breakdown-dot" style={{background: categoryColors[category] || '#6b7280'}}></span>
                    <span className="breakdown-name">{category?.replace(/_/g, ' ')}</span>
                  </div>
                  <div className="breakdown-bar-track">
                    <div className="breakdown-bar-fill" style={{width: `${(count / total) * 100}%`, background: categoryColors[category] || '#6b7280'}}></div>
                  </div>
                  <span className="breakdown-num">{count}</span>
                  <span className="breakdown-pct">{((count / total) * 100).toFixed(0)}%</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {statusCounts.length > 0 && (
          <div className="category-breakdown card">
            <h3 className="section-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
              Status Distribution
            </h3>
            <div className="breakdown-list">
              {statusCounts.map(({ status, count }) => {
                const sc = {NEW:'#6b7280',ASSIGNED:'#4f46e5',IN_PROGRESS:'#ca8a04',RESOLVED:'#16a34a',CLOSED:'#94a3b8'}
                return (
                  <div key={status} className="breakdown-row">
                    <div className="breakdown-info">
                      <span className="breakdown-dot" style={{background: sc[status] || '#6b7280'}}></span>
                      <span className="breakdown-name">{status?.replace(/_/g, ' ')}</span>
                    </div>
                    <div className="breakdown-bar-track">
                      <div className="breakdown-bar-fill" style={{width: `${(count / total) * 100}%`, background: sc[status] || '#6b7280'}}></div>
                    </div>
                    <span className="breakdown-num">{count}</span>
                    <span className="breakdown-pct">{((count / total) * 100).toFixed(0)}%</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
