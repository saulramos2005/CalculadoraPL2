import { AnimatePresence, motion } from "framer-motion";
import { Method } from "@/data/types";
import { ProblemInput, MethodResult } from "@/data/interfaces";

import HeaderResultados from "./Solucion/Header";
import ResumenSolucion from "./Solucion/Resumen";
//import GraficaSolucion from "./Solucion/Grafica";
import GraficaSolucion from "./grafica/Grafica2";
import TablaAnalisis from "./Solucion/TablaAnalisis";
import TablaIteraciones from "./Solucion/TablaIteraciones";
import ObservacionesSolucion from "./Solucion/Observaciones";
import EstadoVacio from "./Solucion/EstadoVacio";

interface SolucionDisplayProps {
  method: Method;
  activeResult: MethodResult | null;
  problem: ProblemInput;
}

export function SolucionDisplay({ method, activeResult, problem }: SolucionDisplayProps) {


  return (
    <motion.section
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="space-y-4 rounded-xl border border-slate-200 bg-white/60 p-4 transition-colors duration-300 sm:p-5 dark:border-slate-800 dark:bg-slate-900/60"
    >
      <HeaderResultados method={method} activeResult={activeResult} problem={problem} />

      <AnimatePresence mode="wait">
        {activeResult ? (
          <motion.div
            key={activeResult.generatedAt + method}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="space-y-4"
          >
            <ResumenSolucion activeResult={activeResult} />

            {method === "grafico" && activeResult.graficaResult && (
              <GraficaSolucion
                solucion={activeResult.graficaResult}
                FuncionObjetivo={activeResult.FuncionObjetivo || []}
                tipo_optimizacion={activeResult.tipo_optimizacion || "max"}
              />
            )}

            {/* <TablaAnalisis activeResult={activeResult} /> */}

            <TablaIteraciones activeResult={activeResult} problem={problem} />

            <ObservacionesSolucion activeResult={activeResult} />
          </motion.div>
        ) : (
          <EstadoVacio />
        )}
      </AnimatePresence>
    </motion.section>
  );
}