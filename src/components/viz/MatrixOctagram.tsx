"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import type { IndividualMatrix, PositionKey } from "@/lib/engines/matrix";
import { getArcanumInfo, POSITION_TO_ZONE, ZONE_TITLES, zoneCharacter } from "@/lib/engines/matrix";
import { useInView } from "./useInView";
import styles from "./viz.module.css";

/**
 * Октаграмма Матрицы судьбы — каноническая фигура ниши: восьмиконечная звезда
 * (личный ромб + прямой родовой квадрат), вписанная в круг. Сверено с эталонами
 * ниши (matrica-sudby.ru, matrica-dusha.ru), канон отображения:
 *  - точки личного квадрата окрашены по чакровому коду: день (слева) —
 *    фиолетовый, месяц (сверху) — синий, год (справа) — красный, кармический
 *    свод (снизу) — тёмно-красный; центр — жёлтый/золотой с мягким свечением;
 *  - родовые (диагональные) точки — нейтральные;
 *  - диагонали несут мужскую (♂, СЗ→ЮВ) и женскую (♀, СВ→ЮЗ) линии рода;
 *  - в совместимости топы показывают три карты: её, его и общую — здесь это
 *    вкладки над схемой (личные матрицы + общая, посчитанная overlayPair).
 * Позиции и числа — ровно те, что считает движок (matrix.ts); дополнительных
 * точек (второго порядка, свода неба/земли) не рисуем, т.к. движок их не считает.
 *
 * Клик/тап по точке раскрывает карточку аркана — карта работает как оглавление.
 */

const SIZE = 480;
const C = SIZE / 2;
const R_OUTER = 200; // кардинальные точки ромба
const R_DIAG = 138; // диагональные точки родового квадрата

