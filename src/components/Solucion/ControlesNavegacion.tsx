import { ChevronLeft, ChevronRight, SkipBack, SkipForward } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ControlesNavegacionProps {
  paso: number;
  totalPasos: number;
  navegar: React.Dispatch<React.SetStateAction<number>>;
}

export default function ControlesNavegacion({
  paso,
  totalPasos,
  navegar,
}: ControlesNavegacionProps) {
  if (totalPasos <= 0) return null; // No mostrar controles si solo hay 1 tabla

  return (
    <div className="flex justify-center mt-4 print:hidden">
      <div className="bg-white dark:bg-slate-900 p-2 px-4 rounded-md  border border-slate-200 dark:border-slate-800 flex items-center gap-2 transition-all">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navegar(0)}
            disabled={paso === 0}
            className="p-2 hover:bg-cyan-50 text-slate-600 dark:text-slate-400 hover:text-cyan-700 dark:hover:text-cyan-400 rounded-full disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            title="Inicio"
          >
            <SkipBack className="w-5 h-5" />
          </button>
          <button
            onClick={() => navegar((s: number) => Math.max(0, s - 1))}
            disabled={paso === 0}
            className="p-2 hover:bg-cyan-50 text-slate-600 dark:text-slate-400 hover:text-cyan-700 dark:hover:text-cyan-400 rounded-full disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            title="Anterior"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col items-center mx-4 overflow-hidden">
          {/* <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1">
            Iteración
          </span> */}
          <div className="flex items-center text-cyan-600 dark:text-cyan-400 font-mono font-bold text-xl leading-none">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={paso}
                initial={{ y: 15, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -15, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="inline-block text-center min-w-[1ch]"
              >
                {paso}
              </motion.span>
            </AnimatePresence>
            <span className="text-slate-400 text-base mx-1">/</span> {totalPasos}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navegar((s: number) => Math.min(totalPasos, s + 1))}
            disabled={paso === totalPasos}
            className="p-2 hover:bg-cyan-50 text-slate-600 dark:text-slate-400 hover:text-cyan-700 dark:hover:text-cyan-400 rounded-full disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            title="Siguiente"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          <button
            onClick={() => navegar(totalPasos)}
            disabled={paso === totalPasos}
            className="p-2 hover:bg-cyan-50 text-slate-600 dark:text-slate-400 hover:text-cyan-700 dark:hover:text-cyan-400 rounded-full disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            title="Final"
          >
            <SkipForward className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}