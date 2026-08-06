"use client";

import { useState, useEffect, useMemo } from "react";
import {
  obtenerGastos,
  obtenerIngresos,
  obtenerCategorias,
  obtenerConfiguracion,
  borrarGasto as borrarGastoDB,
  borrarIngreso as borrarIngresoDB,
} from "../../../actions";
import { estaEnCicloActual } from "../../../lib/ciclo";
import type { Categoria, Movimiento } from "../../../lib/movimientos";
import ModalEditarMovimiento from "../../../components/movimientos/ModalEditarMovimiento";
import IconoEditar from "../../../components/ui/IconoEditar";
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

type PeriodoFiltro = "todo" | "ciclo" | "7dias" | "30dias" | "mes" | "anio";
type TipoFiltro = "todos" | "gasto" | "ingreso";

const OPCIONES_PERIODO: { valor: PeriodoFiltro; etiqueta: string }[] = [
  { valor: "todo", etiqueta: "Todo" },
  { valor: "ciclo", etiqueta: "Ciclo actual" },
  { valor: "7dias", etiqueta: "Últimos 7 días" },
  { valor: "30dias", etiqueta: "Últimos 30 días" },
  { valor: "mes", etiqueta: "Este mes" },
  { valor: "anio", etiqueta: "Este año" },
];

const OPCIONES_TIPO: { valor: TipoFiltro; etiqueta: string }[] = [
  { valor: "todos", etiqueta: "Gastos e ingresos" },
  { valor: "gasto", etiqueta: "Solo gastos" },
  { valor: "ingreso", etiqueta: "Solo ingresos" },
];

function coincidePeriodo(fecha: Date, periodo: PeriodoFiltro, configuracion: Configuracion | null) {
  const ahora = new Date();
  const msPorDia = 1000 * 60 * 60 * 24;

  switch (periodo) {
    case "todo":
      return true;
    case "ciclo":
      return configuracion ? estaEnCicloActual(fecha, configuracion.cicloInicio, configuracion.cicloDuracionDias) : true;
    case "7dias":
      return fecha.getTime() >= ahora.getTime() - 7 * msPorDia;
    case "30dias":
      return fecha.getTime() >= ahora.getTime() - 30 * msPorDia;
    case "mes":
      return fecha.getUTCFullYear() === ahora.getUTCFullYear() && fecha.getUTCMonth() === ahora.getUTCMonth();
    case "anio":
      return fecha.getUTCFullYear() === ahora.getUTCFullYear();
  }
}

const POR_PAGINA = 10;

function exportarCSV(movimientos: Movimiento[]) {
  const encabezado = "Tipo,Descripción,Categoría,Fecha,Importe\n";
  const filas = movimientos
    .map((m) => {
      const fecha = m.fecha.toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" });
      const tipo = m.tipo === "gasto" ? "Gasto" : "Ingreso";
      const categoria = m.tipo === "gasto" ? m.categoria.nombre : "";
      return `"${tipo}","${m.descripcion}","${categoria}","${fecha}","${m.monto.toFixed(2)}"`;
    })
    .join("\n");

  const csv = encabezado + filas;
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement("a");
  enlace.href = url;
  enlace.download = "transacciones.csv";
  enlace.click();
  URL.revokeObjectURL(url);
}

