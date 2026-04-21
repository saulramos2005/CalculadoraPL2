import { Desigualdad, SolucionSimplex, TablaSimplex } from "../data/interfaces";
import { OptType as Optimizacion } from "../data/types";
import { EPSILON, ejecutarIteracionDual } from "./ejecutarIteraciones";

export function resolverMetodoDualSimplex(
  FuncionObjetivo: number[],
  restricciones: Desigualdad[],
  tipo_optimizacion: Optimizacion,
  numVariables: number,
): SolucionSimplex {
  const num_restricciones = restricciones.length;
  const esMax = tipo_optimizacion === "max";
  let matriz: number[][] = [];

  restricciones.forEach((r, idx) => {
    let fila = [...r.coeficientes];
    let rhs = r.rhs;

    
    if (r.operador === ">=") {
      fila = fila.map(c => (c === 0 ? 0 : -c));
      rhs = rhs === 0 ? 0 : -rhs;
    }

    
    for (let j = 0; j < num_restricciones; j++) {
      fila.push(j === idx ? 1 : 0);
    }
    fila.push(rhs);
    matriz.push(fila);
  });

  let fila_obj = [...FuncionObjetivo];

  if (esMax) {
    fila_obj = fila_obj.map(c => (c === 0 ? 0 : -c));
  }
  
  fila_obj = fila_obj.map(c => (c === 0 ? 0 : -c)); 

  for (let i = 0; i < num_restricciones; i++) fila_obj.push(0);
  fila_obj.push(0); 
  matriz.push(fila_obj);

  const basicas = Array.from({ length: num_restricciones }, (_, i) => `s${i + 1}`);
  const encabezados = [
    ...Array.from({ length: numVariables }, (_, i) => `x${i + 1}`),
    ...Array.from({ length: num_restricciones }, (_, i) => `s${i + 1}`),
    "Sol",
  ];

  const tablas: TablaSimplex[] = [];
  let actual: TablaSimplex = { 
    iteracion: 0, 
    basicas: [...basicas], 
    matriz: JSON.parse(JSON.stringify(matriz)), 
    encabezados, 
    es_optima: false 
  };
  tablas.push(actual);

  for (let k = 0; k < 50; k++) {
    const numCols = actual.matriz[0].length;
    const ultFilaIdx = actual.matriz.length - 1;
    
    let filaPivoteIdx = -1;
    let minRHS = -EPSILON;

    for (let i = 0; i < ultFilaIdx; i++) {
      const rhs = actual.matriz[i][numCols - 1];
      if (rhs < minRHS) {
        minRHS = rhs;
        filaPivoteIdx = i;
      }
    }

    if (filaPivoteIdx === -1) {
      actual.es_optima = true;
      break;
    }

    const filaPivote = actual.matriz[filaPivoteIdx];
    const coeficientesVariables = filaPivote.slice(0, numCols - 1);
    const esInfactible = coeficientesVariables.every(coef => coef >= -EPSILON);

    if (esInfactible) {
      actual.es_infactible = true;
      break; 
    }

    const siguiente = ejecutarIteracionDual(actual);
    tablas.push(siguiente);

    if (siguiente.es_infactible || siguiente.es_optima) break;
    actual = siguiente;
  }

  const final = tablas[tablas.length - 1];
  const variables: { [key: string]: number } = {};
  
  final.basicas.forEach((nombre, i) => {
    const valor = final.matriz[i][final.matriz[i].length - 1];
    variables[nombre] = Math.abs(valor) < EPSILON ? 0 : valor;
  });

  let valorZReal = 0;
  FuncionObjetivo.forEach((coef, i) => {
    const nombreVar = `x${i + 1}`;
    const valorVar = final.basicas.includes(nombreVar) 
      ? final.matriz[final.basicas.indexOf(nombreVar)][final.matriz[0].length - 1]
      : 0;
    valorZReal += coef * valorVar;
  });

  const ultFilaIdx = final.matriz.length - 1; 

  
  const tieneSolucionesMultiples = !final.es_infactible && 
    Array.from({ length: numVariables }).some((_, i) => {
      const nombreX = `x${i + 1}`;
      return !final.basicas.includes(nombreX) && Math.abs(final.matriz[ultFilaIdx][i]) < EPSILON;
    });
    
  return {
    method: "dualSimplex",
    tablas,
    ValorOptimo: Math.abs(valorZReal) < EPSILON ? 0 : valorZReal,
    variables,
    analysis: {
      observaciones: final.es_infactible ? ["El problema es infactible"] : [],
      acotada: true,
      tipo_solucion: final.es_infactible ? "Sin Solucion" : (tieneSolucionesMultiples ? "Multiple" : "Unica"),
      factible: !final.es_infactible,
      degeneracion: final.basicas.some((_, i) => 
        Math.abs(final.matriz[i][final.matriz[0].length - 1]) < EPSILON
      ),
    }
    };
}