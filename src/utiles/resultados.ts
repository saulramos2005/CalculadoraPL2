// import { MethodResult } from "@/data/interfaces";
import { SolveStatus } from "@/data/types";

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

export function downloadFile(name: string, content: string, type: string): void {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}