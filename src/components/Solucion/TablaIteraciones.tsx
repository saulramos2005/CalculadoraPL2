import { ProblemaLineal, MethodResult } from "@/data/interfaces";
import { formatNumber } from "@/utiles/numeros";


export default function TablaIteraciones({ activeResult, problem }: { activeResult: MethodResult; problem: ProblemaLineal }) {
  if (!activeResult || !("tablas" in activeResult)) return;
  if (activeResult.tablas.length === 0) return null;

  return (
    <div className="space-y-2">
      <p className="text-sm text-slate-700 dark:text-slate-300">Tabla de iteraciones ({activeResult.tablas.length})</p>
      <div className="max-h-72 overflow-auto rounded-lg border border-cyan-100 transition-colors duration-300 dark:border-cyan-900/50">
        <table className="min-w-full text-xs">
          <thead className="sticky top-0 bg-cyan-50 text-cyan-800 dark:bg-cyan-900/20 dark:text-cyan-300">
            <tr>
              <th className="px-2 py-2 text-left">Iteración</th>
              <th className="px-2 py-2 text-left">Pivote</th>
              <th className="px-2 py-2 text-left">RHS final</th>
            </tr>
          </thead>
          <tbody>
            {activeResult.tablas.map((iteration) => (
              <tr key={iteration.iteracion} className="border-t border-cyan-100 transition-colors hover:bg-cyan-50/50 dark:border-cyan-900/50 dark:hover:bg-cyan-900/10">
                <td className="px-2 py-2">{iteration.iteracion}</td>
                <td className="px-2 py-2">{iteration.columnaPivote}</td>
                <td className="px-2 py-2">
                  {formatNumber(
                    iteration.matriz[0][iteration.matriz[0].length - 1] *
                      (problem.tipo_optimizacion === "max" ? 1 : -1),
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}