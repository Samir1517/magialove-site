import type { ThemeResult } from "@/lib/engines/synthesis";
import { SIGNAL_HIGH, SIGNAL_LOW } from "@/lib/engines/synthesis";
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
  { label: string; color: string; wash: string }
> = {
  "agreement-high": { label: "сходятся все", color: "#8a6c3e", wash: "#f6efe2" },
  "leaning-high": { label: "скорее сходятся", color: "#8a7c4e", wash: "#f6f2e4" },
  "agreement-low": { label: "общая зона роста", color: "#7a5f90", wash: "#f2ecf8" },
  contradiction: { label: "системы расходятся", color: "#a2698a", wash: "#fbeef1" },
  mixed: { label: "нет выраженного сигнала", color: "#8a7a8d", wash: "#f4eef1" },
};

/** «1 система», «2 системы», «5 систем». */
function plural(n: number, one: string, few: string, many: string): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return `${n} ${one}`;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return `${n} ${few}`;
  return `${n} ${many}`;
}

/**
 * Подпись строится по фактическому раскладу сигналов, а не по одному шаблону
 * на вердикт. Причина: значения систем нарисованы прямо над подписью, и любая
 * обобщающая фраза, которая им противоречит, читается как обман — а это самый
 * дорогой из возможных здесь проигрышей.
 */
function verdictNote(theme: ThemeResult): string {
  const values = Object.values(theme.signals).filter((v): v is number => v !== undefined);
  const total = values.length;
  const high = values.filter((v) => v >= SIGNAL_HIGH).length;
  const low = values.filter((v) => v <= SIGNAL_LOW).length;
  const neutral = total - high - low;

  // Перечисляем только непустые группы: «0 против» в подписи выглядит как шум.
  const parts: string[] = [];
  if (high) parts.push(`${plural(high, "система", "системы", "систем")} за`);
  if (neutral) parts.push(`${neutral} около середины`);
  if (low) parts.push(`${low} против`);
  const split = parts.join(", ");

  switch (theme.verdict) {
    case "agreement-high":
      return `Ни одна система не осталась в нейтральной зоне: все ${total} независимо друг от друга указывают в одну сторону. Это весомее, чем вывод любой из них по отдельности.`;
    case "leaning-high":
      return `Явный сигнал у ${high} из ${total} систем, остальные держатся середины. Против не высказалась ни одна — но это «скорее да», а не единогласие.`;
    case "agreement-low":
      return "Системы согласны между собой: это место в паре стоит держать в поле внимания — не проблема, а тема для разговора.";
    case "contradiction":
      return `Одновременно есть и явное «за», и явное «против» — ${split}. Не усредняйте: прочитайте оба вывода, это разные слои одной темы.`;
    default:
      return `Расклад по теме: ${split}. Перевеса нет ни в одну сторону — общего вывода отсюда не следует.`;
  }
}

export function SynthesisPanel({ themes }: { themes: ThemeResult[] }) {
  // Сверху то, что действительно что-то говорит: единогласие и расхождение.
  // Затем «скорее сходятся», и только потом темы без сигнала.
  const rank = (v: ThemeResult["verdict"]) =>
    v === "agreement-high" || v === "contradiction" ? 0 : v === "leaning-high" || v === "agreement-low" ? 1 : 2;
  const ordered = [...themes].sort((a, b) => rank(a.verdict) - rank(b.verdict));

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
              <p className={styles.doshaText}>{verdictNote(theme)}</p>
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
