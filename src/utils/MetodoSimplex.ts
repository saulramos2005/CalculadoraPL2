import { Desigualdad, SolucionSimplex } from "../data/interfaces";
import { OptType as Optimizacion } from "../data/types";
import { ejecutarIteracionesSimplex } from "./ejecutarIteraciones";

const EPSILON = 1e-10;

export function resolverMetodoSimplex(
  FuncionObjetivo: number[],
  restricciones: Desigualdad[],
  tipo_optimizacion: Optimizacion,
  numVariables: number,
): SolucionSimplex {
  
  const tieneOperadorInvalido = restricciones.some(r => {
    const op = String(r.operador).trim().replace('≤', '<=').replace('≥', '>=');
    return op !== "<=";
  });

  if (tieneOperadorInvalido) {
    return {
      method: "simplex",
      tablas: [],
      ValorOptimo: 0,
      variables: {},
      analysis: {
        observaciones: ["El método Simplex básico implementado solo acepta restricciones de tipo menor o igual (≤)."],
        acotada: false,
        factible: false,
        degeneracion: false,
        tipo_solucion: "Infactible"
      }
    };
  }

  const Funcion_Obj =
    tipo_optimizacion === "min"
      ? FuncionObjetivo.map((c) => -Number(c))
      : FuncionObjetivo.map((c) => Number(c));

  // Construir tabla inicial
  const num_var_artificiales = restricciones.length;
  let matriz: number[][] = [];
  
  restricciones.forEach((r, i) => {
    const fila: number[] = r.coeficientes.map(Number);

    for (let j = 0; j < num_var_artificiales; j++) {
      fila.push(j === i ? 1 : 0);
    }

    fila.push(Number(r.rhs));
    matriz.push(fila);
  });

  // Fila Z
  const fila_obj: number[] = Funcion_Obj.map((c) => -c);
  for (let i = 0; i < num_var_artificiales; i++) {
    fila_obj.push(0);
  }
  fila_obj.push(0);
  matriz.push(fila_obj);

  let basicas: string[] = [];
  for (let i = 0; i < num_var_artificiales; i++) {
    basicas.push(`s${i + 1}`);
  }

  const encabezados = [
    ...Array.from({ length: numVariables }, (_, i) => `x${i + 1}`),
    ...Array.from({ length: restricciones.length }, (_, i) => `s${i + 1}`),
    "Sol",
  ];

  const resultado = ejecutarIteracionesSimplex(matriz, basicas, encabezados, 0);
  const tablas = resultado.tablas;

  if (resultado.es_indefinida) {
    return {
      method: "simplex",
      tablas,
      ValorOptimo: 0,
      variables: {},
      analysis: {
        observaciones: ["La función objetivo es no acotada en la región factible."],
        acotada: false,
        factible: false,
        degeneracion: false,
        tipo_solucion: "Infactible"
      }
    };
  }

  const variables: { [key: string]: number } = {};
  const matrizFinal = resultado.matriz; // Usar la matriz después de iterar

  resultado.basicas.forEach((nombreVar, i) => {
    const valor = matrizFinal[i][encabezados.length - 1];

    if (valor > EPSILON) {
      variables[nombreVar] = valor;
    }
  });

  const optimalValue =
    tipo_optimizacion === "min"
      ? -matrizFinal[matrizFinal.length - 1][matrizFinal[0].length - 1]
      : matrizFinal[matrizFinal.length - 1][matrizFinal[0].length - 1];

  // Detección de Degeneración (Variable básica en cero)
  const esDegenerada = resultado.basicas.some(
    (_, i) => Math.abs(matrizFinal[i][matrizFinal[0].length - 1]) < EPSILON,
  );

  // Detección de Soluciones Múltiples (Variable no básica con Cj-Zj = 0 en fila óptima)
  let tieneSolucionesMultiples = false;
  const filaZFinal = matrizFinal[matrizFinal.length - 1];
  for (let j = 0; j < matrizFinal[0].length - 1; j++) {
    const nombreVar = encabezados[j];
    if (!resultado.basicas.includes(nombreVar)) {
      if (Math.abs(filaZFinal[j]) < EPSILON) {
        tieneSolucionesMultiples = true;
        break;
      }
    }
  }

  return {
    method: "simplex",
    tablas,
    ValorOptimo: optimalValue,
    variables,
    analysis: {
      observaciones: [],
      acotada: true,
      factible: true,
      degeneracion: esDegenerada,
      tipo_solucion: tieneSolucionesMultiples ? "Multiple" : "Unica"
    }
  };
}