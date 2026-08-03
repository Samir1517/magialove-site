import type { Metadata } from "next";
import { ContentShell, CalcCta } from "@/components/content/ContentShell";
import { ArticleFull } from "@/components/content/ArticleFull";
import { allHDConnectionArticles } from "@/lib/content/articles";
import styles from "@/components/content/content.module.css";

const CONN_ORDER = ["electromagnetic", "companionship", "dominance", "compromise"];

export const metadata: Metadata = {
  title: "Каналы связи в композите: что соединяет пару в Дизайне человека",
  description:
    "4 типа связи каналов в композите пары — электромагнитная, компаньонство, доминирование, компромисс. Что каждый тип означает для отношений, свет и тень каждой связи.",
};

export default function HDConnectionsHubPage() {
  const articles = allHDConnectionArticles();

  return (
    <ContentShell
      breadcrumbs={[
        { label: "Главная", href: "/" },
        { label: "Дизайн человека", href: "/dizajn-cheloveka-sovmestimost/" },
        { label: "Каналы связи" },
      ]}
    >
      <div className={styles.eyebrow}>Дизайн человека</div>
      <h1 className={styles.h1}>Каналы связи в композите пары</h1>
      <p className={styles.lede}>
        Когда ворота двух партнёров складываются в композит, каждый общий канал образуется
        по-разному: закрывается только у одного, у обоих независимо, или каждый партнёр даёт
        свою половину. Это и определяет характер притяжения — от искры электромагнитной связи
        до устойчивости компаньонства.
      </p>

      <CalcCta
        title="Узнай, какие связи сложились у вас"
        text="Введи даты и время рождения обоих, чтобы увидеть реальный композитный бодиграф твоей пары и все каналы, которые в нём определены."
        href="/dizajn-cheloveka-sovmestimost/"
      />

      {CONN_ORDER.map((key) => {
        const article = articles[key];
        if (!article) return null;
        return <ArticleFull key={key} article={article} />;
      })}
    </ContentShell>
  );
}
