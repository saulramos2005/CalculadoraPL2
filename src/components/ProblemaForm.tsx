import { motion } from "framer-motion";
import { Method } from "../data/types";
import { ProblemaLineal } from "../data/interfaces";

import ConfiguracionModelo from "./Formulario/ConfiguracionModelo";
import FuncionObjetivo from "./Formulario/FuncionObjetivo";
import Restricciones from "./Formulario/Restricciones";
import MetodoResolucion from "./Formulario/MetodoResolucion";
import EstadoSistema from "./Formulario/EstadoSistema";

interface ProblemFormProps {
  problem: ProblemaLineal;
  setProblem: React.Dispatch<React.SetStateAction<ProblemaLineal>>;
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
      const FuncionObjetivo = [...prev.FuncionObjetivo];
      FuncionObjetivo[index] = value as unknown as number;
      return { ...prev, FuncionObjetivo };
    });
  };

  const updateConstraintCoeff = (row: number, col: number, value: string) => {
    setProblem((prev) => {
      const desigualdades = prev.desigualdades.map((restriction, index) => {
        if (index !== row) return restriction;
        const coeficientes = [...restriction.coeficientes];
        coeficientes[col] = value as unknown as number;
        return { ...restriction, coeficientes };
      });
      return { ...prev, desigualdades };
    });
  };

  const setVariableCount = (value: number) => {
    setProblem((prev) => {
      const safe = Math.max(2, Math.min(6, value));
      const FuncionObjetivo = Array.from({ length: safe }, (_, i) => prev.FuncionObjetivo[i] ?? 0);
      const desigualdades = prev.desigualdades.map((restriction) => ({
        ...restriction,
        coeficientes: Array.from({ length: safe }, (_, i) => restriction.coeficientes[i] ?? 0),
      }));
      return { ...prev, numVariables: safe, FuncionObjetivo, desigualdades };
    });
  };

  const addConstraint = () => {
    setProblem((prev) => ({
      ...prev,
      desigualdades: [
        ...prev.desigualdades,
        { id: `R${prev.desigualdades.length + 1}`, coeficientes: Array(prev.numVariables).fill(0), operador: "<=", rhs: 0 },
      ],
    }));
  };

  const removeConstraint = (index: number) => {
    setProblem((prev) => ({
      ...prev,
      desigualdades: prev.desigualdades.filter((_, idx) => idx !== index),
    }));
  };

  const duplicateConstraint = (index: number) => {
    setProblem((prev) => {
      const desigualdades = [...prev.desigualdades];
      const toCopy = desigualdades[index];
      // Insertamos una copia profunda de la restricción justo debajo de la actual
      desigualdades.splice(index + 1, 0, {
        ...toCopy,
        id: `R${desigualdades.length + 1}`,
        coeficientes: [...toCopy.coeficientes],
      });
      return { ...prev, desigualdades };
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
        variableCount={problem.numVariables}
        setVariableCount={setVariableCount}
        optimize={problem.tipo_optimizacion}
        setOptimize={(val) => setProblem((prev) => ({ ...prev, tipo_optimizacion: val }))}
      />

      <FuncionObjetivo
        problem={problem}
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