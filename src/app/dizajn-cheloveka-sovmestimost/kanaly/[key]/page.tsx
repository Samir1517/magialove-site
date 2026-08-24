import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ContentShell, CalcCta } from "@/components/content/ContentShell";
import { ArticleFull } from "@/components/content/ArticleFull";
import { allHDChannelArticles, getHDChannelArticle } from "@/lib/content/articles";
import { RelatedPages, type RelatedLink } from "@/components/content/RelatedPages";
import { CHANNELS, CENTER_NAMES, centerOfGate, channelsOfGate } from "@/lib/engines/human-design-tables";
import styles from "@/components/content/content.module.css";

/**
 * Соседи канала по смыслу. Раньше страница канала была самым глухим тупиком
 * на сайте: два входа (хаб и карта раздела) и ни одной исходящей ссылки, даже
 * «предыдущий/следующий» не было.
 *
 * Два honest-правила, оба из самой системы:
 * 1. Каналы, делящие ворота. Ворота 10, 20, 34 и 57 входят каждое в три
 *    канала — для них это буквально соседи по одной точке карты.
 * 2. Каналы, соединяющие ту же пару центров: другой способ связать те же
 *    две части бодиграфа.
 */
function relatedChannels(key: string): RelatedLink[] {
  const self = CHANNELS.find((c) => c.key === key);
  if (!self) return [];

  const [g1, g2] = self.gates;
  const c1 = centerOfGate(g1);
  const c2 = centerOfGate(g2);
  const centersOf = (k: string) => {
    const ch = CHANNELS.find((c) => c.key === k);
    if (!ch) return [] as string[];
    return [centerOfGate(ch.gates[0]), centerOfGate(ch.gates[1])].sort();
  };
  const selfCenters = [c1, c2].sort().join("|");

  const links: RelatedLink[] = [];
  const push = (chKey: string, note: string) => {
    if (chKey === key) return;
    if (!getHDChannelArticle(chKey)) return; // статья есть не у всех 36 ключей
    const art = CHANNELS.find((c) => c.key === chKey);
    if (!art) return;
    links.push({
      href: `/dizajn-cheloveka-sovmestimost/kanaly/${chKey}/`,
      label: `Канал ${chKey} «${art.name}»`,
      note,
    });
  };

  for (const g of [g1, g2]) {
    for (const ch of channelsOfGate(g)) {
      push(ch.key, `Делит с этим каналом ворота ${g}`);
    }
  }
  for (const ch of CHANNELS) {
    if (links.length >= 6) break;
    if (centersOf(ch.key).join("|") === selfCenters) {
      push(ch.key, `Соединяет те же центры: ${CENTER_NAMES[c1]} и ${CENTER_NAMES[c2]}`);
    }
  }

  return links.slice(0, 6);
}

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
    alternates: { canonical: `/dizajn-cheloveka-sovmestimost/kanaly/${key}/` },
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

      <RelatedPages
        headingId="channel-related"
        title="Соседние каналы бодиграфа"
        lede="Каналы не живут поодиночке: одни делят с этим ворота, другие соединяют те же два центра иным путём. Рядом с ними этот канал читается точнее."
        links={relatedChannels(key)}
      />

      <CalcCta
        title="Узнай, есть ли этот канал в твоём композите"
        text="Введи даты и время рождения обоих партнёров, чтобы увидеть реальный композитный бодиграф твоей пары."
        href="/dizajn-cheloveka-sovmestimost/"
      />
    </ContentShell>
  );
}
