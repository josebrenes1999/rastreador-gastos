type Gasto = {
  id : number;
  monto : number;
  categoria : string;
  fecha : string; // De momento, en un futuro será type : Date
  descripcion : string;
}

const gastoEjemplos: Gasto[] = [
  { id : 1,
    monto : 100,
    categoria : "Cine",
    fecha : "30-07-2026",
    descripcion : "Cine con Andrea"},

  { id : 2,
    monto: 15,
    categoria : "Peluquería",
    fecha : "30-07-2026",
    descripcion : "Con Santi"}
]

type GastoItemProps = {
  gasto: Gasto;
};

function GastoItem( { gasto }: GastoItemProps){
  return (
    <li>
      <p>ID: {gasto.id} </p>
      <p>Monto: { gasto.monto }</p>
      <p>Categoría: { gasto.categoria }</p>
      <p>Fecha: { gasto.fecha }</p>
      <p>Descripción: { gasto.descripcion }</p>
    </li>
  )
}