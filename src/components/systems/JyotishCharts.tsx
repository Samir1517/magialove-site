"use client";

import { useState } from "react";
import type { GrahaPosition } from "@/lib/engines/jyotish";
import {
  RASHI_NAMES,
  houseFrom,
  mangalFrom,
  navamsaChart,
  rashiChart,
  vargottama,
} from "@/lib/engines/jyotish-charts";
import { SouthIndianChart } from "@/components/viz/SouthIndianChart";
import styles from "./systems.module.css";

/**
 * Карты пары в южноиндийском формате: своя, партнёра и наложение.
 *
 * Переключатель D-1 / D-9 не украшение: навамша в традиции — карта супруга
 * (Парашара прямо приписывает ей «калатра»), и смотреть совместимость без неё
 * значит смотреть половину. Считается она из одних долгот, без Лагны.
 */
export function JyotishCharts({
  a,
  b,
  nameA,
  nameB,
}: {
  a: GrahaPosition[];
  b: GrahaPosition[];
  nameA: string;
  nameB: string;
}) {
  const [varga, setVarga] = useState<"d1" | "d9">("d1");
  const d9 = varga === "d9";

  const chartA = d9 ? navamsaChart(a) : rashiChart(a);
  const chartB = d9 ? navamsaChart(b) : rashiChart(b);
  const vgA = vargottama(a);
  const vgB = vargottama(b);

  const moonA = chartA.find((g) => g.key === "moon")!.rashiIndex;
  const moonB = chartB.find((g) => g.key === "moon")!.rashiIndex;
  const marsA = chartA.find((g) => g.key === "mars")!.rashiIndex;
  const marsB = chartB.find((g) => g.key === "mars")!.rashiIndex;
  const venusA = chartA.find((g) => g.key === "venus")!.rashiIndex;
  const venusB = chartB.find((g) => g.key === "venus")!.rashiIndex;

  const mangal = (moon: number, venus: number, mars: number) =>
    [mangalFrom(moon, mars) && "от Луны", mangalFrom(venus, mars) && "от Венеры"].filter(Boolean);

  const mA = mangal(moonA, venusA, marsA);
  const mB = mangal(moonB, venusB, marsB);

  return (
    <div className={styles.graphsBlock}>
      <div className={styles.graphsHead}>
        <h3 className={styles.blockTitle}>Ваши карты рядом</h3>
        <div className={styles.vargaSwitch}>
          {(["d1", "d9"] as const).map((v) => (
            <button
              key={v}
              type="button"
              className={varga === v ? styles.vargaBtnOn : styles.vargaBtn}
              onClick={() => setVarga(v)}
              aria-pressed={varga === v}
            >
              {v === "d1" ? "D-1 · где стоят планеты" : "D-9 · карта брака"}
            </button>
          ))}
        </div>
      </div>

      <p className={styles.graphsLede}>
        {d9
          ? "Навамша — вторая карта, спрятанная внутри первой: каждый знак делится на девять частей, и планета получает второй адрес. В традиции именно её читают про супружество, и она же показывает, что у человека держится, а что рассыпается при первом нажиме. Планета, попавшая в один и тот же знак в обеих картах, подсвечена золотым — это варготтама, то, на что человек может опереться в любой день."
          : "Двенадцать клеток — двенадцать знаков, они стоят на одних и тех же местах у вас обоих. Поэтому карты и сравниваются взглядом: где у одного пусто, а у второго тесно от планет, там и разница в том, из чего вы сделаны. Диагональ отмечает знак Луны — от неё в этом расчёте отсчитываются дома, и на ней же построена вся Аштакута."}
      </p>

      <div className={styles.graphsPair}>
        {[
          { name: nameA, chart: chartA, moon: moonA, vg: d9 ? vgA : undefined, m: mA },
          { name: nameB, chart: chartB, moon: moonB, vg: d9 ? vgB : undefined, m: mB },
        ].map(({ name, chart, moon, vg, m }) => (
          <div key={name} className={styles.graphCard}>
            <div className={styles.graphCardHead}>
              <span className={styles.lsLabel}>{name}</span>
              <span className={styles.graphType}>
                Знак Луны: {RASHI_NAMES[moon]} <em>— от него считаются дома</em>
              </span>
              {m.length > 0 && (
                <span className={styles.graphTypeExtra}>
                  Мангал доша {m.join(" и ")} <em>— тема для внимания, не приговор</em>
                </span>
              )}
            </div>
            <SouthIndianChart
              grahas={chart}
              anchorRashi={moon}
              vargottamaKeys={vg}
              title={d9 ? "D-9" : "D-1"}
              subtitle={name}
            />
          </div>
        ))}
      </div>

      <div className={styles.graphCard} style={{ marginTop: 16 }}>
        <div className={styles.graphCardHead}>
          <span className={styles.lsLabel}>Две карты в одной сетке</span>
          <span className={styles.graphType}>
            видно, где вы стоите в одном знаке, а где расходитесь
          </span>
        </div>
        <SouthIndianChart
          grahas={chartA}
          partner={chartB}
          anchorRashi={moonA}
          title={d9 ? "D-9" : "D-1"}
          subtitle="наложение"
          nameA={nameA}
          nameB={nameB}
        />
        <p className={styles.note}>
          Тёмным — планеты {nameA}, лиловым — {nameB}. Знаки закреплены за клетками, поэтому
          две карты ложатся одна на другую без искажения. Дома отсчитаны от Луны {nameA}.
          Мангал дошу проверяем от Луны и от Венеры — проверка от Лагны требует места
          рождения, которого мы не спрашиваем.
        </p>
      </div>
    </div>
  );
}
