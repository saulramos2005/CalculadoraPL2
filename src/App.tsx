import { useEffect, useState } from "react";
import { Method } from "./data/types";
import { ProblemInput, ProblemaLineal } from "./data/interfaces";
import { STORAGE_KEY } from "./data/constants";
import { getInitialProblem } from "./utiles/input";
import { parseNumericValue } from "./utiles/numeros";
import { solveGraphical, solveSimplex, solveDualSimplex, solveTwoPhase } from "./utils/methodWrappers";
import { Header } from "./components/Header";
import { ProblemForm } from "./components/ProblemaForm";
import { SolucionDisplay } from "./components/SolucionDisplay";

const PROBLEM_STORAGE_KEY = "lp-problem-state";

export function App() {
  const [problem, setProblem] = useState<ProblemInput>(() => {
    const storedProblem = localStorage.getItem(PROBLEM_STORAGE_KEY);
    if (storedProblem) return JSON.parse(storedProblem) as ProblemInput;
    return getInitialProblem();
  });
  const [method, setMethod] = useState<Method>(() => {
    const storedMethod = localStorage.getItem("lp-method");
    if (!storedMethod) return "grafico" as Method;
    return storedMethod as Method;
  });
  const [resultsByMethod, setResultsByMethod] = useState<Record<Method, any | null>>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return { grafico: null, simplex: null, dualSimplex: null, dosFases: null };
    const parsed = JSON.parse(stored) as { resultsByMethod: Record<Method, any | null> };
    return parsed.resultsByMethod;
  });
  const [feedback, setFeedback] = useState<string>(() => {
    return localStorage.getItem("lp-feedback") || "";
  });
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const storedTheme = localStorage.getItem("theme");
    if (storedTheme) return storedTheme === "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ resultsByMethod }));
  }, [resultsByMethod]);

  useEffect(() => {
    localStorage.setItem(PROBLEM_STORAGE_KEY, JSON.stringify(problem));
  }, [problem]);

  useEffect(() => {
    localStorage.setItem("lp-method", method);
  }, [method]);

  useEffect(() => {
    localStorage.setItem("lp-feedback", feedback);
  }, [feedback]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode);
    localStorage.setItem("theme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  const activeResult = resultsByMethod[method];

  const solveProblem = () => {
    const problemaLineal: ProblemaLineal = {
      FuncionObjetivo: problem.objective.map(parseNumericValue),
      desigualdades: problem.constraints.map((c, i) => ({
        id: `R${i + 1}`,
        coeficientes: c.coeffs.map(parseNumericValue),
        operador: c.operator as "<=" | ">=" | "=",
        rhs: parseNumericValue(c.rhs)
      })),
      tipo_optimizacion: problem.optimize,
      numVariables: problem.variableCount
    };

    let result: any;
    if (method === "grafico") result = solveGraphical(problemaLineal);
    else if (method === "simplex") result = solveSimplex(problemaLineal);
    else if (method === "dualSimplex") result = solveDualSimplex(problemaLineal);
    else result = solveTwoPhase(problemaLineal);

    setResultsByMethod((prev) => ({ ...prev, [method]: result }));
    
    let feedbackMsg = "";
    if (result.es_infactible) feedbackMsg = "El problema es infactible";
    else if (result.es_indefinida) feedbackMsg = "El problema es no acotado";
    else feedbackMsg = `Solución óptima encontrada: ${result.ValorOptimo}`;
    
    setFeedback(feedbackMsg);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-slate-700 dark:text-slate-100">
      <Header isDarkMode={isDarkMode} toggleTheme={() => setIsDarkMode(!isDarkMode)} />
      <main className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-6 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:px-8">
        <ProblemForm
          problem={problem}
          setProblem={setProblem}
          method={method}
          setMethod={setMethod}
          solveProblem={solveProblem}
          feedback={feedback}
        />
        <SolucionDisplay method={method} activeResult={activeResult} problem={problem} />
      </main>
    </div>
  );
}
