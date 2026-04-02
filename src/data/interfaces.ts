import { Method, OptType as Optimizacion, Operator, SolveStatus} from "./types";

export interface ConstraintInput {
  coeffs: string[];
  operator: Operator;
  rhs: string;
}

export interface ProblemInput {
  variableCount: number;
  objective: string[];
  optimize: Optimizacion;
  constraints: ConstraintInput[];
}

export interface IterationStep {
  iteration: number;
  pivot: string;
  headers: string[];
  tableau: number[][];
}

export interface Analysis {
  tipoSolucion: string;
  degeneracion: boolean;
  factible: boolean;
  acotada: boolean;
  observaciones: string[];
}

export interface MethodResult {
  method: Method;
  status: SolveStatus;
  message: string;
  objectiveValue: number | null;
  solution: number[];
  iterations: IterationStep[];
  headers: string[];
  finalTableau: number[][];
  analysis: Analysis;
  generatedAt: string;
  graphPoints?: Array<{ x: number; y: number }>;
  feasibleRegion?: Array<{ x: number; y: number }>;
  graficaResult?: SolucionGrafica;
  simplexResult?: SolucionSimplex;
  FuncionObjetivo?: number[];
  tipo_optimizacion?: Optimizacion;
}

export interface Variable {
  nombre: string;
  coeficiente: number;
}

export interface Punto {
  x: number;
  y: number;
  label?: string;
}

export interface Vertice extends Punto {
  valor: number;
  es_fuga: boolean;
  label: string;
}

export interface Desigualdad {
  id: string;
  coeficientes: number[];
  operador: "<=" | ">=" | "=";
  rhs: number;
}

export interface ProblemaLineal {
  FuncionObjetivo: number[];
  desigualdades: Desigualdad[];
  tipo_optimizacion: Optimizacion;
  numVariables: number;
}

export interface Solucion {
  ValorOptimo: number;
  variables?: { [key: string]: number };
  es_indefinida: boolean;
  es_infactible: boolean;
  es_degenerada: boolean;
  tipo_solucion: string;
}

export interface SolucionSimplex extends Solucion{
  tablas: TablaSimplex[];
}

export interface SolucionGrafica extends Solucion{
  RegionFactible: Punto[];
  Vertices: Vertice[];
  VerticeOptimo: Vertice;
  Lineas_de_restriccion: {
    id: string;
    puntos: Punto[];
    label: string;
  }[];
  LineaObjetivo: Punto[];
}

export interface TablaSimplex {
  iteracion: number;
  basicas: string[];
  matriz: number[][];
  encabezados: string[];
  filaPivote?: number;
  columnaPivote?: number;
  es_optima: boolean;
  es_infactible?: boolean;
}