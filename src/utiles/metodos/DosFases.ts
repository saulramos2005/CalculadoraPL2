import { ProblemInput, MethodResult } from "@/data/interfaces";
import { createErrorResult } from "../resultados";
import { parseNumericValue } from "../numeros";
import { mapStatusToLabel } from "../resultados";
import { cloneTableau, pivotTableau, extractSolution } from "../tablas";
import { simplexCore } from "./simplexcore";
import { EPS } from "@/data/constants";

export default function solveTwoPhase(problem: ProblemInput): MethodResult {
  const n = problem.variableCount;
  const cRaw = problem.objective.map(parseNumericValue);
  if (cRaw.some((value) => Number.isNaN(value))) {
    return createErrorResult("dosFases", "La función objetivo contiene coeficientes inválidos.");
  }

  const c = problem.optimize === "max" ? cRaw : cRaw.map((value) => -value);
  const headers = Array.from({ length: n }, (_, i) => `x${i + 1}`);
  const rows: number[][] = [];
  const basis: number[] = [];
  const artificialCols: number[] = [];

  const addVariable = (name: string) => {
    headers.push(name);
    rows.forEach((row) => row.push(0));
    return headers.length - 1;
  };

  for (let i = 0; i < problem.constraints.length; i += 1) {
    const restriction = problem.constraints[i];
    if (!restriction) {
      return createErrorResult("dosFases", `No se pudo leer la restricción ${i + 1}.`);
    }
    const parsedCoeffs = restriction.coeffs.map(parseNumericValue);
    let rhs = parseNumericValue(restriction.rhs);
    if (parsedCoeffs.some((value) => Number.isNaN(value)) || Number.isNaN(rhs)) {
      return createErrorResult("dosFases", `La restricción ${i + 1} contiene datos inválidos.`);
    }

    let operator = restriction.operator;
    const row = Array(headers.length).fill(0);
    for (let j = 0; j < n; j += 1) {
      row[j] = parsedCoeffs[j] ?? 0;
    }

    if (rhs < -EPS) {
      rhs *= -1;
      for (let j = 0; j < n; j += 1) {
        row[j] *= -1;
      }
      operator = operator === "<=" ? ">=" : operator === ">=" ? "<=" : "=";
    }

    rows.push(row);
    const currentRow = rows[rows.length - 1];

    if (operator === "<=") {
      const slackCol = addVariable(`s${i + 1}`);
      currentRow[slackCol] = 1;
      basis.push(slackCol);
    } else if (operator === ">=") {
      const surplusCol = addVariable(`e${i + 1}`);
      currentRow[surplusCol] = -1;
      const artificialCol = addVariable(`a${i + 1}`);
      currentRow[artificialCol] = 1;
      basis.push(artificialCol);
      artificialCols.push(artificialCol);
    } else {
      const artificialCol = addVariable(`a${i + 1}`);
      currentRow[artificialCol] = 1;
      basis.push(artificialCol);
      artificialCols.push(artificialCol);
    }

    currentRow.push(rhs);
  }

  const totalCols = headers.length;
  const tableau = [Array(totalCols + 1).fill(0), ...rows.map((row) => [...row.slice(0, totalCols), row[totalCols]])];

  for (const col of artificialCols) {
    tableau[0][col] = 1;
  }
  for (let i = 0; i < basis.length; i += 1) {
    const basisCol = basis[i];
    if (artificialCols.includes(basisCol)) {
      for (let j = 0; j < tableau[0].length; j += 1) {
        tableau[0][j] -= tableau[i + 1][j];
      }
    }
  }

  const phase1 = simplexCore({
    tableau,
    basis,
    headers,
    mode: "primal",
  });

  if (phase1.status === "no_acotada" || phase1.status === "error") {
    return createErrorResult("dosFases", "Falló la fase 1 del método de dos fases.");
  }

  const phase1Objective = phase1.tableau[0][phase1.tableau[0].length - 1];
  if (Math.abs(phase1Objective) > 1e-6) {
    return {
      method: "dosFases",
      status: "infactible",
      message: "El problema es infactible: la fase 1 no eliminó variables artificiales.",
      objectiveValue: null,
      solution: Array(problem.variableCount).fill(0),
      iterations: phase1.iterations,
      headers,
      finalTableau: phase1.tableau,
      analysis: {
        tipoSolucion: mapStatusToLabel("infactible"),
        degeneracion: false,
        factible: false,
        acotada: false,
        observaciones: ["Revise restricciones incompatibles o redundantes."],
      },
      generatedAt: new Date().toISOString(),
    };
  }

  const tableauPhase2 = cloneTableau(phase1.tableau);
  const basisPhase2 = [...phase1.basis];
  for (let i = basisPhase2.length - 1; i >= 0; i -= 1) {
    const basisCol = basisPhase2[i];
    if (artificialCols.includes(basisCol)) {
      const rowIdx = i + 1;
      let replacementCol = -1;
      for (let j = 0; j < headers.length; j += 1) {
        if (!artificialCols.includes(j) && Math.abs(tableauPhase2[rowIdx][j]) > EPS) {
          replacementCol = j;
          break;
        }
      }

      if (replacementCol !== -1) {
        pivotTableau(tableauPhase2, rowIdx, replacementCol);
        basisPhase2[i] = replacementCol;
      }
    }
  }

  const removeCols = [...artificialCols].sort((a, b) => b - a);
  for (const col of removeCols) {
    tableauPhase2.forEach((row) => row.splice(col, 1));
    headers.splice(col, 1);
    for (let i = 0; i < basisPhase2.length; i += 1) {
      if (basisPhase2[i] > col) basisPhase2[i] -= 1;
    }
  }

  tableauPhase2[0].fill(0);
  for (let j = 0; j < problem.variableCount; j += 1) {
    tableauPhase2[0][j] = -(c[j] ?? 0);
  }

  for (let i = 0; i < basisPhase2.length; i += 1) {
    const col = basisPhase2[i];
    const coeff = tableauPhase2[0][col];
    if (Math.abs(coeff) > EPS) {
      for (let j = 0; j < tableauPhase2[0].length; j += 1) {
        tableauPhase2[0][j] -= coeff * tableauPhase2[i + 1][j];
      }
    }
  }

  const phase2 = simplexCore({
    tableau: tableauPhase2,
    basis: basisPhase2,
    headers,
    mode: "primal",
  });

  const solution = extractSolution(phase2.tableau, phase2.basis, problem.variableCount);
  const objectiveRaw = phase2.tableau[0][phase2.tableau[0].length - 1];

  return {
    method: "dosFases",
    status: phase2.status,
    message: phase2.message,
    objectiveValue: phase2.status === "optima" ? (problem.optimize === "max" ? objectiveRaw : -objectiveRaw) : null,
    solution,
    iterations: [...phase1.iterations, ...phase2.iterations],
    headers,
    finalTableau: phase2.tableau,
    analysis: {
      tipoSolucion: mapStatusToLabel(phase2.status),
      degeneracion: phase2.basis.some(
        (_, rowIndex) => Math.abs(phase2.tableau[rowIndex + 1][phase2.tableau[0].length - 1]) < 1e-6,
      ),
      factible: phase2.status !== "infactible",
      acotada: phase2.status !== "no_acotada",
      observaciones: ["La fase 1 construyó una base factible y la fase 2 optimizó la función objetivo."],
    },
    generatedAt: new Date().toISOString(),
  };
}