import Groq from 'groq-sdk';
import { createTicket, saveTriageResult, updateTicketStatus } from './database.js';

let groq;
function getGroq() {
  if (!groq) {
    groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return groq;
}

const SYSTEM_PROMPT = `You are a support ticket triage agent for a SaaS company. Your job is to classify incoming support tickets and route them to the correct team.

For each ticket, return ONLY a valid JSON object with these exact fields:
- category: One of "billing", "technical", "account", "bug_report", "feature_request", "general_inquiry"
- urgency: One of "critical", "high", "medium", "low"
- confidence: A number between 0.0 and 1.0
- routing_team: One of "billing_team", "engineering", "customer_success", "product", "support_l1"
- reasoning: A short 1-2 sentence explanation of your classification
- needs_human_review: true if confidence is below 0.7 or if the ticket is ambiguous, unclear, or could fit multiple categories

Classification rules:
- Login issues, password problems, account access → category: "account", urgency: "high"
- Payment failures, double charges, refund requests → category: "billing", urgency: "high" or "critical"
- App crashes, errors, broken features → category: "bug_report", urgency: "high"
- Performance issues, slow loading, glitches → category: "technical", urgency: "medium"
- New feature requests, suggestions → category: "feature_request", urgency: "low"
- General questions, how-to, information requests → category: "general_inquiry", urgency: "low"
- Security concerns, data breaches → category: "technical", urgency: "critical"

Routing rules:
- billing → "billing_team"
- technical, bug_report → "engineering"
- account → "customer_success"
- feature_request → "product"
- general_inquiry → "support_l1"

Return ONLY the JSON object. No markdown, no explanation before or after.`;

const VALID_CATEGORIES = ['billing', 'technical', 'account', 'bug_report', 'feature_request', 'general_inquiry'];
const VALID_URGENCY = ['critical', 'high', 'medium', 'low'];
const VALID_TEAMS = ['billing_team', 'engineering', 'customer_success', 'product', 'support_l1'];

function validateResult(result) {
  if (!VALID_CATEGORIES.includes(result.category)) result.category = 'general_inquiry';
  if (!VALID_URGENCY.includes(result.urgency)) result.urgency = 'medium';
  if (!VALID_TEAMS.includes(result.routing_team)) result.routing_team = 'support_l1';
  if (typeof result.confidence !== 'number' || result.confidence < 0 || result.confidence > 1) result.confidence = 0.5;
  if (typeof result.needs_human_review !== 'boolean') result.needs_human_review = result.confidence < 0.7;
  if (typeof result.reasoning !== 'string' || result.reasoning.length === 0) result.reasoning = 'Unable to generate reasoning.';
  return result;
}

function fallbackResult() {
  return {
    category: 'general_inquiry',
    urgency: 'medium',
    confidence: 0.3,
    routing_team: 'support_l1',
    reasoning: 'Could not classify automatically. Manual review required.',
    needs_human_review: true,
  };
}

export async function triageTicket(ticket) {
  const { subject, body } = ticket;
  if (!subject || !body) throw new Error('Ticket must have subject and body');

  const userMessage = `Subject: ${subject}\n\nBody: ${body}`;
  let aiResult;

  try {
    const response = await getGroq().chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.2,
      max_tokens: 500,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      aiResult = fallbackResult();
    } else {
      try {
        const parsed = JSON.parse(content);
        aiResult = validateResult(parsed);
        if (aiResult.confidence < 0.7) aiResult.needs_human_review = true;
      } catch {
        aiResult = fallbackResult();
      }
    }
  } catch (err) {
    console.error('Groq API error:', err.message);
    aiResult = fallbackResult();
  }

  try {
    const ticketId = await createTicket({
      subject,
      body,
      customer_name: ticket.customer_name || null,
      customer_email: ticket.customer_email || null,
    });

    await saveTriageResult({
      ticket_id: ticketId,
      category: aiResult.category,
      urgency: aiResult.urgency,
      confidence: aiResult.confidence,
      routing_team: aiResult.routing_team,
      reasoning: aiResult.reasoning,
      needs_human_review: aiResult.needs_human_review,
      model_used: 'llama-3.3-70b-versatile',
    });

    if (!aiResult.needs_human_review) {
      await updateTicketStatus(ticketId, 'ASSIGNED');
    }

    return {
      ticket_id: ticketId,
      subject,
      body,
      customer_name: ticket.customer_name || null,
      customer_email: ticket.customer_email || null,
      status: aiResult.needs_human_review ? 'NEW' : 'ASSIGNED',
      ...aiResult,
      triaged_at: new Date().toISOString(),
    };
  } catch (err) {
    console.error('Database error:', err.message);
    return {
      ticket_id: null,
      subject,
      body,
      ...aiResult,
      triaged_at: new Date().toISOString(),
    };
  }
}

export async function triageBatch(tickets) {
  const results = [];
  for (const ticket of tickets) {
    const result = await triageTicket(ticket);
    results.push(result);
  }
  return results;
}
