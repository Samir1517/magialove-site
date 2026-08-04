"use client";

import { useState } from "react";
import styles from "./viz.module.css";

/**
 * Лунный круг 27 накшатр с отмеченными Лунами обоих партнёров — визуализация,
 * которой нет ни у одного из топов ниши (у них накшатра — строка в таблице).
 * Каждый сектор 13°20′; между Лунами — дуга, показывающая «расстояние» пары
 * (основа кут Тара и Нади). Клик по сектору показывает название накшатры.
 */

const SIZE = 440;
const C = SIZE / 2;
const R_OUT = 200;
const R_IN = 150;
const R_LABEL = 175;

const NAKSHATRA_NAMES = [
  "Ашвини", "Бхарани", "Криттика", "Рохини", "Мригашира", "Ардра",
  "Пунарвасу", "Пушья", "Ашлеша", "Магха", "Пурва-пхалгуни", "Уттара-пхалгуни",
  "Хаста", "Читра", "Свати", "Вишакха", "Анурадха", "Джьештха",
  "Мула", "Пурва-ашадха", "Уттара-ашадха", "Шравана", "Дхаништха", "Шатабхиша",
  "Пурва-бхадрапада", "Уттара-бхадрапада", "Ревати",
];

/**
 * Округление до сотых: страница пререндерится в Node и гидрируется в браузере,
 * а тригонометрия может разойтись в последнем бите — React посчитал бы это
 * расхождением разметки (см. ту же защиту в CompositeBodygraph).
 */
function r2(n: number): number {
  return Math.round(n * 100) / 100;
}

function polar(r: number, angleDeg: number): [number, number] {
  const rad = ((angleDeg - 90) * Math.PI) / 180; // 0° сверху, по часовой
  return [r2(C + r * Math.cos(rad)), r2(C + r * Math.sin(rad))];
}

function sectorPath(index: number, rOut: number, rIn: number): string {
  const a0 = (index * 360) / 27;
  const a1 = ((index + 1) * 360) / 27;
  const [x0o, y0o] = polar(rOut, a0);
  const [x1o, y1o] = polar(rOut, a1);
  const [x0i, y0i] = polar(rIn, a0);
  const [x1i, y1i] = polar(rIn, a1);
  return `M ${x0o} ${y0o} A ${rOut} ${rOut} 0 0 1 ${x1o} ${y1o} L ${x1i} ${y1i} A ${rIn} ${rIn} 0 0 0 ${x0i} ${y0i} Z`;
}

