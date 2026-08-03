import Link from "next/link";
import styles from "./content.module.css";

export interface Crumb {
  label: string;
  href?: string;
}

/**
 * BreadcrumbList вшита в JSON-LD на странице отдельно (см. helpers.ts) — здесь
 * только видимая навигация; поисковики и AI-краулеры видят оба слоя.
 */
export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav className={styles.breadcrumbs} aria-label="Хлебные крошки">
      {items.map((c, i) => (
        <span key={i}>
          {i > 0 && <span aria-hidden="true"> / </span>}
          {c.href ? <Link href={c.href}>{c.label}</Link> : <span aria-current="page">{c.label}</span>}
        </span>
      ))}
    </nav>
  );
}
