import { getJyotishNakshatraArticle } from "./articles";
import {
  NAKSHATRA_FACTS,
  GANA_MEANING,
  NADI_MEANING,
  nakshatraRow,
  sameGana,
  sameYoni,
} from "./nakshatra-facts";
import type { FaqItem } from "@/components/content/HubDepth";

/**
 * Частые вопросы к странице накшатры — по тому же принципу, что у арканов.
 *
 * Ответы собираются из данных (нади, раши, гана, йони, управитель) и капсулы
 * статьи, поэтому у каждой из 27 накшатр они свои, а не шаблон с подставленным
 * именем. Каждый ответ самодостаточен: накшатра названа внутри ответа, и
 * фрагмент остаётся понятным, если вырвать его из страницы — так его берут
 * нейроответы Алисы и AI-обзоры.
 */

function listRu(items: string[]): string {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0];
  return `${items.slice(0, -1).join(", ")} и ${items[items.length - 1]}`;
}

function nameOf(n: number): string {
  return nakshatraRow(n)?.name ?? String(n);
}

export function nakshatraFaq(n: number): FaqItem[] {
  const row = nakshatraRow(n);
  const facts = NAKSHATRA_FACTS[n];
  if (!row || !facts) return [];

  const article = getJyotishNakshatraArticle(n);
  const gana = GANA_MEANING[facts.gana];
  const items: FaqItem[] = [];

  if (article?.capsule) {
    items.push({
      q: `Что означает накшатра ${row.name} в совместимости пары?`,
      a: article.capsule.replace(/\*\*/g, ""),
    });
  }

  items.push({
    q: `Какая планета управляет накшатрой ${row.name}?`,
    a:
      `Накшатрой ${row.name} управляет ${facts.planet}. Той же планете подчинены ещё две лунные стоянки — ` +
      `${listRu(
        Object.entries(NAKSHATRA_FACTS)
          .filter(([k, v]) => Number(k) !== n && v.planet === facts.planet)
          .map(([k]) => nameOf(Number(k)))
      )}: все три открывают один и тот же период жизни, который в Джйотиш называют дашей. ` +
      // Раши бывает пограничным и хранится как «Стрелец/Козерог» — в тексте
      // слэш читается как опечатка, поэтому разворачиваем в оборот.
      `Лежит ${row.name} ${
        row.rashi.includes("/")
          ? `на границе знаков ${row.rashi.split("/").map((s) => s.trim()).join(" и ")}`
          : `в знаке ${row.rashi}`
      }, символ накшатры — ${facts.symbol}, божество — ${facts.deity}.`,
  });

  items.push({
    q: `Какая гана у накшатры ${row.name} и с кем будет сложнее?`,
    a:
      `У ${row.name} гана ${facts.gana}, то есть ${gana.label}. ${gana.text} ` +
      `Труднее всего традиция считает сочетание божественной ганы с демонической: один партнёр сглаживает, ` +
      `второй говорит прямо, и каждый принимает манеру другого за отношение к себе. ` +
      `Тот же темперамент несут ещё восемь накшатр, среди них ${listRu(sameGana(n).slice(0, 3).map(nameOf))}.`,
  });

  const sameY = sameYoni(n).map(nameOf);
  items.push({
    q: `Что значит йони ${facts.yoni.toLowerCase()} у накшатры ${row.name}?`,
    a:
      `Йони — животное-символ накшатры, которым в Гуна-милане измеряют телесную совместимость: до 4 баллов из 36. ` +
      `У ${row.name} это ${facts.yoni.toLowerCase()}, символ ${facts.yoniSex === "м" ? "мужской" : "женский"}. ` +
      (sameY.length
        ? `То же животное стоит за накшатрой ${listRu(sameY)} — с ней совпадение по этому параметру максимальное. `
        : `Это единственная накшатра с таким животным, полного совпадения по йони у неё не бывает ни с кем. `) +
      `Разные йони не означают несовместимость: они означают разный темп близости, о котором паре придётся договариваться словами.`,
  });

  items.push({
    q: `Накшатра ${row.name} — плохая для брака?`,
    a:
      `Плохих накшатр в Джйотиш нет: Гуна-милан оценивает не стоянку саму по себе, а её сочетание со стоянкой партнёра. ` +
      `${row.name} относится к нади ${row.nadi} — это ${NADI_MEANING[row.nadi] ?? "одна из трёх групп"}. ` +
      `Именно нади весит больше всего, 8 баллов из 36, и совпадение здесь считается минусом, а не плюсом: ` +
      `два партнёра одного склада остаются без того, кто уравновесит. Поэтому одна и та же накшатра в одной паре ` +
      `добавляет баллы, а в другой их снимает.`,
  });

  return items;
}
