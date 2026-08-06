"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { obtenerGastos, obtenerCategorias, obtenerConfiguracion } from "../../../actions";
import { estaEnCicloActual } from "../../../lib/ciclo";
import { calcularEstado, type Estado } from "../../../lib/estadoPresupuesto";
import GraficoLineas from "../../../components/graficos/GraficoLineas";
import GraficoDonut from "../../../components/graficos/GraficoDonut";
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

const claseEstado: Record<Estado, string> = {
  SALUDABLE: "estadoSaludable",
  CONTROLADO: "estadoControlado",
  ALERTA: "estadoAlerta",
  COMPLETADO: "estadoCompletado",
};

const MESES_CORTOS = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

function obtenerUltimosMeses(cantidad: number) {
  const ahora = new Date();
  const meses = [];
  for (let i = cantidad - 1; i >= 0; i--) {
    const fecha = new Date(Date.UTC(ahora.getUTCFullYear(), ahora.getUTCMonth() - i, 1));
    meses.push({ anio: fecha.getUTCFullYear(), mes: fecha.getUTCMonth() });
  }
  return meses;
}

function totalDelMes(gastos: Gasto[], anio: number, mes: number) {
  return gastos
    .filter((g) => g.fecha.getUTCFullYear() === anio && g.fecha.getUTCMonth() === mes)
    .reduce((acumulado, g) => acumulado + g.monto, 0);
}

export default function Informes() {
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [configuracion, setConfiguracion] = useState<Configuracion | null>(null);

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

  const evolucionMensual = obtenerUltimosMeses(6).map(({ anio, mes }) => ({
    etiqueta: MESES_CORTOS[mes],
    valor: totalDelMes(gastos, anio, mes),
  }));

  const ahora = new Date();
  const esteMes = totalDelMes(gastos, ahora.getUTCFullYear(), ahora.getUTCMonth());
  const fechaMesAnterior = new Date(Date.UTC(ahora.getUTCFullYear(), ahora.getUTCMonth() - 1, 1));
  const mesAnterior = totalDelMes(gastos, fechaMesAnterior.getUTCFullYear(), fechaMesAnterior.getUTCMonth());
  const deltaPct = mesAnterior > 0 ? ((esteMes - mesAnterior) / mesAnterior) * 100 : esteMes > 0 ? 100 : 0;

  const gastosDelCiclo = configuracion
    ? gastos.filter((g) => estaEnCicloActual(g.fecha, configuracion.cicloInicio, configuracion.cicloDuracionDias))
    : [];

  const distribucion = categorias
    .map((cat) => ({
      etiqueta: cat.nombre,
      color: cat.color,
      valor: gastosDelCiclo.filter((g) => g.categoriaId === cat.id).reduce((acumulado, g) => acumulado + g.monto, 0),
    }))
    .filter((d) => d.valor > 0)
    .sort((a, b) => b.valor - a.valor);

  const saludCategorias = categorias
    .map((cat) => {
      const gastado = gastosDelCiclo
        .filter((g) => g.categoriaId === cat.id)
        .reduce((acumulado, g) => acumulado + g.monto, 0);
      const ratio = cat.limite > 0 ? gastado / cat.limite : 0;
      return { categoria: cat, gastado, ratio, estado: calcularEstado(ratio) };
    })
    .filter((c) => c.categoria.limite > 0)
    .sort((a, b) => b.ratio - a.ratio)
    .slice(0, 3);

  return (
    <main className={styles.main}>
      <header className={styles.cabecera}>
        <h1 className={styles.titulo}>Informes</h1>
        <p className={styles.subtitulo}>Cómo ha evolucionado tu gasto en los últimos meses.</p>
      </header>

      <div className={styles.filaSuperior}>
        <section className={`${styles.tarjeta} ${styles.tarjetaGrande}`}>
          <h2 className={styles.tituloTarjeta}>Evolución mensual</h2>
          <p className={styles.subtituloTarjeta}>Gasto total, últimos 6 meses</p>
          <GraficoLineas datos={evolucionMensual} />
        </section>

        <section className={styles.tarjeta}>
          <span className={styles.etiqueta}>TENDENCIA DE GASTO</span>
          <p className={`${styles.deltaValor} ${deltaPct >= 0 ? styles.deltaSubida : styles.deltaBajada}`}>
            {deltaPct >= 0 ? "▲" : "▼"} {Math.abs(deltaPct).toFixed(1)}%
          </p>
          <p className={styles.deltaTexto}>
            {deltaPct >= 0 ? "Más gasto que el mes anterior." : "Menos gasto que el mes anterior."}
          </p>
          <p className={styles.deltaDetalle}>
            Este mes: {esteMes.toFixed(2)} € · Anterior: {mesAnterior.toFixed(2)} €
          </p>
        </section>
      </div>

      <div className={styles.filaInferior}>
        <section className={styles.tarjeta}>
          <h2 className={styles.tituloTarjeta}>Distribución por categoría</h2>
          <p className={styles.subtituloTarjeta}>Ciclo actual</p>
          {distribucion.length === 0 ? (
            <p className={styles.aviso}>Todavía no hay gastos en este ciclo.</p>
          ) : (
            <GraficoDonut datos={distribucion} />
          )}
        </section>

        <section className={styles.tarjeta}>
          <div className={styles.tarjetaCabecera}>
            <h2 className={styles.tituloTarjeta}>Salud del presupuesto</h2>
            <Link href="/presupuestos" className={styles.enlaceVerTodo}>
              Ver todo
            </Link>
          </div>
          {saludCategorias.length === 0 ? (
            <p className={styles.aviso}>Crea categorías con límite para ver su estado.</p>
          ) : (
            <div className={styles.listaSalud}>
              {saludCategorias.map(({ categoria, gastado, ratio, estado }) => (
                <div key={categoria.id} className={styles.filaSalud}>
                  <div className={styles.filaSaludCabecera}>
                    <span className={styles.nombreSalud}>{categoria.nombre}</span>
                    <span className={`${styles.badgeEstado} ${styles[claseEstado[estado]]}`}>{estado}</span>
                  </div>
                  <div className={styles.barraFina}>
                    <div
                      className={`${styles.barraFinaRelleno} ${styles[claseEstado[estado]]}`}
                      style={{ width: `${Math.min(ratio * 100, 100)}%` }}
                    />
                  </div>
                  <p className={styles.detalleSalud}>
                    {gastado.toFixed(2)} € / {categoria.limite.toFixed(2)} €
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
