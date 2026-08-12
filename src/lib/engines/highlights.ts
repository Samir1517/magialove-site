/**
 * Агрегирующий слой поверх 4 систем для «пирамиды» подачи результата:
 * вердикт → самая сильная нить → сильные стороны → зоны роста → детали.
 *
 * МЕТОДИКА (интерпретационные решения, как и в synthesis.ts):
 * - «Фактор» — уже посчитанный движком под-балл (зона матрицы, линия
 *   психоматрицы, кута и т.д.), приведённый к 0-100. Новых формул нет —
 *   только сбор существующих под-баллов в один сортируемый список.
 * - «Архетип пары» — именованный тип связи по сильнейшей кросс-теме
 *   (или сильнейшему фактору, если время рождения не введено). У каждого
 *   архетипа есть свет и тень (ARCHITECTURE.md §5: нет нейтральных качеств).
 * - «Роли пары» — реализация core/config/role_distribution.json: роль
 *   отдаётся тому, у кого больше сигналов по 2+ системам. Сигналы из
 *   спека, привязка к полям движков задокументирована построчно.
 */

import type { MatrixRawFeatures, ZoneKey } from "./matrix";
import { zoneWeight, ZONE_TITLES, getArcanumInfo } from "./matrix";
import type { NumerologyRawFeatures, PsychomatrixLineKey } from "./numerology";
import { LINE_TITLES } from "./numerology";
import { LINE_READINGS, diffBand } from "@/lib/content/numerology";
import type { HumanDesignRawFeatures } from "./human_design";
import type { JyotishRawFeatures } from "./jyotish";
import type { SystemReport } from "./types";
import type { ThemeResult, ThemeKey } from "./synthesis";

// ---------------------------------------------------------------------------
// Факторы: единый список под-баллов всех доступных систем
// ---------------------------------------------------------------------------

export type FactorSystem = "matrix" | "numerology" | "human_design" | "jyotish";

export const FACTOR_SYSTEM_NAMES: Record<FactorSystem, string> = {
  matrix: "Матрица судьбы",
  numerology: "Нумерология",
  human_design: "Дизайн человека",
  jyotish: "Джйотиш",
};

export interface PairFactor {
  system: FactorSystem;
  /** Короткое название фактора («Зона „Любовь“», «Линия семьи»…). */
  label: string;
  /** 0-100. */
  score: number;
  /** Одно предложение: почему фактор силён/слаб именно у этой пары. */
  note: string;
}

const KUTA_TITLES: Record<string, string> = {
  varna: "Варна — уважение",
  vashya: "Вашья — взаимное влияние",
  tara: "Тара — благополучие",
  yoni: "Йони — физическая близость",
  graha_maitri: "Граха Майтри — дружба умов",
  gana: "Гана — темперамент",
  bhakoot: "Бхакут — быт и финансы",
  nadi: "Нади — здоровье и потомство",
};

/** Русское склонение числительных: «1 канал», «2 канала», «5 каналов». */
function plural(n: number, one: string, few: string, many: string): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
}

/** Первое предложение разбора: в сводку нужна суть, а не весь абзац. */
function firstSentence(text: string): string {
  const end = text.search(/[.!?](\s|$)/);
  return end === -1 ? text : text.slice(0, end + 1);
}

