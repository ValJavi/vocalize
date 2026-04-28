import { Fragment, useEffect, useRef, useState } from 'react';
import { DEGREES, type DegreeId, semitonesFromDegreeId, degreeFromSemitones } from '../domain/degrees';
import { buildCustomPattern, type CustomPattern } from '../domain/customPatterns';
import type { PatternStep } from '../domain/types';
import { previewPattern, stopActivePreview, type PreviewHandle } from '../audio/engine';

const DURATIONS: { label: string; beats: number }[] = [
  { label: 'Corchea ♪ (½)', beats: 0.5 },
  { label: 'Negra ♩ (1)', beats: 1 },
  { label: 'Negra con punto (1½)', beats: 1.5 },
  { label: 'Blanca (2)', beats: 2 },
  { label: 'Redonda (4)', beats: 4 },
];

const PREVIEW_TONIC = 60; // C4

type EditableStep = {
  degreeId: DegreeId;
  durationBeats: number;
};

function stepToEditable(step: PatternStep): EditableStep {
  return {
    degreeId: degreeFromSemitones(step.semitoneOffset)?.id ?? '1',
    durationBeats: step.durationBeats,
  };
}

function editableToStep(e: EditableStep): PatternStep {
  return {
    semitoneOffset: semitonesFromDegreeId(e.degreeId),
    durationBeats: e.durationBeats,
  };
}

type Props = {
  initialPattern?: CustomPattern;
  bpm: number;
  onSave: (pattern: CustomPattern) => void;
  onDelete?: () => void;
  onClose: () => void;
};

