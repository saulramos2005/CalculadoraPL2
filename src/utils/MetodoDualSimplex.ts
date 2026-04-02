import { Desigualdad, SolucionSimplex, TablaSimplex } from "../data/interfaces";
import { OptType as Optimizacion } from "../data/types";
import { EPSILON ,ejecutarIteracionDual } from "./ejecutarIteraciones";

export function ejecutarIteracionesDualSimplex(
  tablaInicial: TablaSimplex,
  maxIteraciones = 50,
) {
  const tablas: TablaSimplex[] = [];
  let actual: TablaSimplex = {
    ...tablaInicial,
    matriz: tablaInicial.matriz.map((r) => [...r]),
    basicas: [...tablaInicial.basicas],
    encabezados: [...tablaInicial.encabezados],
    es_optima: false,
  };

  tablas.push({ ...actual, iteracion: 0 });

  for (let k = 0; k < maxIteraciones; k++) {
    const siguiente = ejecutarIteracionDual(actual);

    // Si no hubo cambio o es óptima
    if (siguiente.es_optima) {
      tablas.push({ ...siguiente, iteracion: tablas.length });
      return { tablas, es_infactible: false };
    }

    // Si es infactible, terminamos
    if (siguiente.es_infactible) {
      tablas.push({ ...siguiente, iteracion: tablas.length });
      return { tablas, es_infactible: true };
    }

    tablas.push({ ...siguiente, iteracion: tablas.length });
    actual = siguiente;
  }

  return { tablas, es_infactible: false };
}

export function resolverMetodoDualSimplex(
  FuncionObjetivo: number[],
  restricciones: Desigualdad[],
  tipo_optimizacion: Optimizacion,
  numVariables: number,
): SolucionSimplex {
  const Funcion_Obj =
    tipo_optimizacion === "min"
      ? FuncionObjetivo.map((c) => -c)
      : [...FuncionObjetivo];

  const num_var_artificiales = restricciones.length;
  let matriz: number[][] = [];

  restricciones.forEach((r) => {
    const fila: number[] = [...r.coeficientes];

    for (let j = 0; j < num_var_artificiales; j++) {
      fila.push(j === matriz.length ? 1 : 0);
    }

    fila.push(r.rhs);
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

  const resultado = ejecutarIteracionesDualSimplex(
    {
      iteracion: 0,
      basicas,
      matriz,
      encabezados,
      es_optima: false,
    },
    50,
  );

  const tablas = resultado.tablas;

  // Analisis de Solucion similar a simplex
  const variables: { [key: string]: number } = {};
  const final = tablas[tablas.length - 1];

  final.basicas.forEach((nombreVar, i) => {
    const valor = final.matriz[i][final.matriz[0].length - 1];
    if (valor > EPSILON) {
      variables[nombreVar] = valor;
    }
  });

  const optimalValue =
    tipo_optimizacion === "min"
      ? -final.matriz[final.matriz.length - 1][final.matriz[0].length - 1]
      : final.matriz[final.matriz.length - 1][final.matriz[0].length - 1];

  const esDegenerada = final.basicas.some(
    (_, i) => Math.abs(final.matriz[i][final.matriz[0].length - 1]) < EPSILON,
  );

  let tieneSolucionesMultiples = false;
  const filaZFinal = final.matriz[final.matriz.length - 1];
  for (let j = 0; j < final.matriz[0].length - 1; j++) {
    const nombreVar = final.encabezados[j];
    if (!final.basicas.includes(nombreVar)) {
      if (Math.abs(filaZFinal[j]) < EPSILON) {
        tieneSolucionesMultiples = true;
        break;
      }
    }
  }

  return {
    tablas,
    ValorOptimo: optimalValue,
    variables,
    es_indefinida: false,
    es_infactible: resultado.es_infactible,
    es_degenerada: esDegenerada,
    tipo_solucion: tieneSolucionesMultiples ? "Multiple" : "Unica",
  };
}
