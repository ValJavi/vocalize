import { noteOptions } from '../domain/notes';

const NOTE_RANGE_MIN = 36;
const NOTE_RANGE_MAX = 84;
const NOTES = noteOptions(NOTE_RANGE_MIN, NOTE_RANGE_MAX);

export default function NoteSelect({
  value,
  onChange,
}: {
  value: number;
  onChange: (midi: number) => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 focus:outline-none focus:border-slate-500"
    >
      {NOTES.map((n) => (
        <option key={n.midi} value={n.midi}>
          {n.label}
        </option>
      ))}
    </select>
  );
}
