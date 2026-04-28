import { NOTATIONS, type Notation } from '../domain/notes';
import Field from './Field';

export default function NotationSelect({
  value,
  onChange,
  disabled,
}: {
  value: Notation;
  onChange: (notation: Notation) => void;
  disabled?: boolean;
}) {
  return (
    <Field label="Notación">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as Notation)}
        disabled={disabled}
        className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 focus:outline-none focus:border-slate-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {NOTATIONS.map((n) => (
          <option key={n.id} value={n.id}>
            {n.label}
          </option>
        ))}
      </select>
    </Field>
  );
}
