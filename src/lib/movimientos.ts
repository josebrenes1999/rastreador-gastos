export type Categoria = {
  id: number;
  nombre: string;
  limite: number;
  color: string;
};

export type Movimiento =
  | {
      tipo: "gasto";
      id: number;
      monto: number;
      fecha: Date;
      descripcion: string;
      categoria: Categoria;
      categoriaId: number;
    }
  | { tipo: "ingreso"; id: number; monto: number; fecha: Date; descripcion: string };
