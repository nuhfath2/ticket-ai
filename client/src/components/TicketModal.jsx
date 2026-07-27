import { useState } from 'react'

export default function TicketModal({ isOpen, onClose, onSubmit, loading }) {
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [success, setSuccess] = useState(false)
  const [lastResult, setLastResult] = useState(null)

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!subject.trim() || !body.trim()) return
    try {
      const result = await onSubmit(subject.trim(), body.trim(), customerName.trim(), customerEmail.trim())
      setLastResult(result)
      setSuccess(true)
      setSubject('')
      setBody('')
      setCustomerName('')
      setCustomerEmail('')
    } catch {}
  }

  const handleClose = () => {
    setSuccess(false)
    setLastResult(null)
    setSubject('')
    setBody('')
    setCustomerName('')
    setCustomerEmail('')
    onClose()
  }

  const getCategoryColor = (cat) => {
    const c = { billing: '#4f46e5', technical: '#7c3aed', account: '#0d9488', bug_report: '#dc2626', feature_request: '#16a34a', general_inquiry: '#6b7280' }
    return c[cat] || '#6b7280'
  }
  const getCategoryBg = (cat) => {
    const c = { billing: '#eef2ff', technical: '#f5f3ff', account: '#f0fdfa', bug_report: '#fef2f2', feature_request: '#f0fdf4', general_inquiry: '#f9fafb' }
    return c[cat] || '#f9fafb'
  }
  const getUrgencyColor = (u) => {
    const c = { critical: '#dc2626', high: '#ea580c', medium: '#ca8a04', low: '#16a34a' }
    return c[u] || '#6b7280'
  }
  const getUrgencyBg = (u) => {
    const c = { critical: '#fef2f2', high: '#fff7ed', medium: '#fefce8', low: '#f0fdf4' }
    return c[u] || '#f9fafb'
  }

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-row">
            <div className="modal-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="12" y1="18" x2="12" y2="12"/>
                <line x1="9" y1="15" x2="15" y2="15"/>
              </svg>
            </div>
            <div>
              <h2>{success ? 'Ticket Classified' : 'New Support Ticket'}</h2>
              <p className="modal-subtitle">{success ? 'AI has classified your ticket' : 'Fill in details to auto-classify with AI'}</p>
            </div>
          </div>
          <button className="modal-close" onClick={handleClose}>&times;</button>
        </div>

        {!success ? (
          <form onSubmit={handleSubmit} className="modal-form">
            <div className="modal-form-row">
              <div className="form-group">
                <label>Customer Name</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  placeholder="John Doe"
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label>Customer Email</label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={e => setCustomerEmail(e.target.value)}
                  placeholder="john@example.com"
                  disabled={loading}
                />
              </div>
            </div>
            <div className="form-group">
              <label>Subject <span className="required">*</span></label>
              <input
                type="text"
                value={subject}
                onChange={e => setSubject(e.target.value)}
                placeholder="Brief summary of the issue"
                required
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label>Description <span className="required">*</span></label>
              <textarea
                value={body}
                onChange={e => setBody(e.target.value)}
                rows={4}
                placeholder="Describe the issue in detail..."
                required
                disabled={loading}
              />
            </div>
            <div className="modal-actions">
              <button type="button" className="btn btn-outline" onClick={handleClose} disabled={loading}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
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
        ) : (
          <div className="modal-result">
            <div className="modal-result-grid">
              <div className="modal-result-field">
                <span className="modal-result-label">Subject</span>
                <span className="modal-result-value">{lastResult?.subject}</span>
              </div>
              {lastResult?.customer_name && (
                <div className="modal-result-field">
                  <span className="modal-result-label">Customer</span>
                  <span className="modal-result-value">{lastResult.customer_name}</span>
                </div>
              )}
              <div className="modal-result-row">
                <div className="modal-result-field">
                  <span className="modal-result-label">Category</span>
                  <span className="modal-result-value badge-inline" style={{color: getCategoryColor(lastResult?.category), background: getCategoryBg(lastResult?.category)}}>
                    {lastResult?.category?.replace(/_/g, ' ')}
                  </span>
                </div>
                <div className="modal-result-field">
                  <span className="modal-result-label">Urgency</span>
                  <span className="modal-result-value badge-inline" style={{color: getUrgencyColor(lastResult?.urgency), background: getUrgencyBg(lastResult?.urgency)}}>
                    {lastResult?.urgency}
                  </span>
                </div>
              </div>
              <div className="modal-result-row">
                <div className="modal-result-field">
                  <span className="modal-result-label">Confidence</span>
                  <span className="modal-result-value">{(lastResult?.confidence * 100).toFixed(0)}%</span>
                </div>
                <div className="modal-result-field">
                  <span className="modal-result-label">Route To</span>
                  <span className="modal-result-value">{lastResult?.routing_team?.replace(/_/g, ' ')}</span>
                </div>
              </div>
              <div className="modal-result-field">
                <span className="modal-result-label">Status</span>
                <span className="modal-result-value badge-inline" style={{
                  color: lastResult?.needs_human_review ? '#d97706' : '#16a34a',
                  background: lastResult?.needs_human_review ? '#fef3c7' : '#dcfce7'
                }}>
                  {lastResult?.status}
                </span>
              </div>
              <div className="modal-result-field">
                <span className="modal-result-label">Reasoning</span>
                <span className="modal-result-value result-reasoning">{lastResult?.reasoning}</span>
              </div>
            </div>
            <div className="modal-actions">
              <button type="button" className="btn btn-outline" onClick={() => setSuccess(false)}>
                Submit Another
              </button>
              <button type="button" className="btn btn-primary" onClick={handleClose}>
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
