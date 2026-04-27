import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";

interface Props {
  observaciones?: string[];
}

export default function EstadoInfactible({ observaciones = [] }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center text-center rounded-md dark:bg-red-950/20"
    >
      <div className="rounded-full bg-red-100 p-4 mb-4 dark:bg-red-900/50">
        <AlertTriangle className="size-8 text-red-600 dark:text-red-400" />
      </div>
      <h3 className="mb-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
        Problema Infactible
      </h3>
      <p className="mb-2 text-slate-600 dark:text-slate-300">
        Revise el modelo del problema y las siguientes observaciones:
      </p>
      {observaciones.length > 0 && (
        <div className="bg-red-100 border border-red-200 text-slate-900 dark:bg-red-900/40 dark:border-red-800 dark:text-red-300 p-4 rounded-md text-sm text-left max-w-md w-full">
          <ul className="list-disc pl-4 space-y-1">
            {observaciones.map((obs, i) => (
              <li key={i}>{obs}</li>
            ))}
          </ul>
        </div>
      )}
    </motion.div>
  );
}