import { useMemo } from "react";
import { formatNumber } from "@/utiles/numeros";
import { MethodResult } from "@/data/interfaces";

export default function TablaAnalisis({
  activeResult,
}: {
  activeResult: MethodResult;
}) {

  const analysisRows = useMemo(() => {
    return [
      ["Valor óptimo", activeResult.ValorOptimo ? formatNumber(activeResult.ValorOptimo) : "N/A" ],
      ["Variables", activeResult.variables ? Object.entries(activeResult.variables).map(([k, v]) => `${k}=${formatNumber(v)}`).join(", ") : "N/A"],
      ["Tipo de solución", activeResult.analysis.tipo_solucion],
      ["Factibilidad",activeResult.analysis.factible ? "Factible" : "Infactible"],
      ["Acotamiento", activeResult.analysis.acotada ? "Sí" : "No"],
      ["Degeneración", activeResult.analysis.degeneracion ? "Sí" : "No"],
    ];
  }, [activeResult]);

  return (
    <div className="overflow-x-auto rounded-md border border-cyan-100 transition-colors duration-300 dark:border-cyan-900/50">
      <table className="min-w-full text-left text-sm">
        <tbody>
          {analysisRows.map(([key, value]) => (
            <tr
              key={key}
              className="border-b border-cyan-100 transition-colors last:border-none hover:bg-cyan-50/50 dark:border-cyan-900/50 dark:hover:bg-cyan-900/10"
            >
              <th className="w-1/3 bg-cyan-50 px-3 py-2 font-medium text-cyan-800 dark:bg-cyan-900/20 dark:text-cyan-300">
                {key}
              </th>
              <td className="w-2/3 px-3 py-2">{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
