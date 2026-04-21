import { SolucionGrafica } from "@/data/interfaces";
import { formatNumber } from "@/utiles/numeros";
import { useSVGInteraccion } from "./useSVGInteraccion";
import { useRef } from "react";
import { X } from "lucide-react";

export default function GraficaSolucion({ activeResult, axisLimit }: { activeResult: SolucionGrafica; axisLimit: number }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const {
    viewBox,
    hoveredPoint,
    selectedVertex,
    setSelectedVertex,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleClick,
  } = useSVGInteraccion(svgRef, axisLimit, activeResult);

  if (!activeResult.RegionFactible || activeResult.RegionFactible.length === 0) return null;

  return (
    <div className="rounded-lg border border-slate-200 p-3 transition-colors duration-300 dark:border-slate-800 relative">
      <svg
        ref={svgRef}
        viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`}
        className="h-72 w-full bg-slate-50 transition-colors duration-300 dark:bg-slate-950 cursor-move"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={handleClick}
      >
        {/* Grid lines */}
        {Array.from({ length: 11 }, (_, i) => {
          const value = (axisLimit / 5) * (i - 5);
          return (
            <g key={`grid-${i}`}>
              <line
                x1={value}
                y1={-axisLimit}
                x2={value}
                y2={axisLimit}
                className="stroke-slate-200 dark:stroke-slate-700"
                strokeWidth="0.5"
              />
              <line
                x1={-axisLimit}
                y1={value}
                x2={axisLimit}
                y2={value}
                className="stroke-slate-200 dark:stroke-slate-700"
                strokeWidth="0.5"
              />
            </g>
          );
        })}

        {/* Axis lines */}
        <line x1={-axisLimit} y1="0" x2={axisLimit} y2="0" className="stroke-slate-400 dark:stroke-slate-500" strokeWidth="1.2" />
        <line x1="0" y1={-axisLimit} x2="0" y2={axisLimit} className="stroke-slate-400 dark:stroke-slate-500" strokeWidth="1.2" />

        {/* Axis ticks and labels */}
        {Array.from({ length: 6 }, (_, i) => {
          const value = (axisLimit / 5) * i;
          return (
            <g key={`tick-${i}`}>
              <line x1={value} y1="-2" x2={value} y2="2" className="stroke-slate-300 dark:stroke-slate-600" />
              <line x1="-2" y1={value} x2="2" y2={value} className="stroke-slate-300 dark:stroke-slate-600" />
              <line x1={value} y1={-axisLimit} x2={value} y2={-axisLimit + 2} className="stroke-slate-300 dark:stroke-slate-600" />
              <line x1={-axisLimit} y1={value} x2={-axisLimit + 2} y2={value} className="stroke-slate-300 dark:stroke-slate-600" />
              <text x={value - 3} y="15" fontSize="8" className="fill-slate-500 dark:fill-slate-400">
                {formatNumber(value)}
              </text>
              <text x="-25" y={value + 3} fontSize="8" className="fill-slate-500 dark:fill-slate-400">
                {formatNumber(value)}
              </text>
            </g>
          );
        })}

        {/* Feasible region */}
        <polygon
          points={activeResult.RegionFactible
            .map((point) => `${point.x},${point.y}`)
            .join(" ")}
          fill="rgba(34,211,238,0.25)"
          stroke="#22d3ee"
          strokeWidth="1.5"
        />

        {/* Optimal points */}
        {activeResult.Vertices.filter(
          (v) => Math.abs(v.valor - activeResult.ValorOptimo) < 1e-6,
        ).map((point, idx) => (
          <g key={`best-${idx}`}>
            <circle
              cx={point.x}
              cy={point.y}
              r="3"
              fill={selectedVertex === point ? "#dc2626" : "#f97316"}
              className="cursor-pointer hover:r-4 transition-all"
            />
            <text
              x={point.x + 5}
              y={point.y - 5}
              fontSize="10"
              fill="#fb923c"
            >
              ({formatNumber(point.x)}, {formatNumber(point.y)})
            </text>
          </g>
        ))}

        {/* Hover effect */}
        {hoveredPoint && (
          <circle
            cx={hoveredPoint.x}
            cy={hoveredPoint.y}
            r="5"
            fill="none"
            stroke="#f97316"
            strokeWidth="2"
            className="pointer-events-none"
          />
        )}
      </svg>

      {/* Details panel */}
      {selectedVertex && (
        <div className="absolute top-0 right-0 z-20 h-full w-48 overflow-y-auto border-l border-cyan-200 bg-white/95 p-4 shadow-xl backdrop-blur-sm transition-colors dark:border-cyan-900/50 dark:bg-slate-950/95">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Detalles del Punto</h3>
            <button
              onClick={() => setSelectedVertex(null)}
              className="group relative flex items-center justify-center rounded-md p-1.5 text-slate-500 transition hover:bg-cyan-50 hover:text-cyan-700 dark:text-slate-400 dark:hover:bg-cyan-900/40 dark:hover:text-cyan-200"
              aria-label="Cerrar detalles"
            >
              <X size={16} />
              <span className="pointer-events-none absolute bottom-full right-0 z-50 mb-2 whitespace-nowrap rounded bg-slate-800 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100 dark:bg-slate-200 dark:text-slate-900">
                Cerrar
              </span>
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <h4 className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">Coordenadas</h4>
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded bg-cyan-50 p-2 dark:bg-cyan-900/20">
                  <span className="text-xs text-cyan-600 dark:text-cyan-400">x₁</span>
                  <p className="font-mono font-medium text-cyan-900 dark:text-cyan-100">{formatNumber(selectedVertex.x)}</p>
                </div>
                <div className="rounded bg-cyan-50 p-2 dark:bg-cyan-900/20">
                  <span className="text-xs text-cyan-600 dark:text-cyan-400">x₂</span>
                  <p className="font-mono font-medium text-cyan-900 dark:text-cyan-100">{formatNumber(selectedVertex.y)}</p>
                </div>
              </div>
            </div>
            <div>
              <h4 className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">Función Objetivo</h4>
              <div className="rounded border border-cyan-300 bg-cyan-100 p-3 dark:border-cyan-800 dark:bg-cyan-900/40">
                <p className="font-mono font-medium text-cyan-900 dark:text-cyan-100">
                  {formatNumber('valor' in selectedVertex ? (selectedVertex as any).valor : 0)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
