import React from 'react';
import { ModuleCategory } from '../types/global';
import { GraduationCap, Sparkles, Server, Github, ExternalLink } from 'lucide-react';

interface NavbarProps {
  activeModule: ModuleCategory;
  onSelectModule: (module: ModuleCategory) => void;
  onOpenAi: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeModule, onSelectModule, onOpenAi }) => {
  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80 px-6 py-3.5 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand logo & platform title */}
        <div
          onClick={() => onSelectModule('dashboard')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-600 p-0.5 shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-extrabold text-white tracking-tight">
                Hub Academic Pregrado
              </h1>
              <span className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-[10px] px-2 py-0.5 rounded-full font-mono font-semibold">
                v1.0
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Plataforma de Herramientas de Apoyo a Módulos de Ingeniería
            </p>
          </div>
        </div>

        {/* Global Quick Action Buttons */}
        <div className="flex items-center gap-3">
          {/* AI Assistant launcher */}
          <button
            onClick={onOpenAi}
            className="flex items-center gap-2 bg-gradient-to-r from-purple-600/30 to-indigo-600/30 hover:from-purple-600/50 hover:to-indigo-600/50 border border-purple-500/40 text-purple-200 px-3.5 py-1.5 rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
            <span>Asistente IA Académico</span>
          </button>

          {/* Vercel Status Badge */}
          <div className="hidden sm:flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl text-xs text-slate-300">
            <Server className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-mono text-[11px]">Vercel Deployment: <span className="text-emerald-400 font-bold">READY</span></span>
          </div>
        </div>
      </div>
    </header>
  );
};
