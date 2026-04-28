import { vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useExercise } from './useExercise';
import * as engine from '../audio/engine';
import type { ExerciseHandle } from '../audio/engine';
import type { ExerciseConfig } from '../domain/types';

vi.mock('../audio/engine', () => ({
  playExercise: vi.fn(),
  stopActiveExercise: vi.fn(),
  preloadSampler: vi.fn(),
  isSamplerReady: vi.fn(() => false),
}));

const CONFIG: ExerciseConfig = {
  pattern: { id: 'test', name: 'Test', steps: [{ semitoneOffset: 0, durationBeats: 1 }] },
  range: { min: 48, max: 60 },
  bpm: 80,
  gapBeats: 1,
};

function fakeHandle(overrides: Partial<ExerciseHandle> = {}): ExerciseHandle {
  return {
    stop: vi.fn(),
    pause: vi.fn(),
    resume: vi.fn(),
    repeat: vi.fn(),
    reverseDirection: vi.fn(),
    setBpm: vi.fn(),
    onFinish: new Promise<void>(() => {}),
    ...overrides,
  };
}

beforeEach(() => {
  vi.mocked(engine.playExercise).mockReset();
  vi.mocked(engine.stopActiveExercise).mockReset();
  vi.mocked(engine.preloadSampler).mockReset();
  vi.mocked(engine.isSamplerReady).mockReturnValue(false);
});

describe('useExercise', () => {
  test('initial status is idle', () => {
    const { result } = renderHook(() => useExercise());
    expect(result.current.status).toBe('idle');
    expect(result.current.isLoading).toBe(false);
  });

  test('play() transitions status to playing and stores the handle', async () => {
    const handle = fakeHandle();
    vi.mocked(engine.playExercise).mockResolvedValue(handle);

    const { result } = renderHook(() => useExercise());

    await act(async () => {
      await result.current.play(CONFIG);
    });

    expect(result.current.status).toBe('playing');
    expect(result.current.isLoading).toBe(false);
    expect(engine.playExercise).toHaveBeenCalledWith(CONFIG);
  });

  test('pause() and resume() toggle the status while keeping the session alive', async () => {
    const handle = fakeHandle();
    vi.mocked(engine.playExercise).mockResolvedValue(handle);

    const { result } = renderHook(() => useExercise());

    await act(async () => {
      await result.current.play(CONFIG);
    });

    act(() => {
      result.current.pause();
    });
    expect(result.current.status).toBe('paused');
    expect(handle.pause).toHaveBeenCalledTimes(1);

    act(() => {
      result.current.resume();
    });
    expect(result.current.status).toBe('playing');
    expect(handle.resume).toHaveBeenCalledTimes(1);
  });

  test('stop() returns the status to idle', async () => {
    const handle = fakeHandle();
    vi.mocked(engine.playExercise).mockResolvedValue(handle);

    const { result } = renderHook(() => useExercise());

    await act(async () => {
      await result.current.play(CONFIG);
    });

    act(() => {
      result.current.stop();
    });

    expect(result.current.status).toBe('idle');
    expect(engine.stopActiveExercise).toHaveBeenCalled();
  });

  test('repeat, reverseDirection, setBpm forward to the handle', async () => {
    const handle = fakeHandle();
    vi.mocked(engine.playExercise).mockResolvedValue(handle);

    const { result } = renderHook(() => useExercise());

    await act(async () => {
      await result.current.play(CONFIG);
    });

    act(() => {
      result.current.repeat();
      result.current.reverseDirection();
      result.current.setBpm(120);
    });

    expect(handle.repeat).toHaveBeenCalledTimes(1);
    expect(handle.reverseDirection).toHaveBeenCalledTimes(1);
    expect(handle.setBpm).toHaveBeenCalledWith(120);
  });

  test('control methods are no-ops when no exercise is active', () => {
    const { result } = renderHook(() => useExercise());

    act(() => {
      result.current.pause();
      result.current.resume();
      result.current.repeat();
      result.current.reverseDirection();
      result.current.setBpm(120);
    });

    expect(result.current.status).toBe('idle');
    expect(engine.playExercise).not.toHaveBeenCalled();
  });

  test('onFinish resolution returns status to idle', async () => {
    let resolveFinish: () => void = () => {};
    const finishPromise = new Promise<void>((r) => {
      resolveFinish = r;
    });
    const handle = fakeHandle({ onFinish: finishPromise });
    vi.mocked(engine.playExercise).mockResolvedValue(handle);

    const { result } = renderHook(() => useExercise());

    await act(async () => {
      await result.current.play(CONFIG);
    });
    expect(result.current.status).toBe('playing');

    await act(async () => {
      resolveFinish();
      await finishPromise;
    });

    expect(result.current.status).toBe('idle');
  });

  test('unmount stops the active exercise', async () => {
    const handle = fakeHandle();
    vi.mocked(engine.playExercise).mockResolvedValue(handle);

    const { result, unmount } = renderHook(() => useExercise());

    await act(async () => {
      await result.current.play(CONFIG);
    });

    unmount();
    expect(engine.stopActiveExercise).toHaveBeenCalled();
  });
});
