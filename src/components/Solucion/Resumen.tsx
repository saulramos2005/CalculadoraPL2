import { MethodResult } from "@/data/interfaces";

export default function ResumenSolucion({
  activeResult,
}: {
  activeResult: MethodResult;
}) {
  return (
    <div className="overflow-x-auto rounded-md border border-slate-200 transition-colors duration-300 dark:border-cyan-900/50">
      <table className="min-w-full text-center text-sm">
        <thead className="bg-cyan-50 text-cyan-800 dark:bg-cyan-900/20 dark:text-cyan-300">
          <tr>
            <th className="px-3 py-2 font-medium">Tipo</th>
            <th className="px-3 py-2 font-medium">Acotada</th>
            <th className="px-2 py-2 font-medium">Degeneración</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-cyan-100 dark:divide-cyan-900/50">
          <tr className="bg-white transition-colors hover:bg-cyan-50/50 dark:bg-slate-950 dark:hover:bg-cyan-900/10">
            <td className="px-4 py-2 text-slate-700 dark:text-slate-300">{activeResult.analysis.tipo_solucion}</td>
            <td className="px-4 py-2 text-slate-700 dark:text-slate-300">{activeResult.analysis.acotada ? "Sí" : "No"}</td>
            <td className="px-4 py-2 text-slate-700 dark:text-slate-300">{activeResult.analysis.degeneracion ? "Sí" : "No"}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}