import { ZODIAC_SIGNS, type ZodiacSign } from "./zodiac";

/**
 * Работа со слагами пар знаков и смысловые связи между страницами зодиака.
 *
 * Раньше эта логика жила прямо в роуте `/znaki-zodiaka/[pair]/`, и её нельзя
 * было переиспользовать. Вынесено сюда, потому что связи между страницами
 * нужны и самому роуту, и хабу, и (через раши) страницам накшатр.
 *
 * Канонический порядок пары — по алфавиту русского названия: одна и та же
 * пара не должна существовать под двумя адресами.
 */

export function canonicalPair(a: ZodiacSign, b: ZodiacSign): [ZodiacSign, ZodiacSign] {
  return a.name <= b.name ? [a, b] : [b, a];
}

/** Адрес страницы пары (или одиночного знака, если знаки совпали). */
export function zodiacPairSlug(a: ZodiacSign, b: ZodiacSign): string {
  const [x, y] = canonicalPair(a, b);
  return x.key === y.key ? x.slug : `${x.slug}-${y.slug}`;
}

export function zodiacHref(a: ZodiacSign, b: ZodiacSign): string {
  return `/znaki-zodiaka/${zodiacPairSlug(a, b)}/`;
}

export function allZodiacPairSlugs(): string[] {
  const seen = new Set<string>();
  const slugs: string[] = [];
  for (const s1 of ZODIAC_SIGNS) {
    for (const s2 of ZODIAC_SIGNS) {
      const slug = zodiacPairSlug(s1, s2);
      if (seen.has(slug)) continue;
      seen.add(slug);
      slugs.push(slug);
    }
  }
  return slugs;
}

export function parseZodiacPairSlug(slug: string): [ZodiacSign, ZodiacSign] | null {
  for (const s1 of ZODIAC_SIGNS) {
    if (slug === s1.slug) return [s1, s1];
  }
  for (const s1 of ZODIAC_SIGNS) {
    for (const s2 of ZODIAC_SIGNS) {
      if (s1.key === s2.key) continue;
      if (slug === zodiacPairSlug(s1, s2)) return [canonicalPair(s1, s2)[0], canonicalPair(s1, s2)[1]];
    }
  }
  return null;
}

export function signByKey(key: string): ZodiacSign | undefined {
  return ZODIAC_SIGNS.find((s) => s.key === key);
}

/** Знаки той же стихии, кроме самого знака. */
export function sameElementSigns(sign: ZodiacSign): ZodiacSign[] {
  return ZODIAC_SIGNS.filter((s) => s.element === sign.element && s.key !== sign.key);
}

/** Все пары данного знака с остальными одиннадцатью. */
export function pairsOfSign(sign: ZodiacSign): { sign: ZodiacSign; href: string }[] {
  return ZODIAC_SIGNS.filter((s) => s.key !== sign.key).map((s) => ({
    sign: s,
    href: zodiacHref(sign, s),
  }));
}
