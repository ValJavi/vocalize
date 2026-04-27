export default function PlayButton({
  isPlaying,
  isLoading,
  disabled,
  onPlay,
  onStop,
}: {
  isPlaying: boolean;
  isLoading: boolean;
  disabled: boolean;
  onPlay: () => void;
  onStop: () => void;
}) {
  if (isPlaying) {
    return (
      <button
        onClick={onStop}
        className="flex-1 bg-rose-600 hover:bg-rose-500 rounded py-3 font-medium transition"
      >
        Detener
      </button>
    );
  }
  return (
    <button
      onClick={onPlay}
      disabled={disabled || isLoading}
      className="flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:text-slate-400 rounded py-3 font-medium transition"
    >
      {isLoading ? 'Cargando piano…' : 'Reproducir'}
    </button>
  );
}
