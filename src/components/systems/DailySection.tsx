"use client";

import { useEffect, useState } from "react";
import { calcDaily, formatRuDate, type DailyReading } from "@/lib/engines/daily";
import { getArcanumInfo } from "@/lib/engines/matrix";
import { DAILY_ARCANA, dailyNumberText } from "@/lib/content/daily";
import type { Person } from "@/lib/engines/types";
import styles from "./systems.module.css";

/**
 * Дата берётся в браузере, а не на сборке: страница статическая, но этот блок
 * пересчитывается у каждого посетителя в его сегодняшний день. Поэтому расчёт
 * живёт в useEffect — иначе пререндер зафиксировал бы дату сборки и React
 * ругался бы на расхождение разметки.
 */
export function DailySection({ a, b }: { a: Person; b: Person }) {
  const [today, setToday] = useState<Date | null>(null);
  const [daily, setDaily] = useState<DailyReading | null>(null);

  useEffect(() => {
    const now = new Date();
    setToday(now);
    try {
      setDaily(calcDaily(a, b, now));
    } catch {
      setDaily(null);
    }
  }, [a, b]);

  if (!daily || !today) {
    return (
      <section className={styles.section} aria-labelledby="daily-title">
        <div className={styles.sectionHead}>
          <div className={styles.eyebrow}>Сегодня</div>
          <h2 id="daily-title" className={styles.sectionTitle}>
            Аркан дня для вашей пары
          </h2>
          <p className={styles.sectionLede}>Считаем на сегодняшнюю дату…</p>
        </div>
      </section>
    );
  }

  const arcanum = getArcanumInfo(daily.pairArcanum);
  const reading = DAILY_ARCANA[daily.pairArcanum];

  return (
    <section className={styles.section} aria-labelledby="daily-title">
      <div className={styles.sectionHead}>
        <div className={styles.eyebrow}>Сегодня · {formatRuDate(today)}</div>
        <h2 id="daily-title" className={styles.sectionTitle}>
          Аркан дня для вашей пары
        </h2>
        <p className={styles.sectionLede}>
          Этот блок пересчитывается каждые сутки. Общий разбор пары не меняется — а вот
          то, что подсвечивается в ваших отношениях сегодня, будет другим уже завтра.
          Сохраните страницу и загляните, когда день не задастся.
        </p>
      </div>

      <div className={styles.themeCard}>
        <div className={styles.themeKey}>{arcanum.number}</div>
        <div className={styles.themeMeta}>
          <div className={styles.themeTitle}>
            Аркан «{arcanum.name}»
            <span className={styles.themeFolk}> · {arcanum.theme}</span>
          </div>
          <p className={styles.themeEssence}>{arcanum.inPair}</p>
        </div>
      </div>

      <div className={styles.lightShadow}>
        <div className={styles.lightCard}>
          <span className={styles.lsLabel}>Что день открывает</span>
          <p className={styles.lsText}>{reading.opens}</p>
        </div>
        <div className={styles.shadowCard}>
          <span className={styles.lsLabel}>Во что легко свалиться</span>
          <p className={styles.lsText}>{reading.watch}</p>
        </div>
      </div>

      <div className={styles.stepCard}>
        <span className={styles.lsLabel}>Шаг на сегодня</span>
        <p className={styles.stepText}>{reading.step}</p>
      </div>

      <p className={styles.doshaText}>{dailyNumberText(daily.pairNumber)}</p>

      <p className={styles.note}>
        Аркан дня пары считается наложением сегодняшней даты на центр вашей общей
        матрицы, поэтому у каждой пары он свой: у вас и у ваших друзей в один и тот же
        день будут разные арканы.
      </p>
    </section>
  );
}
