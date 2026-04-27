import { midiToLabel, noteOptions } from './notes';

describe('midiToLabel', () => {
  test('translates the central C', () => {
    expect(midiToLabel(60)).toBe('C4');
  });

  test('translates octave anchors', () => {
    expect(midiToLabel(48)).toBe('C3');
    expect(midiToLabel(72)).toBe('C5');
    expect(midiToLabel(0)).toBe('C-1');
  });

  test('uses sharps for accidentals', () => {
    expect(midiToLabel(61)).toBe('C#4');
    expect(midiToLabel(73)).toBe('C#5');
  });

  test('handles A4 (concert pitch reference)', () => {
    expect(midiToLabel(69)).toBe('A4');
  });
});

describe('noteOptions', () => {
  test('returns one entry per midi value in the inclusive range', () => {
    const options = noteOptions(60, 62);
    expect(options).toEqual([
      { midi: 60, label: 'C4' },
      { midi: 61, label: 'C#4' },
      { midi: 62, label: 'D4' },
    ]);
  });

  test('returns a single entry when min equals max', () => {
    expect(noteOptions(60, 60)).toEqual([{ midi: 60, label: 'C4' }]);
  });

  test('returns empty when min > max', () => {
    expect(noteOptions(72, 60)).toEqual([]);
  });
});
