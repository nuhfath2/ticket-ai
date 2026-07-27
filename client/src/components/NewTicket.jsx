import { useState } from 'react'

export default function NewTicket({ onTriage, onLoadSamples, onClear, loading, onNavigate }) {
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [lastResult, setLastResult] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!subject.trim() || !body.trim()) return
    try {
      const result = await onTriage(subject.trim(), body.trim(), customerName.trim(), customerEmail.trim())
      setLastResult(result)
      setSubject('')
      setBody('')
      setCustomerName('')
      setCustomerEmail('')
    } catch {}
  }

  return (
    <div className="new-ticket-page">
      <div className="page-header">
        <div>
          <h1 className="page-title-lg">Submit Support Ticket</h1>
          <p className="page-desc">Enter ticket details and let AI classify and route it automatically.</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-outline" onClick={onLoadSamples} disabled={loading}>
            Load Sample Tickets
          </button>
          <button className="btn btn-secondary" onClick={onClear} disabled={loading}>
            Clear Results
          </button>
        </div>
      </div>

      <div className="ticket-form-layout">
        <div className="card form-card">
          <div className="form-card-header">
            <div className="form-card-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
              </svg>
            </div>
            <div>
              <h2>New Ticket</h2>
              <p className="form-subtitle">Fill in the details below</p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="customer_name">Customer Name</label>
                <input
                  id="customer_name"
                  type="text"
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  placeholder="John Doe"
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label htmlFor="customer_email">Customer Email</label>
                <input
                  id="customer_email"
                  type="email"
                  value={customerEmail}
                  onChange={e => setCustomerEmail(e.target.value)}
                  placeholder="john@example.com"
                  disabled={loading}
                />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="subject">Subject</label>
              <input
                id="subject"
                type="text"
                value={subject}
                onChange={e => setSubject(e.target.value)}
                placeholder="Brief summary of the issue"
                required
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label htmlFor="body">Description</label>
              <textarea
                id="body"
                value={body}
                onChange={e => setBody(e.target.value)}
                rows={6}
                placeholder="Describe the issue in detail. Include any error messages, steps to reproduce, or relevant context..."
                required
                disabled={loading}
              />
            </div>
            <div className="form-footer">
              <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                {loading ? (
                  <><span className="btn-spinner"></span> Classifying...</>
                ) : (
                  <>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                    </svg>
                    Classify Ticket
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {lastResult && (
          <div className="result-preview card">
            <div className="result-preview-header">
              <h2>Last Classification</h2>
              <button className="btn btn-sm" onClick={() => onNavigate()}>View All</button>
            </div>
            <div className="result-preview-content">
              <div className="result-field">
                <span className="result-label">Subject</span>
                <span className="result-value">{lastResult.subject}</span>
              </div>
              {lastResult.customer_name && (
                <div className="result-field">
                  <span className="result-label">Customer</span>
                  <span className="result-value">{lastResult.customer_name}</span>
                </div>
              )}
              <div className="result-row">
                <div className="result-field">
                  <span className="result-label">Category</span>
                  <span className="result-value badge-inline" style={{color: getCategoryColor(lastResult.category), background: getCategoryBg(lastResult.category)}}>
                    {lastResult.category?.replace(/_/g, ' ')}
                  </span>
                </div>
                <div className="result-field">
                  <span className="result-label">Urgency</span>
                  <span className="result-value badge-inline" style={{color: getUrgencyColor(lastResult.urgency), background: getUrgencyBg(lastResult.urgency)}}>
                    {lastResult.urgency}
                  </span>
                </div>
              </div>
              <div className="result-row">
                <div className="result-field">
                  <span className="result-label">Confidence</span>
                  <span className="result-value">{(lastResult.confidence * 100).toFixed(0)}%</span>
                </div>
                <div className="result-field">
                  <span className="result-label">Route To</span>
                  <span className="result-value">{lastResult.routing_team?.replace(/_/g, ' ')}</span>
                </div>
              </div>
              <div className="result-field">
                <span className="result-label">Status</span>
                <span className="result-value badge-inline" style={{
                  color: lastResult.needs_human_review ? '#d97706' : '#16a34a',
                  background: lastResult.needs_human_review ? '#fef3c7' : '#dcfce7'
                }}>
                  {lastResult.status}
                </span>
              </div>
              <div className="result-field">
                <span className="result-label">Reasoning</span>
                <span className="result-value result-reasoning">{lastResult.reasoning}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function getCategoryColor(cat) {
  const c = { billing: '#4f46e5', technical: '#7c3aed', account: '#0d9488', bug_report: '#dc2626', feature_request: '#16a34a', general_inquiry: '#6b7280' }
  return c[cat] || '#6b7280'
}
function getCategoryBg(cat) {
  const c = { billing: '#eef2ff', technical: '#f5f3ff', account: '#f0fdfa', bug_report: '#fef2f2', feature_request: '#f0fdf4', general_inquiry: '#f9fafb' }
  return c[cat] || '#f9fafb'
}
function getUrgencyColor(u) {
  const c = { critical: '#dc2626', high: '#ea580c', medium: '#ca8a04', low: '#16a34a' }
  return c[u] || '#6b7280'
}
function getUrgencyBg(u) {
  const c = { critical: '#fef2f2', high: '#fff7ed', medium: '#fefce8', low: '#f0fdf4' }
  return c[u] || '#f9fafb'
}
