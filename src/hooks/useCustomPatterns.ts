import { useCallback, useState } from 'react';
import {
  loadCustomPatterns,
  saveCustomPatterns,
  type CustomPattern,
} from '../domain/customPatterns';

export function useCustomPatterns() {
  // Lazy initializer reads localStorage on the first render so saved
  // patterns appear in the dropdown immediately, without a flash of an
  // empty "Mis patrones" group.
  const [patterns, setPatterns] = useState<CustomPattern[]>(loadCustomPatterns);

  const add = useCallback((pattern: CustomPattern) => {
    setPatterns((prev) => {
      const next = [...prev, pattern];
      saveCustomPatterns(next);
      return next;
    });
  }, []);

  const update = useCallback((id: string, pattern: CustomPattern) => {
    setPatterns((prev) => {
      const next = prev.map((p) => (p.id === id ? pattern : p));
      saveCustomPatterns(next);
      return next;
    });
  }, []);

  const remove = useCallback((id: string) => {
    setPatterns((prev) => {
      const next = prev.filter((p) => p.id !== id);
      saveCustomPatterns(next);
      return next;
    });
  }, []);

  return { patterns, add, update, remove };
}
