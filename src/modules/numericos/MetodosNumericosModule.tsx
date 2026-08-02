import React, { useState } from 'react';
import { RootFindingSolver } from './RootFindingSolver';
import { LinearSystemsSolver } from './LinearSystemsSolver';
import { NumericalIntegrationSolver } from './NumericalIntegrationSolver';
import { ErrorAnalysisSolver } from './ErrorAnalysisSolver';
import { IterativeSystemsSolver } from './IterativeSystemsSolver';
import { CurveFittingSolver } from './CurveFittingSolver';
import { OptimizationSolver } from './OptimizationSolver';
import { Calculator, Layers, AreaChart, ShieldAlert, RefreshCw, TrendingUp, Target } from 'lucide-react';

export const MetodosNumericosModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'errors' | 'roots' | 'direct' | 'iterative' | 'fitting' | 'integration' | 'optimization'>('roots');

  return (
    <div className="space-y-6 pb-12">
      {/* Header del Módulo */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-purple-500/10 text-purple-400 border border-purple-500/30 text-xs px-2.5 py-0.5 rounded-full font-mono font-semibold">
                MAT-204
              </span>
              <span className="text-xs text-slate-400">Módulo de Pregrado</span>
            </div>
            <h2 className="text-2xl font-black text-white flex items-center gap-2">
              <Calculator className="w-6 h-6 text-purple-400" />
              Métodos Numéricos y Computación Técnica
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl">
              Suite algorítmica completa basada en los 7 temas oficiales del curso y Chapra &amp; Canale (Teoría de Errores, Ecuaciones No Lineales, Sistemas Directos/Iterativos, Ajuste de Curvas, Integración y Optimización).
            </p>
          </div>
        </div>

        {/* Pestañas de Navegación del Módulo */}
        <div className="flex flex-wrap gap-1.5 bg-slate-900/90 p-1.5 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('errors')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'errors'
                ? 'bg-purple-500 text-white shadow-md shadow-purple-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" /> Errores (MN 01)
          </button>
          <button
            onClick={() => setActiveTab('roots')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'roots'
                ? 'bg-purple-500 text-white shadow-md shadow-purple-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" /> Raíces f(x)=0 (MN 06)
          </button>
          <button
            onClick={() => setActiveTab('direct')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'direct'
                ? 'bg-purple-500 text-white shadow-md shadow-purple-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" /> Ax=b Directos (MN 02)
          </button>
          <button
            onClick={() => setActiveTab('iterative')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'iterative'
                ? 'bg-purple-500 text-white shadow-md shadow-purple-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <RefreshCw className="w-3.5 h-3.5" /> Ax=b Iterativos (MN 03)
          </button>
          <button
            onClick={() => setActiveTab('fitting')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'fitting'
                ? 'bg-purple-500 text-white shadow-md shadow-purple-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" /> Ajuste Curvas (MN 04)
          </button>
          <button
            onClick={() => setActiveTab('integration')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'integration'
                ? 'bg-purple-500 text-white shadow-md shadow-purple-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <AreaChart className="w-3.5 h-3.5" /> Integración (MN 05)
          </button>
          <button
            onClick={() => setActiveTab('optimization')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'optimization'
                ? 'bg-purple-500 text-white shadow-md shadow-purple-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Target className="w-3.5 h-3.5" /> Optimización (MN 07)
          </button>
        </div>
      </div>

      {/* Render del Módulo Seleccionado */}
      {activeTab === 'errors' && <ErrorAnalysisSolver />}
      {activeTab === 'roots' && <RootFindingSolver />}
      {activeTab === 'direct' && <LinearSystemsSolver />}
      {activeTab === 'iterative' && <IterativeSystemsSolver />}
      {activeTab === 'fitting' && <CurveFittingSolver />}
      {activeTab === 'integration' && <NumericalIntegrationSolver />}
      {activeTab === 'optimization' && <OptimizationSolver />}
    </div>
  );
};
