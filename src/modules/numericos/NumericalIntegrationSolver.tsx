import React, { useState, useMemo } from 'react';
import { solveIntegration } from './solverUtils';
import { AreaChart, Calculator, Sliders, CheckCircle } from 'lucide-react';

export const NumericalIntegrationSolver: React.FC = () => {
  const [expression, setExpression] = useState<string>('x^2 + sin(x)');
  const [a, setA] = useState<number>(0);
  const [b, setB] = useState<number>(Math.PI);
  const [subintervals, setSubintervals] = useState<number>(6);
  const [method, setMethod] = useState<'trapezoid' | 'simpson13'>('simpson13');

  const result = useMemo(() => {
    return solveIntegration(expression, a, b, subintervals, method);
  }, [expression, a, b, subintervals, method]);

  return (
    <div className="space-y-6">
      {/* Panel de Configuración */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-4 md:col-span-3 border-b border-slate-800 pb-4 flex flex-wrap justify-between items-center">
          <div>
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <AreaChart className="w-5 h-5 text-cyan-400" />
              Integración Numérica ($\int_a^b f(x) dx$)
            </h3>
            <p className="text-xs text-slate-400">Cálculo de áreas aproximadas por Trapecio y Simpson 1/3.</p>
          </div>
          <div className="flex gap-2 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setMethod('trapezoid')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                method === 'trapezoid'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Regla del Trapecio
            </button>
            <button
              onClick={() => setMethod('simpson13')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                method === 'simpson13'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Simpson 1/3 (Par)
            </button>
          </div>
        </div>

        {/* Expresión f(x) */}
        <div className="space-y-1 md:col-span-3">
          <label className="text-xs font-medium text-slate-300">Función Integrando f(x)</label>
          <input
            type="text"
            value={expression}
            onChange={(e) => setExpression(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-sm font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
            placeholder="ej. x^2, exp(-x^2), sin(x)"
          />
        </div>

        {/* Límites a y b */}
        <div>
          <label className="text-xs font-medium text-slate-400">Límite Inferior (a)</label>
          <input
            type="number"
            step="any"
            value={a}
            onChange={(e) => setA(parseFloat(e.target.value) || 0)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm font-mono text-slate-200"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-slate-400">Límite Superior (b)</label>
          <input
            type="number"
            step="any"
            value={b}
            onChange={(e) => setB(parseFloat(e.target.value) || 0)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm font-mono text-slate-200"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-slate-400">Número de Subintervalos (n)</label>
          <input
            type="number"
            min="2"
            max="100"
            step="2"
            value={subintervals}
            onChange={(e) => setSubintervals(parseInt(e.target.value) || 2)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm font-mono text-slate-200"
          />
        </div>
      </div>

      {/* Resultado e Integración Gráfica */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
          <h4 className="text-sm font-semibold text-slate-200">Representación del Área de Integración</h4>

          <div className="relative h-60 bg-slate-950/80 rounded-xl border border-slate-900 p-2 overflow-hidden flex items-center justify-center">
            {result.subintervals.length > 1 ? (
              <svg className="w-full h-full" viewBox="0 0 500 220">
                {(() => {
                  const minY = Math.min(...result.subintervals.map(p => p.y), 0);
                  const maxY = Math.max(...result.subintervals.map(p => p.y), 1);
                  const rangeY = Math.max(maxY - minY, 0.1);
                  const minX = a;
                  const maxX = b;
                  const rangeX = Math.max(maxX - minX, 0.1);

                  // Polygon area path
                  const pointsStr = result.subintervals.map((p) => {
                    const cx = ((p.x - minX) / rangeX) * 460 + 20;
                    const cy = 200 - ((p.y - minY) / rangeY) * 180;
                    return `${cx.toFixed(1)},${cy.toFixed(1)}`;
                  }).join(' ');

                  const polygonPath = `20,200 ${pointsStr} 480,200`;

                  return (
                    <g>
                      <polygon points={polygonPath} fill="rgba(14, 165, 233, 0.2)" stroke="none" />
                      <polyline points={pointsStr} fill="none" stroke="#38bdf8" strokeWidth="2.5" />
                      {result.subintervals.map((p, idx) => {
                        const cx = ((p.x - minX) / rangeX) * 460 + 20;
                        const cy = 200 - ((p.y - minY) / rangeY) * 180;
                        return (
                          <g key={idx}>
                            <line x1={cx} y1={cy} x2={cx} y2="200" stroke="#334155" strokeDasharray="2 2" />
                            <circle cx={cx} cy={cy} r="3" fill="#38bdf8" />
                          </g>
                        );
                      })}
                      <line x1="10" y1="200" x2="490" y2="200" stroke="#475569" strokeWidth="1" />
                    </g>
                  );
                })()}
              </svg>
            ) : (
              <span className="text-xs text-slate-500">Expresión no válida</span>
            )}
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-4">
          <div>
            <h4 className="text-sm font-semibold text-slate-200 mb-2 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              Valor Aproximado de la Integral
            </h4>
            <div className="text-3xl font-extrabold font-mono text-cyan-400 bg-slate-900/80 p-4 rounded-xl border border-slate-800 text-center">
              I ≈ {result.value.toFixed(6)}
            </div>
          </div>

          <div className="space-y-2 text-xs text-slate-400 bg-slate-900/40 p-4 rounded-xl border border-slate-800/80">
            <div className="flex justify-between">
              <span>Método Seleccionado:</span>
              <span className="font-semibold text-slate-200 uppercase">{result.method}</span>
            </div>
            <div className="flex justify-between">
              <span>Ancho de Paso ($h$):</span>
              <span className="font-mono text-cyan-300">{((b - a) / subintervals).toFixed(4)}</span>
            </div>
            <div className="flex justify-between">
              <span>Subintervalos ($n$):</span>
              <span className="font-mono text-emerald-400">{subintervals}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
