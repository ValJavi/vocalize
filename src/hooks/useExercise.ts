import { useEffect, useRef, useState } from 'react';
import {
  playExercise,
  stopActiveExercise,
  preloadSampler,
  isSamplerReady,
  type ExerciseHandle,
} from '../audio/engine';
import type { ExerciseConfig } from '../domain/types';

export function useExercise() {
  const [isPlaying, setIsPlaying] = useState(false);
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
      setIsPlaying(true);
      handle.onFinish.then(() => {
        if (handleRef.current === handle) {
          handleRef.current = null;
          setIsPlaying(false);
        }
      });
    } finally {
      setIsLoading(false);
    }
  };

  const stop = () => {
    stopActiveExercise();
    handleRef.current = null;
    setIsPlaying(false);
  };

  const repeat = () => {
    handleRef.current?.repeat();
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

  return { isPlaying, isLoading, samplerReady, play, stop, repeat, preload };
}
