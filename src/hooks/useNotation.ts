import { useCallback, useEffect, useState } from 'react';
import type { Notation } from '../domain/notes';

const STORAGE_KEY = 'vocalize-notation';
const DEFAULT_NOTATION: Notation = 'american';

function readStored(): Notation {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === 'american' || raw === 'solfege') return raw;
    return DEFAULT_NOTATION;
  } catch {
    return DEFAULT_NOTATION;
  }
}

export function useNotation() {
  const [notation, setNotationState] = useState<Notation>(DEFAULT_NOTATION);

  useEffect(() => {
    setNotationState(readStored());
  }, []);

  const setNotation = useCallback((next: Notation) => {
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore storage failures (private mode, quota); state still updates
    }
    setNotationState(next);
  }, []);

  return { notation, setNotation };
}
