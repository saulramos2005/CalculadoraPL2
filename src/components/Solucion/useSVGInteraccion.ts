import { useState, useRef, useEffect } from "react";
import { SolucionGrafica, Vertice } from "@/data/interfaces";

export function useSVGInteraccion(svgRef: React.RefObject<SVGSVGElement | null>, axisLimit: number, activeResult: SolucionGrafica) {
  const [viewBox, setViewBox] = useState({ x: -axisLimit, y: -axisLimit, width: axisLimit * 2, height: axisLimit * 2 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 });
  const [hoveredPoint, setHoveredPoint] = useState<Vertice | null>(null);
  const [selectedVertex, setSelectedVertex] = useState<Vertice | null>(null);

  const clickStartPos = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setLastPos({ x: e.clientX, y: e.clientY });
    clickStartPos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Calcular coordenadas del mundo
    const scaleX = viewBox.width / rect.width;
    const scaleY = viewBox.height / rect.height;
    const worldX = viewBox.x + mouseX * scaleX;
    const worldY = viewBox.y + (rect.height - mouseY) * scaleY; // Invertir Y

    // Hover sobre puntos óptimos
    const toleranceInWorld = (viewBox.width / rect.width) * 5; // Tolerancia de 5px en pantalla
    const hovered = activeResult.Vertices.find(point => {
      const dx = point.x - worldX;
      const dy = point.y - worldY;
      return Math.sqrt(dx * dx + dy * dy) < toleranceInWorld;
    });
    setHoveredPoint(hovered || null);

    if (!isDragging) return;

    const dx = e.clientX - lastPos.x;
    const dy = e.clientY - lastPos.y;
    const scaleXMove = -dx * scaleX;
    const scaleYMove = dy * scaleY; // Invertir para Y

    setViewBox(prev => ({
      ...prev,
      x: prev.x + scaleXMove,
      y: prev.y + scaleYMove,
    }));
    setLastPos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleWheel = (e: WheelEvent) => {
    e.preventDefault();
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const zoomFactor = e.deltaY > 0 ? 1.1 : 0.9;
    const newWidth = viewBox.width * zoomFactor;
    const newHeight = viewBox.height * zoomFactor;

    // Zoom hacia el punto del mouse
    const scaleX = viewBox.width / rect.width;
    const scaleY = viewBox.height / rect.height;
    const worldX = viewBox.x + mouseX * scaleX;
    const worldY = viewBox.y + (rect.height - mouseY) * scaleY;

    const newX = worldX - mouseX * (newWidth / rect.width);
    const newY = worldY - (rect.height - mouseY) * (newHeight / rect.height);

    setViewBox({
      x: newX,
      y: newY,
      width: newWidth,
      height: newHeight,
    });
  };

  const handleClick = (e: React.MouseEvent) => {
    const dx = e.clientX - clickStartPos.current.x;
    const dy = e.clientY - clickStartPos.current.y;
    if (Math.sqrt(dx * dx + dy * dy) > 5) return; // Si fue drag, no click

    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Calcular coordenadas del mundo
    const scaleX = viewBox.width / rect.width;
    const scaleY = viewBox.height / rect.height;
    const worldX = viewBox.x + mouseX * scaleX;
    const worldY = viewBox.y + (rect.height - mouseY) * scaleY;

    const toleranceInWorld = (viewBox.width / rect.width) * 5; // Tolerancia de 5px
    const clicked = activeResult.Vertices.find(point => {
      const dx = point.x - worldX;
      const dy = point.y - worldY;
      return Math.sqrt(dx * dx + dy * dy) < toleranceInWorld;
    });
    setSelectedVertex(clicked || null);
  };

  const resetView = () => {
    setViewBox({ x: -axisLimit, y: -axisLimit, width: axisLimit * 2, height: axisLimit * 2 });
  };

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    svg.addEventListener("wheel", handleWheel, { passive: false });
    return () => svg.removeEventListener("wheel", handleWheel);
  }, [viewBox]);

  return {
    viewBox,
    isDragging,
    hoveredPoint,
    selectedVertex,
    setSelectedVertex,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleClick,
    resetView,
  };
}