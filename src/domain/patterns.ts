import type { Pattern } from './types';

const beat = (semitoneOffset: number) => ({ semitoneOffset, durationBeats: 1 });
const half = (semitoneOffset: number) => ({ semitoneOffset, durationBeats: 2 });
const whole = (semitoneOffset: number) => ({ semitoneOffset, durationBeats: 4 });

export const PATTERNS: Pattern[] = [
  {
    id: 'major-scale-3',
    name: 'Escala mayor 3 notas (1-2-3-2-1)',
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
    steps: [0, 7, 0].map(half),
  },
  {
    id: 'octave',
    name: 'Octava (1-8-1)',
    steps: [0, 12, 0].map(half),
  },
  {
    id: 'tonic-sustain',
    name: 'Tónica sostenida (1)',
    steps: [whole(0)],
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
  {
    id: 'minor-third',
    name: 'Tercera menor (1-♭3-1)',
    steps: [0, 3, 0].map(beat),
  },
  {
    id: 'minor-scale-3',
    name: 'Escala menor 3 notas (1-2-♭3-2-1)',
    steps: [0, 2, 3, 2, 0].map(beat),
  },
  {
    id: 'minor-scale-5',
    name: 'Escala menor 5 notas (1-2-♭3-4-5-4-♭3-2-1)',
    steps: [0, 2, 3, 5, 7, 5, 3, 2, 0].map(beat),
  },
  {
    id: 'five-descending-minor',
    name: 'Cinco descendente menor (5-4-♭3-2-1)',
    steps: [7, 5, 3, 2, 0].map(beat),
  },
  {
    id: 'minor-scale-full',
    name: 'Escala menor natural completa (1-2-♭3-4-5-♭6-♭7-8-♭7-♭6-5-4-♭3-2-1)',
    steps: [0, 2, 3, 5, 7, 8, 10, 12, 10, 8, 7, 5, 3, 2, 0].map(beat),
  },
];
