import { OptType as Optimizacion, Method } from "./types";

export type MethodResult = SolucionGrafica | SolucionSimplex;

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
  method: Method;
  ValorOptimo: number;
  variables?: { [key: string]: number };
  analysis:{
    observaciones: string[];
    acotada: boolean;
    factible: boolean;
    degeneracion: boolean;
    tipo_solucion: string;
  }
  
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