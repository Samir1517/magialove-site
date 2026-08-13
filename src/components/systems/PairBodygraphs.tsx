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
  const [onlyEm, setOnlyEm] = useState(false);
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

      <p className={styles.graphsLede}>
        Две карты слева и справа — это буквально два разных устройства. Закрашенный
        центр работает всегда и одинаково, незакрашенный — впитывает то, что рядом.
        Там, где у одного цвет, а у второго пусто, и живёт большая часть ваших
        «почему ты не можешь просто»: один в этом месте постоянен, а второй меняется
        от того, кто рядом. Это не про хуже и лучше — про разную конструкцию.
      </p>

      {saturn && (
        <p className={styles.note}>
          {on
            ? "Фиолетовое — то, чего в карте рождения нет. Обратите внимание, где эти ворота замкнули новый канал: именно в этих темах после тридцати у человека появляется то, чего в двадцать он про себя не знал. Карта рождения при этом не меняется — Тип, Стратегия и Авторитет остаются прежними на всю жизнь. Это погода периода, а не новая конституция."
            : "Около тридцати Сатурн возвращается в ту же точку неба, где стоял в день рождения. В традиции это рубеж, после которого человек перестаёт быть черновиком себя. Посмотрите, какие ворота подсвечиваются у каждого из вас в этот момент — и какие новые каналы они замыкают."}
        </p>
      )}

      <p className={styles.graphsHint}>
        На обеих картах тёмное — то, что человек про себя знает, красное — то, что видят
        окружающие, а он сам почти нет.
      </p>

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
              extraLinesA={extra?.lines}
              size={270}
              hint="Коснись ворот или канала."
            />
          </div>
        ))}
      </div>

      <div className={styles.graphCard} style={{ marginTop: 16 }}>
        <div className={styles.graphCardHead}>
          <span className={styles.lsLabel}>Общая карта пары</span>
          <span className={styles.graphType}>
            третья карта, которой нет ни у кого из вас по отдельности
          </span>
        </div>

        <button
          type="button"
          className={onlyEm ? styles.saturnBtnOn : styles.saturnBtn}
          onClick={() => setOnlyEm((v) => !v)}
          aria-pressed={onlyEm}
          style={{ alignSelf: "flex-start" }}
        >
          {onlyEm ? "Показать всю карту" : "Оставить только то, что рождается вдвоём"}
        </button>
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
          extraLinesA={on ? saturn!.a.lines : undefined}
          extraLinesB={on ? saturn!.b.lines : undefined}
          focusElectromagnetic={onlyEm}
          size={320}
          hint="Розовое и лиловое приносит каждый сам, золотое есть у обоих. Малиновое — то, что замыкается только вдвоём: в одиночку этого нет ни у кого из вас."
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
