import type { Metadata } from "next";
import { ContentShell, CalcCta } from "@/components/content/ContentShell";
import { ArticleFull } from "@/components/content/ArticleFull";
import { allJyotishDoshaArticles } from "@/lib/content/articles";
import styles from "@/components/content/content.module.css";

const DOSHA_ORDER = ["nadi", "bhakoot", "mangal"];

export const metadata: Metadata = {
  alternates: { canonical: "/dzhyotish-sovmestimost/doshi/" },
  title: "Доши в Джйотиш: Нади, Бхакут, Мангал доша (манглик) — без фатализма",
  description:
    "Что означают традиционные отягощения совместимости Джйотиш — Нади доша, Бхакут доша, Мангал доша (манглик). Честно о культурном статусе традиции, без страха и приговоров.",
};

export default function DoshasHubPage() {
  const articles = allJyotishDoshaArticles();

  return (
    <ContentShell
      breadcrumbs={[
        { label: "Главная", href: "/" },
        { label: "Джйотиш", href: "/dzhyotish-sovmestimost/" },
        { label: "Доши" },
      ]}
    >
      <div className={styles.eyebrow}>Джйотиш</div>
      <h1 className={styles.h1}>Доши: что традиция считает отягощением</h1>
      <p className={styles.lede}>
        Доши — штрафы к баллу Гуна-милан при определённых положениях Луны и Марса. Особенно
        Мангал-доша («манглик») несёт в индийской традиции реальный культурный вес — это
        устойчивое верование, а не медицинский или научный факт. Мы приводим доши как часть
        классического метода и всегда — с практическим, а не пугающим смыслом.
      </p>

      <CalcCta
        title="Проверь доши для твоей пары"
        text="Доши определяются по точному времени и месту рождения — введи данные обоих партнёров."
        href="/dzhyotish-sovmestimost/"
      />

      {DOSHA_ORDER.map((key) => {
        const article = articles[key];
        if (!article) return null;
        return <ArticleFull key={key} article={article} />;
      })}
    </ContentShell>
  );
}
