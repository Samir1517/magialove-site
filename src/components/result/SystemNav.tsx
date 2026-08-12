import styles from "./result.module.css";

/**
 * Оглавление по системам сразу под сводкой.
 *
 * Зачем: разбор по 4 системам — очень длинная страница. Без карты человек
 * не видит, что впереди, и либо листает вслепую, либо уходит. Список с
 * якорями показывает объём («тут ещё четыре больших раздела»), даёт
 * прыгнуть к тому, что интересно именно ей, и заодно поднимает глубину
 * просмотра — это прямой поведенческий сигнал для Яндекса.
 *
 * Системы без времени рождения не показываем: ссылка на несуществующую
 * секцию хуже, чем её отсутствие.
 */
export function SystemNav({ hasTimes }: { hasTimes: boolean }) {
  const items = [
    { href: "#matrix-title", label: "Матрица судьбы", note: "5 зон союза и 22 аркана" },
    { href: "#numerology-title", label: "Нумерология", note: "числа пути и Квадрат Пифагора" },
    ...(hasTimes
      ? [
          { href: "#hd-title", label: "Дизайн человека", note: "композит и каналы пары" },
          { href: "#jyotish-title", label: "Джйотиш", note: "Аштакута и накшатры" },
        ]
      : []),
  ];

  return (
    <nav className={styles.systemNav} aria-label="Разделы разбора">
      <span className={styles.systemNavTitle}>Дальше — подробный разбор</span>
      <div className={styles.systemNavList}>
        {items.map((i) => (
          <a key={i.href} href={i.href} className={styles.systemNavItem}>
            <span className={styles.systemNavLabel}>{i.label}</span>
            <span className={styles.systemNavNote}>{i.note}</span>
          </a>
        ))}
      </div>
    </nav>
  );
}
