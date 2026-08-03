import type { Metadata } from "next";
import Link from "next/link";
import { ContentShell } from "@/components/content/ContentShell";
import { HeroForm } from "@/components/landing/HeroForm";
import { allMatrixArticles } from "@/lib/content/articles";
import styles from "@/components/content/content.module.css";

export const metadata: Metadata = {
  title: "Совместимость по матрице судьбы: расчёт и расшифровка",
  description:
    "Матрица судьбы пары строится наложением дат рождения на октаграмму — 22 аркана, 5 зон союза (любовь, деньги, дети, предназначение, точка комфорта). Свет и тень каждого аркана.",
};

export default function MatrixHubPage() {
  const articles = allMatrixArticles();

  return (
    <ContentShell
      breadcrumbs={[
        { label: "Главная", href: "/" },
        { label: "По дате рождения", href: "/po-date-rozhdeniya/" },
        { label: "Матрица судьбы" },
      ]}
    >
      <div className={styles.eyebrow}>По дате рождения</div>
      <h1 className={styles.h1}>Совместимость по матрице судьбы</h1>
      <p className={styles.lede}>
        Матрица судьбы строится из цифр дня, месяца и года рождения — сначала индивидуальная
        карта каждого партнёра, потом их наложение (свод) даёт общую матрицу пары. В ней —
        22 аркана и 5 зон союза: любовь, деньги, дети, предназначение, точка комфорта. Ни один
        аркан не бывает «плохим» — у каждого есть конструктивная и теневая сторона, и то, какая
        проявится, зависит от направленности качества, а не от самого аркана.
      </p>

      <div className={styles.card}>
        <HeroForm targetPath="/po-date-rozhdeniya/matrica-sudby-sovmestimost/rezultat" />
      </div>

      <h2 style={{ font: "600 15px var(--font-body)", color: "var(--ink)", margin: 0 }}>
        22 аркана: значение в совместимости пары
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
