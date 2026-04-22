import { Desigualdad, Punto, Vertice, SolucionGrafica } from "../data/interfaces";
import { OptType as Optimizacion } from "../data/types";

export function resolverMetodoGrafico(
  FuncionObjetivo: number[],
  restricciones: Desigualdad[],
  tipo_optimizacion: Optimizacion
): SolucionGrafica {
  const todasLasIntersecciones: Punto[] = [];
  
  // 1. Escala y recolección de intersecciones con Labels Descriptivos
  restricciones.forEach((r, i) => {
  
    const a = Number(r.coeficientes[0]);
    const b = Number(r.coeficientes[1]);
    const rhs = Number(r.rhs);

    // Intersección con Ejes
    if (a !== 0) todasLasIntersecciones.push({ x: rhs / a, y: 0, label: `R${i + 1} ∩ Eje X` });
    if (b !== 0) todasLasIntersecciones.push({ x: 0, y: rhs / b, label: `R${i + 1} ∩ Eje Y` });

    // Intersección entre restricciones
    for (let j = i + 1; j < restricciones.length; j++) {
      const inter = hallarInterseccion(r, restricciones[j]);
      if (inter) {
        todasLasIntersecciones.push({ ...inter, label: `R${i + 1} ∩ R${j + 1}` });
      }
    }
  });

  const maxInter = todasLasIntersecciones.reduce(
    (max, p) => (isFinite(p.x) && isFinite(p.y) ? Math.max(max, p.x, p.y) : max), 0
  );
  const LIMITE_VISUAL = maxInter > 0 ? maxInter * 10 : 100;

  // 2. Identificar Vértices Factibles
  const puntosFactibles: Punto[] = [];
  if (esFactible([0, 0], restricciones)) {
    puntosFactibles.push({ x: 0, y: 0, label: "Origen (0, 0)" });
  }

  todasLasIntersecciones.forEach((p) => {

    const px = Math.abs(p.x) < 1e-6 ? 0 : p.x;
    const py = Math.abs(p.y) < 1e-6 ? 0 : p.y;

    if (px >= 0 && py >= 0 && esFactible([px, py], restricciones)) {
      puntosFactibles.push({ x: px, y: py, label: p.label });
    }
  });

  // 3. Proyecciones para detectar regiones no acotadas (Labels de fuga)
  const puntosFuga: Punto[] = [];
  restricciones.forEach((r, i) => {
    const a = Number(r.coeficientes[0]);
    const b = Number(r.coeficientes[1]);
    const rhs = Number(r.rhs);

    if (b === 0 && a !== 0) {
      const x = rhs / a;
      if (x >= 0 && esFactible([x, LIMITE_VISUAL], restricciones)) 
        puntosFuga.push({ x, y: LIMITE_VISUAL, label: `R${i+1} ∩ Límite` });
    } 
    else if (a === 0 && b !== 0) {
      const y = rhs / b;
      if (y >= 0 && esFactible([LIMITE_VISUAL, y], restricciones)) 
        puntosFuga.push({ x: LIMITE_VISUAL, y, label: `R${i+1} ∩ Límite` });
    } 
    else if (a !== 0 && b !== 0) {
      const x_top = (rhs - b * LIMITE_VISUAL) / a;
      if (x_top >= 0 && x_top <= LIMITE_VISUAL && esFactible([x_top, LIMITE_VISUAL], restricciones)) 
        puntosFuga.push({ x: x_top, y: LIMITE_VISUAL, label: `R${i+1} ∩ Límite Sup.` });
      
      const y_right = (rhs - a * LIMITE_VISUAL) / b;
      if (y_right >= 0 && y_right <= LIMITE_VISUAL && esFactible([LIMITE_VISUAL, y_right], restricciones)) 
        puntosFuga.push({ x: LIMITE_VISUAL, y: y_right, label: `R${i+1} ∩ Límite Der.` });
    }
  });

  if (esFactible([LIMITE_VISUAL, LIMITE_VISUAL], restricciones)) {
    puntosFuga.push({ x: LIMITE_VISUAL, y: LIMITE_VISUAL, label: "Limite Sup. Der." });
  }
  if(esFactible([LIMITE_VISUAL, 0], restricciones)){
    puntosFuga.push({ x: LIMITE_VISUAL, y: 0, label: "Limite Der." });
  }
  if(esFactible([0, LIMITE_VISUAL], restricciones)){
    puntosFuga.push({ x: 0, y: LIMITE_VISUAL, label: "Limite Sup." });
  }

  const verticesUnicos = eliminarDuplicados([...puntosFactibles, ...puntosFuga]);

  if (verticesUnicos.length === 0) {
    return {
      method: "grafico",
      RegionFactible: [], Vertices: [], VerticeOptimo: { x: 0, y: 0, valor: 0, es_fuga: false, label: ""}, ValorOptimo: 0,
      Lineas_de_restriccion: [], LineaObjetivo: [],
      analysis: {
        observaciones: ["No se encontraron puntos factibles."],
        acotada: true, factible: false, degeneracion: false, tipo_solucion: "Infactible"
      }
    };
  }

  // 4. Mapeo a tipo Vertice conservando el label original
  const verticesEvaluados = verticesUnicos.map(p => ({
    ...p,
    valor: FuncionObjetivo[0] * p.x + FuncionObjetivo[1] * p.y,
    es_fuga: puntosFuga.some(f => Math.abs(f.x - p.x) < 1e-6 && Math.abs(f.y - p.y) < 1e-6),
    label: p.label || "Vértice"
  })) as Vertice[];

  const VerticesOrdenados = sortPointsConvexHull(verticesUnicos);

  const valorOptimoReal = tipo_optimizacion === "max"
    ? Math.max(...verticesEvaluados.map(v => v.valor))
    : Math.min(...verticesEvaluados.map(v => v.valor));

  const optimos = verticesEvaluados.filter(v => Math.abs(v.valor - valorOptimoReal) < 1e-6);

  let tipoSolucion = "Unica";
  let esIndefinida = false;

  if (optimos.some(v => v.es_fuga)) {
    esIndefinida = true;
  } else if (optimos.length > 1) {
    tipoSolucion = "Multiple";
  }

  const esDegenerada = verticesUnicos.some(v => contarRestriccionesEnPunto(v, restricciones) > 2);

  const VerticeOptimo = optimos[0];

  const LineasRestriccion = restricciones.map((r, index) => {
    const a = Number(r.coeficientes[0]);
    const b = Number(r.coeficientes[1]);
    const rhs = Number(r.rhs);
    const pts: Punto[] = [];
    const EXT = LIMITE_VISUAL * 1.2;
    if (a !== 0 && b !== 0) pts.push({ x: 0, y: rhs / b }, { x: rhs / a, y: 0 });
    else if (a === 0) pts.push({ x: 0, y: rhs / b }, { x: EXT, y: rhs / b });
    else pts.push({ x: rhs / a, y: 0 }, { x: rhs / a, y: EXT });

    return { id: r.id, puntos: pts, label: `R${index + 1}: ${a}x₁ ${b >= 0 ? '+' : ''} ${b}x₂ ${r.operador} ${rhs}` };
  });

  return {
    method: "grafico",
    variables: optimos.reduce((vars, v) => {
      vars["x"] = v.x;
      vars["y"] = v.y;
      return vars;
    }, {} as { [key: string]: number }),
    RegionFactible: VerticesOrdenados,
    Vertices: verticesEvaluados,
    VerticeOptimo: VerticeOptimo,
    ValorOptimo: VerticeOptimo.valor,
    Lineas_de_restriccion: LineasRestriccion,
    LineaObjetivo: generarLineaObjetivo(VerticeOptimo.valor, FuncionObjetivo, LIMITE_VISUAL),
    analysis: {
      observaciones: esIndefinida ? ["La función objetivo es no acotada en la región factible."] : [],
      acotada: !esIndefinida, factible: true, degeneracion: esDegenerada, tipo_solucion: tipoSolucion
    }
  } as SolucionGrafica;
}

