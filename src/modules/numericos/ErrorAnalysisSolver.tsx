import React, { useState, useMemo } from 'react';
import { calculateErrorAnalysis } from './solverUtils';
import { ShieldAlert, CheckCircle, Calculator, Info } from 'lucide-react';

export const ErrorAnalysisSolver: React.FC = () => {
  const [trueVal, setTrueVal] = useState<number>(Math.PI);
  const [approxVal, setApproxVal] = useState<number>(3.1416);

  const result = useMemo(() => {
    return calculateErrorAnalysis(trueVal, approxVal);
  }, [trueVal, approxVal]);

  return (
    <div className="space-y-6">
      {/* Controles */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2 border-b border-slate-800 pb-4">
          <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-400" />
            Análisis de Errores y Cifras Significativas (MN 01)
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Cálculo de error absoluto $E_a$, relativo $E_r$, porcentaje de error $E_p$ y cifras significativas exactas.
          </p>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-300">Valor Verdadero ($x$)</label>
          <input
            type="number"
            step="any"
            value={trueVal}
            onChange={(e) => setTrueVal(parseFloat(e.target.value) || 0)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm font-mono text-cyan-300 focus:outline-none focus:border-cyan-500 mt-1"
          />
          <span className="text-[10px] text-slate-500 block mt-1">Ejemplo: π ≈ 3.14159265...</span>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-300">Valor Aproximado ($\tilde{x}$)</label>
          <input
            type="number"
            step="any"
            value={approxVal}
            onChange={(e) => setApproxVal(parseFloat(e.target.value) || 0)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm font-mono text-emerald-300 focus:outline-none focus:border-emerald-500 mt-1"
          />
          <span className="text-[10px] text-slate-500 block mt-1">Ejemplo: 3.1416</span>
        </div>
      </div>

      {/* Resultados */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-[10px] font-mono uppercase text-slate-500">Error Absoluto ($E_a$)</span>
          <div className="text-xl font-bold font-mono text-amber-400">
            {result.absError.toExponential(4)}
          </div>
          <span className="text-[10px] text-slate-500 block">$E_a = |x - \tilde{x}|$</span>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-[10px] font-mono uppercase text-slate-500">Error Relativo ($E_r$)</span>
          <div className="text-xl font-bold font-mono text-cyan-400">
            {result.relError.toExponential(4)}
          </div>
          <span className="text-[10px] text-slate-500 block">$E_r = \frac{|x - \tilde{x}|}{|x|}$</span>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-[10px] font-mono uppercase text-slate-500">Error Porcentual ($E_p$)</span>
          <div className="text-xl font-bold font-mono text-rose-400">
            {result.pctError.toFixed(4)} %
          </div>
          <span className="text-[10px] text-slate-500 block">$E_p = E_r \times 100\%$</span>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-[10px] font-mono uppercase text-slate-500">Cifras Significativas</span>
          <div className="text-xl font-bold font-mono text-emerald-400">
            {result.significantDigits} Cifras
          </div>
          <span className="text-[10px] text-slate-500 block">Criterio Scarborough</span>
        </div>
      </div>
    </div>
  );
};
