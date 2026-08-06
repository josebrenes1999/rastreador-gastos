"use client";

import { useState } from "react";
import styles from "./GraficoDonut.module.css";

type SegmentoDonut = {
  etiqueta: string;
  valor: number;
  color: string;
};

type GraficoDonutProps = {
  datos: SegmentoDonut[];
};

const RADIO = 70;
const GROSOR = 22;
const GAP_PORCENTAJE = 0.8;

function GraficoDonut({ datos }: GraficoDonutProps) {
  const [indiceActivo, setIndiceActivo] = useState<number | null>(null);

  const total = datos.reduce((acumulado, d) => acumulado + d.valor, 0);

  let acumulado = 0;
  const segmentos = datos.map((d) => {
    const porcentaje = total > 0 ? (d.valor / total) * 100 : 0;
    const inicio = acumulado;
    acumulado += porcentaje;
    return { ...d, porcentaje, inicio };
  });

  return (
    <div className={styles.contenedor}>
      <svg viewBox="0 0 160 160" className={styles.svg}>
        <g transform="rotate(-90 80 80)">
          <circle cx="80" cy="80" r={RADIO} className={styles.pista} strokeWidth={GROSOR} />
          {total > 0 &&
            segmentos.map((s, i) => (
              <circle
                key={s.etiqueta}
                cx="80"
                cy="80"
                r={RADIO}
                fill="none"
                stroke={s.color}
                strokeWidth={indiceActivo === i ? GROSOR + 4 : GROSOR}
                strokeDasharray={`${Math.max(s.porcentaje - GAP_PORCENTAJE, 0)} ${100 - Math.max(s.porcentaje - GAP_PORCENTAJE, 0)}`}
                strokeDashoffset={-s.inicio}
                pathLength={100}
                className={styles.segmento}
                onPointerEnter={() => setIndiceActivo(i)}
                onPointerLeave={() => setIndiceActivo(null)}
              />
            ))}
        </g>
        <text x="80" y="76" textAnchor="middle" className={styles.totalValor}>
          {total.toFixed(0)} €
        </text>
        <text x="80" y="92" textAnchor="middle" className={styles.totalEtiqueta}>
          Total
        </text>
      </svg>

      <ul className={styles.leyenda}>
        {segmentos.map((s, i) => (
          <li
            key={s.etiqueta}
            className={`${styles.filaLeyenda} ${indiceActivo === i ? styles.filaActiva : ""}`}
            onPointerEnter={() => setIndiceActivo(i)}
            onPointerLeave={() => setIndiceActivo(null)}
          >
            <span className={styles.punto} style={{ backgroundColor: s.color }} />
            <span className={styles.nombreLeyenda}>{s.etiqueta}</span>
            <span className={styles.valorLeyenda}>
              {s.valor.toFixed(2)} € · {s.porcentaje.toFixed(0)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default GraficoDonut;
