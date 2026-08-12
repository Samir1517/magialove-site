import type { EffectiveWeight } from "@/lib/engines/synthesis";
import { formatScore } from "@/components/viz/scale";
import styles from "./result.module.css";

/**
 * Раскрывающийся блок «Как посчитан этот балл»: показывает реальные доли
 * систем в итоговом числе и вклад каждой. Данные берутся из тех же весов,
 * по которым считает движок (getEffectiveWeights), — ничего не
 * пересчитывается заново и не подгоняется под красивую картинку.
 *
 * Зачем: непрозрачный процент читается как «число из ниоткуда» и вызывает
 * недоверие к алгоритму. Показанная арифметика снимает этот вопрос.
 */
export function ScoreBreakdown({
  weights,
  scores,
  overall,
  hasTimes,
}: {
  weights: EffectiveWeight[];
  scores: Partial<Record<string, number | null>>;
  overall: number;
  hasTimes: boolean;
}) {
  return (
    <details className={styles.breakdown}>
      <summary className={styles.breakdownSummary}>Как посчитан этот балл</summary>

      <p className={styles.breakdownIntro}>
        {hasTimes
          ? "Итог — не среднее арифметическое: системам с более детальными входными данными отдан больший вес."
          : "Пока времени рождения нет, весь вес несут две системы, которым достаточно даты. Добавишь время — раскладка изменится."}
      </p>

      <table className={styles.breakdownTable}>
        <thead>
          <tr>
            <th>Система</th>
            <th>Балл</th>
            <th>Вес</th>
            <th>Вклад</th>
          </tr>
        </thead>
        <tbody>
          {weights.map((w) => {
            const score = scores[w.system];
            if (score === null || score === undefined) return null;
            return (
              <tr key={w.system}>
                <td>{w.title}</td>
                <td className={styles.breakdownNum}>{formatScore(score)}%</td>
                <td className={styles.breakdownNum}>{Math.round(w.share * 100)}%</td>
                <td className={styles.breakdownNum}>{formatScore(score * w.share)}</td>
              </tr>
            );
          })}
          <tr className={styles.breakdownTotal}>
            <td colSpan={3}>Итого</td>
            <td className={styles.breakdownNum}>{formatScore(overall)}</td>
          </tr>
        </tbody>
      </table>

      <p className={styles.breakdownNote}>
        Внутри каждой системы балл тоже складывается из её собственных показателей — зон
        матрицы, линий психоматрицы, кут Аштакуты, каналов композита. Их разбор — в секциях
        ниже. Расчёт целиком выполняется в твоём браузере.
      </p>
    </details>
  );
}