export function collectPairFactors(
  matrix: SystemReport<MatrixRawFeatures>,
  numerology: SystemReport<NumerologyRawFeatures>,
  hd: SystemReport<HumanDesignRawFeatures> | null,
  jyotish: SystemReport<JyotishRawFeatures> | null
): PairFactor[] {
  const factors: PairFactor[] = [];

  // Матрица: 5 зон, вес зоны 0..1 → 0-100 (та же шкала, что в MatrixSection).
  const zoneKeys = Object.keys(ZONE_TITLES) as ZoneKey[];
  for (const zone of zoneKeys) {
    const arcanum = matrix.rawFeatures.pairArcana[zone];
    const info = getArcanumInfo(arcanum);
    factors.push({
      system: "matrix",
      label: `Зона «${ZONE_TITLES[zone]}»`,
      score: zoneWeight(zone, arcanum) * 100,
      note: `Аркан «${info.name}» — ${info.theme.toLowerCase()}`,
    });
  }

  // Нумерология: 8 линий психоматрицы (lineScores уже 0-100).
  const lineKeys = Object.keys(LINE_TITLES) as PsychomatrixLineKey[];
  for (const line of lineKeys) {
    const diff = numerology.rawFeatures.lineDiffs[line];
    factors.push({
      system: "numerology",
      label: LINE_TITLES[line],
      score: numerology.rawFeatures.lineScores[line],
      // Берём разбор конкретной линии, а не общую фразу на весь диапазон:
      // у большинства пар пять-шесть линий из восьми попадают в один и тот же
      // диапазон, и общая формулировка шла подряд несколькими одинаковыми
      // строками — сводка выглядела как незаполненный шаблон.
      note: firstSentence(LINE_READINGS[line][diffBand(diff)]),
    });
  }

  // ДЧ: два фактора с понятной пар-семантикой (как в synthesis.ts).
  if (hd) {
    const em = hd.rawFeatures.connections.electromagnetic.length;
    factors.push({
      system: "human_design",
      label: "Электромагнитное притяжение",
      score: em > 0 ? 85 : 40,
      note:
        em > 0
          ? `${em} ${plural(em, "электромагнитный канал", "электромагнитных канала", "электромагнитных каналов")}: качество, которое есть только у вас вдвоём`
          : "нет электромагнитных каналов — связь держится на другом, не на «химии»",
    });
    const sameAuthority = hd.rawFeatures.a.authority === hd.rawFeatures.b.authority;
    factors.push({
      system: "human_design",
      label: "Ритм принятия решений",
      score: sameAuthority ? 90 : 40,
      note: sameAuthority
        ? "одинаковый Авторитет — решения зреют в одном темпе"
        : "разные Авторитеты — разный темп решений, его придётся уважать",
    });
  }

  // Джйотиш: 8 кут, нормированных к 0-100.
  if (jyotish) {
    for (const [key, title] of Object.entries(KUTA_TITLES)) {
      const kuta = jyotish.rawFeatures.gunaMilan.kutas[key];
      if (!kuta) continue;
      factors.push({
        system: "jyotish",
        label: title,
        score: (kuta.score / kuta.max) * 100,
        note: `${kuta.score} из ${kuta.max} ${plural(kuta.max, "балла", "баллов", "баллов")} Аштакуты`,
      });
    }
  }

  return factors;
}

export interface PairHighlights {
  /** Самый сильный фактор пары — эмоциональный якорь первого экрана. */
  strongest: PairFactor;
  /** До 3 сильных сторон (≥70), из разных систем, без strongest. */
  strengths: PairFactor[];
  /** До 3 зон роста (≤45), из разных систем. */
  growth: PairFactor[];
}

/** Отбирает по одному лучшему фактору с системы, чтобы список был разнообразным. */
function diversePick(sorted: PairFactor[], limit: number): PairFactor[] {
  const bySystem = new Map<FactorSystem, PairFactor>();
  for (const f of sorted) {
    if (!bySystem.has(f.system)) bySystem.set(f.system, f);
    if (bySystem.size >= limit) break;
  }
  const picked = [...bySystem.values()];
  // Добираем оставшиеся места лучшими из непопавших, если систем меньше лимита.
  for (const f of sorted) {
    if (picked.length >= limit) break;
    if (!picked.includes(f)) picked.push(f);
  }
  return picked.slice(0, limit);
}

export function calcPairHighlights(factors: PairFactor[]): PairHighlights {
  const desc = [...factors].sort((x, y) => y.score - x.score);
  const strongest = desc[0];
  const strengths = diversePick(
    desc.filter((f) => f !== strongest && f.score >= 70),
    3
  );
  const growth = diversePick(
    [...factors].filter((f) => f.score <= 45).sort((x, y) => x.score - y.score),
    3
  );
  return { strongest, strengths, growth };
}

