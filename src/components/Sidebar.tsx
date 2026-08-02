import React from 'react';
import { ModuleCategory } from '../types/global';
import { LayoutDashboard, Zap, Layers, Calculator, Flame, Waves, PlusCircle } from 'lucide-react';

interface SidebarProps {
  activeModule: ModuleCategory;
  onSelectModule: (module: ModuleCategory) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeModule, onSelectModule }) => {
  const menuItems = [
    {
      id: 'dashboard' as ModuleCategory,
      title: 'Panel Principal',
      code: 'HUB',
      icon: LayoutDashboard,
      color: 'text-cyan-400',
      badge: 'Inicio'
    },
    {
      id: 'electromagnetismo' as ModuleCategory,
      title: 'Electromagnetismo',
      code: 'FIS-201',
      icon: Zap,
      color: 'text-amber-400',
      badge: 'Circuito Virtual'
    },
    {
      id: 'resistencia' as ModuleCategory,
      title: 'Resistencia de Materiales',
      code: 'ING-302',
      icon: Layers,
      color: 'text-emerald-400',
      badge: 'Vigas y Ejes'
    },
    {
      id: 'numericos' as ModuleCategory,
      title: 'Métodos Numéricos',
      code: 'MAT-204',
      icon: Calculator,
      color: 'text-purple-400',
      badge: 'Algoritmos'
    }
  ];

  const upcomingModules = [
    { title: 'Termodinámica', code: 'FIS-203', icon: Flame },
    { title: 'Mecánica de Fluidos', code: 'ING-305', icon: Waves }
  ];

  return (
    <aside className="w-64 glass-panel border-r border-slate-800/80 p-4 min-h-[calc(100vh-65px)] flex flex-col justify-between hidden md:flex">
      <div className="space-y-6">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block mb-3 px-2">
            Módulos de Pregrado
          </span>
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeModule === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectModule(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'bg-slate-850 border border-slate-700/80 text-white shadow-lg shadow-slate-950/50'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${item.color}`} />
                    <div className="text-left">
                      <div className="font-semibold text-slate-100">{item.title}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{item.code}</div>
                    </div>
                  </div>
                  <span className={`text-[9px] px-2 py-0.5 rounded-md font-mono border ${
                    isActive ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' : 'bg-slate-900 text-slate-500 border-slate-800'
                  }`}>
                    {item.badge}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Módulos Próximos a Incorporar */}
        <div className="pt-4 border-t border-slate-800/80">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block mb-3 px-2 flex items-center justify-between">
            <span>En Desarrollo</span>
            <PlusCircle className="w-3.5 h-3.5 text-slate-600" />
          </span>
          <div className="space-y-2">
            {upcomingModules.map((m, idx) => {
              const UpIcon = m.icon;
              return (
                <div key={idx} className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-950/40 border border-slate-900 text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    <UpIcon className="w-3.5 h-3.5 text-slate-600" />
                    <span>{m.title}</span>
                  </div>
                  <span className="text-[9px] font-mono bg-slate-900 text-slate-600 px-1.5 py-0.5 rounded">Próximamente</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-3 bg-slate-900/40 border border-slate-800/60 rounded-xl text-[10px] text-slate-400 space-y-1">
        <div className="font-semibold text-slate-300">Despliegue Vercel Directo</div>
        <p className="text-slate-500 text-[9px] leading-relaxed">
          Optimizado para hosting estático de alta velocidad con Single Page Routing.
        </p>
      </div>
    </aside>
  );
};
