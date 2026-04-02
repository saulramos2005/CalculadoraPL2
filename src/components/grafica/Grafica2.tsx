import { useRef, useEffect } from "react";
import { SolucionGrafica } from "@/data/interfaces";
import { HeaderGrafica } from "./HeaderGrafica";
import { TablaVertices } from "./TablaVertices";
import { renderCanvas } from "./ContenidoGrafica"; // Nueva lógica de dibujo
import LabelFlotante from "./LabelFlotante";
import AlertaTipoSolucion  from "./AlertaTipoSolucion";
import { useInteraccionGrafica } from "./useInteraccionGrafica";
import DetallesVertice from "./DetallesVertice";

interface Props {
  solucion: SolucionGrafica;
  FuncionObjetivo: number[];
  tipo_optimizacion: "max" | "min";
}

export default function GraficaSolucion({
  solucion,
  FuncionObjetivo,
  tipo_optimizacion,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    camera,
    setCamera,
    pointer,
    isRegionHovered,
    verticeSelec,
    setVerticeSelec,
    verticeTablaHovered,
    setVerticeTablaHovered,
    stopAnimacion,
    handleCentrarOptimo,
    handleManualZoom,
    handleExportPNG,
    toggleFullscreen,
    isFullscreen,
    fullscreenContainerRef,
    handlers 
  } = useInteraccionGrafica(canvasRef, solucion);



  // Efecto de Redibujado
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Ajustar tamaño del canvas al contenedor
    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      const newWidth = rect.width * dpr;
      const newHeight = rect.height * dpr;

      if (canvas.width !== newWidth || canvas.height !== newHeight) {
        canvas.width = newWidth;
        canvas.height = newHeight;
      }
      renderCanvas(canvas, solucion, camera, tipo_optimizacion, isRegionHovered, verticeTablaHovered);
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);
  }, [solucion, camera, tipo_optimizacion, isRegionHovered, verticeTablaHovered]);

  return (
    <div className="flex flex-col gap-4">
      {!solucion.es_infactible && (
        <div ref={fullscreenContainerRef} className={`flex flex-col gap-4 ${isFullscreen ? "bg-white p-4 h-screen overflow-hidden" : ""}`}>
          <HeaderGrafica
            onReset={() => {
              stopAnimacion();
              setCamera({ x: 100, y: 400, zoom: 1 });
            }}
            onCenterOptimum={handleCentrarOptimo}
            onZoomIn={() => handleManualZoom(1.2)}
            onZoomOut={() => handleManualZoom(0.8)}
            onExportPNG={handleExportPNG}
            zoom={camera.zoom}
            isFullscreen={isFullscreen}
            onToggleFullscreen={toggleFullscreen}
          />
          
          <div 
            ref={containerRef}
            className={`w-full border border-gray-300 rounded bg-white overflow-hidden shadow-inner relative ${isFullscreen ? "flex-1" : ""}`}
          >
          <canvas
            ref={canvasRef}
            onMouseDown={handlers.onMouseDown}
            onMouseMove={handlers.onMouseMove}
            onMouseUp={handlers.onMouseUp}
            onMouseLeave={handlers.onMouseLeave}
            onClick={handlers.onClick}
            onDoubleClick={handlers.onDoubleClick}
            onTouchStart={handlers.onTouchStart}
            onTouchMove={handlers.onTouchMove}
            onTouchEnd={handlers.onTouchEnd}
            className={`w-full cursor-move touch-none ${isFullscreen ? "h-full" : "h-[400px] md:h-[600px]"}`}
            style={{ touchAction: "none" }}
          />
          {/* Label Flotante al pasar el mouse por la grafica */}
          <LabelFlotante pointer={pointer} camera={camera} FuncionObjetivo={FuncionObjetivo} />

          {/* Panel Lateral de Detalles del Vértice */}
          <DetallesVertice verticeSelec={verticeSelec} setVerticeSelec={setVerticeSelec} solucion={solucion} />
          </div>
        </div>
      )}
        
      <AlertaTipoSolucion
        solucion={solucion}
        tipo_optimizacion={tipo_optimizacion}
      />

      {!solucion.es_infactible && (
        <TablaVertices
        solucion={solucion}
        onHover={setVerticeTablaHovered}
      />
      )}
    </div>
  );
}