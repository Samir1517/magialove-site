import type { JyotishRawFeatures } from "@/lib/engines/jyotish";
import { KUTA_READINGS, type KutaKey } from "@/lib/content/jyotish";
import styles from "./systems.module.css";

import kutasData from "@/lib/data/jyotish/kutas.json";

/**
 * Первое, что человек читает после числа: две-три фразы про них двоих.
 *
 * До этого блока страница открывалась заголовком «Аштакута: восемь совпадений»
 * и абзацем про классический ведический метод. То есть женщина, пришедшая с
 * вопросом «почему с ним всё так по-другому», первым делом получала название
 * индийской методики. Узнавание — «ой, это же про нас» — начиналось абзацев
 * через двадцать, а до туда доходят не все.
 *
 * Здесь не добавлено ни одного нового расчёта: берём самую сильную и самую
 * слабую куту из уже посчитанных и пересказываем их одной фразой каждую.
 * Метод и восемь кут идут следом и объясняют то, что человек уже прочитал про
 * себя, — так порядок совпадает с тем, зачем он пришёл.
 */
const KUTA_TITLES = (kutasData as { kutas: { key: KutaKey; title: string; max: number }[] }).kutas;

export function PairSnapshot({ features }: { features: JyotishRawFeatures }) {
  const kutas = features.gunaMilan.kutas;

  const scored = KUTA_TITLES.map((k) => {
    const r = kutas[k.key];
    return r ? { key: k.key, title: k.title, share: r.score / r.max, score: r.score, max: r.max } : null;
  }).filter(Boolean) as { key: KutaKey; title: string; share: number; score: number; max: number }[];

  if (scored.length === 0) return null;

  const sorted = [...scored].sort((x, y) => y.share - x.share);
  const best = sorted[0];
  const worst = sorted[sorted.length - 1];

  // Доши показываем только когда есть о чём говорить: «дош нет» — не новость,
  // ради которой стоит занимать первый экран.
  const activeDosha = features.doshas.find((d) => d.active && !d.neutralized);
  const neutralized = features.doshas.find((d) => d.neutralized);

  return (
    <div className={styles.partnerCard} style={{ borderLeftColor: "var(--accent)" }}>
      <span className={styles.lsLabel}>Если коротко — что у вас происходит</span>

      <p className={styles.lsText}>
        <strong>Крепче всего — {best.title.toLowerCase()}.</strong> {KUTA_READINGS[best.key].high}
      </p>

      {worst.key !== best.key && (
        <p className={styles.lsText}>
          <strong>Труднее всего — {worst.title.toLowerCase()}.</strong>{" "}
          {worst.share >= 0.5 ? KUTA_READINGS[worst.key].high : KUTA_READINGS[worst.key].low}
        </p>
      )}

      {activeDosha && (
        <p className={styles.lsText}>
          Традиция отмечает у вас {activeDosha.title.toLowerCase()} — это не приговор, а место,
          где стоит быть внимательнее. Разбор ниже.
        </p>
      )}
      {!activeDosha && neutralized && (
        <p className={styles.lsText}>
          Отягощение, которое традиция считает серьёзным, у вас взаимно снято: оно есть у
          обоих и потому друг о друга гасится.
        </p>
      )}

      <p className={styles.note}>
        Дальше — откуда это взялось: восемь показателей по отдельности, ваши карты и то, что
        написано про партнёрство в карте каждого.
      </p>
    </div>
  );
}
