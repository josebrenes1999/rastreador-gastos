"use client";

import { useState } from "react";
import styles from "./CampoDecimal.module.css";

type CampoDecimalProps = {
  className: string;
  placeholder?: string;
  valor: string;
  onCambiar: (texto: string) => void;
};

function CampoDecimal({ className, placeholder, valor, onCambiar }: CampoDecimalProps) {
  const [error, setError] = useState("");

  function manejarCambio(texto: string) {
    if (texto.includes(".")) {
      setError("Usa una coma (,) para los decimales, no un punto.");
      return;
    }
    setError("");
    onCambiar(texto);
  }

  return (
    <div className={styles.contenedor}>
      <input className={className} placeholder={placeholder} value={valor} onChange={(e) => manejarCambio(e.target.value)} />
      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
}

export default CampoDecimal;
