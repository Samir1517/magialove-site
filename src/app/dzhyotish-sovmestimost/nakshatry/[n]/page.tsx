import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ContentShell, CalcCta } from "@/components/content/ContentShell";
import { ArticleFull } from "@/components/content/ArticleFull";
import { allJyotishNakshatraArticles, getJyotishNakshatraArticle } from "@/lib/content/articles";
import styles from "@/components/content/content.module.css";

export function generateStaticParams() {
  return Object.keys(allJyotishNakshatraArticles()).map((n) => ({ n }));
}

function getData(n: string) {
  const num = parseInt(n, 10);
  const article = getJyotishNakshatraArticle(num);
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
    title: `${data.article.title} — значение для совместимости`,
    description: data.article.capsule.slice(0, 155),
  };
}

export default async function NakshatraPage({ params }: { params: Promise<{ n: string }> }) {
  const { n } = await params;
  const data = getData(n);
  if (!data) notFound();
  const { num, article } = data;

  const prev = num > 1 ? getJyotishNakshatraArticle(num - 1) : null;
  const next = num < 27 ? getJyotishNakshatraArticle(num + 1) : null;

  return (
    <ContentShell
      breadcrumbs={[
        { label: "Главная", href: "/" },
        { label: "Джйотиш", href: "/dzhyotish-sovmestimost/" },
        { label: "27 накшатр", href: "/dzhyotish-sovmestimost/nakshatry/" },
        { label: `${num}` },
      ]}
    >
      <div className={styles.eyebrow}>Джйотиш · Накшатра {num}</div>
      <h1 className={styles.h1}>{article.title}</h1>

      <ArticleFull article={article} />

      <CalcCta
        title="Узнай накшатру твоей пары"
        text="Введи точное время и место рождения обоих — накшатра определяется положением Луны на момент рождения."
        href="/dzhyotish-sovmestimost/"
      />

      <div className={styles.pairNav}>
        {prev ? (
          <Link href={`/dzhyotish-sovmestimost/nakshatry/${num - 1}/`} className={styles.pairNavLink}>
            ← Накшатра {num - 1}
          </Link>
        ) : <span />}
        {next ? (
          <Link href={`/dzhyotish-sovmestimost/nakshatry/${num + 1}/`} className={styles.pairNavLink}>
            Накшатра {num + 1} →
          </Link>
        ) : <span />}
      </div>
    </ContentShell>
  );
}
