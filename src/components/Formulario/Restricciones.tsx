import { Plus, Copy, Trash } from "lucide-react";
import { ProblemaLineal, Desigualdad } from "@/data/interfaces";

interface RestriccionesProps {
  problem: ProblemaLineal;
  setProblem: React.Dispatch<React.SetStateAction<ProblemaLineal>>;
  updateConstraintCoeff: (row: number, col: number, value: string) => void;
  addConstraint: () => void;
  removeConstraint: (index: number) => void;
  duplicateConstraint: (index: number) => void;
}

export default function Restricciones({ problem, setProblem, updateConstraintCoeff, addConstraint, removeConstraint, duplicateConstraint }: RestriccionesProps) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-700 dark:text-slate-300">Restricciones</p>
        <button
          type="button"
          onClick={addConstraint}
          className="rounded-lg border border-cyan-600 px-3 py-1.5 text-xs font-medium text-cyan-700 transition hover:bg-cyan-50 dark:text-cyan-300 dark:hover:bg-cyan-600/10"
        >
          <span className="flex items-center gap-2">
            Agregar
            <Plus size={16} />
          </span>
        </button>
      </div>
      <div>
        {problem.desigualdades.map((restriction, rowIndex) => (
          <div key={`res-${rowIndex}`} className="space-y-2 rounded-lg border border-slate-200 p-3 transition-colors duration-300 dark:border-slate-800">
            <div className="flex flex-wrap items-center gap-2">
              {restriction.coeficientes.map((value, colIndex) => (
                <div key={`coef-${rowIndex}-${colIndex}`} className="flex items-center gap-1">
                  <input
                    value={value}
                    onChange={(event) => updateConstraintCoeff(rowIndex, colIndex, event.target.value)}
                    className="w-16 rounded-md border border-slate-300 bg-slate-50 px-2 py-1 text-sm outline-none transition focus:border-cyan-500 dark:border-slate-700 dark:bg-slate-950 dark:focus:border-cyan-400"
                  />
                  <span className="text-sm">x{colIndex + 1}</span>
                  {colIndex < problem.numVariables - 1 && <span className="text-slate-500 dark:text-slate-400">+</span>}
                </div>
              ))}
              <select
                value={restriction.operador}
                onChange={(event) =>
                  setProblem((prev) => ({
                    ...prev,
                    desigualdades: prev.desigualdades.map((item, idx) =>
                      idx === rowIndex ? { ...item, operador: event.target.value as Desigualdad["operador"] } : item,
                    ),
                  }))
                }
                className="rounded-md border border-slate-300 bg-slate-50 px-2 py-1 text-sm outline-none transition focus:border-cyan-500 dark:border-slate-700 dark:bg-slate-950 dark:focus:border-cyan-400"
              >
                <option value="<=">&lt;=</option>
                <option value=">=">&gt;=</option>
                <option value="=">=</option>
              </select>
              <input
                value={restriction.rhs}
                onChange={(event) =>
                  setProblem((prev) => ({
                    ...prev,
                    desigualdades: prev.desigualdades.map((item, idx) =>
                      idx === rowIndex ? { ...item, rhs: event.target.value as unknown as number } : item,
                    ),
                  }))
                }
                className="w-20 rounded-md border border-slate-300 bg-slate-50 px-2 py-1 text-sm outline-none transition focus:border-cyan-500 dark:border-slate-700 dark:bg-slate-950 dark:focus:border-cyan-400"
              />
              <button
                type="button"
                onClick={() => duplicateConstraint(rowIndex)}
                title="Duplicar restricción"
                className="px-2 py-1 text-xs text-cyan-600 transition hover:bg-cyan-50 disabled:cursor-not-allowed disabled:opacity-40 dark:text-cyan-400 dark:hover:bg-cyan-600/10"
              >
                <Copy size={16} />
              </button>

              <button
                type="button"
                onClick={() => removeConstraint(rowIndex)}
                disabled={problem.desigualdades.length <= 1}
                className="px-2 py-1 text-xs text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-40 dark:text-rose-400 dark:hover:bg-rose-600/10"
              >
                <Trash size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}