import { Analytics } from '@vercel/analytics/react';
import ExerciseControls from './components/ExerciseControls';

export default function App() {
  return (
    <div className="min-h-full bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 text-slate-100">
      <div className="max-w-md mx-auto px-4 py-10 sm:py-14">
        <header className="mb-10 text-center">
          <h1 className="text-5xl font-extrabold tracking-tight">
            Vocal<span className="text-emerald-400">ize</span>
          </h1>
          <p className="text-slate-400 text-sm mt-3">
            Ejercicios de vocalización para cantantes.
          </p>
        </header>

        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 shadow-xl shadow-slate-950/50">
          <ExerciseControls />
        </div>
      </div>
      <Analytics />
    </div>
  );
}
