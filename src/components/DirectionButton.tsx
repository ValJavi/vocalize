export default function DirectionButton({
  onReverse,
}: {
  onReverse: () => void;
}) {
  return (
    <button
      onClick={onReverse}
      aria-label="Cambiar dirección de modulación"
      className="flex-1 border border-slate-700 hover:border-slate-600 hover:bg-slate-800/60 text-slate-300 hover:text-slate-100 rounded py-3 font-medium transition whitespace-nowrap"
      title="Invierte la dirección de modulación (subir ↔ bajar)"
    >
      Dirección ↕
    </button>
  );
}
