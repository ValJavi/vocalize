import { midiToLabel, noteOptions } from './notes';

describe('midiToLabel (default = american)', () => {
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

describe('midiToLabel (roman)', () => {
  test('maps C to I across octaves', () => {
    expect(midiToLabel(48, 'roman')).toBe('I3');
    expect(midiToLabel(60, 'roman')).toBe('I4');
  });

  test('maps every diatonic step', () => {
    expect(midiToLabel(60, 'roman')).toBe('I4'); // C
    expect(midiToLabel(62, 'roman')).toBe('II4'); // D
    expect(midiToLabel(64, 'roman')).toBe('III4'); // E
    expect(midiToLabel(65, 'roman')).toBe('IV4'); // F
    expect(midiToLabel(67, 'roman')).toBe('V4'); // G
    expect(midiToLabel(69, 'roman')).toBe('VI4'); // A
    expect(midiToLabel(71, 'roman')).toBe('VII4'); // B
  });

  test('appends sharps to the roman numeral', () => {
    expect(midiToLabel(61, 'roman')).toBe('I#4');
    expect(midiToLabel(66, 'roman')).toBe('IV#4');
  });
});

describe('midiToLabel (solfege)', () => {
  test('maps the solfege ladder in C', () => {
    expect(midiToLabel(60, 'solfege')).toBe('Do4');
    expect(midiToLabel(62, 'solfege')).toBe('Re4');
    expect(midiToLabel(64, 'solfege')).toBe('Mi4');
    expect(midiToLabel(65, 'solfege')).toBe('Fa4');
    expect(midiToLabel(67, 'solfege')).toBe('Sol4');
    expect(midiToLabel(69, 'solfege')).toBe('La4');
    expect(midiToLabel(71, 'solfege')).toBe('Si4');
  });

  test('appends sharps to the solfege name', () => {
    expect(midiToLabel(61, 'solfege')).toBe('Do#4');
    expect(midiToLabel(68, 'solfege')).toBe('Sol#4');
  });

  test('respects octave numbering identical to american', () => {
    expect(midiToLabel(48, 'solfege')).toBe('Do3');
    expect(midiToLabel(72, 'solfege')).toBe('Do5');
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

  test('forwards notation to each label', () => {
    const options = noteOptions(60, 62, 'solfege');
    expect(options.map((o) => o.label)).toEqual(['Do4', 'Do#4', 'Re4']);
  });
});
