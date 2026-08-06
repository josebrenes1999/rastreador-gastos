"use client";

import { useRef, useState, type PointerEvent } from "react";
import styles from "./GraficoLineas.module.css";

type PuntoLinea = {
  etiqueta: string;
  valor: number;
};

type GraficoLineasProps = {
  datos: PuntoLinea[];
};

const ANCHO = 600;
const ALTO = 220;
const PADDING_IZQ = 12;
const PADDING_DER = 12;
const PADDING_SUP = 16;
const PADDING_INF = 28;

function GraficoLineas({ datos }: GraficoLineasProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [indiceActivo, setIndiceActivo] = useState<number | null>(null);

  const anchoUtil = ANCHO - PADDING_IZQ - PADDING_DER;
  const altoUtil = ALTO - PADDING_SUP - PADDING_INF;
  const baseY = PADDING_SUP + altoUtil;
  const valorMaximo = Math.max(...datos.map((d) => d.valor), 1);

  function coordenadaX(indice: number) {
    if (datos.length === 1) return PADDING_IZQ + anchoUtil / 2;
    return PADDING_IZQ + (indice / (datos.length - 1)) * anchoUtil;
  }

  function coordenadaY(valor: number) {
    return baseY - (valor / valorMaximo) * altoUtil;
  }

  const puntos = datos.map((d, i) => ({ x: coordenadaX(i), y: coordenadaY(d.valor), ...d }));
  const lineaPath = puntos.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaPath =
    puntos.length > 0
      ? `${lineaPath} L ${puntos[puntos.length - 1].x} ${baseY} L ${puntos[0].x} ${baseY} Z`
      : "";

  function manejarMovimiento(evento: PointerEvent<SVGSVGElement>) {
    if (!svgRef.current || puntos.length === 0) return;
    const rect = svgRef.current.getBoundingClientRect();
    const xRelativa = ((evento.clientX - rect.left) / rect.width) * ANCHO;

    let masCercano = 0;
    let distanciaMinima = Infinity;
    puntos.forEach((p, i) => {
      const distancia = Math.abs(p.x - xRelativa);
      if (distancia < distanciaMinima) {
        distanciaMinima = distancia;
        masCercano = i;
      }
    });
    setIndiceActivo(masCercano);
  }

  const activo = indiceActivo !== null ? puntos[indiceActivo] : null;

  return (
    <div className={styles.contenedor}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${ANCHO} ${ALTO}`}
        className={styles.svg}
        onPointerMove={manejarMovimiento}
        onPointerLeave={() => setIndiceActivo(null)}
      >
        <line x1={PADDING_IZQ} y1={baseY} x2={ANCHO - PADDING_DER} y2={baseY} className={styles.eje} />

        {areaPath && <path d={areaPath} className={styles.area} />}
        {lineaPath && <path d={lineaPath} className={styles.linea} />}

        {activo && (
          <line x1={activo.x} y1={PADDING_SUP} x2={activo.x} y2={baseY} className={styles.crosshair} />
        )}

        {puntos.map((p, i) => (
          <circle key={p.etiqueta} cx={p.x} cy={p.y} r={indiceActivo === i ? 6 : 4} className={styles.punto} />
        ))}

        {puntos.map((p) => (
          <text key={p.etiqueta} x={p.x} y={ALTO - 8} textAnchor="middle" className={styles.etiquetaEje}>
            {p.etiqueta}
          </text>
        ))}
      </svg>

      {activo && (
        <div
          className={styles.tooltip}
          style={{ left: `${(activo.x / ANCHO) * 100}%`, top: `${(activo.y / ALTO) * 100}%` }}
        >
          <p className={styles.tooltipEtiqueta}>{activo.etiqueta}</p>
          <p className={styles.tooltipValor}>{activo.valor.toFixed(2)} €</p>
        </div>
      )}
    </div>
  );
}

export default GraficoLineas;
