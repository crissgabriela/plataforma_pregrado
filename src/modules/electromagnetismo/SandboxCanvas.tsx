import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CircuitComponent, Terminal, Wire, VoltmeterProbe } from '../../types/electromagnetismo';
import { Trash2, RotateCw, RefreshCw, AlertTriangle, Scissors } from 'lucide-react';

interface SandboxCanvasProps {
  components: CircuitComponent[];
  wires: Wire[];
  onUpdateComponents: (components: CircuitComponent[]) => void;
  onUpdateWires: (wires: Wire[]) => void;
  selectedComponentId: string | null;
  onSelectComponent: (id: string | null) => void;
  voltmeterRed: VoltmeterProbe;
  voltmeterBlack: VoltmeterProbe;
  onChangeVoltmeterRed: (p: VoltmeterProbe) => void;
  onChangeVoltmeterBlack: (p: VoltmeterProbe) => void;
  terminalVoltages: Record<string, number>;
  componentCurrents: Record<string, number>;
  showEField: boolean;
  warnings: string[];
  simulationSpeed: number;
}

export default function SandboxCanvas({
  components,
  wires,
  onUpdateComponents,
  onUpdateWires,
  selectedComponentId,
  onSelectComponent,
  voltmeterRed,
  voltmeterBlack,
  onChangeVoltmeterRed,
  onChangeVoltmeterBlack,
  terminalVoltages,
  componentCurrents,
  showEField,
  warnings,
  simulationSpeed
}: SandboxCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  
  const [draggedComponentId, setDraggedComponentId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [draggedProbe, setDraggedProbe] = useState<'red' | 'black' | null>(null);
  const [probeOffset, setProbeOffset] = useState({ x: 0, y: 0 });

  const [voltmeterPos, setVoltmeterPos] = useState({ x: 30, y: 25 });
  const [isDraggingVoltmeter, setIsDraggingVoltmeter] = useState(false);
  const [voltmeterDragOffset, setVoltmeterDragOffset] = useState({ x: 0, y: 0 });

  const [activeWiringStart, setActiveWiringStart] = useState<{
    terminalId: string;
    componentId: string;
    x: number;
    y: number;
  } | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [selectedWireId, setSelectedWireId] = useState<string | null>(null);

  const getTerminalGlobalPos = (c: CircuitComponent, termRole: string) => {
    let rx = 0;
    let ry = 0;
    
    if (c.type === 'source' || c.type === 'capacitor') {
      rx = termRole === 'pos' ? -55 : 55;
      ry = 0;
    } else {
      rx = termRole === 'a' ? -55 : 55;
      ry = 0;
    }

    const rad = (c.angle * Math.PI) / 180;
    const gx = c.x + rx * Math.cos(rad) - ry * Math.sin(rad);
    const gy = c.y + rx * Math.sin(rad) + ry * Math.cos(rad);
    
    return { x: gx, y: gy };
  };

  const parseTerminalName = (tId: string) => {
    const parts = tId.split('_');
    const role = parts[parts.length - 1];
    const cId = tId.replace(`_${role}`, '');
    return { cId, role };
  };

  const handlePointerDownComponent = (e: React.PointerEvent, c: CircuitComponent) => {
    e.stopPropagation();
    onSelectComponent(c.id);
    setSelectedWireId(null);
    setDraggedComponentId(c.id);

    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left - c.x,
        y: e.clientY - rect.top - c.y,
      });
    }
  };

  const handlePointerDownProbe = (e: React.PointerEvent, color: 'red' | 'black') => {
    e.stopPropagation();
    setDraggedProbe(color);
    const probe = color === 'red' ? voltmeterRed : voltmeterBlack;
    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      setProbeOffset({
        x: e.clientX - rect.left - probe.x,
        y: e.clientY - rect.top - probe.y,
      });
    }
  };

  const handlePointerDownTerminal = (e: React.PointerEvent, c: CircuitComponent, termRole: string) => {
    e.stopPropagation();
    const tId = `${c.id}_${termRole}`;
    const pos = getTerminalGlobalPos(c, termRole);
    setActiveWiringStart({
      terminalId: tId,
      componentId: c.id,
      x: pos.x,
      y: pos.y,
    });
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const curX = e.clientX - rect.left;
    const curY = e.clientY - rect.top;
    setMousePos({ x: curX, y: curY });

    if (draggedComponentId) {
      const newX = Math.max(70, Math.min(rect.width - 70, curX - dragOffset.x));
      const newY = Math.max(50, Math.min(rect.height - 50, curY - dragOffset.y));
      onUpdateComponents(components.map(c => c.id === draggedComponentId ? { ...c, x: newX, y: newY } : c));
    } else if (draggedProbe) {
      const newX = Math.max(10, Math.min(rect.width - 10, curX - probeOffset.x));
      const newY = Math.max(10, Math.min(rect.height - 10, curY - probeOffset.y));

      let snappedId: string | null = null;
      components.forEach(c => {
        const roles = (c.type === 'source' || c.type === 'capacitor') ? ['pos', 'neg'] : ['a', 'b'];
        roles.forEach(r => {
          const tPos = getTerminalGlobalPos(c, r);
          if (Math.hypot(newX - tPos.x, newY - tPos.y) < 22) {
            snappedId = `${c.id}_${r}`;
          }
        });
      });

      if (draggedProbe === 'red') {
        onChangeVoltmeterRed({ ...voltmeterRed, x: newX, y: newY, snappedTerminalId: snappedId });
      } else {
        onChangeVoltmeterBlack({ ...voltmeterBlack, x: newX, y: newY, snappedTerminalId: snappedId });
      }
    } else if (isDraggingVoltmeter) {
      setVoltmeterPos({
        x: Math.max(10, curX - voltmeterDragOffset.x),
        y: Math.max(10, curY - voltmeterDragOffset.y)
      });
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (draggedComponentId) setDraggedComponentId(null);
    if (draggedProbe) setDraggedProbe(null);
    if (isDraggingVoltmeter) setIsDraggingVoltmeter(false);

    if (activeWiringStart && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const curX = e.clientX - rect.left;
      const curY = e.clientY - rect.top;

      let targetTerminalId: string | null = null;
      components.forEach(c => {
        const roles = (c.type === 'source' || c.type === 'capacitor') ? ['pos', 'neg'] : ['a', 'b'];
        roles.forEach(r => {
          const tId = `${c.id}_${r}`;
          if (tId !== activeWiringStart.terminalId) {
            const tPos = getTerminalGlobalPos(c, r);
            if (Math.hypot(curX - tPos.x, curY - tPos.y) < 30) {
              targetTerminalId = tId;
            }
          }
        });
      });

      if (targetTerminalId) {
        const newWire: Wire = {
          id: `wire_${Date.now()}`,
          fromTerminalId: activeWiringStart.terminalId,
          toTerminalId: targetTerminalId,
          customColor: 'auto'
        };
        onUpdateWires([...wires, newWire]);
      }
      setActiveWiringStart(null);
    }
  };

  const rotateSelectedComponent = () => {
    if (!selectedComponentId) return;
    onUpdateComponents(components.map(c => c.id === selectedComponentId ? { ...c, angle: (c.angle + 90) % 360 } : c));
  };

  const deleteSelectedComponent = () => {
    if (!selectedComponentId) return;
    onUpdateComponents(components.filter(c => c.id !== selectedComponentId));
    onUpdateWires(wires.filter(w => {
      const { cId: c1 } = parseTerminalName(w.fromTerminalId);
      const { cId: c2 } = parseTerminalName(w.toTerminalId);
      return c1 !== selectedComponentId && c2 !== selectedComponentId;
    }));
    onSelectComponent(null);
  };

  const deleteSelectedWire = () => {
    if (!selectedWireId) return;
    onUpdateWires(wires.filter(w => w.id !== selectedWireId));
    setSelectedWireId(null);
  };

  const getVoltmeterReading = () => {
    const vRed = voltmeterRed.snappedTerminalId ? (terminalVoltages[voltmeterRed.snappedTerminalId] ?? 0) : null;
    const vBlack = voltmeterBlack.snappedTerminalId ? (terminalVoltages[voltmeterBlack.snappedTerminalId] ?? 0) : null;
    if (vRed !== null && vBlack !== null) {
      return (vRed - vBlack).toFixed(2);
    }
    return '---';
  };

  return (
    <div
      ref={canvasRef}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onClick={() => { onSelectComponent(null); setSelectedWireId(null); }}
      className="relative flex-1 bg-[#090b10] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl select-none cursor-crosshair min-h-[500px]"
    >
      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />

      {/* Warning Overlay Banner */}
      <AnimatePresence>
        {warnings.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-4 left-1/2 -translate-x-1/2 z-30 bg-rose-950/90 border border-rose-500/50 text-rose-200 text-xs px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg backdrop-blur-md"
          >
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{warnings[0]}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Multimeter Display */}
      <div
        style={{ left: `${voltmeterPos.x}px`, top: `${voltmeterPos.y}px` }}
        onPointerDown={(e) => {
          e.stopPropagation();
          setIsDraggingVoltmeter(true);
          const rect = canvasRef.current?.getBoundingClientRect();
          if (rect) {
            setVoltmeterDragOffset({ x: e.clientX - rect.left - voltmeterPos.x, y: e.clientY - rect.top - voltmeterPos.y });
          }
        }}
        className="absolute z-20 bg-slate-900/90 border border-slate-700/80 p-3 rounded-xl shadow-xl backdrop-blur-md cursor-grab active:cursor-grabbing w-48 font-mono"
      >
        <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">
          <span>Multímetro Digital</span>
          <span className="text-emerald-400">AUTO</span>
        </div>
        <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-right">
          <span className="text-2xl font-bold font-mono text-cyan-400 tracking-wider">
            {getVoltmeterReading()}
          </span>
          <span className="text-xs text-slate-500 ml-1">V</span>
        </div>
        <div className="flex justify-between items-center text-[9px] text-slate-500 mt-2">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 inline-block"/> Sonda (+)</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-100 inline-block"/> Sonda (-)</span>
        </div>
      </div>

      {/* SVG Layer: Wires and Probe Leads */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
        {/* Render Wires */}
        {wires.map((w) => {
          const { cId: c1, role: r1 } = parseTerminalName(w.fromTerminalId);
          const { cId: c2, role: r2 } = parseTerminalName(w.toTerminalId);
          const comp1 = components.find(c => c.id === c1);
          const comp2 = components.find(c => c.id === c2);
          if (!comp1 || !comp2) return null;

          const p1 = getTerminalGlobalPos(comp1, r1);
          const p2 = getTerminalGlobalPos(comp2, r2);
          const isSelected = selectedWireId === w.id;

          const midX = (p1.x + p2.x) / 2;
          const midY = (p1.y + p2.y) / 2;
          const pathStr = `M ${p1.x} ${p1.y} Q ${midX} ${midY + 15} ${p2.x} ${p2.y}`;

          return (
            <g key={w.id} className="pointer-events-auto cursor-pointer" onClick={(e) => { e.stopPropagation(); setSelectedWireId(w.id); onSelectComponent(null); }}>
              <path
                d={pathStr}
                stroke={isSelected ? '#38bdf8' : '#0ea5e9'}
                strokeWidth={isSelected ? '4' : '2.5'}
                fill="none"
                strokeLinecap="round"
                className="transition-all hover:stroke-cyan-300"
              />
            </g>
          );
        })}

        {/* Temporary Wiring Path */}
        {activeWiringStart && (
          <line
            x1={activeWiringStart.x}
            y1={activeWiringStart.y}
            x2={mousePos.x}
            y2={mousePos.y}
            stroke="#38bdf8"
            strokeWidth="2"
            strokeDasharray="4 4"
          />
        )}

        {/* Voltmeter Probe Cables */}
        <path
          d={`M ${voltmeterPos.x + 40} ${voltmeterPos.y + 70} Q ${(voltmeterPos.x + voltmeterRed.x)/2} ${(voltmeterPos.y + voltmeterRed.y)/2 + 20} ${voltmeterRed.x} ${voltmeterRed.y}`}
          stroke="#ef4444"
          strokeWidth="2"
          fill="none"
        />
        <path
          d={`M ${voltmeterPos.x + 140} ${voltmeterPos.y + 70} Q ${(voltmeterPos.x + voltmeterBlack.x)/2} ${(voltmeterPos.y + voltmeterBlack.y)/2 + 20} ${voltmeterBlack.x} ${voltmeterBlack.y}`}
          stroke="#f8fafc"
          strokeWidth="2"
          fill="none"
        />
      </svg>

      {/* Render Components */}
      {components.map((c) => {
        const isSelected = selectedComponentId === c.id;
        const roles = (c.type === 'source' || c.type === 'capacitor') ? ['pos', 'neg'] : ['a', 'b'];

        return (
          <div
            key={c.id}
            style={{ left: `${c.x}px`, top: `${c.y}px`, transform: `translate(-50%, -50%) rotate(${c.angle}deg)` }}
            onPointerDown={(e) => handlePointerDownComponent(e, c)}
            className={`absolute z-10 cursor-grab active:cursor-grabbing transition-all ${
              isSelected ? 'ring-2 ring-cyan-400 ring-offset-4 ring-offset-slate-950 rounded-2xl' : ''
            }`}
          >
            <div className={`relative px-6 py-4 rounded-xl border flex items-center justify-center font-mono shadow-xl ${
              c.failed
                ? 'bg-rose-950/80 border-rose-500/60 text-rose-300'
                : 'bg-slate-900/90 border-slate-800 text-slate-200'
            }`}>
              {/* Element Label */}
              <div className="flex flex-col items-center">
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                  {c.type === 'source' ? `${c.voltage ?? 12}V` : c.type === 'resistor' ? `${c.resistance ?? 100}Ω` : c.type === 'capacitor' ? `${Math.round((c.capacitance ?? 0.01)*1e6)}μF` : c.type === 'switch' ? (c.isOpen ? 'SW (OFF)' : 'SW (ON)') : 'AMP'}
                </span>
                {c.failed && <span className="text-[9px] font-bold text-rose-400 animate-pulse">¡DAÑADO!</span>}
              </div>

              {/* Terminal Handles */}
              {roles.map((r) => {
                const isPos = r === 'pos' || r === 'a';
                return (
                  <div
                    key={r}
                    onPointerDown={(e) => handlePointerDownTerminal(e, c, r)}
                    style={{ left: isPos ? '-8px' : 'calc(100% - 8px)' }}
                    className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-cyan-500 border-2 border-slate-950 rounded-full hover:scale-125 transition-transform cursor-pointer shadow-md"
                    title={`Terminal ${r}`}
                  />
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Interactive Voltmeter Probes */}
      <div
        style={{ left: `${voltmeterRed.x}px`, top: `${voltmeterRed.y}px` }}
        onPointerDown={(e) => handlePointerDownProbe(e, 'red')}
        className="absolute z-30 -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-red-600 border-2 border-white rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-lg cursor-grab active:cursor-grabbing hover:scale-110 transition-transform"
      >
        +
      </div>
      <div
        style={{ left: `${voltmeterBlack.x}px`, top: `${voltmeterBlack.y}px` }}
        onPointerDown={(e) => handlePointerDownProbe(e, 'black')}
        className="absolute z-30 -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-slate-100 border-2 border-slate-900 rounded-full flex items-center justify-center text-[10px] font-bold text-slate-900 shadow-lg cursor-grab active:cursor-grabbing hover:scale-110 transition-transform"
      >
        -
      </div>

      {/* Floating Toolbar for Selected Object */}
      {(selectedComponentId || selectedWireId) && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 bg-slate-900/90 border border-slate-700/80 px-4 py-2 rounded-xl flex items-center gap-3 shadow-xl backdrop-blur-md">
          {selectedComponentId && (
            <>
              <button
                onClick={rotateSelectedComponent}
                className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-200 transition-colors flex items-center gap-1 text-xs"
              >
                <RotateCw className="w-3.5 h-3.5" /> Rotar (90°)
              </button>
              <button
                onClick={deleteSelectedComponent}
                className="p-2 bg-rose-950/40 border border-rose-800/40 hover:bg-rose-900/40 rounded-lg text-rose-300 transition-colors flex items-center gap-1 text-xs"
              >
                <Trash2 className="w-3.5 h-3.5" /> Eliminar
              </button>
            </>
          )}
          {selectedWireId && (
            <button
              onClick={deleteSelectedWire}
              className="p-2 bg-rose-950/40 border border-rose-800/40 hover:bg-rose-900/40 rounded-lg text-rose-300 transition-colors flex items-center gap-1 text-xs"
            >
              <Scissors className="w-3.5 h-3.5" /> Cortar Cable
            </button>
          )}
        </div>
      )}
    </div>
  );
}
