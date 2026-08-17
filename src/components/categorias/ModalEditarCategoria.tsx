"use client";

import { useState } from "react";
import Modal from "../ui/Modal";
import CampoDecimal from "../ui/CampoDecimal";
import { actualizarCategoria } from "../../actions";
import { textoADecimal, decimalATexto } from "../../lib/numeros";
import { coloresPredefinidos } from "../../lib/colores";
import formStyles from "../ui/FormularioModal.module.css";

type Categoria = {
  id: number;
  nombre: string;
  limite: number;
  color: string;
};

type ModalEditarCategoriaProps = {
  categoria: Categoria;
  onGuardado: () => void;
  onCerrar: () => void;
};

function ModalEditarCategoria({ categoria, onGuardado, onCerrar }: ModalEditarCategoriaProps) {
  const [nombre, setNombre] = useState(categoria.nombre);
  const [limite, setLimite] = useState(decimalATexto(categoria.limite));
  const [color, setColor] = useState(categoria.color);

  async function guardar() {
    await actualizarCategoria(categoria.id, nombre, textoADecimal(limite), color);
    onGuardado();
  }

  return (
    <Modal titulo="Editar categoría" onCerrar={onCerrar}>
      <div className={formStyles.formulario}>
        <label className={formStyles.etiqueta}>Nombre</label>
        <input className={formStyles.input} value={nombre} onChange={(e) => setNombre(e.target.value)} />

        <label className={formStyles.etiqueta}>Límite mensual</label>
        <CampoDecimal className={formStyles.input} valor={limite} onCambiar={setLimite} />

        <label className={formStyles.etiqueta}>Color</label>
        <div className={formStyles.paletaColores}>
          {coloresPredefinidos.map((c) => (
            <button
              key={c}
              type="button"
              aria-label={`Elegir color ${c}`}
              className={`${formStyles.swatch} ${color === c ? formStyles.swatchSeleccionado : ""}`}
              style={{ backgroundColor: c }}
              onClick={() => setColor(c)}
            />
          ))}
          <input
            className={formStyles.swatchPersonalizado}
            type="color"
            title="Color personalizado"
            value={color}
            onChange={(e) => setColor(e.target.value)}
          />
        </div>

        <button className={formStyles.boton} onClick={guardar}>
          Guardar cambios
        </button>
      </div>
    </Modal>
  );
}

export default ModalEditarCategoria;
