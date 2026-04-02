import { MethodResult } from "@/data/interfaces";

export default function ObservacionesSolucion({ activeResult }: { activeResult: MethodResult }) {
  return (
    <div className="rounded-lg border border-slate-200 p-3 text-xs text-slate-600 transition-colors duration-300 dark:border-slate-800 dark:text-slate-300">
      {activeResult.analysis.observaciones.join(" ")}
    </div>
  );
}