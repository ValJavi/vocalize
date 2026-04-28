export default function StopButton({ onStop }: { onStop: () => void }) {
  return (
    <button
      onClick={onStop}
      aria-label="Detener"
      className="flex-1 bg-rose-700 hover:bg-rose-600 active:bg-rose-600 rounded py-3 font-medium transition"
    >
      Detener
    </button>
  );
}
