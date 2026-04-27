import ExerciseControls from './components/ExerciseControls';

export default function App() {
  return (
    <div className="min-h-full bg-slate-900 text-slate-100 p-6">
      <div className="max-w-md mx-auto">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold">Vocalize</h1>
          <p className="text-slate-400 text-sm mt-1">
            Ejercicios de vocalización para cantantes.
          </p>
        </header>
        <ExerciseControls />
      </div>
    </div>
  );
}
