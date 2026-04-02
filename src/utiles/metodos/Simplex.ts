import { ProblemInput, MethodResult, IterationStep  } from "@/data/interfaces";
import { SolveStatus } from "@/data/types";
import { EPS } from "@/data/constants";
import { cloneTableau, pivotTableau } from "@/utiles/tablas";
import { parseNumericValue } from "../numeros";
import { createErrorResult, mapStatusToLabel } from "../resultados";
import { extractSolution } from "../tablas"


function simplexCore(params: {
  tableau: number[][];
  basis: number[];
  headers: string[];
  mode: "primal" | "dual";
  maxIterations?: number;
}): {
  status: SolveStatus;
  message: string;
  tableau: number[][];
  basis: number[];
  iterations: IterationStep[];
} {
  const { mode } = params;
  const maxIterations = params.maxIterations ?? 120;
  const tableau = cloneTableau(params.tableau);
  const basis = [...params.basis];
  const iterations: IterationStep[] = [];

  for (let iteration = 1; iteration <= maxIterations; iteration += 1) {
    let pivotCol = -1;
    let pivotRow = -1;
    if (mode === "primal") {
      let mostNegative = -EPS;
      for (let j = 0; j < tableau[0].length - 1; j += 1) {
        if (tableau[0][j] < mostNegative) {
          mostNegative = tableau[0][j];
          pivotCol = j;
        }
      }

      if (pivotCol === -1) {
        return {
          status: "optima",
          message: "Se alcanzó una solución óptima.",
          tableau,
          basis,
          iterations,
        };
      }

      let bestRatio = Number.POSITIVE_INFINITY;
      for (let i = 1; i < tableau.length; i += 1) {
        const coeff = tableau[i][pivotCol];
        if (coeff > EPS) {
          const ratio = tableau[i][tableau[0].length - 1] / coeff;
          if (ratio < bestRatio - EPS) {
            bestRatio = ratio;
            pivotRow = i;
          }
        }
      }

      if (pivotRow === -1) {
        return {
          status: "no_acotada",
          message: "La función objetivo es no acotada para este modelo.",
          tableau,
          basis,
          iterations,
        };
      }
    } else {
      let mostNegativeRhs = -EPS;
      for (let i = 1; i < tableau.length; i += 1) {
        if (tableau[i][tableau[0].length - 1] < mostNegativeRhs) {
          mostNegativeRhs = tableau[i][tableau[0].length - 1];
          pivotRow = i;
        }
      }

      if (pivotRow === -1) {
        return {
          status: "optima",
          message: "Se alcanzó una solución óptima por dual simplex.",
          tableau,
          basis,
          iterations,
        };
      }

      let bestRatio = Number.POSITIVE_INFINITY;
      for (let j = 0; j < tableau[0].length - 1; j += 1) {
        const coeff = tableau[pivotRow][j];
        if (coeff < -EPS) {
          const ratio = tableau[0][j] / coeff;
          if (ratio >= -EPS && ratio < bestRatio - EPS) {
            bestRatio = ratio;
            pivotCol = j;
          }
        }
      }

      if (pivotCol === -1) {
        return {
          status: "infactible",
          message: "No se encontró pivote válido en dual simplex (modelo infactible).",
          tableau,
          basis,
          iterations,
        };
      }
    }

    pivotTableau(tableau, pivotRow, pivotCol);
    basis[pivotRow - 1] = pivotCol;
    iterations.push({
      iteration,
      pivot: `Fila ${pivotRow}, Columna ${params.headers[pivotCol]}`,
      headers: params.headers,
      tableau: cloneTableau(tableau),
    });
  }

  return {
    status: "error",
    message: "Se alcanzó el número máximo de iteraciones.",
    tableau,
    basis,
    iterations,
  };
}

function buildSimplexModel(problem: ProblemInput, allowNegativeB: boolean) {
  const m = problem.constraints.length;
  const n = problem.variableCount;
  const coeffs = problem.objective.map(parseNumericValue);
  if (coeffs.some((value) => Number.isNaN(value))) {
    return { error: "La función objetivo contiene coeficientes inválidos." };
  }

  const c = problem.optimize === "max" ? coeffs : coeffs.map((value) => -value);
  const headers = [
    ...Array.from({ length: n }, (_, i) => `x${i + 1}`),
    ...Array.from({ length: m }, (_, i) => `s${i + 1}`),
  ];
  const tableau: number[][] = [Array(n + m + 1).fill(0)];
  const basis: number[] = [];

  for (let j = 0; j < n; j += 1) {
    tableau[0][j] = -(c[j] ?? 0);
  }

  for (let i = 0; i < m; i += 1) {
    const row = Array(n + m + 1).fill(0);
    const restriction = problem.constraints[i];
    if (!restriction) {
      return { error: `No se pudo leer la restricción ${i + 1}.` };
    }
    const rowCoeffs = restriction.coeffs.map(parseNumericValue);
    const rhs = parseNumericValue(restriction.rhs);
    if (rowCoeffs.some((value) => Number.isNaN(value)) || Number.isNaN(rhs)) {
      return { error: `La restricción ${i + 1} contiene datos inválidos.` };
    }

    if (restriction.operator !== "<=") {
      return { error: "Simplex estándar solo admite restricciones <=." };
    }

    if (!allowNegativeB && rhs < -EPS) {
      return {
        error:
          "Simplex estándar requiere términos independientes no negativos. Use Dual simplex o Dos fases.",
      };
    }

    for (let j = 0; j < n; j += 1) {
      row[j] = rowCoeffs[j] ?? 0;
    }
    row[n + i] = 1;
    row[n + m] = rhs;
    basis.push(n + i);
    tableau.push(row);
  }

  return { tableau, basis, headers, c };
}

export default function solveSimplex(problem: ProblemInput): MethodResult {
  const model = buildSimplexModel(problem, false);
  if ("error" in model) {
    return createErrorResult("simplex", model.error!);
  }

  const run = simplexCore({
    tableau: model.tableau,
    basis: model.basis,
    headers: model.headers,
    mode: "primal",
  });

  const solution = extractSolution(run.tableau, run.basis, problem.variableCount);
  const objectiveRaw = run.tableau[0][run.tableau[0].length - 1];
  const objectiveValue = problem.optimize === "max" ? objectiveRaw : -objectiveRaw;
  const nonBasicZeroCost = run.tableau[0]
    .slice(0, run.tableau[0].length - 1)
    .some((value, index) => !run.basis.includes(index) && Math.abs(value) < 1e-6);
  const degeneracion = run.basis.some(
    (_, rowIndex) => Math.abs(run.tableau[rowIndex + 1][run.tableau[0].length - 1]) < 1e-6,
  );
  const finalStatus = run.status === "optima" && nonBasicZeroCost ? "multiple" : run.status;

  return {
    method: "simplex",
    status: finalStatus,
    message: run.message,
    objectiveValue: run.status === "optima" ? objectiveValue : null,
    solution,
    iterations: run.iterations,
    headers: model.headers,
    finalTableau: run.tableau,
    analysis: {
      tipoSolucion: mapStatusToLabel(finalStatus),
      degeneracion,
      factible: finalStatus !== "infactible",
      acotada: finalStatus !== "no_acotada",
      observaciones: [
        "Variables no básicas con costo reducido cero indican soluciones alternativas.",
        "Se asume no negatividad de las variables de decisión.",
      ],
    },
    generatedAt: new Date().toISOString(),
  };
}