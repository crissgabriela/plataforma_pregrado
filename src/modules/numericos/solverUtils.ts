import { RootFindingResult, LinearSystemResult, IntegrationResult, InterpolationPoint, InterpolationResult } from '../../types/numericos';

/**
 * Evaluador seguro de funciones matemáticas f(x)
 */
export function evaluateMathFunction(expr: string, x: number): number {
  try {
    // Normalizar expresiones algebraicas comunes a sintaxis JavaScript
    let sanitized = expr
      .replace(/\^/g, '**')
      .replace(/sin/g, 'Math.sin')
      .replace(/cos/g, 'Math.cos')
      .replace(/tan/g, 'Math.tan')
      .replace(/exp/g, 'Math.exp')
      .replace(/sqrt/g, 'Math.sqrt')
      .replace(/ln/g, 'Math.log')
      .replace(/log/g, 'Math.log10')
      .replace(/e\*\*/g, 'Math.exp(')
      .replace(/pi/gi, 'Math.PI')
      .replace(/e/gi, 'Math.E');

    // Función evaluadora dinámica
    const fn = new Function('x', `return ${sanitized};`);
    const val = fn(x);
    return isNaN(val) ? 0 : val;
  } catch (err) {
    return 0;
  }
}

/**
 * Método de Bisección para f(x) = 0 en [a, b]
 */
export function solveBisection(
  expr: string,
  a: number,
  b: number,
  tol: number = 1e-5,
  maxIter: number = 50
): RootFindingResult {
  const iterations = [];
  let fa = evaluateMathFunction(expr, a);
  let fb = evaluateMathFunction(expr, b);

  if (fa * fb > 0) {
    return {
      root: null,
      iterations: [],
      converged: false,
      message: `f(a) y f(b) deben tener signos opuestos. f(${a}) = ${fa.toFixed(4)}, f(${b}) = ${fb.toFixed(4)}.`
    };
  }

  let c = a;
  let fc = fa;
  let prevC = a;
  let converged = false;

  for (let iter = 1; iter <= maxIter; iter++) {
    c = (a + b) / 2;
    fc = evaluateMathFunction(expr, c);
    const error = iter === 1 ? Math.abs(b - a) : Math.abs(c - prevC);

    iterations.push({
      iter,
      a,
      b,
      c,
      fc,
      error
    });

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

  return {
    root: c,
    iterations,
    converged,
    message: converged
      ? `Convergencia alcanzada en la iteración ${iterations.length}. Raíz r ≈ ${c.toFixed(6)}`
      : `Se alcanzó el número máximo de iteraciones (${maxIter}) sin convergencia completa.`
  };
}

/**
 * Método de Newton-Raphson con derivada numérica
 */
export function solveNewtonRaphson(
  expr: string,
  x0: number,
  tol: number = 1e-5,
  maxIter: number = 50
): RootFindingResult {
  const iterations = [];
  let x = x0;
  let converged = false;

  const getDerivative = (val: number) => {
    const h = 1e-6;
    return (evaluateMathFunction(expr, val + h) - evaluateMathFunction(expr, val - h)) / (2 * h);
  };

  for (let iter = 1; iter <= maxIter; iter++) {
    const fx = evaluateMathFunction(expr, x);
    const dfx = getDerivative(x);

    if (Math.abs(dfx) < 1e-12) {
      return {
        root: x,
        iterations,
        converged: false,
        message: `La derivada f'(${x.toFixed(4)}) es cercana a cero. El método se detuvo para evitar división por cero.`
      };
    }

    const nextX = x - fx / dfx;
    const error = Math.abs(nextX - x);

    iterations.push({
      iter,
      a: x,
      b: nextX,
      c: nextX,
      fc: fx,
      error
    });

    x = nextX;

    if (Math.abs(fx) < tol || error < tol) {
      converged = true;
      break;
    }
  }

  return {
    root: x,
    iterations,
    converged,
    message: converged
      ? `Convergencia alcanzada en la iteración ${iterations.length}. Raíz r ≈ ${x.toFixed(6)}`
      : `Se alcanzó el límite de iteraciones sin convergencia completa.`
  };
}

/**
 * Solucionador de Sistemas de Ecuaciones Ax = b (Eliminación Gauss-Jordan)
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
    // Pivoteo parcial
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
        description: `Intercambio de Fila ${i + 1} con Fila ${maxRow + 1} para pivoteo máximo`,
        matrix: matrix.map(r => r.slice(0, n)),
        vector: matrix.map(r => r[n])
      });
    }

    const pivot = matrix[i][i];
    if (Math.abs(pivot) < 1e-12) {
      return {
        solution: [],
        steps,
        det: 0
      };
    }

    // Normalizar fila pivot
    for (let j = i; j <= n; j++) {
      matrix[i][j] /= pivot;
    }

    steps.push({
      description: `Normalización de Fila ${i + 1} dividiendo por el pivote ${pivot.toFixed(3)}`,
      matrix: matrix.map(r => r.slice(0, n)),
      vector: matrix.map(r => r[n])
    });

    // Eliminar otras filas
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

  const solution = matrix.map(r => r[n]);
  return {
    solution,
    steps
  };
}

/**
 * Integración Numérica (Trapecio y Simpson 1/3)
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
    // Simpson 1/3 (requiere n par)
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

  return {
    value: integral,
    nSubintervals: n,
    method,
    subintervals
  };
}

/**
 * Interpolación Polinomial de Lagrange
 */
export function solveLagrange(points: InterpolationPoint[]): InterpolationResult {
  const n = points.length;
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

    const coeff = (yi / denVal).toFixed(4);
    polyTerms.push(`${coeff} * ${numTerms.join('')}`);
  }

  return {
    polynomialString: polyTerms.join(' + '),
    points
  };
}
