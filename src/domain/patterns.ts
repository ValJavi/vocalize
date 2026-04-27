import type { Pattern } from './types';

const beat = (semitoneOffset: number) => ({ semitoneOffset, durationBeats: 1 });

export const PATTERNS: Pattern[] = [
  {
    id: 'do-re-mi-re-do',
    name: 'Do - Re - Mi - Re - Do',
    steps: [0, 2, 4, 2, 0].map(beat),
  },
  {
    id: 'major-third',
    name: 'Tercera mayor (1-3-1)',
    steps: [0, 4, 0].map(beat),
  },
  {
    id: 'perfect-fifth',
    name: 'Quinta justa (1-5-1)',
    steps: [0, 7, 0].map(beat),
  },
  {
    id: 'octave',
    name: 'Octava (1-8-1)',
    steps: [0, 12, 0].map(beat),
  },
  {
    id: 'tonic-sustain',
    name: 'Repetición de tónica (1-1-1-1)',
    steps: [0, 0, 0, 0].map(beat),
  },
  {
    id: 'five-descending',
    name: 'Cinco descendente (5-4-3-2-1)',
    steps: [7, 5, 4, 2, 0].map(beat),
  },
  {
    id: 'major-arpeggio',
    name: 'Arpegio mayor (1-3-5-3-1)',
    steps: [0, 4, 7, 4, 0].map(beat),
  },
  {
    id: 'minor-arpeggio',
    name: 'Arpegio menor (1-♭3-5-♭3-1)',
    steps: [0, 3, 7, 3, 0].map(beat),
  },
  {
    id: 'major-arpeggio-octave',
    name: 'Arpegio mayor + octava (1-3-5-8-5-3-1)',
    steps: [0, 4, 7, 12, 7, 4, 0].map(beat),
  },
  {
    id: 'major-scale-5',
    name: 'Escala mayor 5 notas (1-2-3-4-5-4-3-2-1)',
    steps: [0, 2, 4, 5, 7, 5, 4, 2, 0].map(beat),
  },
  {
    id: 'major-scale-full',
    name: 'Escala mayor completa (1-2-3-4-5-6-7-8-7-6-5-4-3-2-1)',
    steps: [0, 2, 4, 5, 7, 9, 11, 12, 11, 9, 7, 5, 4, 2, 0].map(beat),
  },
];
