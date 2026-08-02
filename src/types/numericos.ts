export type NumericalToolType = 'root-finding' | 'linear-systems' | 'integration' | 'interpolation';

export interface RootFindingResult {
  root: number | null;
  iterations: {
    iter: number;
    a: number;
    b: number;
    c: number;
    fc: number;
    error: number;
  }[];
  converged: boolean;
  message: string;
}

export interface LinearSystemResult {
  solution: number[];
  steps: {
    description: string;
    matrix: number[][];
    vector: number[];
  }[];
  det?: number;
}

export interface IntegrationResult {
  value: number;
  nSubintervals: number;
  method: 'trapezoid' | 'simpson13' | 'simpson38';
  subintervals: { x: number; y: number }[];
  exactValue?: number;
  errorPct?: number;
}

export interface InterpolationPoint {
  x: number;
  y: number;
}

export interface InterpolationResult {
  polynomialString: string;
  evaluatedValue?: number;
  points: InterpolationPoint[];
}
