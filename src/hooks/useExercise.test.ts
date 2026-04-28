import { vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useExercise } from './useExercise';
import * as engine from '../audio/engine';
import type { ExerciseHandle, PlayOptions } from '../audio/engine';
import type { Direction } from '../domain/modulation';
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

  test('initial direction defaults to up', () => {
    const { result } = renderHook(() => useExercise());
    expect(result.current.direction).toBe('up');
  });

  test('direction updates when the engine reports a change', async () => {
    let capturedOnDirectionChange: ((d: Direction) => void) | undefined;
    vi.mocked(engine.playExercise).mockImplementation(
      async (_config: ExerciseConfig, options: PlayOptions = {}) => {
        capturedOnDirectionChange = options.onDirectionChange;
        return fakeHandle();
      },
    );

    const { result } = renderHook(() => useExercise());

    await act(async () => {
      await result.current.play(CONFIG);
    });

    expect(result.current.direction).toBe('up');

    act(() => {
      capturedOnDirectionChange?.('down');
    });
    expect(result.current.direction).toBe('down');

    act(() => {
      capturedOnDirectionChange?.('up');
    });
    expect(result.current.direction).toBe('up');
  });

  test('activeMidi updates when the engine reports a note', async () => {
    let captured: ((midi: number | null) => void) | undefined;
    vi.mocked(engine.playExercise).mockImplementation(
      async (_config: ExerciseConfig, options: PlayOptions = {}) => {
        captured = options.onActiveNoteChange;
        return fakeHandle();
      },
    );

    const { result } = renderHook(() => useExercise());

    await act(async () => {
      await result.current.play(CONFIG);
    });

    expect(result.current.activeMidi).toBeNull();

    act(() => {
      captured?.(60);
    });
    expect(result.current.activeMidi).toBe(60);

    act(() => {
      captured?.(null);
    });
    expect(result.current.activeMidi).toBeNull();
  });

  test('currentTonic and currentStepIndex flow through to React state', async () => {
    let tonicCb: ((t: number) => void) | undefined;
    let stepCb: ((i: number | null) => void) | undefined;
    vi.mocked(engine.playExercise).mockImplementation(
      async (_config: ExerciseConfig, options: PlayOptions = {}) => {
        tonicCb = options.onTonicChange;
        stepCb = options.onStepChange;
        return fakeHandle();
      },
    );

    const { result } = renderHook(() => useExercise());

    await act(async () => {
      await result.current.play(CONFIG);
    });

    expect(result.current.currentTonic).toBeNull();
    expect(result.current.currentStepIndex).toBeNull();

    act(() => {
      tonicCb?.(48);
      stepCb?.(2);
    });
    expect(result.current.currentTonic).toBe(48);
    expect(result.current.currentStepIndex).toBe(2);

    act(() => {
      stepCb?.(null);
    });
    expect(result.current.currentStepIndex).toBeNull();
    expect(result.current.currentTonic).toBe(48);
  });

  test('stop clears tonic and step index', async () => {
    let tonicCb: ((t: number) => void) | undefined;
    let stepCb: ((i: number | null) => void) | undefined;
    vi.mocked(engine.playExercise).mockImplementation(
      async (_config: ExerciseConfig, options: PlayOptions = {}) => {
        tonicCb = options.onTonicChange;
        stepCb = options.onStepChange;
        return fakeHandle();
      },
    );

    const { result } = renderHook(() => useExercise());

    await act(async () => {
      await result.current.play(CONFIG);
    });

    act(() => {
      tonicCb?.(48);
      stepCb?.(0);
    });
    expect(result.current.currentTonic).toBe(48);
    expect(result.current.currentStepIndex).toBe(0);

    act(() => {
      result.current.stop();
    });
    expect(result.current.currentTonic).toBeNull();
    expect(result.current.currentStepIndex).toBeNull();
  });

  test('pause clears the active note', async () => {
    let captured: ((midi: number | null) => void) | undefined;
    vi.mocked(engine.playExercise).mockImplementation(
      async (_config: ExerciseConfig, options: PlayOptions = {}) => {
        captured = options.onActiveNoteChange;
        return fakeHandle();
      },
    );

    const { result } = renderHook(() => useExercise());

    await act(async () => {
      await result.current.play(CONFIG);
    });

    act(() => {
      captured?.(60);
    });
    expect(result.current.activeMidi).toBe(60);

    act(() => {
      result.current.pause();
    });
    expect(result.current.activeMidi).toBeNull();
  });

  test('stop resets direction to up', async () => {
    let capturedOnDirectionChange: ((d: Direction) => void) | undefined;
    vi.mocked(engine.playExercise).mockImplementation(
      async (_config: ExerciseConfig, options: PlayOptions = {}) => {
        capturedOnDirectionChange = options.onDirectionChange;
        return fakeHandle();
      },
    );

    const { result } = renderHook(() => useExercise());

    await act(async () => {
      await result.current.play(CONFIG);
    });

    act(() => {
      capturedOnDirectionChange?.('down');
    });
    expect(result.current.direction).toBe('down');

    act(() => {
      result.current.stop();
    });
    expect(result.current.direction).toBe('up');
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
    expect(engine.playExercise).toHaveBeenCalledWith(
      CONFIG,
      expect.objectContaining({ onDirectionChange: expect.any(Function) }),
    );
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
