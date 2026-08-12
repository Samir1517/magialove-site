import type { Metadata } from "next";
import { ContentShell, CalcCta } from "@/components/content/ContentShell";
import { ArticleFull } from "@/components/content/ArticleFull";
import { allPsychomatrixArticles } from "@/lib/content/articles";
import styles from "@/components/content/content.module.css";

const LINE_ORDER = ["will", "family", "stability", "talent", "selfworth", "goal", "temperament", "spirit"];

export const metadata: Metadata = {
  title: "Психоматрица (квадрат Пифагора) пары: как считать совместимость",
  description:
    "8 линий Квадрата Пифагора в паре: что измеряет каждая линия, что означает совпадение партнёров, а что — расхождение. Современная символическая техника, честно о её происхождении.",
};

export default function PsychomatrixHubPage() {
  const articles = allPsychomatrixArticles();

  return (
    <ContentShell
      breadcrumbs={[
        { label: "Главная", href: "/" },
        { label: "Нумерология", href: "/numerologiya-sovmestimost/" },
        { label: "Психоматрица" },
      ]}
    >
      <div className={styles.eyebrow}>Нумерология</div>
      <h1 className={styles.h1}>Психоматрица (Квадрат Пифагора) пары: 8 линий совместимости</h1>
      <p className={styles.lede}>
        Квадрат Пифагора строится из цифр полной даты рождения и раскладывается на 8 линий —
        каждая измеряет свою сферу пары. Важно честно сказать: это не древняя и не научная
        система, а современная символическая техника (систематизирована Александром
        Александровым, Россия, 2000-е). Её ценность — в языке для разговора о паре, а не в
        предсказании.
      </p>

      <CalcCta
        title="Построй квадрат для твоей пары"
        text="Здесь — общий смысл каждой линии. Чтобы увидеть свои реальные цифры и совпадения с партнёром, введи обе даты рождения."
        href="/numerologiya-sovmestimost/"
      />

      {LINE_ORDER.map((key) => {
        const article = articles[key];
        if (!article) return null;
        return <ArticleFull key={key} article={article} />;
      })}
    </ContentShell>
  );
}
