import type { Metadata } from "next";
import { ContentShell, CalcCta } from "@/components/content/ContentShell";
import { ArticleFull } from "@/components/content/ArticleFull";
import { allHDAuthorityArticles } from "@/lib/content/articles";
import styles from "@/components/content/content.module.css";

const AUTH_ORDER = [
  "Эмоциональный", "Сакральный", "Селезёночный", "Эго/Сердечный",
  "Самопроекционный", "Ментальный/внешний", "Лунный",
];

export const metadata: Metadata = {
  alternates: { canonical: "/dizajn-cheloveka-sovmestimost/avtoritety/" },
  title: "7 авторитетов Дизайна человека в паре: ритм принятия решений",
  description:
    "Эмоциональный, Сакральный, Селезёночный, Эго, Самопроекционный, Ментальный, Лунный авторитет — как каждый определяет темп решений в паре и что означает несовпадение авторитетов.",
};

export default function HDAuthoritiesHubPage() {
  const articles = allHDAuthorityArticles();

  return (
    <ContentShell
      breadcrumbs={[
        { label: "Главная", href: "/" },
        { label: "Дизайн человека", href: "/dizajn-cheloveka-sovmestimost/" },
        { label: "7 авторитетов" },
      ]}
    >
      <div className={styles.eyebrow}>Дизайн человека</div>
      <h1 className={styles.h1}>7 авторитетов Дизайна человека в паре</h1>
      <p className={styles.lede}>
        Авторитет — внутренний ритм, по которому человеку правильно принимать решения: кому-то
        нужна эмоциональная волна и пауза, кому-то — мгновенный телесный отклик. Разные
        авторитеты партнёров — не проблема сама по себе, а разный темп, который нужно
        согласовать. Главный риск ссор в паре — требовать от партнёра чужого темпа решений.
      </p>

      <CalcCta
        title="Узнай авторитет твоей пары"
        text="Введи даты и время рождения обоих, чтобы увидеть настоящие авторитеты — они считаются по точному моменту рождения, а не по дате."
        href="/dizajn-cheloveka-sovmestimost/"
      />

      {AUTH_ORDER.map((key) => {
        const article = articles[key];
        if (!article) return null;
        return <ArticleFull key={key} article={article} />;
      })}
    </ContentShell>
  );
}
