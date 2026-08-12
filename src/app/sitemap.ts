import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site-config";
import {
  allMatrixArticles,
  allLifePathArticles,
  allNameNumberArticles,
  allHDChannelArticles,
  allJyotishNakshatraArticles,
} from "@/lib/content/articles";
import { PILOT_MALE_NAMES, PILOT_FEMALE_NAMES, nameSlug } from "@/lib/data/name-popularity";
import { allZodiacPairSlugs } from "@/app/znaki-zodiaka/[pair]/page";

export const dynamic = "force-static";

type Entry = { url: string; changeFrequency: "weekly" | "monthly"; priority: number };

/**
 * Статический sitemap. Страницы-результаты (*rezultat*) и главная страница результата
 * намеренно не включены — без query-параметров они показывают заглушку «нет данных для
 * расчёта», индексировать нечего. /kontakty/ тоже не включена (пока не готова к публикации).
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const entries: Entry[] = [
    { url: "/", changeFrequency: "weekly", priority: 1 },

    { url: "/po-date-rozhdeniya/", changeFrequency: "monthly", priority: 0.9 },
    { url: "/matrica-sudby-sovmestimost/", changeFrequency: "monthly", priority: 0.9 },
    { url: "/matrica-sudby-sovmestimost/karta/", changeFrequency: "monthly", priority: 0.5 },
    { url: "/numerologiya-sovmestimost/", changeFrequency: "monthly", priority: 0.9 },
    { url: "/numerologiya-sovmestimost/psihomatritsa/", changeFrequency: "monthly", priority: 0.7 },
    { url: "/numerologiya-sovmestimost/karta/", changeFrequency: "monthly", priority: 0.5 },
    { url: "/dizajn-cheloveka-sovmestimost/", changeFrequency: "monthly", priority: 0.9 },
    { url: "/dizajn-cheloveka-sovmestimost/tipy/", changeFrequency: "monthly", priority: 0.7 },
    { url: "/dizajn-cheloveka-sovmestimost/avtoritety/", changeFrequency: "monthly", priority: 0.7 },
    { url: "/dizajn-cheloveka-sovmestimost/kanaly-svyazi/", changeFrequency: "monthly", priority: 0.7 },
    { url: "/dizajn-cheloveka-sovmestimost/kanaly/", changeFrequency: "monthly", priority: 0.7 },
    { url: "/dizajn-cheloveka-sovmestimost/karta/", changeFrequency: "monthly", priority: 0.5 },
    { url: "/dzhyotish-sovmestimost/", changeFrequency: "monthly", priority: 0.9 },
    { url: "/dzhyotish-sovmestimost/8-kut/", changeFrequency: "monthly", priority: 0.7 },
    { url: "/dzhyotish-sovmestimost/doshi/", changeFrequency: "monthly", priority: 0.7 },
    { url: "/dzhyotish-sovmestimost/nakshatry/", changeFrequency: "monthly", priority: 0.7 },
    { url: "/dzhyotish-sovmestimost/karta/", changeFrequency: "monthly", priority: 0.5 },

    { url: "/po-imeni/", changeFrequency: "monthly", priority: 0.8 },
    { url: "/znaki-zodiaka/", changeFrequency: "monthly", priority: 0.6 },

    { url: "/faq/", changeFrequency: "monthly", priority: 0.4 },
    { url: "/o-servise/", changeFrequency: "monthly", priority: 0.4 },
    { url: "/politika-konfidentsialnosti/", changeFrequency: "monthly", priority: 0.2 },
  ];

  for (const n of Object.keys(allMatrixArticles())) {
    entries.push({
      url: `/matrica-sudby-sovmestimost/arkany/${n}/`,
      changeFrequency: "monthly",
      priority: 0.6,
    });
  }

  for (const n of Object.keys(allLifePathArticles())) {
    entries.push({
      url: `/numerologiya-sovmestimost/chislo-zhiznennogo-puti/${n}/`,
      changeFrequency: "monthly",
      priority: 0.6,
    });
  }

  for (const key of Object.keys(allHDChannelArticles())) {
    entries.push({
      url: `/dizajn-cheloveka-sovmestimost/kanaly/${key}/`,
      changeFrequency: "monthly",
      priority: 0.5,
    });
  }

  for (const n of Object.keys(allJyotishNakshatraArticles())) {
    entries.push({
      url: `/dzhyotish-sovmestimost/nakshatry/${n}/`,
      changeFrequency: "monthly",
      priority: 0.5,
    });
  }

  for (const n of Object.keys(allNameNumberArticles())) {
    entries.push({ url: `/po-imeni/chislo-imeni/${n}/`, changeFrequency: "monthly", priority: 0.5 });
  }

  for (const m of PILOT_MALE_NAMES) {
    for (const f of PILOT_FEMALE_NAMES) {
      entries.push({
        url: `/po-imeni/${nameSlug(m)}-i-${nameSlug(f)}/`,
        changeFrequency: "monthly",
        priority: 0.4,
      });
    }
  }

  for (const slug of allZodiacPairSlugs()) {
    entries.push({ url: `/znaki-zodiaka/${slug}/`, changeFrequency: "monthly", priority: 0.4 });
  }

  return entries.map((e) => ({ url: `${SITE_URL}${e.url}`, changeFrequency: e.changeFrequency, priority: e.priority }));
}
