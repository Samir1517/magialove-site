import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ContentShell, CalcCta } from "@/components/content/ContentShell";
import { ArticleFull } from "@/components/content/ArticleFull";
import { allNameNumberArticles, getNameNumberArticle, getLifePathArticle } from "@/lib/content/articles";
import { RelatedPages, type RelatedLink } from "@/components/content/RelatedPages";
import { calcNameNumbers } from "@/lib/engines/name-numerology";
import { PILOT_MALE_NAMES, PILOT_FEMALE_NAMES, nameSlug } from "@/lib/data/name-popularity";
import styles from "@/components/content/content.module.css";

const ORDER = [1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 22, 33];

/**
 * Обратный ход к страницам пар. До этого связь была односторонней: пара вела
 * (точнее, не вела) к числу, а число не возвращало ни к одной паре — двенадцать
 * страниц чисел висели в стороне от шестидесяти четырёх страниц пар.
 *
 * Плюс кросс-ссылка на одноимённое число жизненного пути: то же число, но из
 * другой системы и по другим исходным данным — частый вопрос читателя.
 */
function relatedNameNumber(num: number): RelatedLink[] {
  const links: RelatedLink[] = [];

  for (const m of PILOT_MALE_NAMES) {
    if (links.length >= 3) break;
    if (calcNameNumbers(m).expression !== num) continue;
    const f = PILOT_FEMALE_NAMES[0];
    links.push({
      href: `/po-imeni/${nameSlug(m)}-i-${nameSlug(f)}/`,
      label: `${m} и ${f}: совместимость имён`,
      note: `Число имени ${m} — ${num}`,
    });
  }
  for (const f of PILOT_FEMALE_NAMES) {
    if (links.length >= 6) break;
    if (calcNameNumbers(f).expression !== num) continue;
    const m = PILOT_MALE_NAMES[0];
    links.push({
      href: `/po-imeni/${nameSlug(m)}-i-${nameSlug(f)}/`,
      label: `${m} и ${f}: совместимость имён`,
      note: `Число имени ${f} — ${num}`,
    });
  }

  if (getLifePathArticle(num)) {
    links.push({
      href: `/numerologiya-sovmestimost/chislo-zhiznennogo-puti/${num}/`,
      label: `Число жизненного пути ${num}`,
      note: "То же число, но из даты рождения — не самоподача, а задача жизни",
    });
  }

  return links;
}

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
    alternates: { canonical: `/po-imeni/chislo-imeni/${n}/` },
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

      <RelatedPages
        headingId="name-number-related"
        title={`Где встречается число ${num}`}
        lede="Готовые расчёты пар, где это число выпадает одному из партнёров, и то же число в другой системе — по дате рождения."
        links={relatedNameNumber(num)}
      />

      <CalcCta
        title="Узнай число имени твоей пары"
        text="Введи оба имени кириллицей — расчёт займёт секунды и не требует даты рождения."
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
