"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cerrarSesion } from "../authActions";
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
};

function Sidebar({ nombre, email }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className={styles.sidebar}>
      <p className={styles.logo}>Gastitos</p>
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
          >
            {enlace.etiqueta}
          </Link>
        ))}
      </nav>
      <button className={styles.cerrarSesion} onClick={() => cerrarSesion()}>
        Cerrar sesión
      </button>
    </aside>
  );
}

export default Sidebar;
