"use client";

import { useEffect, useRef, useState } from "react";
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
  /** Каунт-ап числа и заполнение кольца при попадании в вьюпорт. */
  animate?: boolean;
}

/**
 * Прогресс анимации 0..1: запускается один раз, когда элемент виден на 40%.
 * Уважает prefers-reduced-motion (тогда сразу 1).
 */
function useRevealProgress(enabled: boolean, ref: React.RefObject<HTMLDivElement | null>): number {
  const [progress, setProgress] = useState(enabled ? 0 : 1);

  useEffect(() => {
    if (!enabled) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setProgress(1);
      return;
    }
    const el = ref.current;
    if (!el) return;

    let raf = 0;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        io.disconnect();
        const start = performance.now();
        const duration = 1500;
        const tick = (t: number) => {
          const p = Math.min(1, (t - start) / duration);
          setProgress(1 - Math.pow(1 - p, 3)); // ease-out cubic
          if (p < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [enabled, ref]);

  return progress;
}

/** Кольцевой индикатор общего балла системы. */
export function ScoreRing({
  percent,
  label,
  caption,
  size = 116,
  stroke = 9,
  gradientId,
  animate = true,
}: ScoreRingProps) {
  const clamped = Math.max(0, Math.min(100, percent));
  const wrapRef = useRef<HTMLDivElement>(null);
  const progress = useRevealProgress(animate, wrapRef);
  const shown = clamped * progress;

  // Цвет полосы — по итоговому значению, не по промежуточному: кольцо не должно
  // «мигать» лилово-розово-золотым по пути к финальному цвету.
  const band = bandStyle(clamped);
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const filled = (shown / 100) * circumference;

  return (
    <div className={styles.ring} ref={wrapRef}>
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
          <span className={styles.ringValue} style={size >= 150 ? { fontSize: 46 } : undefined}>
            {formatScore(shown)}
          </span>
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
