"use client";

import { useState } from "react";
import Link from "next/link";
import { registrarUsuario, iniciarSesion } from "../../authActions";
import styles from "../AuthForm.module.css";

export default function Registro() {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [error, setError] = useState("");

  async function manejarEnvio() {
    setError("");
    const errorRegistro = await registrarUsuario(nombre, email, contrasena);
    if (errorRegistro) {
      setError(errorRegistro);
      return;
    }
    const errorLogin = await iniciarSesion(email, contrasena);
    if (errorLogin) {
      setError(errorLogin);
    }
  }

  return (
    <main className={styles.pantalla}>
      <div className={styles.tarjeta}>
        <p className={styles.logo}>Gastitos</p>
        <h1 className={styles.titulo}>Crear cuenta</h1>
        {error && <p className={styles.error}>{error}</p>}
        <input
          className={styles.input}
          value={nombre}
          placeholder="Nombre"
          onChange={(e) => setNombre(e.target.value)}
        />
        <input
          className={styles.input}
          value={email}
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className={styles.input}
          type="password"
          value={contrasena}
          placeholder="Contraseña"
          onChange={(e) => setContrasena(e.target.value)}
        />
        <button className={styles.boton} onClick={manejarEnvio}>
          Crear cuenta
        </button>
        <p className={styles.enlaceTexto}>
          ¿Ya tienes cuenta? <Link href="/login">Inicia sesión</Link>
        </p>
      </div>
    </main>
  );
}
