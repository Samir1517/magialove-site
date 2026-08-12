import type { Metadata } from "next";
import Link from "next/link";
import { ContentShell } from "@/components/content/ContentShell";
import { allLifePathArticles } from "@/lib/content/articles";
import styles from "@/components/content/content.module.css";

const ORDER = [1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 22, 33];

export const metadata: Metadata = {
  title: "Карта Нумерологии: все страницы совместимости по системе",
  description:
    "Полный список страниц раздела «Нумерология» — калькулятор, 12 чисел жизненного пути, психоматрица и число имени.",
};

export default function NumerologyKartaPage() {
  const articles = allLifePathArticles();

  return (
    <ContentShell
      breadcrumbs={[
        { label: "Главная", href: "/" },
        { label: "Нумерология", href: "/numerologiya-sovmestimost/" },
        { label: "Карта раздела" },
      ]}
    >
      <div className={styles.eyebrow}>Нумерология</div>
      <h1 className={styles.h1}>Карта раздела «Нумерология»</h1>
      <p className={styles.lede}>
        Все страницы совместимости по Нумерологии: калькулятор по дате рождения, 12 чисел
        жизненного пути, психоматрица (Квадрат Пифагора) и смежный раздел — совместимость по имени.
      </p>

      <h2 style={{ font: "600 15px var(--font-body)", color: "var(--ink)", margin: 0 }}>
        Основные страницы
      </h2>
      <div className={styles.grid}>
        <Link href="/numerologiya-sovmestimost/" className={styles.gridLink}>
          <span className={styles.gridLinkTitle}>Совместимость по Нумерологии →</span>
          <span className={styles.gridLinkText}>Калькулятор: число жизненного пути + психоматрица</span>
        </Link>
        <Link href="/numerologiya-sovmestimost/psihomatritsa/" className={styles.gridLink}>
          <span className={styles.gridLinkTitle}>Психоматрица (Квадрат Пифагора) →</span>
          <span className={styles.gridLinkText}>8 линий совпадений и различий партнёров</span>
        </Link>
        <Link href="/po-date-rozhdeniya/" className={styles.gridLink}>
          <span className={styles.gridLinkTitle}>Расчёт по дате рождения →</span>
          <span className={styles.gridLinkText}>
            Общий калькулятор: Нумерология вместе с Матрицей судьбы, а со временем рождения —
            все четыре системы
          </span>
        </Link>
      </div>

      <h2 style={{ font: "600 15px var(--font-body)", color: "var(--ink)", margin: 0 }}>
        Дополнительные страницы: 12 чисел жизненного пути
      </h2>
      <div className={styles.grid}>
        {ORDER.map((n) => {
          const article = articles[String(n)];
          if (!article) return null;
          const name = article.title.match(/«([^»]+)»/)?.[1] ?? article.title;
          return (
            <Link
              key={n}
              href={`/numerologiya-sovmestimost/chislo-zhiznennogo-puti/${n}/`}
              className={styles.gridLink}
            >
              <span className={styles.gridLinkNum}>{n}</span>
              <span className={styles.gridLinkTitle}>{name}</span>
              <span className={styles.gridLinkText}>{article.capsule.slice(0, 70)}…</span>
            </Link>
          );
        })}
      </div>

      <h2 style={{ font: "600 15px var(--font-body)", color: "var(--ink)", margin: 0 }}>
        Смежный раздел: нумерология по имени
      </h2>
      <div className={styles.grid}>
        <Link href="/po-imeni/" className={styles.gridLink}>
          <span className={styles.gridLinkTitle}>Совместимость по имени →</span>
          <span className={styles.gridLinkText}>Число Имени, Души и Личности — та же нумерология, другой вход</span>
        </Link>
      </div>
    </ContentShell>
  );
}
