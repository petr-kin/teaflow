import { DEFAULTS } from '../lib/teas';

describe('Tea Defaults', () => {
  const expectedTeas = ['green', 'black', 'oolong', 'white', 'puerh', 'herbal'];

  it('includes all required tea types', () => {
    expectedTeas.forEach(teaType => {
      expect(DEFAULTS[teaType]).toBeDefined();
    });
  });

  it('has proper tea profile structure', () => {
    Object.entries(DEFAULTS).forEach(([key, tea]) => {
      expect(tea).toHaveProperty('id', key);
      expect(tea).toHaveProperty('name');
      expect(tea).toHaveProperty('type');
      expect(tea).toHaveProperty('baseTempC');
      expect(tea).toHaveProperty('defaultRatio');
      expect(tea).toHaveProperty('baseScheduleSec');
      
      // Validate types
      expect(typeof tea.id).toBe('string');
      expect(typeof tea.name).toBe('string');
      expect(typeof tea.type).toBe('string');
      expect(typeof tea.baseTempC).toBe('number');
      expect(typeof tea.defaultRatio).toBe('number');
      expect(Array.isArray(tea.baseScheduleSec)).toBe(true);
    });
  });

  it('has reasonable temperature ranges', () => {
    Object.values(DEFAULTS).forEach(tea => {
      expect(tea.baseTempC).toBeGreaterThanOrEqual(60);
      expect(tea.baseTempC).toBeLessThanOrEqual(100);
    });
  });

  it('has non-empty steeping schedules', () => {
    Object.values(DEFAULTS).forEach(tea => {
      expect(tea.baseScheduleSec.length).toBeGreaterThan(0);
      tea.baseScheduleSec.forEach(seconds => {
        expect(seconds).toBeGreaterThan(0);
        expect(seconds).toBeLessThanOrEqual(600); // Max 10 minutes
      });
    });
  });

  it('has proper ratios', () => {
    Object.values(DEFAULTS).forEach(tea => {
      expect(tea.defaultRatio).toBeGreaterThan(0);
      expect(tea.defaultRatio).toBeLessThanOrEqual(1);
    });
  });

  describe('specific tea requirements', () => {
    it('green tea has appropriate parameters', () => {
      const green = DEFAULTS.green;
      expect(green.baseTempC).toBeLessThan(85); // Green tea shouldn't be too hot
      expect(green.baseScheduleSec).toContain(5); // Should have short steeps
    });

    it('black tea has appropriate parameters', () => {
      const black = DEFAULTS.black;
      expect(black.baseTempC).toBeGreaterThan(90); // Black tea needs hot water
    });

    it('herbal tea has appropriate parameters', () => {
      const herbal = DEFAULTS.herbal;
      expect(herbal.baseTempC).toBe(100); // Herbal teas use boiling water
      expect(herbal.baseScheduleSec).toContain(300); // Often longer steeps
    });

    it('white tea has appropriate parameters', () => {
      const white = DEFAULTS.white;
      expect(white.baseTempC).toBeLessThan(90); // White tea is delicate
    });

    it('oolong tea has multiple steeps', () => {
      const oolong = DEFAULTS.oolong;
      expect(oolong.baseScheduleSec.length).toBeGreaterThan(5); // Oolong has many steeps
    });

    it('puerh tea has appropriate parameters', () => {
      const puerh = DEFAULTS.puerh;
      expect(puerh.baseTempC).toBeGreaterThan(95); // Pu-erh uses very hot water
      expect(puerh.baseScheduleSec.length).toBeGreaterThan(5); // Many steeps
    });
  });

  it('maintains cultural authenticity in naming', () => {
    expect(DEFAULTS.puerh.name).toBe('Pu-erh'); // Correct spelling
    expect(DEFAULTS.oolong.name).toBe('Oolong'); // Standard name
    expect(DEFAULTS.green.name).toBe('Green'); // Simple, clear
    expect(DEFAULTS.black.name).toBe('Black'); // Standard
    expect(DEFAULTS.white.name).toBe('White'); // Standard
    expect(DEFAULTS.herbal.name).toBe('Herbal'); // Inclusive term
  });
});