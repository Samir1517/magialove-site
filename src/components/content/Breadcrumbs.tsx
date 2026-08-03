import Link from "next/link";
import { SITE_URL } from "@/lib/site-config";
import styles from "./content.module.css";

export interface Crumb {
  label: string;
  href?: string;
}

/** BreadcrumbList JSON-LD рядом с видимой навигацией — поисковики и AI-краулеры видят оба слоя. */
function breadcrumbSchema(items: Crumb[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.label,
      ...(c.href ? { item: `${SITE_URL}${c.href}` } : {}),
    })),
  };
}

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <>
      <nav className={styles.breadcrumbs} aria-label="Хлебные крошки">
        {items.map((c, i) => (
          <span key={i}>
            {i > 0 && <span aria-hidden="true"> / </span>}
            {c.href ? <Link href={c.href}>{c.label}</Link> : <span aria-current="page">{c.label}</span>}
          </span>
        ))}
      </nav>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema(items)) }}
      />
    </>
  );
}
