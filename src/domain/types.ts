export type Midi = number;

export type PatternStep = {
  semitoneOffset: number;
  durationBeats: number;
};

export type Pattern = {
  id: string;
  name: string;
  steps: PatternStep[];
  isCustom?: boolean;
};

export type Range = {
  min: Midi;
  max: Midi;
};

export type ExerciseConfig = {
  pattern: Pattern;
  range: Range;
  bpm: number;
  gapBeats: number;
};
