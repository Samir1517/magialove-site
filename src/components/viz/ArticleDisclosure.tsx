import Link from "next/link";
import type { Article } from "@/lib/content/articles";
import { MarkdownBody, renderInline } from "./MarkdownBody";
import styles from "./article.module.css";

/**
 * <details>/<summary> нативные — раскрытие работает без JS, и поисковые/AI-краулеры
 * (которые в большинстве не исполняют JS — см. чек-лист SEO-скилла) видят полный
 * текст статьи прямо в HTML, даже свёрнутый визуально для человека.
 */
export function ArticleDisclosure({
  article,
  eyebrow,
  defaultOpen = false,
  moreHref,
  moreLabel,
}: {
  article: Article;
  /** Короткая подпись над капсулой, напр. «Аркан 5 · Иерофант». */
  eyebrow?: string;
  defaultOpen?: boolean;
  /** Ссылка на отдельную SEO-страницу этой же сущности (аркан/канал/накшатра и т.д.) —
   * гонит реальный клик реального посетителя на страницу, которую мы продвигаем, а не
   * только дублирует текст здесь. Анкор передавайте с ключевыми словами (moreLabel), не
   * общим «подробнее» — это тоже сигнал релевантности. */
  moreHref?: string;
  moreLabel?: string;
}) {
  return (
    <div className={styles.wrap}>
      {eyebrow && <div className={styles.eyebrow}>{eyebrow}</div>}
      <p className={styles.capsule}>{renderInline(article.capsule, "capsule")}</p>
      <details className={styles.details} open={defaultOpen}>
        <summary className={styles.summary}>Читать разбор полностью</summary>
        <div className={styles.full}>
          {article.sections.map((s) => (
            <div key={s.heading} className={styles.section}>
              <h4 className={styles.sectionHeading}>{s.heading}</h4>
              <MarkdownBody body={s.body} headingLevel="h5" />
            </div>
          ))}
          {article.disclaimer && <p className={styles.disclaimer}>{article.disclaimer}</p>}
          {moreHref && (
            <Link href={moreHref} className={styles.moreLink}>
              {moreLabel ?? "Читать полностью →"}
            </Link>
          )}
        </div>
      </details>
    </div>
  );
}
