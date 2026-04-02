interface props {
    pointer: {
        x: number;
        y: number;
    } | null;
    camera: {
        x: number;
        y: number;
        zoom: number;
    };
    FuncionObjetivo: number[];
}

export default function LabelFlotante({pointer, camera, FuncionObjetivo}: props) {
    return(
        pointer && (() => {
            const worldX = (pointer.x - camera.x) / camera.zoom;
            const worldY = (camera.y - pointer.y) / camera.zoom;
            const zVal = (FuncionObjetivo[0] || 0) * worldX + (FuncionObjetivo[1] || 0) * worldY;

            return (
              <div
                className="absolute pointer-events-none bg-slate-800/90 text-white text-xs px-3 py-2 rounded shadow-lg z-10 border border-slate-600 font-mono"
                style={{
                  left: pointer.x + 15,
                  top: pointer.y + 15,
                }}
              >
                <div className="flex justify-between gap-3"><span>x₁:</span> <span>{worldX.toFixed(2)}</span></div>
                <div className="flex justify-between gap-3"><span>x₂:</span> <span>{worldY.toFixed(2)}</span></div>
                <div className="border-t border-slate-600 mt-1 pt-1 font-bold text-emerald-400 flex justify-between gap-3">
                  <span>Z:</span> <span>{zVal.toFixed(2)}</span>
                </div>
              </div>
            );
          })()
    );
}