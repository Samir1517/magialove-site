import Link from "next/link";
import styles from "./result.module.css";

/**
 * «Эта же пара по другим системам» — выход со страницы результата.
 *
 * Раньше каждая страница результата заканчивалась одной ссылкой: назад в свой
 * же хаб. Человек дочитывал длинный разбор, был на пике интереса — и получал
 * тупик. При этом именно в этот момент возникает «а что говорит вторая
 * система про нас же», и данные для неё уже введены.
 *
 * Поэтому переносим ту же строку запроса: переход стоит один клик, форму
 * заполнять заново не надо. Ссылка на общий разбор идёт первой, если человек
 * пришёл сюда из отдельного калькулятора и общего ещё не видел.
 */
const SYSTEMS = [
  {
    key: "matrix",
    href: "/matrica-sudby-sovmestimost/rezultat",
    title: "Матрица судьбы",
    text: "Арканы союза: что в вашей паре работает само, а что придётся включать осознанно.",
  },
  {
    key: "numerology",
    href: "/numerologiya-sovmestimost/rezultat",
    title: "Нумерология",
    text: "Числа жизненного пути и квадрат Пифагора: из чего каждый из вас собран.",
  },
  {
    key: "human_design",
    href: "/dizajn-cheloveka-sovmestimost/rezultat",
    title: "Дизайн человека",
    text: "Три бодиграфа и каналы, которые замыкаются только вдвоём.",
  },
  {
    key: "jyotish",
    href: "/dzhyotish-sovmestimost/rezultat",
    title: "Джйотиш",
    text: "Карты рождения рядом, 36 баллов Гуна-милана и разбор дош.",
  },
] as const;

export type SystemKey = (typeof SYSTEMS)[number]["key"];

export function NextSystems({
  current,
  qs,
  hasTimes = true,
}: {
  /** Система этой страницы — её из списка убираем. */
  current: SystemKey;
  /** Строка запроса с датами: переносим её, чтобы не вводить данные заново. */
  qs: string;
  /** Без времени рождения Дизайн человека и Джйотиш не считаются. */
  hasTimes?: boolean;
}) {
  const rest = SYSTEMS.filter(
    (s) => s.key !== current && (hasTimes || (s.key !== "human_design" && s.key !== "jyotish")),
  );

  return (
    <div className={styles.nextSteps}>
      <h2 className={styles.nextStepsTitle}>Эта же пара по другим системам</h2>
      <p className={styles.nextStepsLede}>
        Данные уже введены — расчёт откроется сразу. Совпадения между системами весомее
        любого отдельного вывода: если о вас одно и то же говорят две независимые традиции,
        это и есть самое надёжное в разборе.
      </p>
      <div className={styles.nextStepsList}>
        <Link href={`/rezultat?${qs}`} className={styles.nextStep}>
          <span className={styles.nextStepTitle}>Свести всё вместе →</span>
          <span className={styles.nextStepText}>
            Общий разбор: где системы сходятся, а где спорят друг с другом.
          </span>
        </Link>
        {rest.map((s) => (
          <Link key={s.key} href={`${s.href}?${qs}`} className={styles.nextStep}>
            <span className={styles.nextStepTitle}>{s.title} →</span>
            <span className={styles.nextStepText}>{s.text}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
