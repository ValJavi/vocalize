import type { Midi } from './types';

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export function midiToLabel(midi: Midi): string {
  const octave = Math.floor(midi / 12) - 1;
  const name = NOTE_NAMES[midi % 12];
  return `${name}${octave}`;
}

export function noteOptions(min: Midi, max: Midi): { midi: Midi; label: string }[] {
  const out: { midi: Midi; label: string }[] = [];
  for (let m = min; m <= max; m++) {
    out.push({ midi: m, label: midiToLabel(m) });
  }
  return out;
}
