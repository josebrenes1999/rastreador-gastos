"use client";

import { useState, useEffect } from "react";
import {
  obtenerGastos,
  crearGasto,
  borrarGasto as borrarGastoDB,
  obtenerCategorias,
  crearCategoria,
  obtenerConfiguracion,
  actualizarConfiguracion,
} from "../../actions";
import { calcularDiaCiclo } from "../../lib/ciclo";
import { coloresPredefinidos } from "../../lib/colores";
import { textoADecimal, decimalATexto } from "../../lib/numeros";
import CampoDecimal from "../../components/CampoDecimal";
import styles from "./page.module.css";

type Categoria = {
  id: number;
  nombre: string;
  limite: number;
  color: string;
};

type Gasto = {
  id: number;
  monto: number;
  fecha: Date;
  descripcion: string;
  categoria: Categoria;
  categoriaId: number;
};

type Configuracion = {
  presupuestoMensual: number;
  cicloInicio: Date;
  cicloDuracionDias: number;
};

export default function Home() {
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [categoriaId, setCategoriaId] = useState(0);
  const [descripcion, setDescripcion] = useState("");
  const [monto, setMonto] = useState("");
  const [fecha, setFecha] = useState("");
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [nombreCategoria, setNombreCategoria] = useState("");
  const [limiteCategoria, setLimiteCategoria] = useState("");
  const [colorCategoria, setColorCategoria] = useState(coloresPredefinidos[0]);
  const [mostrarFormCategoria, setMostrarFormCategoria] = useState(false);

  const [configuracion, setConfiguracion] = useState<Configuracion | null>(null);
  const [editandoConfig, setEditandoConfig] = useState(false);
  const [presupuestoInput, setPresupuestoInput] = useState("");
  const [cicloInicioInput, setCicloInicioInput] = useState("");
  const [cicloDuracionInput, setCicloDuracionInput] = useState(30);

  const gastoTotal = gastos.reduce((acumulado, gastoActual) => acumulado + gastoActual.monto, 0);
  const restante = configuracion ? configuracion.presupuestoMensual - gastoTotal : 0;
  const diaCiclo = configuracion ? calcularDiaCiclo(configuracion.cicloInicio, configuracion.cicloDuracionDias) : 0;

  useEffect(() => {
    async function cargarDatos() {
      const datos = await obtenerGastos();
      const datosCategorias = await obtenerCategorias();
      const config = await obtenerConfiguracion();
      setGastos(datos);
      setCategorias(datosCategorias);
      if (datosCategorias.length > 0) {
        setCategoriaId(datosCategorias[0].id);
      }
      setConfiguracion(config);
      setPresupuestoInput(decimalATexto(config.presupuestoMensual));
      setCicloInicioInput(config.cicloInicio.toISOString().slice(0, 10));
      setCicloDuracionInput(config.cicloDuracionDias);
    }
    cargarDatos();
  }, []);

  async function agregarGasto() {
    await crearGasto(categoriaId, textoADecimal(monto), fecha, descripcion);
    const datos = await obtenerGastos();
    setGastos(datos);
    setDescripcion("");
    setMonto("");
    setFecha("");
  }

  async function agregarCategoria() {
    await crearCategoria(nombreCategoria, textoADecimal(limiteCategoria), colorCategoria);
    const datosCategorias = await obtenerCategorias();
    setCategorias(datosCategorias);
    if (categoriaId === 0 && datosCategorias.length > 0) {
      setCategoriaId(datosCategorias[0].id);
    }
    setNombreCategoria("");
    setLimiteCategoria("");
    setColorCategoria(coloresPredefinidos[0]);
    setMostrarFormCategoria(false);
  }

  async function borrarGasto(id: number) {
    await borrarGastoDB(id);
    const datos = await obtenerGastos();
    setGastos(datos);
  }

  async function guardarConfiguracion() {
    const actualizado = await actualizarConfiguracion(textoADecimal(presupuestoInput), cicloInicioInput, cicloDuracionInput);
    setConfiguracion(actualizado);
    setPresupuestoInput(decimalATexto(actualizado.presupuestoMensual));
    setEditandoConfig(false);
  }

  return (
    <main className={styles.main}>
      <header className={styles.cabecera}>
        <h1 className={styles.titulo}>Rastreador de Gastos</h1>
        <p className={styles.subtitulo}>Gestiona tus finanzas con precisión y transparencia.</p>
      </header>

      <div className={styles.filaSuperior}>
        <section className={styles.tarjeta}>
          <div className={styles.tarjetaCabecera}>
            <span className={styles.etiqueta}>RESUMEN GENERAL</span>
            <button className={styles.botonIcono} onClick={() => setEditandoConfig(!editandoConfig)}>
              ⚙
            </button>
          </div>
          <p className={styles.gastoTotal}>
            Gasto Total: <strong>{gastoTotal.toFixed(2)}€</strong>
          </p>

          {editandoConfig ? (
            <div className={styles.formularioConfig}>
              <label className={styles.etiquetaCampo}>Presupuesto mensual</label>
              <CampoDecimal className={styles.input} valor={presupuestoInput} onCambiar={setPresupuestoInput} />
              <label className={styles.etiquetaCampo}>Inicio de ciclo</label>
              <input
                className={styles.input}
                type="date"
                value={cicloInicioInput}
                onChange={(e) => setCicloInicioInput(e.target.value)}
              />
              <label className={styles.etiquetaCampo}>Duración del ciclo (días)</label>
              <input
                className={styles.input}
                value={cicloDuracionInput === 0 ? "" : cicloDuracionInput}
                onChange={(e) => setCicloDuracionInput(Number(e.target.value))}
              />
              <button className={styles.boton} onClick={guardarConfiguracion}>
                Guardar
              </button>
            </div>
          ) : (
            configuracion && (
              <div className={styles.miniStats}>
                <div className={styles.miniStat}>
                  <span className={styles.miniEtiqueta}>Presupuesto</span>
                  <span className={styles.miniValor}>{configuracion.presupuestoMensual.toFixed(2)}€</span>
                </div>
                <div className={styles.miniStat}>
                  <span className={styles.miniEtiqueta}>Restante</span>
                  <span className={`${styles.miniValor} ${restante < 0 ? styles.negativo : styles.positivo}`}>
                    {restante.toFixed(2)}€
                  </span>
                </div>
                <div className={`${styles.miniStat} ${styles.miniStatAncho}`}>
                  <span className={styles.miniEtiqueta}>Días del Ciclo</span>
                  <span className={styles.miniValor}>
                    {diaCiclo} / {configuracion.cicloDuracionDias}
                  </span>
                </div>
              </div>
            )
          )}
        </section>

        <section className={styles.tarjeta}>
          <h2 className={styles.tituloTarjeta}>Agregar Gasto</h2>
          <div className={styles.formulario}>
            <div className={styles.filaCategoria}>
              <div className={styles.campo} style={{ flex: 1 }}>
                <label className={styles.etiquetaCampo}>Categoría</label>
                {categorias.length > 0 ? (
                  <select
                    className={styles.input}
                    value={categoriaId}
                    onChange={(e) => setCategoriaId(Number(e.target.value))}
                  >
                    {categorias.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.nombre}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className={styles.aviso}>Aún no tienes categorías.</p>
                )}
              </div>
              <div className={styles.anclaDesplegable}>
                <button
                  type="button"
                  className={styles.botonSecundario}
                  onClick={() => setMostrarFormCategoria(!mostrarFormCategoria)}
                >
                  + Nueva categoría
                </button>

                {mostrarFormCategoria && (
                  <div className={styles.subFormulario}>
                    <label className={styles.etiquetaCampo}>Nombre</label>
                    <input
                      className={styles.input}
                      value={nombreCategoria}
                      placeholder="Ej: Alimentación"
                      onChange={(e) => setNombreCategoria(e.target.value)}
                    />
                    <label className={styles.etiquetaCampo}>Límite mensual</label>
                    <CampoDecimal
                      className={styles.input}
                      placeholder="0,00€"
                      valor={limiteCategoria}
                      onCambiar={setLimiteCategoria}
                    />
                    <label className={styles.etiquetaCampo}>Color</label>
                    <div className={styles.paletaColores}>
                      {coloresPredefinidos.map((c) => (
                        <button
                          key={c}
                          type="button"
                          aria-label={`Elegir color ${c}`}
                          className={`${styles.swatch} ${colorCategoria === c ? styles.swatchSeleccionado : ""}`}
                          style={{ backgroundColor: c }}
                          onClick={() => setColorCategoria(c)}
                        />
                      ))}
                      <input
                        className={styles.swatchPersonalizado}
                        type="color"
                        title="Color personalizado"
                        value={colorCategoria}
                        onChange={(e) => setColorCategoria(e.target.value)}
                      />
                    </div>
                    <button className={styles.boton} onClick={agregarCategoria}>
                      Crear categoría
                    </button>
                  </div>
                )}
              </div>
            </div>

            {categorias.length > 0 && (
              <>
                <label className={styles.etiquetaCampo}>Descripción</label>
                <input
                  className={styles.input}
                  value={descripcion}
                  placeholder="Ej: Compra semanal"
                  onChange={(e) => setDescripcion(e.target.value)}
                />
                <div className={styles.filaDoble}>
                  <div className={styles.campo}>
                    <label className={styles.etiquetaCampo}>Importe</label>
                    <CampoDecimal className={styles.input} placeholder="0,00€" valor={monto} onCambiar={setMonto} />
                  </div>
                  <div className={styles.campo}>
                    <label className={styles.etiquetaCampo}>Fecha</label>
                    <input
                      className={styles.input}
                      type="date"
                      value={fecha}
                      onChange={(e) => setFecha(e.target.value)}
                    />
                  </div>
                </div>
                <button className={styles.boton} onClick={agregarGasto}>
                  Agregar Gasto
                </button>
              </>
            )}
          </div>
        </section>
      </div>

      <section className={styles.tarjeta}>
        <h2 className={styles.tituloTarjeta}>Lista de Gastos</h2>
        {gastos.length === 0 ? (
          <p className={styles.aviso}>Todavía no hay gastos registrados.</p>
        ) : (
          <div className={styles.tablaContenedor}>
            <table className={styles.tabla}>
              <thead>
                <tr>
                  <th>Detalles</th>
                  <th>Categoría</th>
                  <th>Fecha</th>
                  <th>Importe</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {gastos.map((gasto) => (
                  <tr key={gasto.id}>
                    <td>{gasto.descripcion}</td>
                    <td>
                      <span
                        className={styles.badge}
                        style={{ backgroundColor: `${gasto.categoria.color}26`, color: gasto.categoria.color }}
                      >
                        {gasto.categoria.nombre.toUpperCase()}
                      </span>
                    </td>
                    <td className={styles.celdaApagada}>
                      {gasto.fecha.toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" })}
                    </td>
                    <td className={styles.importe}>-{gasto.monto.toFixed(2)}€</td>
                    <td>
                      <button className={styles.botonBorrar} onClick={() => borrarGasto(gasto.id)}>
                        🗑
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
