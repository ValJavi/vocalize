export default function RepeatButton({ onRepeat }: { onRepeat: () => void }) {
  return (
    <button
      onClick={onRepeat}
      aria-label="Repetir"
      className="flex-1 border border-slate-700 hover:border-slate-600 hover:bg-slate-800/60 text-slate-300 hover:text-slate-100 rounded py-3 font-medium transition"
      title="La próxima repetición se mantendrá en el mismo tono"
    >
      Repetir ↻
    </button>
  );
}
