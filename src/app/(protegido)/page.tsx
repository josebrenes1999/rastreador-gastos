"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  obtenerGastos,
  obtenerIngresos,
  obtenerCategorias,
  obtenerConfiguracion,
  actualizarConfiguracion,
  borrarGasto as borrarGastoDB,
  borrarIngreso as borrarIngresoDB,
} from "../../actions";
import { calcularDiaCiclo, estaEnCicloActual } from "../../lib/ciclo";
import { textoADecimal, decimalATexto } from "../../lib/numeros";
import type { Categoria, Movimiento } from "../../lib/movimientos";
import CampoDecimal from "../../components/ui/CampoDecimal";
import ModalEditarMovimiento from "../../components/movimientos/ModalEditarMovimiento";
import IconoEditar from "../../components/ui/IconoEditar";
import styles from "./page.module.css";

type Gasto = {
  id: number;
  monto: number;
  fecha: Date;
  descripcion: string;
  categoria: Categoria;
  categoriaId: number;
};

type Ingreso = {
  id: number;
  monto: number;
  fecha: Date;
  descripcion: string;
};

type Configuracion = {
  presupuestoMensual: number;
  cicloInicio: Date;
  cicloDuracionDias: number;
};

function IconoBalance() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
      <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
      <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
    </svg>
  );
}

function IconoIngreso() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  );
}

function IconoGasto() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 17 13.5 8.5 8.5 13.5 2 7" />
      <polyline points="16 17 22 17 22 11" />
    </svg>
  );
}

function IconoInfo() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
}

