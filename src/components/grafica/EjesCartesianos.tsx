interface EjesProps {
  ancho: number;
  alto: number;
  padding: number;
  ticksX: number[];
  ticksY: number[];
  toScreenX: (val: number) => number;
  toScreenY: (val: number) => number;
}

export function EjesCartesianos({ ancho, alto, padding, ticksX, ticksY, toScreenX, toScreenY }: EjesProps) {
  return (
    <g pointerEvents="none" className="select-none">
      {/* Líneas de Ejes Principales */}
      <line x1={padding} y1={alto - padding} x2={ancho - padding} y2={alto - padding} stroke="#1f2937" strokeWidth="2" />
      <line x1={padding} y1={alto - padding} x2={padding} y2={padding} stroke="#1f2937" strokeWidth="2" />
      
      {/* Etiquetas de Variable */}
      <text x={ancho - padding + 15} y={alto - padding + 5} fontSize="14" fontWeight="bold" fill="#1f2937">x₁</text>
      <text x={padding} y={padding - 15} fontSize="14" fontWeight="bold" fill="#1f2937" textAnchor="middle">x₂</text>

      {/* Marcas Eje X */}
      {ticksX.map((val, i) => {
        const xPos = toScreenX(val);
        if (xPos < padding || xPos > ancho - padding) return null;
        return (
          <g key={`x-${i}`}>
            <line x1={xPos} y1={alto - padding} x2={xPos} y2={alto - padding + 6} stroke="#4b5563" strokeWidth="1" />
            <text x={xPos} y={alto - padding + 22} textAnchor="middle" fontSize="10" fill="#6b7280">{val.toFixed(1)}</text>
          </g>
        );
      })}

      {/* Marcas Eje Y */}
      {ticksY.map((val, i) => {
        const yPos = toScreenY(val);
        if (yPos > alto - padding || yPos < padding) return null;
        return (
          <g key={`y-${i}`}>
            <line x1={padding - 6} y1={yPos} x2={padding} y2={yPos} stroke="#4b5563" strokeWidth="1" />
            <text x={padding - 12} y={yPos + 4} textAnchor="end" fontSize="10" fill="#6b7280">{val.toFixed(1)}</text>
          </g>
        );
      })}
    </g>
  );
}