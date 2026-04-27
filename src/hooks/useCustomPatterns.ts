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
