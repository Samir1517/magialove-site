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
}: {
  article: Article;
  /** Короткая подпись над капсулой, напр. «Аркан 5 · Иерофант». */
  eyebrow?: string;
  defaultOpen?: boolean;
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
              <MarkdownBody body={s.body} />
            </div>
          ))}
          {article.disclaimer && <p className={styles.disclaimer}>{article.disclaimer}</p>}
        </div>
      </details>
    </div>
  );
}
