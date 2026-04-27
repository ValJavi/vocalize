import * as Tone from 'tone';
import type { ExerciseConfig, Midi } from '../domain/types';

const SAMPLE_BASE_URL = 'https://tonejs.github.io/audio/salamander/';
const SAMPLE_URLS: Record<string, string> = {
  A1: 'A1.mp3',
  C2: 'C2.mp3',
  'D#2': 'Ds2.mp3',
  'F#2': 'Fs2.mp3',
  A2: 'A2.mp3',
  C3: 'C3.mp3',
  'D#3': 'Ds3.mp3',
  'F#3': 'Fs3.mp3',
  A3: 'A3.mp3',
  C4: 'C4.mp3',
  'D#4': 'Ds4.mp3',
  'F#4': 'Fs4.mp3',
  A4: 'A4.mp3',
  C5: 'C5.mp3',
  'D#5': 'Ds5.mp3',
  'F#5': 'Fs5.mp3',
  A5: 'A5.mp3',
};

let sampler: Tone.Sampler | null = null;
let samplerLoading: Promise<Tone.Sampler> | null = null;
let activeHandle: ExerciseHandle | null = null;

async function getSampler(): Promise<Tone.Sampler> {
  if (sampler) return sampler;
  if (samplerLoading) return samplerLoading;

  samplerLoading = new Promise<Tone.Sampler>((resolve, reject) => {
    const s = new Tone.Sampler({
      urls: SAMPLE_URLS,
      baseUrl: SAMPLE_BASE_URL,
      release: 1,
      onload: () => {
        sampler = s;
        resolve(s);
      },
      onerror: (err) => reject(err),
    }).toDestination();
  });

  return samplerLoading;
}

export function preloadSampler(): Promise<Tone.Sampler> {
  return getSampler();
}

export function isSamplerReady(): boolean {
  return sampler !== null;
}

export type ExerciseHandle = {
  stop: () => void;
  repeat: () => void;
  onFinish: Promise<void>;
};

export async function playExercise(config: ExerciseConfig): Promise<ExerciseHandle> {
  await Tone.start();
  const s = await getSampler();
  stopActiveExercise();

  const beat = 60 / config.bpm;
  const gap = config.gapBeats * beat;

  let stopped = false;
  let repeatPending = false;
  let currentTonic = config.range.min;
  let direction: 'up' | 'down' = 'up';

  let stopResolve!: () => void;
  const stopSignal = new Promise<void>((r) => {
    stopResolve = r;
  });

  let finishResolve!: () => void;
  const onFinish = new Promise<void>((r) => {
    finishResolve = r;
  });

  const playRepetition = async (tonic: Midi): Promise<void> => {
    const startAudioTime = Tone.now() + 0.05;
    const startWallTime = Date.now();
    let elapsedSec = 0;

    for (const step of config.pattern.steps) {
      if (stopped) return;
      const dur = step.durationBeats * beat;
      s.triggerAttackRelease(
        Tone.Frequency(tonic + step.semitoneOffset, 'midi').toNote(),
        dur,
        startAudioTime + elapsedSec,
      );
      elapsedSec += dur;
      const targetWallMs = startWallTime + elapsedSec * 1000;
      const sleepMs = Math.max(0, targetWallMs - Date.now());
      await sleepUntilStopOrTimeout(sleepMs);
    }
  };

  const advanceTonic = (): boolean => {
    if (direction === 'up') {
      if (currentTonic < config.range.max) {
        currentTonic++;
        return true;
      }
      direction = 'down';
      if (currentTonic > config.range.min) {
        currentTonic--;
        return true;
      }
      return false;
    }
    if (currentTonic > config.range.min) {
      currentTonic--;
      return true;
    }
    return false;
  };

  const sleepUntilStopOrTimeout = (ms: number) =>
    Promise.race([
      new Promise<void>((r) => setTimeout(r, ms)),
      stopSignal,
    ]);

  const loop = async () => {
    while (!stopped) {
      await playRepetition(currentTonic);
      if (stopped) break;

      if (gap > 0) {
        await sleepUntilStopOrTimeout(gap * 1000);
        if (stopped) break;
      }

      if (repeatPending) {
        repeatPending = false;
      } else {
        const more = advanceTonic();
        if (!more) break;
      }
    }

    finishResolve();
  };

  loop();

  const handle: ExerciseHandle = {
    stop: () => {
      if (stopped) return;
      stopped = true;
      stopResolve();
      s.releaseAll();
    },
    repeat: () => {
      repeatPending = true;
    },
    onFinish,
  };

  activeHandle = handle;
  return handle;
}

export function stopActiveExercise(): void {
  if (activeHandle) {
    activeHandle.stop();
    activeHandle = null;
  }
}
