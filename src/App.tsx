import { useEffect, useState } from "react";
import { Calculator, Eye, FileText, Wrench } from "lucide-react";
import { Method } from "./data/types";
import { ProblemaLineal } from "./data/interfaces";
import { STORAGE_KEY } from "./data/constants";
import { solveGraphical, solveSimplex, solveDualSimplex, solveTwoPhase } from "./utils/methodWrappers";
import { Header } from "./components/Header";
import { ProblemForm } from "./components/ProblemaForm";
import { SolucionDisplay } from "./components/SolucionDisplay";
import { problemaEjemplo } from "./data/problemaEjemplo";

const PROBLEM_STORAGE_KEY = "lp-problem-state";

type MobileTab = "problema" | "visual" | "analisis" | "sensibilidad";

export function App() {
  const [problem, setProblem] = useState<ProblemaLineal>(() => {
    const storedProblem = localStorage.getItem(PROBLEM_STORAGE_KEY);
    if (storedProblem) {
      try {
        const parsed = JSON.parse(storedProblem) as ProblemaLineal;
        if (parsed && parsed.numVariables > 0 && parsed.desigualdades?.length > 0) {
          return parsed;
        }
      } catch (e) { console.error("Error al parsear el problema guardado:", e); }
    }
    return problemaEjemplo;
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
  const [mobileTab, setMobileTab] = useState<MobileTab>("problema");

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
      FuncionObjetivo: problem.FuncionObjetivo,
      desigualdades: problem.desigualdades.map((c, i) => ({
        id: `R${i + 1}`,
        coeficientes: c.coeficientes,
        operador: c.operador as "<=" | ">=" | "=",
        rhs: c.rhs
      })),
      tipo_optimizacion: problem.tipo_optimizacion,
      numVariables: problem.numVariables
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
    setMobileTab("visual");
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-slate-700 dark:text-slate-100">
      <Header isDarkMode={isDarkMode} toggleTheme={() => setIsDarkMode(!isDarkMode)} />
      <main className="mx-auto flex flex-col w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        
        <div className="relative z-10 flex lg:hidden w-full gap-1 overflow-x-auto no-scrollbar mb-6">
          <button
            onClick={() => setMobileTab("problema")}
            className={`flex items-center gap-2 rounded-t-lg border border-b-white p-2 transition-colors ${
              mobileTab === "problema" 
                ? "bg-white text-cyan-600 border-slate-200 dark:border-slate-800 dark:border-b-slate-950 dark:bg-slate-950 dark:text-cyan-300" 
                : "bg-slate-50 text-slate-500 border-transparent dark:bg-slate-900 dark:text-slate-400"
            }`}
          >
            <Calculator size={18} />
            <span className="text-sm whitespace-nowrap">Problema</span>
          </button>
          <button
            onClick={() => setMobileTab("visual")}
            className={`flex items-center gap-2 rounded-t-lg border border-b-white p-2 transition-colors ${
              mobileTab === "visual" 
                ? "bg-white text-cyan-600 border-slate-200 dark:border-slate-800 dark:border-b-slate-950 dark:bg-slate-950 dark:text-cyan-300" 
                : "bg-slate-50 text-slate-500 border-transparent dark:bg-slate-900 dark:text-slate-400"
            }`}
          >
            <Eye size={18} />
            <span className="text-sm whitespace-nowrap">Visual</span>
          </button>
          <button
            onClick={() => setMobileTab("analisis")}
            className={`flex items-center gap-2 rounded-t-lg border border-b-white p-2 transition-colors ${
              mobileTab === "analisis" 
                ? "bg-white text-cyan-600 border-slate-200 dark:border-slate-800 dark:border-b-slate-950 dark:bg-slate-950 dark:text-cyan-300" 
                : "bg-slate-50 text-slate-500 border-transparent dark:bg-slate-900 dark:text-slate-400"
            }`}
          >
            <FileText size={18} />
            <span className="text-sm whitespace-nowrap">Análisis</span>
          </button>
        </div>

        <div className="relative w-full flex flex-col lg:grid lg:grid-cols-[1.1fr_1fr] gap-8 items-start">
          <div
            className={`w-full transition-all duration-300 ease-in-out lg:relative lg:opacity-100 lg:translate-x-0 lg:flex lg:pointer-events-auto lg:visible ${
              mobileTab === "problema"
                ? "relative opacity-100 translate-x-0 z-10 pointer-events-auto visible"
                : "absolute top-0 left-0 opacity-0 -translate-x-8 z-0 pointer-events-none invisible"
            }`}
          >
            <ProblemForm
              className="w-full flex"
              problem={problem}
              setProblem={setProblem}
              method={method}
              setMethod={setMethod}
              solveProblem={solveProblem}
              feedback={feedback}
            />
          </div>

          <div
            className={`w-full transition-all duration-300 ease-in-out lg:relative lg:opacity-100 lg:translate-x-0 lg:flex lg:pointer-events-auto lg:visible ${
              mobileTab !== "problema"
                ? "relative opacity-100 translate-x-0 z-10 pointer-events-auto visible"
                : "absolute top-0 left-0 opacity-0 translate-x-8 z-0 pointer-events-none invisible"
            }`}
          >
            <SolucionDisplay
              className="w-full flex"
              activeTabOverride={mobileTab !== "problema" ? (mobileTab as any) : "visual"}
              onTabChange={(tab) => setMobileTab(tab as MobileTab)}
              method={method}
              activeResult={activeResult}
              problem={problem}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
