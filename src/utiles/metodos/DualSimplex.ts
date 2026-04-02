import { ProblemInput, MethodResult } from "@/data/interfaces";
import { createErrorResult } from "../resultados";
import { mapStatusToLabel } from "../resultados";
import { extractSolution } from "../tablas";
import { simplexCore, buildSimplexModel } from "./simplexcore";
import { EPS } from "@/data/constants";

export default function solveDualSimplex(problem: ProblemInput): MethodResult {
  const model = buildSimplexModel(problem, true);
  if ("error" in model) {
    return createErrorResult("dualSimplex", model.error!);
  }

  const hasDualFeasibleObjective = model.tableau[0]
    .slice(0, model.tableau[0].length - 1)
    .every((value) => value <= EPS);

  if (!hasDualFeasibleObjective) {
    return createErrorResult(
      "dualSimplex",
      "Dual simplex requiere costos reducidos iniciales no positivos. Ajuste la función objetivo o use otro método.",
    );
  }

  const run = simplexCore({
    tableau: model.tableau,
    basis: model.basis,
    headers: model.headers,
    mode: "dual",
  });

  const solution = extractSolution(run.tableau, run.basis, problem.variableCount);
  const objectiveRaw = run.tableau[0][run.tableau[0].length - 1];
  const objectiveValue = problem.optimize === "max" ? objectiveRaw : -objectiveRaw;

  return {
    method: "dualSimplex",
    status: run.status,
    message: run.message,
    objectiveValue: run.status === "optima" ? objectiveValue : null,
    solution,
    iterations: run.iterations,
    headers: model.headers,
    finalTableau: run.tableau,
    analysis: {
      tipoSolucion: mapStatusToLabel(run.status),
      degeneracion: run.basis.some(
        (_, rowIndex) => Math.abs(run.tableau[rowIndex + 1][run.tableau[0].length - 1]) < 1e-6,
      ),
      factible: run.status !== "infactible",
      acotada: run.status !== "no_acotada",
      observaciones: [
        "Se utilizó pivoteo dual priorizando filas con término independiente negativo.",
      ],
    },
    generatedAt: new Date().toISOString(),
  };
}