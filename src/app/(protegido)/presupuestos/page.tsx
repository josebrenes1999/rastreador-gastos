"use client";

import { useState, useEffect } from "react";
import {
  obtenerGastos,
  obtenerCategorias,
  crearCategoria,
  obtenerConfiguracion,
} from "../../../actions";
import { calcularDiaCiclo, estaEnCicloActual } from "../../../lib/ciclo";
import { coloresPredefinidos } from "../../../lib/colores";
import { textoADecimal } from "../../../lib/numeros";
import { calcularEstado, type Estado } from "../../../lib/estadoPresupuesto";
import CampoDecimal from "../../../components/ui/CampoDecimal";
import styles from "./page.module.css";

type Categoria = {
  id: number;
  nombre: string;
  limite: number;
  color: string;
};

type Gasto = {
  monto: number;
  fecha: Date;
  categoriaId: number;
};

type Configuracion = {
  presupuestoMensual: number;
  cicloInicio: Date;
  cicloDuracionDias: number;
};

const claseEstado: Record<Estado, string> = {
  SALUDABLE: "estadoSaludable",
  CONTROLADO: "estadoControlado",
  ALERTA: "estadoAlerta",
  COMPLETADO: "estadoCompletado",
};

export default function Presupuestos() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [configuracion, setConfiguracion] = useState<Configuracion | null>(null);

  const [mostrarFormCategoria, setMostrarFormCategoria] = useState(false);
  const [nombreCategoria, setNombreCategoria] = useState("");
  const [limiteCategoria, setLimiteCategoria] = useState("");
  const [colorCategoria, setColorCategoria] = useState(coloresPredefinidos[0]);

  useEffect(() => {
    async function cargarDatos() {
      const [datosGastos, datosCategorias, config] = await Promise.all([
        obtenerGastos(),
        obtenerCategorias(),
        obtenerConfiguracion(),
      ]);
      setGastos(datosGastos);
      setCategorias(datosCategorias);
      setConfiguracion(config);
    }
    cargarDatos();
  }, []);

  async function agregarCategoria() {
    await crearCategoria(nombreCategoria, textoADecimal(limiteCategoria), colorCategoria);
    const datosCategorias = await obtenerCategorias();
    setCategorias(datosCategorias);
    setNombreCategoria("");
    setLimiteCategoria("");
    setColorCategoria(coloresPredefinidos[0]);
    setMostrarFormCategoria(false);
  }

  const gastosDelCiclo = configuracion
    ? gastos.filter((g) => estaEnCicloActual(g.fecha, configuracion.cicloInicio, configuracion.cicloDuracionDias))
    : [];

  const gastoTotalCiclo = gastosDelCiclo.reduce((acumulado, g) => acumulado + g.monto, 0);

  function gastadoEnCategoria(categoriaId: number) {
    return gastosDelCiclo
      .filter((g) => g.categoriaId === categoriaId)
      .reduce((acumulado, g) => acumulado + g.monto, 0);
  }

  const categoriasConProgreso = categorias.map((categoria) => {
    const gastado = gastadoEnCategoria(categoria.id);
    const ratio = categoria.limite > 0 ? gastado / categoria.limite : 0;
    return { categoria, gastado, ratio, estado: calcularEstado(ratio) };
  });

  const mejorCategoria = categoriasConProgreso
    .filter((c) => c.categoria.limite > 0)
    .sort((a, b) => a.ratio - b.ratio)[0];

  const diaCiclo = configuracion ? calcularDiaCiclo(configuracion.cicloInicio, configuracion.cicloDuracionDias) : 0;
  const diasRestantes = configuracion ? Math.max(configuracion.cicloDuracionDias - diaCiclo, 0) : 0;
  const pctUtilizado = configuracion && configuracion.presupuestoMensual > 0
    ? Math.min((gastoTotalCiclo / configuracion.presupuestoMensual) * 100, 999)
    : 0;
  const pctRestante = Math.max(100 - pctUtilizado, 0);

  return (
    <main className={styles.main}>
      <header className={styles.cabecera}>
        <h1 className={styles.titulo}>Presupuestos Mensuales</h1>
        <p className={styles.subtitulo}>
          Visualiza y gestiona tus límites de gasto para mantener tu salud financiera bajo control este mes.
        </p>
      </header>

      {configuracion && (
        <div className={styles.filaSuperior}>
          <section className={styles.tarjeta}>
            <span className={styles.etiqueta}>ESTADO GENERAL</span>
            <div className={styles.estadoGeneralFila}>
              <div className={styles.estadoGeneralInfo}>
                <p className={styles.gastoTotal}>
                  <strong>{gastoTotalCiclo.toFixed(2)} €</strong> gastados de {configuracion.presupuestoMensual.toFixed(2)} €
                </p>
                <div className={styles.barraProgreso}>
                  <div
                    className={styles.barraRelleno}
                    style={{ width: `${Math.min(pctUtilizado, 100)}%` }}
                  />
                </div>
                <p className={styles.detalleEstado}>
                  Te queda el {pctRestante.toFixed(0)}% de tu presupuesto total para los próximos {diasRestantes} días.
                </p>
              </div>
              <div className={styles.porcentajeCaja}>{pctUtilizado.toFixed(0)}% Utilizado</div>
            </div>
          </section>

          <section className={`${styles.tarjeta} ${styles.tarjetaDestacada}`}>
            <span className={styles.etiqueta}>MEJOR CATEGORÍA</span>
            {mejorCategoria ? (
              <>
                <p className={styles.nombreDestacado}>{mejorCategoria.categoria.nombre}</p>
                <p className={styles.montoDestacado}>
                  {mejorCategoria.gastado.toFixed(2)} € / {mejorCategoria.categoria.limite.toFixed(2)} €
                </p>
                <p className={styles.mensajePositivo}>¡Vas por buen camino!</p>
              </>
            ) : (
              <p className={styles.aviso}>Crea categorías con un límite para ver tu progreso.</p>
            )}
          </section>
        </div>
      )}

      <div className={styles.gridCategorias}>
        {categoriasConProgreso.map(({ categoria, gastado, ratio, estado }) => (
          <div key={categoria.id} className={styles.tarjetaCategoria}>
            <div className={styles.categoriaCabecera}>
              <span className={styles.puntoColor} style={{ backgroundColor: categoria.color }} />
              <span className={styles.nombreCategoria}>{categoria.nombre}</span>
            </div>
            <p className={styles.montos}>
              {gastado.toFixed(2)} € <span className={styles.limiteTexto}>Límite: {categoria.limite.toFixed(2)} €</span>
            </p>
            <div className={styles.barraFina}>
              <div
                className={`${styles.barraFinaRelleno} ${styles[claseEstado[estado]]}`}
                style={{ width: `${Math.min(ratio * 100, 100)}%` }}
              />
            </div>
            <div className={styles.piePresupuesto}>
              <span className={`${styles.badgeEstado} ${styles[claseEstado[estado]]}`}>{estado}</span>
              <span className={styles.textoRestante}>
                {ratio >= 1 ? "Límite alcanzado" : `Quedan ${(categoria.limite - gastado).toFixed(2)} €`}
              </span>
            </div>
          </div>
        ))}

        <div
          className={styles.tarjetaAnadir}
          onClick={() => !mostrarFormCategoria && setMostrarFormCategoria(true)}
        >
          {mostrarFormCategoria ? (
            <div className={styles.formularioAnadir} onClick={(e) => e.stopPropagation()}>
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
              <div className={styles.botonesFormAnadir}>
                <button className={styles.boton} onClick={agregarCategoria}>
                  Crear
                </button>
                <button
                  type="button"
                  className={styles.botonSecundario}
                  onClick={() => setMostrarFormCategoria(false)}
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <>
              <span className={styles.masIcono}>+</span>
              <p className={styles.tituloAnadir}>Añadir Categoría</p>
              <p className={styles.subtextoAnadir}>Establece un nuevo objetivo mensual</p>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
