"use client";

import { useState } from "react";
import type { GrahaPosition } from "@/lib/engines/jyotish";
import {
  RASHI_NAMES,
  houseFrom,
  mangalFrom,
  navamsaChart,
  navamsaRashi,
  rashiChart,
  vargottama,
} from "@/lib/engines/jyotish-charts";
import { rashiIndex } from "@/lib/engines/jyotish-tables";
import { SouthIndianChart } from "@/components/viz/SouthIndianChart";
import styles from "./systems.module.css";

/**
 * Карты пары в южноиндийском формате: своя, партнёра и наложение.
 *
 * Переключатель D-1 / D-9 не украшение: навамша в традиции — карта супруга
 * (Парашара прямо приписывает ей «калатра»), и смотреть совместимость без неё
 * значит смотреть половину.
 *
 * Дома считаем от Лагны, когда известно место рождения, иначе от знака Луны.
 * Лагна приходит долготой, а не знаком: в D-9 у неё своя клетка — навамша-лагна,
 * от которой навамшу и читают.
 */
export function JyotishCharts({
  a,
  b,
  nameA,
  nameB,
  lagnaLonA = null,
  lagnaLonB = null,
}: {
  a: GrahaPosition[];
  b: GrahaPosition[];
  nameA: string;
  nameB: string;
  /** Сидерическая долгота Лагны; null, если места рождения нет в ссылке. */
  lagnaLonA?: number | null;
  lagnaLonB?: number | null;
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

  // Клетка Лагны своя в каждой варге: в D-1 это её знак, в D-9 — навамша-лагна.
  // Слой карт 0-based, а rashiIndex() отдаёт 1-based, отсюда вычитание.
  const lagnaCell = (lon: number | null) =>
    lon === null ? null : d9 ? navamsaRashi(lon) : rashiIndex(lon) - 1;
  const lagnaA = lagnaCell(lagnaLonA);
  const lagnaB = lagnaCell(lagnaLonB);

  // Опора для домов: Лагна, если место рождения известно, иначе Чандра-лагна.
  const anchorA = lagnaA ?? moonA;
  const anchorB = lagnaB ?? moonB;
  const anchorLabel = lagnaA !== null && lagnaB !== null ? "лагны" : "Луны";

  const mangal = (lagna: number | null, moon: number, venus: number, mars: number) =>
    [
      lagna !== null && mangalFrom(lagna, mars) && "от лагны",
      mangalFrom(moon, mars) && "от Луны",
      mangalFrom(venus, mars) && "от Венеры",
    ].filter(Boolean);

  const mA = mangal(lagnaA, moonA, venusA, marsA);
  const mB = mangal(lagnaB, moonB, venusB, marsB);
  // Классическая бханга: если Марс так стоит у обоих, традиция считает дошу
  // взаимно снятой — их Марсы резонируют, а не бьются об чужое спокойствие.
  const bothManglik = mA.length > 0 && mB.length > 0;

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
          : `Двенадцать клеток — двенадцать знаков, они стоят на одних и тех же местах у вас обоих. Поэтому карты и сравниваются взглядом: где у одного пусто, а у второго тесно от планет, там и разница в том, из чего вы сделаны. Диагональ отмечает ${anchorLabel === "лагны" ? "лагну — знак, восходивший на горизонте в минуту рождения" : "знак Луны"}, от неё отсчитываются дома.`}
      </p>

      <div className={styles.graphsPair}>
        {[
          { name: nameA, chart: chartA, anchor: anchorA, lagna: lagnaA, vg: d9 ? vgA : undefined, m: mA },
          { name: nameB, chart: chartB, anchor: anchorB, lagna: lagnaB, vg: d9 ? vgB : undefined, m: mB },
        ].map(({ name, chart, anchor, lagna, vg, m }) => (
          <div key={name} className={styles.graphCard}>
            <div className={styles.graphCardHead}>
              <span className={styles.lsLabel}>{name}</span>
              <span className={styles.graphType}>
                {lagna !== null ? "Лагна" : "Знак Луны"}: {RASHI_NAMES[anchor]}{" "}
                <em>— от него считаются дома</em>
              </span>
              {m.length > 0 && (
                <span className={styles.graphTypeExtra}>
                  Марс в доме Мангал доши {m.join(" и ")}
                </span>
              )}
            </div>
            <SouthIndianChart
              grahas={chart}
              anchorRashi={anchor}
              anchorLabel={lagna !== null ? "лагны" : "Луны"}
              vargottamaKeys={vg}
              title={d9 ? "D-9" : "D-1"}
              subtitle={name}
            />
          </div>
        ))}
      </div>

      <div className={styles.graphsJoin} aria-hidden="true">
        <span>вместе</span>
      </div>

      <div className={styles.graphCard} style={{ marginTop: 0 }}>
        <div className={styles.graphCardHead}>
          <span className={styles.lsLabel}>Две карты в одной сетке</span>
          <span className={styles.graphType}>
            видно, где вы стоите в одном знаке, а где расходитесь
          </span>
        </div>
        <SouthIndianChart
          grahas={chartA}
          partner={chartB}
          anchorRashi={anchorA}
          anchorLabel={lagnaA !== null ? "лагны" : "Луны"}
          title={d9 ? "D-9" : "D-1"}
          subtitle="наложение"
          nameA={nameA}
          nameB={nameB}
        />
        {(mA.length > 0 || mB.length > 0) && (
          <p className={styles.mangalNote}>
            {bothManglik
              ? `Марс стоит в «горячем» доме у вас обоих. Именно этого случая традиция не боится: когда Мангал доша есть у двоих, её считают взаимно снятой — ваши Марсы бьются друг о друга, а не об чужое спокойствие. Накал в этой паре будет всегда: и в ссоре, и в постели. Вопрос не в том, как его убрать, а в том, во что вы его пускаете.`
              : `Марс стоит в «горячем» доме у одного из вас, а у второго нет. Традиция считает это самым неудобным раскладом: один живёт на градусе, который второму кажется скандалом на ровном месте, а второй — на спокойствии, которое первому читается как равнодушие. Работает здесь одно: договориться, что накал — это не претензия к партнёру, а его устройство.`}
          </p>
        )}

        <p className={styles.note}>
          Тёмным — {nameA}, лиловым — {nameB}. Знаки закреплены за клетками, поэтому две
          карты ложатся одна на другую без искажения; дома отсчитаны от Луны первой карты.
          Мангал дошу проверяем от Луны и от Венеры — проверка от Лагны требует места
          рождения, которого мы не спрашиваем.
        </p>
      </div>
    </div>
  );
}
