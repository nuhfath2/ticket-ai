import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { triageTicket, triageBatch } from './agent.js';
import {
  testConnection, initDatabase, getTicket, getAllTickets, getStats,
  updateTicketStatus, updateTicketAssignment, overrideTriage,
} from './database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, 'client', 'dist')));

app.get('/api/health', async (req, res) => {
  const dbOk = await testConnection();
  res.json({ status: dbOk ? 'ok' : 'db_error', timestamp: new Date().toISOString() });
});

app.post('/api/triage', async (req, res) => {
  try {
    const { subject, body, customer_name, customer_email } = req.body;
    if (!subject || !body) {
      return res.status(400).json({ success: false, error: 'Subject and body are required' });
    }
    const result = await triageTicket({ subject, body, customer_name, customer_email });
    res.json({ success: true, result });
  } catch (err) {
    console.error('Triage error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/triage/batch', async (req, res) => {
  try {
    const { tickets } = req.body;
    if (!Array.isArray(tickets) || tickets.length === 0) {
      return res.status(400).json({ success: false, error: 'tickets array is required' });
    }
    const results = await triageBatch(tickets);
    res.json({ success: true, results, count: results.length });
  } catch (err) {
    console.error('Batch triage error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/tickets', async (req, res) => {
  try {
    const { search, status, category, urgency, page, limit } = req.query;
    const result = await getAllTickets({
      search, status, category, urgency,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 50,
    });
    res.json({ success: true, ...result });
  } catch (err) {
    console.error('Get tickets error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/tickets/:id', async (req, res) => {
  try {
    const ticket = await getTicket(parseInt(req.params.id));
    if (!ticket) return res.status(404).json({ success: false, error: 'Ticket not found' });
    res.json({ success: true, ticket });
  } catch (err) {
    console.error('Get ticket error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/tickets/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['NEW', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status' });
    }
    await updateTicketStatus(parseInt(req.params.id), status);
    res.json({ success: true });
  } catch (err) {
    console.error('Update status error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/tickets/:id/assign', async (req, res) => {
  try {
    const { assigned_to } = req.body;
    await updateTicketAssignment(parseInt(req.params.id), assigned_to);
    res.json({ success: true });
  } catch (err) {
    console.error('Assign error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/triage/:id/override', async (req, res) => {
  try {
    const { new_category, new_urgency, reason, overridden_by } = req.body;
    const ticket = await getTicket(parseInt(req.params.id));
    if (!ticket || !ticket.triage_id) {
      return res.status(404).json({ success: false, error: 'Triage result not found' });
    }
    const overrideId = await overrideTriage({
      triage_result_id: ticket.triage_id,
      original_category: ticket.category,
      new_category: new_category || ticket.category,
      original_urgency: ticket.urgency,
      new_urgency: new_urgency || ticket.urgency,
      reason: reason || 'No reason provided',
      overridden_by: overridden_by || 'Agent',
    });
    res.json({ success: true, override_id: overrideId });
  } catch (err) {
    console.error('Override error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/stats', async (req, res) => {
  try {
    const stats = await getStats();
    res.json({ success: true, stats });
  } catch (err) {
    console.error('Stats error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/sample-tickets', (req, res) => {
  const filePath = path.join(__dirname, 'sample-tickets.json');
  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    res.json({ success: true, tickets: data });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to load sample tickets' });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'dist', 'index.html'));
});

app.listen(PORT, async () => {
  console.log(`\n  Ticket Triage Agent running at http://localhost:${PORT}\n`);
  const dbOk = await testConnection();
  if (dbOk) {
    await initDatabase();
  }
  if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === 'your_groq_api_key_here') {
    console.log('  WARNING: GROQ_API_KEY not set. Add it to .env file.\n');
  }
});