// ---------------------------------------------------------------------------
// Архетип пары: именованный тип связи со светом и тенью
// ---------------------------------------------------------------------------

export interface PairArchetype {
  name: string;
  motto: string;
  light: string;
  shadow: string;
}

/** Два имени на тему: для пар с высоким общим баллом и для остальных. */
const THEME_ARCHETYPES: Record<ThemeKey, { high: PairArchetype; mid: PairArchetype }> = {
  emotional_intimacy: {
    high: {
      name: "Зеркальные души",
      motto: "Вы понимаете друг друга без слов — и это ваша главная валюта.",
      light: "Глубокое чувство «меня видят и принимают» — редкий фундамент близости.",
      shadow: "Слияние без границ: легко забыть, где заканчиваешься ты и начинается он.",
    },
    mid: {
      name: "Тихая гавань",
      motto: "Ваша сила — в спокойном принятии, а не в буре чувств.",
      light: "Рядом друг с другом можно не играть роль — и это лечит.",
      shadow: "Спокойствие может незаметно перейти в отдалённость, если не подпитывать близость.",
    },
  },
  passion_sex: {
    high: {
      name: "Пламя и искра",
      motto: "Между вами — то самое притяжение, которое не объяснить логикой.",
      light: "Физическая и энергетическая химия, которая долго не выгорает.",
      shadow: "Страсть умеет вспыхивать и в ссорах: тот же огонь, только направленный друг против друга.",
    },
    mid: {
      name: "Медленный огонь",
      motto: "Ваше притяжение разгорается со временем — и потому держится дольше.",
      light: "Чувственность растёт из доверия: чем безопаснее, тем жарче.",
      shadow: "Без осознанного внимания огонь может тлеть слишком тихо — быт затушит.",
    },
  },
  money_resources: {
    high: {
      name: "Созидатели общего",
      motto: "Вы умеете строить вдвоём то, что каждому в одиночку не под силу.",
      light: "Деньги и ресурсы в этой паре — источник опоры, а не конфликтов.",
      shadow: "Риск мерить союз результатами: «что мы построили» вместо «что мы чувствуем».",
    },
    mid: {
      name: "Строители фундамента",
      motto: "Ваш союз крепнет через общие дела и общие планы.",
      light: "Практичность обоих превращает мечты в конкретные шаги.",
      shadow: "Разные денежные привычки требуют честного разговора — иначе копится счёт обид.",
    },
  },
  family_kids: {
    high: {
      name: "Хранители очага",
      motto: "Ваша пара создана для дома, в который хочется возвращаться.",
      light: "Естественное чувство «мы — семья», которое не нужно выстраивать искусственно.",
      shadow: "Растворение в роли родителей и хозяев — легко потерять пару внутри семьи.",
    },
    mid: {
      name: "Сад, который растёт",
      motto: "Ваше общее — не данность, а то, что вы бережно выращиваете.",
      light: "Осознанный подход к семье: вы строите её по-своему, а не по шаблону.",
      shadow: "Разные представления о «правильном доме» будут требовать переговоров.",
    },
  },
  values_worldview: {
    high: {
      name: "Попутчики по смыслу",
      motto: "Вы смотрите в одну сторону — и потому вам по пути надолго.",
      light: "Общие ценности выдерживают то, что рушит пары с одной лишь страстью.",
      shadow: "Единомыслие может стать эхо-камерой: рост требует и несогласия.",
    },
    mid: {
      name: "Два компаса",
      motto: "У каждого — свой ориентир, и в этом сила, если уметь слушать.",
      light: "Разные взгляды расширяют картину мира обоих — вы учите друг друга.",
      shadow: "В кризисы разница ориентиров превращается в спор «кто прав» вместо «как нам».",
    },
  },
  decision_rhythm: {
    high: {
      name: "Союз в одном ритме",
      motto: "Вы решаете и живёте в одном темпе — редкая и недооценённая удача.",
      light: "Меньше трения в быту: не нужно постоянно подстраивать скорость.",
      shadow: "Одинаковый ритм — одинаковые слепые зоны: некому притормозить или подтолкнуть.",
    },
    mid: {
      name: "Танец в контртакте",
      motto: "Ваши ритмы разные — и из этого может получиться танец, а не спотыкание.",
      light: "Один даёт импульс, другой — выдержку: вместе решения точнее.",
      shadow: "Нетерпение быстрого и упрямство медленного — главный источник ваших ссор.",
    },
  },
};

