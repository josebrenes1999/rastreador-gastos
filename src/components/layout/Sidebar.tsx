"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cerrarSesion } from "../../authActions";
import styles from "./Sidebar.module.css";

const enlaces = [
  { href: "/", etiqueta: "Dashboard" },
  { href: "/transacciones", etiqueta: "Transacciones" },
  { href: "/presupuestos", etiqueta: "Presupuestos" },
  { href: "/informes", etiqueta: "Informes" },
];

type SidebarProps = {
  nombre: string;
  email: string;
  onAbrirGasto: () => void;
  onAbrirIngreso: () => void;
};

function Sidebar({ nombre, email, onAbrirGasto, onAbrirIngreso }: SidebarProps) {
  const pathname = usePathname();
  const [menuAbierto, setMenuAbierto] = useState(false);

  return (
    <aside className={styles.sidebar}>
      <div className={styles.cabeceraMovil}>
        <p className={styles.logo}>Gastitos</p>
        <button
          type="button"
          className={styles.botonMenu}
          aria-label="Abrir menú"
          onClick={() => setMenuAbierto(!menuAbierto)}
        >
          ☰
        </button>
      </div>

      <div className={`${styles.panel} ${menuAbierto ? styles.panelAbierto : ""}`}>
        <div className={styles.usuario}>
          <div className={styles.avatar} />
          <div>
            <p className={styles.nombre}>{nombre}</p>
            <p className={styles.plan}>{email}</p>
          </div>
        </div>
        <nav className={styles.nav}>
          {enlaces.map((enlace) => (
            <Link
              key={enlace.href}
              href={enlace.href}
              className={`${styles.enlace} ${pathname === enlace.href ? styles.activo : ""}`}
              onClick={() => setMenuAbierto(false)}
            >
              {enlace.etiqueta}
            </Link>
          ))}
        </nav>
        <div className={styles.accionesRapidas}>
          <button
            type="button"
            className={styles.botonAccion}
            onClick={() => {
              setMenuAbierto(false);
              onAbrirGasto();
            }}
          >
            + Añadir Gasto
          </button>
          <button
            type="button"
            className={styles.botonAccion}
            onClick={() => {
              setMenuAbierto(false);
              onAbrirIngreso();
            }}
          >
            + Añadir Ingreso
          </button>
        </div>
        <button className={styles.cerrarSesion} onClick={() => cerrarSesion()}>
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
