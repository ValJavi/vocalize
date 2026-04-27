import { useCallback, useEffect, useState } from 'react';
import {
  loadCustomPatterns,
  saveCustomPatterns,
  type CustomPattern,
} from '../domain/customPatterns';

export function useCustomPatterns() {
  const [patterns, setPatterns] = useState<CustomPattern[]>([]);

  useEffect(() => {
    setPatterns(loadCustomPatterns());
  }, []);

  const persist = useCallback((next: CustomPattern[]) => {
    saveCustomPatterns(next);
    setPatterns(next);
  }, []);

  const add = useCallback(
    (pattern: CustomPattern) => {
      persist([...patterns, pattern]);
    },
    [patterns, persist],
  );

  const update = useCallback(
    (id: string, pattern: CustomPattern) => {
      persist(patterns.map((p) => (p.id === id ? pattern : p)));
    },
    [patterns, persist],
  );

  const remove = useCallback(
    (id: string) => {
      persist(patterns.filter((p) => p.id !== id));
    },
    [patterns, persist],
  );

  return { patterns, add, update, remove };
}
