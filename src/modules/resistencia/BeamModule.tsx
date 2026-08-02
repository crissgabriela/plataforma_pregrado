import React, { useState } from "react";
import { Info, HelpCircle } from "lucide-react";
import { BeamConfig, Material } from "../../types/resistencia";
import { calculateBeam } from "./physics";

interface BeamModuleProps {
  materials: Material[];
}

export function BeamModule({ materials }: BeamModuleProps) {
  const [bMaterial, setBMaterial] = useState<Material>(materials[0]);
  const [config, setConfig] = useState<BeamConfig>({
    type: "simply_supported",
    length: 5.0,
    sectionType: "rectangular",
    b: 0.15,
    h: 0.30,
    flangeW: 0.20,
    flangeT: 0.02,
    webH: 0.25,
    webT: 0.015,
    pointForce: 5.0,
    pointForcePos: 2.5,
    distForce: 1.5,
  });

  const [inspectorX, setInspectorX] = useState<number>(2.5);
  const stats = calculateBeam(config, bMaterial);
  const activeX = Math.min(inspectorX, config.length);

  const findValueAtX = (xVal: number) => {
    const closest = stats.points.reduce((prev, curr) => {
      return Math.abs(curr.x - xVal) < Math.abs(prev.x - xVal) ? curr : prev;
    });
    return closest;
  };

  const currentPoint = findValueAtX(activeX);

  const updateConfig = (key: keyof BeamConfig, value: any) => {
    setConfig((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "length" && prev.pointForcePos > value) {
        next.pointForcePos = parseFloat((value / 2).toFixed(1));
      }
      return next;
    });
  };

  const generateDiagramPaths = (
    key: "V" | "M" | "deflection",
    height: number
  ) => {
    const width = 500;
    const padding = 10;
    const drawWidth = width - 2 * padding;
    const drawHeight = height - 2 * padding;
    const midY = height / 2;

    const points = stats.points;
    if (points.length === 0) return { path: "", fillPath: "", zeroPath: "", inspDrawX: 0, inspDrawY: 0 };

    const values = points.map((p) => p[key]);
    const maxVal = Math.max(...values.map(Math.abs));
    const scaleY = maxVal === 0 ? 0 : drawHeight / (2 * maxVal);

    let path = "";
    let fillPath = "";
    
    points.forEach((p, index) => {
      const xPct = p.x / config.length;
      const xDraw = padding + xPct * drawWidth;
      
      let yDraw = midY;
      if (key === "deflection") {
        const maxDef = stats.maxDeflection;
        const scaleDef = maxDef === 0 ? 0 : (height - 30) / maxDef;
        yDraw = padding + 10 + p[key] * scaleDef;
      } else {
        yDraw = midY - p[key] * scaleY * 0.9;
      }

      if (index === 0) {
        path += `M ${xDraw} ${yDraw}`;
        fillPath += `M ${xDraw} ${midY} L ${xDraw} ${yDraw}`;
      } else {
        path += ` L ${xDraw} ${yDraw}`;
        fillPath += ` L ${xDraw} ${yDraw}`;
      }
      
      if (index === points.length - 1) {
        fillPath += ` L ${xDraw} ${midY} Z`;
      }
    });

    const zeroPath = `M ${padding} ${midY} L ${width - padding} ${midY}`;
    const inspPct = activeX / config.length;
    const inspDrawX = padding + inspPct * drawWidth;
    let inspDrawY = midY;
    if (key === "deflection") {
      const maxDef = stats.maxDeflection;
      const scaleDef = maxDef === 0 ? 0 : (height - 30) / maxDef;
      inspDrawY = padding + 10 + currentPoint.deflection * scaleDef;
    } else {
      inspDrawY = midY - currentPoint[key] * scaleY * 0.9;
    }

    return { path, fillPath, zeroPath, inspDrawX, inspDrawY };
  };

  const vDiagram = generateDiagramPaths("V", 110);
  const mDiagram = generateDiagramPaths("M", 110);
  const dDiagram = generateDiagramPaths("deflection", 100);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
      {/* Controles a la izquierda */}
      <div className="xl:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-6">
        <div>
          <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.6)]"></span>
            Configuración de la Viga
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Parámetros geométricos y mecánicos para cálculo de la ecuación diferencial de deflexión.
          </p>
        </div>

        {/* Tipo de Apoyo */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
            Tipo de Apoyo
          </label>
          <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => updateConfig("type", "simply_supported")}
              className={`text-xs py-2 px-3 rounded-lg font-semibold transition-all ${
                config.type === "simply_supported"
                  ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-900/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Simplemente Apoyada
            </button>
            <button
              onClick={() => updateConfig("type", "cantilever")}
              className={`text-xs py-2 px-3 rounded-lg font-semibold transition-all ${
                config.type === "cantilever"
                  ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-900/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Cantilever (Voladizo)
            </button>
          </div>
        </div>

        {/* Selección de Material */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
            Material de la Viga
          </label>
          <select
            value={bMaterial.id}
            onChange={(e) => {
              const selected = materials.find((m) => m.id === e.target.value);
              if (selected) setBMaterial(selected);
            }}
            className="w-full bg-slate-950 text-white border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-cyan-500/50"
          >
            {materials.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} (E = {m.E / 1e9} GPa, σ_y = {m.yieldStrength / 1e6} MPa)
              </option>
            ))}
          </select>
        </div>

        {/* Longitud L */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-slate-300 uppercase tracking-wider">
              Longitud de Viga (L)
            </span>
            <span className="text-cyan-400 font-bold font-mono bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
              {config.length.toFixed(1)} m
            </span>
          </div>
          <input
            type="range"
            min="1.0"
            max="10.0"
            step="0.5"
            value={config.length}
            onChange={(e) => updateConfig("length", parseFloat(e.target.value))}
            className="w-full accent-cyan-500 bg-slate-950 h-2 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Cargas */}
        <div className="space-y-4 pt-4 border-t border-slate-800">
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-300 uppercase tracking-wider">
                Carga Puntual (P)
              </span>
              <span className="text-cyan-400 font-bold font-mono">
                {config.pointForce.toFixed(1)} kN
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="20"
              step="0.5"
              value={config.pointForce}
              onChange={(e) => updateConfig("pointForce", parseFloat(e.target.value))}
              className="w-full accent-cyan-500 bg-slate-950 h-2 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-300 uppercase tracking-wider">
                Posición de Carga Puntual (a)
              </span>
              <span className="text-cyan-400 font-bold font-mono">
                {config.pointForcePos.toFixed(1)} m
              </span>
            </div>
            <input
              type="range"
              min="0.1"
              max={config.length}
              step="0.1"
              value={config.pointForcePos}
              onChange={(e) => updateConfig("pointForcePos", parseFloat(e.target.value))}
              className="w-full accent-cyan-500 bg-slate-950 h-2 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-300 uppercase tracking-wider">
                Carga Distribuida (w)
              </span>
              <span className="text-cyan-400 font-bold font-mono">
                {config.distForce.toFixed(1)} kN/m
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="10"
              step="0.2"
              value={config.distForce}
              onChange={(e) => updateConfig("distForce", parseFloat(e.target.value))}
              className="w-full accent-cyan-500 bg-slate-950 h-2 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Resultados y Diagramas (Right) */}
      <div className="xl:col-span-8 space-y-6">
        {/* Panel Resumen de Reacciones e Inercia */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-1">
            <span className="text-[10px] text-slate-500 font-mono uppercase">Momento Inercia (I)</span>
            <div className="text-base font-bold font-mono text-cyan-400">
              {(stats.I * 1e6).toFixed(2)} <span className="text-xs font-normal">cm⁴</span>
            </div>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-1">
            <span className="text-[10px] text-slate-500 font-mono uppercase">Cortante Máx |V|</span>
            <div className="text-base font-bold font-mono text-sky-400">
              {stats.maxV.toFixed(2)} <span className="text-xs font-normal">kN</span>
            </div>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-1">
            <span className="text-[10px] text-slate-500 font-mono uppercase">Momento Máx |M|</span>
            <div className="text-base font-bold font-mono text-emerald-400">
              {stats.maxM.toFixed(2)} <span className="text-xs font-normal">kN·m</span>
            </div>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-1">
            <span className="text-[10px] text-slate-500 font-mono uppercase">Deflexión Máx (δ)</span>
            <div className="text-base font-bold font-mono text-rose-400">
              {stats.maxDeflection.toFixed(2)} <span className="text-xs font-normal">mm</span>
            </div>
          </div>
        </div>

        {/* Inspector de Posición x */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-slate-300 uppercase tracking-wider">
              Inspector de Sección Transversal a x = {activeX.toFixed(2)} m
            </span>
            <div className="flex gap-4 font-mono text-xs">
              <span className="text-sky-400 font-bold">V = {currentPoint.V.toFixed(2)} kN</span>
              <span className="text-emerald-400 font-bold">M = {currentPoint.M.toFixed(2)} kN·m</span>
              <span className="text-rose-400 font-bold">δ = {currentPoint.deflection.toFixed(2)} mm</span>
            </div>
          </div>
          <input
            type="range"
            min="0"
            max={config.length}
            step="0.05"
            value={activeX}
            onChange={(e) => setInspectorX(parseFloat(e.target.value))}
            className="w-full accent-cyan-400 bg-slate-950 h-2 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Diagrama de Esfuerzo Cortante (V) */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-sky-400">Diagrama de Esfuerzo Cortante V(x) [kN]</h4>
          <div className="h-28 bg-slate-950 rounded-xl p-2 relative overflow-hidden border border-slate-850">
            <svg className="w-full h-full" viewBox="0 0 500 110" preserveAspectRatio="none">
              <path d={vDiagram.fillPath} fill="rgba(56,189,248,0.15)" stroke="none" />
              <path d={vDiagram.zeroPath} stroke="#334155" strokeWidth="1" strokeDasharray="3 3" />
              <path d={vDiagram.path} fill="none" stroke="#38bdf8" strokeWidth="2" />
              <line x1={vDiagram.inspDrawX} y1="0" x2={vDiagram.inspDrawX} y2="110" stroke="#f43f5e" strokeWidth="1.5" strokeDasharray="2 2" />
            </svg>
          </div>
        </div>

        {/* Diagrama de Momento Flector (M) */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400">Diagrama de Momento Flector M(x) [kN·m]</h4>
          <div className="h-28 bg-slate-950 rounded-xl p-2 relative overflow-hidden border border-slate-850">
            <svg className="w-full h-full" viewBox="0 0 500 110" preserveAspectRatio="none">
              <path d={mDiagram.fillPath} fill="rgba(16,185,129,0.15)" stroke="none" />
              <path d={mDiagram.zeroPath} stroke="#334155" strokeWidth="1" strokeDasharray="3 3" />
              <path d={mDiagram.path} fill="none" stroke="#10b981" strokeWidth="2" />
              <line x1={mDiagram.inspDrawX} y1="0" x2={mDiagram.inspDrawX} y2="110" stroke="#f43f5e" strokeWidth="1.5" strokeDasharray="2 2" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
