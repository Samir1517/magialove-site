import type { PairHighlights, RoleAssignment } from "@/lib/engines/highlights";
import { FACTOR_SYSTEM_NAMES } from "@/lib/engines/highlights";
import { bandStyle, formatScore } from "@/components/viz/scale";
import { Reveal } from "@/components/viz/Reveal";
import styles from "./result.module.css";

/**
 * «Пирамида» подачи результата (паттерн Naksham/The Pattern): сначала самая
 * сильная нить пары как эмоциональный якорь, затем сильные стороны и зоны
 * роста, собранные из всех доступных систем, затем роли в паре.
 */
export function PairSummary({
  highlights,
  roles,
  nameA,
  nameB,
}: {
  highlights: PairHighlights;
  roles: RoleAssignment[];
  nameA: string;
  nameB: string;
}) {
  const { strongest, strengths, growth } = highlights;
  const strongestBand = bandStyle(strongest.score);

  return (
    <>
      {/* Самая сильная нить */}
      <Reveal>
      <div className={styles.threadCard}>
        <div className={styles.threadLabel}>Самая сильная нить вашей пары</div>
        <div className={styles.threadRow}>
          {/* Без «%» число читалось как «100» неизвестно чего: из скольки и в
              каких единицах. Проценты — та же шкала, что у всех остальных
              баллов на странице, и к этому месту она читателю уже знакома. */}
          <span className={styles.threadScore} style={{ color: strongestBand.ink }}>
            {formatScore(strongest.score)}
            <span className={styles.threadScoreUnit}>%</span>
          </span>
          <div className={styles.threadMeta}>
            <div className={styles.threadTitle}>
              {strongest.label}
              <span className={styles.threadSystem}> · {FACTOR_SYSTEM_NAMES[strongest.system]}</span>
            </div>
            <p className={styles.threadNote}>{strongest.note}</p>
          </div>
        </div>
      </div>
      </Reveal>

      {/* Сильные стороны / зоны роста */}
      <Reveal delay={120}>
      <div className={styles.hlGrid}>
        <div className={styles.hlLight}>
          <span className={styles.hlLabel}>Что течёт само</span>
          {strengths.length > 0 ? (
            <ul className={styles.hlList}>
              {strengths.map((f) => (
                <li key={`${f.system}-${f.label}`} className={styles.hlItem}>
                  <strong>{f.label}</strong>
                  <span className={styles.hlItemSystem}>{FACTOR_SYSTEM_NAMES[f.system]}</span>
                  <span className={styles.hlItemNote}>{f.note}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className={styles.hlEmpty}>
              Ровных сильных зон немного — ваша пара строится на осознанной работе, а не на
              лёгких совпадениях. Это не хуже: такие союзы часто оказываются прочнее.
            </p>
          )}
        </div>
        <div className={styles.hlShadow}>
          <span className={styles.hlLabel}>Зоны роста</span>
          {growth.length > 0 ? (
            <ul className={styles.hlList}>
              {growth.map((f) => (
                <li key={`${f.system}-${f.label}`} className={styles.hlItem}>
                  <strong>{f.label}</strong>
                  <span className={styles.hlItemSystem}>{FACTOR_SYSTEM_NAMES[f.system]}</span>
                  <span className={styles.hlItemNote}>{f.note}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className={styles.hlEmpty}>
              Явных провалов не видно ни в одной системе — редкий случай. Зона роста такой
              пары обычно одна: не принимать лёгкость как данность.
            </p>
          )}
        </div>
      </div>
      </Reveal>

      {/* Роли в паре */}
      {roles.length > 0 && (
        <Reveal delay={200}>
        <div className={styles.rolesBlock}>
          <div className={styles.threadLabel}>Роли в вашей паре</div>
          <p className={styles.rolesNote}>
            Роль отдаётся не по полу, а по сильным сторонам — тому, у кого больше сигналов
            в нескольких системах сразу.
          </p>
          <div className={styles.rolesGrid}>
            {roles.map((r) => (
              <div
                key={`${r.key}-${r.holder}`}
                className={r.holder === "gap" ? `${styles.roleCard} ${styles.roleCardGap}` : styles.roleCard}
              >
                <span className={styles.roleWho}>
                  {r.holder === "a" ? nameA : r.holder === "b" ? nameB : r.holder === "both" ? "Вы оба" : "Провисает у обоих"}
                </span>
                <strong className={styles.roleTitle}>{r.title}</strong>
                <span className={styles.roleAbout}>
                  {r.holder === "gap"
                    ? `${r.about} — эту сферу вашей паре стоит сознательно делить или делегировать`
                    : r.about}
                </span>
              </div>
            ))}
          </div>
        </div>
        </Reveal>
      )}
    </>
  );
}
