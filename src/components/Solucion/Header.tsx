import { Method } from "@/data/types";
import { ProblemaLineal, MethodResult } from "@/data/interfaces";
import { downloadFile } from "@/utiles/resultados";
import { FileJson, Table, LineChart } from "lucide-react";
import { baseButtonClass, tooltipClass } from "@/data/styles";
interface HeaderResultadosProps {
  method: Method;
  activeResult: MethodResult | null;
  problem: ProblemaLineal;
  activeTab: string;
}

const classname = `${baseButtonClass} disabled:cursor-not-allowed`;

const tabTitles: Record<string, string> = {
  visual: "Visualización",
  analitico: "Resumen analítico",
  sensibilidad: "Análisis de sensibilidad"
};

export default function HeaderResultados({ method, activeResult, problem, activeTab }: HeaderResultadosProps) {
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
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">{tabTitles[activeTab] || "Resultados"}</h2>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={exportCurrentResult}
            disabled={!activeResult}
            className={classname}
            aria-label="Exportar JSON"
          >
            <FileJson size={18} />
            <span className={tooltipClass}>
              Exportar JSON
            </span>
          </button>
          <button
            type="button"
            onClick={exportIterationsCsv}
            disabled={!activeResult || !("tablas" in activeResult)}
            className={classname}
            aria-label="Exportar tabla CSV"
          >
            <Table size={18} />
            <span className={tooltipClass}>
              Exportar tabla CSV
            </span>
          </button>
          <button
            type="button"
            onClick={exportGraph}
            disabled={!activeResult || !("RegionFactible" in activeResult)}
            className={classname}
            aria-label="Exportar gráfica SVG"
          >
            <LineChart size={18} />
            <span className={tooltipClass}>
              Exportar gráfica SVG
            </span>
          </button>
        </div>
      </div>
  );
}