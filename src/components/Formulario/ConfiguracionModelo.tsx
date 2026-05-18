import { useState, useEffect } from "react";
import { OptType } from "@/data/types";

interface ConfiguracionModeloProps {
  variableCount: number;
  setVariableCount: (value: number) => void;
  optimize: OptType;
  setOptimize: (val: OptType) => void;
}

export default function ConfiguracionModelo({ variableCount, setVariableCount, optimize, setOptimize }: ConfiguracionModeloProps) {
  const [localCount, setLocalCount] = useState<string | number>(variableCount);

  useEffect(() => {
    setLocalCount(variableCount);
  }, [variableCount]);

  const handleCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocalCount(val);
    const num = parseInt(val, 10);
    if (!isNaN(num) && num >= 2 && num <= 6) {
      setVariableCount(num);
    }
  };

  const handleCountBlur = () => {
    let num = parseInt(String(localCount), 10);
    if (isNaN(num) || num < 2) num = 2;
    if (num > 6) num = 6;
    setLocalCount(num);
    setVariableCount(num);
  };

  return (
    <div className="grid gap-3 grid-cols-2">
      <div className="text-sm">
        <p className="text-slate-700 dark:text-slate-300">Variables de decisión</p>
        <input
          type="number"
          min={2}
          max={6}
          value={localCount}
          onChange={handleCountChange}
          onBlur={handleCountBlur}
          className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 outline-none transition focus:border-cyan-500 dark:border-slate-700 dark:bg-slate-950 dark:focus:border-cyan-400"
        />
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
          Valores entre 2 y 6
        </p>
      </div>
      <div className=" text-sm">
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