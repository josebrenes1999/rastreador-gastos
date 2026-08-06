"use client";

import { useState } from "react";
import Modal from "../ui/Modal";
import CampoDecimal from "../ui/CampoDecimal";
import { actualizarGasto, actualizarIngreso } from "../../actions";
import { textoADecimal, decimalATexto } from "../../lib/numeros";
import type { Movimiento, Categoria } from "../../lib/movimientos";
import formStyles from "../ui/FormularioModal.module.css";

type ModalEditarMovimientoProps = {
  movimiento: Movimiento;
  categorias: Categoria[];
  onGuardado: () => void;
  onCerrar: () => void;
};

function ModalEditarMovimiento({ movimiento, categorias, onGuardado, onCerrar }: ModalEditarMovimientoProps) {
  const [descripcion, setDescripcion] = useState(movimiento.descripcion);
  const [monto, setMonto] = useState(decimalATexto(movimiento.monto));
  const [fecha, setFecha] = useState(movimiento.fecha.toISOString().slice(0, 10));
  const [categoriaId, setCategoriaId] = useState(movimiento.tipo === "gasto" ? movimiento.categoriaId : 0);

  async function guardar() {
    if (movimiento.tipo === "gasto") {
      await actualizarGasto(movimiento.id, categoriaId, textoADecimal(monto), fecha, descripcion);
    } else {
      await actualizarIngreso(movimiento.id, textoADecimal(monto), fecha, descripcion);
    }
    onGuardado();
  }

  return (
    <Modal titulo={movimiento.tipo === "gasto" ? "Editar gasto" : "Editar ingreso"} onCerrar={onCerrar}>
      <div className={formStyles.formulario}>
        {movimiento.tipo === "gasto" && (
          <>
            <label className={formStyles.etiqueta}>Categoría</label>
            <select
              className={formStyles.input}
              value={categoriaId}
              onChange={(e) => setCategoriaId(Number(e.target.value))}
            >
              {categorias.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.nombre}
                </option>
              ))}
            </select>
          </>
        )}
        <label className={formStyles.etiqueta}>Descripción</label>
        <input className={formStyles.input} value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
        <label className={formStyles.etiqueta}>Importe</label>
        <CampoDecimal className={formStyles.input} valor={monto} onCambiar={setMonto} />
        <label className={formStyles.etiqueta}>Fecha</label>
        <input className={formStyles.input} type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
        <button className={formStyles.boton} onClick={guardar}>
          Guardar cambios
        </button>
      </div>
    </Modal>
  );
}

export default ModalEditarMovimiento;
