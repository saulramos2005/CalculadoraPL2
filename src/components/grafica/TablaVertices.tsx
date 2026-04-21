import { CheckCircle } from 'lucide-react';
import { SolucionGrafica } from '@/data/interfaces';

interface TablaProps {
  solucion: SolucionGrafica;
  onHover?: (vertex: any | null) => void;
}

export function TablaVertices({ solucion, onHover }: TablaProps) {
  const vertices = solucion.Vertices;
  const optimo = solucion.VerticeOptimo;
  return (
    <div className="bg-white rounded-md overflow-hidden border border-gray-200">
      {/* <div className="bg-gray-50 px-4 py-2.5 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-gray-800 font-medium">Análisis de los vértices</h3>
      </div> */}
      
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-cyan-50">
                  <tr className='text-center'>
                    <th className="px-4 py-3">Vértice</th>
                    <th className="px-4 py-3">Coordenadas (x₁, x₂)</th>
                    <th className="px-4 py-3">Valor Z</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {vertices.map((v, idx) => {
                    const isOptimal = v.x === optimo.x && v.y === optimo.y;
                    return (
                      <tr 
                        key={idx} 
                        className={`text-center ${isOptimal ? 'bg-green-100/70' : 'bg-white'} hover:bg-cyan-50 transition-colors cursor-pointer`}
                        onMouseEnter={() => onHover?.(v)}
                        onMouseLeave={() => onHover?.(null)}
                      >
                        <td className="px-4 py-4 font-medium text-gray-900">{v.label || `P${idx + 1}`}</td>
                        <td className="px-4 py-4 font-mono text-gray-500">({v.x.toFixed(3)}, {v.y.toFixed(3)})</td>
                        <td className="py-4 font-mono text-gray-800 text-center">{v.valor!.toFixed(3)}</td>
                        <td className="pr-2 py-4 text-center">
                          {isOptimal && (
                            <span className="flex items-center rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <CheckCircle className="size-4" />
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
    </div>
  );
}