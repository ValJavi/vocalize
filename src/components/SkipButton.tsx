export default function SkipButton({ onSkip }: { onSkip: () => void }) {
  return (
    <button
      onClick={onSkip}
      aria-label="Siguiente"
      className="flex-1 bg-slate-700 hover:bg-slate-600 rounded py-3 font-medium transition"
      title="Avanza inmediatamente al siguiente tono"
    >
      Siguiente ⏭
    </button>
  );
}
