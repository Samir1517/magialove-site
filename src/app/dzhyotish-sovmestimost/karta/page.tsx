import type { Metadata } from "next";
import Link from "next/link";
import { ContentShell } from "@/components/content/ContentShell";
import { allJyotishNakshatraArticles } from "@/lib/content/articles";
import styles from "@/components/content/content.module.css";

export const metadata: Metadata = {
  title: "Карта Джйотиш: все страницы совместимости по системе",
  description:
    "Полный список страниц раздела «Джйотиш» — калькулятор Аштакута, 8 кут, 3 доши и разбор всех 27 накшатр пары.",
};

export default function JyotishKartaPage() {
  const articles = allJyotishNakshatraArticles();

  return (
    <ContentShell
      breadcrumbs={[
        { label: "Главная", href: "/" },
        { label: "Джйотиш", href: "/dzhyotish-sovmestimost/" },
        { label: "Карта раздела" },
      ]}
    >
      <div className={styles.eyebrow}>Джйотиш</div>
      <h1 className={styles.h1}>Карта раздела «Джйотиш»</h1>
      <p className={styles.lede}>
        Все страницы совместимости по Джйотиш: калькулятор Аштакута по точному времени рождения,
        8 кут и 3 доши гуна-милана, а также разбор каждой из 27 накшатр Луны.
      </p>

      <h2 style={{ font: "600 15px var(--font-body)", color: "var(--ink)", margin: 0 }}>
        Основные страницы
      </h2>
      <div className={styles.grid}>
        <Link href="/dzhyotish-sovmestimost/" className={styles.gridLink}>
          <span className={styles.gridLinkTitle}>Совместимость по Джйотиш →</span>
          <span className={styles.gridLinkText}>Калькулятор: Аштакута-гуна по точному времени рождения</span>
        </Link>
        <Link href="/dzhyotish-sovmestimost/8-kut/" className={styles.gridLink}>
          <span className={styles.gridLinkTitle}>8 кут Аштакуты →</span>
          <span className={styles.gridLinkText}>Варна, Васья, Тара, Йони, Граха-майтри, Гана, Бхакут, Нади</span>
        </Link>
        <Link href="/dzhyotish-sovmestimost/doshi/" className={styles.gridLink}>
          <span className={styles.gridLinkTitle}>3 доши →</span>
          <span className={styles.gridLinkText}>Нади-доша, Бхакут-доша, Мангал-доша (манглик)</span>
        </Link>
      </div>

      <h2 style={{ font: "600 15px var(--font-body)", color: "var(--ink)", margin: 0 }}>
        Дополнительные страницы: 27 накшатр
      </h2>
      <div className={styles.grid}>
        {Array.from({ length: 27 }, (_, i) => i + 1).map((n) => {
          const article = articles[String(n)];
          if (!article) return null;
          const name = article.title.match(/«([^»]+)»/)?.[1] ?? article.title;
          return (
            <Link key={n} href={`/dzhyotish-sovmestimost/nakshatry/${n}/`} className={styles.gridLink}>
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
