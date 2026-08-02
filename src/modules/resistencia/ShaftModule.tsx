import React, { useState } from "react";
import { Material, ShaftConfig } from "../../types/resistencia";
import { calculateShaft } from "./physics";
import { Circle, Info } from "lucide-react";

interface ShaftModuleProps {
  materials: Material[];
}

export function ShaftModule({ materials }: ShaftModuleProps) {
  const [sMaterial, setSMaterial] = useState<Material>(materials[0]);
  const [config, setConfig] = useState<ShaftConfig>({
    type: "solid",
    length: 2.0,
    c_o: 0.04, // Outer radius (4 cm = 80mm diameter)
    c_i: 0.02, // Inner radius (2 cm = 40mm diameter)
    T1: 500,  // N-m at x = 0
    T2: 800,  // N-m at x = L/2
    T3: 0,    // N-m at x = L
    materialId: materials[0].id,
    filletRadius: 0.005, // 5 mm fillet
    stepLargeRadius: 0.06, // 60 mm large diameter
  });

  const stats = calculateShaft(config, sMaterial);

  const updateConfig = (key: keyof ShaftConfig, value: any) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
      {/* Configuration Controls (Left) */}
      <div className="xl:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-6">
        <div>
          <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Circle className="w-4 h-4 text-purple-400" />
            Configuración del Eje Cilíndrico
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Análisis de Torsión, Ángulo de Giro (φ) y Concentración de Esfuerzos (K).
          </p>
        </div>

        {/* Shaft Type (Solid vs Tubular) */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
            Geometría de la Sección
          </label>
          <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => updateConfig("type", "solid")}
              className={`text-xs py-2 px-3 rounded-lg font-semibold transition-all ${
                config.type === "solid"
                  ? "bg-purple-500 text-slate-950 shadow-md shadow-purple-900/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Sólido Macizo
            </button>
            <button
              onClick={() => updateConfig("type", "tubular")}
              className={`text-xs py-2 px-3 rounded-lg font-semibold transition-all ${
                config.type === "tubular"
                  ? "bg-purple-500 text-slate-950 shadow-md shadow-purple-900/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Hueco / Tubular
            </button>
          </div>
        </div>

        {/* Material Selection */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
            Material del Eje
          </label>
          <select
            value={sMaterial.id}
            onChange={(e) => {
              const selected = materials.find((m) => m.id === e.target.value);
              if (selected) setSMaterial(selected);
            }}
            className="w-full bg-slate-950 text-white border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-purple-500/50"
          >
            {materials.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} (G = {m.G / 1e9} GPa, τ_máx = {(m.yieldStrength * 0.5) / 1e6} MPa)
              </option>
            ))}
          </select>
        </div>

        {/* Radius Slider */}
        <div className="space-y-4 pt-2 border-t border-slate-800">
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-300 uppercase tracking-wider">
                Diámetro Exterior ($d = 2c_o$)
              </span>
              <span className="text-purple-400 font-bold font-mono">
                {(config.c_o * 2000).toFixed(0)} mm
              </span>
            </div>
            <input
              type="range"
              min="0.01"
              max="0.10"
              step="0.005"
              value={config.c_o}
              onChange={(e) => updateConfig("c_o", parseFloat(e.target.value))}
              className="w-full accent-purple-500 bg-slate-950 h-2 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {config.type === "tubular" && (
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-300 uppercase tracking-wider">
                  Diámetro Interior ($d_i = 2c_i$)
                </span>
                <span className="text-purple-400 font-bold font-mono">
                  {(config.c_i * 2000).toFixed(0)} mm
                </span>
              </div>
              <input
                type="range"
                min="0.005"
                max={config.c_o - 0.005}
                step="0.005"
                value={config.c_i}
                onChange={(e) => updateConfig("c_i", parseFloat(e.target.value))}
                className="w-full accent-purple-500 bg-slate-950 h-2 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          )}

          {/* Applied Torques */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-300 uppercase tracking-wider">
                Torque Aplicado $T_1$ en $x=0$
              </span>
              <span className="text-purple-400 font-bold font-mono">
                {config.T1} N·m
              </span>
            </div>
            <input
              type="range"
              min="-2000"
              max="2000"
              step="50"
              value={config.T1}
              onChange={(e) => updateConfig("T1", parseFloat(e.target.value))}
              className="w-full accent-purple-500 bg-slate-950 h-2 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-300 uppercase tracking-wider">
                Torque Aplicado $T_2$ en $x=L/2$
              </span>
              <span className="text-purple-400 font-bold font-mono">
                {config.T2} N·m
              </span>
            </div>
            <input
              type="range"
              min="-2000"
              max="2000"
              step="50"
              value={config.T2}
              onChange={(e) => updateConfig("T2", parseFloat(e.target.value))}
              className="w-full accent-purple-500 bg-slate-950 h-2 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Results (Right) */}
      <div className="xl:col-span-8 space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-1">
            <span className="text-[10px] text-slate-500 font-mono uppercase">Inercia Polar (J)</span>
            <div className="text-base font-bold font-mono text-purple-400">
              {(stats.J * 1e8).toFixed(2)} <span className="text-xs font-normal">cm⁴</span>
            </div>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-1">
            <span className="text-[10px] text-slate-500 font-mono uppercase">Esfuerzo Cortante Máx (τ)</span>
            <div className="text-base font-bold font-mono text-emerald-400">
              {stats.maxTau.toFixed(2)} <span className="text-xs font-normal">MPa</span>
            </div>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-1">
            <span className="text-[10px] text-slate-500 font-mono uppercase">Factor Concentrador (K)</span>
            <div className="text-base font-bold font-mono text-amber-400">
              K = {stats.K.toFixed(2)}
            </div>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-1">
            <span className="text-[10px] text-slate-500 font-mono uppercase">Giro Total (φ)</span>
            <div className="text-base font-bold font-mono text-cyan-400">
              {((stats.totalPhi * 180) / Math.PI).toFixed(2)}°
            </div>
          </div>
        </div>

        {/* Diagrama de Torsión Interna T(x) */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-purple-400">Torque Interno T(x) [N·m]</h4>
          <div className="h-32 bg-slate-950 rounded-xl p-4 border border-slate-850 flex items-center justify-between font-mono text-xs text-slate-300">
            <div className="space-y-1">
              <span className="text-slate-500 block text-[10px]">Tramo 1 (0 a L/2):</span>
              <span className="text-purple-300 font-bold">{config.T1} N·m</span>
            </div>
            <div className="h-8 w-[1px] bg-slate-800" />
            <div className="space-y-1">
              <span className="text-slate-500 block text-[10px]">Tramo 2 (L/2 a L):</span>
              <span className="text-purple-300 font-bold">{config.T1 + config.T2} N·m</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