export default function Home() {
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [ingresos, setIngresos] = useState<Ingreso[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);

  const [editando, setEditando] = useState<Movimiento | null>(null);

  const [configuracion, setConfiguracion] = useState<Configuracion | null>(null);
  const [editandoConfig, setEditandoConfig] = useState(false);
  const [presupuestoInput, setPresupuestoInput] = useState("");
  const [cicloInicioInput, setCicloInicioInput] = useState("");
  const [cicloDuracionInput, setCicloDuracionInput] = useState(30);

  const gastosDelCiclo = configuracion
    ? gastos.filter((g) => estaEnCicloActual(g.fecha, configuracion.cicloInicio, configuracion.cicloDuracionDias))
    : [];
  const gastoTotal = gastosDelCiclo.reduce((acumulado, gastoActual) => acumulado + gastoActual.monto, 0);
  const restante = configuracion ? configuracion.presupuestoMensual - gastoTotal : 0;
  const diaCiclo = configuracion ? calcularDiaCiclo(configuracion.cicloInicio, configuracion.cicloDuracionDias) : 0;
  const diasRestantes = configuracion ? Math.max(configuracion.cicloDuracionDias - diaCiclo, 0) : 0;
  const pctUsado =
    configuracion && configuracion.presupuestoMensual > 0
      ? Math.min((gastoTotal / configuracion.presupuestoMensual) * 100, 100)
      : 0;
  const pctRestante =
    configuracion && configuracion.presupuestoMensual > 0
      ? Math.round((restante / configuracion.presupuestoMensual) * 100)
      : 0;

  const ingresosDelCiclo = configuracion
    ? ingresos.filter((i) => estaEnCicloActual(i.fecha, configuracion.cicloInicio, configuracion.cicloDuracionDias))
    : [];
  const ingresoTotal = ingresosDelCiclo.reduce((acumulado, ingresoActual) => acumulado + ingresoActual.monto, 0);
  const balance = ingresoTotal - gastoTotal;

  const distribucionCategorias = categorias
    .map((cat) => {
      const gastado = gastosDelCiclo.filter((g) => g.categoriaId === cat.id).reduce((acumulado, g) => acumulado + g.monto, 0);
      const pct = gastoTotal > 0 ? (gastado / gastoTotal) * 100 : 0;
      return { ...cat, gastado, pct };
    })
    .filter((c) => c.gastado > 0)
    .sort((a, b) => b.pct - a.pct);

  const movimientos: Movimiento[] = [
    ...gastos.map(
      (g): Movimiento => ({
        tipo: "gasto",
        id: g.id,
        monto: g.monto,
        fecha: g.fecha,
        descripcion: g.descripcion,
        categoria: g.categoria,
        categoriaId: g.categoriaId,
      })
    ),
    ...ingresos.map((i): Movimiento => ({ tipo: "ingreso", id: i.id, monto: i.monto, fecha: i.fecha, descripcion: i.descripcion })),
  ]
    .sort((a, b) => b.fecha.getTime() - a.fecha.getTime())
    .slice(0, 5);

  useEffect(() => {
    async function cargarDatos() {
      const datos = await obtenerGastos();
      const datosIngresos = await obtenerIngresos();
      const datosCategorias = await obtenerCategorias();
      const config = await obtenerConfiguracion();
      setGastos(datos);
      setIngresos(datosIngresos);
      setCategorias(datosCategorias);
      setConfiguracion(config);
      setPresupuestoInput(decimalATexto(config.presupuestoMensual));
      setCicloInicioInput(config.cicloInicio.toISOString().slice(0, 10));
      setCicloDuracionInput(config.cicloDuracionDias);
    }
    cargarDatos();
  }, []);

  async function borrarMovimiento(movimiento: Movimiento) {
    if (movimiento.tipo === "gasto") {
      await borrarGastoDB(movimiento.id);
    } else {
      await borrarIngresoDB(movimiento.id);
    }
    const [datos, datosIngresos] = await Promise.all([obtenerGastos(), obtenerIngresos()]);
    setGastos(datos);
    setIngresos(datosIngresos);
  }

  async function recargarMovimientos() {
    const [datos, datosIngresos] = await Promise.all([obtenerGastos(), obtenerIngresos()]);
    setGastos(datos);
    setIngresos(datosIngresos);
    setEditando(null);
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

      <div className={styles.filaStats}>
        <section className={styles.tarjeta}>
          <div className={styles.statCabecera}>
            <span className={styles.etiqueta}>TOTAL BALANCE</span>
            <span className={`${styles.statIcono} ${styles.iconoAcento}`}>
              <IconoBalance />
            </span>
          </div>
          <p className={`${styles.statValor} ${balance < 0 ? styles.negativo : styles.positivo}`}>
            {balance.toFixed(2)}€
          </p>
        </section>

        <section className={styles.tarjeta}>
          <div className={styles.statCabecera}>
            <span className={styles.etiqueta}>INGRESOS</span>
            <span className={`${styles.statIcono} ${styles.iconoAcento}`}>
              <IconoIngreso />
            </span>
          </div>
          <p className={`${styles.statValor} ${styles.positivo}`}>{ingresoTotal.toFixed(2)}€</p>
        </section>

        <section className={styles.tarjeta}>
          <div className={styles.statCabecera}>
            <span className={styles.etiqueta}>GASTO TOTAL</span>
            <span className={`${styles.statIcono} ${styles.iconoPeligro}`}>
              <IconoGasto />
            </span>
          </div>
          <p className={`${styles.statValor} ${styles.negativo}`}>{gastoTotal.toFixed(2)}€</p>
        </section>
      </div>

      <div className={styles.filaSuperior}>
        <section className={styles.tarjeta}>
          <div className={styles.tarjetaCabecera}>
            <span className={styles.etiqueta}>PROGRESO DEL PRESUPUESTO</span>
            <div className={styles.cabeceraAcciones}>
              {!editandoConfig && configuracion && (
                <span className={`${styles.pctRestante} ${pctRestante < 0 ? styles.negativo : styles.positivo}`}>
                  {pctRestante}% Restante
                </span>
              )}
              <button className={styles.botonIcono} onClick={() => setEditandoConfig(!editandoConfig)}>
                ⚙
              </button>
            </div>
          </div>

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
              <>
                <div className={styles.barraProgreso}>
                  <div className={styles.barraRelleno} style={{ width: `${pctUsado}%` }} />
                </div>
                <div className={styles.filaPresupuestoMensual}>
                  <span>Presupuesto Mensual</span>
                  <span>{configuracion.presupuestoMensual.toFixed(2)}€</span>
                </div>
                <div className={styles.dosCajas}>
                  <div className={styles.cajaMini}>
                    <span className={styles.cajaEtiqueta}>Gastado</span>
                    <span className={`${styles.cajaValor} ${styles.negativo}`}>{gastoTotal.toFixed(2)}€</span>
                  </div>
                  <div className={styles.cajaMini}>
                    <span className={styles.cajaEtiqueta}>Disponible</span>
                    <span className={`${styles.cajaValor} ${restante < 0 ? styles.negativo : styles.positivo}`}>
                      {restante.toFixed(2)}€
                    </span>
                  </div>
                </div>
                <div className={styles.infoCiclo}>
                  <IconoInfo />
                  <span>Te quedan {diasRestantes} días en este ciclo.</span>
                </div>
              </>
            )
          )}
        </section>

        <section className={styles.tarjeta}>
          <h2 className={styles.tituloTarjeta}>Categorías</h2>
          {distribucionCategorias.length === 0 ? (
            <p className={styles.aviso}>Todavía no hay gastos en este ciclo.</p>
          ) : (
            <div className={styles.listaCategorias}>
              {distribucionCategorias.map((cat) => (
                <div key={cat.id} className={styles.filaCategoriaDist}>
                  <div className={styles.filaCategoriaCabecera}>
                    <span className={styles.nombreCategoriaDist}>{cat.nombre}</span>
                    <span className={styles.pctCategoriaDist}>{cat.pct.toFixed(0)}%</span>
                  </div>
                  <div className={styles.barraFina}>
                    <div className={styles.barraFinaRelleno} style={{ width: `${cat.pct}%`, backgroundColor: cat.color }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <section className={styles.tarjeta}>
        <div className={styles.tarjetaCabecera}>
          <h2 className={styles.tituloTarjeta}>Últimos Movimientos</h2>
          <Link href="/transacciones" className={styles.enlaceVerTodo}>
            Ver todo
          </Link>
        </div>
        {movimientos.length === 0 ? (
          <p className={styles.aviso}>Todavía no hay movimientos registrados.</p>
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
                {movimientos.map((mov) => (
                  <tr key={`${mov.tipo}-${mov.id}`}>
                    <td>{mov.descripcion}</td>
                    <td>
                      {mov.tipo === "gasto" ? (
                        <span
                          className={styles.badge}
                          style={{ backgroundColor: `${mov.categoria.color}26`, color: mov.categoria.color }}
                        >
                          {mov.categoria.nombre.toUpperCase()}
                        </span>
                      ) : (
                        <span className={`${styles.badge} ${styles.badgeIngreso}`}>INGRESO</span>
                      )}
                    </td>
                    <td className={styles.celdaApagada}>
                      {mov.fecha.toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" })}
                    </td>
                    <td className={mov.tipo === "gasto" ? styles.importeNegativo : styles.importePositivo}>
                      {mov.tipo === "gasto" ? "-" : "+"}
                      {mov.monto.toFixed(2)}€
                    </td>
                    <td>
                      <div className={styles.accionesFila}>
                        <button className={styles.botonEditar} onClick={() => setEditando(mov)}>
                          <IconoEditar />
                        </button>
                        <button className={styles.botonBorrar} onClick={() => borrarMovimiento(mov)}>
                          🗑
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {editando && (
        <ModalEditarMovimiento
          movimiento={editando}
          categorias={categorias}
          onCerrar={() => setEditando(null)}
          onGuardado={recargarMovimientos}
        />
      )}
    </main>
  );
}
