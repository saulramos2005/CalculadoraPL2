import { Method } from "@/data/types";
import { ProblemaLineal, MethodResult } from "@/data/interfaces";
import { methodLabels } from "@/data/constants";
import { downloadFile } from "@/utiles/resultados";

interface HeaderResultadosProps {
  method: Method;
  activeResult: MethodResult | null;
  problem: ProblemaLineal;
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
    if (!activeResult || !("tablas" in activeResult)) return;

    const csvRows: string[] = [];
    activeResult.tablas.forEach((tabla) => {
      csvRows.push(`Iteracion ${tabla.iteracion}`);
      csvRows.push(["Base", ...tabla.encabezados].join(";"));
      tabla.matriz.forEach((row, rowIndex) => {
        const isZRow = rowIndex === tabla.matriz.length - 1;
        const rowLabel = isZRow ? "Z" : tabla.basicas[rowIndex] || "";
        csvRows.push([rowLabel, ...row.map((value) => value.toString())].join(";"));
      });
      csvRows.push(""); // Separador
    });
    downloadFile(`iteraciones-${activeResult.method}.csv`, csvRows.join("\n"), "text/csv;charset=utf-8");
  };

  const exportGraph = () => {
    if (!activeResult || !("RegionFactible" in activeResult)) return;
    const svg = document.querySelector("#grafico-lp svg");
    if (!svg) return;
    downloadFile("grafica-lp.svg", svg.outerHTML, "image/svg+xml;charset=utf-8");
  };

  return (
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2 dark:border-slate-800">
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
            disabled={!activeResult || !("tablas" in activeResult)}
            className="rounded-md border border-slate-300 bg-cyan-50 px-3 py-1.5 text-xs text-slate-700 transition hover:border-cyan-600 disabled:opacity-60 dark:border-slate-600 dark:bg-cyan-600/20 dark:text-slate-100 dark:hover:border-cyan-400"
          >
            Exportar tabla
          </button>
          <button
            type="button"
            onClick={exportGraph}
            disabled={!activeResult || !("RegionFactible" in activeResult)}
            className="rounded-md border border-slate-300 bg-cyan-50 px-3 py-1.5 text-xs text-slate-700 transition hover:border-cyan-600 disabled:opacity-60 dark:border-slate-600 dark:bg-cyan-600/20 dark:text-slate-100 dark:hover:border-cyan-400"
          >
            Exportar gráfica
          </button>
        </div>
      </div>
  );
}