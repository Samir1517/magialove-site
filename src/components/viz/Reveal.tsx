"use client";

import { useRef } from "react";
import { useInView } from "./useInView";
import styles from "./viz.module.css";

/**
 * Каскадное появление блока при скролле: мягкий подъём + проявление, один раз.
 * Анимируются только opacity/transform — сдвигов раскладки (CLS) не создаёт.
 * Страницы результатов рендерятся только на клиенте (данные из query-параметров),
 * поэтому стартовое opacity:0 не прячет контент от поисковых роботов.
 */
export function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  // threshold 0: блок может быть выше вьюпорта (длинные секции систем) — для
  // них порог «18% видно» недостижим, поэтому проявляем при первом касании.
  const inView = useInView(ref, 0);

  return (
    <div
      ref={ref}
      className={inView ? `${styles.reveal} ${styles.revealVisible}` : styles.reveal}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}
