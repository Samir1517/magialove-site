"use client";

import { useState } from "react";
import {
  CELL,
  RASHI_GLYPH,
  RASHI_NAMES,
  houseFrom,
  type ChartGraha,
} from "@/lib/engines/jyotish-charts";
import { bhavaOf } from "@/lib/data/jyotish/bhava";
import styles from "./viz.module.css";

/** Достоинство планеты — короткой понятной формулой вместо санскрита. */
const DIGNITY_SHORT: Record<string, string> = {
  экзальтация: "в лучшем знаке",
  мулатрикона: "в своей сильной зоне",
  "своя обитель": "у себя дома",
  падение: "в падении",
};

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
    const bhava = bhavaOf(house);
    const own = byRashi(grahas, selected);
    const other = partner ? byRashi(partner, selected) : [];

    // Состояния планеты — сразу словами. «(R)» и «варготтама» без расшифровки
    // работали как забор: читательница видела пометку и не понимала ничего.
    const fmt = (g: ChartGraha) =>
      [
        `${g.name} ${Math.floor(g.degreeInRashi)}°`,
        `${g.nakshatra}, пада ${g.pada}`,
        g.dignity ? DIGNITY_SHORT[g.dignity] : null,
        g.combust ? "сожжена Солнцем" : null,
        g.retro ? "идёт назад" : null,
        vargottamaKeys?.has(g.key) ? "варготтама" : null,
      ]
        .filter(Boolean)
        .join(" · ");

    const shown = [...own, ...other];
    return {
      title: `${RASHI_NAMES[selected]} · ${house}-й дом от ${anchorLabel} — ${bhava.title}`,
      bhava: bhava.meaning,
      lines: [
        own.length
          ? `${partner ? `${nameA}: ` : ""}${own.map(fmt).join("; ")}`
          : `${partner ? `${nameA}: ` : ""}планет нет`,
        ...(partner
          ? [other.length ? `${nameB}: ${other.map(fmt).join("; ")}` : `${nameB}: планет нет`]
          : []),
      ],
      // Сноска только про то, что в этой клетке действительно есть, и не больше
      // двух строк: полный словарь занимал бы больше места, чем сама карта, а
      // панель на наведении раздувалась бы и дёргала страницу. Порядок —
      // по редкости: пометка про паду показывается, когда особенного ничего нет.
      legend: (
        [
          shown.some((g) => g.retro) &&
            "«Идёт назад» (вакри) — с Земли видно, как планета движется по небу вспять: её сила разворачивается внутрь, человек сначала проживает это в себе.",
          shown.some((g) => g.combust) &&
            "«Сожжена» — стоит слишком близко к Солнцу: свойство есть, но его плохо слышно за более громким солнечным.",
          shown.some((g) => g.dignity === "падение") &&
            "«В падении» — знак, противоположный лучшему для этой планеты: качество никуда не делось, но даётся усилием.",
          shown.some((g) => vargottamaKeys?.has(g.key)) &&
            "«Варготтама» — планета попала в один и тот же знак в обеих картах: то, что она обещает, человек получает в жизни, а не только на бумаге.",
          shown.some((g) => g.dignity === "экзальтация") &&
            "«В лучшем знаке» (экзальтация) — место, где планета раскрывается сильнее всего из двенадцати.",
          shown.length > 0 &&
            "Пада — четверть накшатры, 3°20′. Именно она задаёт планете знак во второй карте, D-9.",
        ].filter(Boolean) as string[]
      ).slice(0, 2),
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
            <span className={styles.sicInfoBhava}>{info.bhava}</span>
            {info.lines.map((l) => (
              <span key={l} className={styles.sicInfoLine}>
                {l}
              </span>
            ))}
            {info.legend.map((l) => (
              <span key={l} className={styles.sicInfoLegend}>
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
