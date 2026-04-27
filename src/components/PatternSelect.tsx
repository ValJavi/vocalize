import { PATTERNS } from '../domain/patterns';
import type { Pattern } from '../domain/types';
import Field from './Field';

export default function PatternSelect({
  value,
  onChange,
  customPatterns,
  disabled,
}: {
  value: string;
  onChange: (id: string) => void;
  customPatterns: Pattern[];
  disabled?: boolean;
}) {
  return (
    <Field label="Melodía">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 focus:outline-none focus:border-slate-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <optgroup label="Patrones predefinidos">
          {PATTERNS.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </optgroup>
        {customPatterns.length > 0 && (
          <optgroup label="Mis patrones">
            {customPatterns.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </optgroup>
        )}
      </select>
    </Field>
  );
}
