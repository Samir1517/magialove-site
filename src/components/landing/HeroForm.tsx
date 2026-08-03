"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import styles from "./HeroForm.module.css";

export function HeroForm({ targetPath = "/rezultat" }: { targetPath?: string }) {
  const router = useRouter();
  const [dateA, setDateA] = useState("");
  const [dateB, setDateB] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!dateA || !dateB) {
      setError("Укажите обе даты рождения");
      return;
    }
    setError(null);
    const params = new URLSearchParams({ a: dateA, b: dateB });
    router.push(`${targetPath}?${params.toString()}`);
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <label className={styles.field}>
        <span className={styles.fieldLabel}>Ваша дата рождения</span>
        <input
          type="date"
          className={styles.input}
          value={dateA}
          onChange={(e) => setDateA(e.target.value)}
          required
        />
      </label>
      <label className={styles.field}>
        <span className={styles.fieldLabel}>Дата рождения партнёра</span>
        <input
          type="date"
          className={styles.input}
          value={dateB}
          onChange={(e) => setDateB(e.target.value)}
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
