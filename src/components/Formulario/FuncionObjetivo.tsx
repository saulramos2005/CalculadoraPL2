import { ProblemaLineal } from "@/data/interfaces";

interface FuncionObjetivoProps {
  problem: ProblemaLineal;
  updateObjectiveCoeff: (index: number, value: string) => void;
}

export default function FuncionObjetivo({ problem, updateObjectiveCoeff }: FuncionObjetivoProps) {
  return (
    <div className="space-y-2">
      <p className="text-sm text-slate-700 dark:text-slate-300">Función objetivo</p>
      <div className="flex flex-wrap items-center gap-2">
        {(problem.FuncionObjetivo || []).map((value, index) => (
          <div key={`obj-${index}`} className="flex items-center gap-2">
            <input
              value={value}
              onChange={(event) => updateObjectiveCoeff(index, event.target.value)}
              className="w-20 rounded-lg border border-slate-300 bg-slate-50 px-2 py-1.5 text-sm outline-none transition focus:border-cyan-500 dark:border-slate-700 dark:bg-slate-950 dark:focus:border-cyan-400"
              aria-label={`Coeficiente x${index + 1}`}
            />
            <span className="text-sm text-slate-800 dark:text-slate-200">x{index + 1}</span>
            {index < problem.numVariables - 1 && <span className="text-slate-500 dark:text-slate-400">+</span>}
          </div>
        ))}
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400">Formato válido: 4, 3.25, -2/5</p>
    </div>
  );
}