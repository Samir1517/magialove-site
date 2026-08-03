import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ContentShell, CalcCta } from "@/components/content/ContentShell";
import { ArticleFull } from "@/components/content/ArticleFull";
import { allHDChannelArticles, getHDChannelArticle } from "@/lib/content/articles";
import styles from "@/components/content/content.module.css";

export function generateStaticParams() {
  return Object.keys(allHDChannelArticles()).map((key) => ({ key }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ key: string }>;
}): Promise<Metadata> {
  const { key } = await params;
  const article = getHDChannelArticle(key);
  if (!article) return {};
  return {
    title: `${article.title} — значение в композите пары`,
    description: article.capsule.slice(0, 155),
  };
}

export default async function ChannelPage({ params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  const article = getHDChannelArticle(key);
  if (!article) notFound();

  return (
    <ContentShell
      breadcrumbs={[
        { label: "Главная", href: "/" },
        { label: "Дизайн человека", href: "/dizajn-cheloveka-sovmestimost/" },
        { label: "Каналы", href: "/dizajn-cheloveka-sovmestimost/kanaly/" },
        { label: key },
      ]}
    >
      <div className={styles.eyebrow}>Дизайн человека · Канал {key}</div>
      <h1 className={styles.h1}>{article.title}</h1>

      <ArticleFull article={article} />

      <CalcCta
        title="Узнай, есть ли этот канал в твоём композите"
        text="Введи даты и время рождения обоих партнёров, чтобы увидеть реальный композитный бодиграф твоей пары."
        href="/dizajn-cheloveka-sovmestimost/"
      />
    </ContentShell>
  );
}
