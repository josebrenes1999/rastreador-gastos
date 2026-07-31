import { Gasto } from "../tipos";

type GastoItemProps = {
  gasto: Gasto;
};

function GastoItem({ gasto }: GastoItemProps) {
  return (
    <li>
      <p>ID: {gasto.id}</p>
      <p>Gasto: {gasto.monto}</p>
      <p>Categoría: {gasto.categoria}</p>
      <p>Fecha: {gasto.fecha}</p>
      <p>Descripción: {gasto.descripcion}</p>
    </li>
  );
}

export default GastoItem;   