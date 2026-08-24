import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ContentShell, CalcCta } from "@/components/content/ContentShell";
import { ArticleFull } from "@/components/content/ArticleFull";
import {
  allHDProfileArticles,
  getHDProfileArticle,
  profileFromSlug,
  profileSlug,
} from "@/lib/content/articles";
import { RelatedPages } from "@/components/content/RelatedPages";
import styles from "@/components/content/content.module.css";

export function generateStaticParams() {
  return Object.keys(allHDProfileArticles()).map((key) => ({ profile: profileSlug(key) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ profile: string }>;
}): Promise<Metadata> {
  const { profile } = await params;
  const article = getHDProfileArticle(profileFromSlug(profile));
  if (!article) return {};
  return {
    alternates: { canonical: `/dizajn-cheloveka-sovmestimost/profili/${profile}/` },
    title: `${article.title.replace(" в совместимости пары по Дизайну человека", "")} — значение в паре`,
    description: article.capsule.slice(0, 155),
  };
}

/**
 * Соседи профиля по смыслу. Было только «та же первая линия» — одна ссылка
 * на страницу. Добавлены ещё две оси, обе осмысленные внутри системы:
 * та же вторая линия (одинаково выглядят со стороны партнёра) и зеркальный
 * профиль, где те же две линии стоят в обратном порядке (существует не у всех).
 */
function relatives(profile: string): { key: string; note: string }[] {
  const all = Object.keys(allHDProfileArticles());
  const [first, second] = profile.split("/");
  const out: { key: string; note: string }[] = [];
  const add = (key: string, note: string) => {
    if (key === profile || out.some((x) => x.key === key) || !all.includes(key)) return;
    out.push({ key, note });
  };

  for (const k of all) {
    if (k.split("/")[0] === first) add(k, `Та же первая линия — ${first}`);
  }
  for (const k of all) {
    if (k.split("/")[1] === second) add(k, `Та же вторая линия — ${second}`);
  }
  add(`${second}/${first}`, "Зеркальный профиль: те же линии в обратном порядке");

  return out;
}

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ profile: string }>;
}) {
  const { profile: slug } = await params;
  const profile = profileFromSlug(slug);
  const article = getHDProfileArticle(profile);
  if (!article) notFound();

  const near = relatives(profile);

  return (
    <ContentShell
      breadcrumbs={[
        { label: "Главная", href: "/" },
        { label: "Дизайн человека", href: "/dizajn-cheloveka-sovmestimost/" },
        { label: "12 профилей", href: "/dizajn-cheloveka-sovmestimost/profili/" },
        { label: `Профиль ${profile}` },
      ]}
    >
      <Link href="/dizajn-cheloveka-sovmestimost/profili/" className={styles.eyebrow}>
        Дизайн человека · 12 профилей
      </Link>
      <h1 className={styles.h1}>{article.title}</h1>

      <ArticleFull article={article} />

      <RelatedPages
        headingId="profile-related"
        title="Соседние профили"
        lede="Первая цифра — то, как человек осознаёт себя сам; вторая — то, каким его видит партнёр. Профили, где совпадает одна из них, читаются в сравнении лучше всего."
        links={near.map(({ key, note }) => ({
          href: `/dizajn-cheloveka-sovmestimost/profili/${profileSlug(key)}/`,
          label: `Профиль ${key} «${getHDProfileArticle(key)?.title.match(/«([^»]+)»/)?.[1] ?? ""}»`,
          note,
        }))}
      />

      <CalcCta
        title={`Узнай, у кого из вас профиль ${profile}`}
        text="Профиль считается по положению Солнца в момент рождения — введи даты и время рождения обоих, и увидишь профиль каждого вместе с разбором пары."
        href="/dizajn-cheloveka-sovmestimost/"
      />
    </ContentShell>
  );
}
