import { advanceTonic, type ModulationState } from './modulation';
import type { Range } from './types';

const RANGE_C3_C5: Range = { min: 48, max: 72 };

describe('advanceTonic', () => {
  describe('ascending', () => {
    test('moves up one semitone when below max', () => {
      expect(advanceTonic({ tonic: 60, direction: 'up' }, RANGE_C3_C5)).toEqual({
        tonic: 61,
        direction: 'up',
      });
    });

    test('flips to descending and moves down at the max', () => {
      expect(advanceTonic({ tonic: 72, direction: 'up' }, RANGE_C3_C5)).toEqual({
        tonic: 71,
        direction: 'down',
      });
    });
  });

  describe('descending', () => {
    test('moves down one semitone when above min', () => {
      expect(advanceTonic({ tonic: 60, direction: 'down' }, RANGE_C3_C5)).toEqual({
        tonic: 59,
        direction: 'down',
      });
    });

    test('returns null at the min (exercise ends)', () => {
      expect(advanceTonic({ tonic: 48, direction: 'down' }, RANGE_C3_C5)).toBeNull();
    });
  });

  describe('edge ranges', () => {
    test('single-note range ends after one tonic when ascending', () => {
      const range: Range = { min: 60, max: 60 };
      expect(advanceTonic({ tonic: 60, direction: 'up' }, range)).toBeNull();
    });

    test('two-note range yields min, max, min', () => {
      const range: Range = { min: 60, max: 61 };
      const sequence = collectSequence({ tonic: 60, direction: 'up' }, range);
      expect(sequence).toEqual([60, 61, 60]);
    });

    test('three-note range yields full ascend-descend', () => {
      const range: Range = { min: 60, max: 62 };
      const sequence = collectSequence({ tonic: 60, direction: 'up' }, range);
      expect(sequence).toEqual([60, 61, 62, 61, 60]);
    });
  });

  describe('full sequence', () => {
    test('C3 to C5 goes up then down ending on C3', () => {
      const sequence = collectSequence({ tonic: 48, direction: 'up' }, RANGE_C3_C5);
      const expected = [
        ...range(48, 72), // ascending: 48, 49, ..., 72
        ...range(71, 48), // descending: 71, 70, ..., 48
      ];
      expect(sequence).toEqual(expected);
    });

    test('every tonic except the endpoints appears exactly twice', () => {
      const sequence = collectSequence({ tonic: 48, direction: 'up' }, RANGE_C3_C5);
      const counts = new Map<number, number>();
      for (const t of sequence) counts.set(t, (counts.get(t) ?? 0) + 1);
      expect(counts.get(48)).toBe(2);
      expect(counts.get(72)).toBe(1);
      expect(counts.get(60)).toBe(2);
    });
  });
});

function collectSequence(start: ModulationState, range: Range): number[] {
  const out: number[] = [start.tonic];
  let state: ModulationState | null = start;
  while (state) {
    state = advanceTonic(state, range);
    if (state) out.push(state.tonic);
  }
  return out;
}

function range(from: number, to: number): number[] {
  const step = from <= to ? 1 : -1;
  const out: number[] = [];
  for (let i = from; step > 0 ? i <= to : i >= to; i += step) {
    out.push(i);
  }
  return out;
}
