import type { Metadata } from "next";
import Link from "next/link";
import { ContentShell } from "@/components/content/ContentShell";
import { allMatrixArticles } from "@/lib/content/articles";
import styles from "@/components/content/content.module.css";

export const metadata: Metadata = {
  title: "Карта Матрицы судьбы: все страницы совместимости по системе",
  description:
    "Полный список страниц раздела «Матрица судьбы» — калькулятор совместимости и разбор всех 22 арканов пары в одном месте.",
};

export default function MatrixKartaPage() {
  const articles = allMatrixArticles();

  return (
    <ContentShell
      breadcrumbs={[
        { label: "Главная", href: "/" },
        { label: "По дате рождения", href: "/po-date-rozhdeniya/" },
        { label: "Матрица судьбы", href: "/po-date-rozhdeniya/matrica-sudby-sovmestimost/" },
        { label: "Карта раздела" },
      ]}
    >
      <div className={styles.eyebrow}>Матрица судьбы</div>
      <h1 className={styles.h1}>Карта раздела «Матрица судьбы»</h1>
      <p className={styles.lede}>
        Все страницы совместимости по Матрице судьбы в одном месте: сам калькулятор и разбор
        каждого из 22 арканов пары — что каждый значит в союзе, свет и тень качества.
      </p>

      <h2 style={{ font: "600 15px var(--font-body)", color: "var(--ink)", margin: 0 }}>
        Основные страницы
      </h2>
      <div className={styles.grid}>
        <Link href="/po-date-rozhdeniya/matrica-sudby-sovmestimost/" className={styles.gridLink}>
          <span className={styles.gridLinkTitle}>Совместимость по Матрице судьбы →</span>
          <span className={styles.gridLinkText}>Калькулятор: расчёт и расшифровка по датам рождения</span>
        </Link>
      </div>

      <h2 style={{ font: "600 15px var(--font-body)", color: "var(--ink)", margin: 0 }}>
        Дополнительные страницы: 22 аркана
      </h2>
      <div className={styles.grid}>
        {Array.from({ length: 22 }, (_, i) => i + 1).map((n) => {
          const article = articles[String(n)];
          if (!article) return null;
          const name = article.title.match(/«([^»]+)»/)?.[1] ?? article.title;
          return (
            <Link key={n} href={`/po-date-rozhdeniya/matrica-sudby-sovmestimost/arkany/${n}/`} className={styles.gridLink}>
              <span className={styles.gridLinkNum}>{n}</span>
              <span className={styles.gridLinkTitle}>{name}</span>
              <span className={styles.gridLinkText}>{article.capsule.slice(0, 70)}…</span>
            </Link>
          );
        })}
      </div>
    </ContentShell>
  );
}
