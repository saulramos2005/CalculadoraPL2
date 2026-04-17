import { SolucionGrafica } from "@/data/interfaces";

export function renderCanvas(
  canvas: HTMLCanvasElement,
  solucion: SolucionGrafica,
  camera: { x: number; y: number; zoom: number },
  tipo: "max" | "min",
  isFeasibleHovered: boolean = false,
  hoveredVertex: { x: number; y: number } | null = null
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const dpr = window.devicePixelRatio || 1;
  const width = canvas.width / dpr;
  const height = canvas.height / dpr;

  ctx.setTransform(1, 0, 0, 1, 0, 0); // Resetear transformaciones previas
  ctx.scale(dpr, dpr); // Escalar para alta densidad de píxeles

  const { x: offX, y: offY, zoom } = camera;

  // Helpers de transformación
  const toScreenX = (wx: number) => offX + wx * zoom;
  const toScreenY = (wy: number) => offY - wy * zoom; // Y invertida para cartesianas

  // 1. Fondo y Limpieza
  ctx.fillStyle = "#faf6f6f5";
  ctx.fillRect(0, 0, width, height);

  // 2. Dibujar Cuadrícula (Grid)
  drawGrid(ctx, width, height, camera);

  // 3. Dibujar Región Factible (Polígono)
  if (solucion.RegionFactible.length > 1) {
    ctx.beginPath();
    ctx.fillStyle = isFeasibleHovered ? "rgba(37, 99, 235, 0.4)" : "rgba(59, 130, 246, 0.2)"; // Azul más intenso al hacer hover
    ctx.strokeStyle = "#2563eb";
    ctx.lineWidth = 2;

    const first = solucion.RegionFactible[0];
    ctx.moveTo(toScreenX(first.x), toScreenY(first.y));
    solucion.RegionFactible.forEach((p) => ctx.lineTo(toScreenX(p.x), toScreenY(p.y)));
    
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  // 4. Dibujar Líneas de Restricción (Infinitas visualmente)
  solucion.Lineas_de_restriccion.forEach((linea) => {
    if (linea.puntos.length < 2) return;
    ctx.beginPath();
    ctx.strokeStyle = "#4b2ef3ff";
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]); // Líneas punteadas para restricciones

    // Usamos puntos extremos para simular el infinito
    const p1 = linea.puntos[0];
    const p2 = linea.puntos[linea.puntos.length - 1];
    const x1 = toScreenX(p1.x);
    const y1 = toScreenY(p1.y);
    const x2 = toScreenX(p2.x);
    const y2 = toScreenY(p2.y);

    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Dibujar etiqueta (R1, R2...)
    if (linea.label) {
      const labelText = linea.label.split(":")[0];
      ctx.save();
      ctx.font = "bold 12px sans-serif";
      
      let angle = Math.atan2(y2 - y1, x2 - x1);
      if (angle > Math.PI / 2 || angle < -Math.PI / 2) angle += Math.PI;

      const t = 0.4; // Posición al 40% del segmento
      ctx.translate(x1 + (x2 - x1) * t, y1 + (y2 - y1) * t);
      //ctx.rotate(angle);
      ctx.fillStyle = "rgba(250, 246, 246, 0.85)"; // Fondo para legibilidad
      ctx.fillRect(-2, -14, ctx.measureText(labelText).width + 4, 14);
      ctx.fillStyle = "#4b2ef3";
      ctx.fillText(labelText, 0, -3);
      ctx.restore();
    }
  });

  // 5. Dibujar Ejes Principales
  ctx.beginPath();
  ctx.strokeStyle = "#333232ff";
  ctx.lineWidth = 2;
  // Eje X
  ctx.moveTo(0, offY); ctx.lineTo(width, offY);
  // Eje Y
  ctx.moveTo(offX, 0); ctx.lineTo(offX, height);
  ctx.stroke();

  // 6. Dibujar Vértices
  ctx.font = "bold 11px sans-serif";
  solucion.Vertices.forEach((v) => {
    const vx = toScreenX(v.x);
    const vy = toScreenY(v.y);
    const esOptimo = v.x === solucion.VerticeOptimo.x && v.y === solucion.VerticeOptimo.y;
    const isHovered = hoveredVertex && Math.abs(hoveredVertex.x - v.x) < 1e-9 && Math.abs(hoveredVertex.y - v.y) < 1e-9;

    ctx.beginPath();
    ctx.arc(vx, vy, isHovered ? 8 : (esOptimo ? 6 : 4), 0, Math.PI * 2);
    ctx.fillStyle = esOptimo ? "#ef4444" : "#2563eb";
    ctx.fill();
    
    if (isHovered) {
      ctx.strokeStyle = "#f59e0b"; // Naranja brillante para resaltar
      ctx.lineWidth = 4;
      ctx.stroke();
      ctx.strokeStyle = "white";
      ctx.lineWidth = 2;
    } else {
      ctx.strokeStyle = "white";
      ctx.lineWidth = 2;
    }
    ctx.stroke();

    // Etiquetas de coordenadas
    ctx.fillStyle = "#156df1ff";
    ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
    ctx.lineWidth = 3;
    const label = `(${Number(v.x.toFixed(2))}, ${Number(v.y.toFixed(2))})`;
    ctx.strokeText(label, vx + 8, vy - 5);
    ctx.fillText(label, vx + 8, vy - 5);
  });
}

function drawGrid(ctx: CanvasRenderingContext2D, width: number, height: number, camera: any) {
  const { x: offX, y: offY, zoom } = camera;
  
  // 1. Se calcula un 'step' seguro. Si el zoom es >= 50, el step original era 0, causando un bucle infinito.
  const step = Math.max(1, Math.floor(50 / zoom));
  
  ctx.beginPath();
  ctx.strokeStyle = "#a8a9aaee";
  ctx.lineWidth = 1;

  // Líneas verticales
  const startX = Math.floor(-offX / (zoom * step)) * step;
  for (let wx = startX; (wx * zoom) + offX < width; wx += step) {
    const sx = offX + wx * zoom;
    ctx.moveTo(sx, 0);
    ctx.lineTo(sx, height);
    if (wx !== 0) {
        ctx.fillStyle = "#000000a1";
        ctx.fillText(wx.toString(), sx + 2, offY - 5);
    }
  }

  // Líneas horizontales
  const startY = Math.floor((offY - height) / (zoom * step)) * step;
  // 2. La condición del bucle era incorrecta. Ahora se comprueba que la línea esté en una coordenada Y visible (>= 0).
  for (let wy = startY; (offY - (wy * zoom)) >= 0; wy += step) {
    const sy = offY - wy * zoom;
    ctx.moveTo(0, sy);
    ctx.lineTo(width, sy);
    if (wy !== 0) {
        ctx.fillStyle = "#000000a1";
        ctx.fillText(wy.toString(), offX + 5, sy - 2);
    }
  }
  ctx.stroke();
}