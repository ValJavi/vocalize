export default function PlayButton({
  onPlay,
  disabled,
  isLoading,
}: {
  onPlay: () => void;
  disabled: boolean;
  isLoading: boolean;
}) {
  return (
    <button
      onClick={onPlay}
      disabled={disabled || isLoading}
      aria-label="Reproducir"
      className="flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:text-slate-400 rounded py-3 font-medium transition"
    >
      {isLoading ? 'Cargando piano…' : 'Reproducir'}
    </button>
  );
}
