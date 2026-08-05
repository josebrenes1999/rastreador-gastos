export function calcularDiaCiclo(cicloInicio: Date, duracionDias: number) {
  const msPorDia = 1000 * 60 * 60 * 24;
  const diasTranscurridos = Math.floor((Date.now() - cicloInicio.getTime()) / msPorDia) + 1;
  return Math.min(Math.max(diasTranscurridos, 1), duracionDias);
}

export function estaEnCicloActual(fecha: Date, cicloInicio: Date, duracionDias: number) {
  const msPorDia = 1000 * 60 * 60 * 24;
  const fin = new Date(cicloInicio.getTime() + duracionDias * msPorDia);
  return fecha.getTime() >= cicloInicio.getTime() && fecha.getTime() < fin.getTime();
}
