import type { ChakraBalanceItem, IndividualMatrix } from "@/lib/engines/matrix";
import { CHAKRA_PROJECTION } from "@/lib/engines/matrix";
import styles from "./viz.module.css";

/**
 * Чакровая вертикаль пары — канон ниши (таблица чакр сверху вниз с радужной
 * кодировкой), но в парном варианте, которого у конкурентов нет: арканы её,
 * его и общей матрицы в одной строке + отметка резонанса, когда арканы совпали.
 * Радуга приглушена под пастельную палитру сайта.
 */

const CHAKRA_COLORS: Record<string, string> = {
  sahasrara: "#b9a7d8",
  ajna: "#92a8d8",
  vishuddha: "#8fc3d8",
  anahata: "#9ecfb2",
  manipura: "#e3d08e",
  svadhisthana: "#e8b48e",
  muladhara: "#dd9a9a",
};

export function ChakraTable({
  balance,
  aMatrix,
  bMatrix,
  nameA,
  nameB,
}: {
  balance: ChakraBalanceItem[];
  aMatrix: IndividualMatrix;
  bMatrix: IndividualMatrix;
  nameA: string;
  nameB: string;
}) {
  const positionOf = (key: string) => CHAKRA_PROJECTION.find((c) => c.key === key)?.position;

  return (
    <div className={styles.chakraTable}>
      <div className={`${styles.chakraRow} ${styles.chakraHeadRow}`}>
        <span />
        <span className={styles.chakraHead}>Чакра</span>
        <span className={styles.chakraHeadNum}>{nameA}</span>
        <span className={styles.chakraHeadNum}>{nameB}</span>
        <span className={styles.chakraHeadNum}>Вместе</span>
      </div>
      {balance.map((item) => {
        const pos = positionOf(item.key);
        const aVal = pos ? aMatrix[pos] : null;
        const bVal = pos ? bMatrix[pos] : null;
        const resonance = aVal !== null && aVal === bVal;
        return (
          <div key={item.key} className={styles.chakraRow}>
            <span
              className={styles.chakraCapsule}
              style={{ background: CHAKRA_COLORS[item.key] ?? "#d8c7d8" }}
              aria-hidden="true"
            />
            <span className={styles.chakraName}>
              <strong>{item.name}</strong>
              <em>{item.layer}</em>
            </span>
            <span className={styles.chakraNum}>{aVal ?? "—"}</span>
            <span className={styles.chakraNum}>{bVal ?? "—"}</span>
            <span className={`${styles.chakraNum} ${styles.chakraNumPair}`}>
              {item.arcanum}
              {resonance && (
                <span className={styles.chakraResonance} title="Арканы партнёров совпали — резонанс">
                  ✦
                </span>
              )}
            </span>
          </div>
        );
      })}
      <p className={styles.chakraLegend}>
        ✦ — резонанс: на этом уровне у вас двоих одинаковый аркан. Колонка «Вместе» — аркан
        общей матрицы, его смысл для каждого уровня описан ниже.
      </p>
    </div>
  );
}
