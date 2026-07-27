# Support Ticket Triage Agent

AI-powered support ticket classification and routing agent built for the Rooman AI Challenge.

## What It Does

Takes a support ticket (subject + description) and automatically:
1. **Classifies** it into a category (billing, technical, account, bug report, feature request, general inquiry)
2. **Rates** urgency (critical, high, medium, low)
3. **Routes** it to the correct team
4. **Flags** ambiguous tickets for human review
5. **Shows** everything on a real-time dashboard

## Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Frontend | React + Vite | Modern UI, fast development |
| Backend | Express.js (Node.js) | Lightweight REST API |
| AI Model | Groq (llama-3.3-70b-versatile) | Free, fast, good classification |
| Styling | Custom CSS | Dark theme, responsive design |

## Setup Instructions

### Prerequisites
- Node.js v18+ installed
- A free Groq API key

### Step 1: Get a Groq API Key
1. Go to [console.groq.com](https://console.groq.com)
2. Sign up (free)
3. Click "API Keys" → "Create API Key"
4. Copy the key

### Step 2: Clone and Install
```bash
git clone https://github.com/your-username/ticket-ai.git
cd ticket-ai
npm run setup
```

### Step 3: Configure API Key
Create a `.env` file in the root directory:
```
GROQ_API_KEY=your_api_key_here
```

### Step 4: Build the Frontend
```bash
npm run build
```

### Step 5: Start the Server
```bash
npm start
```

### Step 6: Open the Dashboard
Go to **http://localhost:3000** in your browser.

## How to Use

### Single Ticket
1. Open the dashboard
2. Enter a subject and description
3. Click "Triage Ticket"
4. See the result in the table below

### Batch Processing
1. Click "Load Samples" to load 10 pre-made test tickets
2. All tickets are automatically classified
3. View stats and results in real-time

### Sample Input
```
Subject: Charged twice for subscription
Body: I see two charges of $29.99 on my card this month. I only have one subscription.
```

### Sample Output
```json
{
  "category": "billing",
  "urgency": "high",
  "confidence": 0.92,
  "routing_team": "billing_team",
  "reasoning": "Customer reporting duplicate charge on their credit card.",
  "needs_human_review": false
}
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/triage` | Classify a single ticket |
| POST | `/api/triage/batch` | Classify multiple tickets |
| GET | `/api/tickets` | Get all triaged results |
| GET | `/api/stats` | Get statistics |
| GET | `/api/sample-tickets` | Get sample tickets |
| GET | `/api/health` | Health check |

## Project Structure

```
ticket-ai/
├── server.js              # Express server + API routes
├── agent.js               # AI triage logic (Groq integration)
├── sample-tickets.json    # 10 sample support tickets
├── package.json           # Backend dependencies
├── .env                   # API key (not committed)
├── .gitignore
├── results/               # Stored triage results
└── client/                # React frontend
    ├── src/
    │   ├── App.jsx        # Main dashboard component
    │   ├── components/
    │   │   ├── TicketForm.jsx
    │   │   ├── StatsPanel.jsx
    │   │   └── ResultsTable.jsx
    │   └── ...
    └── dist/              # Built frontend
```

## Classification Categories

| Category | Description | Routing Team |
|----------|-------------|--------------|
| billing | Payment issues, refunds, charges | billing_team |
| technical | Performance, API issues, integrations | engineering |
| account | Login, password, access issues | customer_success |
| bug_report | Crashes, errors, broken features | engineering |
| feature_request | New feature suggestions | product |
| general_inquiry | How-to questions, general info | support_l1 |

## Urgency Levels

| Level | Criteria | Examples |
|-------|----------|----------|
| critical | Security, data loss, service down | Data breach, total outage |
| high | Major functionality broken | Can't login, payment failed |
| medium | Degraded experience | Slow loading, intermittent errors |
| low | Non-urgent requests | Feature requests, general questions |

## Sample Tickets

The project includes 10 sample tickets covering all categories:
1. Double charge → billing, high
2. App crashes → bug_report, high
3. Password reset not working → account, high
4. Dark mode request → feature_request, low
5. Export data question → general_inquiry, low
6. Security breach → technical, critical
7. Slow dashboard → technical, medium
8. Upgrade plan → general_inquiry, low
9. API 500 errors → bug_report, high
10. Invoice request → billing, medium

## Tradeoff Notes

### Why Groq (not OpenAI/Claude)?
- **Free tier**: No cost for the challenge
- **Fast responses**: ~1-2 seconds per ticket
- **Good quality**: llama-3.3-70b handles classification well
- **JSON mode**: Built-in structured output support

### Why Express.js (not Next.js)?
- Simpler setup for a 24-hour challenge
- Clear separation between API and frontend
- Easier for reviewers to understand

### Why JSON files (not database)?
- No setup required (no MongoDB/PostgreSQL)
- Reviewers can run it immediately
- Results persist between restarts
- Good enough for this use case

### Limitations
- Sequential batch processing (not parallel)
- No authentication on API endpoints
- No persistent queue for failed requests
- Classification quality depends on prompt clarity

### What I'd Improve With More Time
- Add parallel batch processing
- Add user authentication
- Add a real database (SQLite)
- Add ticket history and search
- Add confidence threshold tuning
- Add A/B testing for different prompts

## License

MIT
