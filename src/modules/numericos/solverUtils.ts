import { RootFindingResult, LinearSystemResult, IntegrationResult, InterpolationPoint, InterpolationResult } from '../../types/numericos';

/**
 * Evaluador seguro de funciones matemáticas f(x)
 */
export function evaluateMathFunction(expr: string, x: number): number {
  try {
    let sanitized = expr
      .replace(/\^/g, '**')
      .replace(/sin/g, 'Math.sin')
      .replace(/cos/g, 'Math.cos')
      .replace(/tan/g, 'Math.tan')
      .replace(/exp/g, 'Math.exp')
      .replace(/sqrt/g, 'Math.sqrt')
      .replace(/ln/g, 'Math.log')
      .replace(/log/g, 'Math.log10')
      .replace(/pi/gi, 'Math.PI')
      .replace(/e/gi, 'Math.E');

    const fn = new Function('x', `return ${sanitized};`);
    const val = fn(x);
    return isNaN(val) ? 0 : val;
  } catch (err) {
    return 0;
  }
}

/**
 * 1. MN 01: Análisis de Errores y Propagación
 */
export interface ErrorAnalysisResult {
  trueValue: number;
  approxValue: number;
  absError: number;
  relError: number;
  pctError: number;
  significantDigits: number;
}

export function calculateErrorAnalysis(trueVal: number, approxVal: number): ErrorAnalysisResult {
  const absErr = Math.abs(trueVal - approxVal);
  const relErr = trueVal !== 0 ? absErr / Math.abs(trueVal) : absErr;
  const pctErr = relErr * 100;
  
  // Cifras significativas exactas según criterio de Scarborought: relErr < 0.5 * 10^(-n)
  let sigDigits = 0;
  if (relErr > 0) {
    sigDigits = Math.max(0, Math.floor(2 - Math.log10(2 * relErr)));
  } else {
    sigDigits = 8;
  }

  return {
    trueValue: trueVal,
    approxValue: approxVal,
    absError: absErr,
    relError: relErr,
    pctError: pctErr,
    significantDigits: sigDigits
  };
}

/**
 * 2. MN 02: Eliminación de Gauss-Jordan (Sistemas Directos)
 */
export function solveGaussJordan(A: number[][], b: number[]): LinearSystemResult {
  const n = A.length;
  const matrix = A.map((row, i) => [...row, b[i]]);
  const steps = [];

  steps.push({
    description: "Matriz aumentada inicial [A | b]",
    matrix: matrix.map(r => r.slice(0, n)),
    vector: matrix.map(r => r[n])
  });

  for (let i = 0; i < n; i++) {
    let maxRow = i;
    for (let k = i + 1; k < n; k++) {
      if (Math.abs(matrix[k][i]) > Math.abs(matrix[maxRow][i])) {
        maxRow = k;
      }
    }

    if (maxRow !== i) {
      const temp = matrix[i];
      matrix[i] = matrix[maxRow];
      matrix[maxRow] = temp;
      steps.push({
        description: `Intercambio de Fila ${i + 1} con Fila ${maxRow + 1}`,
        matrix: matrix.map(r => r.slice(0, n)),
        vector: matrix.map(r => r[n])
      });
    }

    const pivot = matrix[i][i];
    if (Math.abs(pivot) < 1e-12) {
      return { solution: [], steps, det: 0 };
    }

    for (let j = i; j <= n; j++) {
      matrix[i][j] /= pivot;
    }

    steps.push({
      description: `Normalización de Fila ${i + 1} dividiendo por el pivote ${pivot.toFixed(3)}`,
      matrix: matrix.map(r => r.slice(0, n)),
      vector: matrix.map(r => r[n])
    });

    for (let k = 0; k < n; k++) {
      if (k !== i) {
        const factor = matrix[k][i];
        for (let j = i; j <= n; j++) {
          matrix[k][j] -= factor * matrix[i][j];
        }
      }
    }

    steps.push({
      description: `Eliminación de la columna ${i + 1} en las demás filas`,
      matrix: matrix.map(r => r.slice(0, n)),
      vector: matrix.map(r => r[n])
    });
  }

  return { solution: matrix.map(r => r[n]), steps };
}

/**
 * 3. MN 03: Sistemas Iterativos (Jacobi & Gauss-Seidel)
 */
export interface IterativeSystemResult {
  solution: number[];
  iterations: { iter: number; x: number[]; error: number }[];
  isDiagonallyDominant: boolean;
  converged: boolean;
  message: string;
}

