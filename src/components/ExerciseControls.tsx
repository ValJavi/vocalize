import { useState } from 'react';
import { PATTERNS } from '../domain/patterns';
import { useExercise } from '../hooks/useExercise';
import PatternSelect from './PatternSelect';
import RangeSelect from './RangeSelect';
import TempoSlider from './TempoSlider';
import PlayButton from './PlayButton';
import RepeatButton from './RepeatButton';

export default function ExerciseControls() {
  const [patternId, setPatternId] = useState(PATTERNS[0].id);
  const [minMidi, setMinMidi] = useState(48);
  const [maxMidi, setMaxMidi] = useState(72);
  const [bpm, setBpm] = useState(80);
  const { isPlaying, isLoading, samplerReady, play, stop, repeat, preload } = useExercise();

  const pattern = PATTERNS.find((p) => p.id === patternId)!;
  const rangeInvalid = minMidi >= maxMidi;

  const handlePlay = () => {
    if (rangeInvalid) return;
    play({
      pattern,
      range: { min: minMidi, max: maxMidi },
      bpm,
      gapBeats: 1,
    });
  };

  return (
    <div className="space-y-5">
      <PatternSelect value={patternId} onChange={setPatternId} />
      <RangeSelect
        min={minMidi}
        max={maxMidi}
        onMinChange={setMinMidi}
        onMaxChange={setMaxMidi}
      />
      <TempoSlider value={bpm} onChange={setBpm} />
      <div className="pt-2 flex gap-3">
        <PlayButton
          isPlaying={isPlaying}
          isLoading={isLoading}
          disabled={rangeInvalid}
          onPlay={handlePlay}
          onStop={stop}
        />
        {isPlaying && <RepeatButton onRepeat={repeat} />}
      </div>
      {!samplerReady && !isLoading && (
        <button
          onClick={preload}
          className="w-full text-xs text-slate-400 hover:text-slate-200 underline"
        >
          Precargar sonidos del piano
        </button>
      )}
    </div>
  );
}
