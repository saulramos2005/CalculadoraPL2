import { OptType } from "@/data/types";

interface ConfiguracionModeloProps {
  variableCount: number;
  setVariableCount: (value: number) => void;
  optimize: OptType;
  setOptimize: (val: OptType) => void;
}

export default function ConfiguracionModelo({ variableCount, setVariableCount, optimize, setOptimize }: ConfiguracionModeloProps) {
  return (
    <div className="grid gap-3 grid-cols-2">
      <div className="space-y-2 text-sm">
        <p className="text-slate-700 dark:text-slate-300">Variables de decisión (2-6)</p>
        <input
          type="number"
          min={2}
          max={6}
          value={variableCount}
          onChange={(event) => setVariableCount(Number(event.target.value))}
          className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 outline-none transition focus:border-cyan-500 dark:border-slate-700 dark:bg-slate-950 dark:focus:border-cyan-400"
        />
      </div>
      <div className="space-y-1 text-sm">
        <p className="text-slate-700 dark:text-slate-300">Tipo de optimización</p>
        <select
          value={optimize}
          onChange={(event) => setOptimize(event.target.value as OptType)}
          className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 outline-none transition focus:border-cyan-500 dark:border-slate-700 dark:bg-slate-950 dark:focus:border-cyan-400"
        >
          <option value="max">Maximizar</option>
          <option value="min">Minimizar</option>
        </select>
      </div>
    </div>
  );
}