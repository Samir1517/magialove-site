import type { Metadata } from "next";
import Link from "next/link";
import { ContentShell } from "@/components/content/ContentShell";
import { HeroForm } from "@/components/landing/HeroForm";
import { allLifePathArticles } from "@/lib/content/articles";
import styles from "@/components/content/content.module.css";

const ORDER = [1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 22, 33];

export const metadata: Metadata = {
  title: "Совместимость по нумерологии: расчёт по числам партнёров",
  description:
    "Число жизненного пути каждого партнёра плюс Квадрат Пифагора (психоматрица) — 12 чисел и 8 линий совместимости пары. По Cheiro's Book of Numbers и современной психоматрице.",
};

export default function NumerologyHubPage() {
  const articles = allLifePathArticles();

  return (
    <ContentShell
      breadcrumbs={[
        { label: "Главная", href: "/" },
        { label: "По дате рождения", href: "/po-date-rozhdeniya/" },
        { label: "Нумерология" },
      ]}
    >
      <div className={styles.eyebrow}>По дате рождения</div>
      <h1 className={styles.h1}>Совместимость по нумерологии</h1>
      <p className={styles.lede}>
        Число жизненного пути — западная пифагорейско-халдейская традиция, кодифицированная
        Cheiro (<em>Cheiro&apos;s Book of Numbers</em>, 1926). Оно раскрывает суть человека
        в отношениях; в паре два числа складываются в конкретную динамику. Дополняет картину
        Квадрат Пифагора (психоматрица) — 8 линий совпадений и различий по цифрам полной даты
        рождения.
      </p>

      <div className={styles.card}>
        <HeroForm targetPath="/po-date-rozhdeniya/numerologiya-sovmestimost/rezultat" />
      </div>

      <h2 style={{ font: "600 15px var(--font-body)", color: "var(--ink)", margin: 0 }}>
        12 чисел жизненного пути
      </h2>
      <div className={styles.grid}>
        {ORDER.map((n) => {
          const article = articles[String(n)];
          if (!article) return null;
          const name = article.title.match(/«([^»]+)»/)?.[1] ?? article.title;
          return (
            <Link
              key={n}
              href={`/po-date-rozhdeniya/numerologiya-sovmestimost/chislo-zhiznennogo-puti/${n}/`}
              className={styles.gridLink}
            >
              <span className={styles.gridLinkNum}>{n}</span>
              <span className={styles.gridLinkTitle}>{name}</span>
              <span className={styles.gridLinkText}>{article.capsule.slice(0, 70)}…</span>
            </Link>
          );
        })}
      </div>

      <div className={styles.grid}>
        <Link href="/po-date-rozhdeniya/numerologiya-sovmestimost/psihomatritsa/" className={styles.gridLink}>
          <span className={styles.gridLinkTitle}>Психоматрица (Квадрат Пифагора) →</span>
          <span className={styles.gridLinkText}>8 линий совпадений и различий партнёров по цифрам даты рождения</span>
        </Link>
        <Link href="/po-imeni/" className={styles.gridLink}>
          <span className={styles.gridLinkTitle}>Число Имени →</span>
          <span className={styles.gridLinkText}>Та же нумерология, но по имени партнёров, а не по дате рождения</span>
        </Link>
        <Link href="/po-date-rozhdeniya/numerologiya-sovmestimost/karta/" className={styles.gridLink}>
          <span className={styles.gridLinkTitle}>Карта раздела →</span>
          <span className={styles.gridLinkText}>Все страницы Нумерологии на сервисе в одном месте</span>
        </Link>
      </div>
    </ContentShell>
  );
}
