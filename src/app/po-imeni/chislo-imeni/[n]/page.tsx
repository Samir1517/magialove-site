import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ContentShell, CalcCta } from "@/components/content/ContentShell";
import { ArticleFull } from "@/components/content/ArticleFull";
import { allNameNumberArticles, getNameNumberArticle } from "@/lib/content/articles";
import styles from "@/components/content/content.module.css";

const ORDER = [1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 22, 33];

export function generateStaticParams() {
  return Object.keys(allNameNumberArticles()).map((n) => ({ n }));
}

function getData(n: string) {
  const num = parseInt(n, 10);
  const article = getNameNumberArticle(num);
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
    title: `${data.article.title} — значение в отношениях`,
    description: data.article.capsule.slice(0, 155),
  };
}

export default async function NameNumberPage({ params }: { params: Promise<{ n: string }> }) {
  const { n } = await params;
  const data = getData(n);
  if (!data) notFound();
  const { num, article } = data;

  const idx = ORDER.indexOf(num);
  const prevNum = idx > 0 ? ORDER[idx - 1] : null;
  const nextNum = idx >= 0 && idx < ORDER.length - 1 ? ORDER[idx + 1] : null;
  const prev = prevNum ? getNameNumberArticle(prevNum) : null;
  const next = nextNum ? getNameNumberArticle(nextNum) : null;

  return (
    <ContentShell
      breadcrumbs={[
        { label: "Главная", href: "/" },
        { label: "По имени", href: "/po-imeni/" },
        { label: `Число ${num}` },
      ]}
    >
      <div className={styles.eyebrow}>По имени · Число имени {num}</div>
      <h1 className={styles.h1}>{article.title}</h1>

      <ArticleFull article={article} />

      <CalcCta
        title="Узнайте число имени вашей пары"
        text="Введите оба имени кириллицей — расчёт займёт секунды и не требует даты рождения."
        href="/po-imeni/"
      />

      <div className={styles.pairNav}>
        {prev ? (
          <Link href={`/po-imeni/chislo-imeni/${prevNum}/`} className={styles.pairNavLink}>
            ← {prev.title.replace(/^Число имени \d+ /, "Число ")}
          </Link>
        ) : <span />}
        {next ? (
          <Link href={`/po-imeni/chislo-imeni/${nextNum}/`} className={styles.pairNavLink}>
            {next.title.replace(/^Число имени \d+ /, "Число ")} →
          </Link>
        ) : <span />}
      </div>
    </ContentShell>
  );
}
