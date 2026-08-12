"use client";

import { useId, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { DEFAULT_TZ } from "@/lib/data/timezones";
import { CityTimezoneInput } from "@/components/system-calc/CityTimezoneInput";
import content from "@/components/content/content.module.css";
import styles from "./hub.module.css";

const LOCK_HINT = "Для перехода нужно внести время рождения";

/**
 * Форма хаба «по дате рождения» вместе с навигацией по 4 системам.
 *
 * Почему форма и карточки в одном клиентском компоненте: карточки Дизайна
 * человека и Джйотиша должны видеть состояние чекбокса «не знаю время», а
 * состояние в App Router поднимается только вверх — значит их общий родитель
 * обязан быть клиентским. H1, лид и остальной SEO-текст остались серверными
 * в page.tsx, поэтому метаданные страницы не теряются.
 */
export function HubCalculator() {
  const router = useRouter();
  const uid = useId();

  const [nameA, setNameA] = useState("");
  const [nameB, setNameB] = useState("");
  const [dateA, setDateA] = useState("");
  const [dateB, setDateB] = useState("");
  const [noTime, setNoTime] = useState(false);
  const [timeA, setTimeA] = useState("");
  const [timeB, setTimeB] = useState("");
  const [tzA, setTzA] = useState(DEFAULT_TZ);
  const [tzB, setTzB] = useState(DEFAULT_TZ);
  const [error, setError] = useState<string | null>(null);

  /**
   * Блокируем разделы, которым нужен момент рождения, только на явное
   * «времени не знаю». Если галочка снята, а поля просто ещё пустые —
   * человек не отказался, он ещё не дошёл: переход на хаб безобиден,
   * там своя форма.
   */
  const locked = noTime;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!dateA || !dateB) {
      setError("Укажи обе даты рождения");
      return;
    }
    // Время либо у обоих, либо ни у кого: по одному времени пару не посчитать.
    if (!noTime && Boolean(timeA) !== Boolean(timeB)) {
      setError("Укажи время рождения обоих — или отметь «Не знаю время рождения»");
      return;
    }
    setError(null);

    const params = new URLSearchParams({ a: dateA, b: dateB });
    if (nameA.trim()) params.set("na", nameA.trim());
    if (nameB.trim()) params.set("nb", nameB.trim());
    if (!noTime && timeA && timeB) {
      params.set("at", timeA);
      params.set("bt", timeB);
      params.set("atz", tzA);
      params.set("btz", tzB);
    }
    router.push(`/rezultat?${params.toString()}`);
  }

  return (
    <>
      <div className={content.card}>
        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <div className={styles.row}>
            <label className={styles.field}>
              <span className={styles.fieldLabel}>Твоё имя</span>
              <input
                type="text"
                className={styles.input}
                value={nameA}
                onChange={(e) => setNameA(e.target.value)}
                placeholder="по желанию"
                autoComplete="off"
              />
            </label>
            <label className={styles.field}>
              <span className={styles.fieldLabel}>Твоя дата рождения</span>
              <input
                type="date"
                className={styles.input}
                value={dateA}
                onChange={(e) => setDateA(e.target.value)}
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
                placeholder="по желанию"
                autoComplete="off"
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
          </div>

          <label className={styles.checkRow}>
            <input
              type="checkbox"
              className={styles.checkbox}
              checked={noTime}
              onChange={(e) => setNoTime(e.target.checked)}
            />
            <span className={styles.checkLabel}>
              Не знаю время рождения — посчитать только по датам
            </span>
          </label>

          {/* Блок прячем целиком, когда стоит галочка: заполненное поле
              не должно «висеть» и путать, что оно всё-таки учитывается. */}
          {!noTime && (
            <div className={styles.timeBlock}>
              <p className={styles.why}>
                Время и город нужны Дизайну человека и Джйотишу — им важен не день, а момент:
                Луна за сутки уходит примерно на 13°, и её знак может оказаться соседним.
              </p>

              <div className={styles.row}>
                <div className={styles.col}>
                  <span className={styles.colTitle}>Ты</span>
                  <label className={styles.field}>
                    <span className={styles.fieldLabel}>Время рождения</span>
                    <input
                      type="time"
                      className={styles.input}
                      value={timeA}
                      onChange={(e) => setTimeA(e.target.value)}
                    />
                  </label>
                  <CityTimezoneInput value={tzA} onChange={setTzA} label="Город рождения" />
                </div>
                <div className={styles.col}>
                  <span className={styles.colTitle}>Партнёр</span>
                  <label className={styles.field}>
                    <span className={styles.fieldLabel}>Время рождения</span>
                    <input
                      type="time"
                      className={styles.input}
                      value={timeB}
                      onChange={(e) => setTimeB(e.target.value)}
                    />
                  </label>
                  <CityTimezoneInput value={tzB} onChange={setTzB} label="Город рождения" />
                </div>
              </div>

              <p className={styles.privacy}>
                <span aria-hidden="true">🔒</span>
                <span>
                  Всё считается прямо в твоём браузере: даты, время и город никуда не
                  отправляются и нигде не сохраняются.
                </span>
              </p>
            </div>
          )}

          <button type="submit" className={`btn ${styles.submit}`}>
            Рассчитать
          </button>
          {error && (
            <p className={styles.error} role="alert">
              {error}
            </p>
          )}
        </form>
      </div>

      <h2 className={styles.gridTitle}>Разобрать отдельно по одной системе</h2>

      <div className={content.grid}>
        <Card
          href="/matrica-sudby-sovmestimost/"
          title="Матрица судьбы →"
          text="22 аркана, 5 зон союза, свет и тень каждого качества"
        />
        <Card
          href="/numerologiya-sovmestimost/"
          title="Нумерология →"
          text="Число жизненного пути и Квадрат Пифагора твоей пары"
        />
        <Card
          href="/dizajn-cheloveka-sovmestimost/"
          title="Дизайн человека →"
          text="Композит пары, Connection Theme, электромагнитные каналы"
          locked={locked}
          hintId={`${uid}-hd`}
        />
        <Card
          href="/dzhyotish-sovmestimost/"
          title="Джйотиш →"
          text="Аштакута Гуна-милан: 8 кут, 3 доши, 27 накшатр"
          locked={locked}
          hintId={`${uid}-jy`}
        />
      </div>
    </>
  );
}

/**
 * Карточка-ссылка. В заблокированном состоянии в DOM остаётся НАСТОЯЩИЙ
 * <a href> — перелинковка и вес ссылки не теряются, краулер видит обычную
 * ссылку. Переход отменяется только в onClick.
 *
 * Пояснение — видимой подписью, а не через title или CSS-тултип: на тач-
 * устройствах ни то, ни другое не показывается, а скринридер их не читает.
 */
function Card({
  href,
  title,
  text,
  locked = false,
  hintId,
}: {
  href: string;
  title: string;
  text: string;
  locked?: boolean;
  hintId?: string;
}) {
  return (
    <Link
      href={href}
      className={locked ? `${content.gridLink} ${content.gridLinkLocked}` : content.gridLink}
      aria-disabled={locked || undefined}
      aria-describedby={locked ? hintId : undefined}
      onClick={locked ? (e) => e.preventDefault() : undefined}
    >
      <span className={content.gridLinkTitle}>{title}</span>
      <span className={content.gridLinkText}>{text}</span>
      {locked && (
        <span id={hintId} className={content.gridLinkLockNote}>
          {LOCK_HINT}
        </span>
      )}
    </Link>
  );
}
