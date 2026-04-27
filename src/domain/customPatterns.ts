import type { Pattern, PatternStep } from './types';

const STORAGE_KEY = 'vocalize-custom-patterns';

export type CustomPattern = Pattern & {
  isCustom: true;
  createdAt: string;
};

function isPatternStep(value: unknown): value is PatternStep {
  if (!value || typeof value !== 'object') return false;
  const step = value as Record<string, unknown>;
  return (
    typeof step.semitoneOffset === 'number' &&
    typeof step.durationBeats === 'number' &&
    Number.isFinite(step.semitoneOffset) &&
    Number.isFinite(step.durationBeats) &&
    step.durationBeats > 0
  );
}

function isCustomPattern(value: unknown): value is CustomPattern {
  if (!value || typeof value !== 'object') return false;
  const p = value as Record<string, unknown>;
  return (
    typeof p.id === 'string' &&
    typeof p.name === 'string' &&
    Array.isArray(p.steps) &&
    p.steps.length > 0 &&
    p.steps.every(isPatternStep) &&
    p.isCustom === true &&
    typeof p.createdAt === 'string'
  );
}

export function loadCustomPatterns(): CustomPattern[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isCustomPattern);
  } catch {
    return [];
  }
}

export function saveCustomPatterns(patterns: CustomPattern[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(patterns));
}

export function generateId(): string {
  return `custom-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function buildCustomPattern(name: string, steps: PatternStep[]): CustomPattern {
  return {
    id: generateId(),
    name,
    steps,
    isCustom: true,
    createdAt: new Date().toISOString(),
  };
}
