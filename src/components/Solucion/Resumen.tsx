import { MethodResult } from "@/data/interfaces";
import { formatNumber } from "@/utiles/numeros";

export default function ResumenSolucion({
  activeResult,
}: {
  activeResult: MethodResult;
}) {
  return (
    <div className="overflow-hidden rounded-md border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
      <div className="grid grid-cols-2 divide-x divide-slate-200 dark:divide-slate-800">
        
        <div className="flex flex-col justify-center gap-y-2 p-4">
          <div className="flex flex-col">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Valor Objetivo
            </span>
            <span className="text-lg font-semibold tabular-nums text-slate-600 dark:text-slate-300">
              {activeResult.ValorOptimo !== null
                ? formatNumber(activeResult.ValorOptimo)
                : "N/A"}
            </span>
          </div>
          
          <div className="flex flex-col">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Vector Solución
            </span>
            <span className="text-md text-slate-700 dark:text-slate-300" title={
              activeResult.variables ? Object.entries(activeResult.variables).map(([k, v]) => `${k}=${v}`).join(", ") : ""
            }>
              {activeResult.variables && Object.keys(activeResult.variables).length > 0
                ? Object.entries(activeResult.variables)
                    .map(([key, value]) => `${key}=${formatNumber(value)}`)
                    .join(", ")
                : "N/A"}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2 bg-slate-50/50 p-4 dark:bg-slate-900/30">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">Tipo:</span>
            <span className="rounded-md px-2 py-0.5 text-sm font-medium text-slate-700 dark:text-slate-300">
              {activeResult.analysis.tipo_solucion}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">Acotamiento:</span>
            <span className={`text-sm ${activeResult.analysis.acotada ? 'text-slate-800' : 'text-rose-600'}`}>
              {activeResult.analysis.acotada ? "Acotada" : "No Acotada"}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">Degeneración:</span>
            <span className={`text-sm ${activeResult.analysis.degeneracion ? 'text-amber-600' : 'text-slate-800 dark:text-slate-300'}`}>
              {activeResult.analysis.degeneracion ? "Sí" : "No"}
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}