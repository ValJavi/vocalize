import { useState } from 'react';
import { PATTERNS } from '../domain/patterns';
import { useExercise } from '../hooks/useExercise';
import { useCustomPatterns } from '../hooks/useCustomPatterns';
import { useNotation } from '../hooks/useNotation';
import type { CustomPattern } from '../domain/customPatterns';
import PatternSelect from './PatternSelect';
import RangeSelect from './RangeSelect';
import TempoSlider from './TempoSlider';
import NotationSelect from './NotationSelect';
import PlayButton from './PlayButton';
import StopButton from './StopButton';
import PauseResumeButton from './PauseResumeButton';
import RepeatButton from './RepeatButton';
import DirectionButton from './DirectionButton';
import PatternBuilder from './PatternBuilder';

type BuilderState =
  | { mode: 'closed' }
  | { mode: 'create' }
  | { mode: 'edit'; pattern: CustomPattern };

export default function ExerciseControls() {
  const [patternId, setPatternId] = useState(PATTERNS[0].id);
  const [minMidi, setMinMidi] = useState(48);
  const [maxMidi, setMaxMidi] = useState(72);
  const [bpm, setBpm] = useState(80);
  const [builder, setBuilder] = useState<BuilderState>({ mode: 'closed' });

  const {
    status,
    isLoading,
    samplerReady,
    play,
    stop,
    pause,
    resume,
    repeat,
    reverseDirection,
    setBpm: setEngineBpm,
    preload,
  } = useExercise();

  const { patterns: customPatterns, add, update, remove } = useCustomPatterns();
  const { notation, setNotation } = useNotation();

  const allPatterns = [...PATTERNS, ...customPatterns];
  const pattern = allPatterns.find((p) => p.id === patternId) ?? PATTERNS[0];
  const selectedCustom = customPatterns.find((p) => p.id === patternId);

  const rangeInvalid = minMidi >= maxMidi;
  const isActive = status !== 'idle';
  const isPaused = status === 'paused';

  const handlePlay = () => {
    if (rangeInvalid) return;
    play({
      pattern,
      range: { min: minMidi, max: maxMidi },
      bpm,
      gapBeats: 1,
    });
  };

  const handleSaveCustom = (saved: CustomPattern) => {
    if (builder.mode === 'edit') {
      update(builder.pattern.id, saved);
    } else {
      add(saved);
    }
    setPatternId(saved.id);
    setBuilder({ mode: 'closed' });
  };

  const handleDeleteCustom = () => {
    if (builder.mode !== 'edit') return;
    remove(builder.pattern.id);
    setPatternId(PATTERNS[0].id);
    setBuilder({ mode: 'closed' });
  };

  return (
    <div className="space-y-5">
      <div>
        <PatternSelect
          value={patternId}
          onChange={setPatternId}
          customPatterns={customPatterns}
          disabled={isActive}
        />
        {!isActive && (
          <div className="mt-3 space-y-2">
            <button
              onClick={() => setBuilder({ mode: 'create' })}
              className="w-full bg-indigo-600 hover:bg-indigo-500 rounded py-2.5 font-medium transition"
            >
              + Crear patrón personalizado
            </button>
            {selectedCustom && (
              <button
                onClick={() => setBuilder({ mode: 'edit', pattern: selectedCustom })}
                className="text-sm text-slate-400 hover:text-slate-200 transition"
              >
                ✎ Editar &quot;{selectedCustom.name}&quot;
              </button>
            )}
          </div>
        )}
      </div>

      <div className="space-y-3">
        <NotationSelect value={notation} onChange={setNotation} disabled={isActive} />
        <RangeSelect
          min={minMidi}
          max={maxMidi}
          notation={notation}
          onMinChange={setMinMidi}
          onMaxChange={setMaxMidi}
          disabled={isActive}
        />
      </div>
      <TempoSlider
        value={bpm}
        onChange={(next) => {
          setBpm(next);
          setEngineBpm(next);
        }}
      />

      <div className="pt-2 space-y-3">
        {!isActive ? (
          <div className="flex gap-3">
            <PlayButton onPlay={handlePlay} disabled={rangeInvalid} isLoading={isLoading} />
          </div>
        ) : (
          <>
            <div className="flex gap-3">
              <PauseResumeButton isPaused={isPaused} onPause={pause} onResume={resume} />
              <StopButton onStop={stop} />
            </div>
            <div className="flex gap-3">
              <RepeatButton onRepeat={repeat} />
              <DirectionButton onReverse={reverseDirection} />
            </div>
          </>
        )}
      </div>

      {!samplerReady && !isLoading && (
        <button
          onClick={preload}
          className="w-full text-xs text-slate-400 hover:text-slate-200 underline"
        >
          Precargar sonidos del piano
        </button>
      )}

      {builder.mode === 'create' && (
        <PatternBuilder
          bpm={bpm}
          onSave={handleSaveCustom}
          onClose={() => setBuilder({ mode: 'closed' })}
        />
      )}
      {builder.mode === 'edit' && (
        <PatternBuilder
          initialPattern={builder.pattern}
          bpm={bpm}
          onSave={handleSaveCustom}
          onDelete={handleDeleteCustom}
          onClose={() => setBuilder({ mode: 'closed' })}
        />
      )}
    </div>
  );
}
