export interface Material {
  id: string;
  name: string;
  E: number; // Young's Modulus (Pa)
  G: number; // Shear Modulus (Pa)
  yieldStrength: number; // Pa
  color: string;
}

export type BeamType = "simply_supported" | "cantilever";
export type SectionType = "rectangular" | "i_beam";

export interface BeamConfig {
  type: BeamType;
  length: number; // m
  sectionType: SectionType;
  b: number; // Ancho (m)
  h: number; // Alto (m)
  flangeW: number;
  flangeT: number;
  webH: number;
  webT: number;
  
  pointForce: number; // kN
  pointForcePos: number; // m
  distForce: number; // kN/m
}

export type ShaftType = "solid" | "tubular";

export interface ShaftConfig {
  type: ShaftType;
  length: number; // m
  c_o: number; // radio exterior (m)
  c_i: number; // radio interior (m)
  
  T1: number; // N-m
  T2: number; // N-m
  T3: number; // N-m
  
  materialId: string;
  filletRadius: number;
  stepLargeRadius: number;
}

export interface CalculationPoint {
  x: number;
  V: number; // Cortante (kN)
  M: number; // Momento flector (kN-m)
  deflection: number; // Deflexión (mm)
}

export interface ShearStressPoint {
  rho: number;
  tau: number; // MPa
}