/** Маппинг фактора (когда нет кросс-тем) к тем же 6 темам архетипов. */
const ZONE_TO_THEME: Record<ZoneKey, ThemeKey> = {
  love: "emotional_intimacy",
  money: "money_resources",
  kids: "family_kids",
  purpose: "values_worldview",
  center: "decision_rhythm",
};

const LINE_TO_THEME: Record<PsychomatrixLineKey, ThemeKey> = {
  will: "decision_rhythm",
  family: "family_kids",
  stability: "money_resources",
  talent: "values_worldview",
  selfworth: "emotional_intimacy",
  goal: "values_worldview",
  temperament: "passion_sex",
  spirit: "values_worldview",
};

export function calcPairArchetype(
  overall: number,
  crossThemes: ThemeResult[] | null,
  matrix: SystemReport<MatrixRawFeatures>,
  numerology: SystemReport<NumerologyRawFeatures>
): PairArchetype {
  let themeKey: ThemeKey;

  if (crossThemes && crossThemes.length > 0) {
    // Полные данные: сильнейшая кросс-тема из всех 4 систем.
    themeKey = [...crossThemes].sort((x, y) => y.avg - x.avg)[0].key;
  } else {
    // Только даты: сильнейший фактор из матрицы и нумерологии.
    const zoneKeys = Object.keys(ZONE_TITLES) as ZoneKey[];
    let best: { theme: ThemeKey; score: number } = { theme: "emotional_intimacy", score: -1 };
    for (const zone of zoneKeys) {
      const s = zoneWeight(zone, matrix.rawFeatures.pairArcana[zone]) * 100;
      if (s > best.score) best = { theme: ZONE_TO_THEME[zone], score: s };
    }
    for (const line of Object.keys(LINE_TO_THEME) as PsychomatrixLineKey[]) {
      const s = numerology.rawFeatures.lineScores[line];
      if (s > best.score) best = { theme: LINE_TO_THEME[line], score: s };
    }
    themeKey = best.theme;
  }

  const tier = overall >= 65 ? "high" : "mid";
  return THEME_ARCHETYPES[themeKey][tier];
}

// ---------------------------------------------------------------------------
// Роли пары (core/config/role_distribution.json)
// ---------------------------------------------------------------------------

export interface RoleAssignment {
  key: string;
  title: string;
  about: string;
  /** Кому роль ближе: "a" | "b" | "both" | "gap". */
  holder: "a" | "b" | "both" | "gap";
}

interface RoleSpec {
  key: string;
  title: string;
  about: string;
  /** Сигналы по спеку role_distribution.json, привязанные к полям движков. */
  score: (p: PersonSignals) => number;
}

interface PersonSignals {
  arcana: Set<number>;
  lifePath: number;
  hdType: string | null;
  hdAuthority: string | null;
  hdProfile: string | null;
}

/**
 * Считаем сигналы по спеку. Каждое правило — прямая транскрипция строки
 * "signals" из role_distribution.json; сигналы, требующие парных данных
 * (кута, каналы композита), в индивидуальный подсчёт не входят.
 */
