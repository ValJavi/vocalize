import { useEffect, useRef, useState } from 'react';
import {
  playExercise,
  stopActiveExercise,
  preloadSampler,
  isSamplerReady,
  type ExerciseHandle,
} from '../audio/engine';
import type { Direction } from '../domain/modulation';
import type { ExerciseConfig, Midi } from '../domain/types';

export type ExerciseStatus = 'idle' | 'playing' | 'paused';

export function useExercise() {
  const [status, setStatus] = useState<ExerciseStatus>('idle');
  const [direction, setDirection] = useState<Direction>('up');
  const [activeMidi, setActiveMidi] = useState<Midi | null>(null);
  const [currentTonic, setCurrentTonic] = useState<Midi | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [samplerReady, setSamplerReady] = useState(isSamplerReady());
  const handleRef = useRef<ExerciseHandle | null>(null);

  useEffect(() => {
    return () => {
      stopActiveExercise();
    };
  }, []);

  const play = async (config: ExerciseConfig) => {
    setIsLoading(true);
    try {
      setDirection('up');
      setActiveMidi(null);
      setCurrentStepIndex(null);
      const handle = await playExercise(config, {
        onDirectionChange: setDirection,
        onActiveNoteChange: setActiveMidi,
        onTonicChange: setCurrentTonic,
        onStepChange: setCurrentStepIndex,
      });
      handleRef.current = handle;
      setSamplerReady(true);
      setStatus('playing');
      handle.onFinish.then(() => {
        if (handleRef.current === handle) {
          handleRef.current = null;
          setStatus('idle');
          setDirection('up');
          setActiveMidi(null);
          setCurrentTonic(null);
          setCurrentStepIndex(null);
        }
      });
    } finally {
      setIsLoading(false);
    }
  };

  const stop = () => {
    stopActiveExercise();
    handleRef.current = null;
    setStatus('idle');
    setDirection('up');
    setActiveMidi(null);
    setCurrentTonic(null);
    setCurrentStepIndex(null);
  };

  const pause = () => {
    if (!handleRef.current) return;
    handleRef.current.pause();
    setStatus('paused');
    setActiveMidi(null);
    setCurrentStepIndex(null);
  };

  const resume = () => {
    if (!handleRef.current) return;
    handleRef.current.resume();
    setStatus('playing');
  };

  const repeat = () => {
    handleRef.current?.repeat();
  };

  const reverseDirection = () => {
    handleRef.current?.reverseDirection();
  };

  const setBpm = (bpm: number) => {
    handleRef.current?.setBpm(bpm);
  };

  const preload = async () => {
    setIsLoading(true);
    try {
      await preloadSampler();
      setSamplerReady(true);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    status,
    direction,
    activeMidi,
    currentTonic,
    currentStepIndex,
    isLoading,
    samplerReady,
    play,
    stop,
    pause,
    resume,
    repeat,
    reverseDirection,
    setBpm,
    preload,
  };
}
