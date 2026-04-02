import { ProblemInput, ConstraintInput } from "@/data/interfaces";
import { parseNumericValue, safeCell } from "@/utiles/numeros";

export function getInitialProblem(): ProblemInput {
  return {
    variableCount: 2,
    optimize: "max",
    objective: ["3", "5"],
    constraints: [
      { coeffs: ["1", "0"], operator: "<=", rhs: "4" },
      { coeffs: ["0", "2"], operator: "<=", rhs: "12" },
      { coeffs: ["3", "2"], operator: "<=", rhs: "18" },
    ],
  };
}

export function evaluateConstraint(x: number, y: number, constraint: ConstraintInput): boolean {
  const a = parseNumericValue(safeCell(constraint.coeffs, 0));
  const b = parseNumericValue(safeCell(constraint.coeffs, 1));
  const rhs = parseNumericValue(constraint.rhs);
  const value = a * x + b * y;
  if (constraint.operator === "<=") return value <= rhs + 1e-6;
  if (constraint.operator === ">=") return value >= rhs - 1e-6;
  return Math.abs(value - rhs) <= 1e-6;
}