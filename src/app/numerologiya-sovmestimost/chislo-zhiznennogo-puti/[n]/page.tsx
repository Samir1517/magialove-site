import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ContentShell, CalcCta } from "@/components/content/ContentShell";
import { ArticleFull } from "@/components/content/ArticleFull";
import { allLifePathArticles, getLifePathArticle } from "@/lib/content/articles";
import styles from "@/components/content/content.module.css";

const ORDER = [1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 22, 33];

export function generateStaticParams() {
  return Object.keys(allLifePathArticles()).map((n) => ({ n }));
}

function getData(n: string) {
  const num = parseInt(n, 10);
  const article = getLifePathArticle(num);
  return article ? { num, article } : null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ n: string }>;
}): Promise<Metadata> {
  const { n } = await params;
  const data = getData(n);
  if (!data) return {};
  return {
    alternates: { canonical: `/numerologiya-sovmestimost/chislo-zhiznennogo-puti/${n}/` },
    title: `${data.article.title} — характеристика и совместимость`,
    description: data.article.capsule.slice(0, 155),
  };
}

export default async function LifePathPage({ params }: { params: Promise<{ n: string }> }) {
  const { n } = await params;
  const data = getData(n);
  if (!data) notFound();
  const { num, article } = data;

  const idx = ORDER.indexOf(num);
  const prevNum = idx > 0 ? ORDER[idx - 1] : null;
  const nextNum = idx >= 0 && idx < ORDER.length - 1 ? ORDER[idx + 1] : null;
  const prev = prevNum ? getLifePathArticle(prevNum) : null;
  const next = nextNum ? getLifePathArticle(nextNum) : null;

  return (
    <ContentShell
      breadcrumbs={[
        { label: "Главная", href: "/" },
        { label: "Нумерология", href: "/numerologiya-sovmestimost/" },
        { label: `Число ${num}` },
      ]}
    >
      <div className={styles.eyebrow}>Нумерология · Число жизненного пути {num}</div>
      <h1 className={styles.h1}>{article.title}</h1>

      <ArticleFull article={article} />

      <CalcCta
        title="Узнай оба числа жизненного пути"
        text="Это число раскрывает суть только одного человека. Введи обе даты рождения, чтобы увидеть динамику именно твоей пары и совпадения по 8 линиям психоматрицы."
        href="/numerologiya-sovmestimost/"
      />

      <div className={styles.pairNav}>
        {prev ? (
          <Link href={`/numerologiya-sovmestimost/chislo-zhiznennogo-puti/${prevNum}/`} className={styles.pairNavLink}>
            ← {prev.title.replace(/^Число жизненного пути \d+ /, "Число ")}
          </Link>
        ) : <span />}
        {next ? (
          <Link href={`/numerologiya-sovmestimost/chislo-zhiznennogo-puti/${nextNum}/`} className={styles.pairNavLink}>
            {next.title.replace(/^Число жизненного пути \d+ /, "Число ")} →
          </Link>
        ) : <span />}
      </div>
    </ContentShell>
  );
}
