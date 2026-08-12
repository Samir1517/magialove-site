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

/** Профили с той же первой линией — самые близкие соседи по смыслу. */
function relatives(profile: string): string[] {
  const first = profile.split("/")[0];
  return Object.keys(allHDProfileArticles()).filter(
    (k) => k !== profile && k.split("/")[0] === first,
  );
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

      {near.length > 0 && (
        <div className={styles.card}>
          <h2 className={styles.ctaTitle}>Профили с той же первой линией</h2>
          <p className={styles.ctaText}>
            Первая цифра у них общая — значит, осознаёт себя такой человек похоже. Всё
            различие держится на второй линии, той, которую видит партнёр.
          </p>
          <div className={styles.grid}>
            {near.map((k) => {
              const a = getHDProfileArticle(k);
              if (!a) return null;
              return (
                <Link
                  key={k}
                  href={`/dizajn-cheloveka-sovmestimost/profili/${profileSlug(k)}/`}
                  className={styles.gridLink}
                >
                  <span className={styles.gridLinkNum}>{k}</span>
                  <span className={styles.gridLinkTitle}>
                    {a.title.match(/«([^»]+)»/)?.[1] ?? ""}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      <CalcCta
        title={`Узнай, у кого из вас профиль ${profile}`}
        text="Профиль считается по положению Солнца в момент рождения — введи даты и время рождения обоих, и увидишь профиль каждого вместе с разбором пары."
        href="/dizajn-cheloveka-sovmestimost/"
      />
    </ContentShell>
  );
}
