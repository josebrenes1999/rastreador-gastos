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
      <div className={styles.campoConSufijo}>
        <input
          className={className}
          style={{ paddingRight: "32px" }}
          placeholder={placeholder}
          value={valor}
          onChange={(e) => manejarCambio(e.target.value)}
        />
        <span className={styles.sufijo}>€</span>
      </div>
      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
}

export default CampoDecimal;