export function solveIterativeSystem(
  A: number[][],
  b: number[],
  method: 'jacobi' | 'seidel',
  tol: number = 1e-4,
  maxIter: number = 50,
  omega: number = 1.0 // Factor de Relajación (SOR)
): IterativeSystemResult {
  const n = A.length;
  let x = new Array(n).fill(0);
  const iterations: { iter: number; x: number[]; error: number }[] = [];

  // Chequeo de matriz diagonalmente dominante
  let isDiagonallyDominant = true;
  for (let i = 0; i < n; i++) {
    let sumOffDiag = 0;
    for (let j = 0; j < n; j++) {
      if (i !== j) sumOffDiag += Math.abs(A[i][j]);
    }
    if (Math.abs(A[i][i]) <= sumOffDiag) {
      isDiagonallyDominant = false;
    }
  }

  let converged = false;

  for (let iter = 1; iter <= maxIter; iter++) {
    const xOld = [...x];
    const xNew = [...x];

    for (let i = 0; i < n; i++) {
      let sum = 0;
      for (let j = 0; j < n; j++) {
        if (i !== j) {
          const valJ = method === 'seidel' ? xNew[j] : xOld[j];
          sum += A[i][j] * valJ;
        }
      }
      const xCalc = (b[i] - sum) / A[i][i];
      // Aplicar relajación SOR: x_i = (1 - w)*x_old + w*x_calc
      xNew[i] = (1 - omega) * xOld[i] + omega * xCalc;
    }

    let maxError = 0;
    for (let i = 0; i < n; i++) {
      const err = Math.abs(xNew[i] - xOld[i]);
      if (err > maxError) maxError = err;
    }

    x = xNew;
    iterations.push({ iter, x: [...x], error: maxError });

    if (maxError < tol) {
      converged = true;
      break;
    }
  }

  return {
    solution: x,
    iterations,
    isDiagonallyDominant,
    converged,
    message: converged
      ? `Convergencia alcanzada en ${iterations.length} iteraciones mediante ${method === 'jacobi' ? 'Jacobi' : 'Gauss-Seidel'}.`
      : `El método iterativo no alcanzó la tolerancia deseada en ${maxIter} iteraciones.`
  };
}

/**
 * 4. MN 04: Ajuste de Curvas (Regresión Lineal por Mínimos Cuadrados)
 */
export interface LinearRegressionResult {
  a0: number; // Intercepto
  a1: number; // Pendiente
  r2: number; // Coeficiente de determinación R^2
  equationString: string;
  points: InterpolationPoint[];
}

export function solveLinearRegression(points: InterpolationPoint[]): LinearRegressionResult {
  const n = points.length;
  if (n < 2) {
    return { a0: 0, a1: 0, r2: 0, equationString: "Puntos insuficientes", points };
  }

  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0;
  points.forEach(p => {
    sumX += p.x;
    sumY += p.y;
    sumXY += p.x * p.y;
    sumX2 += p.x * p.x;
    sumY2 += p.y * p.y;
  });

  const a1 = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const a0 = (sumY - a1 * sumX) / n;

  const yMean = sumY / n;
  let st = 0, sr = 0;
  points.forEach(p => {
    st += Math.pow(p.y - yMean, 2);
    sr += Math.pow(p.y - (a0 + a1 * p.x), 2);
  });

  const r2 = st !== 0 ? (st - sr) / st : 1.0;

  return {
    a0,
    a1,
    r2,
    equationString: `y = ${a0.toFixed(4)} ${a1 >= 0 ? '+' : '-'} ${Math.abs(a1).toFixed(4)}x`,
    points
  };
}

export function solveLagrange(points: InterpolationPoint[]): InterpolationResult {
  const n = points.length;
  if (n === 0) return { polynomialString: 'P(x) = 0', points };
  let polyTerms: string[] = [];

  for (let i = 0; i < n; i++) {
    const xi = points[i].x;
    const yi = points[i].y;
    let numTerms: string[] = [];
    let denVal = 1;

    for (let j = 0; j < n; j++) {
      if (i !== j) {
        const xj = points[j].x;
        numTerms.push(`(x - ${xj})`);
        denVal *= (xi - xj);
      }
    }

    const coeff = denVal !== 0 ? (yi / denVal).toFixed(3) : '0';
    polyTerms.push(`${coeff}${numTerms.length > 0 ? '*' + numTerms.join('') : ''}`);
  }

  return {
    polynomialString: polyTerms.join(' + '),
    points
  };
}

/**
 * 5. MN 05: Integración Numérica (Trapecio y Simpson)
 */
export function solveIntegration(
  expr: string,
  a: number,
  b: number,
  n: number,
  method: 'trapezoid' | 'simpson13'
): IntegrationResult {
  const h = (b - a) / n;
  const subintervals: { x: number; y: number }[] = [];

  for (let i = 0; i <= n; i++) {
    const x = a + i * h;
    const y = evaluateMathFunction(expr, x);
    subintervals.push({ x, y });
  }

  let integral = 0;

  if (method === 'trapezoid') {
    let sum = (subintervals[0].y + subintervals[n].y) / 2;
    for (let i = 1; i < n; i++) {
      sum += subintervals[i].y;
    }
    integral = sum * h;
  } else {
    const effectiveN = n % 2 === 0 ? n : n + 1;
    const effH = (b - a) / effectiveN;
    const points: { x: number; y: number }[] = [];

    for (let i = 0; i <= effectiveN; i++) {
      const x = a + i * effH;
      points.push({ x, y: evaluateMathFunction(expr, x) });
    }

    let sum = points[0].y + points[effectiveN].y;
    for (let i = 1; i < effectiveN; i++) {
      if (i % 2 === 1) {
        sum += 4 * points[i].y;
      } else {
        sum += 2 * points[i].y;
      }
    }
    integral = (sum * effH) / 3;
  }

  return { value: integral, nSubintervals: n, method, subintervals };
}

