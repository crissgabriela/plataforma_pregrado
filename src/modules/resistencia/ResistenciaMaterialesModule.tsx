import React, { useState } from 'react';
import { AcademicHeader } from './AcademicHeader';
import { BeamModule } from './BeamModule';
import { ShaftModule } from './ShaftModule';
import { MATERIALS } from './materials';
import { Layers, Circle, Activity } from 'lucide-react';

export const ResistenciaMaterialesModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'beams' | 'shafts'>('beams');

  return (
    <div className="space-y-6 pb-12">
      <AcademicHeader />

      {/* Selector de Pestañas */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex justify-between items-center flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-cyan-400" />
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
            Laboratorios Interactivos de Ensayo de Solidos
          </h3>
        </div>

        <div className="flex bg-slate-900/90 p-1.5 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('beams')}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'beams'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" />
            Flexión en Vigas (V, M, δ)
          </button>
          <button
            onClick={() => setActiveTab('shafts')}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'shafts'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Circle className="w-4 h-4" />
            Torsión en Ejes (T, τ, φ)
          </button>
        </div>
      </div>

      {activeTab === 'beams' ? (
        <BeamModule materials={MATERIALS} />
      ) : (
        <ShaftModule materials={MATERIALS} />
      )}
    </div>
  );
};
