"use client";

import { useEffect, useState, type RefObject } from "react";

/**
 * true — когда элемент впервые попал в вьюпорт (одноразово, наблюдатель
 * отключается). При prefers-reduced-motion сразу true — анимации появления
 * и дорисовки в этом случае не запускаются вовсе.
 */
export function useInView(ref: RefObject<Element | null>, threshold = 0.18): boolean {
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setInView(true);
      return;
    }
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold, rootMargin: "0px 0px -40px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, threshold]);

  return inView;
}
