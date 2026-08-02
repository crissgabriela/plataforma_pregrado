import React, { useState, useMemo } from 'react';
import { solveLinearRegression, solveLagrange } from './solverUtils';
import { InterpolationPoint } from '../../types/numericos';
import { TrendingUp, Plus, Trash2, CheckCircle } from 'lucide-react';

export const CurveFittingSolver: React.FC = () => {
  const [points, setPoints] = useState<InterpolationPoint[]>([
    { x: 1, y: 2.1 },
    { x: 2, y: 4.3 },
    { x: 3, y: 6.2 },
    { x: 4, y: 8.5 },
    { x: 5, y: 10.1 }
  ]);

  const [newX, setNewX] = useState<number>(6);
  const [newY, setNewY] = useState<number>(12);

  const regression = useMemo(() => solveLinearRegression(points), [points]);
  const lagrange = useMemo(() => solveLagrange(points), [points]);

  const addPoint = () => {
    setPoints(prev => [...prev, { x: newX, y: newY }]);
  };

  const removePoint = (idx: number) => {
    setPoints(prev => prev.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-6">
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="border-b border-slate-800 pb-4">
          <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-cyan-400" />
            Ajuste de Curvas e Interpolación (MN 04)
          </h3>
          <p className="text-xs text-slate-400">Regresión Lineal por Mínimos Cuadrados y Polinomio Interpolante de Lagrange.</p>
        </div>

        {/* Tabla de Puntos */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-slate-300">Puntos Experimentales (x, y)</span>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={newX}
                onChange={(e) => setNewX(parseFloat(e.target.value) || 0)}
                placeholder="x"
                className="w-16 bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-xs text-center text-cyan-300"
              />
              <input
                type="number"
                value={newY}
                onChange={(e) => setNewY(parseFloat(e.target.value) || 0)}
                placeholder="y"
                className="w-16 bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-xs text-center text-emerald-300"
              />
              <button
                onClick={addPoint}
                className="px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Agregar
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {points.map((p, idx) => (
              <div key={idx} className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl text-xs font-mono flex items-center gap-2">
                <span className="text-slate-300">({p.x}, {p.y})</span>
                <button onClick={() => removePoint(idx)} className="text-slate-500 hover:text-rose-400 cursor-pointer">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Resultados de Ajuste */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
          <h4 className="text-sm font-semibold text-cyan-400 uppercase tracking-wider">Regresión Lineal ($y = a_0 + a_1 x$)</h4>
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 space-y-2">
            <div className="text-lg font-bold font-mono text-cyan-300">{regression.equationString}</div>
            <div className="flex justify-between text-xs text-slate-400">
              <span>Coeficiente de Determinación ($R^2$):</span>
              <span className="font-bold font-mono text-emerald-400">{(regression.r2 * 100).toFixed(2)}%</span>
            </div>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
          <h4 className="text-sm font-semibold text-purple-400 uppercase tracking-wider">Polinomio de Lagrange $P(x)$</h4>
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 overflow-x-auto text-xs font-mono text-purple-300">
            {lagrange.polynomialString}
          </div>
        </div>
      </div>
    </div>
  );
};
