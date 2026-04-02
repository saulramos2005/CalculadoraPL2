import { Method } from "./types";
export const EPS = 1e-8;
export const STORAGE_KEY = "lp-solver-state-v1";
export const methodLabels: Record<Method, string> = {
  grafico: "Gráfico",
  simplex: "Simplex",
  dualSimplex: "Dual simplex",
  dosFases: "Dos fases",
};