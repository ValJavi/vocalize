export default function PauseResumeButton({
  isPaused,
  onPause,
  onResume,
}: {
  isPaused: boolean;
  onPause: () => void;
  onResume: () => void;
}) {
  if (isPaused) {
    return (
      <button
        onClick={onResume}
        aria-label="Reanudar"
        className="flex-1 bg-emerald-700 hover:bg-emerald-600 active:bg-emerald-600 rounded py-3 font-medium transition"
      >
        Reanudar
      </button>
    );
  }
  return (
    <button
      onClick={onPause}
      aria-label="Pausar"
      className="flex-1 bg-amber-700 hover:bg-amber-600 active:bg-amber-600 rounded py-3 font-medium transition"
    >
      Pausar
    </button>
  );
}
