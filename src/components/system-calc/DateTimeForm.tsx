"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { DEFAULT_TZ } from "@/lib/data/timezones";
import { CityTimezoneInput } from "./CityTimezoneInput";
import { putCoords, coordsOfShownCity, type Coords } from "@/lib/engines/geo";
import styles from "@/components/result/result.module.css";

/**
 * Полная форма даты+времени+пояса для систем, которым дата рождения не
 * помогает без момента (Дизайн человека, Джйотиш) — в отличие от Матрицы
 * судьбы и Нумерологии, здесь нет промежуточного шага «сначала только даты».
 */
export function DateTimeForm({ targetPath }: { targetPath: string }) {
  const router = useRouter();
  const [nameA, setNameA] = useState("");
  const [nameB, setNameB] = useState("");
  const [dateA, setDateA] = useState("");
  const [dateB, setDateB] = useState("");
  const [timeA, setTimeA] = useState("");
  const [timeB, setTimeB] = useState("");
  const [tzA, setTzA] = useState(DEFAULT_TZ);
  const [tzB, setTzB] = useState(DEFAULT_TZ);
  const [geoA, setGeoA] = useState<Coords | null>(() => coordsOfShownCity(DEFAULT_TZ));
  const [geoB, setGeoB] = useState<Coords | null>(() => coordsOfShownCity(DEFAULT_TZ));
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!dateA || !dateB || !timeA || !timeB) {
      setError("Укажи даты и время рождения обоих партнёров");
      return;
    }
    setError(null);
    const params = new URLSearchParams({
      a: dateA, b: dateB, at: timeA, bt: timeB, atz: tzA, btz: tzB,
    });
    putCoords(params, "a", geoA);
    putCoords(params, "b", geoB);
    if (nameA.trim()) params.set("na", nameA.trim());
    if (nameB.trim()) params.set("nb", nameB.trim());
    router.push(`${targetPath}?${params.toString()}`);
  }

  return (
    <form className={styles.unlockCard} onSubmit={handleSubmit} noValidate>
      {/* Точность времени тут решает больше, чем кажется: восходящий знак
          сдвигается на градус за четыре минуты, и час ошибки уводит его в
          соседний. Сказать об этом до полей честнее, чем показать результат,
          построенный на приблизительной цифре. */}
      <p className={styles.hint} style={{ margin: "0 0 14px" }}>
        Этот расчёт строится не на дате, а на моменте: восходящий знак меняется каждые
        четыре минуты. Если точного времени не помнишь, лучше уточнить его в свидетельстве
        о рождении — приблизительное даст красивый, но чужой результат.
      </p>
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
            <span className={styles.fieldLabel}>Дата рождения</span>
            <input
              className={styles.input}
              type="date"
              value={dateA}
              onChange={(e) => setDateA(e.target.value)}
              required
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
            <span className={styles.fieldLabel}>Дата рождения</span>
            <input
              className={styles.input}
              type="date"
              value={dateB}
              onChange={(e) => setDateB(e.target.value)}
              required
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
        Рассчитать
      </button>
      <p className={styles.unlockNote}>
        Время нужно для расчёта — мы ничего не сохраняем и не отправляем на сервер, все
        вычисления идут прямо в твоём браузере.
      </p>
    </form>
  );
}