const ROLE_SPECS: RoleSpec[] = [
  {
    key: "strategist",
    title: "Стратег-визионер",
    about: "задаёт направление и большие цели",
    score: (p) =>
      Number(p.arcana.has(1) || p.arcana.has(4) || p.arcana.has(7)) +
      Number(p.lifePath === 1 || p.lifePath === 8) +
      Number(p.hdType === "Манифестор" || p.hdType === "Проектор"),
  },
  {
    key: "keeper",
    title: "Хранитель очага",
    about: "тепло, быт, эмоциональный климат",
    score: (p) =>
      Number(p.arcana.has(3) || p.arcana.has(6)) +
      Number(p.lifePath === 2 || p.lifePath === 6),
  },
  {
    key: "motor",
    title: "Мотор-исполнитель",
    about: "энергия и воплощение задуманного",
    score: (p) =>
      Number(p.lifePath === 1 || p.lifePath === 5) +
      Number(p.hdType === "Генератор" || p.hdType === "Манифестирующий генератор") +
      Number(p.arcana.has(7) || p.arcana.has(19)),
  },
  {
    key: "diplomat",
    title: "Дипломат-миротворец",
    about: "сглаживает конфликты, держит баланс",
    score: (p) =>
      Number(p.arcana.has(2) || p.arcana.has(14)) +
      Number(p.lifePath === 2 || p.lifePath === 9) +
      Number(p.hdAuthority === "Эмоциональный"),
  },
  {
    key: "provider",
    title: "Добытчик ресурсов",
    about: "деньги, статус, материальная опора",
    score: (p) =>
      Number(p.arcana.has(4) || p.arcana.has(8)) +
      Number(p.lifePath === 4 || p.lifePath === 8),
  },
  {
    key: "muse",
    title: "Вдохновитель-творец",
    about: "идеи, творчество, смыслы, праздник",
    score: (p) =>
      Number(p.arcana.has(17) || p.arcana.has(19)) +
      Number(p.lifePath === 3) +
      Number(Boolean(p.hdProfile && (p.hdProfile.includes("5") || p.hdProfile.includes("3")))),
  },
];

export function calcPairRoles(
  matrix: SystemReport<MatrixRawFeatures>,
  numerology: SystemReport<NumerologyRawFeatures>,
  hd: SystemReport<HumanDesignRawFeatures> | null
): RoleAssignment[] {
  const mkSignals = (who: "a" | "b"): PersonSignals => ({
    arcana: new Set(Object.values(matrix.rawFeatures[who === "a" ? "aMatrix" : "bMatrix"])),
    lifePath: numerology.rawFeatures[who === "a" ? "aLifePath" : "bLifePath"],
    hdType: hd ? hd.rawFeatures[who].type : null,
    hdAuthority: hd ? hd.rawFeatures[who].authority : null,
    hdProfile: hd ? hd.rawFeatures[who].profile : null,
  });

  const a = mkSignals("a");
  const b = mkSignals("b");

  const scored = ROLE_SPECS.map((spec) => ({
    spec,
    aScore: spec.score(a),
    bScore: spec.score(b),
  }));

  const result: RoleAssignment[] = [];

  // Общая роль первой: оба сильны (≥2 сигналов у каждого) — по спеку «делить
  // по сферам». Из индивидуального распределения она исключается, чтобы одна
  // и та же роль не появлялась дважды («Анна — стратег» и «Вы оба — стратеги»).
  const shared = scored.find((r) => r.aScore >= 2 && r.bScore >= 2) ?? null;

  const individual = scored.filter((r) => r !== shared);
  const sortedForA = [...individual].sort((x, y) => y.aScore - x.aScore);
  const aBest = sortedForA[0] && sortedForA[0].aScore > 0 ? sortedForA[0] : null;
  const sortedForB = [...individual].sort((x, y) => y.bScore - x.bScore);
  const bBest = sortedForB.find((r) => r !== aBest && r.bScore > 0) ?? null;

  if (aBest) result.push({ key: aBest.spec.key, title: aBest.spec.title, about: aBest.spec.about, holder: "a" });
  if (bBest) result.push({ key: bBest.spec.key, title: bBest.spec.title, about: bBest.spec.about, holder: "b" });
  if (shared) result.push({ key: shared.spec.key, title: shared.spec.title, about: shared.spec.about, holder: "both" });

  // Провисающая роль: ни у кого ни одного сигнала — «зона делегирования вовне».
  const gap = scored.find((r) => r.aScore === 0 && r.bScore === 0);
  if (gap) result.push({ key: gap.spec.key, title: gap.spec.title, about: gap.spec.about, holder: "gap" });

  return result;
}
