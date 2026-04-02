import { ProblemaLineal, SolucionGrafica, SolucionSimplex } from "@/data/interfaces";
import { resolverMetodoGrafico } from "./MetodoGrafico";
import { resolverMetodoSimplex } from "./MetodoSimplex";
import { resolverMetodoDualSimplex } from "./MetodoDualSimplex";
import { resolverMetodoDosFases } from "./MetodoDosFases";

export function solveGraphical(problem: ProblemaLineal): SolucionGrafica {
  return resolverMetodoGrafico(problem.FuncionObjetivo, problem.desigualdades, problem.tipo_optimizacion);
}

export function solveSimplex(problem: ProblemaLineal): SolucionSimplex {
  return resolverMetodoSimplex(problem.FuncionObjetivo, problem.desigualdades, problem.tipo_optimizacion, problem.numVariables);
}

export function solveDualSimplex(problem: ProblemaLineal): SolucionSimplex {
  return resolverMetodoDualSimplex(problem.FuncionObjetivo, problem.desigualdades, problem.tipo_optimizacion, problem.numVariables);
}

export function solveTwoPhase(problem: ProblemaLineal): SolucionSimplex {
  return resolverMetodoDosFases(problem.FuncionObjetivo, problem.desigualdades, problem.tipo_optimizacion, problem.numVariables);
}