import { BeamConfig, ShaftConfig, CalculationPoint, Material } from "../../types/resistencia";
import { findRectangularI, findIBeamI, findShaftJ, calculateK_Torsion } from "./materials";

export function calculateBeam(
  config: BeamConfig,
  material: Material
): {
  reactions: { R1: number; R2: number; M_wall: number };
  points: CalculationPoint[];
  I: number;
  maxM: number;
  maxV: number;
  maxDeflection: number;
  maxSigma: number;
} {
  const { type, length, sectionType, b, h, flangeW, flangeT, webH, webT, pointForce, pointForcePos, distForce } = config;
  
  let I = 0;
  if (sectionType === "rectangular") {
    I = findRectangularI(b, h);
  } else {
    I = findIBeamI(flangeW, flangeT, webH, webT);
  }
  
  const E = material.E;
  const P = pointForce * 1000;
  const a = pointForcePos;
  const bDist = length - a;
  const w = distForce * 1000;
  
  let R1 = 0;
  let R2 = 0;
  let M_wall = 0;
  
  if (type === "simply_supported") {
    const R1_P = (P * bDist) / length;
    const R2_P = (P * a) / length;
    const R1_w = (w * length) / 2.0;
    const R2_w = (w * length) / 2.0;
    
    R1 = R1_P + R1_w;
    R2 = R2_P + R2_w;
  } else {
    R1 = P + w * length;
    R2 = 0;
    M_wall = - (P * a + (w * Math.pow(length, 2)) / 2.0);
  }
  
  const points: CalculationPoint[] = [];
  const numSteps = 100;
  let maxM = 0;
  let maxV = 0;
  let maxDeflection = 0;
  
  for (let i = 0; i <= numSteps; i++) {
    const x = (i / numSteps) * length;
    
    let V_val = 0;
    let M_val = 0;
    let delta = 0;
    
    if (type === "simply_supported") {
      let V_P = 0;
      let M_P = 0;
      let delta_P = 0;
      
      const R1_P = (P * bDist) / length;
      const R2_P = (P * a) / length;
      
      if (x < a) {
        V_P = R1_P;
        M_P = R1_P * x;
        delta_P = (P * bDist * x * (Math.pow(length, 2) - Math.pow(bDist, 2) - Math.pow(x, 2))) / (6.0 * E * I * length);
      } else {
        V_P = R1_P - P;
        M_P = R2_P * (length - x);
        const termX = length - x;
        delta_P = (P * a * termX * (Math.pow(length, 2) - Math.pow(a, 2) - Math.pow(termX, 2))) / (6.0 * E * I * length);
      }
      
      const V_w = w * (length / 2.0 - x);
      const M_w = (w * x * (length - x)) / 2.0;
      const delta_w = (w * x * (Math.pow(length, 3) - 2.0 * length * Math.pow(x, 2) + Math.pow(x, 3))) / (24.0 * E * I);
      
      V_val = V_P + V_w;
      M_val = M_P + M_w;
      delta = delta_P + delta_w;
      
    } else {
      let V_P = 0;
      let M_P = 0;
      let delta_P = 0;
      
      if (x < a) {
        V_P = P;
        M_P = -P * (a - x);
        delta_P = (P * Math.pow(x, 2) * (3.0 * a - x)) / (6.0 * E * I);
      } else {
        V_P = 0;
        M_P = 0;
        delta_P = (P * Math.pow(a, 2) * (3.0 * x - a)) / (6.0 * E * I);
      }
      
      const V_w = w * (length - x);
      const M_w = - (w * Math.pow(length - x, 2)) / 2.0;
      const delta_w = (w * Math.pow(x, 2) * (6.0 * Math.pow(length, 2) - 4.0 * length * x + Math.pow(x, 2))) / (24.0 * E * I);
      
      V_val = V_P + V_w;
      M_val = M_P + M_w;
      delta = delta_P + delta_w;
    }
    
    if (Math.abs(V_val) > Math.abs(maxV)) maxV = V_val;
    if (Math.abs(M_val) > Math.abs(maxM)) maxM = M_val;
    if (delta > maxDeflection) maxDeflection = delta;
    
    points.push({
      x,
      V: V_val / 1000.0,
      M: M_val / 1000.0,
      deflection: delta * 1000.0,
    });
  }
  
  let c = 0;
  if (sectionType === "rectangular") {
    c = h / 2.0;
  } else {
    c = (webH + 2 * flangeT) / 2.0;
  }
  
  const maxSigma = ((Math.abs(maxM) * c) / I) / 1e6;
  
  return {
    reactions: {
      R1: R1 / 1000.0,
      R2: R2 / 1000.0,
      M_wall: M_wall / 1000.0,
    },
    points,
    I,
    maxM: maxM / 1000.0,
    maxV: maxV / 1000.0,
    maxDeflection: maxDeflection * 1000.0,
    maxSigma,
  };
}

export function calculateShaft(
  config: ShaftConfig,
  material: Material
): {
  J: number;
  internalTorques: { x: number; T: number }[];
  twistAngles: { x: number; phiRad: number; phiDeg: number }[];
  maxTau: number;
  totalPhi: number;
  K: number;
  rawMaxTauWithoutK: number;
} {
  const { type, length, c_o, c_i, T1, T2, T3, filletRadius, stepLargeRadius } = config;
  
  const G = material.G;
  const J = findShaftJ(type, c_o, c_i);
  
  const T_seg1 = T1;
  const T_seg2 = T1 + T2;
  
  const J_G = J * G;
  
  const phi_half = (T_seg2 * (length / 2.0)) / J_G;
  const phi_zero = phi_half + (T_seg1 * (length / 2.0)) / J_G;
  
  const steps = 100;
  const twistAngles: { x: number; phiRad: number; phiDeg: number }[] = [];
  const internalTorques: { x: number; T: number }[] = [];
  
  for (let i = 0; i <= steps; i++) {
    const x = (i / steps) * length;
    let T_int = 0;
    let phi = 0;
    
    if (x < length / 2.0) {
      T_int = T_seg1;
      phi = phi_half + (T_seg1 * (length / 2.0 - x)) / J_G;
    } else {
      T_int = T_seg2;
      phi = (T_seg2 * (length - x)) / J_G;
    }
    
    twistAngles.push({
      x,
      phiRad: phi,
      phiDeg: (phi * 180.0) / Math.PI,
    });
    
    internalTorques.push({
      x,
      T: T_int,
    });
  }
  
  const maxInternalTorque = Math.max(Math.abs(T_seg1), Math.abs(T_seg2));
  const rawMaxTauWithoutK = (maxInternalTorque * c_o) / J;
  const rawMaxTauWithoutK_MPa = rawMaxTauWithoutK / 1e6;
  
  const d = 2 * c_o;
  const D = stepLargeRadius;
  const K = calculateK_Torsion(filletRadius, d, D);
  const maxTau = rawMaxTauWithoutK_MPa * K;
  
  return {
    J,
    internalTorques,
    twistAngles,
    maxTau,
    totalPhi: phi_zero,
    K,
    rawMaxTauWithoutK: rawMaxTauWithoutK_MPa,
  };
}
