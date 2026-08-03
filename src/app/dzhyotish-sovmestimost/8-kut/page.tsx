import type { Metadata } from "next";
import { ContentShell, CalcCta } from "@/components/content/ContentShell";
import { ArticleFull } from "@/components/content/ArticleFull";
import { allJyotishKutaArticles } from "@/lib/content/articles";
import styles from "@/components/content/content.module.css";

const KUTA_ORDER = ["varna", "vashya", "tara", "yoni", "graha_maitri", "gana", "bhakoot", "nadi"];

export const metadata: Metadata = {
  title: "8 кут Ашткута (Гуна-милан): как считаются 36 баллов совместимости",
  description:
    "Варна, Вашья, Тара, Йони, Граха Майтри, Гана, Бхакут, Нади — восемь кут классической Аштакуты Джйотиш, дающих до 36 баллов совместимости. По Брихат Парашара Хора Шастре.",
};

export default function KutasHubPage() {
  const articles = allJyotishKutaArticles();

  return (
    <ContentShell
      breadcrumbs={[
        { label: "Главная", href: "/" },
        { label: "Джйотиш", href: "/dzhyotish-sovmestimost/" },
        { label: "8 кут" },
      ]}
    >
      <div className={styles.eyebrow}>Джйотиш</div>
      <h1 className={styles.h1}>8 кут Аштакуты: из чего складываются 36 баллов</h1>
      <p className={styles.lede}>
        Аштакута Гуна-милан — классический метод сравнения пары по положению Луны, восходящий
        к Брихат Парашара Хора Шастре. Восемь показателей с разным весом (от 1 до 8 баллов)
        суммируются в шкалу 0–36: выше 18 — приемлемо, выше 24 — хорошо, выше 30 — отлично.
        Низкий балл по куте — не приговор, а конкретная зона, которую стоит обсудить.
      </p>

      <CalcCta
        title="Посчитай свою Гуна-милан"
        text="Введи точное время и место рождения обоих — расчёт положения Луны требует момента, а не только даты."
        href="/dzhyotish-sovmestimost/"
      />

      {KUTA_ORDER.map((key) => {
        const article = articles[key];
        if (!article) return null;
        return <ArticleFull key={key} article={article} />;
      })}
    </ContentShell>
  );
}
