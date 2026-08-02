import React, { useState, useMemo } from 'react';
import { solveGoldenSection } from './solverUtils';
import { Target, CheckCircle, Table } from 'lucide-react';

export const OptimizationSolver: React.FC = () => {
  const [expression, setExpression] = useState<string>('x^2 - 4*x + 5');
  const [xl, setXl] = useState<number>(0);
  const [xu, setXu] = useState<number>(4);
  const [mode, setMode] = useState<'min' | 'max'>('min');

  const result = useMemo(() => {
    return solveGoldenSection(expression, xl, xu, mode);
  }, [expression, xl, xu, mode]);

  return (
    <div className="space-y-6">
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex justify-between items-center flex-wrap gap-4 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Target className="w-5 h-5 text-emerald-400" />
              Optimización Unidimensional: Sección Áurea (MN 07)
            </h3>
            <p className="text-xs text-slate-400">Búsqueda de Máximos y Mínimos mediante reducción por la Razón Áurea ($\phi \approx 1.618$).</p>
          </div>
          <div className="flex gap-2 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setMode('min')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                mode === 'min'
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Mínimo
            </button>
            <button
              onClick={() => setMode('max')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                mode === 'max'
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Máximo
            </button>
          </div>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-3">
            <label className="text-xs font-semibold text-slate-300">Función Objetivo f(x)</label>
            <input
              type="text"
              value={expression}
              onChange={(e) => setExpression(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm font-mono text-emerald-300 focus:outline-none focus:border-emerald-500 mt-1"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400">Límite Inferior ($x_l$)</label>
            <input
              type="number"
              value={xl}
              onChange={(e) => setXl(parseFloat(e.target.value) || 0)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm font-mono text-slate-200 mt-1"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400">Límite Superior ($x_u$)</label>
            <input
              type="number"
              value={xu}
              onChange={(e) => setXu(parseFloat(e.target.value) || 0)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm font-mono text-slate-200 mt-1"
            />
          </div>
        </div>
      </div>

      {/* Resultado */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex justify-between items-center flex-wrap gap-4">
        <div>
          <span className="text-xs font-semibold text-slate-400 block mb-1">Punto Óptimo Calculado ($x^*$)</span>
          <div className="text-3xl font-extrabold font-mono text-emerald-400">
            x* = {result.optimumX.toFixed(5)}
          </div>
        </div>
        <div>
          <span className="text-xs font-semibold text-slate-400 block mb-1">Valor de la Función $f(x^*)$</span>
          <div className="text-3xl font-extrabold font-mono text-cyan-400">
            f(x*) = {result.optimumY.toFixed(5)}
          </div>
        </div>
      </div>
    </div>
  );
};
