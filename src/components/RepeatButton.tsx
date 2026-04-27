export default function RepeatButton({ onRepeat }: { onRepeat: () => void }) {
  return (
    <button
      onClick={onRepeat}
      aria-label="Repetir"
      className="flex-1 bg-slate-700 hover:bg-slate-600 rounded py-3 font-medium transition"
      title="La próxima repetición se mantendrá en el mismo tono"
    >
      Repetir ↻
    </button>
  );
}
