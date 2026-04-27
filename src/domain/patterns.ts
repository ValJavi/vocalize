import type { Pattern } from './types';

export const PATTERNS: Pattern[] = [
  {
    id: 'do-re-mi-re-do',
    name: 'Do - Re - Mi - Re - Do',
    steps: [
      { semitoneOffset: 0, durationBeats: 1 },
      { semitoneOffset: 2, durationBeats: 1 },
      { semitoneOffset: 4, durationBeats: 1 },
      { semitoneOffset: 2, durationBeats: 1 },
      { semitoneOffset: 0, durationBeats: 1 },
    ],
  },
  {
    id: 'major-arpeggio',
    name: 'Arpegio mayor (1-3-5-3-1)',
    steps: [
      { semitoneOffset: 0, durationBeats: 1 },
      { semitoneOffset: 4, durationBeats: 1 },
      { semitoneOffset: 7, durationBeats: 1 },
      { semitoneOffset: 4, durationBeats: 1 },
      { semitoneOffset: 0, durationBeats: 1 },
    ],
  },
  {
    id: 'major-scale-5',
    name: 'Escala mayor 5 notas (1-2-3-4-5-4-3-2-1)',
    steps: [
      { semitoneOffset: 0, durationBeats: 1 },
      { semitoneOffset: 2, durationBeats: 1 },
      { semitoneOffset: 4, durationBeats: 1 },
      { semitoneOffset: 5, durationBeats: 1 },
      { semitoneOffset: 7, durationBeats: 1 },
      { semitoneOffset: 5, durationBeats: 1 },
      { semitoneOffset: 4, durationBeats: 1 },
      { semitoneOffset: 2, durationBeats: 1 },
      { semitoneOffset: 0, durationBeats: 1 },
    ],
  },
];
