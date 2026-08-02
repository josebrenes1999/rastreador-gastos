"use client";

import { useState, useEffect } from "react";
import { obtenerGastos, crearGasto, borrarGasto as borrarGastoDB, obtenerCategorias, crearCategoria } from "../actions";
import styles from "./page.module.css"

type Categoria = {
  id: number;
  nombre: string;
  limite: number;
  color: string;
}

type Gasto = {
  id: number;
  monto: number;
  fecha: string;
  descripcion: string;
  categoria: Categoria;
  categoriaId: number;
};

export default function Home() {
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [categoriaId, setCategoriaId] = useState(0);
  const [descripcion, setDescripcion] = useState("")
  const [monto, setMonto] = useState(0)
  const [fecha, setFecha] = useState("")
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const total = gastos.reduce((acumulado, gastoActual) => acumulado + gastoActual.monto, 0)

  useEffect(() => {
    async function cargarDatos() {
      const datos = await obtenerGastos();
      const datosCategorias = await obtenerCategorias();
      setGastos(datos);
      setCategorias(datosCategorias)
    }
    cargarDatos();
  }, []);

  async function agregarGasto(){
    await crearGasto(categoriaId, monto, fecha, descripcion)
    const datos = await obtenerGastos();
    setGastos(datos)
    setCategoriaId(0)
    setDescripcion("")
    setMonto(0)
    setFecha("")
  }

  async function borrarGasto(id: number) {
    await borrarGastoDB(id);
    const datos = await obtenerGastos()
    setGastos(datos)
  }

  return (
    <main className={styles.main}>
      <h1 className={styles.titulo}>Rastreador de Gastos</h1>
      <p className={styles.total}>Gasto total: { total }€</p>
      <ul>
        {gastos.map((gasto) => (
          <li className={styles.tarjeta} key={gasto.id}>
            <p className={styles.montoGasto}>Gasto: {gasto.monto}€</p>
            <p className={styles.detalle}>Categoría: {gasto.categoria.nombre}</p>
            <p className={styles.detalle}>Fecha: {gasto.fecha}</p>
            <p className={styles.detalle}>Descripción: {gasto.descripcion}</p>
            <button className={styles.botonBorrar} onClick={()=> borrarGasto(gasto.id) }>Borrar</button>
          </li>
        ))}
      </ul>
      <div className={styles.formulario}>
        <select className={styles.input} value={categoriaId} onChange={(e) => setCategoriaId(Number(e.target.value))}>
          {categorias.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.nombre}</option>
          ))}
        </select>
        <input
          className={styles.input}
          value={descripcion}
          placeholder="Descripción"
          onChange={(e) => setDescripcion(e.target.value)}
        />
        <input
          className={styles.input}
          value={monto === 0 ? "" : monto}
          placeholder="Importe"
          onChange={(e) => setMonto(Number(e.target.value))}
        />
        <input
          className={styles.input}
          value={fecha}
          placeholder="Fecha"
          onChange={(e) => setFecha(e.target.value)}
        />
        <button className={styles.boton} onClick={agregarGasto}>Agregar gasto</button>
      </div>
    </main>
  );
}