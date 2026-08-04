"use client";

import { useState } from "react";
import type { IndividualMatrix, PositionKey } from "@/lib/engines/matrix";
import { getArcanumInfo, POSITION_TO_ZONE, ZONE_TITLES, zoneCharacter } from "@/lib/engines/matrix";
import styles from "./viz.module.css";

/**
 * Октаграмма пары — каноническая фигура ниши (два квадрата: «личный» ромб и
 * «родовой» прямой), построенная по общей матрице отношений (overlayPair).
 * Позиции и их смыслы — ровно те, что считает движок (matrix.ts); никакой
 * дополнительной эзотерики поверх расчёта не изобретается.
 *
 * Клик/тап по точке раскрывает карточку аркана — приём топов ниши
 * (destiny-matrix.cc, matrica-dusha.ru): карта работает как оглавление.
 */

const SIZE = 480;
const C = SIZE / 2;
const R_OUTER = 200; // кардинальные точки ромба
const R_DIAG = 138; // диагональные точки родового квадрата

interface PointSpec {
  key: PositionKey;
  x: number;
  y: number;
  /** Фактическое место позиции в расчёте — для подписи карточки. */
  meaning: string;
  /** Зона совместимости, если позиция входит в 5 зон. */
  zone?: keyof typeof POSITION_TO_ZONE;
}

const DIAG = Math.round(R_DIAG / Math.SQRT2);

const POINTS: PointSpec[] = [
  { key: "day", x: C - R_OUTER, y: C, meaning: "Свод дней рождения — характер пары" },
  { key: "month", x: C, y: C - R_OUTER, meaning: "Свод месяцев — эмоциональный фон" },
  { key: "year", x: C + R_OUTER, y: C, meaning: "Свод годов — опыт и род" },
  { key: "sum", x: C, y: C + R_OUTER, meaning: "Кармический свод пары", zone: "purpose" },
  { key: "dm", x: C - DIAG, y: C - DIAG, meaning: "Диагональ день+месяц", zone: "love" },
  { key: "my", x: C + DIAG, y: C - DIAG, meaning: "Диагональ месяц+год" },
  { key: "ys", x: C + DIAG, y: C + DIAG, meaning: "Диагональ год+сумма", zone: "money" },
  { key: "sd", x: C - DIAG, y: C + DIAG, meaning: "Диагональ сумма+день", zone: "kids" },
  { key: "center", x: C, y: C, meaning: "Свод всех углов — сердцевина союза", zone: "center" },
];

/** Цвет точки по её роли: зоны любви/денег/детей/предназначения/центра — брендовые. */
function pointColor(p: PointSpec): { fill: string; ring: string } {
  switch (p.zone) {
    case "love":
      return { fill: "#f7dbe3", ring: "#d48ca6" };
    case "money":
      return { fill: "#f2e7cf", ring: "#b99d74" };
    case "kids":
      return { fill: "#e7ddf3", ring: "#a687c9" };
    case "purpose":
      return { fill: "#e9e2f0", ring: "#8f7aa8" };
    case "center":
      return { fill: "#fdf3f6", ring: "#a2698a" };
    default:
      return { fill: "#f6f1f5", ring: "#c9b8c9" };
  }
}

