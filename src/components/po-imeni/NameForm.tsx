"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import styles from "@/components/landing/HeroForm.module.css";

export function NameForm() {
  const router = useRouter();
  const [nameA, setNameA] = useState("");
  const [nameB, setNameB] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!nameA.trim() || !nameB.trim()) {
      setError("Введите оба имени кириллицей");
      return;
    }
    if (!/[а-яё]/i.test(nameA) || !/[а-яё]/i.test(nameB)) {
      setError("Имена нужно вводить кириллицей");
      return;
    }
    setError(null);
    const params = new URLSearchParams({ a: nameA.trim(), b: nameB.trim() });
    router.push(`/po-imeni/rezultat/?${params.toString()}`);
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <label className={styles.field}>
        <span className={styles.fieldLabel}>Ваше имя</span>
        <input
          type="text"
          className={styles.input}
          value={nameA}
          onChange={(e) => setNameA(e.target.value)}
          placeholder="Например, Анна"
          required
        />
      </label>
      <label className={styles.field}>
        <span className={styles.fieldLabel}>Имя партнёра</span>
        <input
          type="text"
          className={styles.input}
          value={nameB}
          onChange={(e) => setNameB(e.target.value)}
          placeholder="Например, Пётр"
          required
        />
      </label>
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
