"use client";

import { useMemo } from "react";
import type { Person } from "@/lib/engines/types";
import { calcJyotishTimeSensitivity } from "@/lib/engines/jyotish";
import { safely } from "@/lib/engines/person";
import styles from "./systems.module.css";

/**
 * «Что зависит от точности времени рождения» — джйотишская версия.
 *
 * Тревога у читательницы обычно направлена не туда. Она боится за накшатру
 * Луны, а Луна проходит стоянку почти за сутки, и полчаса её не сдвинут. Зато
 * Лагна меняет знак каждые два часа с небольшим — и если человек родился близко
 * к границе, те же полчаса переставляют все двенадцать домов разом.
 *
 * Поэтому мы не отделываемся словом «примерно», а показываем счёт: сколько
 * минут запаса есть на самом деле в этой конкретной карте. Человек с
 * приблизительным временем в свидетельстве получает не «всё неверно», а точный
 * список того, к чему стоит относиться с осторожностью, и того, что устояло.
 */
const SHIFT_MINUTES = 30;

/** «106 минут» читается хуже, чем «час сорок». */
function humanMinutes(m: number): string {
  if (m < 60) return `${m} мин`;
  const h = Math.floor(m / 60);
  const rest = m % 60;
  const hours = h === 1 ? "час" : "часа";
  return rest === 0 ? `${h} ${hours}` : `${h} ${hours} ${rest} мин`;
}

function Side({ person, name }: { person: Person; name: string }) {
  const d = useMemo(() => safely(() => calcJyotishTimeSensitivity(person, SHIFT_MINUTES)), [person]);
  if (!d) return null;

  const steady = !d.fragile.lagna && !d.fragile.pada && !d.fragile.nakshatra;

  return (
    <div className={styles.partnerCard}>
      <span className={styles.lsLabel}>{name}</span>

      {steady ? (
        <p className={styles.lsText}>
          Полчаса в любую сторону ничего здесь не меняют: и лагна, и положение Луны
          остаются теми же.
        </p>
      ) : (
        <p className={styles.lsText}>
          Полчаса в любую сторону меняют{" "}
          {[
            d.fragile.lagna && "лагну, а вместе с ней все двенадцать домов",
            d.fragile.nakshatra && "накшатру Луны, а значит и половину баллов Аштакуты",
            !d.fragile.nakshatra && d.fragile.pada && "паду Луны, а с ней карту D-9",
          ]
            .filter(Boolean)
            .join("; ")}
          . Если время в свидетельстве записано округлённо, к этим пунктам стоит
          относиться как к вероятному, а не к точному.
        </p>
      )}

      <ul className={styles.lsList}>
        {d.lagnaRashi && (
          <li className={styles.lsItem}>
            <strong>Лагна: {d.lagnaRashi}.</strong> Лагна — знак, который восходил на
            горизонте в минуту рождения; от него отсчитываются дома, и он же держит
            Мангал дошу.{" "}
            {d.sinceLagnaChange !== null &&
              `Этот знак взошёл ${humanMinutes(d.sinceLagnaChange)} назад`}
            {d.sinceLagnaChange !== null && d.toLagnaChange !== null && ", а сменится через "}
            {d.sinceLagnaChange === null && d.toLagnaChange !== null && "Сменится через "}
            {d.toLagnaChange !== null && humanMinutes(d.toLagnaChange)}
            {(d.sinceLagnaChange !== null || d.toLagnaChange !== null) && ". "}
            {d.toLagnaChange !== null && d.toLagnaChange <= SHIFT_MINUTES
              ? "Запас меньше получаса — это тот случай, когда точную минуту стоит уточнить."
              : "Запас есть, ошибка в четверть часа знак не переставит."}
          </li>
        )}
        <li className={styles.lsItem}>
          <strong>
            Луна: {d.moonNakshatra}, пада {d.moonPada}.
          </strong>{" "}
          Накшатра — участок неба шириной 13°20′, Луна проходит его почти за сутки, поэтому
          от получаса он не меняется. Пада — его четверть: она задаёт планете знак во второй
          карте, D-9, и держится{" "}
          {d.toPadaChange === null ? "больше трёх часов" : humanMinutes(d.toPadaChange)}.
        </li>
      </ul>
    </div>
  );
}

export function JyotishTimeSensitivity({
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
  return (
    <div>
      <h3 className={styles.blockTitle}>Что зависит от точности времени рождения</h3>
      <p className={styles.note} style={{ marginBottom: 10 }}>
        Половина Джйотиша считается от даты и не зависит от минут вовсе: восемь кут строятся
        на Луне, а Луна за полчаса почти не двигается. Вторая половина — дома и лагна —
        держится на точном моменте. Ниже видно, сколько запаса есть именно в вашем случае.
      </p>
      <div className={styles.lightShadow}>
        <Side person={a} name={nameA} />
        <Side person={b} name={nameB} />
      </div>
    </div>
  );
}
