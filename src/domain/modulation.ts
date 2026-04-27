import type { Midi, Range } from './types';

export type Direction = 'up' | 'down';

export type ModulationState = {
  tonic: Midi;
  direction: Direction;
};

export function advanceTonic(
  state: ModulationState,
  range: Range,
): ModulationState | null {
  const { tonic, direction } = state;

  if (direction === 'up') {
    if (tonic < range.max) {
      return { tonic: tonic + 1, direction: 'up' };
    }
    if (tonic > range.min) {
      return { tonic: tonic - 1, direction: 'down' };
    }
    return null;
  }

  if (tonic > range.min) {
    return { tonic: tonic - 1, direction: 'down' };
  }
  return null;
}
