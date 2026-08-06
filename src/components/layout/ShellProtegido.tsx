"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import Sidebar from "./Sidebar";
import Modal from "../ui/Modal";
import CampoDecimal from "../ui/CampoDecimal";
import { crearGasto, crearIngreso, obtenerCategorias } from "../../actions";
import { textoADecimal } from "../../lib/numeros";
import styles from "./ShellProtegido.module.css";
import formStyles from "../ui/FormularioModal.module.css";

type Categoria = {
  id: number;
  nombre: string;
  limite: number;
  color: string;
};

type ShellProtegidoProps = {
  nombre: string;
  email: string;
  children: ReactNode;
};

function ShellProtegido({ nombre, email, children }: ShellProtegidoProps) {
  const [modalAbierto, setModalAbierto] = useState<"gasto" | "ingreso" | null>(null);
  const [categorias, setCategorias] = useState<Categoria[]>([]);

  const [categoriaId, setCategoriaId] = useState(0);
  const [descripcionGasto, setDescripcionGasto] = useState("");
  const [montoGasto, setMontoGasto] = useState("");
  const [fechaGasto, setFechaGasto] = useState("");

  const [descripcionIngreso, setDescripcionIngreso] = useState("");
  const [montoIngreso, setMontoIngreso] = useState("");
  const [fechaIngreso, setFechaIngreso] = useState("");

  async function abrirModalGasto() {
    const datos = await obtenerCategorias();
    setCategorias(datos);
    if (datos.length > 0) {
      setCategoriaId(datos[0].id);
    }
    setModalAbierto("gasto");
  }

  async function enviarGasto() {
    await crearGasto(categoriaId, textoADecimal(montoGasto), fechaGasto, descripcionGasto);
    window.location.reload();
  }

  async function enviarIngreso() {
    await crearIngreso(textoADecimal(montoIngreso), fechaIngreso, descripcionIngreso);
    window.location.reload();
  }

  return (
    <div className={styles.app}>
      <Sidebar
        nombre={nombre}
        email={email}
        onAbrirGasto={abrirModalGasto}
        onAbrirIngreso={() => setModalAbierto("ingreso")}
      />
      <div className={styles.contenido}>{children}</div>

      {modalAbierto === "gasto" && (
        <Modal titulo="Añadir gasto" onCerrar={() => setModalAbierto(null)}>
          <div className={formStyles.formulario}>
            {categorias.length === 0 ? (
              <p className={formStyles.aviso}>Crea antes una categoría desde Presupuestos.</p>
            ) : (
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
                <label className={formStyles.etiqueta}>Descripción</label>
                <input
                  className={formStyles.input}
                  value={descripcionGasto}
                  placeholder="Ej: Compra semanal"
                  onChange={(e) => setDescripcionGasto(e.target.value)}
                />
                <label className={formStyles.etiqueta}>Importe</label>
                <CampoDecimal
                  className={formStyles.input}
                  placeholder="0,00€"
                  valor={montoGasto}
                  onCambiar={setMontoGasto}
                />
                <label className={formStyles.etiqueta}>Fecha</label>
                <input
                  className={formStyles.input}
                  type="date"
                  value={fechaGasto}
                  onChange={(e) => setFechaGasto(e.target.value)}
                />
                <button className={formStyles.boton} onClick={enviarGasto}>
                  Guardar gasto
                </button>
              </>
            )}
          </div>
        </Modal>
      )}

      {modalAbierto === "ingreso" && (
        <Modal titulo="Añadir ingreso" onCerrar={() => setModalAbierto(null)}>
          <div className={formStyles.formulario}>
            <label className={formStyles.etiqueta}>Descripción</label>
            <input
              className={formStyles.input}
              value={descripcionIngreso}
              placeholder="Ej: Nómina"
              onChange={(e) => setDescripcionIngreso(e.target.value)}
            />
            <label className={formStyles.etiqueta}>Importe</label>
            <CampoDecimal
              className={formStyles.input}
              placeholder="0,00€"
              valor={montoIngreso}
              onCambiar={setMontoIngreso}
            />
            <label className={formStyles.etiqueta}>Fecha</label>
            <input
              className={formStyles.input}
              type="date"
              value={fechaIngreso}
              onChange={(e) => setFechaIngreso(e.target.value)}
            />
            <button className={formStyles.boton} onClick={enviarIngreso}>
              Guardar ingreso
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default ShellProtegido;
