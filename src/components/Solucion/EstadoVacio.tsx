import { motion } from "framer-motion";

export default function EstadoVacio() {
  return (
    <motion.p
      key="empty"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="rounded-lg border border-dashed border-slate-300 p-4 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400"
    >
      No hay resultados guardados para este método todavía. Ejecuta "Resolver" para calcular y almacenar.
    </motion.p>
  );
}