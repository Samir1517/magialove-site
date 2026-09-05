import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ContentShell, CalcCta } from "@/components/content/ContentShell";
import { ArticleFull } from "@/components/content/ArticleFull";
import { allJyotishNakshatraArticles, getJyotishNakshatraArticle } from "@/lib/content/articles";
import { RelatedPages, type RelatedLink } from "@/components/content/RelatedPages";
import { NakshatraProfile } from "@/components/content/NakshatraProfile";
import { HubFaq } from "@/components/content/HubDepth";
import { nakshatraFaq } from "@/lib/content/nakshatra-faq";
import { NAKSHATRA_FACTS, sameGana, sameYoni } from "@/lib/content/nakshatra-facts";
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
  const nameOf = (i: number) => NAKSHATRAS.find((x) => x.i === i)?.name ?? String(i);
  const add = (i: number, note: string) => {
    if (i === num || links.some((l) => l.href === href(i))) return;
    links.push({ href: href(i), label: `Накшатра ${nameOf(i)}`, note });
  };

  /**
   * Выбор идёт не с начала списка, а по кругу от текущего номера.
   *
   * Иначе граф перекашивало: `slice(0, 3)` от начала означал, что ссылки почти
   * всегда достаются накшатрам с малыми номерами, а хвост списка оставался с
   * четырьмя входящими. Замер это и показал — 10 входящих у Читры против 5 у
   * Уттара Ашадхи. Обход по кругу раздаёт ссылки поровну.
   */
  const pickAround = (pool: number[], k: number): number[] => {
    const sorted = [...pool].sort((a, b) => a - b);
    const after = sorted.filter((i) => i > num);
    const before = sorted.filter((i) => i < num);
    return [...after, ...before].slice(0, k);
  };

  for (const i of pickAround(
    NAKSHATRAS.filter((x) => x.rashi === self.rashi).map((x) => x.i),
    2
  )) {
    add(i, `Тот же раши — ${self.rashi}`);
  }
  for (const i of pickAround(
    NAKSHATRAS.filter((x) => x.nadi === self.nadi).map((x) => x.i),
    2
  )) {
    add(i, `Та же нади — ${self.nadi}`);
  }
  // Йони и гана — оси, которых в связях не было, а в подсчёте совместимости
  // они весят 4 и 6 баллов. Заодно связывают накшатры из разных знаков, тогда
  // как раши и нади тянут только соседей по кругу.
  const facts = NAKSHATRA_FACTS[num];
  if (facts) {
    for (const i of pickAround(sameYoni(num), 2)) {
      add(i, `Та же йони — ${facts.yoni.toLowerCase()}`);
    }
    for (const i of pickAround(sameGana(num), 3)) {
      add(i, `Та же гана — ${facts.gana}`);
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
  const row = NAKSHATRAS.find((x) => x.i === data.num);
  // Было `${article.title} — значение для совместимости`, а сам заголовок уже
  // заканчивается на «в совместимости пары» — выходило «…в совместимости пары
  // — значение для совместимости».
  const title = row
    ? `Накшатра ${row.name}: значение в совместимости, гана и йони`
    : data.article.title;

  // Обрезка описания по границе слова: `slice(155)` рубила посреди слова.
  const capsule = data.article.capsule.replace(/\*\*/g, "");
  const description =
    capsule.length <= 158
      ? capsule
      : `${capsule.slice(0, capsule.lastIndexOf(" ", 158))}…`;

  return {
    alternates: { canonical: `/dzhyotish-sovmestimost/nakshatry/${n}/` },
    title,
    description,
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

      {/* Имя берём из данных движка, а не вырезаем из заголовка: заголовок
          редактируется в .md, и регулярка отвалилась бы молча. */}
      <NakshatraProfile n={num} name={NAKSHATRAS.find((x) => x.i === num)?.name ?? `${num}`} />

      <div className={styles.card}>
        <HubFaq
          items={nakshatraFaq(num)}
          title={`Частые вопросы про накшатру ${NAKSHATRAS.find((x) => x.i === num)?.name ?? num}`}
        />
      </div>

      <RelatedPages
        headingId="nakshatra-related"
        title="Накшатры и знак рядом"
        lede="Лунные стоянки читаются группами: одна нади — общий склад, один раши — общий знак, одна йони — близкий темп, одна гана — похожая манера в споре. Каждая из этих осей даёт баллы в подсчёте совместимости."
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
