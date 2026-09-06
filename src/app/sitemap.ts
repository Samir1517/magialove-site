import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site-config";
import {
  allMatrixArticles,
  allLifePathArticles,
  allNameNumberArticles,
  allHDChannelArticles,
  allHDProfileArticles,
  allJyotishNakshatraArticles,
  profileSlug,
} from "@/lib/content/articles";
import { PILOT_MALE_NAMES, PILOT_FEMALE_NAMES, nameSlug } from "@/lib/data/name-popularity";
import { allZodiacPairSlugs } from "@/app/znaki-zodiaka/[pair]/page";

export const dynamic = "force-static";

/**
 * Даты последней содержательной переработки разделов — уходят в <lastmod>.
 *
 * Зачем понадобилось. До 6 сентября 2026 sitemap отдавался без lastmod вообще.
 * Робот не мог отличить переписанную страницу от нетронутой и перечитывал карту
 * раз в неделю-полторы: 2 сентября Яндекс исключил 228 страниц как малоценные,
 * зодиак и накшатры к 6 сентября переписали — а карта об этом молчала, и
 * единственным способом позвать робота осталась ручная квота переобхода
 * (150 URL в сутки). lastmod возвращает этот сигнал в автоматический режим.
 *
 * Даты проставлены руками по коммитам, а не через new Date(). Сборка идёт при
 * каждом пуше, в том числе когда меняется вёрстка или пара строк в шапке;
 * new Date() выставил бы всем 294 страницам свежую дату при любой такой сборке.
 * Робот сверяет lastmod с тем, что реально нашёл на странице, и раздача заведомо
 * ложных дат обесценивает сигнал целиком — второй раз ему уже не поверят.
 *
 * ПРАВИЛО ПРИ ПРАВКАХ: дату двигаем, когда переписан текст раздела, а не когда
 * поменялись стили, разметка или общие компоненты.
 */
const REWRITTEN = {
  /** Синастрия, аспекты, управители, разборы по сферам и FAQ — коммит d5ddad8. */
  zodiac: "2026-09-06",
  /** Фактура, FAQ и перелинковка вместо шаблона — коммит 1687214. */
  nakshatry: "2026-09-06",
  /** Центр матрицы и три новые страницы — коммиты 239f888, 8da153e. */
  matrix: "2026-08-26",
  /** Связывание контентных кластеров, 263 статьи — коммит 2769bf4. */
  articles: "2026-08-25",
  /** Оферта и тарифы — коммит f84801e. С тех пор не менялись. */
  legal: "2026-08-19",
} as const;

type Entry = {
  url: string;
  changeFrequency: "weekly" | "monthly";
  priority: number;
  /** Опущено — значит раздел последний раз трогали общей правкой статей. */
  lastModified?: string;
};

