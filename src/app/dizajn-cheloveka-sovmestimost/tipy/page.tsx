import type { Metadata } from "next";
import { ContentShell, CalcCta } from "@/components/content/ContentShell";
import { ArticleFull } from "@/components/content/ArticleFull";
import { allHDTypeArticles } from "@/lib/content/articles";
import styles from "@/components/content/content.module.css";

const TYPE_ORDER = ["Генератор", "Манифестирующий генератор", "Проектор", "Манифестор", "Рефлектор"];

export const metadata: Metadata = {
  alternates: { canonical: "/dizajn-cheloveka-sovmestimost/tipy/" },
  title: "5 типов Дизайна человека в паре: кто с кем совместим",
  description:
    "Генератор, Манифестирующий генератор, Проектор, Манифестор, Рефлектор — что каждый тип означает для пары через Стратегию и Сигнатуру/Тему не-self. По Ра Уру Ху и Линде Баннелл.",
};

export default function HDTypesHubPage() {
  const articles = allHDTypeArticles();

  return (
    <ContentShell
      breadcrumbs={[
        { label: "Главная", href: "/" },
        { label: "Дизайн человека", href: "/dizajn-cheloveka-sovmestimost/" },
        { label: "5 типов" },
      ]}
    >
      <div className={styles.eyebrow}>Дизайн человека</div>
      <h1 className={styles.h1}>5 типов Дизайна человека в паре</h1>
      <p className={styles.lede}>
        Тип определяет Стратегию — как человеку правильно действовать в мире, — и природную
        эмоцию здорового следования ей (Сигнатура) в противовес эмоции-маркеру искажения
        (Тема не-self). В паре это не «совместимы/не совместимы», а вопрос, узнаёте ли вы
        Сигнатуру друг друга и что делаете, когда видите Тему не-self. Первоисточник — Ра Уру
        Ху и Линда Баннелл, <em>The Definitive Book of Human Design</em> (IHDS, 2011).
      </p>
      <p className={styles.lede}>
        Чаще других разбирают конкретные сочетания: совместимость Генератора и Проектора —
        энергия плюс мудрое управление ею; Манифестора и Генератора — инициатива плюс
        воплощение; Манифестора и Проектора — свобода действия плюс приглашение. Разбор каждого
        типа ниже написан так, чтобы читаться именно в паре с любым другим.
      </p>

      <CalcCta
        title="Узнай типы твоей пары"
        text="Тип определяется по точному времени рождения — введи даты и время обоих, чтобы увидеть не только типы, но и композитный бодиграф пары."
        href="/dizajn-cheloveka-sovmestimost/"
      />

      {TYPE_ORDER.map((key) => {
        const article = articles[key];
        if (!article) return null;
        return <ArticleFull key={key} article={article} />;
      })}
    </ContentShell>
  );
}
