import { DEGREES, degreeFromSemitones, semitonesFromDegreeId } from './degrees';

describe('DEGREES', () => {
  test('starts at the tonic with 0 semitones', () => {
    expect(DEGREES[0]).toEqual({ id: '1', label: '1', semitones: 0 });
  });

  test('covers every semitone from 0 to 16 with no gaps', () => {
    expect(DEGREES.length).toBe(17);
    for (let i = 0; i < DEGREES.length; i++) {
      expect(DEGREES[i].semitones).toBe(i);
    }
  });

  test('uses flats for accidentals only (no sharps in labels)', () => {
    for (const d of DEGREES) {
      expect(d.label.includes('#')).toBe(false);
    }
  });

  test('marks the octave', () => {
    const octave = DEGREES.find((d) => d.semitones === 12);
    expect(octave?.id).toBe('8');
    expect(octave?.label).toMatch(/oct/i);
  });
});

describe('degreeFromSemitones', () => {
  test('finds the unison', () => {
    expect(degreeFromSemitones(0)?.id).toBe('1');
  });

  test('finds the perfect fifth', () => {
    expect(degreeFromSemitones(7)?.id).toBe('5');
  });

  test('finds the octave', () => {
    expect(degreeFromSemitones(12)?.id).toBe('8');
  });

  test('returns null for out-of-range semitones', () => {
    expect(degreeFromSemitones(-1)).toBeNull();
    expect(degreeFromSemitones(17)).toBeNull();
  });
});

describe('semitonesFromDegreeId', () => {
  test('round-trips with degreeFromSemitones', () => {
    for (const d of DEGREES) {
      expect(semitonesFromDegreeId(d.id)).toBe(d.semitones);
    }
  });

  test('throws on unknown id', () => {
    expect(() => semitonesFromDegreeId('99' as never)).toThrow();
  });
});