/**
 * Статический sitemap. Страницы-результаты (*rezultat*) и главная страница результата
 * намеренно не включены — без query-параметров они показывают заглушку «нет данных для
 * расчёта», индексировать нечего. /kontakty/ тоже не включена (пока не готова к публикации).
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const entries: Entry[] = [
    { url: "/", changeFrequency: "weekly", priority: 1 },

    { url: "/po-date-rozhdeniya/", changeFrequency: "monthly", priority: 0.9 },
    { url: "/matrica-sudby-sovmestimost/", changeFrequency: "monthly", priority: 0.9, lastModified: REWRITTEN.matrix },
    { url: "/matrica-sudby-sovmestimost/arkany/", changeFrequency: "monthly", priority: 0.8, lastModified: REWRITTEN.matrix },
    { url: "/matrica-sudby-sovmestimost/centr/", changeFrequency: "monthly", priority: 0.7, lastModified: REWRITTEN.matrix },
    { url: "/matrica-sudby-sovmestimost/kak-schitaem/", changeFrequency: "monthly", priority: 0.6, lastModified: REWRITTEN.matrix },
    { url: "/matrica-sudby-sovmestimost/karta/", changeFrequency: "monthly", priority: 0.5, lastModified: REWRITTEN.matrix },
    { url: "/numerologiya-sovmestimost/", changeFrequency: "monthly", priority: 0.9 },
    { url: "/numerologiya-sovmestimost/psihomatritsa/", changeFrequency: "monthly", priority: 0.7 },
    { url: "/numerologiya-sovmestimost/karta/", changeFrequency: "monthly", priority: 0.5 },
    { url: "/dizajn-cheloveka-sovmestimost/", changeFrequency: "monthly", priority: 0.9 },
    { url: "/dizajn-cheloveka-sovmestimost/tipy/", changeFrequency: "monthly", priority: 0.7 },
    { url: "/dizajn-cheloveka-sovmestimost/avtoritety/", changeFrequency: "monthly", priority: 0.7 },
    { url: "/dizajn-cheloveka-sovmestimost/kanaly-svyazi/", changeFrequency: "monthly", priority: 0.7 },
    { url: "/dizajn-cheloveka-sovmestimost/kak-schitaem/", changeFrequency: "monthly", priority: 0.7 },
    { url: "/dzhyotish-sovmestimost/kak-schitaem/", changeFrequency: "monthly", priority: 0.7 },
    { url: "/dizajn-cheloveka-sovmestimost/kanaly/", changeFrequency: "monthly", priority: 0.7 },
    { url: "/dizajn-cheloveka-sovmestimost/profili/", changeFrequency: "monthly", priority: 0.7 },
    { url: "/dizajn-cheloveka-sovmestimost/karta/", changeFrequency: "monthly", priority: 0.5 },
    { url: "/dzhyotish-sovmestimost/", changeFrequency: "monthly", priority: 0.9 },
    { url: "/dzhyotish-sovmestimost/8-kut/", changeFrequency: "monthly", priority: 0.7 },
    { url: "/dzhyotish-sovmestimost/doshi/", changeFrequency: "monthly", priority: 0.7 },
    { url: "/dzhyotish-sovmestimost/nakshatry/", changeFrequency: "monthly", priority: 0.7, lastModified: REWRITTEN.nakshatry },
    { url: "/dzhyotish-sovmestimost/karta/", changeFrequency: "monthly", priority: 0.5 },

    { url: "/po-imeni/", changeFrequency: "monthly", priority: 0.8 },
    { url: "/znaki-zodiaka/", changeFrequency: "monthly", priority: 0.6, lastModified: REWRITTEN.zodiac },

    { url: "/faq/", changeFrequency: "monthly", priority: 0.4 },
    { url: "/o-servise/", changeFrequency: "monthly", priority: 0.4 },
    // Требование платёжного сервиса. Ссылка на неё стоит только на главной,
    // но в карте сайта нужна: страница должна быть находимой.
    { url: "/tarify/", changeFrequency: "monthly", priority: 0.3, lastModified: REWRITTEN.legal },
    // Оферта: ссылка в подвале на всех страницах, платёжный сервис требует
    // публичный адрес документа.
    { url: "/oferta/", changeFrequency: "monthly", priority: 0.2, lastModified: REWRITTEN.legal },
    { url: "/politika-konfidentsialnosti/", changeFrequency: "monthly", priority: 0.2, lastModified: REWRITTEN.legal },
  ];

  for (const n of Object.keys(allMatrixArticles())) {
    entries.push({
      url: `/matrica-sudby-sovmestimost/arkany/${n}/`,
      changeFrequency: "monthly",
      priority: 0.6,
      lastModified: REWRITTEN.matrix,
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

  for (const key of Object.keys(allHDProfileArticles())) {
    entries.push({
      url: `/dizajn-cheloveka-sovmestimost/profili/${profileSlug(key)}/`,
      changeFrequency: "monthly",
      priority: 0.6,
    });
  }

  for (const n of Object.keys(allJyotishNakshatraArticles())) {
    entries.push({
      url: `/dzhyotish-sovmestimost/nakshatry/${n}/`,
      changeFrequency: "monthly",
      priority: 0.5,
      lastModified: REWRITTEN.nakshatry,
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
    entries.push({
      url: `/znaki-zodiaka/${slug}/`,
      changeFrequency: "monthly",
      priority: 0.4,
      lastModified: REWRITTEN.zodiac,
    });
  }

  return entries.map((e) => ({
    url: `${SITE_URL}${e.url}`,
    changeFrequency: e.changeFrequency,
    priority: e.priority,
    lastModified: e.lastModified ?? REWRITTEN.articles,
  }));
}
