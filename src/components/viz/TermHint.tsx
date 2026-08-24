"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { glossaryEntry } from "@/lib/content/glossary";
import styles from "./viz.module.css";

/**
 * Вопросик рядом с термином: нажал — всплыло короткое объяснение.
 *
 * Почему по нажатию, а не по наведению. Основная часть аудитории читает это с
 * телефона, где наведения не существует: подсказка на :hover там просто мёртвая.
 * Нажатие работает везде и одинаково, поэтому оно единственное поведение — без
 * «на десктопе так, на мобильном эдак».
 *
 * Позиционируем через position: fixed от координат самой кнопки. Абсолютное
 * позиционирование внутри карточки обрезалось бы её краем, а подсказка часто
 * стоит у самой границы блока.
 */
export function TermHint({ id, label }: { id: string; label?: string }) {
  const entry = glossaryEntry(id);
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const popRef = useRef<HTMLDivElement>(null);
  const popId = useId();

  useEffect(() => {
    if (!open) return;

    // Координаты считаем императивно, а не через состояние: лишний рендер тут
    // ничего не даёт, а правило «не вызывай setState в эффекте» не нарушается.
    const place = () => {
      const btn = btnRef.current;
      const pop = popRef.current;
      if (!btn || !pop) return;
      const b = btn.getBoundingClientRect();
      const p = pop.getBoundingClientRect();
      const gap = 8;
      const edge = 12;

      let left = b.left + b.width / 2 - p.width / 2;
      left = Math.max(edge, Math.min(left, window.innerWidth - p.width - edge));

      // Снизу, если помещается; иначе сверху; если некуда — прижимаем к низу.
      let top = b.bottom + gap;
      if (top + p.height > window.innerHeight - edge) {
        const above = b.top - p.height - gap;
        top = above >= edge ? above : Math.max(edge, window.innerHeight - p.height - edge);
      }
      // Страховка на случай, когда кнопка оказалась вне видимой области (её
      // могли увести прокруткой уже после открытия): подсказка всё равно
      // обязана остаться на экране, а не уехать за него вслед за кнопкой.
      top = Math.max(edge, Math.min(top, window.innerHeight - p.height - edge));

      pop.style.left = `${Math.round(left)}px`;
      pop.style.top = `${Math.round(top)}px`;
      pop.style.visibility = "visible";
    };

    place();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onPointer = (e: PointerEvent) => {
      const t = e.target as Node;
      if (popRef.current?.contains(t) || btnRef.current?.contains(t)) return;
      setOpen(false);
    };

    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    window.addEventListener("scroll", place, true);
    window.addEventListener("resize", place);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
      window.removeEventListener("scroll", place, true);
      window.removeEventListener("resize", place);
    };
  }, [open]);

  if (!entry) return null;

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        className={styles.termHintBtn}
        aria-expanded={open}
        aria-controls={open ? popId : undefined}
        aria-label={`Что такое «${label ?? entry.title}»`}
        onClick={() => setOpen((v) => !v)}
      >
        ?
      </button>

      {open && (
        <div
          ref={popRef}
          id={popId}
          role="note"
          className={styles.termHintPop}
          // До первого замера прячем: иначе кадр подсказка стоит в левом
          // верхнем углу и дёргается на место.
          style={{ visibility: "hidden" }}
        >
          <strong className={styles.termHintTitle}>{entry.title}</strong>
          <p className={styles.termHintText}>{entry.what}</p>
          <p className={styles.termHintText}>{entry.why}</p>
          {/* Подсказка объясняет термин в двух абзацах, но у части понятий есть
              полноценный разбор отдельной страницей — отсюда туда и уводим. */}
          {entry.href && (
            <Link href={entry.href} className={styles.termHintLink} onClick={() => setOpen(false)}>
              {entry.hrefLabel ?? "Читать подробнее"} →
            </Link>
          )}
          <button
            type="button"
            className={styles.termHintClose}
            onClick={() => setOpen(false)}
          >
            Понятно
          </button>
        </div>
      )}
    </>
  );
}
