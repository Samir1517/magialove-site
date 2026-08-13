import { bandStyle, formatScore, toPercent } from "./scale";
import styles from "./viz.module.css";

export interface ScoreBarProps {
  label: string;
  /** Вопросик после подписи. Отдельно от label: тот уходит в aria-label,
      и компонент внутри строки его бы сломал. */
  labelHint?: React.ReactNode;
  score: number;
  /** Максимум шкалы. Для процентных величин — 100. */
  max: number;
  /** Пояснение под шкалой — что означает именно это значение. */
  caption?: string;
  /** Показывать «X из Y» вместо процентов (для кут Джйотиш: «7 из 8»). */
  showAsFraction?: boolean;
  /** Доли шкалы (0..1), на которых нарисовать вертикальные ориентиры. */
  ticks?: number[];
  /** Подпись полосы (созвучие / рабочая зона / зона роста). Показывается по умолчанию. */
  showBandLabel?: boolean;
}

/**
 * Горизонтальная шкала балла. Цвет — по полосе (см. scale.ts): не «плохо/хорошо»,
 * а характер связи. Используется в Джйотиш (куты), Нумерологии (линии) и синтезе.
 */
export function ScoreBar({
  label,
  labelHint,
  score,
  max,
  caption,
  showAsFraction = false,
  ticks,
  showBandLabel = true,
}: ScoreBarProps) {
  const percent = toPercent(score, max);
  const band = bandStyle(percent);

  return (
    <div className={styles.bar}>
      <div className={styles.barHead}>
        <span className={styles.barLabel}>
          {label}
          {labelHint}
        </span>
        <span className={styles.barValue} style={{ color: band.ink }}>
          {showAsFraction
            ? `${formatScore(score)} из ${formatScore(max)}`
            : `${formatScore(percent)}%`}
          {showBandLabel && ` · ${band.label}`}
        </span>
      </div>
      <div
        className={styles.barTrack}
        role="meter"
        aria-valuenow={Math.round(percent)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
      >
        <div
          className={styles.barFill}
          style={{
            width: `${percent}%`,
            background: `linear-gradient(90deg, ${band.from}, ${band.to})`,
          }}
        />
        {ticks?.map((t) => (
          <span key={t} className={styles.barTick} style={{ left: `${t * 100}%` }} aria-hidden="true" />
        ))}
      </div>
      {caption && <p className={styles.barCaption}>{caption}</p>}
    </div>
  );
}
