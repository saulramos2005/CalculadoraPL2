import { Target, RotateCcw, ZoomIn, ZoomOut, Maximize, Minimize } from 'lucide-react';
import { useState, useEffect } from 'react';

interface HeaderProps {
  onReset: () => void;
  onCenterOptimum: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onExportPNG: () => void;
  onToggleFullscreen: () => void;
  zoom: number;
  isFullscreen: boolean;
}

export function HeaderGrafica({ onReset, onCenterOptimum, onZoomIn, onZoomOut, zoom, isFullscreen, onToggleFullscreen }: HeaderProps) {
  const [exportMenuOpen, setExportMenuOpen] = useState(false);

  useEffect(() => {
    const closeMenu = () => setExportMenuOpen(false);
    if (exportMenuOpen) {
      window.addEventListener('click', closeMenu);
      return () => window.removeEventListener('click', closeMenu);
    }
  }, [exportMenuOpen]);

  return (
    <div className="flex justify-between gap-3">
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={onReset}
          className="flex items-center gap-1 px-3 py-1 bg-gray-200 text-gray-700 rounded-md text-sm hover:bg-gray-300 transition-colors"
        >
          <RotateCcw className="w-4 h-4" /> {window.innerWidth > 768 ? "Reiniciar Vista" : "Reiniciar"}
        </button>
        <button
          onClick={onCenterOptimum}
          className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-sm hover:bg-blue-200 transition-colors"
        >
          <Target className="w-4 h-4" /> {window.innerWidth > 768 ? "Centrar Óptimo" : "Óptimo"}
        </button>


      </div>
      <div className='flex gap-2'>
        <div className="flex items-center bg-gray-100 rounded-md border border-gray-300">
          <button onClick={onZoomOut} className="p-1.5 hover:bg-gray-200 text-gray-700 rounded-l-md transition-colors" title="Alejar">
            <ZoomOut className="w-4 h-4" />
          </button>
          <div className="px-2 text-sm font-mono text-gray-700 border-x border-gray-300 min-w-[60px] text-center">
            {zoom.toFixed(2)}x
          </div>
          <button onClick={onZoomIn} className="p-1.5 hover:bg-gray-200 text-gray-700 rounded-r-md transition-colors" title="Acercar">
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>
        <button
          onClick={onToggleFullscreen}
          className="flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-sm hover:bg-gray-200 transition-colors"
          title={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
        >
          {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}