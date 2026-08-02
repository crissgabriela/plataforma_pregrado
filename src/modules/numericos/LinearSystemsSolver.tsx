import React, { useState, useMemo } from 'react';
import { solveGaussJordan } from './solverUtils';
import { Matrix, RefreshCw, CheckCircle, ArrowRight, Layers } from 'lucide-react';

export const LinearSystemsSolver: React.FC = () => {
  const [size, setSize] = useState<number>(3);
  const [matrixA, setMatrixA] = useState<number[][]>([
    [2, 1, -1],
    [-3, -1, 2],
    [-2, 1, 2]
  ]);
  const [vectorB, setVectorB] = useState<number[]>([8, -11, -3]);

  // Actualizar tamaño de la matriz cuando cambia 'size'
  const handleSizeChange = (newSize: number) => {
    setSize(newSize);
    const newA = Array.from({ length: newSize }, (_, r) =>
      Array.from({ length: newSize }, (_, c) => matrixA[r]?.[c] ?? (r === c ? 1 : 0))
    );
    const newB = Array.from({ length: newSize }, (_, r) => vectorB[r] ?? 1);
    setMatrixA(newA);
    setVectorB(newB);
  };

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

  const result = useMemo(() => {
    return solveGaussJordan(matrixA, vectorB);
  }, [matrixA, vectorB]);

  return (
    <div className="space-y-6">
      {/* Selector de tamaño y Controles */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex justify-between items-center flex-wrap gap-4 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Layers className="w-5 h-5 text-cyan-400" />
              Sistemas de Ecuaciones Lineales ($Ax = b$)
            </h3>
            <p className="text-xs text-slate-400">Eliminación de Gauss-Jordan con Pivoteo Parcial.</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Dimensión de Matriz:</span>
            {[2, 3, 4].map((s) => (
              <button
                key={s}
                onClick={() => handleSizeChange(s)}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-bold border transition-all ${
                  size === s
                    ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md shadow-cyan-500/20'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {s}x{s}
              </button>
            ))}
          </div>
        </div>

        {/* Input Matriz A y Vector b */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
          <div className="md:col-span-3 space-y-2">
            <label className="text-xs font-semibold text-slate-300">Matriz de Coeficientes A</label>
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
                    className="bg-slate-900 border border-slate-800 rounded-lg p-2 text-center text-sm font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
                  />
                ))
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300">Vector Términos b</label>
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
      </div>

      {/* Vector Solución x */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          Vector Solución Resultante ($x$)
        </h4>

        {result.solution.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {result.solution.map((sol, idx) => (
              <div key={idx} className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl text-center space-y-1">
                <span className="text-xs text-slate-400 font-mono">x_{idx + 1}</span>
                <div className="text-xl font-bold font-mono text-cyan-400">{sol.toFixed(4)}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 bg-amber-950/30 border border-amber-500/30 rounded-xl text-xs text-amber-300">
            El sistema de ecuaciones es indeterminado o inconsistente (determinante cercano a 0).
          </div>
        )}
      </div>

      {/* Traza de Eliminación Gauss-Jordan */}
      {result.steps.length > 0 && (
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <h4 className="text-sm font-semibold text-slate-200">Pasos de la Transformación de Matriz</h4>
          <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
            {result.steps.map((step, idx) => (
              <div key={idx} className="bg-slate-900/40 p-4 rounded-xl border border-slate-800/80 space-y-2">
                <div className="text-xs font-semibold text-cyan-300 flex items-center gap-2">
                  <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
                  Paso {idx + 1}: {step.description}
                </div>
                <div className="overflow-x-auto pt-2">
                  <div className="inline-flex gap-2 items-center bg-slate-950 p-3 rounded-lg border border-slate-900 font-mono text-xs text-slate-300">
                    {step.matrix.map((row, r) => (
                      <div key={r} className="flex flex-col gap-1 px-2 border-r border-slate-800 last:border-0">
                        {row.map((val, c) => (
                          <span key={c} className="w-12 text-center">
                            {val.toFixed(2)}
                          </span>
                        ))}
                      </div>
                    ))}
                    <div className="border-l border-emerald-500/40 pl-3 flex flex-col gap-1 font-semibold text-emerald-400">
                      {step.vector.map((v, r) => (
                        <span key={r} className="w-12 text-center">
                          {v.toFixed(2)}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
