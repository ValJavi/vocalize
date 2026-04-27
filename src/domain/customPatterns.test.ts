import {
  loadCustomPatterns,
  saveCustomPatterns,
  buildCustomPattern,
  type CustomPattern,
} from './customPatterns';

const STORAGE_KEY = 'vocalize-custom-patterns';

beforeEach(() => {
  localStorage.clear();
});

describe('loadCustomPatterns', () => {
  test('returns empty array when storage is empty', () => {
    expect(loadCustomPatterns()).toEqual([]);
  });

  test('returns empty array on malformed JSON without throwing', () => {
    localStorage.setItem(STORAGE_KEY, 'not-json{');
    expect(loadCustomPatterns()).toEqual([]);
  });

  test('returns empty array when stored value is not an array', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ wat: 1 }));
    expect(loadCustomPatterns()).toEqual([]);
  });

  test('filters out entries that fail validation', () => {
    const valid = buildCustomPattern('Real', [{ semitoneOffset: 0, durationBeats: 1 }]);
    const invalid = { id: 'x', name: 'no-steps', steps: [], isCustom: true, createdAt: '' };
    localStorage.setItem(STORAGE_KEY, JSON.stringify([valid, invalid]));
    const loaded = loadCustomPatterns();
    expect(loaded).toHaveLength(1);
    expect(loaded[0].id).toBe(valid.id);
  });

  test('rejects steps with non-positive durations', () => {
    const tampered = {
      id: 'x',
      name: 'broken',
      steps: [{ semitoneOffset: 0, durationBeats: 0 }],
      isCustom: true,
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify([tampered]));
    expect(loadCustomPatterns()).toEqual([]);
  });
});

describe('saveCustomPatterns + loadCustomPatterns', () => {
  test('round-trips a single pattern', () => {
    const p = buildCustomPattern('My pattern', [
      { semitoneOffset: 0, durationBeats: 1 },
      { semitoneOffset: 4, durationBeats: 0.5 },
    ]);
    saveCustomPatterns([p]);
    expect(loadCustomPatterns()).toEqual([p]);
  });

  test('round-trips multiple patterns preserving order', () => {
    const a = buildCustomPattern('A', [{ semitoneOffset: 0, durationBeats: 1 }]);
    const b = buildCustomPattern('B', [{ semitoneOffset: 7, durationBeats: 1 }]);
    saveCustomPatterns([a, b]);
    const loaded = loadCustomPatterns();
    expect(loaded.map((p) => p.id)).toEqual([a.id, b.id]);
  });

  test('overwrites previous content on subsequent save', () => {
    const a = buildCustomPattern('A', [{ semitoneOffset: 0, durationBeats: 1 }]);
    saveCustomPatterns([a]);
    saveCustomPatterns([]);
    expect(loadCustomPatterns()).toEqual([]);
  });
});

describe('buildCustomPattern', () => {
  test('marks as custom and timestamps creation', () => {
    const p = buildCustomPattern('Test', [{ semitoneOffset: 0, durationBeats: 1 }]);
    expect(p.isCustom).toBe(true);
    expect(p.createdAt).toMatch(/\d{4}-\d{2}-\d{2}T/);
  });

  test('generates unique ids for patterns built in quick succession', () => {
    const ids = new Set<string>();
    for (let i = 0; i < 50; i++) {
      ids.add(buildCustomPattern('p', [{ semitoneOffset: 0, durationBeats: 1 }]).id);
    }
    expect(ids.size).toBe(50);
  });

  test('generated ids are namespaced with custom- prefix', () => {
    const p = buildCustomPattern('Test', [{ semitoneOffset: 0, durationBeats: 1 }]);
    expect(p.id.startsWith('custom-')).toBe(true);
  });
});

describe('persistence type discipline', () => {
  test('rejects entries that are not marked isCustom', () => {
    const fake: Omit<CustomPattern, 'isCustom'> & { isCustom: false } = {
      id: 'x',
      name: 'fake',
      steps: [{ semitoneOffset: 0, durationBeats: 1 }],
      isCustom: false,
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify([fake]));
    expect(loadCustomPatterns()).toEqual([]);
  });
});
