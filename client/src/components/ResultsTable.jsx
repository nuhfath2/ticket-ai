import { useState, useEffect } from 'react'

export default function ResultsTable({ results, loading, onViewTicket }) {
  const [dbTickets, setDbTickets] = useState([])
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [filterUrgency, setFilterUrgency] = useState('')
  const [loadingDb, setLoadingDb] = useState(false)

  const fetchTickets = async () => {
    setLoadingDb(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (filterStatus) params.set('status', filterStatus)
      if (filterCategory) params.set('category', filterCategory)
      if (filterUrgency) params.set('urgency', filterUrgency)
      const res = await fetch(`/api/tickets?${params.toString()}`)
      const data = await res.json()
      if (data.success) setDbTickets(data.tickets)
    } catch {}
    setLoadingDb(false)
  }

  useEffect(() => { fetchTickets() }, [search, filterStatus, filterCategory, filterUrgency])

  useEffect(() => { if (results.length > 0) fetchTickets() }, [results.length])

  const allTickets = dbTickets.length > 0 ? dbTickets : results.map((r, i) => ({
    id: r.ticket_id || i + 1,
    subject: r.ticket?.subject || r.subject,
    category: r.category,
    urgency: r.urgency,
    confidence: r.confidence,
    routing_team: r.routing_team,
    reasoning: r.reasoning,
    needs_human_review: r.needs_human_review,
    status: r.status || 'NEW',
    created_at: r.triaged_at,
  }))

  const urgencyConfig = {
    critical: { color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
    high: { color: '#ea580c', bg: '#fff7ed', border: '#fed7aa' },
    medium: { color: '#ca8a04', bg: '#fefce8', border: '#fef08a' },
    low: { color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' },
  }
  const categoryConfig = {
    billing: { color: '#4f46e5', bg: '#eef2ff', border: '#c7d2fe' },
    technical: { color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe' },
    account: { color: '#0d9488', bg: '#f0fdfa', border: '#99f6e4' },
    bug_report: { color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
    feature_request: { color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' },
    general_inquiry: { color: '#6b7280', bg: '#f9fafb', border: '#e5e7eb' },
  }
  const statusConfig = {
    NEW: { color: '#6b7280', bg: '#f9fafb', border: '#e5e7eb' },
    ASSIGNED: { color: '#4f46e5', bg: '#eef2ff', border: '#c7d2fe' },
    IN_PROGRESS: { color: '#ca8a04', bg: '#fefce8', border: '#fef08a' },
    RESOLVED: { color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' },
    CLOSED: { color: '#6b7280', bg: '#f1f5f9', border: '#e2e8f0' },
  }

  return (
    <div className="card results-section">
      <div className="results-header">
        <div className="results-title">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
          </svg>
          <h2>All Tickets</h2>
          <span className="results-count">{allTickets.length}</span>
        </div>
      </div>

      <div className="filter-bar">
        <input
          type="text"
          placeholder="Search tickets..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="filter-search"
        />
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="filter-select">
          <option value="">All Status</option>
          {Object.keys(statusConfig).map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
        </select>
        <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="filter-select">
          <option value="">All Categories</option>
          {Object.keys(categoryConfig).map(c => <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>)}
        </select>
        <select value={filterUrgency} onChange={e => setFilterUrgency(e.target.value)} className="filter-select">
          <option value="">All Urgency</option>
          {Object.keys(urgencyConfig).map(u => <option key={u} value={u}>{u}</option>)}
        </select>
      </div>

      {loading && allTickets.length === 0 && (
        <div className="loading-state">
          <div className="spinner"></div>
          <span>Classifying tickets with AI...</span>
        </div>
      )}

      {!loading && allTickets.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon-box">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="32" height="32">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
          </div>
          <h3>No tickets yet</h3>
          <p>Submit a new ticket or load sample data to get started.</p>
        </div>
      )}

      {allTickets.length > 0 && (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th style={{width: '40px'}}>#</th>
                <th>Subject</th>
                <th>Status</th>
                <th>Category</th>
                <th>Urgency</th>
                <th>Confidence</th>
                <th>Route To</th>
                <th>Reasoning</th>
                <th style={{width: '80px'}}>Review</th>
              </tr>
            </thead>
            <tbody>
              {allTickets.map((r, i) => {
                const urg = urgencyConfig[r.urgency] || urgencyConfig.medium
                const cat = categoryConfig[r.category] || categoryConfig.general_inquiry
                const sts = statusConfig[r.status] || statusConfig.NEW
                return (
                  <tr key={r.id || i} onClick={() => onViewTicket && onViewTicket(r.id)} className="clickable-row">
                    <td className="td-num">{i + 1}</td>
                    <td className="td-subject">
                      <div className="subject-text">{r.subject || 'N/A'}</div>
                    </td>
                    <td>
                      <span className="pill" style={{color: sts.color, background: sts.bg, borderColor: sts.border}}>
                        {r.status?.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td>
                      <span className="pill" style={{color: cat.color, background: cat.bg, borderColor: cat.border}}>
                        {r.category?.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td>
                      <span className="pill" style={{color: urg.color, background: urg.bg, borderColor: urg.border}}>
                        <span className="pill-dot" style={{background: urg.color}}></span>
                        {r.urgency}
                      </span>
                    </td>
                    <td className="td-confidence">
                      <div className="confidence-track">
                        <div className="confidence-fill" style={{width: `${r.confidence * 100}%`, background: urg.color}}></div>
                      </div>
                      <span className="confidence-num" style={{color: urg.color}}>
                        {(r.confidence * 100).toFixed(0)}%
                      </span>
                    </td>
                    <td className="td-route">{r.routing_team?.replace(/_/g, ' ')}</td>
                    <td className="td-reasoning">{r.reasoning}</td>
                    <td>
                      {r.needs_human_review ? (
                        <span className="pill pill-warn">Review</span>
                      ) : (
                        <span className="pill pill-ok">Auto</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
