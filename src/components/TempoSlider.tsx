import Field from './Field';

export default function TempoSlider({
  value,
  onChange,
  min = 40,
  max = 200,
}: {
  value: number;
  onChange: (bpm: number) => void;
  min?: number;
  max?: number;
}) {
  return (
    <Field label={`Tempo: ${value} BPM`}>
      <input
        type="range"
        min={min}
        max={max}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full"
      />
    </Field>
  );
}
