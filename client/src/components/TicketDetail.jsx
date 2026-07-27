import { useState, useEffect } from 'react'

const STATUS_FLOW = ['NEW', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']
const CATEGORIES = ['billing', 'technical', 'account', 'bug_report', 'feature_request', 'general_inquiry']
const URGENCY_LEVELS = ['critical', 'high', 'medium', 'low']

const categoryColors = {
  billing: { color: '#4f46e5', bg: '#eef2ff', border: '#c7d2fe' },
  technical: { color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe' },
  account: { color: '#0d9488', bg: '#f0fdfa', border: '#99f6e4' },
  bug_report: { color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
  feature_request: { color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' },
  general_inquiry: { color: '#6b7280', bg: '#f9fafb', border: '#e5e7eb' },
}

const urgencyColors = {
  critical: { color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
  high: { color: '#ea580c', bg: '#fff7ed', border: '#fed7aa' },
  medium: { color: '#ca8a04', bg: '#fefce8', border: '#fef08a' },
  low: { color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' },
}

const statusColors = {
  NEW: { color: '#6b7280', bg: '#f9fafb', border: '#e5e7eb' },
  ASSIGNED: { color: '#4f46e5', bg: '#eef2ff', border: '#c7d2fe' },
  IN_PROGRESS: { color: '#ca8a04', bg: '#fefce8', border: '#fef08a' },
  RESOLVED: { color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' },
  CLOSED: { color: '#6b7280', bg: '#f1f5f9', border: '#e2e8f0' },
}

export default function TicketDetail({ ticketId, onBack, onStatusChange, onOverride }) {
  const [ticket, setTicket] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showOverride, setShowOverride] = useState(false)
  const [overrideCategory, setOverrideCategory] = useState('')
  const [overrideUrgency, setOverrideUrgency] = useState('')
  const [overrideReason, setOverrideReason] = useState('')
  const [overrideName, setOverrideName] = useState('')

  useEffect(() => {
    fetch(`/api/tickets/${ticketId}`)
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setTicket(data.ticket)
          setOverrideCategory(data.ticket.category || '')
          setOverrideUrgency(data.ticket.urgency || '')
        }
      })
      .finally(() => setLoading(false))
  }, [ticketId])

  const handleStatusChange = async (newStatus) => {
    await onStatusChange(ticketId, newStatus)
    setTicket(prev => ({ ...prev, status: newStatus }))
  }

  const handleOverride = async () => {
    await onOverride(ticketId, {
      new_category: overrideCategory,
      new_urgency: overrideUrgency,
      reason: overrideReason,
      overridden_by: overrideName || 'Agent',
    })
    setTicket(prev => ({
      ...prev,
      category: overrideCategory,
      urgency: overrideUrgency,
    }))
    setShowOverride(false)
    setOverrideReason('')
  }

  if (loading) {
    return (
      <div className="loading-state">
        <div className="spinner"></div>
        <span>Loading ticket...</span>
      </div>
    )
  }

  if (!ticket) {
    return (
      <div className="empty-state">
        <h3>Ticket not found</h3>
        <button className="btn btn-primary" onClick={onBack}>Go Back</button>
      </div>
    )
  }

  const cat = categoryColors[ticket.category] || categoryColors.general_inquiry
  const urg = urgencyColors[ticket.urgency] || urgencyColors.medium
  const sts = statusColors[ticket.status] || statusColors.NEW
  const statusIndex = STATUS_FLOW.indexOf(ticket.status)

  return (
    <div className="ticket-detail-page">
      <div className="page-header">
        <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
          <button className="btn btn-sm btn-outline" onClick={onBack}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            Back
          </button>
          <div>
            <h1 className="page-title-lg">Ticket #{ticket.id}</h1>
            <p className="page-desc">{ticket.subject}</p>
          </div>
        </div>
      </div>

      <div className="detail-layout">
        <div className="detail-main">
          <div className="card">
            <div className="detail-section">
              <h3 className="section-title">Ticket Information</h3>
              <div className="detail-grid">
                <div className="detail-field">
                  <span className="detail-label">Subject</span>
                  <span className="detail-value">{ticket.subject}</span>
                </div>
                <div className="detail-field">
                  <span className="detail-label">Description</span>
                  <span className="detail-value detail-body">{ticket.body}</span>
                </div>
                <div className="detail-row">
                  <div className="detail-field">
                    <span className="detail-label">Customer</span>
                    <span className="detail-value">{ticket.customer_name || 'N/A'}</span>
                  </div>
                  <div className="detail-field">
                    <span className="detail-label">Email</span>
                    <span className="detail-value">{ticket.customer_email || 'N/A'}</span>
                  </div>
                </div>
                <div className="detail-row">
                  <div className="detail-field">
                    <span className="detail-label">Created</span>
                    <span className="detail-value">{new Date(ticket.created_at).toLocaleString()}</span>
                  </div>
                  <div className="detail-field">
                    <span className="detail-label">Assigned To</span>
                    <span className="detail-value">{ticket.assigned_to || 'Unassigned'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="detail-section">
              <h3 className="section-title">Status Flow</h3>
              <div className="status-flow">
                {STATUS_FLOW.map((s, i) => (
                  <div key={s} className={`status-step ${i <= statusIndex ? 'active' : ''} ${i === statusIndex ? 'current' : ''}`}>
                    <div className="status-dot" style={{
                      background: i <= statusIndex ? (statusColors[s].color) : '#e2e8f0',
                    }}></div>
                    <span className="status-name">{s.replace(/_/g, ' ')}</span>
                    {i < STATUS_FLOW.length - 1 && <div className="status-line" style={{
                      background: i < statusIndex ? (statusColors[STATUS_FLOW[i+1]]?.color || '#e2e8f0') : '#e2e8f0',
                    }}></div>}
                  </div>
                ))}
              </div>
              <div className="status-actions">
                {statusIndex < STATUS_FLOW.length - 1 && (
                  <button
                    className="btn btn-primary"
                    onClick={() => handleStatusChange(STATUS_FLOW[statusIndex + 1])}
                  >
                    Move to {STATUS_FLOW[statusIndex + 1].replace(/_/g, ' ')}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="detail-sidebar">
          <div className="card ai-analysis-card">
            <h3 className="section-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
              </svg>
              AI Analysis
            </h3>
            <div className="ai-fields">
              <div className="ai-field">
                <span className="ai-label">Category</span>
                <span className="pill" style={{color: cat.color, background: cat.bg, borderColor: cat.border}}>
                  {ticket.category?.replace(/_/g, ' ')}
                </span>
              </div>
              <div className="ai-field">
                <span className="ai-label">Urgency</span>
                <span className="pill" style={{color: urg.color, background: urg.bg, borderColor: urg.border}}>
                  <span className="pill-dot" style={{background: urg.color}}></span>
                  {ticket.urgency}
                </span>
              </div>
              <div className="ai-field">
                <span className="ai-label">Confidence</span>
                <div className="confidence-row">
                  <div className="confidence-track">
                    <div className="confidence-fill" style={{width: `${ticket.confidence * 100}%`, background: urg.color}}></div>
                  </div>
                  <span style={{fontSize: '13px', fontWeight: 700, color: urg.color}}>
                    {(ticket.confidence * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
              <div className="ai-field">
                <span className="ai-label">Route To</span>
                <span className="ai-value">{ticket.routing_team?.replace(/_/g, ' ')}</span>
              </div>
              <div className="ai-field">
                <span className="ai-label">Review Needed</span>
                <span className="pill" style={{
                  color: ticket.needs_human_review ? '#d97706' : '#16a34a',
                  background: ticket.needs_human_review ? '#fef3c7' : '#dcfce7',
                  borderColor: ticket.needs_human_review ? '#fde68a' : '#bbf7d0',
                }}>
                  {ticket.needs_human_review ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="ai-field">
                <span className="ai-label">Reasoning</span>
                <p className="ai-reasoning">{ticket.reasoning}</p>
              </div>
            </div>
            <button className="btn btn-outline btn-full" onClick={() => setShowOverride(!showOverride)}>
              {showOverride ? 'Cancel Override' : 'Override Classification'}
            </button>
          </div>

          {showOverride && (
            <div className="card override-card">
              <h3 className="section-title">Override AI Classification</h3>
              <div className="form-group">
                <label>Category</label>
                <select value={overrideCategory} onChange={e => setOverrideCategory(e.target.value)}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Urgency</label>
                <select value={overrideUrgency} onChange={e => setOverrideUrgency(e.target.value)}>
                  {URGENCY_LEVELS.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Your Name</label>
                <input type="text" value={overrideName} onChange={e => setOverrideName(e.target.value)} placeholder="Agent name" />
              </div>
              <div className="form-group">
                <label>Reason for Override</label>
                <textarea rows={3} value={overrideReason} onChange={e => setOverrideReason(e.target.value)} placeholder="Why do you disagree with the AI?" />
              </div>
              <button className="btn btn-primary btn-full" onClick={handleOverride}>
                Save Override
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
