import StatsPanel from './StatsPanel'
import ResultsTable from './ResultsTable'

export default function Dashboard({ results, loading, onViewTicket, onNewTicket, onLoadSamples }) {
  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1 className="page-title">Dashboard</h1>
        <div className="dashboard-actions">
          <button className="btn btn-outline" onClick={onLoadSamples} disabled={loading}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Load Samples
          </button>
          <button className="btn btn-primary" onClick={onNewTicket}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            New Ticket
          </button>
        </div>
      </div>
      <StatsPanel results={results} />
      <ResultsTable results={results} loading={loading} onViewTicket={onViewTicket} />
    </div>
  )
}
