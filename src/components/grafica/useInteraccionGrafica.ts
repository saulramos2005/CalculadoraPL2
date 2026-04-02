import { SolucionGrafica } from "@/data/interfaces";
import { useState, useRef, useEffect, RefObject } from "react";
import { toast } from "react-hot-toast";

// Algoritmo Ray Casting para detectar si un punto está dentro de un polígono
function estaDentro(
  punto: { x: number; y: number },
  vs: { x: number; y: number }[],
) {
  let x = punto.x,
    y = punto.y;
  let dentro = false;
  for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
    let xi = vs[i].x,
      yi = vs[i].y;
    let xj = vs[j].x,
      yj = vs[j].y;

    let intersect =
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) dentro = !dentro;
  }
  return dentro;
}

export function useInteraccionGrafica(
  canvasRef: RefObject<HTMLCanvasElement | null>,
  solucion: SolucionGrafica,
) {
  const [camera, setCamera] = useState({
    x: 50,
    y: 450,
    zoom: 1,
  });

  const [isArrastrando, setIsArrastrando] = useState(false);
  const [ultimaPos, setUltimaPos] = useState({ x: 0, y: 0 });
  const [pointer, setPointer] = useState<{ x: number; y: number } | null>(null);
  const [isRegionHovered, setIsRegionHovered] = useState(false);
  const [verticeSelec, setVerticeSelec] = useState<any | null>(null);
    const [verticeTablaHovered, setVerticeTablaHovered] = useState<{ x: number; y: number } | null>(null);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const fullscreenContainerRef = useRef<HTMLDivElement>(null);

  const clickStartPos = useRef({ x: 0, y: 0 });
  const lastPinchDistance = useRef<number | null>(null);
  const animationRef = useRef<number | null>(null);

  const stopAnimacion = () => {
    if (animationRef.current !== null) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
  };

  const animar = (targetX: number, targetY: number, targetZoom: number) => {
    stopAnimacion();
    const startX = camera.x;
    const startY = camera.y;
    const startZoom = camera.zoom;
    const startTime = performance.now();
    const duration = 600;

    const frame = (now: number) => {
      const t = Math.min((now - startTime) / duration, 1);
      const ease = 1 - Math.pow(1 - t, 3);

      setCamera({
        x: startX + (targetX - startX) * ease,
        y: startY + (targetY - startY) * ease,
        zoom: startZoom + (targetZoom - startZoom) * ease,
      });

      if (t < 1) {
        animationRef.current = requestAnimationFrame(frame);
      } else {
        animationRef.current = null;
      }
    };
    animationRef.current = requestAnimationFrame(frame);
  };
  // Zoom manual (botones) - Hace zoom hacia el centro del canvas
  const handleManualZoom = (factor: number) => {
    stopAnimacion();
    const newZoom = Math.min(Math.max(camera.zoom * factor, 1), 1000);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const worldX = (centerX - camera.x) / camera.zoom;
    const worldY = (camera.y - centerY) / camera.zoom;

    setCamera({
      zoom: newZoom,
      x: centerX - worldX * newZoom,
      y: centerY + worldY * newZoom,
    });
  };

  const handleCentrarOptimo = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const { x, y } = solucion.VerticeOptimo;

    // Calculamos el offset de la cámara para que el punto (x,y) quede en el centro del canvas
    const targetX = rect.width / 2 - x * camera.zoom;
    const targetY = rect.height / 2 + y * camera.zoom;

    animar(targetX, targetY, camera.zoom);
  };

  const handleExportPNG = () => {
    const canvas = canvasRef.current;
    if (!canvas) {
      toast.error("No se pudo encontrar el gráfico para exportar.");
      return;
    }
    const link = document.createElement("a");
    link.download = "grafico-pl.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
    toast.success("Exportando gráfico como PNG...");
  };

    const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      fullscreenContainerRef.current?.requestFullscreen().catch(err => {
        toast.error(`Error al intentar pantalla completa: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  const obtenerLimitesContenido = () => {
    const xs = solucion.Vertices.map((v) => v.x);
    const ys = solucion.Vertices.map((v) => v.y);
    return {
      minX: Math.min(0, ...xs),
      maxX: Math.max(10, ...xs),
      minY: Math.min(0, ...ys),
      maxY: Math.max(10, ...ys),
    };
  };

  const updatePosCamara = (dx: number, dy: number, rect: DOMRect) => {
    setCamera((prev) => {
      const { minX, maxX, minY, maxY } = obtenerLimitesContenido();
      const margin = 150;
      const width = rect.width;
      const height = rect.height;

      const minCamX = -margin - maxX * prev.zoom;
      const maxCamX = width + margin - minX * prev.zoom;
      const minCamY = -margin + minY * prev.zoom;
      const maxCamY = height + margin + maxY * prev.zoom;

      return {
        ...prev,
        x: Math.max(minCamX, Math.min(prev.x + dx, maxCamX)),
        y: Math.max(minCamY, Math.min(prev.y + dy, maxCamY)),
      };
    });
  };

  // Event Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    stopAnimacion();
    setIsArrastrando(true);
    setUltimaPos({ x: e.clientX, y: e.clientY });
    clickStartPos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    setPointer({ x: mouseX, y: mouseY });

    const worldX = (mouseX - camera.x) / camera.zoom;
    const worldY = (camera.y - mouseY) / camera.zoom;
    const isHovered = estaDentro(
      { x: worldX, y: worldY },
      solucion.RegionFactible,
    );
    if (isHovered !== isRegionHovered) setIsRegionHovered(isHovered);

    if (!isArrastrando) return;
    const dx = e.clientX - ultimaPos.x;
    const dy = e.clientY - ultimaPos.y;
    updatePosCamara(dx, dy, rect);
    setUltimaPos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => setIsArrastrando(false);

  const handleMouseLeave = () => {
    setIsArrastrando(false);
    setPointer(null);
    setIsRegionHovered(false);
  };

  const handleClick = (e: React.MouseEvent) => {
    const dx = e.clientX - clickStartPos.current.x;
    const dy = e.clientY - clickStartPos.current.y;
    if (Math.sqrt(dx * dx + dy * dy) > 5) return;

    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    let clicked = null;
    for (const v of solucion.Vertices) {
      const vx = camera.x + v.x * camera.zoom;
      const vy = camera.y - v.y * camera.zoom;
      const dist = Math.sqrt((mouseX - vx) ** 2 + (mouseY - vy) ** 2);
      if (dist < 15) {
        clicked = v;
        break;
      }
    }
    setVerticeSelec(clicked);
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const targetX = camera.x + (rect.width / 2 - mouseX);
    const targetY = camera.y + (rect.height / 2 - mouseY);
    animar(targetX, targetY, camera.zoom);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    stopAnimacion();
    if (e.touches.length === 2) {
      setIsArrastrando(false);
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      lastPinchDistance.current = Math.hypot(
        touch1.clientX - touch2.clientX,
        touch1.clientY - touch2.clientY,
      );
    } else if (e.touches.length === 1) {
      setIsArrastrando(true);
      const touch = e.touches[0];
      setUltimaPos({ x: touch.clientX, y: touch.clientY });
      clickStartPos.current = { x: touch.clientX, y: touch.clientY };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!canvasRef.current) return;

    if (e.touches.length === 2 && lastPinchDistance.current !== null) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const dist = Math.hypot(
        touch1.clientX - touch2.clientX,
        touch1.clientY - touch2.clientY,
      );

      if (dist > 0) {
        const zoomFactor = dist / lastPinchDistance.current;
        lastPinchDistance.current = dist;
        const rect = canvasRef.current.getBoundingClientRect();
        const centerClientX = (touch1.clientX + touch2.clientX) / 2;
        const centerClientY = (touch1.clientY + touch2.clientY) / 2;

        setCamera((prev) => {
          const newZoom = Math.min(Math.max(prev.zoom * zoomFactor, 0.5), 1000);
          const mouseX = centerClientX - rect.left;
          const mouseY = centerClientY - rect.top;
          const worldX = (mouseX - prev.x) / prev.zoom;
          const worldY = (prev.y - mouseY) / prev.zoom;
          return {
            zoom: newZoom,
            x: mouseX - worldX * newZoom,
            y: mouseY + worldY * newZoom,
          };
        });
      }
      return;
    }

    if (!isArrastrando) return;
    const touch = e.touches[0];
    const dx = touch.clientX - ultimaPos.x;
    const dy = touch.clientY - ultimaPos.y;
    const rect = canvasRef.current.getBoundingClientRect();
    updatePosCamara(dx, dy, rect);
    setUltimaPos({ x: touch.clientX, y: touch.clientY });
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    lastPinchDistance.current = null;
    if (e.touches.length === 0) {
      setIsArrastrando(false);
    } else if (e.touches.length === 1) {
      setIsArrastrando(true);
      const touch = e.touches[0];
      setUltimaPos({ x: touch.clientX, y: touch.clientY });
    }
  };

  const handleWheel = (e: WheelEvent) => {
    e.preventDefault();
    stopAnimacion();
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;

    setCamera((prev) => {
      const newZoom = Math.min(Math.max(prev.zoom * zoomFactor, 0.5), 1000);
      if (!canvasRef.current) return prev;
      const rect = canvasRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const worldX = (mouseX - prev.x) / prev.zoom;
      const worldY = (prev.y - mouseY) / prev.zoom;

      return {
        zoom: newZoom,
        x: mouseX - worldX * newZoom,
        y: mouseY + worldY * newZoom,
      };
    });
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.addEventListener("wheel", handleWheel, { passive: false });
    return () => canvas.removeEventListener("wheel", handleWheel);
  }, []);
  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  return {
    camera,
    setCamera,
    pointer,
    isRegionHovered,
    verticeSelec,
    setVerticeSelec,
    verticeTablaHovered,
    setVerticeTablaHovered,
    isArrastrando,
    animar,
    stopAnimacion,
    handleManualZoom,
    handleCentrarOptimo,
    handleExportPNG,
    toggleFullscreen,
    fullscreenContainerRef,
    isFullscreen,
    setIsFullscreen,
    handlers: {
      onMouseDown: handleMouseDown,
      onMouseMove: handleMouseMove,
      onMouseUp: handleMouseUp,
      onMouseLeave: handleMouseLeave,
      onClick: handleClick,
      onDoubleClick: handleDoubleClick,
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
  };
}
