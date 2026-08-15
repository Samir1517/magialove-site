"use client";

import { useMemo } from "react";
import type { Person } from "@/lib/engines/types";
import { calcTimeSensitivity } from "@/lib/engines/human_design";
import { safely } from "@/lib/engines/person";
import { gateInfo } from "@/lib/data/human_design/gates";
import { gateLineName } from "@/lib/data/human_design/gate-line-names";
import styles from "./systems.module.css";

/**
 * «Что зависит от точности времени рождения».
 *
 * Человек почти всегда боится не за то. Он переживает за тип и профиль — а
 * они держатся на Солнце, которому нужны сутки, чтобы сменить линию, и от
 * получаса не сдвинутся. Зато Луна проходит линию примерно за час сорок, и
 * вот там «плюс-минус полчаса» действительно меняют картину.
 *
 * Поэтому блок называет обе стороны: что устояло и что поплывёт. Это тот
 * случай, когда честность сильнее уверенного тона — человек с приблизительным
 * временем в свидетельстве получает не «всё неверно», а точный список
 * пунктов, к которым стоит относиться с осторожностью.
 */
const SHIFT_MINUTES = 30;

function Side({ person, name }: { person: Person; name: string }) {
  const data = useMemo(() => safely(() => calcTimeSensitivity(person, SHIFT_MINUTES)), [person]);
  if (!data) return null;

  const { fragile, profileChanges } = data;

  return (
    <div className={styles.partnerCard}>
      <span className={styles.lsLabel}>{name}</span>
      {fragile.length === 0 ? (
        <p className={styles.lsText}>
          Полчаса в любую сторону ничего не меняют — вся карта держится устойчиво.
        </p>
      ) : (
        <>
          <p className={styles.lsText}>
            {profileChanges
              ? "Профиль стоит на границе: при сдвиге на полчаса он становится другим. Здесь точное время критично."
              : "Профиль, тип и авторитет держатся — они стоят на Солнце, а ему нужны сутки, чтобы сменить линию. Поплывёт другое:"}
          </p>
          <ul className={styles.lsList}>
            {fragile.map((f) => {
              const nm = gateLineName(f.gate, f.line);
              const alt = gateLineName(f.altGate, f.altLine);
              return (
                <li key={`${f.side}-${f.index}`} className={styles.lsItem}>
                  <strong>
                    {f.side} {f.gate}.{f.line}
                    {nm ? ` «${nm}»` : ""}
                  </strong>{" "}
                  → {f.altGate}.{f.altLine}
                  {alt ? ` «${alt}»` : ""}
                  {f.gateChanges && gateInfo(f.altGate)
                    ? ` — меняются сами ворота, на «${gateInfo(f.altGate)!.name}»`
                    : ""}
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}

export function TimeSensitivity({
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
        Мы сдвинули момент рождения на полчаса в обе стороны и пересчитали обе карты. Ниже —
        ровно то, что от этого сдвига меняется. Если время в свидетельстве записано с
        точностью до пяти минут, читать этот блок незачем.
      </p>
      <div className={styles.lightShadow}>
        <Side person={a} name={nameA} />
        <Side person={b} name={nameB} />
      </div>
    </div>
  );
}
