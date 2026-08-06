const MS_POR_DIA = 1000 * 60 * 60 * 24;

// El ciclo se repite: calculamos en qué repetición del ciclo original caemos hoy.
export function inicioCicloActual(cicloInicio: Date, duracionDias: number): Date {
  const diasDesdeInicio = Math.floor((Date.now() - cicloInicio.getTime()) / MS_POR_DIA);
  const ciclosCompletos = Math.max(Math.floor(diasDesdeInicio / duracionDias), 0);
  return new Date(cicloInicio.getTime() + ciclosCompletos * duracionDias * MS_POR_DIA);
}

export function calcularDiaCiclo(cicloInicio: Date, duracionDias: number) {
  const inicioActual = inicioCicloActual(cicloInicio, duracionDias);
  const diasTranscurridos = Math.floor((Date.now() - inicioActual.getTime()) / MS_POR_DIA) + 1;
  return Math.min(Math.max(diasTranscurridos, 1), duracionDias);
}

export function estaEnCicloActual(fecha: Date, cicloInicio: Date, duracionDias: number) {
  const inicioActual = inicioCicloActual(cicloInicio, duracionDias);
  const fin = new Date(inicioActual.getTime() + duracionDias * MS_POR_DIA);
  return fecha.getTime() >= inicioActual.getTime() && fecha.getTime() < fin.getTime();
}
