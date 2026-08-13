"use client";

import { useState } from "react";
import type { CenterKey } from "@/lib/engines/human-design-tables";
import type { CompositeDefinition, PersonChart } from "@/lib/engines/human_design";
import type { SaturnAddition } from "@/lib/engines/saturn-return";
import { Bodygraph } from "@/components/viz/Bodygraph";
import { CHANNEL_SOURCE_COLOR, CHANNEL_SOURCE_LABEL } from "@/lib/content/human-design";
import styles from "./systems.module.css";

/**
 * Три карты подряд: своя, партнёра и общая.
 *
 * Порядок не случаен. Сначала человек находит на карте себя — это единственное,
 * что он уже умеет читать; потом видит партнёра в том же виде и может сравнить;
 * и только третьей идёт общая карта, где смысл имеет уже разница между первыми
 * двумя. Показывать композит первым бессмысленно: не с чем сравнивать.
 */
export function PairBodygraphs({
  a,
  b,
  composite,
  nameA,
  nameB,
  saturn,
}: {
  a: PersonChart;
  b: PersonChart;
  composite: CompositeDefinition;
  nameA: string;
  nameB: string;
  saturn: SaturnAddition | null;
}) {
  const [showSaturn, setShowSaturn] = useState(false);
  const on = showSaturn && saturn !== null;

  const legend = [
    { key: "electromagnetic", note: "появляется только вдвоём" },
    { key: "both", note: "есть у обоих" },
    { key: "a", note: nameA },
    { key: "b", note: nameB },
  ];

  return (
    <div className={styles.graphsBlock}>
      <div className={styles.graphsHead}>
        <h3 className={styles.blockTitle}>Ваши карты рядом</h3>
        {saturn && (
          <button
            type="button"
            className={on ? styles.saturnBtnOn : styles.saturnBtn}
            onClick={() => setShowSaturn((v) => !v)}
            aria-pressed={on}
          >
            {on ? "Скрыть возврат Сатурна" : "Показать возврат Сатурна"}
          </button>
        )}
      </div>

      {saturn && (
        <p className={styles.note}>
          {on
            ? "Фиолетовым показаны ворота и каналы, которых нет в карте рождения: они добавляются транзитом Сатурна, когда он возвращается в точку рождения — это происходит около 29–30 лет и повторяется примерно к 59."
            : "Возврат Сатурна — момент около 29–30 лет, когда Сатурн приходит в ту же точку неба, что и в день рождения. Транзитные планеты в этот момент подсвечивают дополнительные ворота. Можно посмотреть, что добавляется вам обоим."}
        </p>
      )}

      <div className={styles.graphsPair}>
        {[
          { name: nameA, chart: a, extra: on ? saturn!.a : null },
          { name: nameB, chart: b, extra: on ? saturn!.b : null },
        ].map(({ name, chart, extra }) => (
          <div key={name} className={styles.graphCard}>
            <div className={styles.graphCardHead}>
              <span className={styles.lsLabel}>{name}</span>
              <span className={styles.graphType}>
                {chart.profile} {chart.type} <em>(постоянный)</em>
              </span>
              {/* Тип карты возврата намеренно не показываем. Профиль периода —
                  корректно и так подают школы ДЧ, а вот «второго типа» не
                  существует: тип считается по неизменным положениям планет
                  рождения и не меняется никогда. */}
              {extra && (
                <span className={styles.graphTypeExtra}>
                  профиль периода {extra.profile} <em>(временный, с {extra.date})</em>
                </span>
              )}
            </div>
            <Bodygraph
              person={chart}
              a={chart}
              nameA={name}
              extraGates={extra?.gates ?? []}
              extraChannels={extra?.channels ?? []}
              size={300}
              hint="Тёмное — Личность, красное — Дизайн. Коснись ворот или канала."
            />
          </div>
        ))}
      </div>

      <div className={styles.graphCard} style={{ marginTop: 16 }}>
        <div className={styles.graphCardHead}>
          <span className={styles.lsLabel}>Общая карта пары</span>
          <span className={styles.graphType}>
            что складывается из двух карт вместе
          </span>
        </div>
        <Bodygraph
          composite={{
            channels: composite.channels,
            definedCenters: composite.definedCenters as CenterKey[],
          }}
          a={a}
          b={b}
          nameA={nameA}
          nameB={nameB}
          extraGates={on ? saturn!.pair.gates : []}
          extraChannels={on ? saturn!.pair.channels : []}
          size={320}
          hint="Коснись канала — увидишь, из каких ворот он собран и кто его приносит. Коснись ворот — какая линия у каждого из вас."
        />
        <div className={styles.graphLegend}>
          {legend.map((l) => (
            <span key={l.key} className={styles.graphLegendItem}>
              <i style={{ background: CHANNEL_SOURCE_COLOR[l.key] }} />
              {CHANNEL_SOURCE_LABEL[l.key].split(" — ")[0]}
              <em> · {l.note}</em>
            </span>
          ))}
          {on && (
            <span className={styles.graphLegendItem}>
              <i style={{ background: "#8c7fb5" }} />
              Возврат Сатурна<em> · добавляется транзитом</em>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
