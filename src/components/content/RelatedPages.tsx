import Link from "next/link";
import styles from "./content.module.css";

/**
 * Блок «куда идти дальше» для статейных страниц.
 *
 * Зачем. Аудит собранной статики показал, что типовая статья сайта — тупик:
 * на неё ссылаются 1–4 страницы, а исходящих содержательных ссылок у неё
 * ноль или одна («предыдущая/следующая»). Этот компонент — общий способ
 * связать страницу с её смысловыми соседями: и читателю есть куда пойти,
 * и кластер перестаёт быть россыпью изолированных документов.
 *
 * Обобщение частного блока «Профили с той же первой линией», который жил
 * прямо внутри роута профилей.
 *
 * Правила, зашитые сюда намеренно:
 * — анкор (`label`) обязан содержать ключевые слова целевой страницы, а не
 *   быть «подробнее»: анкор это сигнал релевантности, и разнообразие анкоров
 *   даёт больше, чем само количество ссылок;
 * — не больше `max` ссылок в блоке (по умолчанию 12). Ссылки полезны до
 *   определённого предела, после которого эффект разворачивается, поэтому
 *   лучше меньше и точнее, чем вывалить все соседние страницы разом.
 */

export interface RelatedLink {
  href: string;
  /** Анкор с ключевым словом: «Лев и Дева: совместимость», не «подробнее». */
  label: string;
  /** Необязательное пояснение под анкором — зачем туда идти. */
  note?: string;
}

export function RelatedPages({
  title,
  lede,
  links,
  max = 12,
  headingId,
}: {
  title: string;
  lede?: string;
  links: RelatedLink[];
  max?: number;
  headingId?: string;
}) {
  // Дубли по адресу возможны, когда правила связей пересекаются (например,
  // знак одновременно «той же стихии» и «из той же пары») — режем здесь,
  // чтобы каждое правило можно было писать независимо от остальных.
  const seen = new Set<string>();
  const unique = links.filter((l) => {
    if (seen.has(l.href)) return false;
    seen.add(l.href);
    return true;
  });

  if (unique.length === 0) return null;
  const shown = unique.slice(0, max);
  const id = headingId ?? "related";

  return (
    <section className={styles.card} aria-labelledby={id}>
      <h2 id={id} className={styles.h2}>
        {title}
      </h2>
      {lede && <p className={styles.text}>{lede}</p>}
      <div className={styles.grid}>
        {shown.map((l) => (
          <Link key={l.href} href={l.href} className={styles.gridLink}>
            <span className={styles.gridLinkTitle}>{l.label}</span>
            {l.note && <span className={styles.gridLinkText}>{l.note}</span>}
          </Link>
        ))}
      </div>
    </section>
  );
}
