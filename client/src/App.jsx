import { useState, useCallback, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import Topbar from './components/Topbar'
import Dashboard from './components/Dashboard'
import NewTicket from './components/NewTicket'
import TicketDetail from './components/TicketDetail'
import TicketModal from './components/TicketModal'
import './App.css'

function App() {
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [selectedTicketId, setSelectedTicketId] = useState(null)
  const [showModal, setShowModal] = useState(false)

  const triageTicket = useCallback(async (subject, body, customer_name, customer_email) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/triage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, body, customer_name, customer_email }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error || 'Triage failed')
      setResults(prev => [data.result, ...prev])
      return data.result
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const triageBatch = useCallback(async (tickets) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/triage/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tickets }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error || 'Batch triage failed')
      setResults(prev => [...data.results.reverse(), ...prev])
      return data.results
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const loadSamples = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/sample-tickets')
      const data = await res.json()
      if (!data.success) throw new Error(data.error || 'Failed to load samples')
      await triageBatch(data.tickets)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [triageBatch])

  const clearAll = useCallback(() => {
    setResults([])
    setError(null)
  }, [])

  const viewTicket = useCallback((ticketId) => {
    setSelectedTicketId(ticketId)
    setActiveTab('ticket-detail')
  }, [])

  const handleStatusChange = useCallback(async (ticketId, newStatus) => {
    try {
      await fetch(`/api/tickets/${ticketId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
    } catch (err) {
      setError(err.message)
    }
  }, [])

  const handleOverride = useCallback(async (ticketId, data) => {
    try {
      await fetch(`/api/triage/${ticketId}/override`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
    } catch (err) {
      setError(err.message)
    }
  }, [])

  return (
    <div className="app">
      <Sidebar activeTab={activeTab} onTabChange={(tab) => {
        setActiveTab(tab)
        setSelectedTicketId(null)
      }} />
      <div className="main-wrapper">
        <Topbar activeTab={activeTab} resultCount={results.length} />
        <div className="content-area">
          {error && (
            <div className="error-banner">
              <span className="error-icon">!</span>
              <span>{error}</span>
              <button onClick={() => setError(null)} className="error-close">&times;</button>
            </div>
          )}
          {activeTab === 'dashboard' && (
            <Dashboard results={results} loading={loading} onViewTicket={viewTicket} onNewTicket={() => setShowModal(true)} onLoadSamples={loadSamples} />
          )}
          {activeTab === 'new-ticket' && (
            <NewTicket
              onTriage={triageTicket}
              onLoadSamples={loadSamples}
              onClear={clearAll}
              loading={loading}
              onNavigate={() => setActiveTab('dashboard')}
            />
          )}
          {activeTab === 'ticket-detail' && selectedTicketId && (
            <TicketDetail
              ticketId={selectedTicketId}
              onBack={() => setActiveTab('dashboard')}
              onStatusChange={handleStatusChange}
              onOverride={handleOverride}
            />
          )}
        </div>
      </div>
      <TicketModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={triageTicket}
        loading={loading}
      />
    </div>
  )
}

export default App
