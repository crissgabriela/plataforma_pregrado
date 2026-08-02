import React, { useState, useEffect, useRef } from 'react';
import { CircuitComponent, Wire, VoltmeterProbe, DataPoint } from '../../types/electromagnetismo';
import { solveCircuit } from './physics';
import SandboxCanvas from './SandboxCanvas';
import Oscilloscope from './Oscilloscope';
import { SidebarCircuits } from './SidebarCircuits';
import { Zap, Sparkles, HelpCircle } from 'lucide-react';

export const ElectromagnetismoModule: React.FC = () => {
  const [components, setComponents] = useState<CircuitComponent[]>([]);
  const [wires, setWires] = useState<Wire[]>([]);
  
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null);
  const [showEField, setShowEField] = useState<boolean>(false);
  const [simulationSpeed, setSimulationSpeed] = useState<number>(1.0);
  const [simulationRunning, setSimulationRunning] = useState<boolean>(true);

  const [voltmeterRed, setVoltmeterRed] = useState<VoltmeterProbe>({
    x: 80, y: 150, dragging: false, snappedTerminalId: null
  });
  const [voltmeterBlack, setVoltmeterBlack] = useState<VoltmeterProbe>({
    x: 80, y: 190, dragging: false, snappedTerminalId: null
  });

  const [stopwatchTime, setStopwatchTime] = useState<number>(0);
  const [stopwatchRunning, setStopwatchRunning] = useState<boolean>(false);

  const [dataPoints, setDataPoints] = useState<DataPoint[]>([]);
  const [capturedTable, setCapturedTable] = useState<DataPoint[]>([]);
  
  const currentVoltagesRef = useRef<Record<string, number>>({});
  const currentCurrentsRef = useRef<Record<string, number>>({});
  const [warnings, setWarnings] = useState<string[]>([]);

  const [idealCurveType, setIdealCurveType] = useState<'charge' | 'discharge' | 'ohm'>('charge');
  const [rcParameters, setRcParameters] = useState<{ R: number; C: number; V0: number }>({
    R: 1000, C: 0.01, V0: 10
  });

  useEffect(() => {
    loadScenario('preset_ohm');
  }, []);

  const loadScenario = (scenarioId: string) => {
    if (scenarioId === 'preset_ohm') {
      const c1: CircuitComponent = {
        id: 'src1', type: 'source', x: 180, y: 220, angle: 0, voltage: 12, nominalVoltage: 40, failed: false
      };
      const c2: CircuitComponent = {
        id: 'res1', type: 'resistor', x: 420, y: 220, angle: 0, resistance: 100, isOhmic: true, nominalVoltage: 30, failed: false
      };
      const w1: Wire = { id: 'w1', fromTerminalId: 'src1_pos', toTerminalId: 'res1_a' };
      const w2: Wire = { id: 'w2', fromTerminalId: 'src1_neg', toTerminalId: 'res1_b' };

      setComponents([c1, c2]);
      setWires([w1, w2]);
      setIdealCurveType('ohm');
      setRcParameters({ R: 100, C: 0.01, V0: 12 });
    } else if (scenarioId === 'preset_rc') {
      const c1: CircuitComponent = {
        id: 'src1', type: 'source', x: 160, y: 220, angle: 0, voltage: 10, nominalVoltage: 40, failed: false
      };
      const c2: CircuitComponent = {
        id: 'res1', type: 'resistor', x: 330, y: 150, angle: 0, resistance: 1000, isOhmic: true, nominalVoltage: 30, failed: false
      };
      const c3: CircuitComponent = {
        id: 'cap1', type: 'capacitor', x: 480, y: 220, angle: 0, capacitance: 0.005, charge: 0, voltageCapacitor: 0, nominalVoltage: 25, failed: false
      };
      const c4: CircuitComponent = {
        id: 'sw1', type: 'switch', x: 330, y: 290, angle: 0, isOpen: false, nominalVoltage: 40, failed: false
      };

      const w1: Wire = { id: 'w1', fromTerminalId: 'src1_pos', toTerminalId: 'res1_a' };
      const w2: Wire = { id: 'w2', fromTerminalId: 'res1_b', toTerminalId: 'cap1_pos' };
      const w3: Wire = { id: 'w3', fromTerminalId: 'cap1_neg', toTerminalId: 'sw1_b' };
      const w4: Wire = { id: 'w4', fromTerminalId: 'sw1_a', toTerminalId: 'src1_neg' };

      setComponents([c1, c2, c3, c4]);
      setWires([w1, w2, w3, w4]);
      setIdealCurveType('charge');
      setRcParameters({ R: 1000, C: 0.005, V0: 10 });
    }
  };

  useEffect(() => {
    let active = true;
    const tick = () => {
      if (!active) return;
      const dt = 0.05 * simulationSpeed;
      if (simulationRunning && dt > 0) {
        setComponents(prevComponents => {
          if (prevComponents.length === 0) return prevComponents;
          const result = solveCircuit(prevComponents, wires, dt);
          currentVoltagesRef.current = result.terminalVoltages;
          currentCurrentsRef.current = result.componentCurrents;
          setWarnings(result.warnings);
          return result.updatedComponents;
        });

        if (stopwatchRunning) {
          setStopwatchTime(prevTime => {
            const nextTime = prevTime + dt;
            const curV = voltmeterRed.snappedTerminalId ? (currentVoltagesRef.current[voltmeterRed.snappedTerminalId] ?? 0) : 0;
            if (nextTime <= 30) {
              setDataPoints(prev => [...prev, { time: nextTime, measuredV: Math.max(0, curV), measuredI: 0 }]);
            }
            return nextTime;
          });
        }
      }
    };

    const interval = setInterval(tick, 50);
    return () => { active = false; clearInterval(interval); };
  }, [wires, simulationSpeed, simulationRunning, stopwatchRunning, voltmeterRed]);

  const addComponent = (type: CircuitComponent['type'], isOhmic: boolean = true) => {
    const newComp: CircuitComponent = {
      id: `${type}_${Date.now()}`,
      type,
      x: 300,
      y: 200,
      angle: 0,
      voltage: type === 'source' ? 12 : undefined,
      resistance: type === 'resistor' ? 100 : undefined,
      capacitance: type === 'capacitor' ? 0.01 : undefined,
      isOhmic,
      isOpen: type === 'switch' ? true : undefined,
      nominalVoltage: 24,
      failed: false
    };
    setComponents(prev => [...prev, newComp]);
  };

  const handleCaptureCurrentPoint = () => {
    const curV = voltmeterRed.snappedTerminalId ? (currentVoltagesRef.current[voltmeterRed.snappedTerminalId] ?? 0) : 0;
    setCapturedTable(prev => [...prev, { time: stopwatchTime, measuredV: Math.max(0, curV), measuredI: 0 }]);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header del Módulo */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex justify-between items-center flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-xs px-2.5 py-0.5 rounded-full font-mono font-semibold">
              FIS-201
            </span>
            <span className="text-xs text-slate-400">Módulo de Pregrado</span>
          </div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <Zap className="w-6 h-6 text-cyan-400" />
            Laboratorio Virtual de Electromagnetismo y Electricidad
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Simulador Nodal de Redes RLC en Tiempo Real con Análisis Transitorio RC, Osciloscopio y Medición de Fallas Virtuales.
          </p>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        <div className="lg:col-span-3 space-y-6">
          <SandboxCanvas
            components={components}
            wires={wires}
            onUpdateComponents={setComponents}
            onUpdateWires={setWires}
            selectedComponentId={selectedComponentId}
            onSelectComponent={setSelectedComponentId}
            voltmeterRed={voltmeterRed}
            voltmeterBlack={voltmeterBlack}
            onChangeVoltmeterRed={setVoltmeterRed}
            onChangeVoltmeterBlack={setVoltmeterBlack}
            terminalVoltages={currentVoltagesRef.current}
            componentCurrents={currentCurrentsRef.current}
            showEField={showEField}
            warnings={warnings}
            simulationSpeed={simulationSpeed}
          />

          <Oscilloscope
            dataPoints={dataPoints}
            onClearPoints={() => setDataPoints([])}
            capturedTable={capturedTable}
            onCaptureCurrentPoint={handleCaptureCurrentPoint}
            onClearTable={() => setCapturedTable([])}
            idealCurveType={idealCurveType}
            rcParameters={rcParameters}
          />
        </div>

        <div>
          <SidebarCircuits
            onAddComponent={addComponent}
            selectedComponent={components.find(c => c.id === selectedComponentId) || null}
            onUpdateComponent={(updated) => setComponents(components.map(c => c.id === updated.id ? updated : c))}
            onLoadScenario={loadScenario}
            onClearCanvas={() => { setComponents([]); setWires([]); setDataPoints([]); setCapturedTable([]); }}
            showEField={showEField}
            onToggleEField={() => setShowEField(!showEField)}
            simulationSpeed={simulationSpeed}
            onSetSimulationSpeed={setSimulationSpeed}
            stopwatchTime={stopwatchTime}
            stopwatchRunning={stopwatchRunning}
            onToggleStopwatch={() => setStopwatchRunning(!stopwatchRunning)}
            onResetStopwatch={() => { setStopwatchTime(0); setDataPoints([]); }}
          />
        </div>
      </div>
    </div>
  );
};
