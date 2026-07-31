export type Gasto = {
  id: number;
  monto: number;
  categoria: string;
  fecha: string; // De momento, en un futuro será type Date
  descripcion: string;
};

export const gastoEjemplos: Gasto[] = [
  { id: 1, monto: 100, categoria: "Cine", fecha: "30-07-2026", descripcion: "Cine con Andrea" },
  { id: 2, monto: 15, categoria: "Peluquería", fecha: "30-07-2026", descripcion: "Con Santi" },
];