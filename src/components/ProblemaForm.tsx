import { motion } from "framer-motion";
import { Method } from "../data/types";
import { ProblemInput } from "../data/interfaces";

import ConfiguracionModelo from "./Formulario/ConfiguracionModelo";
import FuncionObjetivo from "./Formulario/FuncionObjetivo";
import Restricciones from "./Formulario/Restricciones";
import MetodoResolucion from "./Formulario/MetodoResolucion";
import EstadoSistema from "./Formulario/EstadoSistema";

interface ProblemFormProps {
  problem: ProblemInput;
  setProblem: React.Dispatch<React.SetStateAction<ProblemInput>>;
  method: Method;
  setMethod: (method: Method) => void;
  solveProblem: () => void;
  feedback: string;
}

export function ProblemForm({
  problem,
  setProblem,
  method,
  setMethod,
  solveProblem,
  feedback,
}: ProblemFormProps) {
  const updateObjectiveCoeff = (index: number, value: string) => {
    setProblem((prev) => {
      const objective = [...prev.objective];
      objective[index] = value;
      return { ...prev, objective };
    });
  };

  const updateConstraintCoeff = (row: number, col: number, value: string) => {
    setProblem((prev) => {
      const constraints = prev.constraints.map((restriction, index) => {
        if (index !== row) return restriction;
        const coeffs = [...restriction.coeffs];
        coeffs[col] = value;
        return { ...restriction, coeffs };
      });
      return { ...prev, constraints };
    });
  };

  const setVariableCount = (value: number) => {
    setProblem((prev) => {
      const safe = Math.max(2, Math.min(6, value));
      const objective = Array.from({ length: safe }, (_, i) => prev.objective[i] ?? "0");
      const constraints = prev.constraints.map((restriction) => ({
        ...restriction,
        coeffs: Array.from({ length: safe }, (_, i) => restriction.coeffs[i] ?? "0"),
      }));
      return { ...prev, variableCount: safe, objective, constraints };
    });
  };

  const addConstraint = () => {
    setProblem((prev) => ({
      ...prev,
      constraints: [
        ...prev.constraints,
        { coeffs: Array(prev.variableCount).fill("0"), operator: "<=", rhs: "0" },
      ],
    }));
  };

  const removeConstraint = (index: number) => {
    setProblem((prev) => ({
      ...prev,
      constraints: prev.constraints.filter((_, idx) => idx !== index),
    }));
  };

  const duplicateConstraint = (index: number) => {
    setProblem((prev) => {
      const constraints = [...prev.constraints];
      const toCopy = constraints[index];
      // Insertamos una copia profunda de la restricción justo debajo de la actual
      constraints.splice(index + 1, 0, {
        ...toCopy,
        coeffs: [...toCopy.coeffs],
      });
      return { ...prev, constraints };
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="relative self-start"
    >
      {/* Capa de fondo con la imagen */}
      <div
        className="pointer-events-none absolute inset-0 z-0 bg-[url(/star.png)] bg-auto bg-center bg-no-repeat opacity-20 transition-opacity duration-300 dark:opacity-100"
        aria-hidden="true"
      />
      <section className="relative z-10 space-y-5 rounded-xl border border-slate-200 bg-white/60 p-4 transition-colors duration-300 sm:p-5 dark:border-slate-800 dark:bg-slate-900/60">
        <h2 className="text-lg font-medium">Modelo del problema</h2>

      <ConfiguracionModelo
        variableCount={problem.variableCount}
        setVariableCount={setVariableCount}
        optimize={problem.optimize}
        setOptimize={(val) => setProblem((prev) => ({ ...prev, optimize: val }))}
      />

      <FuncionObjetivo
        objective={problem.objective}
        variableCount={problem.variableCount}
        updateObjectiveCoeff={updateObjectiveCoeff}
      />

      <Restricciones
        problem={problem}
        setProblem={setProblem}
        updateConstraintCoeff={updateConstraintCoeff}
        addConstraint={addConstraint}
        removeConstraint={removeConstraint}
        duplicateConstraint={duplicateConstraint}
      />

      <MetodoResolucion method={method} setMethod={setMethod} solveProblem={solveProblem} />

      <EstadoSistema feedback={feedback} />
      </section>
    </motion.div>
  );
}