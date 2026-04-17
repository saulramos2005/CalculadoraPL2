import { Solucion } from "@/data/interfaces";
import { AlertTriangle, AlertCircle } from "lucide-react";
interface props {
  solucion: Solucion;
  tipo_optimizacion: "max" | "min";
}

const estilos: Record<Solucion["analysis"]["tipo_solucion"], any> = {
  Unica: {
    text_color: "text-green-900",
    bg_color: "bg-green-50 border border-green-200",
    titulo: "Solución Única",
    descripcion:
      "Existe una única solución que satisface las restricciones del problema y ofrece el valor óptimo.",
  },
  Multiple: {
    text_color: "text-blue-900",
    bg_color: "bg-blue-50 border border-blue-200",
    titulo: "Solución Múltiple",
    descripcion:
      "Existen múltiples soluciones que satisfacen las restricciones del problema y ofrecen el valor óptimo. Por simplicidad, el sistema marca como óptimo el primer valor obtenido entre dichas soluciones.",
  },
  Infactible: {
    text_color: "text-red-900",
    bg_color: "bg-red-50 border border-red-200",
    titulo: "Solución Infactible",
    descripcion:
      "No existe una solución que cumpla con las restricciones del problema.",
  },
  Degenerada: {
    text_color: "text-yellow-900",
    bg_color: "bg-yellow-50 border border-yellow-200",
    titulo: "Solución Degenerada",
    descripcion:
      "La solucion encontrada presenta degeneración, en el metodo grafico esto se puede evidenciar al haber más de dos restricciones intersectandose en un punto.",
  },
  Indefinida: {
    text_color: "text-yellow-900",
    bg_color: "bg-yellow-50 border border-yellow-200",
    titulo: "Solución No Acotada",
    descripcion:
      "Los datos de la tabla no deben tomarse como valores máximos o mínimos ya que la función puede crecer o decrecer indefinidamente. El sistema marcará como óptimo el mejor valor obtenido dentro de sus limites.",
  },
};
const iconos: Record<Solucion["analysis"]["tipo_solucion"], any> = {
  Unica: {
    icono: AlertCircle,
    color: "text-green-600",
  },
  Multiple: {
    icono: AlertCircle,
    color: "text-blue-600",
  },
  Infactible: {
    icono: AlertTriangle,
    color: "text-red-600",
  },
  Degenerada: {
    icono: AlertTriangle,
    color: "text-yellow-600",
  },
  Indefinida: {
    icono: AlertTriangle,
    color: "text-yellow-600",
  },
};

export default function AlertaTipoSolucion({
  solucion,
}: props) {
  const estilo = estilos[solucion.analysis.tipo_solucion];
  const configIcono = iconos[solucion.analysis.tipo_solucion];
  const Icono = configIcono.icono;

  return (
    <div>
      <div className={`p-4 rounded-lg ${estilo.bg_color}`}>
      <div className="flex gap-2 items-center shrink-0 mb-2">
        <Icono className={`size-5 ${configIcono.color}`} />
        <h4 className={`font-semibold ${estilo.text_color}`}>
          {estilo.titulo}
        </h4>
      </div>
      <p className={`text-sm ${estilo.text_color} mt-1`}>
        {estilo.descripcion}
      </p>
    </div>
    </div>
  );
}