export default function Transacciones() {
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [ingresos, setIngresos] = useState<Ingreso[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [configuracion, setConfiguracion] = useState<Configuracion | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState(0);
  const [periodoFiltro, setPeriodoFiltro] = useState<PeriodoFiltro>("todo");
  const [tipoFiltro, setTipoFiltro] = useState<TipoFiltro>("todos");
  const [pagina, setPagina] = useState(1);
  const [editando, setEditando] = useState<Movimiento | null>(null);

  useEffect(() => {
    async function cargarDatos() {
      const [datosGastos, datosIngresos, datosCategorias, config] = await Promise.all([
        obtenerGastos(),
        obtenerIngresos(),
        obtenerCategorias(),
        obtenerConfiguracion(),
      ]);
      setGastos(datosGastos);
      setIngresos(datosIngresos);
      setCategorias(datosCategorias);
      setConfiguracion(config);
    }
    cargarDatos();
  }, []);

  async function borrarMovimiento(movimiento: Movimiento) {
    if (movimiento.tipo === "gasto") {
      await borrarGastoDB(movimiento.id);
    } else {
      await borrarIngresoDB(movimiento.id);
    }
    const [datosGastos, datosIngresos] = await Promise.all([obtenerGastos(), obtenerIngresos()]);
    setGastos(datosGastos);
    setIngresos(datosIngresos);
  }

  async function recargarMovimientos() {
    const [datosGastos, datosIngresos] = await Promise.all([obtenerGastos(), obtenerIngresos()]);
    setGastos(datosGastos);
    setIngresos(datosIngresos);
    setEditando(null);
  }

  const movimientos: Movimiento[] = useMemo(
    () => [
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
      ...ingresos.map(
        (i): Movimiento => ({ tipo: "ingreso", id: i.id, monto: i.monto, fecha: i.fecha, descripcion: i.descripcion })
      ),
    ],
    [gastos, ingresos]
  );

  const movimientosFiltrados = useMemo(() => {
    const busquedaNormalizada = busqueda.trim().toLowerCase();
    return movimientos
      .filter((m) => tipoFiltro === "todos" || m.tipo === tipoFiltro)
      .filter((m) => categoriaFiltro === 0 || (m.tipo === "gasto" && m.categoria.id === categoriaFiltro))
      .filter((m) => coincidePeriodo(m.fecha, periodoFiltro, configuracion))
      .filter((m) => {
        if (busquedaNormalizada === "") return true;
        const enDescripcion = m.descripcion.toLowerCase().includes(busquedaNormalizada);
        const enCategoria = m.tipo === "gasto" && m.categoria.nombre.toLowerCase().includes(busquedaNormalizada);
        return enDescripcion || enCategoria;
      })
      .sort((a, b) => b.fecha.getTime() - a.fecha.getTime());
  }, [movimientos, busqueda, categoriaFiltro, periodoFiltro, tipoFiltro, configuracion]);

  const totalGastos = movimientosFiltrados.filter((m) => m.tipo === "gasto").reduce((acc, m) => acc + m.monto, 0);
  const totalIngresos = movimientosFiltrados.filter((m) => m.tipo === "ingreso").reduce((acc, m) => acc + m.monto, 0);
  const balanceFiltrado = totalIngresos - totalGastos;

  const totalPaginas = Math.max(Math.ceil(movimientosFiltrados.length / POR_PAGINA), 1);
  const paginaSegura = Math.min(pagina, totalPaginas);
  const movimientosPagina = movimientosFiltrados.slice((paginaSegura - 1) * POR_PAGINA, paginaSegura * POR_PAGINA);

  function cambiarBusqueda(texto: string) {
    setBusqueda(texto);
    setPagina(1);
  }

  function cambiarCategoriaFiltro(id: number) {
    setCategoriaFiltro(id);
    setPagina(1);
  }

  function cambiarPeriodoFiltro(periodo: PeriodoFiltro) {
    setPeriodoFiltro(periodo);
    setPagina(1);
  }

  function cambiarTipoFiltro(tipo: TipoFiltro) {
    setTipoFiltro(tipo);
    setPagina(1);
  }

  return (
    <main className={styles.main}>
      <header className={styles.cabeceraFila}>
        <div>
          <h1 className={styles.titulo}>Transacciones</h1>
          <p className={styles.subtitulo}>Gestiona y consulta todos tus movimientos en un solo sitio.</p>
        </div>
        <button
          type="button"
          className={styles.botonSecundario}
          onClick={() => exportarCSV(movimientosFiltrados)}
          disabled={movimientosFiltrados.length === 0}
        >
          Exportar CSV
        </button>
      </header>

      <div className={styles.filaControles}>
        <input
          className={styles.input}
          placeholder="Buscar por descripción o categoría..."
          value={busqueda}
          onChange={(e) => cambiarBusqueda(e.target.value)}
        />
        <select
          className={styles.input}
          value={tipoFiltro}
          onChange={(e) => cambiarTipoFiltro(e.target.value as TipoFiltro)}
        >
          {OPCIONES_TIPO.map((opcion) => (
            <option key={opcion.valor} value={opcion.valor}>
              {opcion.etiqueta}
            </option>
          ))}
        </select>
        <select
          className={styles.input}
          value={categoriaFiltro}
          onChange={(e) => cambiarCategoriaFiltro(Number(e.target.value))}
        >
          <option value={0}>Todas las categorías</option>
          {categorias.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.nombre}
            </option>
          ))}
        </select>
        <select
          className={styles.input}
          value={periodoFiltro}
          onChange={(e) => cambiarPeriodoFiltro(e.target.value as PeriodoFiltro)}
        >
          {OPCIONES_PERIODO.map((opcion) => (
            <option key={opcion.valor} value={opcion.valor}>
              {opcion.etiqueta}
            </option>
          ))}
        </select>
        <div className={`${styles.totalCaja} ${balanceFiltrado < 0 ? styles.totalNegativo : ""}`}>
          Balance: {balanceFiltrado.toFixed(2)} €
        </div>
      </div>

      <section className={styles.tarjeta}>
        {movimientosPagina.length === 0 ? (
          <p className={styles.aviso}>No hay movimientos que coincidan con la búsqueda.</p>
        ) : (
          <>
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
                  {movimientosPagina.map((mov) => (
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
                      <td className={mov.tipo === "gasto" ? styles.importe : styles.importePositivo}>
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

            <div className={styles.paginacion}>
              <button
                type="button"
                className={styles.botonPagina}
                disabled={paginaSegura === 1}
                onClick={() => setPagina(paginaSegura - 1)}
              >
                ‹
              </button>
              <span className={styles.textoPagina}>
                Página {paginaSegura} de {totalPaginas} — {movimientosFiltrados.length} movimientos
              </span>
              <button
                type="button"
                className={styles.botonPagina}
                disabled={paginaSegura === totalPaginas}
                onClick={() => setPagina(paginaSegura + 1)}
              >
                ›
              </button>
            </div>
          </>
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
