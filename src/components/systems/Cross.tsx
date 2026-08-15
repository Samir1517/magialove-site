"use client";

import { useMemo } from "react";
import type { Person } from "@/lib/engines/types";
import { calcIncarnationCross, type CrossAngle } from "@/lib/engines/human_design";
import { safely } from "@/lib/engines/person";
import { gateInfo } from "@/lib/data/human_design/gates";
import { gateLineName } from "@/lib/data/human_design/gate-line-names";
import styles from "./systems.module.css";

/**
 * Инкарнационный крест — четыре опорные активации: Солнце и Земля в моменте
 * рождения и в моменте Дизайна.
 *
 * Названий крестов здесь нет: корпус из 192 имён взять неоткуда, кроме
 * авторских материалов. Зато состав и угол считаются по нашим же эфемеридам,
 * а именно они и объясняют человеку, почему его жизнь устроена так, а не иначе.
 *
 * Для пары это ценно не само по себе, а сравнением: два правых угла — двое
 * идут своей дорогой и могут годами не пересекаться в главном. Правый и левый —
 * один живёт своей задачей, второму нужны люди, чтобы задача вообще случилась.
 */
const ANGLE_MEANING: Record<CrossAngle, string> = {
  "Правый угол":
    "личная судьба. Дорога идёт изнутри: человек занят своим делом, и внешние люди в нём скорее попутчики, чем условие.",
  Юкстапозиция:
    "фиксированная роль. Ни личная задача, ни путь через других — человек просто делает то, на что поставлен, и в этом его сила.",
  "Левый угол":
    "трансперсональная судьба. Дорога идёт через людей: без встреч и чужого участия задача не разворачивается вовсе.",
};

function Side({ person, name }: { person: Person; name: string }) {
  const cross = useMemo(() => safely(() => calcIncarnationCross(person)), [person]);
  if (!cross) return null;

  const four = [
    { label: "Солнце Личности", g: cross.personalitySun },
    { label: "Земля Личности", g: cross.personalityEarth },
    { label: "Солнце Дизайна", g: cross.designSun },
    { label: "Земля Дизайна", g: cross.designEarth },
  ];

  return (
    <div className={styles.partnerCard}>
      <span className={styles.lsLabel}>{name}</span>
      <p className={styles.lsText}>
        <strong>{cross.angle}</strong> — {ANGLE_MEANING[cross.angle]}
      </p>
      <p className={styles.lsText} style={{ marginTop: 8 }}>
        Состав: <strong>{cross.notation}</strong>
      </p>
      <ul className={styles.lsList}>
        {four.map((f) => {
          const gi = gateInfo(f.g.gate);
          const ln = gateLineName(f.g.gate, f.g.line);
          return (
            <li key={f.label} className={styles.lsItem}>
              {f.label}: {f.g.gate}.{f.g.line}
              {gi ? ` «${gi.name}»` : ""}
              {ln ? ` · ${ln}` : ""}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function Cross({
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
      <h3 className={styles.blockTitle}>Инкарнационный крест</h3>
      <p className={styles.note} style={{ marginBottom: 10 }}>
        Четыре опорные точки карты: Солнце и Земля в минуту рождения и в моменте Дизайна.
        В Дизайне человека это самый крупный масштаб — не про характер, а про то, вокруг
        чего вообще собрана жизнь. Названий крестов мы не приводим: это отдельный корпус из
        ста девяноста двух имён, и брать его нам неоткуда, а состав и угол считаются точно.
      </p>
      <div className={styles.lightShadow}>
        <Side person={a} name={nameA} />
        <Side person={b} name={nameB} />
      </div>
    </div>
  );
}
