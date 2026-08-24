import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ContentShell, CalcCta } from "@/components/content/ContentShell";
import { ArticleFull } from "@/components/content/ArticleFull";
import { allJyotishNakshatraArticles, getJyotishNakshatraArticle } from "@/lib/content/articles";
import { RelatedPages, type RelatedLink } from "@/components/content/RelatedPages";
import { ZODIAC_SIGNS } from "@/lib/data/zodiac";
import nakshatraData from "@/lib/data/jyotish/nakshatra.json";
import styles from "@/components/content/content.module.css";

interface NakshatraRow {
  i: number;
  name: string;
  nadi: string;
  rashi: string;
}
const NAKSHATRAS = (nakshatraData as { nakshatras: NakshatraRow[] }).nakshatras;

/**
 * Соседи накшатры по смыслу — вместо одних лишь «предыдущая/следующая».
 *
 * Три оси, все из данных движка:
 * 1. Та же нади — самый весомый параметр Гуна-милана (8 баллов из 36), и
 *    совпадение нади у пары считается дошей. Читателю полезно видеть, кто ещё
 *    в этой группе.
 * 2. Тот же раши — накшатры, лежащие в том же знаке.
 * 3. Сам знак зодиака: единственная связь между разделом Джйотиш и справочником
 *    знаков, которых на сайте 78 штук и которые до этого ни с чем не связаны.
 */
function relatedNakshatra(num: number): RelatedLink[] {
  const self = NAKSHATRAS.find((x) => x.i === num);
  if (!self) return [];

  const links: RelatedLink[] = [];
  const href = (i: number) => `/dzhyotish-sovmestimost/nakshatry/${i}/`;

  for (const x of NAKSHATRAS) {
    if (x.i === num || links.length >= 3) continue;
    if (x.rashi === self.rashi) {
      links.push({ href: href(x.i), label: `Накшатра ${x.name}`, note: `Тот же раши — ${x.rashi}` });
    }
  }
  for (const x of NAKSHATRAS) {
    if (x.i === num || links.length >= 6) continue;
    if (x.nadi === self.nadi && !links.some((l) => l.href === href(x.i))) {
      links.push({ href: href(x.i), label: `Накшатра ${x.name}`, note: `Та же нади — ${x.nadi}` });
    }
  }

  // Раши бывает пограничным вида «Овен/Телец» — тогда ведём на оба знака.
  for (const signName of self.rashi.split("/")) {
    const sign = ZODIAC_SIGNS.find((s) => s.name === signName.trim());
    if (sign) {
      links.push({
        href: `/znaki-zodiaka/${sign.slug}/`,
        label: `${sign.name}: характер знака`,
        note: `Знак, в котором лежит эта накшатра`,
      });
    }
  }

  return links;
}

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
    alternates: { canonical: `/dzhyotish-sovmestimost/nakshatry/${n}/` },
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

      <RelatedPages
        headingId="nakshatra-related"
        title="Накшатры и знак рядом"
        lede="Накшатры одной нади и одного раши читаются вместе: нади — самый весомый параметр в подсчёте совместимости, а раши показывает, в каком знаке зодиака лежит эта лунная стоянка."
        links={relatedNakshatra(num)}
      />

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
