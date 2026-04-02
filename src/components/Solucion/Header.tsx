import { Method } from "@/data/types";
import { ProblemInput, MethodResult } from "@/data/interfaces";
import { methodLabels } from "@/data/constants";
import { downloadFile } from "@/utiles/resultados";

interface HeaderResultadosProps {
  method: Method;
  activeResult: MethodResult | null;
  problem: ProblemInput;
}

export default function HeaderResultados({ method, activeResult, problem }: HeaderResultadosProps) {
  const exportCurrentResult = () => {
    if (!activeResult) return;
    downloadFile(
      `resultado-${activeResult.method}.json`,
      JSON.stringify({ problem, result: activeResult }, null, 2),
      "application/json",
    );
  };

  const exportIterationsCsv = () => {
    if (!activeResult || activeResult.iterations.length === 0) return;
    const csv: string[] = [];
    activeResult.iterations.forEach((iteration) => {
      csv.push(`Iteracion ${iteration.iteration};${iteration.pivot}`);
      csv.push(["Fila", ...iteration.headers, "RHS"].join(";"));
      iteration.tableau.forEach((row, index) => {
        csv.push([index === 0 ? "Z" : `R${index}`, ...row.map((value) => value.toString())].join(";"));
      });
      csv.push("");
    });
    downloadFile(`iteraciones-${activeResult.method}.csv`, csv.join("\n"), "text/csv;charset=utf-8");
  };

  const exportGraph = () => {
    if (method !== "grafico") return;
    const svg = document.getElementById("grafico-lp");
    if (!svg) return;
    downloadFile("grafica-lp.svg", svg.outerHTML, "image/svg+xml;charset=utf-8");
  };

  return (
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-medium">Resultado: {methodLabels[method]}</h2>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={exportCurrentResult}
            disabled={!activeResult}
            className="rounded-md border border-slate-300 bg-cyan-50 px-3 py-1.5 text-xs text-slate-700 transition hover:border-cyan-600 disabled:opacity-60 dark:border-slate-600 dark:bg-cyan-600/20 dark:text-slate-100 dark:hover:border-cyan-400"
          >
            Exportar JSON
          </button>
          <button
            type="button"
            onClick={exportIterationsCsv}
            disabled={!activeResult || activeResult.iterations.length === 0}
            className="rounded-md border border-slate-300 bg-cyan-50 px-3 py-1.5 text-xs text-slate-700 transition hover:border-cyan-600 disabled:opacity-60 dark:border-slate-600 dark:bg-cyan-600/20 dark:text-slate-100 dark:hover:border-cyan-400"
          >
            Exportar tabla
          </button>
          <button
            type="button"
            onClick={exportGraph}
            disabled={method !== "grafico" || !activeResult?.feasibleRegion}
            className="rounded-md border border-slate-300 bg-cyan-50 px-3 py-1.5 text-xs text-slate-700 transition hover:border-cyan-600 disabled:opacity-60 dark:border-slate-600 dark:bg-cyan-600/20 dark:text-slate-100 dark:hover:border-cyan-400"
          >
            Exportar gráfica
          </button>
        </div>
      </div>
  );
}