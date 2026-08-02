import React, { useState, useMemo } from 'react';
import { solveIterativeSystem } from './solverUtils';
import { RefreshCw, CheckCircle, AlertTriangle, Layers, Sliders } from 'lucide-react';

export const IterativeSystemsSolver: React.FC = () => {
  const [method, setMethod] = useState<'seidel' | 'jacobi'>('seidel');
  const [size, setSize] = useState<number>(3);
  const [matrixA, setMatrixA] = useState<number[][]>([
    [10, 2, -1],
    [-3, 8, 1],
    [2, -1, 10]
  ]);
  const [vectorB, setVectorB] = useState<number[]>([27, -61, -22]);
  const [tolerance, setTolerance] = useState<number>(0.0001);
  const [omega, setOmega] = useState<number>(1.0); // SOR

  const result = useMemo(() => {
    return solveIterativeSystem(matrixA, vectorB, method, tolerance, 40, omega);
  }, [matrixA, vectorB, method, tolerance, omega]);

  const updateCellA = (r: number, c: number, val: number) => {
    const nextA = matrixA.map((row, ri) =>
      row.map((cell, ci) => (ri === r && ci === c ? val : cell))
    );
    setMatrixA(nextA);
  };

  const updateCellB = (r: number, val: number) => {
    const nextB = vectorB.map((cell, ri) => (ri === r ? val : cell));
    setVectorB(nextB);
  };

  return (
    <div className="space-y-6">
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex justify-between items-center flex-wrap gap-4 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-purple-400" />
              Sistemas Iterativos: Jacobi y Gauss-Seidel (MN 03)
            </h3>
            <p className="text-xs text-slate-400">Resolución de $Ax = b$ con prueba de Diagonal Dominante y Relajación (SOR).</p>
          </div>
          <div className="flex gap-2 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setMethod('seidel')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                method === 'seidel'
                  ? 'bg-purple-500 text-slate-950 font-bold shadow-md shadow-purple-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Gauss-Seidel
            </button>
            <button
              onClick={() => setMethod('jacobi')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                method === 'jacobi'
                  ? 'bg-purple-500 text-slate-950 font-bold shadow-md shadow-purple-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Jacobi
            </button>
          </div>
        </div>

        {/* Inputs Matriz A y Vector b */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
          <div className="md:col-span-3 space-y-2">
            <label className="text-xs font-semibold text-slate-300">Matriz A</label>
            <div
              className="grid gap-2 bg-slate-950/60 p-4 rounded-xl border border-slate-900 overflow-x-auto"
              style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}
            >
              {matrixA.map((row, r) =>
                row.map((val, c) => (
                  <input
                    key={`${r}-${c}`}
                    type="number"
                    step="any"
                    value={val}
                    onChange={(e) => updateCellA(r, c, parseFloat(e.target.value) || 0)}
                    className="bg-slate-900 border border-slate-800 rounded-lg p-2 text-center text-sm font-mono text-purple-300 focus:outline-none focus:border-purple-500"
                  />
                ))
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300">Vector b</label>
            <div className="flex flex-col gap-2 bg-slate-950/60 p-4 rounded-xl border border-slate-900">
              {vectorB.map((val, r) => (
                <input
                  key={r}
                  type="number"
                  step="any"
                  value={val}
                  onChange={(e) => updateCellB(r, parseFloat(e.target.value) || 0)}
                  className="bg-slate-900 border border-slate-800 rounded-lg p-2 text-center text-sm font-mono text-emerald-400 focus:outline-none focus:border-emerald-500"
                />
              ))}
            </div>
          </div>
        </div>

        {/* Diagonal Dominance Check */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
          <span className="text-xs text-slate-400">Criterio de Convergencia:</span>
          {result.isDiagonallyDominant ? (
            <span className="text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" /> Matriz Estrictamente Diagonal Dominante
            </span>
          ) : (
            <span className="text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30 px-3 py-1 rounded-full flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" /> No Diagonal Dominante (Posible divergencia)
            </span>
          )}
        </div>
      </div>

      {/* Vector Solución y Tabla */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <h4 className="text-sm font-semibold text-slate-200">Vector Solución Obtenido</h4>
        <div className="grid grid-cols-3 gap-4">
          {result.solution.map((sol, idx) => (
            <div key={idx} className="bg-slate-900 p-4 rounded-xl border border-slate-800 text-center">
              <span className="text-xs font-mono text-slate-400">x_{idx + 1}</span>
              <div className="text-xl font-bold font-mono text-purple-400">{sol.toFixed(5)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
