import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ContentShell, CalcCta } from "@/components/content/ContentShell";
import { ArticleFull } from "@/components/content/ArticleFull";
import { ArcanumRelations } from "@/components/content/ArcanumRelations";
import { ArcanumAstro } from "@/components/content/ArcanumAstro";
import { ArcanumGlyphs } from "@/components/content/ArcanumGlyphs";
import { HubFaq } from "@/components/content/HubDepth";
import { arcanumFaq } from "@/lib/content/matrix-arcana-faq";
import { getArcanumInfo } from "@/lib/engines/matrix";
import { allMatrixArticles, getMatrixArticle } from "@/lib/content/articles";
import styles from "@/components/content/content.module.css";

export function generateStaticParams() {
  return Object.keys(allMatrixArticles()).map((n) => ({ n }));
}

function getData(n: string) {
  const num = parseInt(n, 10);
  if (!Number.isFinite(num) || num < 1 || num > 22) return null;
  const article = getMatrixArticle(num);
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
    alternates: { canonical: `/matrica-sudby-sovmestimost/arkany/${n}/` },
    title: `${data.article.title} — значение и совместимость`,
    description: data.article.capsule.slice(0, 155),
  };
}

export default async function ArcanumPage({ params }: { params: Promise<{ n: string }> }) {
  const { n } = await params;
  const data = getData(n);
  if (!data) notFound();
  const { num, article } = data;

  const prev = num > 1 ? getMatrixArticle(num - 1) : null;
  const next = num < 22 ? getMatrixArticle(num + 1) : null;

  return (
    <ContentShell
      breadcrumbs={[
        { label: "Главная", href: "/" },
        { label: "Матрица судьбы", href: "/matrica-sudby-sovmestimost/" },
        { label: `Аркан ${num}` },
      ]}
    >
      <div className={styles.eyebrow}>Матрица судьбы · Аркан {num}</div>
      <h1 className={styles.h1}>{article.title}</h1>

      <ArticleFull article={article} />

      <ArcanumGlyphs n={num} arcanumName={`аркан ${num} «${getArcanumInfo(num).name}»`} />

      <ArcanumAstro n={num} arcanumName={`Аркан ${num} «${getArcanumInfo(num).name}»`} />

      <ArcanumRelations n={num} />

      {/* Вопросы читателя с готовыми ответами — отдельный жанр от раздела
          «О чём поговорить вдвоём», где вопросы намеренно без ответов. */}
      <div className={styles.card}>
        <HubFaq items={arcanumFaq(num)} title={`Частые вопросы про аркан ${num} «${getArcanumInfo(num).name}»`} />
      </div>

      <CalcCta
        title="Узнай свой аркан пары"
        text="Этот разбор — часть общей матрицы совместимости. Введи обе даты рождения, чтобы увидеть, какие 5 арканов сложились именно в твоей паре."
        href="/matrica-sudby-sovmestimost/"
      />

      <div className={styles.pairNav}>
        {prev ? (
          <Link href={`/matrica-sudby-sovmestimost/arkany/${num - 1}/`} className={styles.pairNavLink}>
            ← {prev.title.replace(/^Аркан \d+ /, "Аркан ")}
          </Link>
        ) : <span />}
        {next ? (
          <Link href={`/matrica-sudby-sovmestimost/arkany/${num + 1}/`} className={styles.pairNavLink}>
            {next.title.replace(/^Аркан \d+ /, "Аркан ")} →
          </Link>
        ) : <span />}
      </div>
    </ContentShell>
  );
}