export default function PatternBuilder({
  initialPattern,
  bpm,
  onSave,
  onDelete,
  onClose,
}: Props) {
  const isEdit = !!initialPattern;
  const [name, setName] = useState(initialPattern?.name ?? '');
  const [steps, setSteps] = useState<EditableStep[]>(
    initialPattern?.steps.map(stepToEditable) ?? [{ degreeId: '1', durationBeats: 1 }],
  );
  const [isPreviewing, setIsPreviewing] = useState(false);
  const previewRef = useRef<PreviewHandle | null>(null);

  useEffect(() => {
    return () => {
      stopActivePreview();
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const canSave = name.trim().length > 0 && steps.length > 0;

  const addStep = () => {
    const last = steps[steps.length - 1];
    setSteps([
      ...steps,
      { degreeId: last?.degreeId ?? '1', durationBeats: last?.durationBeats ?? 1 },
    ]);
  };

  const updateStep = (index: number, patch: Partial<EditableStep>) => {
    setSteps(steps.map((s, i) => (i === index ? { ...s, ...patch } : s)));
  };

  const removeStep = (index: number) => {
    setSteps(steps.filter((_, i) => i !== index));
  };

  const handlePreview = async () => {
    if (steps.length === 0) return;
    if (isPreviewing) {
      previewRef.current?.stop();
      previewRef.current = null;
      setIsPreviewing(false);
      return;
    }
    setIsPreviewing(true);
    const handle = await previewPattern(steps.map(editableToStep), PREVIEW_TONIC, bpm);
    previewRef.current = handle;
    handle.onFinish.then(() => {
      if (previewRef.current === handle) {
        previewRef.current = null;
        setIsPreviewing(false);
      }
    });
  };

  const handleSave = () => {
    if (!canSave) return;
    stopActivePreview();
    const patternSteps = steps.map(editableToStep);
    const trimmedName = name.trim();
    const result: CustomPattern = initialPattern
      ? { ...initialPattern, name: trimmedName, steps: patternSteps }
      : buildCustomPattern(trimmedName, patternSteps);
    onSave(result);
  };

  const handleDelete = () => {
    if (!onDelete) return;
    stopActivePreview();
    onDelete();
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50"
      role="dialog"
      aria-modal="true"
      aria-label={isEdit ? 'Editar patrón' : 'Crear patrón'}
      onClick={onClose}
    >
      <div
        className="bg-slate-800 border border-slate-700 rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold mb-4">
          {isEdit ? 'Editar patrón' : 'Crear patrón personalizado'}
        </h2>

        <label className="block mb-4">
          <span className="block text-sm text-slate-300 mb-1">Nombre</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Mi vocalización"
            className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 focus:outline-none focus:border-slate-500"
            autoFocus
          />
        </label>

        <div className="mb-2">
          <span className="block text-sm text-slate-300 mb-2">Notas</span>
          <div
            className="grid items-center gap-2"
            // Inline style instead of grid-cols-[...] arbitrary class so the
            // header and every step row share one source of truth for column
            // widths. Grado has short labels (1, ♭3, ♭10) so it gets a fixed
            // narrow column; Duración takes the rest with minmax(0, 1fr) so
            // it can shrink without overflowing the grid when its longer
            // labels (e.g. "Negra con punto (1½)") would otherwise expand
            // the column past its share.
            style={{ gridTemplateColumns: '4.5rem minmax(0, 1fr) 2rem' }}
          >
            <span className="px-2 text-xs text-slate-500">Grado</span>
            <span className="px-2 text-xs text-slate-500">Duración</span>
            <span aria-hidden="true" />

            {steps.map((step, i) => (
              <Fragment key={i}>
                <select
                  value={step.degreeId}
                  onChange={(e) =>
                    updateStep(i, { degreeId: e.target.value as DegreeId })
                  }
                  className="bg-slate-900 border border-slate-700 rounded px-2 py-1 focus:outline-none focus:border-slate-500"
                  aria-label={`Grado de la nota ${i + 1}`}
                >
                  {DEGREES.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.label}
                    </option>
                  ))}
                </select>
                <select
                  value={step.durationBeats}
                  onChange={(e) =>
                    updateStep(i, { durationBeats: Number(e.target.value) })
                  }
                  className="bg-slate-900 border border-slate-700 rounded px-2 py-1 focus:outline-none focus:border-slate-500"
                  aria-label={`Duración de la nota ${i + 1}`}
                >
                  {DURATIONS.map((d) => (
                    <option key={d.beats} value={d.beats}>
                      {d.label}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => removeStep(i)}
                  disabled={steps.length === 1}
                  className="bg-slate-700 hover:bg-rose-700 active:bg-rose-700 disabled:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed rounded w-8 h-8 flex items-center justify-center transition"
                  aria-label={`Eliminar nota ${i + 1}`}
                  title={steps.length === 1 ? 'Debe haber al menos una nota' : 'Eliminar'}
                >
                  ×
                </button>
              </Fragment>
            ))}
          </div>
          <button
            onClick={addStep}
            className="mt-3 w-full bg-slate-700 hover:bg-slate-600 active:bg-slate-600 rounded py-2 text-sm font-medium transition"
          >
            + Agregar nota
          </button>
        </div>

        <button
          onClick={handlePreview}
          disabled={steps.length === 0}
          className={`w-full rounded py-2 mb-6 text-sm font-medium transition ${
            isPreviewing
              ? 'bg-amber-700 hover:bg-amber-600 active:bg-amber-600'
              : 'bg-sky-700 hover:bg-sky-600 active:bg-sky-600 disabled:bg-slate-700 disabled:text-slate-400'
          }`}
        >
          {isPreviewing ? '■ Detener preview' : '▶ Reproducir patrón'}
        </button>

        <div className="space-y-2">
          {isEdit && onDelete ? (
            <div className="flex gap-2">
              <button
                onClick={handleDelete}
                className="flex-1 bg-rose-700 hover:bg-rose-600 active:bg-rose-600 rounded py-2 text-sm font-medium transition"
              >
                Eliminar
              </button>
              <button
                onClick={onClose}
                className="flex-1 bg-slate-700 hover:bg-slate-600 active:bg-slate-600 rounded py-2 text-sm font-medium transition"
              >
                Cancelar
              </button>
            </div>
          ) : (
            <button
              onClick={onClose}
              className="w-full bg-slate-700 hover:bg-slate-600 active:bg-slate-600 rounded py-2 text-sm font-medium transition"
            >
              Cancelar
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={!canSave}
            className="w-full bg-emerald-700 hover:bg-emerald-600 active:bg-emerald-600 disabled:bg-slate-700 disabled:text-slate-400 rounded py-2 text-sm font-medium transition"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}
