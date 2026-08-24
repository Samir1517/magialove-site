import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ContentShell, CalcCta } from "@/components/content/ContentShell";
import { ArticleFull } from "@/components/content/ArticleFull";
import { allLifePathArticles, getLifePathArticle, getNameNumberArticle } from "@/lib/content/articles";
import { RelatedPages, type RelatedLink } from "@/components/content/RelatedPages";
import styles from "@/components/content/content.module.css";

const ORDER = [1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 22, 33];
/** Мастер-числа не сводятся к однозначным и читаются отдельно от них. */
const MASTER = [11, 22, 33];

/**
 * Соседи числа жизненного пути. Раньше отсюда вели только «предыдущее» и
 * «следующее» — то есть связь по порядку, а не по смыслу.
 *
 * Оси: то же число в системе имён (другая система, тот же символ) и мастер-числа,
 * которые к этому числу сводятся или от него отличаются принципиально.
 */
function relatedLifePath(num: number): RelatedLink[] {
  const links: RelatedLink[] = [];

  if (getNameNumberArticle(num)) {
    links.push({
      href: `/po-imeni/chislo-imeni/${num}/`,
      label: `Число имени ${num}`,
      note: "То же число, но из имени — манера самоподачи, а не задача жизни",
    });
  }

  for (const m of MASTER) {
    if (m === num || links.length >= 6) continue;
    if (!getLifePathArticle(m)) continue;
    links.push({
      href: `/numerologiya-sovmestimost/chislo-zhiznennogo-puti/${m}/`,
      label: `Число жизненного пути ${m}`,
      note: MASTER.includes(num) ? "Другое мастер-число" : `Мастер-число: не сводится к ${m % 9 || 9}`,
    });
  }

  for (const n of ORDER) {
    if (links.length >= 6) break;
    if (n === num || MASTER.includes(n)) continue;
    if (Math.abs(n - num) !== 1) continue;
    if (!getLifePathArticle(n)) continue;
    links.push({
      href: `/numerologiya-sovmestimost/chislo-zhiznennogo-puti/${n}/`,
      label: `Число жизненного пути ${n}`,
      note: "Соседнее число — частая пара в расчёте",
    });
  }

  return links;
}

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

      <RelatedPages
        headingId="lifepath-related"
        title={`Число ${num} в других расчётах`}
        lede="Одно и то же число приходит из разных источников: дата рождения даёт задачу жизни, имя — манеру самоподачи. Рядом — мастер-числа, которые читаются отдельно от однозначных."
        links={relatedLifePath(num)}
      />

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
