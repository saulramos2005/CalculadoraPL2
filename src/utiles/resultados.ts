import { MethodResult } from "@/data/interfaces";
import { SolveStatus, Method } from "@/data/types";

export function mapStatusToLabel(status: SolveStatus): string {
  const labels: Record<SolveStatus, string> = {
    optima: "Óptima",
    multiple: "Óptima múltiple",
    no_acotada: "No acotada",
    infactible: "Infactible",
    error: "Error de entrada",
  };
  return labels[status];
}

export function createErrorResult(method: Method, message: string): MethodResult {
  return {
    method,
    status: "error",
    message,
    objectiveValue: null,
    solution: [],
    iterations: [],
    headers: [],
    finalTableau: [],
    analysis: {
      tipoSolucion: mapStatusToLabel("error"),
      degeneracion: false,
      factible: false,
      acotada: false,
      observaciones: ["Revise el formato de coeficientes y operadores."],
    },
    generatedAt: new Date().toISOString(),
  };
}

export function downloadFile(name: string, content: string, type: string): void {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}