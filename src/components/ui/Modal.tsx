"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";
import styles from "./Modal.module.css";

type ModalProps = {
  titulo: string;
  onCerrar: () => void;
  children: ReactNode;
};

function Modal({ titulo, onCerrar, children }: ModalProps) {
  useEffect(() => {
    function manejarTecla(evento: KeyboardEvent) {
      if (evento.key === "Escape") onCerrar();
    }
    document.addEventListener("keydown", manejarTecla);
    return () => document.removeEventListener("keydown", manejarTecla);
  }, [onCerrar]);

  return (
    <div className={styles.fondo} onClick={onCerrar}>
      <div className={styles.tarjeta} onClick={(e) => e.stopPropagation()}>
        <div className={styles.cabecera}>
          <h2 className={styles.titulo}>{titulo}</h2>
          <button type="button" className={styles.botonCerrar} onClick={onCerrar} aria-label="Cerrar">
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default Modal;
