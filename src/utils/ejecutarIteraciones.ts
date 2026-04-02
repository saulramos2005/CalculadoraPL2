import { TablaSimplex } from "../data/interfaces";

export const EPSILON = 1e-10;

export function ejecutarIteracionesSimplex(
  matriz: number[][], 
  basicas: string[], 
  encabezados: string[],
  offsetIteracion: number
) {
  let tablas: TablaSimplex[] = [];
  let iteracionActual = offsetIteracion;
  const numFilas = matriz.length;
  const numCols = matriz[0].length;
  const MAX_ITERACIONES = 50;

  for (let k = 0; k < MAX_ITERACIONES; k++) {
    const filaZ = matriz[numFilas - 1];
    
    // Identificar columna pivote (Valor más negativo)
    let colPivote = -1;
    let minVal = -1e-10;
    for (let j = 0; j < numCols - 1; j++) {
      if (filaZ[j] < minVal) {
        minVal = filaZ[j];
        colPivote = j;
      }
    }

    // Si no hay valores negativos, la tabla actual ya es la óptima.
    if (colPivote === -1) break; 

    // Identificar fila pivote (Razón mínima positiva)
    let filaPivote = -1;
    let minRatio = Infinity;
    for (let i = 0; i < numFilas - 1; i++) {
      if (matriz[i][colPivote] > 1e-10) {
        const ratio = matriz[i][numCols - 1] / matriz[i][colPivote];
        if (ratio < minRatio) {
          minRatio = ratio;
          filaPivote = i;
        }
      }
    }

    // Si no hay fila pivote, el problema no está acotado.
    if (filaPivote === -1) return { matriz, basicas, tablas, es_indefinida: true };

    // Almacenar estado de la tabla ANTES del pivotaje
    tablas.push({
      iteracion: iteracionActual++,
      basicas: [...basicas],
      matriz: matriz.map(f => [...f]),
      encabezados: [...encabezados],
      filaPivote: filaPivote,
      columnaPivote: colPivote,
      es_optima: false
    });

    // Realizar Pivotaje (Gauss-Jordan)
    const vPivote = matriz[filaPivote][colPivote];
    for (let j = 0; j < numCols; j++) matriz[filaPivote][j] /= vPivote;

    for (let i = 0; i < numFilas; i++) {
      if (i !== filaPivote) {
        const factor = matriz[i][colPivote];
        for (let j = 0; j < numCols; j++) {
          matriz[i][j] -= factor * matriz[filaPivote][j];
        }
      }
    }

    // Actualizar variable básica
    basicas[filaPivote] = encabezados[colPivote];
  }

  // Agregar la tabla FINAL después de que el bucle termina
  tablas.push({
    iteracion: iteracionActual,
    basicas: [...basicas],
    matriz: matriz.map(f => [...f]),
    encabezados: [...encabezados],
    es_optima: true
  });

  return { matriz, basicas, tablas, es_indefinida: false };
}

export function ejecutarIteracionDual(tabla: TablaSimplex): TablaSimplex {

  const matriz = tabla.matriz.map((row) => [...row]);
  const basicas = [...tabla.basicas];
  const encabezados = [...tabla.encabezados];

  const numFilas = matriz.length;
  const numCols = matriz[0].length;
  const rhsIdx = numCols - 1;

  let filaSaliente = -1;
  let minRhs = 0;
  for (let i = 0; i < numFilas - 1; i++) {
    const rhs = matriz[i][rhsIdx];
    if (rhs < minRhs) {
      minRhs = rhs;
      filaSaliente = i;
    }
  }

  if (filaSaliente === -1) {
    return {
      ...tabla,
      matriz,
      basicas,
      encabezados,
      es_optima: true,
      es_infactible: false,
    };
  }

  const filaZ = matriz[numFilas - 1];
  let colEntrante = -1;
  let mejorRatio = Infinity;

  for (let j = 0; j < numCols - 1; j++) {
    const coefFila = matriz[filaSaliente][j];
    if (coefFila < -EPSILON) {
      const ratio = Math.abs(filaZ[j] / coefFila);
      if (ratio < mejorRatio) {
        mejorRatio = ratio;
        colEntrante = j;
      }
    }
  }

  if (colEntrante === -1) {
    return {
      ...tabla,
      matriz,
      basicas,
      encabezados,
      filaPivote: filaSaliente,
      columnaPivote: -1,
      es_optima: false,
      es_infactible: true,
    };
  }

  const pivote = matriz[filaSaliente][colEntrante];
  for (let j = 0; j < numCols; j++) {
    matriz[filaSaliente][j] /= pivote;
  }

  for (let i = 0; i < numFilas; i++) {
    if (i === filaSaliente) continue;
    const factor = matriz[i][colEntrante];
    for (let j = 0; j < numCols; j++) {
      matriz[i][j] -= factor * matriz[filaSaliente][j];
    }
  }

  basicas[filaSaliente] = encabezados[colEntrante];

  return {
    iteracion: tabla.iteracion + 1,
    basicas,
    matriz,
    encabezados,
    filaPivote: filaSaliente,
    columnaPivote: colEntrante,
    es_optima: false,
    es_infactible: false,
  };
}