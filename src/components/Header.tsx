import { motion } from "framer-motion";
import { Sun, Moon } from "lucide-react";

interface HeaderProps {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

export function Header({ isDarkMode, toggleTheme }: HeaderProps) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="border-b border-slate-200 transition-colors duration-300 dark:border-slate-800"
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col items-start justify-between gap-4 px-4 py-6 sm:flex-row sm:items-center sm:px-6 lg:px-8">
        <div className="flex flex-col gap-2">
          <p className="text-sm text-cyan-700 dark:text-cyan-300">Universidad de Oriente Núcleo Nueva Esparta</p>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-4xl">Calculadora de Programación Lineal</h1>
          <p className="max-w-2xl text-sm text-slate-600 sm:text-base dark:text-slate-100">
            Resuelve problemas con método gráfico, simplex, dual simplex y dos fases. Soporta enteros,
            decimales y fracciones en todos los coeficientes.
          </p>
        </div>
        <button
          onClick={toggleTheme}
          className="rounded-lg border border-slate-200 p-2 text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          aria-label="Alternar tema"
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>
    </motion.header>
  );
}