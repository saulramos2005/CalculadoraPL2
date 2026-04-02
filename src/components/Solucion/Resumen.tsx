import { MethodResult } from "@/data/interfaces";
import { formatNumber } from "@/utiles/numeros";
import { mapStatusToLabel } from "@/utiles/resultados";

export default function ResumenSolucion({ activeResult }: { activeResult: MethodResult }) {
  return (
    <div className="rounded-lg border border-slate-200 p-3 text-sm transition-colors duration-300 dark:border-slate-800">
      <p>
        <span className="text-slate-600 dark:text-slate-300">Estado:</span> {mapStatusToLabel(activeResult.status)}
      </p>
      <p>
        <span className="text-slate-600 dark:text-slate-300">Valor objetivo:</span>{" "}
        {activeResult.objectiveValue !== null ? formatNumber(activeResult.objectiveValue) : "N/A"}
      </p>
      <p>
        <span className="text-slate-600 dark:text-slate-300">Vector solución:</span>{" "}
        {activeResult.solution.length > 0
          ? activeResult.solution.map((value, index) => `x${index + 1}=${formatNumber(value)}`).join(", ")
          : "N/A"}
      </p>
    </div>
  );
}