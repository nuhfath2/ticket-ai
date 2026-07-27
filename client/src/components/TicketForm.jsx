import { useState } from 'react'

export default function TicketForm({ onTriage, onLoadSamples, onClear, loading }) {
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!subject.trim() || !body.trim()) return
    try {
      await onTriage(subject.trim(), body.trim())
      setSubject('')
      setBody('')
    } catch {}
  }

  return (
    <section className="card form-card">
      <h2>Submit New Ticket</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="subject">Subject</label>
          <input
            id="subject"
            type="text"
            value={subject}
            onChange={e => setSubject(e.target.value)}
            placeholder="e.g. Can't login to my account"
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
            rows={5}
            placeholder="Describe the issue in detail..."
            required
            disabled={loading}
          />
        </div>
        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Triaging...' : 'Triage Ticket'}
          </button>
          <button type="button" className="btn btn-secondary" onClick={onLoadSamples} disabled={loading}>
            Load Samples
          </button>
          <button type="button" className="btn btn-outline" onClick={onClear} disabled={loading}>
            Clear
          </button>
        </div>
      </form>
    </section>
  )
}
