"use client";

import { useState } from "react";
import {
  CELL,
  RASHI_GLYPH,
  RASHI_NAMES,
  houseFrom,
  type ChartGraha,
} from "@/lib/engines/jyotish-charts";
import styles from "./viz.module.css";

/**
 * Южноиндийская карта: сетка 4×4, знаки закреплены за клетками, середина 2×2
 * пустая под подпись. Менять раскладку нельзя — практики читают такую карту
 * с одного взгляда, а знак ищут по месту, а не по подписи.
 *
 * Дома отсчитываются от Лагны, если известно место рождения, иначе от Луны
 * (Чандра-лагна). Опорная клетка помечается диагональю — так в традиции
 * помечают именно Лагну.
 */
export function SouthIndianChart({
  grahas,
  partner,
  anchorRashi,
  anchorLabel = "Луны",
  title,
  subtitle,
  vargottamaKeys,
  nameA,
  nameB,
}: {
  grahas: ChartGraha[];
  /** Второй набор планет — режим наложения двух карт. */
  partner?: ChartGraha[];
  /** Знак, от которого считаются дома: Лагна, а без места рождения — Луна. */
  anchorRashi: number;
  /** Родительный падеж для подписи: «дом от лагны» / «дом от Луны». */
  anchorLabel?: string;
  title: string;
  subtitle?: string;
  vargottamaKeys?: Set<string>;
  nameA?: string;
  nameB?: string;
}) {
  const [selected, setSelected] = useState<number | null>(null);

  const byRashi = (list: ChartGraha[], r: number) => list.filter((g) => g.rashiIndex === r);

  const info = (() => {
    if (selected === null) return null;
    const house = houseFrom(anchorRashi, selected);
    const own = byRashi(grahas, selected);
    const other = partner ? byRashi(partner, selected) : [];
    const fmt = (g: ChartGraha) =>
      `${g.name} ${Math.floor(g.degreeInRashi)}°${g.retro ? " (R)" : ""}${
        vargottamaKeys?.has(g.key) ? " · варготтама" : ""
      }`;
    return {
      title: `${RASHI_NAMES[selected]} · ${house}-й дом от ${anchorLabel}`,
      lines: [
        own.length
          ? `${partner ? `${nameA}: ` : ""}${own.map(fmt).join(", ")}`
          : `${partner ? `${nameA}: ` : ""}планет нет`,
        ...(partner
          ? [other.length ? `${nameB}: ${other.map(fmt).join(", ")}` : `${nameB}: планет нет`]
          : []),
      ],
    };
  })();

  return (
    <div className={styles.sicWrap}>
      <div className={styles.sicGrid}>
        {/* середина 2×2 — подпись карты, как в традиции */}
        <div className={styles.sicCenter}>
          <span className={styles.sicCenterTitle}>{title}</span>
          {subtitle && <span className={styles.sicCenterSub}>{subtitle}</span>}
        </div>

        {CELL.map(([row, col], rashi) => {
          const own = byRashi(grahas, rashi);
          const other = partner ? byRashi(partner, rashi) : [];
          const isAnchorSign = rashi === anchorRashi;
          const isSel = selected === rashi;
          return (
            <button
              type="button"
              key={rashi}
              className={`${styles.sicCell} ${isAnchorSign ? styles.sicCellAnchor : ""} ${
                isSel ? styles.sicCellSel : ""
              }`}
              style={{ gridRow: row + 1, gridColumn: col + 1 }}
              onMouseEnter={() => setSelected(rashi)}
              onMouseLeave={() => setSelected(null)}
              onClick={() => setSelected(rashi)}
              aria-label={`${RASHI_NAMES[rashi]}, ${houseFrom(anchorRashi, rashi)}-й дом от ${anchorLabel}`}
            >
              <span className={styles.sicSign}>
                {RASHI_GLYPH[rashi]}
                <em>{houseFrom(anchorRashi, rashi)}</em>
              </span>
              <span className={styles.sicPlanets}>
                {own.map((g) => (
                  <i
                    key={g.key}
                    className={`${styles.sicPlanet} ${
                      vargottamaKeys?.has(g.key) ? styles.sicPlanetStrong : ""
                    }`}
                  >
                    {g.short}
                  </i>
                ))}
                {other.map((g) => (
                  <i key={`b-${g.key}`} className={`${styles.sicPlanet} ${styles.sicPlanetB}`}>
                    {g.short}
                  </i>
                ))}
              </span>
            </button>
          );
        })}
      </div>

      <div className={styles.sicInfo} aria-live="polite">
        {info ? (
          <>
            <strong className={styles.sicInfoTitle}>{info.title}</strong>
            {info.lines.map((l) => (
              <span key={l} className={styles.sicInfoLine}>
                {l}
              </span>
            ))}
          </>
        ) : (
          <span className={styles.sicInfoLine}>
            Диагональю отмечен знак {anchorLabel === "лагны" ? "лагны" : "Луны"} — от него
            считаются дома. Наведи на клетку.
          </span>
        )}
      </div>
    </div>
  );
}
