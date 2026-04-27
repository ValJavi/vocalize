export default function DirectionButton({
  onReverse,
}: {
  onReverse: () => void;
}) {
  return (
    <button
      onClick={onReverse}
      className="flex-1 bg-slate-700 hover:bg-slate-600 rounded py-3 font-medium transition"
      title="Invierte la dirección de modulación (subir ↔ bajar)"
    >
      Cambiar dirección ↕
    </button>
  );
}
