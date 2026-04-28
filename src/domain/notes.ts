import type { Midi } from './types';

export type Notation = 'american' | 'roman' | 'solfege';

export const NOTATIONS: { id: Notation; label: string }[] = [
  { id: 'american', label: 'Cifrado americano (C, D, E)' },
  { id: 'roman', label: 'Cifrado por grados (I, II, III)' },
  { id: 'solfege', label: 'Nombres de las notas (Do, Re, Mi)' },
];

const NOTE_NAMES_BY_NOTATION: Record<Notation, readonly string[]> = {
  american: ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'],
  roman: ['I', 'I#', 'II', 'II#', 'III', 'IV', 'IV#', 'V', 'V#', 'VI', 'VI#', 'VII'],
  solfege: ['Do', 'Do#', 'Re', 'Re#', 'Mi', 'Fa', 'Fa#', 'Sol', 'Sol#', 'La', 'La#', 'Si'],
};

export function midiToLabel(midi: Midi, notation: Notation = 'american'): string {
  const octave = Math.floor(midi / 12) - 1;
  const name = NOTE_NAMES_BY_NOTATION[notation][midi % 12];
  return `${name}${octave}`;
}

export function noteOptions(
  min: Midi,
  max: Midi,
  notation: Notation = 'american',
): { midi: Midi; label: string }[] {
  const out: { midi: Midi; label: string }[] = [];
  for (let m = min; m <= max; m++) {
    out.push({ midi: m, label: midiToLabel(m, notation) });
  }
  return out;
}
