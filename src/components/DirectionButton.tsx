import type { Direction } from '../domain/modulation';

export default function DirectionButton({
  direction,
  onReverse,
}: {
  direction: Direction;
  onReverse: () => void;
}) {
  const arrow = direction === 'up' ? '↑' : '↓';
  return (
    <button
      onClick={onReverse}
      aria-label={
        direction === 'up'
          ? 'Cambiar dirección de modulación. Actualmente sube.'
          : 'Cambiar dirección de modulación. Actualmente baja.'
      }
      className="flex-1 border border-slate-700 hover:border-slate-600 hover:bg-slate-800/60 text-slate-300 hover:text-slate-100 rounded py-3 font-medium transition whitespace-nowrap"
      title="Invierte la dirección de modulación (subir ↔ bajar)"
    >
      Dirección {arrow}
    </button>
  );
}
