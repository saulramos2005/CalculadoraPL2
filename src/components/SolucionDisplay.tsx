import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Eye, FileText, Wrench } from "lucide-react";
import { Method } from "@/data/types";
import { ProblemaLineal, SolucionGrafica, SolucionSimplex } from "@/data/interfaces";

import HeaderResultados from "./Solucion/Header";
import ResumenSolucion from "./Solucion/Resumen";
import GraficaSolucion from "./grafica/Grafica";
import TablaAnalisis from "./Solucion/TablaAnalisis";
import TablaIteraciones from "./Solucion/TablaIteraciones";
import ObservacionesSolucion from "./Solucion/Observaciones";
import EstadoInfactible from "./Solucion/EstadoInfactible";
import EstadoVacio from "./Solucion/EstadoVacio";
import { TablaVertices } from "./grafica/TablaVertices";

import { 
  tooltipClass,
  tabBaseClass,
  tabActiveClass,
  tabInactiveClass,
  tabDisabledClass,

} from "@/data/styles";

interface SolucionDisplayProps {
  method: Method;
  activeResult: SolucionGrafica | SolucionSimplex | null;
  problem: ProblemaLineal;
  className?: string;
  activeTabOverride?: Tab;
  onTabChange?: (tab: Tab) => void;
}

type Tab = "visual" | "analisis" | "sensibilidad";

export function SolucionDisplay({ 
  method, 
  activeResult, 
  problem,
  className = "",
  activeTabOverride,
  onTabChange
}: SolucionDisplayProps) {
  const [internalTab, setInternalTab] = useState<Tab>("visual");
  const activeTab = activeTabOverride || internalTab;

  const handleTabChange = (tab: Tab) => {
    setInternalTab(tab);
    if (onTabChange) onTabChange(tab);
  };

  const isAnalisisDisabled = activeResult ? !activeResult.analysis.factible : false;

  return (
    <motion.section
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className={`flex flex-col ${className}`}
    >
        <div className="relative z-10 -mb-px hidden lg:flex gap-1 pl-4" aria-label="Tabs">
          <button
            onClick={() => handleTabChange("visual")}
            className={`${tabBaseClass} ${activeTab === 'visual' ? tabActiveClass : tabInactiveClass}`}
            aria-label="Representación Visual"
          >
            <Eye size={18} />
            <span className={tooltipClass}>Representación Visual</span>
          </button>
          <button
            onClick={() => handleTabChange("analisis")}
            disabled={isAnalisisDisabled}
            className={`${tabBaseClass} ${isAnalisisDisabled ? tabDisabledClass : activeTab === 'analisis' ? tabActiveClass : tabInactiveClass}`}
            aria-label="Análisis"
          >
            <FileText size={18} />
            <span className={tooltipClass}>{isAnalisisDisabled ? "No disponible (Infactible)" : "Resumen Analítico"}</span>
          </button>
          <button
            disabled
            className={`${tabBaseClass} ${tabDisabledClass}`}
            aria-label="Análisis de Sensibilidad (Próximamente)"
          >
            <Wrench size={18} />
            <span className={tooltipClass}>Sensibilidad (Próximamente)</span>
          </button>
        </div>

      <div className="relative z-0 space-y-3 rounded-xl border-0 lg:border border-slate-200 bg-white p-2 lg:p-3 lg:shadow-sm transition-colors duration-300 dark:border-slate-800 dark:bg-slate-950">
        <HeaderResultados method={method} activeResult={activeResult} problem={problem} activeTab={activeTab} />

      <AnimatePresence mode="wait">
        {!activeResult ? (
          <EstadoVacio />
        ) : (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="pt-2"
          >
            <div className={`space-y-4 ${activeTab === 'visual' ? 'block' : 'hidden'}`}>
              {!activeResult.analysis.factible ? (
                <>
                  <EstadoInfactible observaciones={activeResult.analysis.observaciones} />
                  {method !== "grafico" && (activeResult as SolucionSimplex).tablas?.length > 0 && (
                    <div className="mt-6 border-t border-slate-200 dark:border-slate-800">
                      <p className="text-slate-600 dark:text-slate-300 mx-2 my-4">
                        A continuacion se muestra el desarrollo del método hasta el punto donde se detectó la infactibilidad, para ayudar a identificar posibles causas.
                      </p>
                      <TablaIteraciones activeResult={activeResult} problem={problem} />
                    </div>
                  )}
                </>
              ) : method === "grafico" ? (
                <GraficaSolucion
                  solucion={activeResult as SolucionGrafica}
                  FuncionObjetivo={problem.FuncionObjetivo}
                  tipo_optimizacion={problem.tipo_optimizacion}
                />
              ) : (
                <TablaIteraciones activeResult={activeResult} problem={problem} />
              )}
            </div>

            <div className={`space-y-4 ${activeTab === 'analisis' ? 'block' : 'hidden'}`}>
              {!activeResult.analysis.factible ? (
                <EstadoInfactible observaciones={activeResult.analysis.observaciones} />
              ) : (
                <>
                  {method === "grafico" ? (
                    <>
                      <ResumenSolucion activeResult={activeResult} />
                      <TablaVertices solucion={activeResult as SolucionGrafica} />
                    </>
                  ) : (
                    <TablaAnalisis activeResult={activeResult} />
                  )}
                  <ObservacionesSolucion activeResult={activeResult} />
                </>
              )}
            </div>

            <div className={activeTab === 'sensibilidad' ? 'block' : 'hidden'}>
              <div className="rounded-lg border border-dashed border-slate-300 p-4 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
                <p className="font-semibold">En construcción</p>
                <p>Esta sección permitirá realizar análisis de sensibilidad sobre los resultados obtenidos.</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </motion.section>
  );
}