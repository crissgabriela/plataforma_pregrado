import { Material } from "../../types/resistencia";

export const MATERIALS: Material[] = [
  {
    id: "acero_a36",
    name: "Acero de Estructura A-36",
    E: 200e9, // 200 GPa
    G: 75e9,  // 75 GPa
    yieldStrength: 250e6, // 250 MPa
    color: "bg-slate-500",
  },
  {
    id: "aluminio_6061",
    name: "Aluminio 6061-T6",
    E: 70e9,  // 70 GPa
    G: 26e9,  // 26 GPa
    yieldStrength: 276e6, // 276 MPa
    color: "bg-sky-400",
  },
  {
    id: "bronce_silicio",
    name: "Bronce de Silicio",
    E: 105e9, // 105 GPa
    G: 38e9,  // 38 GPa
    yieldStrength: 200e6, // 200 MPa
    color: "bg-amber-600",
  },
  {
    id: "hierro_gris",
    name: "Hierro Fundido Gris",
    E: 100e9, // 100 GPa
    G: 40e9,  // 40 GPa
    yieldStrength: 152e6, // 152 MPa
    color: "bg-zinc-600",
  },
  {
    id: "madera_pino",
    name: "Madera de Pino Estructural",
    E: 11e9,   // 11 GPa
    G: 4.4e9,  // 4.4 GPa
    yieldStrength: 30e6,   // 30 MPa
    color: "bg-yellow-700",
  }
];

export function findRectangularI(b: number, h: number): number {
  return (b * Math.pow(h, 3)) / 12.0;
}

export function findIBeamI(flangeW: number, flangeT: number, webH: number, webT: number): number {
  const totalH = webH + 2 * flangeT;
  const I_outer = (flangeW * Math.pow(totalH, 3)) / 12.0;
  const innerW = flangeW - webT;
  const I_inner = (innerW * Math.pow(webH, 3)) / 12.0;
  return I_outer - I_inner;
}

export function findShaftJ(type: "solid" | "tubular", c_o: number, c_i: number): number {
  if (type === "solid") {
    return (Math.PI / 2.0) * Math.pow(c_o, 4);
  } else {
    return (Math.PI / 2.0) * (Math.pow(c_o, 4) - Math.pow(c_i, 4));
  }
}

export function calculateK_Torsion(r: number, d: number, D: number): number {
  if (r <= 0) return 1.0;
  const rdRatio = r / d;
  const DdRatio = D / d;
  
  const baseK = 1.0;
  const scale = DdRatio > 2.0 ? 0.35 : DdRatio > 1.2 ? 0.25 : 0.15;
  const exponent = 0.45;
  
  const calculatedK = baseK + (scale / Math.pow(rdRatio, exponent));
  return Math.min(2.0, Math.max(1.0, calculatedK));
}
