import { ProblemInput, MethodResult } from "@/data/interfaces";
import { createErrorResult } from "../resultados";
import { parseNumericValue, safeCell } from "../numeros";
import { evaluateConstraint } from "../input";
import { mapStatusToLabel } from "../resultados";
import { EPS } from "@/data/constants";

export default function solveGraphical(problem: ProblemInput): MethodResult {
  if (problem.variableCount !== 2) {
    return createErrorResult("grafico", "El método gráfico requiere exactamente 2 variables.");
  }

  const objective = problem.objective.map(parseNumericValue);
  if (objective.some((value) => Number.isNaN(value))) {
    return createErrorResult("grafico", "La función objetivo contiene coeficientes inválidos.");
  }

  const lines = problem.constraints
    .map((restriction) => {
      const a = parseNumericValue(safeCell(restriction.coeffs, 0));
      const b = parseNumericValue(safeCell(restriction.coeffs, 1));
      const rhs = parseNumericValue(restriction.rhs);
      if ([a, b, rhs].some((value) => Number.isNaN(value))) return null;
      return { a, b, rhs };
    })
    .filter((line): line is { a: number; b: number; rhs: number } => Boolean(line));

  if (lines.length !== problem.constraints.length) {
    return createErrorResult("grafico", "Hay coeficientes inválidos en las restricciones.");
  }

  lines.push({ a: 1, b: 0, rhs: 0 });
  lines.push({ a: 0, b: 1, rhs: 0 });

  const candidates: Array<{ x: number; y: number }> = [{ x: 0, y: 0 }];
  for (let i = 0; i < lines.length; i += 1) {
    for (let j = i + 1; j < lines.length; j += 1) {
      const det = lines[i].a * lines[j].b - lines[j].a * lines[i].b;
      if (Math.abs(det) < EPS) continue;
      const x = (lines[i].rhs * lines[j].b - lines[j].rhs * lines[i].b) / det;
      const y = (lines[i].a * lines[j].rhs - lines[j].a * lines[i].rhs) / det;
      if (Number.isFinite(x) && Number.isFinite(y)) {
        candidates.push({ x, y });
      }
    }
  }

  const feasible = candidates.filter((point) => {
    if (point.x < -1e-6 || point.y < -1e-6) return false;
    return problem.constraints.every((restriction) => evaluateConstraint(point.x, point.y, restriction));
  });

  if (feasible.length === 0) {
    return {
      method: "grafico",
      status: "infactible",
      message: "No existe región factible para las restricciones dadas.",
      objectiveValue: null,
      solution: [0, 0],
      iterations: [],
      headers: ["x1", "x2"],
      finalTableau: [],
      analysis: {
        tipoSolucion: mapStatusToLabel("infactible"),
        degeneracion: false,
        factible: false,
        acotada: false,
        observaciones: ["No hay intersecciones que cumplan simultáneamente todas las restricciones."],
      },
      generatedAt: new Date().toISOString(),
    };
  }

  let best = feasible[0];
  let bestValue = objective[0] * best.x + objective[1] * best.y;
  for (const point of feasible) {
    const value = objective[0] * point.x + objective[1] * point.y;
    const better = problem.optimize === "max" ? value > bestValue + EPS : value < bestValue - EPS;
    if (better) {
      best = point;
      bestValue = value;
    }
  }

  const repeatedBest = feasible.filter((point) => {
    const value = objective[0] * point.x + objective[1] * point.y;
    return Math.abs(value - bestValue) < 1e-6;
  });

  const centroid = feasible.reduce(
    (acc, point) => ({ x: acc.x + point.x / feasible.length, y: acc.y + point.y / feasible.length }),
    { x: 0, y: 0 },
  );
  const sortedRegion = [...feasible].sort(
    (p1, p2) =>
      Math.atan2(p1.y - centroid.y, p1.x - centroid.x) - Math.atan2(p2.y - centroid.y, p2.x - centroid.x),
  );

  return {
    method: "grafico",
    status: repeatedBest.length > 1 ? "multiple" : "optima",
    message: "Solución obtenida evaluando vértices factibles.",
    objectiveValue: bestValue,
    solution: [best.x, best.y],
    iterations: [],
    headers: ["x1", "x2"],
    finalTableau: [],
    graphPoints: [best],
    feasibleRegion: sortedRegion,
    analysis: {
      tipoSolucion: repeatedBest.length > 1 ? mapStatusToLabel("multiple") : mapStatusToLabel("optima"),
      degeneracion: false,
      factible: true,
      acotada: true,
      observaciones: [
        "El método gráfico evalúa puntos extremos en 2D.",
        repeatedBest.length > 1 ? "Se detectó más de un vértice con el mismo valor óptimo." : "Óptimo único en la región factible.",
      ],
    },
    generatedAt: new Date().toISOString(),
  };
}