// --- Nuevas Auxiliares para Identificación ---

function contarRestriccionesEnPunto(p: Punto, restricciones: Desigualdad[]): number {
  return restricciones.filter(r => {
    const a = Number(r.coeficientes[0]);
    const b = Number(r.coeficientes[1]);
    const rhs = Number(r.rhs);
    return Math.abs(a * p.x + b * p.y - rhs) < 1e-6;
  }).length;
}

function generarLineaObjetivo(k: number, FO: number[], limite: number): Punto[] {
  const [c1, c2] = FO;
  const pts: Punto[] = [];
  if (c2 !== 0) {
    pts.push({ x: 0, y: k / c2 });
    if (c1 !== 0) pts.push({ x: k / c1, y: 0 });
    else pts.push({ x: limite, y: k / c2 });
  } else if (c1 !== 0) {
    pts.push({ x: k / c1, y: 0 }, { x: k / c1, y: limite });
  }
  return pts;
}

function hallarInterseccion(c1: Desigualdad, c2: Desigualdad): Punto | null {
  const a1 = Number(c1.coeficientes[0]);
  const b1 = Number(c1.coeficientes[1]);
  const rhs1 = Number(c1.rhs);
  const a2 = Number(c2.coeficientes[0]);
  const b2 = Number(c2.coeficientes[1]);
  const rhs2 = Number(c2.rhs);

  const det = a1 * b2 - a2 * b1;
  if (Math.abs(det) < 1e-10) return null;
  const x = (rhs1 * b2 - rhs2 * b1) / det;
  const y = (a1 * rhs2 - a2 * rhs1) / det;
  return { x, y };
}

function esFactible(punto: number[], restricciones: Desigualdad[]): boolean {
  return restricciones.every(r => {
    const a = Number(r.coeficientes[0]);
    const b = Number(r.coeficientes[1]);
    const rhs = Number(r.rhs);
    const val = a * punto[0] + b * punto[1];
    
    const op = String(r.operador).trim().replace('≤', '<=').replace('≥', '>=');
    
    if (op === "<=") return val <= rhs + 1e-6;
    if (op === ">=") return val >= rhs - 1e-6;
    return Math.abs(val - rhs) < 1e-6;
  });
}

function eliminarDuplicados(puntos: Punto[]): Punto[] {
  const unico: Punto[] = [];
  puntos.forEach(p => {
    if (!unico.some(u => Math.abs(u.x - p.x) < 1e-6 && Math.abs(u.y - p.y) < 1e-6)) {
      unico.push(p);
    }
  });
  return unico;
}

function sortPointsConvexHull(puntos: Punto[]): Punto[] {
  if (puntos.length <= 2) return puntos;
  const cx = puntos.reduce((sum, p) => sum + p.x, 0) / puntos.length;
  const cy = puntos.reduce((sum, p) => sum + p.y, 0) / puntos.length;
  return [...puntos].sort((a, b) => Math.atan2(a.y - cy, a.x - cx) - Math.atan2(b.y - cy, b.x - cx));
}