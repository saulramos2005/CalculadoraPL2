import { SolucionGrafica } from "@/types";

interface props {
    verticeSelec: any;
    setVerticeSelec: any;
    solucion: SolucionGrafica;
}
export default function DetallesVertice({verticeSelec, setVerticeSelec, solucion}:props) {
    return (
        verticeSelec && (
            <div className="absolute top-0 right-0 h-full w-48 sm:w-64 bg-white/95 backdrop-blur-sm shadow-xl border-l border-gray-200 p-4 sm:p-5 overflow-y-auto z-20 transition-all animate-in slide-in-from-right duration-200">
              <div className="flex justify-between items-start mb-4 gap-2">
                <h3 className="font-bold text-gray-800 text-base sm:text-lg leading-tight">Detalles del Vértice</h3>
                <button 
                  onClick={() => setVerticeSelec(null)}
                  className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-1 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                  <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Etiqueta</span>
                  <p className="text-lg sm:text-xl font-bold text-blue-900">{verticeSelec.label || "P"}</p>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Coordenadas</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="bg-gray-50 p-2 rounded border border-gray-200">
                      <span className="text-xs text-gray-500 block">x₁</span>
                      <span className="font-mono font-medium text-gray-800 text-sm sm:text-base">{verticeSelec.x.toFixed(4)}</span>
                    </div>
                    <div className="bg-gray-50 p-2 rounded border border-gray-200">
                      <span className="text-xs text-gray-500 block">x₂</span>
                      <span className="font-mono font-medium text-gray-800 text-sm sm:text-base">{verticeSelec.y.toFixed(4)}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Función Objetivo</h4>
                  <div className={`p-3 rounded-lg border ${
                    verticeSelec.x === solucion.VerticeOptimo.x && verticeSelec.y === solucion.VerticeOptimo.y
                    ? "bg-green-50 border-green-200" 
                    : "bg-gray-50 border-gray-200"
                  }`}>
                    <span className="text-xs text-gray-500 block">Valor Z</span>
                    <span className={`font-mono font-bold text-base sm:text-lg ${
                      verticeSelec.x === solucion.VerticeOptimo.x && verticeSelec.y === solucion.VerticeOptimo.y
                      ? "text-green-700" 
                      : "text-gray-800"
                    }`}>
                      {verticeSelec.value?.toFixed(4)}
                    </span>
                    {verticeSelec.x === solucion.VerticeOptimo.x && verticeSelec.y === solucion.VerticeOptimo.y && (
                      <span className="inline-block mt-1 text-xs font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                        Solución Óptima
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
    );
}