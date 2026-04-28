import type { Pattern, Range } from './types';

// Semitone span of a pattern relative to its tonic. Always includes 0
// because the tonic itself sounds during lead-in and nexo, regardless
// of whether the pattern's steps explicitly reference it.
export function patternOffsetSpan(pattern: Pattern): { min: number; max: number } {
  const offsets = pattern.steps.map((s) => s.semitoneOffset);
  return {
    min: Math.min(0, ...offsets),
    max: Math.max(0, ...offsets),
  };
}

// Converts the singer's vocal range (the lowest/highest note they want to
// actually sing) into the tonic range the engine should modulate through.
// Returns null when the pattern is wider than the vocal range and cannot
// fit at any tonic.
export function vocalToTonicRange(
  vocalRange: Range,
  pattern: Pattern,
): Range | null {
  const span = patternOffsetSpan(pattern);
  const tonicMin = vocalRange.min - span.min;
  const tonicMax = vocalRange.max - span.max;
  if (tonicMax < tonicMin) return null;
  return { min: tonicMin, max: tonicMax };
}
