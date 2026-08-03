import type { ThemeResult } from "@/lib/engines/synthesis";
import { formatScore } from "@/components/viz/scale";
import styles from "./systems.module.css";

const SYSTEM_LABEL: Record<string, string> = {
  matrix: "Матрица",
  numerology: "Нумерология",
  human_design: "Дизайн человека",
  jyotish: "Джйотиш",
};

const VERDICT_META: Record<
  ThemeResult["verdict"],
  { label: string; note: string; color: string; wash: string }
> = {
  "agreement-high": {
    label: "сильный сигнал",
    note: "Все системы независимо друг от друга указывают в одну сторону — это весомее, чем вывод любой одной из них.",
    color: "#8a6c3e",
    wash: "#f6efe2",
  },
  "agreement-low": {
    label: "общая зона роста",
    note: "Системы согласны: это место в паре стоит держать в поле внимания — не проблема, а тема для разговора.",
    color: "#7a5f90",
    wash: "#f2ecf8",
  },
  contradiction: {
    label: "системы расходятся",
    note: "Разные системы смотрят на разные слои этой темы — не усредняйте их вывод, а прочитайте оба.",
    color: "#a2698a",
    wash: "#fbeef1",
  },
  mixed: {
    label: "нет выраженного сигнала",
    note: "По этой теме нет ни явного согласия, ни явного противоречия между системами.",
    color: "#8a7a8d",
    wash: "#f4eef1",
  },
};

export function SynthesisPanel({ themes }: { themes: ThemeResult[] }) {
  const strong = themes.filter((t) => t.verdict === "agreement-high" || t.verdict === "contradiction");
  const rest = themes.filter((t) => t.verdict !== "agreement-high" && t.verdict !== "contradiction");
  const ordered = [...strong, ...rest];

  return (
    <section className={styles.section} aria-labelledby="synthesis-title">
      <div className={styles.sectionHead}>
        <div className={styles.eyebrow}>Синтез</div>
        <h2 id="synthesis-title" className={styles.sectionTitle}>
          Где сходятся все четыре системы
        </h2>
        <p className={styles.sectionLede}>
          Матрица судьбы, Нумерология, Дизайн человека и Джйотиш считают совместимость
          независимо друг от друга — разными методами, из разных традиций. Когда все
          четыре сходятся в одном месте, это куда весомее, чем вывод любой системы
          по отдельности. А там, где расходятся, — это не ошибка, а разные слои одной
          и той же темы.
        </p>
      </div>

      <div className={styles.bars}>
        {ordered.map((theme) => {
          const meta = VERDICT_META[theme.verdict];
          return (
            <div key={theme.key} className={styles.doshaRow}>
              <div className={styles.doshaHead}>
                <strong className={styles.doshaTitle}>{theme.title}</strong>
                <span className={styles.chip} style={{ color: meta.color, background: meta.wash }}>
                  {meta.label}
                </span>
              </div>
              <div className={styles.synthesisBars}>
                {(Object.keys(theme.signals) as (keyof typeof theme.signals)[]).map((sys) => {
                  const value = theme.signals[sys];
                  if (value === undefined) return null;
                  return (
                    <div key={sys} className={styles.synthesisBarItem}>
                      <span className={styles.synthesisBarLabel}>{SYSTEM_LABEL[sys]}</span>
                      <div className={styles.synthesisBarTrack}>
                        <div
                          className={styles.synthesisBarFill}
                          style={{ width: `${value}%`, background: meta.color }}
                        />
                      </div>
                      <span className={styles.synthesisBarValue}>{formatScore(value)}%</span>
                    </div>
                  );
                })}
              </div>
              <p className={styles.doshaText}>{meta.note}</p>
            </div>
          );
        })}
      </div>

      <p className={styles.note}>
        Сигналы по темам — не отдельный пятый расчёт, а срез уже посчитанных под-баллов
        каждой системы (зоны Матрицы, линии психоматрицы, каналы и авторитет Дизайна
        человека, куты Джйотиш), сгруппированный по шести общечеловеческим темам пары.
      </p>
    </section>
  );
}
