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
    const [a, b] = r.coeficientes;
    // Intersección con Ejes
    if (a !== 0) todasLasIntersecciones.push({ x: r.rhs / a, y: 0, label: `R${i + 1} ∩ Eje X` });
    if (b !== 0) todasLasIntersecciones.push({ x: 0, y: r.rhs / b, label: `R${i + 1} ∩ Eje Y` });

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
    if (p.x >= -1e-6 && p.y >= -1e-6 && esFactible([p.x, p.y], restricciones)) {
      puntosFactibles.push(p);
    }
  });

  // 3. Proyecciones para detectar regiones no acotadas (Labels de fuga)
  const puntosFuga: Punto[] = [];
  restricciones.forEach((r, i) => {
    const [a, b] = r.coeficientes;
    if (b === 0 && a !== 0) {
      const x = r.rhs / a;
      if (x >= 0 && esFactible([x, LIMITE_VISUAL], restricciones)) 
        puntosFuga.push({ x, y: LIMITE_VISUAL, label: `R${i+1} ∩ Límite` });
    } 
    else if (a === 0 && b !== 0) {
      const y = r.rhs / b;
      if (y >= 0 && esFactible([LIMITE_VISUAL, y], restricciones)) 
        puntosFuga.push({ x: LIMITE_VISUAL, y, label: `R${i+1} ∩ Límite` });
    } 
    else if (a !== 0 && b !== 0) {
      const x_top = (r.rhs - b * LIMITE_VISUAL) / a;
      if (x_top >= 0 && x_top <= LIMITE_VISUAL && esFactible([x_top, LIMITE_VISUAL], restricciones)) 
        puntosFuga.push({ x: x_top, y: LIMITE_VISUAL, label: `R${i+1} ∩ Límite Sup.` });
      
      const y_right = (r.rhs - a * LIMITE_VISUAL) / b;
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
      RegionFactible: [], Vertices: [], VerticeOptimo: { x: 0, y: 0, valor: 0, es_fuga: false, label: ""}, ValorOptimo: 0,
      Lineas_de_restriccion: [], LineaObjetivo: [],
      es_indefinida: false, es_infactible: true, es_degenerada: false, tipo_solucion: "Infactible"
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
    const [a, b] = r.coeficientes;
    const pts: Punto[] = [];
    const EXT = LIMITE_VISUAL * 1.2;
    if (a !== 0 && b !== 0) pts.push({ x: 0, y: r.rhs / b }, { x: r.rhs / a, y: 0 });
    else if (a === 0) pts.push({ x: 0, y: r.rhs / b }, { x: EXT, y: r.rhs / b });
    else pts.push({ x: r.rhs / a, y: 0 }, { x: r.rhs / a, y: EXT });

    return { id: r.id, puntos: pts, label: `R${index + 1}: ${a}x₁ ${b >= 0 ? '+' : ''} ${b}x₂ ${r.operador} ${r.rhs}` };
  });

  return {
    RegionFactible: VerticesOrdenados,
    Vertices: verticesEvaluados,
    VerticeOptimo: VerticeOptimo,
    ValorOptimo: VerticeOptimo.valor,
    Lineas_de_restriccion: LineasRestriccion,
    LineaObjetivo: generarLineaObjetivo(VerticeOptimo.valor, FuncionObjetivo, LIMITE_VISUAL),
    es_indefinida: esIndefinida,
    es_infactible: false,
    es_degenerada: esDegenerada,
    tipo_solucion: tipoSolucion
  } as SolucionGrafica;
}

// --- Nuevas Auxiliares para Identificación ---

function contarRestriccionesEnPunto(p: Punto, restricciones: Desigualdad[]): number {
  return restricciones.filter(r => {
    const [a, b] = r.coeficientes;
    return Math.abs(a * p.x + b * p.y - r.rhs) < 1e-6;
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
  const [a1, b1] = c1.coeficientes;
  const [a2, b2] = c2.coeficientes;
  const det = a1 * b2 - a2 * b1;
  if (Math.abs(det) < 1e-10) return null;
  const x = (c1.rhs * b2 - c2.rhs * b1) / det;
  const y = (a1 * c2.rhs - a2 * c1.rhs) / det;
  return { x, y };
}

function esFactible(punto: number[], restricciones: Desigualdad[]): boolean {
  return restricciones.every(r => {
    const [a, b] = r.coeficientes;
    const val = a * punto[0] + b * punto[1];
    if (r.operador === "<=") return val <= r.rhs + 1e-8;
    if (r.operador === ">=") return val >= r.rhs - 1e-8;
    return Math.abs(val - r.rhs) < 1e-8;
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