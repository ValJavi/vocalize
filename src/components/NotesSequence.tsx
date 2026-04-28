import { midiToLabel, type Notation } from '../domain/notes';
import type { Midi, PatternStep } from '../domain/types';

export default function NotesSequence({
  steps,
  tonic,
  activeStepIndex,
  notation,
}: {
  steps: PatternStep[];
  tonic: Midi | null;
  activeStepIndex: number | null;
  notation: Notation;
}) {
  if (tonic === null) return null;

  return (
    <div className="flex flex-wrap gap-1 justify-center">
      {steps.map((step, i) => {
        const midi = tonic + step.semitoneOffset;
        const isActive = i === activeStepIndex;
        return (
          <span
            key={i}
            aria-current={isActive ? 'true' : undefined}
            className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
              isActive
                ? 'bg-emerald-500 text-slate-900'
                : 'bg-slate-800 text-slate-400 border border-slate-700'
            }`}
          >
            {midiToLabel(midi, notation)}
          </span>
        );
      })}
    </div>
  );
}
