import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ProblemaLineal, SolucionSimplex, TablaSimplex } from "@/data/interfaces";
import { CheckCircle, ChevronRight, Maximize2, Minimize2 } from "lucide-react";
import { convertir_a_Fraccion } from "@/utils/ConvertirNumeros";
import ControlesNavegacion from "./ControlesNavegacion";

interface Props {
  activeResult: SolucionSimplex | any;
  problem: ProblemaLineal;
}

export default function TablaIteraciones({ activeResult }: Props) {
  const [step, setStep] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);

  // Reiniciar el paso si cambia el resultado activo u ocurre un nuevo cálculo
  useEffect(() => {
    setStep(0);
    setIsExpanded(false);
  }, [activeResult]);

  // Ocultar el scroll del body cuando está expandido a pantalla completa
  useEffect(() => {
    if (isExpanded) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isExpanded]);

  if (!activeResult?.tablas || activeResult.tablas.length === 0) return null;

  const totalPasos = activeResult.tablas.length - 1;
  const currentTable = activeResult.tablas[step];

  // Guardamos los controles en una variable para usarlos de forma normal o en un portal
  const controls = <ControlesNavegacion paso={step} totalPasos={totalPasos} navegar={setStep} />;

  return (
    <div className="space-y-4">
      {/* Tabla Actual (Interactiva) */}
      <div className="print:hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <TablaIteracionItem 
              tabla={currentTable} 
              isExpanded={isExpanded} 
              onToggleExpand={() => setIsExpanded(!isExpanded)} 
            />
          </motion.div>
        </AnimatePresence>
        
        {isExpanded ? (
          createPortal(
            <div className="fixed bottom-6 left-0 right-0 z-[60] flex justify-center pointer-events-none">
              <div className="pointer-events-auto rounded-md shadow-2xl drop-shadow-2xl">
                {controls}
              </div>
            </div>,
            document.body
          )
        ) : (
          controls
        )}
      </div>

      {/* Vista de impresión: Mostrar todas las tablas juntas para el PDF */}
      <div className="hidden print:block space-y-6">
        {activeResult.tablas.map((tabla: TablaSimplex, idx: number) => (
          <div key={idx} className="break-inside-avoid">
            <TablaIteracionItem tabla={tabla} />
          </div>
        ))}
      </div>
    </div>
  );
}

