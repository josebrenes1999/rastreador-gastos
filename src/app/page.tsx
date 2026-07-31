"use client";

import { useState, useEffect } from "react";
import { obtenerGastos, crearGasto, borrarGasto as borrarGastoDB } from "../actions";

type Gasto = {
  id: number;
  monto: number;
  categoria: string;
  fecha: string; // De momento, en un futuro será type Date
  descripcion: string;
};

export default function Home() {
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [categoria, setCategoria] = useState("");
  const [descripcion, setDescripcion] = useState("")
  const [monto, setMonto] = useState(0)
  const [fecha, setFecha] = useState("")
  const total = gastos.reduce((acumulado, gastoActual) => acumulado + gastoActual.monto, 0)

  useEffect(() => {
  async function cargarDatos() {
    const datos = await obtenerGastos();
    setGastos(datos);
  }
  cargarDatos();
}, []);
  
  async function agregarGasto(){
  
  await crearGasto(categoria, monto, fecha, descripcion)

  const datos = await obtenerGastos();
  setGastos(datos)
  setCategoria("")
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
    <main>
      <h1>Rastreador de Gastos</h1>
      <p>Gasto total: { total }€</p>
      <ul>
        {gastos.map((gasto) => (
          <li key={gasto.id}>
            <p>Gasto: {gasto.monto}€</p>
            <p>Categoría: {gasto.categoria}</p>
            <p>Fecha: {gasto.fecha}</p>
            <p>Descripción: {gasto.descripcion}</p>
            <button onClick={()=> borrarGasto(gasto.id) }>Borrar</button>
          </li>
        ))}
      </ul>
      <input
        value={categoria}
        placeholder="Categoria"
        onChange={(e) => setCategoria(e.target.value)}
      />
      <input
        value={descripcion}
        placeholder="Descripción"
        onChange={(e) => setDescripcion(e.target.value)}
      />
      <input
        value={monto === 0 ? "" : monto}
        placeholder="Importe"
        onChange={(e) => setMonto(Number(e.target.value))}
      />
      <input
        value={fecha}
        placeholder="Fecha"
        onChange={(e) => setFecha(e.target.value)}
      />
      <button onClick={agregarGasto}>Agregar gasto</button>
    </main>
  );
}