export function NakshatraWheel({
  aIndex,
  bIndex,
  aName,
  bName,
  aNakshatra,
  bNakshatra,
}: {
  /** Индексы накшатр Лун 1..27 (как в движке). */
  aIndex: number;
  bIndex: number;
  aName: string;
  bName: string;
  aNakshatra: string;
  bNakshatra: string;
}) {
  const [selected, setSelected] = useState<number | null>(null);

  const aIdx0 = aIndex - 1;
  const bIdx0 = bIndex - 1;
  const midAngle = (i: number) => ((i + 0.5) * 360) / 27;

  // Дуга между Лунами по внутреннему радиусу (короткая сторона).
  const aAng = midAngle(aIdx0);
  const bAng = midAngle(bIdx0);
  let sweep = bAng - aAng;
  if (sweep < -180) sweep += 360;
  if (sweep > 180) sweep -= 360;
  const [ax, ay] = polar(R_IN - 16, aAng);
  const [bx, by] = polar(R_IN - 16, bAng);
  const largeArc = 0;
  const sweepFlag = sweep >= 0 ? 1 : 0;

  // «Расстояние» пары в накшатрах (по ходу зодиака от неё к нему) — та же
  // мера, что лежит в основе Тара-куты.
  const distance = ((bIdx0 - aIdx0 + 27) % 27) + 1;

  return (
    <div className={styles.wheelWrap}>
      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className={styles.wheelSvg}
        role="img"
        aria-label={`Лунный круг 27 накшатр: ${aName} — ${aNakshatra}, ${bName} — ${bNakshatra}`}
      >
        {/* Секторы */}
        {NAKSHATRA_NAMES.map((name, i) => {
          const isA = i === aIdx0;
          const isB = i === bIdx0;
          const fill =
            isA && isB
              ? "url(#nkBoth)"
              : isA
                ? "#f2cdd9"
                : isB
                  ? "#d9cdec"
                  : i % 2 === 0
                    ? "#faf6f9"
                    : "#f4eef4";
          return (
            <path
              key={name}
              d={sectorPath(i, R_OUT, R_IN)}
              fill={fill}
              stroke="#fff"
              strokeWidth={1.5}
              onClick={() => setSelected(i)}
              style={{ cursor: "pointer" }}
            />
          );
        })}

        <defs>
          <linearGradient id="nkBoth" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#f2cdd9" />
            <stop offset="100%" stopColor="#d9cdec" />
          </linearGradient>
        </defs>

        {/* Номера секторов */}
        {NAKSHATRA_NAMES.map((name, i) => {
          const [x, y] = polar(R_LABEL, midAngle(i));
          const active = i === aIdx0 || i === bIdx0 || i === selected;
          return (
            <text
              key={`n-${name}`}
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="middle"
              style={{
                font: `600 ${active ? 13 : 10}px var(--font-body)`,
                fill: active ? "var(--accent)" : "var(--ink-faint)",
                pointerEvents: "none",
              }}
            >
              {i + 1}
            </text>
          );
        })}

        {/* Дуга между Лунами */}
        {aIdx0 !== bIdx0 && (
          <path
            d={`M ${ax} ${ay} A ${R_IN - 16} ${R_IN - 16} 0 ${largeArc} ${sweepFlag} ${bx} ${by}`}
            fill="none"
            stroke="#d48ca6"
            strokeWidth={2}
            strokeDasharray="5 5"
            opacity={0.8}
          />
        )}

        {/* Маркеры-Луны */}
        {[
          { idx: aIdx0, label: aName, color: "#d48ca6" },
          { idx: bIdx0, label: bName, color: "#8f7ab8" },
        ].map(({ idx, label, color }, k) => {
          const [x, y] = polar(R_IN - 16, midAngle(idx) + (aIdx0 === bIdx0 ? (k === 0 ? -4 : 4) : 0));
          return (
            <g key={`moon-${k}`} pointerEvents="none">
              <circle cx={x} cy={y} r={13} fill="#fff" stroke={color} strokeWidth={2} />
              <text
                x={x}
                y={y + 1}
                textAnchor="middle"
                dominantBaseline="middle"
                style={{ font: "600 11px var(--font-body)", fill: color }}
              >
                ☾
              </text>
            </g>
          );
        })}

        {/* Центр */}
        <text
          x={C}
          y={C - 10}
          textAnchor="middle"
          style={{ font: "italic 400 20px var(--font-display)", fill: "var(--ink)" }}
        >
          {distance === 1 && aIdx0 === bIdx0 ? "одна накшатра" : `${distance}-я от её Луны`}
        </text>
        <text
          x={C}
          y={C + 14}
          textAnchor="middle"
          style={{ font: "400 12px var(--font-body)", fill: "var(--ink-faint)" }}
        >
          мера кут Тара и Нади
        </text>
      </svg>

      <div className={styles.wheelLegend}>
        <span className={styles.wheelLegendItem}>
          <span className={styles.wheelDot} style={{ background: "#f2cdd9", borderColor: "#d48ca6" }} />
          {aName}: {aNakshatra}
        </span>
        <span className={styles.wheelLegendItem}>
          <span className={styles.wheelDot} style={{ background: "#d9cdec", borderColor: "#8f7ab8" }} />
          {bName}: {bNakshatra}
        </span>
        {selected !== null && (
          <span className={styles.wheelLegendItem} style={{ color: "var(--accent)" }}>
            №{selected + 1} — {NAKSHATRA_NAMES[selected]}
          </span>
        )}
      </div>
    </div>
  );
}
