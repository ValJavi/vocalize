import * as Tone from 'tone';
import type { ExerciseConfig, Midi } from '../domain/types';
import { advanceTonic as computeNextTonic, type Direction } from '../domain/modulation';

const SAMPLE_BASE_URL = '/samples/piano/';
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

const NEXO_NOTE_BEATS = 1;
const LEAD_IN_NOTE_BEATS = 1;
const TRANSITION_SILENCE_BEATS = 1;

// If the user leaves the exercise paused this long without resuming, the
// engine releases its resources and ends the run.
const PAUSE_AUTO_STOP_MS = 5 * 60 * 1000;

export type ExerciseHandle = {
  stop: () => void;
  pause: () => void;
  resume: () => void;
  repeat: () => void;
  skip: () => void;
  reverseDirection: () => void;
  setBpm: (bpm: number) => void;
  onFinish: Promise<void>;
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

export async function playExercise(config: ExerciseConfig): Promise<ExerciseHandle> {
  await Tone.start();
  const s = await getSampler();
  stopActiveExercise();

  let currentBpm = config.bpm;
  const beatSec = () => 60 / currentBpm;
  const gapSec = () => config.gapBeats * beatSec();
  const transitionSilenceMs = () => TRANSITION_SILENCE_BEATS * beatSec() * 1000;

  let stopped = false;
  let paused = false;
  let repeatPending = false;
  let skipRequested = false;
  let currentTonic = config.range.min;
  let direction: Direction = 'up';
  let abortController = new AbortController();

  let finishResolve: () => void = () => {};
  const onFinish = new Promise<void>((r) => {
    finishResolve = r;
  });

  const sleep = (ms: number): Promise<void> => {
    const { signal } = abortController;
    return new Promise<void>((resolve) => {
      if (signal.aborted) {
        resolve();
        return;
      }
      const onAbort = () => {
        clearTimeout(timer);
        resolve();
      };
      const timer = setTimeout(() => {
        signal.removeEventListener('abort', onAbort);
        resolve();
      }, ms);
      signal.addEventListener('abort', onAbort, { once: true });
    });
  };

  const sleepUntilStopOrPause = async (ms: number): Promise<void> => {
    const target = Date.now() + ms;
    while (true) {
      const remaining = Math.max(0, target - Date.now());
      if (remaining <= 0) return;
      await sleep(remaining);
      if (stopped || paused) return;
    }
  };

  const wakeUp = () => {
    abortController.abort();
    abortController = new AbortController();
  };

  const playReferenceTones = async (
    tones: Midi[],
    beatsPerTone: number,
  ): Promise<void> => {
    let nextStart = Tone.now() + 0.05;

    for (const tone of tones) {
      if (stopped || paused) return;
      const noteDur = beatsPerTone * beatSec();
      s.triggerAttackRelease(
        Tone.Frequency(tone, 'midi').toNote(),
        noteDur,
        nextStart,
      );
      nextStart += noteDur;
      await sleepUntilStopOrPause(noteDur * 1000);
    }

    if (!stopped && !paused) {
      const silenceMs = transitionSilenceMs();
      if (silenceMs > 0) await sleep(silenceMs);
    }
  };

  const playLeadIn = (tonic: Midi) =>
    playReferenceTones([tonic], LEAD_IN_NOTE_BEATS);

  const playNexo = (fromTonic: Midi, toTonic: Midi) =>
    playReferenceTones([fromTonic, toTonic], NEXO_NOTE_BEATS);

  const playRepetition = async (tonic: Midi): Promise<void> => {
    let nextStart = Tone.now() + 0.05;

    for (const step of config.pattern.steps) {
      if (stopped || paused) return;
      if (skipRequested) return;

      const dur = step.durationBeats * beatSec();
      s.triggerAttackRelease(
        Tone.Frequency(tonic + step.semitoneOffset, 'midi').toNote(),
        dur,
        nextStart,
      );
      nextStart += dur;
      await sleepUntilStopOrPause(dur * 1000);
    }
  };

  const advanceTonic = (): boolean => {
    const next = computeNextTonic({ tonic: currentTonic, direction }, config.range);
    if (!next) return false;
    currentTonic = next.tonic;
    direction = next.direction;
    return true;
  };

  const consumeSkip = async (): Promise<'continue' | 'break'> => {
    const fromTonic = currentTonic;
    skipRequested = false;
    repeatPending = false;
    if (!advanceTonic()) return 'break';
    await playNexo(fromTonic, currentTonic);
    if (stopped) return 'break';
    return 'continue';
  };

  const loop = async () => {
    let leadInDone = false;

    while (!stopped) {
      if (paused) {
        await sleep(PAUSE_AUTO_STOP_MS);
        if (stopped) break;
        if (!paused) continue;
        // Pause expired without user interaction → auto-stop.
        stopped = true;
        s.releaseAll();
        break;
      }

      if (skipRequested) {
        if ((await consumeSkip()) === 'break') break;
        continue;
      }

      if (!leadInDone) {
        await playLeadIn(currentTonic);
        if (stopped) break;
        if (paused) continue;
        leadInDone = true;
      }

      await playRepetition(currentTonic);
      if (stopped) break;
      if (paused) continue;

      if (skipRequested) {
        if ((await consumeSkip()) === 'break') break;
        continue;
      }

      if (repeatPending) {
        repeatPending = false;
        const gapMs = gapSec() * 1000;
        if (gapMs > 0) {
          await sleep(gapMs);
          if (stopped) break;
          if (paused) continue;

          if (skipRequested) {
            if ((await consumeSkip()) === 'break') break;
            continue;
          }
        }
      } else {
        const fromTonic = currentTonic;
        if (!advanceTonic()) break;
        await playNexo(fromTonic, currentTonic);
        if (stopped) break;
        if (paused) continue;
      }
    }

    if (activeHandle === handle) {
      activeHandle = null;
    }
    finishResolve();
  };

  loop();

  const handle: ExerciseHandle = {
    stop: () => {
      if (stopped) return;
      stopped = true;
      s.releaseAll();
      wakeUp();
    },
    pause: () => {
      if (stopped || paused) return;
      paused = true;
      s.releaseAll();
      wakeUp();
    },
    resume: () => {
      if (stopped || !paused) return;
      paused = false;
      wakeUp();
    },
    repeat: () => {
      repeatPending = true;
    },
    skip: () => {
      if (stopped || paused) return;
      skipRequested = true;
      wakeUp();
    },
    reverseDirection: () => {
      if (stopped) return;
      direction = direction === 'up' ? 'down' : 'up';
    },
    setBpm: (bpm: number) => {
      if (stopped) return;
      if (!Number.isFinite(bpm) || bpm <= 0) return;
      currentBpm = bpm;
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
