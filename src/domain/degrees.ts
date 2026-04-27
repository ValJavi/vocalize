// Scale degrees as singers/musicians refer to them, mapped to semitone
// distance from the tonic. We expose only flats for accidentals (no
// equivalent sharp notation) to keep the picker compact and unambiguous.

export type DegreeId =
  | '1'
  | 'b2'
  | '2'
  | 'b3'
  | '3'
  | '4'
  | 'b5'
  | '5'
  | 'b6'
  | '6'
  | 'b7'
  | '7'
  | '8'
  | 'b9'
  | '9'
  | 'b10'
  | '10';

export type Degree = {
  id: DegreeId;
  label: string;
  semitones: number;
};

export const DEGREES: Degree[] = [
  { id: '1', label: '1', semitones: 0 },
  { id: 'b2', label: '♭2', semitones: 1 },
  { id: '2', label: '2', semitones: 2 },
  { id: 'b3', label: '♭3', semitones: 3 },
  { id: '3', label: '3', semitones: 4 },
  { id: '4', label: '4', semitones: 5 },
  { id: 'b5', label: '♭5', semitones: 6 },
  { id: '5', label: '5', semitones: 7 },
  { id: 'b6', label: '♭6', semitones: 8 },
  { id: '6', label: '6', semitones: 9 },
  { id: 'b7', label: '♭7', semitones: 10 },
  { id: '7', label: '7', semitones: 11 },
  { id: '8', label: '8 (oct)', semitones: 12 },
  { id: 'b9', label: '♭9', semitones: 13 },
  { id: '9', label: '9', semitones: 14 },
  { id: 'b10', label: '♭10', semitones: 15 },
  { id: '10', label: '10', semitones: 16 },
];

const DEGREE_BY_SEMITONES = new Map<number, Degree>(
  DEGREES.map((d) => [d.semitones, d]),
);

export function degreeFromSemitones(semitones: number): Degree | null {
  return DEGREE_BY_SEMITONES.get(semitones) ?? null;
}

export function semitonesFromDegreeId(id: DegreeId): number {
  const found = DEGREES.find((d) => d.id === id);
  if (!found) throw new Error(`Unknown degree: ${id}`);
  return found.semitones;
}
