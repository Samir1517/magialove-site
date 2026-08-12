"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import styles from "./HeroForm.module.css";

/**
 * Форма собрана по людям, а не по типам полей: строка «ты», строка «он».
 * Так она совпадает с тем, что человек держит в голове, и с языком разбора,
 * который дальше говорит про двоих.
 *
 * Имена необязательны, но показаны сразу, а не спрятаны за раскрытием: без
 * них вся страница результата обращается к паре как к «первому партнёру» и
 * «второму партнёру» — десятки раз подряд, и разбор перестаёт читаться как
 * разбор про вас.
 */
export function HeroForm({ targetPath = "/rezultat" }: { targetPath?: string }) {
  const router = useRouter();
  const [nameA, setNameA] = useState("");
  const [nameB, setNameB] = useState("");
  const [dateA, setDateA] = useState("");
  const [dateB, setDateB] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!dateA || !dateB) {
      setError("Укажи обе даты рождения — имена можно не заполнять");
      return;
    }
    setError(null);
    const params = new URLSearchParams({ a: dateA, b: dateB });
    if (nameA.trim()) params.set("na", nameA.trim());
    if (nameB.trim()) params.set("nb", nameB.trim());
    router.push(`${targetPath}?${params.toString()}`);
  }

  const people = [
    {
      key: "a",
      nameLabel: "Твоё имя",
      namePlaceholder: "по желанию",
      dateLabel: "Твоя дата рождения",
      name: nameA,
      setName: setNameA,
      date: dateA,
      setDate: setDateA,
    },
    {
      key: "b",
      nameLabel: "Имя партнёра",
      namePlaceholder: "по желанию",
      dateLabel: "Дата рождения партнёра",
      name: nameB,
      setName: setNameB,
      date: dateB,
      setDate: setDateB,
    },
  ];

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      {people.map((p) => (
        <div key={p.key} className={styles.personRow}>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>{p.nameLabel}</span>
            <input
              type="text"
              className={styles.input}
              value={p.name}
              onChange={(e) => p.setName(e.target.value)}
              placeholder={p.namePlaceholder}
              autoComplete="off"
            />
          </label>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>{p.dateLabel}</span>
            <input
              type="date"
              className={styles.input}
              value={p.date}
              onChange={(e) => p.setDate(e.target.value)}
              required
            />
          </label>
        </div>
      ))}

      <button type="submit" className={`btn ${styles.submit}`}>
        Рассчитать
      </button>

      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
