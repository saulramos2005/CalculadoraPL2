import { Target, RefreshCcw as RotateCcw, ZoomIn, ZoomOut, Maximize, Minimize } from 'lucide-react';
import { useState, useEffect } from 'react';
import { baseButtonClass, tooltipClass } from '@/data/styles';
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
      <div className="flex items-center gap-2">
        <button
          onClick={onReset}
          className={baseButtonClass}
          aria-label="Reiniciar vista"
        >
          <RotateCcw size={18} />
          <span className={tooltipClass}>Reiniciar vista</span>
        </button>
        <button
          onClick={onCenterOptimum}
          className={baseButtonClass}
          aria-label="Centrar óptimo"
        >
          <Target size={18} />
          <span className={tooltipClass}>Centrar óptimo</span>
        </button>
      </div>
      
      <div className="flex gap-2">
        <div className="flex items-center rounded-md border border-slate-300 bg-cyan-50 dark:border-slate-600 dark:bg-cyan-600/20">
          <button onClick={onZoomOut} aria-label="Alejar" className="group relative p-1.5 text-slate-700 transition hover:bg-cyan-100 dark:text-slate-100 dark:hover:bg-cyan-900/40 rounded-l-md">
            <ZoomOut size={18} />
            <span className={tooltipClass}>Alejar</span>
          </button>
          <div className="border-x border-slate-300 px-2 text-center text-sm font-mono text-slate-700 min-w-[60px] dark:border-slate-600 dark:text-slate-100">
            {zoom.toFixed(2)}x
          </div>
          <button onClick={onZoomIn} aria-label="Acercar" className="group relative p-1.5 text-slate-700 transition hover:bg-cyan-100 dark:text-slate-100 dark:hover:bg-cyan-900/40 rounded-r-md">
            <ZoomIn size={18} />
            <span className={tooltipClass}>Acercar</span>
          </button>
        </div>
        
        <button
          onClick={onToggleFullscreen}
          className={baseButtonClass}
          aria-label={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
        >
          {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
          <span className="pointer-events-none absolute bottom-full right-0 z-50 mb-2 whitespace-nowrap rounded bg-slate-800 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100 dark:bg-slate-200 dark:text-slate-900">
            {isFullscreen ? "Contraer" : "Pantalla completa"}
          </span>
        </button>
      </div>
    </div>
  );
}