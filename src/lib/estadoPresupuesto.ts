export type Estado = "SALUDABLE" | "CONTROLADO" | "ALERTA" | "COMPLETADO";

export function calcularEstado(ratio: number): Estado {
  if (ratio >= 1) return "COMPLETADO";
  if (ratio >= 0.8) return "ALERTA";
  if (ratio >= 0.5) return "CONTROLADO";
  return "SALUDABLE";
}
