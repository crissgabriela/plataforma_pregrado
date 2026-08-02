import React, { useState, useMemo } from 'react';
import { solveBisection, solveNewtonRaphson, evaluateMathFunction } from './solverUtils';
import { Calculator, Play, RefreshCw, CheckCircle, AlertTriangle, Table as TableIcon } from 'lucide-react';

export const RootFindingSolver: React.FC = () => {
  const [method, setMethod] = useState<'bisection' | 'newton'>('bisection');
  const [expression, setExpression] = useState<string>('x^3 - x - 2');
  const [a, setA] = useState<number>(1);
  const [b, setB] = useState<number>(2);
  const [x0, setX0] = useState<number>(1.5);
  const [tolerance, setTolerance] = useState<number>(0.0001);
  const [maxIter, setMaxIter] = useState<number>(20);

  const result = useMemo(() => {
    if (method === 'bisection') {
      return solveBisection(expression, a, b, tolerance, maxIter);
    } else {
      return solveNewtonRaphson(expression, x0, tolerance, maxIter);
    }
  }, [method, expression, a, b, x0, tolerance, maxIter]);

  // Generar puntos para el gráfico SVG
  const graphPoints = useMemo(() => {
    const minX = method === 'bisection' ? Math.min(a, b) - 1 : x0 - 3;
    const maxX = method === 'bisection' ? Math.max(a, b) + 1 : x0 + 3;
    const points: { x: number; y: number }[] = [];
    const steps = 60;
    const dx = (maxX - minX) / steps;

    for (let i = 0; i <= steps; i++) {
      const px = minX + i * dx;
      const py = evaluateMathFunction(expression, px);
      if (isFinite(py) && !isNaN(py)) {
        points.push({ x: px, y: py });
      }
    }
    return { points, minX, maxX };
  }, [expression, a, b, x0, method]);

  return (
    <div className="space-y-6">
      {/* Controles de Configuración */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-4 md:col-span-3 border-b border-slate-800/80 pb-4 flex flex-wrap justify-between items-center">
          <div>
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Calculator className="w-5 h-5 text-cyan-400" />
              Búsqueda de Raíces ($f(x) = 0$)
            </h3>
            <p className="text-xs text-slate-400">Encuentra el valor exacto de x donde la función cruza el eje horizontal.</p>
          </div>
          <div className="flex gap-2 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setMethod('bisection')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                method === 'bisection'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Bisección (Intervalo)
            </button>
            <button
              onClick={() => setMethod('newton')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                method === 'newton'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Newton-Raphson (Derivada)
            </button>
          </div>
        </div>

        {/* Input Función */}
        <div className="space-y-1 md:col-span-3">
          <label className="text-xs font-medium text-slate-300">Expresión f(x)</label>
          <input
            type="text"
            value={expression}
            onChange={(e) => setExpression(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-sm font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
            placeholder="ej. x^3 - x - 2 o sin(x) - x/2"
          />
          <p className="text-[10px] text-slate-500">Formatos soportados: x^2, sin(x), cos(x), exp(x), ln(x), sqrt(x)</p>
        </div>

        {/* Parámetros específicos */}
        {method === 'bisection' ? (
          <>
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
          </>
        ) : (
          <div className="md:col-span-2">
            <label className="text-xs font-medium text-slate-400">Valor Inicial ($x_0$)</label>
            <input
              type="number"
              step="any"
              value={x0}
              onChange={(e) => setX0(parseFloat(e.target.value) || 0)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm font-mono text-slate-200"
            />
          </div>
        )}

        <div>
          <label className="text-xs font-medium text-slate-400">Tolerancia Error ($10^{-4}$)</label>
          <input
            type="number"
            step="any"
            value={tolerance}
            onChange={(e) => setTolerance(parseFloat(e.target.value) || 0.0001)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm font-mono text-slate-200"
          />
        </div>
      </div>

      {/* Resultados de la Simulación */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico Dinámico SVG */}
        <div className="lg:col-span-2 glass-panel p-5 rounded-2xl border border-slate-800 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-sm font-semibold text-slate-200">Gráfico de Convergencia</h4>
            {result.root !== null && (
              <span className="text-xs font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 px-3 py-1 rounded-full">
                Raíz r ≈ {result.root.toFixed(5)}
              </span>
            )}
          </div>

          <div className="relative h-64 bg-slate-950/80 rounded-xl border border-slate-900 overflow-hidden flex items-center justify-center p-2">
            {graphPoints.points.length > 1 ? (
              <svg className="w-full h-full" viewBox="0 0 500 240">
                {/* Eje X y Y */}
                <line x1="0" y1="120" x2="500" y2="120" stroke="#334155" strokeWidth="1" strokeDasharray="4 4" />
                <line x1="250" y1="0" x2="250" y2="240" stroke="#334155" strokeWidth="1" strokeDasharray="4 4" />

                {/* Trazo f(x) */}
                {(() => {
                  const minY = Math.min(...graphPoints.points.map(p => p.y), -5);
                  const maxY = Math.max(...graphPoints.points.map(p => p.y), 5);
                  const rangeY = Math.max(maxY - minY, 1);
                  const rangeX = Math.max(graphPoints.maxX - graphPoints.minX, 1);

                  const pathString = graphPoints.points.map((p, idx) => {
                    const cx = ((p.x - graphPoints.minX) / rangeX) * 500;
                    const cy = 240 - ((p.y - minY) / rangeY) * 240;
                    return `${idx === 0 ? 'M' : 'L'} ${cx.toFixed(1)} ${cy.toFixed(1)}`;
                  }).join(' ');

                  return (
                    <path
                      d={pathString}
                      fill="none"
                      stroke="#38bdf8"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                  );
                })()}

                {/* Marcador de la Raíz */}
                {result.root !== null && (
                  (() => {
                    const minY = Math.min(...graphPoints.points.map(p => p.y), -5);
                    const maxY = Math.max(...graphPoints.points.map(p => p.y), 5);
                    const rangeY = Math.max(maxY - minY, 1);
                    const rangeX = Math.max(graphPoints.maxX - graphPoints.minX, 1);
                    const rx = ((result.root - graphPoints.minX) / rangeX) * 500;
                    const ry = 240 - ((0 - minY) / rangeY) * 240;

                    return (
                      <g>
                        <circle cx={rx} cy={ry} r="7" fill="#10b981" className="animate-pulse" />
                        <circle cx={rx} cy={ry} r="3" fill="#ffffff" />
                      </g>
                    );
                  })()
                )}
              </svg>
            ) : (
              <span className="text-xs text-slate-500">Expresión matemática no válida</span>
            )}
          </div>
        </div>

        {/* Resumen Mensaje */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-4">
          <div>
            <h4 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
              {result.converged ? (
                <CheckCircle className="w-4 h-4 text-emerald-400" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-400" />
              )}
              Estado de la Convergencia
            </h4>
            <div className={`p-4 rounded-xl border text-xs leading-relaxed font-mono ${
              result.converged ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300' : 'bg-amber-950/30 border-amber-500/30 text-amber-300'
            }`}>
              {result.message}
            </div>
          </div>

          {result.root !== null && (
            <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 space-y-2">
              <span className="text-xs text-slate-400">Valor de la Raíz Calculada:</span>
              <div className="text-2xl font-bold font-mono text-cyan-400">
                {result.root.toFixed(6)}
              </div>
              <span className="text-[10px] text-slate-500 block">
                Total de Iteraciones Ejecutadas: {result.iterations.length}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Tabla de Iteraciones */}
      {result.iterations.length > 0 && (
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4 overflow-hidden">
          <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <TableIcon className="w-4 h-4 text-cyan-400" />
            Tabla de Iteraciones Paso a Paso
          </h4>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 bg-slate-900/50">
                  <th className="py-2.5 px-3">Iter #</th>
                  <th className="py-2.5 px-3">{method === 'bisection' ? 'a' : 'x_i'}</th>
                  <th className="py-2.5 px-3">{method === 'bisection' ? 'b' : 'x_{i+1}'}</th>
                  <th className="py-2.5 px-3">Punto c / Raíz</th>
                  <th className="py-2.5 px-3">f(c)</th>
                  <th className="py-2.5 px-3">Error Aprox</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50 text-slate-300">
                {result.iterations.map((row) => (
                  <tr key={row.iter} className="hover:bg-slate-900/50 transition-colors">
                    <td className="py-2 px-3 text-cyan-400 font-bold">{row.iter}</td>
                    <td className="py-2 px-3">{row.a.toFixed(5)}</td>
                    <td className="py-2 px-3">{row.b.toFixed(5)}</td>
                    <td className="py-2 px-3 text-emerald-400 font-semibold">{row.c.toFixed(5)}</td>
                    <td className="py-2 px-3">{row.fc.toExponential(3)}</td>
                    <td className="py-2 px-3 text-slate-400">{row.error.toExponential(3)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
