import { useEffect, useRef, useState } from 'react';
import {
  playExercise,
  stopActiveExercise,
  preloadSampler,
  isSamplerReady,
  type ExerciseHandle,
} from '../audio/engine';
import type { ExerciseConfig } from '../domain/types';

export type ExerciseStatus = 'idle' | 'playing' | 'paused';

export function useExercise() {
  const [status, setStatus] = useState<ExerciseStatus>('idle');
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
      const handle = await playExercise(config);
      handleRef.current = handle;
      setSamplerReady(true);
      setStatus('playing');
      handle.onFinish.then(() => {
        if (handleRef.current === handle) {
          handleRef.current = null;
          setStatus('idle');
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
  };

  const pause = () => {
    handleRef.current?.pause();
    setStatus('paused');
  };

  const resume = () => {
    handleRef.current?.resume();
    setStatus('playing');
  };

  const repeat = () => {
    handleRef.current?.repeat();
  };

  const skip = () => {
    handleRef.current?.skip();
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
    isLoading,
    samplerReady,
    play,
    stop,
    pause,
    resume,
    repeat,
    skip,
    reverseDirection,
    setBpm,
    preload,
  };
}
