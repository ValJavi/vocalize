import type { Midi } from './types';

export type Notation = 'american' | 'solfege';

export const NOTATIONS: { id: Notation; label: string }[] = [
  { id: 'american', label: 'Cifrado americano (C, D, E)' },
  { id: 'solfege', label: 'Nombres de las notas (Do, Re, Mi)' },
];

const NOTE_NAMES_BY_NOTATION: Record<Notation, readonly string[]> = {
  american: ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'],
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
