import type { Article } from "@/lib/content/articles";
import { MarkdownBody, renderInline } from "@/components/viz/MarkdownBody";
import styles from "./content.module.css";

/** Полный текст статьи как основной контент SEO-страницы (не свёрнуто). */
export function ArticleFull({ article }: { article: Article }) {
  return (
    <article className={styles.card} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <p style={{ font: "italic 400 16px/1.65 var(--font-display)", color: "var(--ink)", margin: 0 }}>
        {renderInline(article.capsule, "capsule")}
      </p>
      {article.sections.map((s) => (
        <div key={s.heading}>
          <h2 style={{ font: "600 15px var(--font-body)", color: "var(--ink)", margin: "0 0 8px" }}>
            {s.heading}
          </h2>
          <MarkdownBody body={s.body} />
        </div>
      ))}
      {article.disclaimer && (
        <p style={{ font: "italic 400 12px/1.6 var(--font-body)", color: "var(--ink-faint)", margin: 0, paddingTop: 10, borderTop: "1px solid #f4eef1" }}>
          {article.disclaimer}
        </p>
      )}
      {article.meta.length > 0 && (
        <div className={styles.sourceNote}>
          <strong style={{ color: "var(--ink-soft)" }}>Источники: </strong>
          {article.meta
            .filter((m) => m.startsWith("**Источник") || m.startsWith("**Философская") || m.startsWith("**Первоисточник"))
            .map((m) => m.replace(/\*\*/g, ""))
            .join(" ")}
        </div>
      )}
    </article>
  );
}