export function MatrixOctagram({ pair }: { pair: IndividualMatrix }) {
  const [selected, setSelected] = useState<PositionKey>("center");

  const sel = POINTS.find((p) => p.key === selected)!;
  const selArcanum = getArcanumInfo(pair[selected]);
  const selCharacter = sel.zone ? zoneCharacter(sel.zone, pair[selected]) : null;

  // Координаты округлены до сотых — защита от расхождения float между
  // Node-пререндером и браузером при гидрации (как в CompositeBodygraph).
  const r2 = (n: number) => Math.round(n * 100) / 100;
  const square = (r: number, rotate: boolean) => {
    const pts = rotate
      ? [
          [C - r, C],
          [C, C - r],
          [C + r, C],
          [C, C + r],
        ]
      : [
          [r2(C - r / Math.SQRT2), r2(C - r / Math.SQRT2)],
          [r2(C + r / Math.SQRT2), r2(C - r / Math.SQRT2)],
          [r2(C + r / Math.SQRT2), r2(C + r / Math.SQRT2)],
          [r2(C - r / Math.SQRT2), r2(C + r / Math.SQRT2)],
        ];
    return pts.map((p) => p.join(",")).join(" ");
  };

  return (
    <div className={styles.octagramWrap}>
      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className={styles.octagramSvg}
        role="img"
        aria-label="Октаграмма общей матрицы пары: 9 позиций с арканами"
      >
        {/* Родовой (прямой) квадрат */}
        <polygon points={square(R_DIAG * Math.SQRT2, false)} fill="none" stroke="#e5d8e5" strokeWidth={1.5} />
        {/* Личный квадрат (ромб) */}
        <polygon points={square(R_OUTER, true)} fill="none" stroke="#dcc7d8" strokeWidth={1.5} />
        {/* Диагонали через центр */}
        <line x1={C - R_OUTER} y1={C} x2={C + R_OUTER} y2={C} stroke="#eee0ea" strokeWidth={1} />
        <line x1={C} y1={C - R_OUTER} x2={C} y2={C + R_OUTER} stroke="#eee0ea" strokeWidth={1} />
        <line x1={C - DIAG} y1={C - DIAG} x2={C + DIAG} y2={C + DIAG} stroke="#eee0ea" strokeWidth={1} />
        <line x1={C + DIAG} y1={C - DIAG} x2={C - DIAG} y2={C + DIAG} stroke="#eee0ea" strokeWidth={1} />

        {POINTS.map((p) => {
          const { fill, ring } = pointColor(p);
          const active = p.key === selected;
          const r = p.key === "center" ? 34 : 26;
          return (
            <g
              key={p.key}
              onClick={() => setSelected(p.key)}
              style={{ cursor: "pointer" }}
              role="button"
              aria-label={`${p.meaning}: аркан ${pair[p.key]}`}
            >
              {active && <circle cx={p.x} cy={p.y} r={r + 7} fill="none" stroke={ring} strokeWidth={1.5} opacity={0.55} />}
              <circle cx={p.x} cy={p.y} r={r} fill={fill} stroke={ring} strokeWidth={active ? 2.5 : 1.5} />
              <text
                x={p.x}
                y={p.y + 1}
                textAnchor="middle"
                dominantBaseline="middle"
                style={{ font: `italic 400 ${p.key === "center" ? 26 : 20}px var(--font-display)`, fill: "var(--ink)" }}
              >
                {pair[p.key]}
              </text>
            </g>
          );
        })}

        {/* Подписи ключевых зон снаружи точек */}
        <text x={C - DIAG - 34} y={C - DIAG - 34} textAnchor="middle" className={styles.octagramZoneLabel}>
          Любовь
        </text>
        <text x={C + DIAG + 36} y={C + DIAG + 40} textAnchor="middle" className={styles.octagramZoneLabel}>
          Деньги
        </text>
        <text x={C - DIAG - 36} y={C + DIAG + 40} textAnchor="middle" className={styles.octagramZoneLabel}>
          Дети
        </text>
        <text x={C} y={C + R_OUTER + 34} textAnchor="middle" className={styles.octagramZoneLabel}>
          Предназначение
        </text>
      </svg>

      {/* Карточка выбранной точки */}
      <div className={styles.octagramCard}>
        <span className={styles.octagramCardEyebrow}>
          {sel.zone ? `Зона «${ZONE_TITLES[sel.zone]}»` : sel.meaning}
        </span>
        <strong className={styles.octagramCardTitle}>
          Аркан {selArcanum.number} «{selArcanum.name}» · {selArcanum.theme}
        </strong>
        <p className={styles.octagramCardText}>{selArcanum.inPair}</p>
        {selCharacter && (
          <p className={styles.octagramCardNote}>
            {selCharacter === "harmonic"
              ? "Для этой зоны аркан гармоничен — качество включается само."
              : selCharacter === "tense"
                ? "Для этой зоны аркан напряжённый — не поломка, а задача на осознанность."
                : "Формула считает аркан нейтральным для зоны — но нейтральных качеств не бывает: направление задаёте вы двое."}
          </p>
        )}
        <p className={styles.octagramHint}>Нажимай на точки схемы — карточка обновится.</p>
      </div>
    </div>
  );
}
