"use client";

import { useState, useEffect } from "react";
import { obtenerGastos, crearGasto, borrarGasto as borrarGastoDB, obtenerCategorias, crearCategoria } from "../../actions";
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
  const [nombreCategoria, setNombreCategoria] = useState("")
  const [limiteCategoria, setLimiteCategoria] = useState(0)
  const [colorCategoria, setColorCategoria] = useState("#2563eb")
  const total = gastos.reduce((acumulado, gastoActual) => acumulado + gastoActual.monto, 0)

  useEffect(() => {
    async function cargarDatos() {
      const datos = await obtenerGastos();
      const datosCategorias = await obtenerCategorias();
      setGastos(datos);
      setCategorias(datosCategorias)
      if (datosCategorias.length > 0) {
        setCategoriaId(datosCategorias[0].id)
      }
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

  async function agregarCategoria() {
    await crearCategoria(nombreCategoria, limiteCategoria, colorCategoria)
    const datosCategorias = await obtenerCategorias()
    setCategorias(datosCategorias)
    if (categoriaId === 0 && datosCategorias.length > 0) {
      setCategoriaId(datosCategorias[0].id)
    }
    setNombreCategoria("")
    setLimiteCategoria(0)
    setColorCategoria("#2563eb")
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
      <div className={styles.formulario}>
        <h2>Nueva categoría</h2>
        <input
          className={styles.input}
          value={nombreCategoria}
          placeholder="Nombre"
          onChange={(e) => setNombreCategoria(e.target.value)}
        />
        <input
          className={styles.input}
          value={limiteCategoria === 0 ? "" : limiteCategoria}
          placeholder="Límite"
          onChange={(e) => setLimiteCategoria(Number(e.target.value))}
        />
        <input
          className={styles.input}
          type="color"
          value={colorCategoria}
          onChange={(e) => setColorCategoria(e.target.value)}
        />
        <button className={styles.boton} onClick={agregarCategoria}>Agregar categoría</button>
      </div>
    </main>
  );
}