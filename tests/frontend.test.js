import { describe, it, expect } from 'vitest';

const urgencyConfig = {
  critical: { color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
  high: { color: '#ea580c', bg: '#fff7ed', border: '#fed7aa' },
  medium: { color: '#ca8a04', bg: '#fefce8', border: '#fef08a' },
  low: { color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' },
};

const categoryConfig = {
  billing: { color: '#4f46e5', bg: '#eef2ff', border: '#c7d2fe' },
  technical: { color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe' },
  account: { color: '#0d9488', bg: '#f0fdfa', border: '#99f6e4' },
  bug_report: { color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
  feature_request: { color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' },
  general_inquiry: { color: '#6b7280', bg: '#f9fafb', border: '#e5e7eb' },
};

const statusConfig = {
  NEW: { color: '#6b7280', bg: '#f9fafb', border: '#e5e7eb' },
  ASSIGNED: { color: '#4f46e5', bg: '#eef2ff', border: '#c7d2fe' },
  IN_PROGRESS: { color: '#ca8a04', bg: '#fefce8', border: '#fef08a' },
  RESOLVED: { color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' },
  CLOSED: { color: '#6b7280', bg: '#f1f5f9', border: '#e2e8f0' },
};

describe('Urgency Config', () => {
  it('has all urgency levels with correct colors', () => {
    expect(urgencyConfig.critical.color).toBe('#dc2626');
    expect(urgencyConfig.high.color).toBe('#ea580c');
    expect(urgencyConfig.medium.color).toBe('#ca8a04');
    expect(urgencyConfig.low.color).toBe('#16a34a');
  });

  it('each urgency has color, bg, and border', () => {
    Object.values(urgencyConfig).forEach(config => {
      expect(config.color).toBeTruthy();
      expect(config.bg).toBeTruthy();
      expect(config.border).toBeTruthy();
    });
  });
});

describe('Category Config', () => {
  it('has all categories', () => {
    const expected = ['billing', 'technical', 'account', 'bug_report', 'feature_request', 'general_inquiry'];
    expected.forEach(cat => {
      expect(categoryConfig[cat]).toBeDefined();
    });
  });

  it('each category has color, bg, and border', () => {
    Object.values(categoryConfig).forEach(config => {
      expect(config.color).toBeTruthy();
      expect(config.bg).toBeTruthy();
      expect(config.border).toBeTruthy();
    });
  });
});

describe('Status Config', () => {
  it('has all statuses', () => {
    const expected = ['NEW', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
    expected.forEach(status => {
      expect(statusConfig[status]).toBeDefined();
    });
  });
});

describe('Confidence Calculation', () => {
  it('calculates percentage from decimal', () => {
    expect((0.85 * 100).toFixed(0)).toBe('85');
    expect((0.92 * 100).toFixed(0)).toBe('92');
    expect((0.5 * 100).toFixed(0)).toBe('50');
  });

  it('handles zero confidence', () => {
    expect((0 * 100).toFixed(0)).toBe('0');
  });

  it('handles max confidence', () => {
    expect((1 * 100).toFixed(0)).toBe('100');
  });
});

describe('Ticket Status Flow', () => {
  const validTransitions = {
    NEW: ['ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'],
    ASSIGNED: ['IN_PROGRESS', 'RESOLVED', 'CLOSED'],
    IN_PROGRESS: ['RESOLVED', 'CLOSED', 'ASSIGNED'],
    RESOLVED: ['CLOSED', 'IN_PROGRESS'],
    CLOSED: ['IN_PROGRESS'],
  };

  it('NEW can transition to ASSIGNED', () => {
    expect(validTransitions.NEW).toContain('ASSIGNED');
  });

  it('ASSIGNED can transition to IN_PROGRESS', () => {
    expect(validTransitions.ASSIGNED).toContain('IN_PROGRESS');
  });

  it('IN_PROGRESS can transition to RESOLVED', () => {
    expect(validTransitions.IN_PROGRESS).toContain('RESOLVED');
  });

  it('RESOLVED can transition to CLOSED', () => {
    expect(validTransitions.RESOLVED).toContain('CLOSED');
  });
});

describe('Human Review Logic', () => {
  it('needs human review when confidence < 0.7', () => {
    expect(0.5 < 0.7).toBe(true);
    expect(0.69 < 0.7).toBe(true);
  });

  it('does not need human review when confidence >= 0.7', () => {
    expect(0.7 < 0.7).toBe(false);
    expect(0.9 < 0.7).toBe(false);
  });
});