/**
 * 6. MN 06: Búsqueda de Raíces de Ecuaciones No Lineales
 */
export function solveBisection(expr: string, a: number, b: number, tol: number = 1e-4, maxIter: number = 50): RootFindingResult {
  const iterations = [];
  let fa = evaluateMathFunction(expr, a);
  let fb = evaluateMathFunction(expr, b);

  if (fa * fb > 0) {
    return {
      root: null,
      iterations: [],
      converged: false,
      message: `f(a) y f(b) deben tener signos opuestos. f(${a}) = ${fa.toFixed(3)}, f(${b}) = ${fb.toFixed(3)}.`
    };
  }

  let c = a, fc = fa, prevC = a, converged = false;

  for (let iter = 1; iter <= maxIter; iter++) {
    c = (a + b) / 2;
    fc = evaluateMathFunction(expr, c);
    const error = iter === 1 ? Math.abs(b - a) : Math.abs(c - prevC);

    iterations.push({ iter, a, b, c, fc, error });

    if (Math.abs(fc) < tol || error < tol) {
      converged = true;
      break;
    }

    if (fa * fc < 0) {
      b = c;
      fb = fc;
    } else {
      a = c;
      fa = fc;
    }
    prevC = c;
  }

  return { root: c, iterations, converged, message: converged ? `Convergencia en ${iterations.length} iteraciones. Raíz r ≈ ${c.toFixed(6)}` : `Límite alcanzado.` };
}

export function solveNewtonRaphson(expr: string, x0: number, tol: number = 1e-4, maxIter: number = 50): RootFindingResult {
  const iterations = [];
  let x = x0, converged = false;

  const getDerivative = (val: number) => {
    const h = 1e-6;
    return (evaluateMathFunction(expr, val + h) - evaluateMathFunction(expr, val - h)) / (2 * h);
  };

  for (let iter = 1; iter <= maxIter; iter++) {
    const fx = evaluateMathFunction(expr, x);
    const dfx = getDerivative(x);

    if (Math.abs(dfx) < 1e-12) {
      return { root: x, iterations, converged: false, message: `Derivada cercana a cero.` };
    }

    const nextX = x - fx / dfx;
    const error = Math.abs(nextX - x);

    iterations.push({ iter, a: x, b: nextX, c: nextX, fc: fx, error });
    x = nextX;

    if (Math.abs(fx) < tol || error < tol) {
      converged = true;
      break;
    }
  }

  return { root: x, iterations, converged, message: converged ? `Convergencia en ${iterations.length} iteraciones. Raíz r ≈ ${x.toFixed(6)}` : `Límite alcanzado.` };
}

/**
 * 7. MN 07: Optimización 1D (Búsqueda de la Sección Áurea)
 */
export interface OptimizationResult {
  optimumX: number;
  optimumY: number;
  iterations: { iter: number; xl: number; xu: number; x1: number; x2: number; f1: number; f2: number }[];
  converged: boolean;
  message: string;
}

export function solveGoldenSection(
  expr: string,
  xl: number,
  xu: number,
  mode: 'min' | 'max' = 'min',
  tol: number = 1e-4,
  maxIter: number = 40
): OptimizationResult {
  const R = (Math.sqrt(5) - 1) / 2; // Ratio áureo phi - 1 ≈ 0.61803
  let d = R * (xu - xl);
  let x1 = xl + d;
  let x2 = xu - d;
  let f1 = evaluateMathFunction(expr, x1);
  let f2 = evaluateMathFunction(expr, x2);

  const iterations = [];
  let converged = false;

  for (let iter = 1; iter <= maxIter; iter++) {
    iterations.push({ iter, xl, xu, x1, x2, f1, f2 });

    const isBetter = mode === 'min' ? f1 < f2 : f1 > f2;

    if (isBetter) {
      xl = x2;
      x2 = x1;
      f2 = f1;
      d = R * (xu - xl);
      x1 = xl + d;
      f1 = evaluateMathFunction(expr, x1);
    } else {
      xu = x1;
      x1 = x2;
      f1 = f2;
      d = R * (xu - xl);
      x2 = xu - d;
      f2 = evaluateMathFunction(expr, x2);
    }

    if (Math.abs(xu - xl) < tol) {
      converged = true;
      break;
    }
  }

  const optimumX = (xl + xu) / 2;
  const optimumY = evaluateMathFunction(expr, optimumX);

  return {
    optimumX,
    optimumY,
    iterations,
    converged,
    message: `Óptimo (${mode === 'min' ? 'Mínimo' : 'Máximo'}) encontrado en x* ≈ ${optimumX.toFixed(5)}, f(x*) = ${optimumY.toFixed(5)}`
  };
}
