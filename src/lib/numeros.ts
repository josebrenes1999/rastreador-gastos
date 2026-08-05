export function textoADecimal(texto: string): number {
  const normalizado = texto.replace(",", ".");
  const numero = Number(normalizado);
  return Number.isNaN(numero) ? 0 : numero;
}

export function decimalATexto(numero: number): string {
  return numero === 0 ? "" : numero.toString().replace(".", ",");
}
