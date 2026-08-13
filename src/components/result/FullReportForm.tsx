"use client";

import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { DEFAULT_TZ } from "@/lib/data/timezones";
import { CityTimezoneInput } from "@/components/system-calc/CityTimezoneInput";
import { putCoords, readCoords, coordsOfShownCity, type Coords } from "@/lib/engines/geo";
import styles from "./result.module.css";

/**
 * Прогрессивное раскрытие: базовый расчёт по двум датам уже показан выше,
 * а здесь добираем время и часовой пояс рождения — без них Дизайн человека
 * и Джйотиш посчитать нельзя (обоим нужно положение Луны и планет на момент,
 * а не на дату).
 */
export function FullReportForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [open, setOpen] = useState(false);

  const [nameA, setNameA] = useState(params.get("na") ?? "");
  const [nameB, setNameB] = useState(params.get("nb") ?? "");
  const [timeA, setTimeA] = useState(params.get("at") ?? "");
  const [timeB, setTimeB] = useState(params.get("bt") ?? "");
  const [tzA, setTzA] = useState(params.get("atz") ?? DEFAULT_TZ);
  const [tzB, setTzB] = useState(params.get("btz") ?? DEFAULT_TZ);
  const [geoA, setGeoA] = useState<Coords | null>(
    () => readCoords((k) => params.get(k), "a") ?? coordsOfShownCity(params.get("atz") ?? DEFAULT_TZ),
  );
  const [geoB, setGeoB] = useState<Coords | null>(
    () => readCoords((k) => params.get(k), "b") ?? coordsOfShownCity(params.get("btz") ?? DEFAULT_TZ),
  );
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!timeA || !timeB) {
      setError("Укажи время рождения обоих — без него эти две системы не считаются");
      return;
    }
    setError(null);
    const next = new URLSearchParams(params.toString());
    next.set("at", timeA);
    next.set("bt", timeB);
    next.set("atz", tzA);
    next.set("btz", tzB);
    putCoords(next, "a", geoA);
    putCoords(next, "b", geoB);
    if (nameA.trim()) next.set("na", nameA.trim());
    else next.delete("na");
    if (nameB.trim()) next.set("nb", nameB.trim());
    else next.delete("nb");
    router.push(`/rezultat?${next.toString()}`);
  }

  if (!open) {
    return (
      <div className={styles.unlockCard}>
        <h2 className={styles.unlockTitle}>Открыть полный разбор по 4 системам</h2>
        <p className={styles.unlockText}>
          Дизайн человека и Джйотиш работают не с датой, а с моментом рождения: Луна
          проходит знак примерно за два с половиной дня, а тип в Дизайне человека может
          смениться за несколько минут. Если знаешь время из свидетельства о рождении —
          добавь, и мы посчитаем оставшиеся две системы.
        </p>
        <button type="button" className={`btn ${styles.unlockButton}`} onClick={() => setOpen(true)}>
          Добавить время рождения
        </button>
      </div>
    );
  }

  return (
    <form className={styles.unlockCard} onSubmit={handleSubmit}>
      <h2 className={styles.unlockTitle}>Время и место рождения</h2>
      <div className={styles.formGrid}>
        <div className={styles.formCol}>
          <span className={styles.formColTitle}>Первый партнёр</span>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>Имя (необязательно)</span>
            <input
              className={styles.input}
              type="text"
              value={nameA}
              onChange={(e) => setNameA(e.target.value)}
              placeholder="Например, Анна"
            />
          </label>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>Время рождения</span>
            <input
              className={styles.input}
              type="time"
              value={timeA}
              onChange={(e) => setTimeA(e.target.value)}
              required
            />
          </label>
          <CityTimezoneInput
                    value={tzA}
                    onChange={(tz, c) => { setTzA(tz); setGeoA(c ?? null); }}
                    label="Город рождения"
                  />
        </div>

        <div className={styles.formCol}>
          <span className={styles.formColTitle}>Второй партнёр</span>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>Имя (необязательно)</span>
            <input
              className={styles.input}
              type="text"
              value={nameB}
              onChange={(e) => setNameB(e.target.value)}
              placeholder="Например, Пётр"
            />
          </label>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>Время рождения</span>
            <input
              className={styles.input}
              type="time"
              value={timeB}
              onChange={(e) => setTimeB(e.target.value)}
              required
            />
          </label>
          <CityTimezoneInput
                    value={tzB}
                    onChange={(tz, c) => { setTzB(tz); setGeoB(c ?? null); }}
                    label="Город рождения"
                  />
        </div>
      </div>

      {error && <p className={styles.error}>{error}</p>}

      <button type="submit" className={`btn ${styles.unlockButton}`}>
        Посчитать все 4 системы
      </button>
      <p className={styles.unlockNote}>
        Время нужно только для расчёта — мы ничего не сохраняем и не отправляем на сервер,
        все вычисления идут прямо в твоём браузере.
      </p>
    </form>
  );
}
