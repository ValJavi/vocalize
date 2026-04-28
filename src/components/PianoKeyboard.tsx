import { midiToLabel, type Notation } from '../domain/notes';
import type { Midi } from '../domain/types';

// MIDI offsets within an octave for the diatonic naturals (C D E F G A B).
const WHITE_OFFSETS = new Set([0, 2, 4, 5, 7, 9, 11]);

function isWhiteKey(midi: Midi): boolean {
  return WHITE_OFFSETS.has(((midi % 12) + 12) % 12);
}

export default function PianoKeyboard({
  minMidi,
  maxMidi,
  activeMidi,
  notation,
}: {
  minMidi: Midi;
  maxMidi: Midi;
  activeMidi: Midi | null;
  notation: Notation;
}) {
  // Use the input range exactly, without rounding to octave boundaries.
  // Black-key edges are skipped naturally by the white-key filter, so the
  // visible keyboard starts on the first white key >= minMidi and ends on
  // the last white key <= maxMidi.
  const whiteMidis: Midi[] = [];
  for (let m = minMidi; m <= maxMidi; m++) {
    if (isWhiteKey(m)) whiteMidis.push(m);
  }

  return (
    <div className="relative h-20 select-none" aria-hidden="true">
      <div className="flex h-full gap-px">
        {whiteMidis.map((midi) => {
          const isActive = midi === activeMidi;
          const isCNote = ((midi % 12) + 12) % 12 === 0;
          return (
            <div
              key={midi}
              className={`flex-1 rounded-b flex flex-col-reverse items-center pb-1 transition-colors ${
                isActive
                  ? 'bg-emerald-400 text-slate-900'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {isCNote && (
                <span className="text-[10px] font-medium pointer-events-none">
                  {midiToLabel(midi, notation)}
                </span>
              )}
            </div>
          );
        })}
      </div>

      <div className="absolute top-0 left-0 right-0 h-3/5 flex pointer-events-none">
        {whiteMidis.map((midi, i) => {
          const nextWhite = whiteMidis[i + 1];
          const blackMidi = midi + 1;
          const hasBlack = nextWhite !== undefined && nextWhite === blackMidi + 1;
          const isActive = blackMidi === activeMidi;
          if (!hasBlack) {
            return <div key={midi} className="flex-1" />;
          }
          return (
            <div key={midi} className="flex-1 relative">
              <div
                className={`absolute top-0 h-full w-[60%] -right-[30%] rounded-b z-10 transition-colors ${
                  isActive ? 'bg-emerald-700' : 'bg-slate-900'
                }`}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
