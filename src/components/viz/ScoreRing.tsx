import { bandStyle, formatScore } from "./scale";
import styles from "./viz.module.css";

export interface ScoreRingProps {
  /** Значение в процентах 0..100. */
  percent: number;
  /** Подпись под числом (напр. название системы). */
  label?: string;
  /** Пояснение справа от кольца. */
  caption?: string;
  size?: number;
  stroke?: number;
  /** Уникальный id для градиента (в SVG градиенты адресуются глобально). */
  gradientId: string;
}

/** Кольцевой индикатор общего балла системы. */
export function ScoreRing({
  percent,
  label,
  caption,
  size = 116,
  stroke = 9,
  gradientId,
}: ScoreRingProps) {
  const clamped = Math.max(0, Math.min(100, percent));
  const band = bandStyle(clamped);
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const filled = (clamped / 100) * circumference;

  return (
    <div className={styles.ring}>
      <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
        <svg
          className={styles.ringSvg}
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          role="img"
          aria-label={`${label ?? "Совместимость"}: ${formatScore(clamped)}%`}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={band.from} />
              <stop offset="100%" stopColor={band.to} />
            </linearGradient>
          </defs>
          <circle
            className={styles.ringTrack}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={stroke}
          />
          <circle
            className={styles.ringProgress}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={stroke}
            stroke={`url(#${gradientId})`}
            strokeDasharray={`${filled} ${circumference - filled}`}
          />
        </svg>
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 2,
          }}
        >
          <span className={styles.ringValue}>{formatScore(clamped)}</span>
          <span className={styles.ringLabel} style={{ color: band.ink }}>
            {band.label}
          </span>
        </div>
      </div>
      {(caption || label) && (
        <div className={styles.ringCenter}>
          {label && <strong className={styles.barLabel}>{label}</strong>}
          {caption && <p className={styles.ringCaption}>{caption}</p>}
        </div>
      )}
    </div>
  );
}
