import { renderHook, act } from '@testing-library/react';
import { useNotation } from './useNotation';

const STORAGE_KEY = 'vocalize-notation';

beforeEach(() => {
  localStorage.clear();
});

describe('useNotation', () => {
  test('defaults to american when nothing is stored', () => {
    const { result } = renderHook(() => useNotation());
    expect(result.current.notation).toBe('american');
  });

  test('reads a previously stored notation on mount', () => {
    localStorage.setItem(STORAGE_KEY, 'solfege');
    const { result } = renderHook(() => useNotation());
    expect(result.current.notation).toBe('solfege');
  });

  test('falls back to american on a malformed stored value', () => {
    localStorage.setItem(STORAGE_KEY, 'klingon');
    const { result } = renderHook(() => useNotation());
    expect(result.current.notation).toBe('american');
  });

  test('setNotation updates state and persists', () => {
    const { result } = renderHook(() => useNotation());
    act(() => {
      result.current.setNotation('solfege');
    });
    expect(result.current.notation).toBe('solfege');
    expect(localStorage.getItem(STORAGE_KEY)).toBe('solfege');
  });

  test('falls back to american if a previously-supported value is no longer valid', () => {
    localStorage.setItem(STORAGE_KEY, 'roman');
    const { result } = renderHook(() => useNotation());
    expect(result.current.notation).toBe('american');
  });

  test('a fresh hook instance reads the latest persisted value', () => {
    const { result, rerender } = renderHook(() => useNotation());
    act(() => {
      result.current.setNotation('solfege');
    });
    rerender();
    expect(result.current.notation).toBe('solfege');
  });
});
