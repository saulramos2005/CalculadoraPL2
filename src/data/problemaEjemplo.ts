import { ProblemaLineal } from "./interfaces";

export const problemaEjemplo: ProblemaLineal = {
  numVariables: 2,
  tipo_optimizacion: "max",
  FuncionObjetivo: [5, 4],
  desigualdades: [
    { id: "R1", coeficientes: [6, 4], operador: "<=", rhs: 24 },
    { id: "R2", coeficientes: [1, 2], operador: "<=", rhs: 6 },
    { id: "R3", coeficientes: [-1, 1], operador: "<=", rhs: 1 },
    { id: "R4", coeficientes: [0, 1], operador: "<=", rhs: 2 },
  ],
};