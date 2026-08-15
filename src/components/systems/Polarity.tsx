"use client";

import { useMemo } from "react";
import type { Person } from "@/lib/engines/types";
import { calcPersonalDesign, ACTIVATION_BODIES } from "@/lib/engines/human_design";
import { safely } from "@/lib/engines/person";
import { gateInfo } from "@/lib/data/human_design/gates";
import { gateLineName } from "@/lib/data/human_design/gate-line-names";
import { linePolarity } from "@/lib/data/human_design/line-polarity";
import styles from "./systems.module.css";

/**
 * «Что работает легко, а что даётся труднее».
 *
 * У каждой из 384 позиций своя планета в экзальтации и своя в падении. Мы
 * знаем, какая планета встала у человека в каждые ворота с линией — порядок
 * тел в расчёте фиксирован. Совпало с экзальтацией: эта часть характера идёт
 * сама. Совпало с падением: то же качество есть, но достаётся усилием.
 *
 * Это не приговор и не оценка. Ровно наоборот: человек обычно и так чувствует,
 * что где-то он как рыба в воде, а где-то буксует на ровном месте, — здесь
 * ему показывают, где именно, и что это не лень.
 *
 * Где данных из источника нет, позиция молча пропускается.
 */
type Row = { side: string; gate: number; line: number; planet: string; kind: "ex" | "det" };

function collect(person: Person): Row[] {
  const hd = calcPersonalDesign(person);
  const rows: Row[] = [];
  const walk = (list: { gate: number; line: number }[], side: string) => {
    list.forEach((g, i) => {
      const planet = ACTIVATION_BODIES[i];
      if (!planet) return;
      const pol = linePolarity(g.gate, g.line);
      if (!pol) return;
      if (pol.ex === planet) rows.push({ side, gate: g.gate, line: g.line, planet, kind: "ex" });
      else if (pol.det === planet) rows.push({ side, gate: g.gate, line: g.line, planet, kind: "det" });
    });
  };
  walk(hd.personalityGates, "Личность");
  walk(hd.designGates, "Дизайн");
  return rows;
}

function Side({ person, name }: { person: Person; name: string }) {
  const rows = useMemo(() => safely(() => collect(person)) ?? [], [person]);
  const ex = rows.filter((r) => r.kind === "ex");
  const det = rows.filter((r) => r.kind === "det");

  if (rows.length === 0) return null;

  const line = (r: Row) => {
    const nm = gateLineName(r.gate, r.line);
    const gi = gateInfo(r.gate);
    return `${r.planet} · ${r.gate}.${r.line}${nm ? ` «${nm}»` : ""}${gi ? ` — ${gi.name}` : ""}`;
  };

  return (
    <div className={styles.partnerCard}>
      <span className={styles.lsLabel}>{name}</span>
      {ex.length > 0 && (
        <>
          <p className={styles.lsText}>
            <strong>Идёт само.</strong> Планета попала в позицию, где она в экзальтации:
          </p>
          <ul className={styles.lsList}>
            {ex.map((r) => (
              <li key={`e-${r.side}-${r.gate}-${r.line}`} className={styles.lsItem}>
                {line(r)}
              </li>
            ))}
          </ul>
        </>
      )}
      {det.length > 0 && (
        <>
          <p className={styles.lsText} style={{ marginTop: ex.length ? 12 : 0 }}>
            <strong>Даётся усилием.</strong> Здесь планета в падении — качество есть, но
            включается не само:
          </p>
          <ul className={styles.lsList}>
            {det.map((r) => (
              <li key={`d-${r.side}-${r.gate}-${r.line}`} className={styles.lsItem}>
                {line(r)}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

export function Polarity({
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
      <h3 className={styles.blockTitle}>Что работает легко, а что даётся усилием</h3>
      <p className={styles.note} style={{ marginBottom: 10 }}>
        У каждой позиции есть планета, с которой она раскрывается сама, и планета, с которой
        то же качество приходится включать вручную. Ниже — совпадения в ваших картах. Пусто
        значит, что таких совпадений не выпало, а не что вам чего-то не досталось.
      </p>
      <div className={styles.lightShadow}>
        <Side person={a} name={nameA} />
        <Side person={b} name={nameB} />
      </div>
    </div>
  );
}
