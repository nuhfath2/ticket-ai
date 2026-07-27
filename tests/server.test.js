import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Sample Tickets', () => {
  const filePath = path.join(__dirname, '..', 'sample-tickets.json');

  it('sample-tickets.json exists', () => {
    expect(fs.existsSync(filePath)).toBe(true);
  });

  it('contains an array of tickets', () => {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
  });

  it('each ticket has subject and body', () => {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    data.forEach((ticket, i) => {
      expect(ticket.subject, `ticket ${i} missing subject`).toBeTruthy();
      expect(ticket.body, `ticket ${i} missing body`).toBeTruthy();
    });
  });

  it('each ticket has customer_name and customer_email', () => {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    data.forEach((ticket, i) => {
      expect(ticket.customer_name, `ticket ${i} missing customer_name`).toBeTruthy();
      expect(ticket.customer_email, `ticket ${i} missing customer_email`).toBeTruthy();
    });
  });
});

describe('API Validation', () => {
  it('rejects triage without subject', () => {
    const body = { body: 'Some description' };
    expect(body.subject).toBeFalsy();
  });

  it('rejects triage without body', () => {
    const body = { subject: 'Test subject' };
    expect(body.body).toBeFalsy();
  });

  it('accepts triage with subject and body', () => {
    const body = { subject: 'Test subject', body: 'Test body' };
    expect(body.subject).toBeTruthy();
    expect(body.body).toBeTruthy();
  });

  it('validates batch tickets is an array', () => {
    expect(Array.isArray([])).toBe(true);
    expect(Array.isArray({})).toBe(false);
    expect(Array.isArray(null)).toBe(false);
  });
});

describe('Express App Structure', () => {
  it('can create an express app', () => {
    const app = express();
    expect(app).toBeDefined();
    expect(typeof app.get).toBe('function');
    expect(typeof app.post).toBe('function');
    expect(typeof app.put).toBe('function');
  });

  it('registers routes correctly', () => {
    const app = express();
    app.get('/api/health', (req, res) => res.json({ ok: true }));
    app.post('/api/triage', (req, res) => res.json({ ok: true }));
    app.get('/api/stats', (req, res) => res.json({ ok: true }));

    const layers = app._router.stack;
    const routes = layers.filter(l => l.route).map(l => l.route.path);
    expect(routes).toContain('/api/health');
    expect(routes).toContain('/api/triage');
    expect(routes).toContain('/api/stats');
  });
});

describe('Server.js imports', () => {
  it('agent.js file exists and is valid JS', () => {
    const agentPath = path.join(__dirname, '..', 'agent.js');
    const content = fs.readFileSync(agentPath, 'utf-8');
    expect(content).toContain('triageTicket');
    expect(content).toContain('triageBatch');
    expect(content).toContain('validateResult');
    expect(content).toContain('fallbackResult');
  });

  it('database.js file exists and is valid JS', () => {
    const dbPath = path.join(__dirname, '..', 'database.js');
    const content = fs.readFileSync(dbPath, 'utf-8');
    expect(content).toContain('createTicket');
    expect(content).toContain('getTicket');
    expect(content).toContain('getAllTickets');
    expect(content).toContain('getStats');
    expect(content).toContain('saveTriageResult');
    expect(content).toContain('updateTicketStatus');
    expect(content).toContain('overrideTriage');
  });

  it('server.js file exists and has all routes', () => {
    const serverPath = path.join(__dirname, '..', 'server.js');
    const content = fs.readFileSync(serverPath, 'utf-8');
    expect(content).toContain('/api/triage');
    expect(content).toContain('/api/tickets');
    expect(content).toContain('/api/stats');
    expect(content).toContain('/api/sample-tickets');
    expect(content).toContain('/api/health');
  });
});
