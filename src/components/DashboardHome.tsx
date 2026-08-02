import React from 'react';
import { ModuleCategory } from '../types/global';
import { Zap, Layers, Calculator, ArrowRight, Sparkles, CheckCircle2, Server, GraduationCap, ShieldCheck } from 'lucide-react';

interface DashboardHomeProps {
  onSelectModule: (module: ModuleCategory) => void;
}

export const DashboardHome: React.FC<DashboardHomeProps> = ({ onSelectModule }) => {
  const cards = [
    {
      id: 'electromagnetismo' as ModuleCategory,
      title: 'Electromagnetismo y Electricidad',
      code: 'FIS-201',
      description: 'Laboratorio virtual interactivo con solucionador nodal de circuitos RLC en tiempo real, osciloscopio digital, transitorios RC y simulación de fallas virtualizadas.',
      icon: Zap,
      badge: 'Laboratorio Interactivo',
      gradient: 'from-amber-500/20 via-amber-500/5 to-transparent',
      borderColor: 'border-amber-500/30',
      textColor: 'text-amber-400',
      btnColor: 'bg-amber-500 text-slate-950 hover:bg-amber-400',
      tools: ['Solucionador Nodal DC', 'Osciloscopio 2 Canales', 'Ensayo Carga/Descarga RC', 'Multímetro Flotante']
    },
    {
      id: 'resistencia' as ModuleCategory,
      title: 'Resistencia de Materiales',
      code: 'ING-302',
      description: 'Calculadora de flexión pura y combinada en vigas según Euler-Bernoulli, diagramas de cortante V(x), momento M(x) y deflexión δ(x) junto con torsión en ejes cilíndricos.',
      icon: Layers,
      badge: 'Simulador Mecánico',
      gradient: 'from-emerald-500/20 via-emerald-500/5 to-transparent',
      borderColor: 'border-emerald-500/30',
      textColor: 'text-emerald-400',
      btnColor: 'bg-emerald-500 text-slate-950 hover:bg-emerald-400',
      tools: ['Diagramas V(x) y M(x)', 'Curva de Deflexión δ(x)', 'Torsión en Ejes Huecos/Macizos', 'Concentradores K']
    },
    {
      id: 'numericos' as ModuleCategory,
      title: 'Métodos Numéricos',
      code: 'MAT-204',
      description: 'Suite computacional para búsqueda de raíces f(x)=0 por Bisección y Newton-Raphson, resolución de sistemas de ecuaciones Ax=b por Gauss-Jordan e integración numérica.',
      icon: Calculator,
      badge: 'Suite Algorítmica',
      gradient: 'from-purple-500/20 via-purple-500/5 to-transparent',
      borderColor: 'border-purple-500/30',
      textColor: 'text-purple-400',
      btnColor: 'bg-purple-500 text-slate-950 hover:bg-purple-400',
      tools: ['Bisección y Newton-Raphson', 'Gauss-Jordan Ax=b', 'Integración Trapecio/Simpson', 'Gráficos SVG Dinámicos']
    }
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Banner */}
      <div className="relative overflow-hidden glass-panel p-8 md:p-12 rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900/90 to-cyan-950/40">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Plataforma Académica de Ingeniería</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
            Herramientas Interactivas de Apoyo a <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-300 to-purple-400">Módulos de Pregrado</span>
          </h1>

          <p className="text-sm md:text-base text-slate-300 leading-relaxed">
            Plataforma centralizada para simulaciones científicas, cálculo simbólico y resolución de problemas prácticos en laboratorios de ingeniería. Lista para despliegue continuo en <strong>Vercel</strong>.
          </p>

          <div className="pt-2 flex flex-wrap gap-4 text-xs font-mono text-slate-400">
            <div className="flex items-center gap-1.5 bg-slate-950/60 px-3 py-1.5 rounded-lg border border-slate-800">
              <CheckCircle2 className="w-4 h-4 text-cyan-400" />
              <span>React 19 + TypeScript + Vite</span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-950/60 px-3 py-1.5 rounded-lg border border-slate-800">
              <Server className="w-4 h-4 text-emerald-400" />
              <span>Vercel Optimized SPA</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tarjetas de Asignaturas / Módulos */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-cyan-400" />
            Asignaturas y Laboratorios Disponibles
          </h2>
          <span className="text-xs text-slate-400">Selecciona un módulo para ingresar a sus herramientas</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.id}
                className={`glass-card p-6 rounded-2xl border ${card.borderColor} bg-gradient-to-b ${card.gradient} flex flex-col justify-between space-y-6 group`}
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div className={`p-3 rounded-xl bg-slate-900 border border-slate-800 ${card.textColor}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-mono font-bold bg-slate-900 text-slate-400 px-2.5 py-1 rounded-md border border-slate-800">
                      {card.code}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      {card.badge}
                    </span>
                    <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">
                      {card.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                      {card.description}
                    </p>
                  </div>

                  {/* List of features */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-800/60">
                    {card.tools.map((t, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-[11px] text-slate-300">
                        <span className={`w-1.5 h-1.5 rounded-full ${card.textColor} bg-current`} />
                        <span>{t}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => onSelectModule(card.id)}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md ${card.btnColor}`}
                >
                  <span>Abrir Laboratorio</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
