import { EPS } from "@/data/constants";

export function cloneTableau(tableau: number[][]): number[][] {
  return tableau.map((row) => [...row]);
}

export function pivotTableau(tableau: number[][], row: number, col: number): void {
  const pivotValue = tableau[row][col];
  for (let j = 0; j < tableau[row].length; j += 1) {
    tableau[row][j] /= pivotValue;
  }

  for (let i = 0; i < tableau.length; i += 1) {
    if (i === row) continue;
    const factor = tableau[i][col];
    if (Math.abs(factor) < EPS) continue;
    for (let j = 0; j < tableau[i].length; j += 1) {
      tableau[i][j] -= factor * tableau[row][j];
    }
  }
}

export function extractSolution(tableau: number[][], basis: number[], variableCount: number): number[] {
  const solution = Array(variableCount).fill(0);
  for (let i = 0; i < basis.length; i += 1) {
    const basisCol = basis[i];
    if (basisCol < variableCount) {
      solution[basisCol] = tableau[i + 1][tableau[0].length - 1];
    }
  }
  return solution;
}