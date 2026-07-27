import { describe, it, expect } from 'vitest';

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

describe('validateResult', () => {
  it('passes valid result through unchanged', () => {
    const input = {
      category: 'billing',
      urgency: 'high',
      confidence: 0.9,
      routing_team: 'billing_team',
      reasoning: 'Payment issue reported',
      needs_human_review: false,
    };
    const result = validateResult({ ...input });
    expect(result).toEqual(input);
  });

  it('fixes invalid category to general_inquiry', () => {
    const result = validateResult({ category: 'invalid_cat', urgency: 'high', confidence: 0.8, routing_team: 'engineering', reasoning: 'test', needs_human_review: false });
    expect(result.category).toBe('general_inquiry');
  });

  it('fixes invalid urgency to medium', () => {
    const result = validateResult({ category: 'billing', urgency: 'urgent!!!', confidence: 0.8, routing_team: 'billing_team', reasoning: 'test', needs_human_review: false });
    expect(result.urgency).toBe('medium');
  });

  it('fixes invalid routing_team to support_l1', () => {
    const result = validateResult({ category: 'billing', urgency: 'high', confidence: 0.8, routing_team: 'random_team', reasoning: 'test', needs_human_review: false });
    expect(result.routing_team).toBe('support_l1');
  });

  it('fixes invalid confidence to 0.5', () => {
    const result = validateResult({ category: 'billing', urgency: 'high', confidence: 'abc', routing_team: 'billing_team', reasoning: 'test', needs_human_review: false });
    expect(result.confidence).toBe(0.5);
  });

  it('fixes confidence out of range to 0.5', () => {
    const result = validateResult({ category: 'billing', urgency: 'high', confidence: 1.5, routing_team: 'billing_team', reasoning: 'test', needs_human_review: false });
    expect(result.confidence).toBe(0.5);
  });

  it('sets needs_human_review true when confidence < 0.7', () => {
    const result = validateResult({ category: 'billing', urgency: 'high', confidence: 0.4, routing_team: 'billing_team', reasoning: 'test' });
    expect(result.needs_human_review).toBe(true);
  });

  it('fixes empty reasoning', () => {
    const result = validateResult({ category: 'billing', urgency: 'high', confidence: 0.8, routing_team: 'billing_team', reasoning: '', needs_human_review: false });
    expect(result.reasoning).toBe('Unable to generate reasoning.');
  });
});

describe('fallbackResult', () => {
  it('returns safe defaults', () => {
    const result = fallbackResult();
    expect(result.category).toBe('general_inquiry');
    expect(result.urgency).toBe('medium');
    expect(result.confidence).toBe(0.3);
    expect(result.routing_team).toBe('support_l1');
    expect(result.needs_human_review).toBe(true);
    expect(result.reasoning).toBeTruthy();
  });
});

describe('System prompt constants', () => {
  it('has all valid categories', () => {
    expect(VALID_CATEGORIES).toContain('billing');
    expect(VALID_CATEGORIES).toContain('technical');
    expect(VALID_CATEGORIES).toContain('account');
    expect(VALID_CATEGORIES).toContain('bug_report');
    expect(VALID_CATEGORIES).toContain('feature_request');
    expect(VALID_CATEGORIES).toContain('general_inquiry');
  });

  it('has all valid urgency levels', () => {
    expect(VALID_URGENCY).toContain('critical');
    expect(VALID_URGENCY).toContain('high');
    expect(VALID_URGENCY).toContain('medium');
    expect(VALID_URGENCY).toContain('low');
  });

  it('has all valid routing teams', () => {
    expect(VALID_TEAMS).toContain('billing_team');
    expect(VALID_TEAMS).toContain('engineering');
    expect(VALID_TEAMS).toContain('customer_success');
    expect(VALID_TEAMS).toContain('product');
    expect(VALID_TEAMS).toContain('support_l1');
  });
});
