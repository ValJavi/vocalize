import { describe, expect, test } from 'vitest';
import { patternOffsetSpan, vocalToTonicRange } from './range';
import type { Pattern } from './types';

const pattern = (offsets: number[]): Pattern => ({
  id: 'test',
  name: 'Test',
  steps: offsets.map((semitoneOffset) => ({ semitoneOffset, durationBeats: 1 })),
});

describe('patternOffsetSpan', () => {
  test('returns 0..max for an all-positive pattern', () => {
    expect(patternOffsetSpan(pattern([0, 4, 7, 4, 0]))).toEqual({ min: 0, max: 7 });
  });

  test('returns 0..0 for a single-tonic pattern', () => {
    expect(patternOffsetSpan(pattern([0]))).toEqual({ min: 0, max: 0 });
  });

  test('always includes 0 even when no step lands on the tonic', () => {
    // Lead-in and nexo play the tonic, so the span has to cover it
    // even when the pattern itself never explicitly references it.
    expect(patternOffsetSpan(pattern([4, 7, 4]))).toEqual({ min: 0, max: 7 });
  });

  test('handles patterns that reach below the tonic', () => {
    expect(patternOffsetSpan(pattern([0, -3, 0]))).toEqual({ min: -3, max: 0 });
  });

  test('handles patterns that span both above and below the tonic', () => {
    expect(patternOffsetSpan(pattern([-5, 0, 7]))).toEqual({ min: -5, max: 7 });
  });
});

describe('vocalToTonicRange', () => {
  test('shrinks the upper end of the tonic range by the pattern peak', () => {
    // Vocal range C4 (60) - C5 (72), arpeggio reaching +7 semitones from
    // tonic. Tonic max must be C5 - 7 = F4 (65) so the highest sung note
    // never exceeds C5.
    const result = vocalToTonicRange({ min: 60, max: 72 }, pattern([0, 4, 7]));
    expect(result).toEqual({ min: 60, max: 65 });
  });

  test('shifts the lower end up when pattern reaches below the tonic', () => {
    // Pattern dips 3 semitones below tonic. To keep that note in range,
    // tonic min has to rise by 3.
    const result = vocalToTonicRange({ min: 60, max: 72 }, pattern([0, -3, 0]));
    expect(result).toEqual({ min: 63, max: 72 });
  });

  test('returns null when the pattern is wider than the vocal range', () => {
    // Octave pattern needs 12 semitones; vocal range is only 5.
    const result = vocalToTonicRange({ min: 60, max: 65 }, pattern([0, 12, 0]));
    expect(result).toBeNull();
  });

  test('returns a single-tonic range when vocal range exactly matches the pattern span', () => {
    // Vocal range of 7 semitones with a pattern reaching +7 means there is
    // exactly one valid tonic.
    const result = vocalToTonicRange({ min: 60, max: 67 }, pattern([0, 4, 7]));
    expect(result).toEqual({ min: 60, max: 60 });
  });

  test('full vocal range maps to full tonic range for a single-tonic pattern', () => {
    const result = vocalToTonicRange({ min: 48, max: 72 }, pattern([0]));
    expect(result).toEqual({ min: 48, max: 72 });
  });
});
