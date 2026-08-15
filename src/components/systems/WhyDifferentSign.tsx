"use client";

import { useMemo } from "react";
import type { Person } from "@/lib/engines/types";
import { calcSignShift } from "@/lib/engines/jyotish";
import { safely } from "@/lib/engines/person";
import styles from "./systems.module.css";

/**
 * «Почему здесь у меня другой знак».
 *
 * Самое частое место, где человек теряет доверие к расчёту. Женщина всю жизнь
 * знает себя Водолеем, открывает Джйотиш и видит Козерога. Первая мысль не
 * «интересно», а «сломано» — и она уходит, не дочитав до всего остального.
 *
 * Поэтому блок стоит рядом с местом, где знак впервые появляется, и отвечает
 * не общими словами, а её собственными двумя знаками. Главное сообщение —
 * никто не ошибся и западный знак остаётся верным: это две разные точки
 * отсчёта, а не спор о том, кто прав.
 */
export function WhyDifferentSign({
  a,
  b,
  nameA,
  nameB,
}: {
  a: Person;
  b: Person;
  nameA: string;
  nameB: string;
}) {
  const sa = useMemo(() => safely(() => calcSignShift(a)), [a]);
  const sb = useMemo(() => safely(() => calcSignShift(b)), [b]);
  if (!sa || !sb) return null;

  // Если у обоих знак не сдвинулся, объяснять нечего — блок не показываем.
  if (sa.same && sb.same) return null;

  const rows = [
    { name: nameA, s: sa },
    { name: nameB, s: sb },
  ];

  return (
    <div className={styles.partnerCard} style={{ borderLeftColor: "var(--accent)" }}>
      <span className={styles.lsLabel}>Почему здесь другой знак</span>

      <ul className={styles.lsList}>
        {rows.map(({ name, s }) => (
          <li key={name} className={styles.lsItem}>
            <strong>{name}:</strong>{" "}
            {s.same ? (
              <>
                и там и там {s.western} — Солнце стоит далеко от границы знака, поэтому
                сдвиг его не задел.
              </>
            ) : (
              <>
                по привычному западному зодиаку — <strong>{s.western}</strong>, по
                ведическому — <strong>{s.vedic}</strong>.
              </>
            )}
          </li>
        ))}
      </ul>

      <p className={styles.lsText}>
        Никто не ошибся, и западный знак остаётся верным. Просто две системы считают от
        разных точек. Западная берёт за начало точку весеннего равноденствия, индийская —
        неподвижные звёзды. Земная ось медленно колеблется, и за две тысячи лет эти начала
        разошлись примерно на {String(sa.ayanamsaDeg).replace(".", ",")}° — почти целый знак. Отсюда и сдвиг: в
        Джйотише Солнце чаще всего оказывается в предыдущем знаке.
      </p>

      <p className={styles.note}>
        На расчёт совместимости это не влияет: восемь кут строятся на Луне и её накшатре,
        и внутри ведической системы всё посчитано согласованно. Гороскоп в журнале и этот
        расчёт просто говорят на разных языках — переводить один в другой не нужно.
      </p>
    </div>
  );
}
