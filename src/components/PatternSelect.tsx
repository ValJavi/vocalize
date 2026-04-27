import { PATTERNS } from '../domain/patterns';
import Field from './Field';

export default function PatternSelect({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (id: string) => void;
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
        {PATTERNS.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>
    </Field>
  );
}
