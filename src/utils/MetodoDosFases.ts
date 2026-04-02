import {
  Desigualdad,
  SolucionSimplex,
  TablaSimplex,
} from "../data/interfaces";
import { OptType as Optimizacion } from "../data/types";
import { ejecutarIteracionesSimplex } from "./ejecutarIteraciones";

const EPSILON = 1e-10;

export function resolverMetodoDosFases(
  FuncionObjetivo: number[],
  restricciones: Desigualdad[],
  tipo_optimizacion: Optimizacion,
  numVariables: number,
): SolucionSimplex {
  let todasLasTablas: TablaSimplex[] = [];

  const indicesArtificiales = restricciones
    .map((r, i) => (r.operador === ">=" || r.operador === "=" ? i : -1))
    .filter((i) => i !== -1);

  const numSlack = restricciones.filter((r) => r.operador !== "=").length;
  const numArtific = indicesArtificiales.length;

  let encabezados: string[] = [];
  for (let i = 1; i <= numVariables; i++) encabezados.push(`x${i}`);
  for (let i = 1; i <= numSlack; i++) encabezados.push(`s${i}`);
  for (let i = 1; i <= numArtific; i++) encabezados.push(`r${i}`);
  encabezados.push("Sol");

  let matriz: number[][] = [];
  let basicas: string[] = [];
  let sCount = 0;
  let rCount = 0;

  restricciones.forEach((r) => {
    const fila = new Array(encabezados.length).fill(0);
    r.coeficientes.forEach((c, j) => (fila[j] = c));

    if (r.operador === "<=") {
      fila[numVariables + sCount] = 1;
      basicas.push(`s${sCount + 1}`);
      sCount++;
    } else if (r.operador === ">=") {
      fila[numVariables + sCount] = -1;
      sCount++;
      fila[numVariables + numSlack + rCount] = 1;
      basicas.push(`r${rCount + 1}`);
      rCount++;
    } else {
      fila[numVariables + numSlack + rCount] = 1;
      basicas.push(`r${rCount + 1}`);
      rCount++;
    }
    fila[encabezados.length - 1] = r.rhs;
    matriz.push(fila);
  });

  // --- PREPARACIÓN FASE 1 ---
  let filaZ1: number[] = new Array(encabezados.length).fill(0);

  indicesArtificiales.forEach((_, i) => {
    const colArtific = numVariables + numSlack + i;
    filaZ1[colArtific] = 1; 
  });

  matriz.forEach((fila, i) => {
    if (basicas[i].startsWith("r")) {
      for (let j = 0; j < filaZ1.length; j++) {
        filaZ1[j] -= fila[j]; // RESTAR en lugar de sumar
      }
    }
  });

  matriz.push(filaZ1);

  todasLasTablas.push({
    iteracion: 0,
    basicas: [...basicas],
    matriz: matriz.map((row) => [...row]),
    encabezados: [...encabezados],
    es_optima: false,
  });

  // --- EJECUCIÓN FASE 1 ---
  let resFase1 = ejecutarIteracionesSimplex(
    matriz,
    basicas,
    encabezados,
    todasLasTablas.length,
  );
  resFase1 = {
    ...resFase1,
    tablas: invertirSignoZ(resFase1.tablas)
  }

  todasLasTablas.push(...resFase1.tablas);
  const filaZFase1 = resFase1.matriz[resFase1.matriz.length - 1];
  const valorZ1 = Math.abs(filaZFase1[encabezados.length - 1]);

  if (valorZ1 > EPSILON) {
    return {
      ValorOptimo: 0,
      es_infactible: true,
      es_indefinida: false,
      es_degenerada: false,
      tipo_solucion: "Infactible",
      variables: {},
      tablas: todasLasTablas,
    };
  }

  // --- FASE 2 ---
  let encabezadosF2 = encabezados.filter((h) => !h.startsWith("r"));
  let matrizF2 = resFase1.matriz.map((fila) =>
    fila.filter((_, idx) => !encabezados[idx].startsWith("r")),
  );
  matrizF2.pop(); // Quitar fila Z de fase 1

  let filaZ2 = new Array(encabezadosF2.length).fill(0);
  FuncionObjetivo.forEach((c, i) => {
    // Maximizamos -Z para problemas de MAX, y Z para problemas de MIN
    filaZ2[i] = tipo_optimizacion === "min" ? c : -c;
  });

  resFase1.basicas.forEach((base, i) => {
    const colIdx = encabezadosF2.indexOf(base);
    if (colIdx !== -1) {
      const factor = filaZ2[colIdx];
      for (let j = 0; j < filaZ2.length; j++) {
        filaZ2[j] -= factor * matrizF2[i][j];
      }
    }
  });
  matrizF2.push(filaZ2);

  // Evitar duplicar la tabla de transición agregando solo las iteraciones nuevas
  let resFase2 = ejecutarIteracionesSimplex(
    matrizF2,
    resFase1.basicas,
    encabezadosF2,
    todasLasTablas.length,
  );

  todasLasTablas.push(...resFase2.tablas);

  // --- RESULTADO FINAL Y ANÁLISIS ---
  const matrizFinal = resFase2.matriz;
  const filaZFinal = matrizFinal[matrizFinal.length - 1];
  const basicasFinales = resFase2.basicas;
  const numColumnasF2 = encabezadosF2.length;


  const variables: { [key: string]: number } = {};

  resFase2.basicas.forEach((nombreVar, i) => {
    const valor = resFase2.matriz[i][encabezadosF2.length - 1];

    if (valor > EPSILON) {
      variables[nombreVar] = valor;
    }
  });


  basicasFinales.forEach((base, i) => {
    variables[base] = Math.max(0, matrizFinal[i][numColumnasF2 - 1]);
  });

  // Ajuste del valor óptimo: si es MAX, la tabla devolvió -Z
  const zFinal = filaZFinal[numColumnasF2 - 1];
  const valorOptimo = tipo_optimizacion === "max" ? zFinal : -zFinal;

  // Detección de Degeneración (Variable básica en cero)
  const esDegenerada = basicasFinales.some(
    (_, i) => Math.abs(matrizFinal[i][numColumnasF2 - 1]) < EPSILON,
  );

  // Detección de Soluciones Múltiples (Variable no básica con Cj-Zj = 0 en fila óptima)
  let tieneSolucionesMultiples = false;
  for (let j = 0; j < numColumnasF2 - 1; j++) {
    const nombreVar = encabezadosF2[j];
    if (!basicasFinales.includes(nombreVar)) {
      if (Math.abs(filaZFinal[j]) < EPSILON) {
        tieneSolucionesMultiples = true;
        break;
      }
    }
  }

  return {
    ValorOptimo: Number(valorOptimo.toFixed(10)),
    variables,
    es_infactible: false,
    es_indefinida: resFase2.es_indefinida,
    es_degenerada: esDegenerada,
    tipo_solucion: tieneSolucionesMultiples ? "Multiple" : "Unica",
    tablas: todasLasTablas,
  };
}
const invertirSignoZ = (tablas: TablaSimplex[]) => {
    for (let i = 0; i < tablas.length; i++) {
      let fila = tablas[i].matriz[tablas[i].matriz.length - 1];
      for (let j = 0; j < fila.length; j++){
        tablas[i].matriz[tablas[i].matriz.length - 1][j] = -fila[j];
      }
    }
    return tablas;
  }