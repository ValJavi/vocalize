import * as Tone from 'tone';
import type { ExerciseConfig, Midi, PatternStep } from '../domain/types';
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
// Breathing room between the end of a rep and the start of the nexo's
// first reference tone. Lead-in does not get one (it is the very start).
const NEXO_LEADING_SILENCE_BEATS = 1;

// If the user leaves the exercise paused this long without resuming, the
// engine releases its resources and ends the run.
const PAUSE_AUTO_STOP_MS = 5 * 60 * 1000;

export type ExerciseHandle = {
  stop: () => void;
  pause: () => void;
  resume: () => void;
  repeat: () => void;
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

export type PreviewHandle = {
  stop: () => void;
  onFinish: Promise<void>;
};

let activePreview: PreviewHandle | null = null;

export function stopActivePreview(): void {
  if (activePreview) {
    activePreview.stop();
    activePreview = null;
  }
}

// Plays a single pattern once at a fixed tonic, no modulation, no nexo.
// Used by the pattern builder so the user can hear what they are
// composing before saving it.
export async function previewPattern(
  steps: PatternStep[],
  tonic: Midi,
  bpm: number,
): Promise<PreviewHandle> {
  await Tone.start();
  const s = await getSampler();
  stopActiveExercise();
  stopActivePreview();

  const beat = 60 / bpm;
  let stopped = false;

  let stopResolve: () => void = () => {};
  const stopSignal = new Promise<void>((r) => {
    stopResolve = r;
  });

  let finishResolve: () => void = () => {};
  const onFinish = new Promise<void>((r) => {
    finishResolve = r;
  });

  const sleep = (ms: number): Promise<void> =>
    new Promise<void>((resolve) => {
      if (stopped) {
        resolve();
        return;
      }
      const timer = setTimeout(() => {
        resolve();
      }, ms);
      stopSignal.then(() => {
        clearTimeout(timer);
        resolve();
      });
    });

  const run = async () => {
    let nextStart = Tone.now() + 0.05;
    for (const step of steps) {
      if (stopped) break;
      const dur = step.durationBeats * beat;
      s.triggerAttackRelease(
        Tone.Frequency(tonic + step.semitoneOffset, 'midi').toNote(),
        dur,
        nextStart,
      );
      nextStart += dur;
      await sleep(dur * 1000);
    }
    if (activePreview && activePreview.onFinish === onFinish) {
      activePreview = null;
    }
    finishResolve();
  };

  run();

  const handle: PreviewHandle = {
    stop: () => {
      if (stopped) return;
      stopped = true;
      s.releaseAll();
      stopResolve();
    },
    onFinish,
  };

  activePreview = handle;
  return handle;
}

export type PlayOptions = {
  // Fired whenever the modulation direction changes, both when the user
  // triggers reverseDirection and when advanceTonic auto-flips at the
  // top of the range. Lets the UI display an up/down indicator that
  // tracks the engine's internal state.
  onDirectionChange?: (direction: Direction) => void;
  // Fired when a tone (lead-in, nexo or pattern step) starts playing,
  // and with null between tones (silences, gaps, after stop). Lets the
  // UI light up the corresponding key on a piano visualization.
  onActiveNoteChange?: (midi: Midi | null) => void;
  // Fired when the tonic of the next pattern repetition changes. Used
  // by the UI to render the sequence of notes for the upcoming rep at
  // the right pitch. Fires once on play with config.range.min and again
  // on every advanceTonic that produces a new value.
  onTonicChange?: (tonic: Midi) => void;
  // Fired before each pattern step plays (with the step index), and
  // with null when no step is currently sounding (silences, lead-in,
  // nexo, after pause/stop). Lets the UI highlight which step in the
  // current rep is being sung.
  onStepChange?: (stepIndex: number | null) => void;
};

export async function playExercise(
  config: ExerciseConfig,
  options: PlayOptions = {},
): Promise<ExerciseHandle> {
  await Tone.start();
  const s = await getSampler();
  stopActiveExercise();
  stopActivePreview();

  let currentBpm = config.bpm;
  const beatSec = () => 60 / currentBpm;
  const gapSec = () => config.gapBeats * beatSec();
  const transitionSilenceMs = () => TRANSITION_SILENCE_BEATS * beatSec() * 1000;

  let stopped = false;
  let paused = false;
  let repeatPending = false;
  let currentTonic = config.range.min;
  let direction: Direction = 'up';
  let abortController = new AbortController();

  const setDirection = (next: Direction) => {
    if (next === direction) return;
    direction = next;
    options.onDirectionChange?.(next);
  };

  const setTonic = (next: Midi) => {
    if (next === currentTonic) return;
    currentTonic = next;
    options.onTonicChange?.(next);
  };

  // Initial tonic notification so the UI can render the first rep's
  // sequence before any audio starts.
  options.onTonicChange?.(currentTonic);

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
    leadingSilenceBeats: number = 0,
  ): Promise<void> => {
    if (leadingSilenceBeats > 0) {
      const leadingMs = leadingSilenceBeats * beatSec() * 1000;
      await sleepUntilStopOrPause(leadingMs);
      if (stopped || paused) return;
    }

    let nextStart = Tone.now() + 0.05;

    for (const tone of tones) {
      if (stopped || paused) {
        options.onActiveNoteChange?.(null);
        return;
      }
      const noteDur = beatsPerTone * beatSec();
      options.onActiveNoteChange?.(tone);
      s.triggerAttackRelease(
        Tone.Frequency(tone, 'midi').toNote(),
        noteDur,
        nextStart,
      );
      nextStart += noteDur;
      await sleepUntilStopOrPause(noteDur * 1000);
    }

    options.onActiveNoteChange?.(null);

    if (!stopped && !paused) {
      const silenceMs = transitionSilenceMs();
      if (silenceMs > 0) await sleep(silenceMs);
    }
  };

  const playLeadIn = (tonic: Midi) =>
    playReferenceTones([tonic], LEAD_IN_NOTE_BEATS);

  const playNexo = (fromTonic: Midi, toTonic: Midi) =>
    playReferenceTones(
      [fromTonic, toTonic],
      NEXO_NOTE_BEATS,
      NEXO_LEADING_SILENCE_BEATS,
    );

  const playRepetition = async (tonic: Midi): Promise<void> => {
    let nextStart = Tone.now() + 0.05;

    for (let i = 0; i < config.pattern.steps.length; i++) {
      const step = config.pattern.steps[i];
      if (stopped || paused) {
        options.onActiveNoteChange?.(null);
        options.onStepChange?.(null);
        return;
      }

      const dur = step.durationBeats * beatSec();
      const midi = tonic + step.semitoneOffset;
      options.onStepChange?.(i);
      options.onActiveNoteChange?.(midi);
      s.triggerAttackRelease(
        Tone.Frequency(midi, 'midi').toNote(),
        dur,
        nextStart,
      );
      nextStart += dur;
      await sleepUntilStopOrPause(dur * 1000);
    }

    options.onActiveNoteChange?.(null);
    options.onStepChange?.(null);
  };

  const advanceTonic = (): boolean => {
    const next = computeNextTonic({ tonic: currentTonic, direction }, config.range);
    if (!next) return false;
    setTonic(next.tonic);
    setDirection(next.direction);
    return true;
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

      if (!leadInDone) {
        await playLeadIn(currentTonic);
        if (stopped) break;
        if (paused) continue;
        leadInDone = true;
      }

      await playRepetition(currentTonic);
      if (stopped) break;
      if (paused) continue;

      if (repeatPending) {
        repeatPending = false;
        const gapMs = gapSec() * 1000;
        if (gapMs > 0) {
          await sleep(gapMs);
          if (stopped) break;
          if (paused) continue;
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
    reverseDirection: () => {
      if (stopped) return;
      setDirection(direction === 'up' ? 'down' : 'up');
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