interface PointSpec {
  key: PositionKey;
  x: number;
  y: number;
  /** Место позиции в ОБЩЕЙ матрице пары — для карточки во вкладке «Вместе». */
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

/** Смысл той же точки в ЛИЧНОЙ матрице одного человека (вкладки «Она»/«Он»). */
const PERSONAL_MEANING: Record<PositionKey, string> = {
  day: "Число дня — характер, портрет личности",
  month: "Число месяца — эмоции и таланты",
  year: "Число года — опыт и задачи рода",
  sum: "Кармический свод — главный урок жизни",
  center: "Центр — ядро личности, точка комфорта",
  dm: "Родовая точка: день + месяц",
  my: "Родовая точка: месяц + год",
  ys: "Родовая точка: год + сумма",
  sd: "Родовая точка: сумма + день",
};

/**
 * Базовый цвет точки — канонический чакровый код ниши (как у эталонов):
 * фиолетовый день, синий месяц, красный год, тёмно-красный свод, золотой центр.
 */
const BASE_COLOR: Record<PositionKey, { fill: string; ring: string }> = {
  day: { fill: "#ede4f6", ring: "#8f6fbf" },
  month: { fill: "#e4ebf7", ring: "#6c8cc9" },
  year: { fill: "#f7e6e3", ring: "#c96b6b" },
  sum: { fill: "#f6dede", ring: "#b95050" },
  center: { fill: "#fdf3d9", ring: "#d4ab75" },
  dm: { fill: "#f6f1f5", ring: "#c9b8c9" },
  my: { fill: "#f6f1f5", ring: "#c9b8c9" },
  ys: { fill: "#f6f1f5", ring: "#c9b8c9" },
  sd: { fill: "#f6f1f5", ring: "#c9b8c9" },
};

/** Акцентный цвет зоны пары — для пунктирного кольца и подписи (вкладка «Вместе»). */
const ZONE_RING: Record<keyof typeof POSITION_TO_ZONE, string> = {
  love: "#d48ca6",
  money: "#b99d74",
  kids: "#a687c9",
  purpose: "#8f7aa8",
  center: "#a2698a",
};

type View = "a" | "b" | "pair";

export function MatrixOctagram({
  pair,
  a,
  b,
  nameA = "Она",
  nameB = "Он",
  qs = "",
}: {
  pair: IndividualMatrix;
  /** Личные матрицы партнёров — включают вкладки «Она / Он / Вместе». */
  a?: IndividualMatrix;
  b?: IndividualMatrix;
  nameA?: string;
  nameB?: string;
  /** Параметры расчёта — чтобы со страницы аркана был путь назад. */
  qs?: string;
}) {
  const [selected, setSelected] = useState<PositionKey>("center");
  const [view, setView] = useState<View>("pair");
  const wrapRef = useRef<HTMLDivElement>(null);
  const inView = useInView(wrapRef);

  const hasTabs = Boolean(a && b);
  const current: IndividualMatrix = view === "a" && a ? a : view === "b" && b ? b : pair;
  const isPair = view === "pair" || !hasTabs;

  const sel = POINTS.find((p) => p.key === selected)!;
  const selArcanum = getArcanumInfo(current[selected]);
  const selCharacter = isPair && sel.zone ? zoneCharacter(sel.zone, current[selected]) : null;

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

  const viewTitle =
    view === "a" && hasTabs
      ? `Личная матрица: ${nameA}`
      : view === "b" && hasTabs
        ? `Личная матрица: ${nameB}`
        : "Общая матрица пары";

  return (
    <div className={styles.octagramWrap} ref={wrapRef}>
      {hasTabs && (
        <div className={styles.octagramTabs} role="tablist" aria-label="Какую матрицу показать">
          {(
            [
              { v: "a" as View, label: nameA },
              { v: "b" as View, label: nameB },
              { v: "pair" as View, label: "Вместе" },
            ] as const
          ).map((t) => (
            <button
              key={t.v}
              type="button"
              role="tab"
              aria-selected={view === t.v}
              className={view === t.v ? `${styles.octagramTab} ${styles.octagramTabActive}` : styles.octagramTab}
              onClick={() => setView(t.v)}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}

      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className={inView ? `${styles.octagramSvg} ${styles.drawn}` : styles.octagramSvg}
        role="img"
        aria-label={`${viewTitle}: октаграмма, 9 позиций с арканами`}
      >
        <defs>
          {/* Мягкое золотое свечение центра — канон ниши (жёлтая точка комфорта). */}
          <radialGradient id="octagramCenterGlow">
            <stop offset="0%" stopColor="#e9c98f" stopOpacity={0.5} />
            <stop offset="100%" stopColor="#e9c98f" stopOpacity={0} />
          </radialGradient>
        </defs>

        {/* Круг, в который вписана звезда — канон построения карты */}
        <circle cx={C} cy={C} r={R_OUTER} fill="none" stroke="#eadfe8" strokeWidth={1} pathLength={1} className={styles.drawLineSlow} />

        {/* Родовой (прямой) квадрат */}
        <polygon points={square(R_DIAG * Math.SQRT2, false)} fill="none" stroke="#e5d8e5" strokeWidth={1.5} pathLength={1} className={styles.drawLine} />
        {/* Личный квадрат (ромб) */}
        <polygon points={square(R_OUTER, true)} fill="none" stroke="#dcc7d8" strokeWidth={1.5} pathLength={1} className={styles.drawLine} />
        {/* Оси через центр */}
        <line x1={C - R_OUTER} y1={C} x2={C + R_OUTER} y2={C} stroke="#eee0ea" strokeWidth={1} pathLength={1} className={styles.drawLineSlow} />
        <line x1={C} y1={C - R_OUTER} x2={C} y2={C + R_OUTER} stroke="#eee0ea" strokeWidth={1} pathLength={1} className={styles.drawLineSlow} />
        {/* Мужская линия рода (♂, СЗ→ЮВ) и женская (♀, СВ→ЮЗ) — канон метода */}
        <line x1={C - DIAG} y1={C - DIAG} x2={C + DIAG} y2={C + DIAG} stroke="#9db4dc" strokeWidth={1.2} opacity={0.65} pathLength={1} className={styles.drawLineSlow} />
        <line x1={C + DIAG} y1={C - DIAG} x2={C - DIAG} y2={C + DIAG} stroke="#dca6bc" strokeWidth={1.2} opacity={0.65} pathLength={1} className={styles.drawLineSlow} />
        <text x={196} y={180} textAnchor="middle" className={styles.octagramGenderMark} style={{ fill: "#7d95c9" }}>
          ♂
        </text>
        <text x={284} y={180} textAnchor="middle" className={styles.octagramGenderMark} style={{ fill: "#c97d9c" }}>
          ♀
        </text>

        {/* Свечение под центральной точкой */}
        <circle cx={C} cy={C} r={62} fill="url(#octagramCenterGlow)" />

        {POINTS.map((p) => {
          const { fill, ring } = BASE_COLOR[p.key];
          const zoneColor = isPair && p.zone ? ZONE_RING[p.zone] : null;
          const active = p.key === selected;
          const r = p.key === "center" ? 34 : 26;
          return (
            <g
              key={p.key}
              onClick={() => setSelected(p.key)}
              style={{ cursor: "pointer" }}
              role="button"
              aria-label={`${isPair ? p.meaning : PERSONAL_MEANING[p.key]}: аркан ${current[p.key]}`}
            >
              {active && (
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={r + 9}
                  fill="none"
                  stroke={zoneColor ?? ring}
                  strokeWidth={1.5}
                  opacity={0.55}
                  className={styles.pulsePoint}
                />
              )}
              {/* Пунктирное кольцо зоны пары — только во вкладке «Вместе» */}
              {zoneColor && (
                <circle cx={p.x} cy={p.y} r={r + 4.5} fill="none" stroke={zoneColor} strokeWidth={1.2} strokeDasharray="3 4" opacity={0.8} />
              )}
              <circle cx={p.x} cy={p.y} r={r} fill={fill} stroke={ring} strokeWidth={active ? 2.5 : 1.5} />
              <text
                x={p.x}
                y={p.y + 1}
                textAnchor="middle"
                dominantBaseline="middle"
                style={{ font: `italic 400 ${p.key === "center" ? 26 : 20}px var(--font-display)`, fill: "var(--ink)" }}
              >
                {current[p.key]}
              </text>
            </g>
          );
        })}

        {/* Подписи ключевых зон снаружи точек — только для общей матрицы пары */}
        {isPair && (
          <>
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
          </>
        )}
      </svg>

      {hasTabs && <div className={styles.octagramViewCaption}>{viewTitle}</div>}

      {/* Карточка выбранной точки */}
      <div className={styles.octagramCard}>
        <span className={styles.octagramCardEyebrow}>
          {isPair && sel.zone ? `Зона «${ZONE_TITLES[sel.zone]}»` : isPair ? sel.meaning : PERSONAL_MEANING[sel.key]}
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
        {/* Разбор аркана целиком лежит отдельной страницей — уводим туда именно
            с той точки, которую человек сейчас открыл, а не общей ссылкой. */}
        <Link
          href={`/matrica-sudby-sovmestimost/arkany/${selArcanum.number}/${qs ? `?${qs}` : ""}`}
          className={styles.octagramCardLink}
        >
          Аркан {selArcanum.number} «{selArcanum.name}»: значение и совместимость →
        </Link>
        <p className={styles.octagramHint}>
          {hasTabs
            ? "Нажимай на точки схемы — карточка обновится. Вкладки сверху переключают личные матрицы и общую."
            : "Нажимай на точки схемы — карточка обновится."}
        </p>
      </div>
    </div>
  );
}
