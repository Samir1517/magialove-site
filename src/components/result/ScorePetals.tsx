"use client";

import { useEffect, useState } from "react";
import styles from "./result.module.css";

/**
 * Одноразовая осыпь мягких лепестков при высоком общем балле (≥80) — момент
 * «дофаминового» раскрытия из виральных калькуляторов, но в палитре сайта и
 * строго один раз, без зацикливания. Значения детерминированы (без Math.random),
 * рендерится только после маунта и убирается из DOM по завершении.
 */

const PETALS: { left: number; delay: number; dur: number; scale: number; tint: number }[] = [
  { left: 6, delay: 0.0, dur: 2.6, scale: 1.0, tint: 0 },
  { left: 14, delay: 0.5, dur: 3.0, scale: 0.8, tint: 1 },
  { left: 23, delay: 0.2, dur: 2.4, scale: 1.1, tint: 2 },
  { left: 31, delay: 0.8, dur: 2.8, scale: 0.9, tint: 0 },
  { left: 40, delay: 0.1, dur: 3.2, scale: 1.0, tint: 1 },
  { left: 48, delay: 0.6, dur: 2.5, scale: 0.7, tint: 2 },
  { left: 56, delay: 0.3, dur: 2.9, scale: 1.2, tint: 0 },
  { left: 64, delay: 0.9, dur: 2.6, scale: 0.8, tint: 1 },
  { left: 72, delay: 0.4, dur: 3.1, scale: 1.0, tint: 2 },
  { left: 80, delay: 0.7, dur: 2.7, scale: 0.9, tint: 0 },
  { left: 88, delay: 0.15, dur: 2.5, scale: 1.1, tint: 1 },
  { left: 94, delay: 0.55, dur: 2.9, scale: 0.8, tint: 2 },
  { left: 36, delay: 1.1, dur: 2.6, scale: 0.7, tint: 1 },
  { left: 60, delay: 1.2, dur: 2.8, scale: 0.9, tint: 2 },
];

const TINTS = [
  "linear-gradient(135deg, #f2cdd9, #d48ca6)",
  "linear-gradient(135deg, #e7ddf3, #b39ccc)",
  "linear-gradient(135deg, #f2e7cf, #d6bd98)",
];

export function ScorePetals({ show }: { show: boolean }) {
  const [phase, setPhase] = useState<"idle" | "playing" | "done">("idle");

  useEffect(() => {
    if (!show) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setPhase("playing");
    const t = setTimeout(() => setPhase("done"), 4600);
    return () => clearTimeout(t);
  }, [show]);

  if (phase !== "playing") return null;

  return (
    <div className={styles.petals} aria-hidden="true">
      {PETALS.map((p, i) => (
        <span
          key={i}
          className={styles.petal}
          style={{
            left: `${p.left}%`,
            background: TINTS[p.tint],
            ["--pscale" as string]: p.scale,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.dur}s`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}