function TablaIteracionItem({ 
  tabla, 
  isExpanded: controlledIsExpanded, 
  onToggleExpand 
}: { 
  tabla: TablaSimplex; 
  isExpanded?: boolean; 
  onToggleExpand?: () => void; 
}) {
  const [localIsExpanded, setLocalIsExpanded] = useState(false);
  const isExpanded = controlledIsExpanded !== undefined ? controlledIsExpanded : localIsExpanded;

  const handleToggle = () => {
    if (onToggleExpand) onToggleExpand();
    else setLocalIsExpanded(!localIsExpanded);
  };

  const content = (
    <div
      className={`transition-all duration-300 ${
        isExpanded
          ? "fixed inset-0 z-50 m-0 rounded-none h-full w-full overflow-y-auto p-4 sm:p-6 pb-32 bg-slate-50 dark:bg-slate-950"
          : "relative overflow-hidden rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900 sm:p-6"
      }`}
    >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2">
          <div className="flex items-center justify-between w-full sm:w-auto gap-3">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 whitespace-nowrap">
              {tabla.iteracion === 0
                ? "Tabla Inicial"
                : `Iteración ${tabla.iteracion}`}
            </h3>
            <button
              onClick={handleToggle}
              className="p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 rounded-full transition-colors sm:hidden print:hidden"
              title={isExpanded ? "Contraer vista" : "Expandir vista"}
            >
              {isExpanded ? (
                <Minimize2 className="w-5 h-5" />
              ) : (
                <Maximize2 className="w-5 h-5" />
              )}
            </button>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
            {tabla.es_optima && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 sm:text-sm">
                <CheckCircle className="w-4 h-4" />
                Solución Óptima
              </span>
            )}
            <button
              onClick={handleToggle}
              className="hidden sm:block p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors dark:text-slate-400 dark:hover:bg-slate-800 print:hidden"
              title={isExpanded ? "Contraer vista" : "Expandir vista"}
            >
              {isExpanded ? (
                <Minimize2 className="w-5 h-5" />
              ) : (
                <Maximize2 className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {tabla.columnaPivote !== undefined && tabla.filaPivote !== undefined && (
          <div className="mb-4 p-3 bg-cyan-50 border border-cyan-200 dark:bg-cyan-900/20 dark:border-cyan-800 rounded flex flex-col sm:flex-row items-start sm:items-center gap-2 text-sm">
            <div className="flex items-center gap-2 mb-1 sm:mb-0">
              <ChevronRight className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              <span className="font-bold text-cyan-900 dark:text-cyan-100">Pivotaje:</span>
            </div>
            <div className="text-cyan-900 dark:text-cyan-100 flex flex-wrap gap-x-3 gap-y-1">
              <span>
                Entra: <strong className="text-emerald-700 dark:text-emerald-400">{tabla.encabezados[tabla.columnaPivote]}</strong>
              </span>
              <span className="hidden sm:inline text-cyan-300 dark:text-cyan-800">|</span>
              <span>
                Sale: <strong className="text-rose-700 dark:text-rose-400">{tabla.basicas[tabla.filaPivote]}</strong>
              </span>
              <span className="hidden sm:inline text-cyan-300 dark:text-cyan-800">|</span>
              <span>
                Pivote:{" "}
                <strong className="text-yellow-600 dark:text-yellow-400">
                  {convertir_a_Fraccion(
                    tabla.matriz[tabla.filaPivote][tabla.columnaPivote],
                  )}
                </strong>
              </span>
            </div>
          </div>
        )}

        <div
          className={`overflow-x-auto -mx-3 sm:mx-0 pb-2 ${isExpanded ? "mx-0" : ""}`}
        >
          <div className="inline-block min-w-full align-middle px-3 sm:px-0">
            <table className="min-w-full border-collapse text-sm relative text-slate-700 dark:text-slate-300">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-800/80">
                  <th className="sticky left-0 z-20 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 px-3 py-2 text-left shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] dark:shadow-[2px_0_5px_-2px_rgba(0,0,0,0.5)]">
                    V.B.
                  </th>
                  {tabla.encabezados.map((header, colIdx) => (
                    <th
                      key={colIdx}
                      className={`border border-slate-300 dark:border-slate-700 px-3 py-2 whitespace-nowrap ${
                        tabla.columnaPivote === colIdx
                          ? "bg-emerald-200 dark:bg-emerald-900/50 text-emerald-900 dark:text-emerald-300"
                          : "bg-slate-100 dark:bg-slate-800/80"
                      }`}
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Fila Z */}
                <tr className="font-semibold bg-cyan-50 dark:bg-cyan-900/20 text-cyan-900 dark:text-cyan-100">
                  <td className="sticky left-0 z-10 bg-cyan-50 dark:bg-cyan-950 border border-slate-300 dark:border-slate-700 px-3 py-2 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] dark:shadow-[2px_0_5px_-2px_rgba(0,0,0,0.5)]">
                    Z
                  </td>
                  {tabla.matriz[tabla.matriz.length - 1].map((cell, colIdx) => (
                    <td
                      key={colIdx}
                      className={`border border-slate-300 dark:border-slate-700 px-3 py-2 text-right font-mono whitespace-nowrap ${
                        colIdx === tabla.matriz[0].length - 1
                          ? "bg-cyan-100 dark:bg-cyan-900/50 font-bold"
                          : tabla.columnaPivote === colIdx
                            ? "bg-emerald-50 dark:bg-emerald-900/20"
                            : "bg-cyan-50 dark:bg-cyan-900/20"
                      }`}
                    >
                      {convertir_a_Fraccion(cell)}
                    </td>
                  ))}
                </tr>
                {/* Filas restantes */}
                {tabla.matriz.slice(0, -1).map((row, rowIdx) => (
                  <tr key={rowIdx} className="bg-white dark:bg-slate-900">
                    <td
                      className={`sticky left-0 z-10 border border-slate-300 dark:border-slate-700 px-3 py-2 font-semibold shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] dark:shadow-[2px_0_5px_-2px_rgba(0,0,0,0.5)] ${
                        tabla.filaPivote === rowIdx
                          ? "bg-rose-200 dark:bg-rose-950 text-rose-900 dark:text-rose-200"
                          : "bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                      }`}
                    >
                      {tabla.basicas[rowIdx]}
                    </td>
                    {row.map((cell, colIdx) => (
                      <td
                        key={colIdx}
                        className={`border border-slate-300 dark:border-slate-700 px-3 py-2 text-right font-mono whitespace-nowrap ${
                          tabla.filaPivote === rowIdx &&
                          tabla.columnaPivote === colIdx
                            ? "bg-amber-300 dark:bg-amber-600/40 font-bold border-amber-500 dark:border-amber-500/50 text-amber-900 dark:text-amber-100"
                            : tabla.filaPivote === rowIdx
                              ? "bg-rose-50 dark:bg-rose-900/20 text-rose-900 dark:text-rose-100"
                              : tabla.columnaPivote === colIdx
                                ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-900 dark:text-emerald-100"
                                : ""
                        }`}
                      >
                        {convertir_a_Fraccion(cell)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {tabla.es_optima && (
          <div className="mt-2 px-2 py-1.5 bg-emerald-50 border border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800 rounded text-sm text-emerald-900 dark:text-emerald-300">
            Todos los coeficientes en la fila Z son ≥ 0. Se alcanzó
            la solución óptima.
          </div>
        )}
      </div>
  );

  return (
    <>
      {/* Placeholder para evitar saltos de layout cuando está expandido */}
      {isExpanded && <div className="h-96 w-full rounded-lg border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900" />}
      
      {isExpanded ? createPortal(content, document.body) : content}
    </>
  );
}