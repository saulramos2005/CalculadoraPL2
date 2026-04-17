import { useMemo } from "react";
import { MethodResult } from "@/data/interfaces";

export default function TablaAnalisis({ activeResult }: { activeResult: MethodResult }) {
  const analysisRows = useMemo(() => {
    return [
      ["Tipo de solución", activeResult.analysis.tipo_solucion],
      ["Factibilidad", activeResult.analysis.factible ? "Factible" : "Infactible"],
      ["Acotamiento", activeResult.analysis.acotada ? "Sí" : "No"],
      ["Degeneración", activeResult.analysis.degeneracion ? "Sí" : "No"],
    ];
  }, [activeResult]);

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 transition-colors duration-300 dark:border-slate-800">
      <table className="min-w-full text-left text-sm">
        <tbody>
          {analysisRows.map(([key, value]) => (
            <tr key={key} className="border-b border-slate-200 last:border-none dark:border-slate-800">
              <th className="bg-slate-100 px-3 py-2 font-medium text-slate-700 dark:bg-slate-950/60 dark:text-slate-300">{key}</th>
              <td className="px-3 py-2">{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}