import React from "react";
import { Award } from "lucide-react";

export function AcademicHeader() {
  return (
    <header className="bg-slate-950/40 text-slate-200 border-b border-slate-800 backdrop-blur-md rounded-2xl p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="flex items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-400">
                Universidad de Talca
              </span>
              <span className="w-1 h-1 rounded-full bg-slate-700"></span>
              <span className="text-[10px] text-slate-400 font-mono tracking-widest uppercase">
                Chile
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight mt-1 text-white flex flex-wrap items-center gap-x-2">
              Resistencia de Materiales
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Laboratorio de Simulación Interactiva &middot; Diagramas V, M, Deflexión y Torsión de Ejes
            </p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 md:self-center">
          <div className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5">
            <div className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">
              Módulo de Asignatura
            </div>
            <div className="text-xs font-semibold text-cyan-400 flex items-center gap-1.5 mt-0.5">
              <Award className="w-3.5 h-3.5 shrink-0 text-cyan-400" />
              ING-302 (Mecánica de Sólidos)
            </div>
          </div>
          
          <div className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 flex items-center gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></div>
            <div>
              <div className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">
                Motor Físico
              </div>
              <div className="text-xs font-semibold text-emerald-400">
                Euler-Bernoulli &amp; Torsión Cilíndrica
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
