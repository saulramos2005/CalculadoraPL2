import { EPS } from "@/data/constants";

export function parseNumericValue(raw: string): number {
  const cleaned = raw.trim().replace(/,/g, ".");
  if (!cleaned) {
    return Number.NaN;
  }

  if (/^-?\d+\s*\/\s*-?\d+$/.test(cleaned)) {
    const [num, den] = cleaned.split("/").map((part) => Number(part.trim()));
    if (Math.abs(den) < EPS) {
      return Number.NaN;
    }
    return num / den;
  }

  return Number(cleaned);
}

export function safeCell(values: string[], index: number): string {
  return values[index] ?? "0";
}

export function formatNumber(value: number): string {
  if (!Number.isFinite(value)) {
    return "-";
  }

  if (Math.abs(value) < EPS) {
    return "0";
  }

  return value.toLocaleString("es-ES", { maximumFractionDigits: 6 });
}