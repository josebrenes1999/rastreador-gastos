"use client";

import { useState } from "react";
import Link from "next/link";
import { iniciarSesion } from "../../authActions";
import styles from "../AuthForm.module.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [error, setError] = useState("");

  async function manejarEnvio() {
    setError("");
    const resultado = await iniciarSesion(email, contrasena);
    if (resultado) {
      setError(resultado);
    }
  }

  return (
    <main className={styles.pantalla}>
      <div className={styles.tarjeta}>
        <p className={styles.logo}>Gastitos</p>
        <h1 className={styles.titulo}>Iniciar sesión</h1>
        {error && <p className={styles.error}>{error}</p>}
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
          Entrar
        </button>
        <p className={styles.enlaceTexto}>
          ¿No tienes cuenta? <Link href="/registro">Regístrate</Link>
        </p>
      </div>
    </main>
  );
}
