import { getArcanumInfo, zoneCharacter, ZONE_TITLES, type ZoneKey } from "@/lib/engines/matrix";
import { getMatrixArticle } from "./articles";
import { ARCANUM_ASTRO } from "./matrix-arcana-astro";
import { ARCANUM_GLYPHS } from "./matrix-arcana-glyphs";
import type { FaqItem } from "@/components/content/HubDepth";

/**
 * Частые вопросы к странице аркана.
 *
 * Зачем отдельно от раздела «О чём поговорить вдвоём». Тот раздел даёт паре
 * вопросы для разговора и намеренно оставляет их без ответов. Здесь наоборот:
 * вопросы, которые задаёт ЧИТАТЕЛЬ, и короткие самодостаточные ответы на них.
 * Это разные жанры, и второго на страницах не было.
 *
 * Почему это важно помимо удобства. Нейроответы Алисы и AI-обзоры Google
 * отбирают источники по способности выдать готовый фрагмент: заголовок-вопрос
 * плюс ответ, который не разваливается, если вырвать его из страницы. Поэтому
 * в каждом ответе аркан назван по имени и номеру — фрагмент остаётся понятным
 * сам по себе.
 *
 * Ответы не сочиняются: они собираются из того, что уже посчитано движком и
 * написано в текстах — капсулы статьи, реальных оценок по пяти зонам из
 * compatibility_zones.json, астрологического соответствия и аккорда глифов.
 * Поэтому у каждого из 22 арканов ответы свои, а не шаблон с подстановкой имени.
 */

const ZONE_KEYS: ZoneKey[] = ["love", "money", "kids", "purpose", "center"];

/** Перечисление через запятую с «и» перед последним. */
function listRu(items: string[]): string {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0];
  return `${items.slice(0, -1).join(", ")} и ${items[items.length - 1]}`;
}

/** «в зоне X» при одной зоне и «в зонах X, Y» при нескольких. */
function inZones(items: string[]): string {
  return `${items.length === 1 ? "в зоне" : "в зонах"} ${listRu(items)}`;
}

function zonesAnswer(n: number, label: string, labelMid: string): string {
  const harmonic: string[] = [];
  const tense: string[] = [];
  const neutral: string[] = [];

  for (const z of ZONE_KEYS) {
    const c = zoneCharacter(z, n);
    const title = `«${ZONE_TITLES[z]}»`;
    if (c === "harmonic") harmonic.push(title);
    else if (c === "tense") tense.push(title);
    else neutral.push(title);
  }

  // Случай «нейтрален везде» строится отдельным предложением: подлежащее в нём
  // не аркан, а формула, и в общий шаблон «<Аркан> <сказуемое>» он не ложится.
  if (neutral.length === 5) {
    return (
      `Формула не относит ${labelMid} ни к гармоничным, ни к напряжённым ни в одной из пяти зон союза. ` +
      `Это значит, что направление здесь задаёте вы вдвоём, а не расклад.`
    );
  }

  const parts: string[] = [];
  if (harmonic.length) parts.push(`легко работает ${inZones(harmonic)}`);
  if (tense.length) parts.push(`даёт напряжение ${inZones(tense)}`);
  if (neutral.length) parts.push(`${inZones(neutral)} направления не задаёт`);
  // Части соединяем точкой с запятой, а не союзом: через «и» получалось
  // «работает в зонах A, B и C и в зонах D и E направления не задаёт».

  const tail =
    tense.length > 0
      ? " Напряжённая зона — не поломка, а место, где качество придётся включать осознанно."
      : " Там, где направления нет, его определяют ваши договорённости, а не аркан.";

  return `${label} ${parts.join("; ")}.${tail}`;
}

export function arcanumFaq(n: number): FaqItem[] {
  const info = getArcanumInfo(n);
  const label = `Аркан ${n} «${info.name}»`;
  // Тот же ярлык со строчной буквы в начале — для середины вопроса.
  // Через label.toLowerCase() имя аркана превращалось во «влюблённые».
  const labelMid = `аркан ${n} «${info.name}»`;
  const article = getMatrixArticle(n);
  const astro = ARCANUM_ASTRO[n];
  const glyphs = ARCANUM_GLYPHS[n];

  const items: FaqItem[] = [];

  if (article?.capsule) {
    items.push({
      q: `Что означает ${labelMid} в матрице совместимости пары?`,
      a: article.capsule.replace(/\*\*/g, ""),
    });
  }

  items.push({
    q: `В каких зонах союза ${labelMid} помогает, а в каких мешает?`,
    a: zonesAnswer(n, label, labelMid),
  });

  items.push({
    q: `${label} — это плохой аркан для отношений?`,
    a:
      `Плохих арканов в Матрице судьбы нет: формула оценивает не карту саму по себе, а её сочетание с конкретной зоной союза. ` +
      `${label} — про ${info.theme}; в паре это ${info.inPair}. ` +
      `Собранный целиком, он звучит как ${glyphs ? glyphs.chord : "качество, которое усиливает и светлую, и теневую сторону пары"}.`,
  });

  if (astro) {
    const what =
      astro.kind === "sign"
        ? `знаку ${astro.value}`
        : astro.kind === "planet"
          ? `планете ${astro.value}`
          : `стихии ${astro.value}`;
    // Вопрос строим так, чтобы «аркан» всегда оставался подлежащим в именительном:
    // «Какой планете соответствует аркан 22», а не «Какая планета соответствует аркан 22».
    const asked =
      astro.kind === "sign" ? "Какому знаку зодиака" : astro.kind === "planet" ? "Какой планете" : "Какой стихии";
    items.push({
      q: `${asked} соответствует ${labelMid}?`,
      a: `В классической системе соответствий ${labelMid} отвечает ${what}. ${astro.text}`,
    });
  }

  return items;
}
