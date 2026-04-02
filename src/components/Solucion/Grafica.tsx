import { MethodResult } from "@/data/interfaces";
import { formatNumber } from "@/utiles/numeros";
import { useSVGInteraccion } from "./useSVGInteraccion";
import { useRef } from "react";

export default function GraficaSolucion({ activeResult, axisLimit }: { activeResult: MethodResult; axisLimit: number }) {
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
    resetView,
  } = useSVGInteraccion(svgRef, axisLimit, activeResult);

  if (!activeResult.feasibleRegion || activeResult.feasibleRegion.length === 0) return null;

  return (
    <div className="rounded-lg border border-slate-200 p-3 transition-colors duration-300 dark:border-slate-800 relative">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-semibold">Gráfica Interactiva</h3>
        <button
          onClick={resetView}
          className="text-xs px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded transition-colors"
        >
          Reset View
        </button>
      </div>
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
          points={activeResult.feasibleRegion
            .map((point) => `${point.x},${point.y}`)
            .join(" ")}
          fill="rgba(34,211,238,0.25)"
          stroke="#22d3ee"
          strokeWidth="1.5"
        />

        {/* Optimal points */}
        {activeResult.graphPoints?.map((point, idx) => (
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
        <div className="absolute top-0 right-0 h-full w-48 bg-white/95 backdrop-blur-sm shadow-xl border-l border-gray-200 p-4 overflow-y-auto z-20">
          <div className="flex justify-between items-start mb-4">
            <h3 className="font-bold text-gray-800 text-lg">Detalles del Punto</h3>
            <button
              onClick={() => setSelectedVertex(null)}
              className="text-gray-400 hover:text-gray-600 rounded-full p-1"
            >
              ✕
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Coordenadas</h4>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-gray-50 p-2 rounded">
                  <span className="text-xs text-gray-500">x₁</span>
                  <p className="font-mono font-medium">{formatNumber(selectedVertex.x)}</p>
                </div>
                <div className="bg-gray-50 p-2 rounded">
                  <span className="text-xs text-gray-500">x₂</span>
                  <p className="font-mono font-medium">{formatNumber(selectedVertex.y)}</p>
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Función Objetivo</h4>
              <div className="bg-green-50 p-3 rounded border border-green-200">
                <p className="font-mono font-medium text-green-900">
                  {formatNumber(activeResult.objectiveValue || 0)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
