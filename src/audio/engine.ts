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
let activePart: Tone.Part | null = null;

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

type ScheduledNote = {
  time: number;
  midi: Midi;
  duration: number;
};

function buildSchedule(config: ExerciseConfig): ScheduledNote[] {
  const beat = 60 / config.bpm;
  const tonics: Midi[] = [];
  for (let t = config.range.min; t <= config.range.max; t++) tonics.push(t);
  for (let t = config.range.max - 1; t > config.range.min; t--) tonics.push(t);

  const notes: ScheduledNote[] = [];
  let cursor = 0;

  for (const tonic of tonics) {
    for (const step of config.pattern.steps) {
      const dur = step.durationBeats * beat;
      notes.push({
        time: cursor,
        midi: tonic + step.semitoneOffset,
        duration: dur,
      });
      cursor += dur;
    }
    cursor += config.gapBeats * beat;
  }

  return notes;
}

export type ExerciseHandle = {
  stop: () => void;
  onFinish: Promise<void>;
};

export async function playExercise(config: ExerciseConfig): Promise<ExerciseHandle> {
  await Tone.start();
  const s = await getSampler();
  stopActiveExercise();

  const notes = buildSchedule(config);
  const totalDuration = notes.length
    ? notes[notes.length - 1].time + notes[notes.length - 1].duration
    : 0;

  const part = new Tone.Part<ScheduledNote>((time, note) => {
    s.triggerAttackRelease(
      Tone.Frequency(note.midi, 'midi').toNote(),
      note.duration,
      time,
    );
  }, notes);

  part.start(0);
  Tone.getTransport().start();
  activePart = part;

  const onFinish = new Promise<void>((resolve) => {
    Tone.getTransport().scheduleOnce(() => {
      if (activePart === part) {
        stopActiveExercise();
      }
      resolve();
    }, totalDuration + 0.1);
  });

  return {
    stop: () => stopActiveExercise(),
    onFinish,
  };
}

export function stopActiveExercise(): void {
  if (activePart) {
    activePart.stop();
    activePart.dispose();
    activePart = null;
  }
  const transport = Tone.getTransport();
  transport.stop();
  transport.cancel();
  transport.position = 0;
  if (sampler) {
    sampler.releaseAll();
  }
}
