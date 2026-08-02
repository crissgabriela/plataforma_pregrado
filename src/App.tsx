import React, { useState } from 'react';
import { ModuleCategory } from './types/global';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { DashboardHome } from './components/DashboardHome';
import { ElectromagnetismoModule } from './modules/electromagnetismo/ElectromagnetismoModule';
import { ResistenciaMaterialesModule } from './modules/resistencia/ResistenciaMaterialesModule';
import { MetodosNumericosModule } from './modules/numericos/MetodosNumericosModule';
import { AiAssistantModal } from './components/AiAssistantModal';

export function App() {
  const [activeModule, setActiveModule] = useState<ModuleCategory>('dashboard');
  const [isAiOpen, setIsAiOpen] = useState<boolean>(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Top Navbar */}
      <Navbar
        activeModule={activeModule}
        onSelectModule={setActiveModule}
        onOpenAi={() => setIsAiOpen(true)}
      />

      <div className="flex-1 flex max-w-7xl w-full mx-auto px-4 sm:px-6 pt-6 gap-6">
        {/* Left Sidebar */}
        <Sidebar
          activeModule={activeModule}
          onSelectModule={setActiveModule}
        />

        {/* Main Content Viewport */}
        <main className="flex-1 min-w-0">
          {activeModule === 'dashboard' && (
            <DashboardHome onSelectModule={setActiveModule} />
          )}

          {activeModule === 'electromagnetismo' && (
            <ElectromagnetismoModule />
          )}

          {activeModule === 'resistencia' && (
            <ResistenciaMaterialesModule />
          )}

          {activeModule === 'numericos' && (
            <MetodosNumericosModule />
          )}
        </main>
      </div>

      {/* AI Assistant Modal */}
      <AiAssistantModal
        isOpen={isAiOpen}
        onClose={() => setIsAiOpen(false)}
      />
    </div>
  );
}

export default App;
