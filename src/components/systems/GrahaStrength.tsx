"use client";

import { useMemo } from "react";
import type { Person } from "@/lib/engines/types";
import { calcNavagraha } from "@/lib/engines/jyotish";
import { safely } from "@/lib/engines/person";
import styles from "./systems.module.css";

/**
 * «Какие планеты в вашей карте сильны, а какие зажаты».
 *
 * Прямой аналог блока полярности в Дизайне человека: мы уже знаем положение
 * каждой планеты, значит можем сказать не «Венера в Рыбах», а что это для
 * человека значит.
 *
 * Главное правило текста здесь — ни одного термина без немедленной
 * расшифровки бытовыми словами. Наша читательница не обязана знать, что такое
 * вакри или мулатрикона, и отсылать её к словарю значит потерять её на первом
 * же слове. Термин даётся, но следом сразу идёт объяснение — так человек и
 * понимает написанное, и попутно запоминает слово.
 */
const PLANET_MEANS: Record<string, string> = {
  sun: "уверенность в себе и отношения с отцовской фигурой",
  moon: "чувства, покой и то, как человек привязывается",
  mars: "напор, способность злиться и защищать своё",
  mercury: "речь, ум и умение договариваться",
  jupiter: "смысл, щедрость и вера в лучшее",
  venus: "любовь, красота и умение получать удовольствие",
  saturn: "терпение, дисциплина и отношение к ограничениям",
};

const DIGNITY_TEXT: Record<string, { chip: string; what: string }> = {
  экзальтация: {
    chip: "в полной силе",
    what: "стоит в знаке, где раскрывается лучше всего — это её лучшее место из двенадцати",
  },
  мулатрикона: {
    chip: "очень сильна",
    what: "стоит в своей «домашней» зоне: почти так же хорошо, как в лучшем знаке",
  },
  "своя обитель": {
    chip: "у себя дома",
    what: "стоит в знаке, которым сама управляет — как человек в собственной квартире",
  },
  падение: {
    chip: "зажата",
    what: "стоит в знаке, противоположном лучшему: качество никуда не делось, но даётся усилием и часто через неудобные ситуации",
  },
};

function Side({ person, name }: { person: Person; name: string }) {
  const grahas = useMemo(() => safely(() => calcNavagraha(person)) ?? [], [person]);
  const notable = grahas.filter((g) => g.dignity || g.combust || (g.retro && g.key !== "rahu" && g.key !== "ketu"));

  if (notable.length === 0) return null;

  return (
    <div className={styles.partnerCard}>
      <span className={styles.lsLabel}>{name}</span>
      <ul className={styles.lsList}>
        {notable.map((g) => {
          const d = g.dignity ? DIGNITY_TEXT[g.dignity] : null;
          const means = PLANET_MEANS[g.key];
          return (
            <li key={g.key} className={styles.lsItem}>
              <strong>{g.name}</strong>
              {means ? ` — ${means}. ` : " "}
              {d && (
                <>
                  <strong>{d.chip}:</strong> {d.what}
                  {". "}
                </>
              )}
              {g.combust && (
                <>
                  Стоит слишком близко к Солнцу — на языке традиции это называется сожжением:
                  свойство есть, но его плохо слышно за более громким солнечным.{" "}
                </>
              )}
              {g.retro && g.key !== "rahu" && g.key !== "ketu" && (
                <>
                  Движется вспять (вакри) — с Земли видно, как планета идёт по небу назад. Её
                  силы разворачиваются внутрь: человек сначала переживает это в себе и только
                  потом показывает наружу.
                </>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function GrahaStrength({
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
      <h3 className={styles.blockTitle}>Какие планеты сильны, а какие зажаты</h3>
      <p className={styles.note} style={{ marginBottom: 10 }}>
        В индийской астрологии у каждой планеты есть знак, где ей хорошо, и противоположный,
        где тесно. Это не про везение и не про оценку человека: сильная планета означает, что
        её качество включается само, зажатая — что то же качество придётся добывать усилием.
        Ниже только те планеты, у которых положение выражено; остальные стоят нейтрально, и
        говорить о них нечего.
      </p>
      <div className={styles.lightShadow}>
        <Side person={a} name={nameA} />
        <Side person={b} name={nameB} />
      </div>
    </div>
  );
}
