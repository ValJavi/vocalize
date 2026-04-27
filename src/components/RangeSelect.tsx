import Field from './Field';
import NoteSelect from './NoteSelect';

export default function RangeSelect({
  min,
  max,
  onMinChange,
  onMaxChange,
}: {
  min: number;
  max: number;
  onMinChange: (midi: number) => void;
  onMaxChange: (midi: number) => void;
}) {
  const invalid = min >= max;
  return (
    <div>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Nota más grave">
          <NoteSelect value={min} onChange={onMinChange} />
        </Field>
        <Field label="Nota más aguda">
          <NoteSelect value={max} onChange={onMaxChange} />
        </Field>
      </div>
      {invalid && (
        <p className="text-amber-400 text-sm mt-2">
          La nota más aguda debe ser mayor que la más grave.
        </p>
      )}
    </div>
  );
}
