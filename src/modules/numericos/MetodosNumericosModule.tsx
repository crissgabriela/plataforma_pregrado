import React, { useState } from 'react';
import { RootFindingSolver } from './RootFindingSolver';
import { LinearSystemsSolver } from './LinearSystemsSolver';
import { NumericalIntegrationSolver } from './NumericalIntegrationSolver';
import { Calculator, Layers, AreaChart, BookOpen, Sparkles } from 'lucide-react';

export const MetodosNumericosModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'roots' | 'systems' | 'integration'>('roots');

  return (
    <div className="space-y-6 pb-12">
      {/* Header del Módulo */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-wrap justify-between items-center gap-4">
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
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Herramientas interactivas para la resolución de ecuaciones no lineales, sistemas lineales e integración con trazabilidad matemática paso a paso.
          </p>
        </div>

        {/* Pestañas de Navegación del Módulo */}
        <div className="flex bg-slate-900/90 p-1.5 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('roots')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'roots'
                ? 'bg-purple-500 text-white shadow-md shadow-purple-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Calculator className="w-4 h-4" />
            Raíces f(x)=0
          </button>
          <button
            onClick={() => setActiveTab('systems')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'systems'
                ? 'bg-purple-500 text-white shadow-md shadow-purple-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" />
            Sistemas Ax=b
          </button>
          <button
            onClick={() => setActiveTab('integration')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'integration'
                ? 'bg-purple-500 text-white shadow-md shadow-purple-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <AreaChart className="w-4 h-4" />
            Integración
          </button>
        </div>
      </div>

      {/* Render de Herramienta Seleccionada */}
      {activeTab === 'roots' && <RootFindingSolver />}
      {activeTab === 'systems' && <LinearSystemsSolver />}
      {activeTab === 'integration' && <NumericalIntegrationSolver />}
    </div>
  );
};
