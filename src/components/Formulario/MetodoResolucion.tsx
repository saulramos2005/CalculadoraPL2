import { Method } from "@/data/types";
import { methodLabels } from "@/data/constants";

interface MetodoResolucionProps {
  method: Method;
  setMethod: (method: Method) => void;
  solveProblem: () => void;
}

export default function MetodoResolucion({ method, setMethod, solveProblem }: MetodoResolucionProps) {
  return (
    <div className="space-y-2">
      <p className="text-sm text-slate-700 dark:text-slate-300">Método de resolución</p>

      <div className="flex gap-2 text-sm">
        <select
          value={method}
          onChange={(event) => setMethod(event.target.value as Method)}
          className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 outline-none transition focus:border-cyan-500 dark:border-slate-700 dark:bg-slate-950 dark:focus:border-cyan-400"
        >
          {Object.entries(methodLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={solveProblem}
          className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-500 dark:bg-cyan-500 dark:text-slate-950 dark:hover:bg-cyan-400"
        >
          Resolver
        </button>
      </div>
    </div>
  );
}