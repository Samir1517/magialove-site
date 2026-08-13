import Link from "next/link";
import type { PairFactor, FactorSystem } from "@/lib/engines/highlights";
import { FACTOR_SYSTEM_NAMES } from "@/lib/engines/highlights";
import { bandStyle, formatScore } from "@/components/viz/scale";
import styles from "./result.module.css";

/**
 * Компактные карточки четырёх систем вместо полных разделов.
 *
 * Зачем. Раньше общая страница показывала все четыре системы целиком, и это
 * давало 47 экранов на телефоне. Причём в урезанном виде: углублённые схемы
 * (октаграмма, бодиграфы, карты Джйотиш) на общей странице намеренно
 * отключены — иначе было бы вдвое больше. То есть человек получал длинную и
 * при этом худшую версию того, что лежит в одном клике.
 *
 * Теперь каждая система — одна карточка: балл, самая сильная находка, зона
 * роста и переход в полный разбор. Уникальное для общей страницы (сводка пары,
 * синтез по темам, аркан дня) осталось на месте.
 */
export function SystemCards({
  factors,
  scores,
  hrefs,
}: {
  factors: PairFactor[];
  scores: Partial<Record<FactorSystem, number | null>>;
  hrefs: Record<FactorSystem, string>;
}) {
  const systems: FactorSystem[] = ["matrix", "numerology", "human_design", "jyotish"];

  return (
    <div className={styles.sysCards}>
      {systems.map((sys) => {
        const score = scores[sys];
        if (score === null || score === undefined) return null;
        const own = factors.filter((f) => f.system === sys);
        if (own.length === 0) return null;

        const sorted = [...own].sort((a, b) => b.score - a.score);
        const best = sorted[0];
        // Зону роста берём только если она действительно низкая: иначе
        // «слабым местом» назначался бы просто наименее сильный фактор.
        const weak = sorted[sorted.length - 1];
        const showWeak = weak.score <= 45 && weak !== best;
        const band = bandStyle(score);

        return (
          <div key={sys} className={styles.sysCard}>
            <div className={styles.sysCardTop}>
              <span className={styles.sysCardName}>{FACTOR_SYSTEM_NAMES[sys]}</span>
              <span className={styles.sysCardScore} style={{ color: band.ink }}>
                {formatScore(score)}%
              </span>
            </div>

            <div className={styles.sysCardRow}>
              <span className={styles.sysCardLabel}>Сильнее всего</span>
              <strong className={styles.sysCardFact}>{best.label}</strong>
              <span className={styles.sysCardNote}>{best.note}</span>
            </div>

            {showWeak && (
              <div className={styles.sysCardRow}>
                <span className={styles.sysCardLabel}>Требует внимания</span>
                <strong className={styles.sysCardFact}>{weak.label}</strong>
                <span className={styles.sysCardNote}>{weak.note}</span>
              </div>
            )}

            <Link href={hrefs[sys]} className={styles.sysCardLink}>
              Весь разбор по этой системе →
            </Link>
          </div>
        );
      })}
    </div>
  );
}
