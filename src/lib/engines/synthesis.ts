/**
 * Слой синтеза: сводит 4 системы в один взвешенный балл (СИС) с вердиктом
 * и подсвечивает, где системы независимо сходятся или расходятся по теме.
 * Источник методики: kalkulator/service/core/synthesis/*.json + config/*.json
 * (скопированы в site/src/lib/data/core/, не редактируются руками).
 *
 * Веса и пороги вердикта — из готового core-спека проекта. Пер-темовые сигналы
 * (ниже) — НАША интерпретация: cross_system_themes.json описывает соответствия
 * неформально («числа 2,6,9», «арканы 1/4 vs 2/9») без точной формулы, поэтому
 * каждое сопоставление темы к уже посчитанному под-баллу системы задокументировано
 * построчно как решение, а не факт из первоисточника — как и остальные
 * интерпретационные решения движков (см. заголовки matrix.ts/human_design.ts).
 */

import type { MatrixRawFeatures } from "./matrix";
import { zoneWeight } from "./matrix";
import type { NumerologyRawFeatures } from "./numerology";
import type { HumanDesignRawFeatures } from "./human_design";
import type { JyotishRawFeatures } from "./jyotish";
import type { SystemReport } from "./types";

import weightsData from "../data/core/weights.json";
import verdictScaleData from "../data/core/verdict_scale.json";
import themesData from "../data/core/cross_system_themes.json";

// ---------------------------------------------------------------------------
// Взвешенный общий балл
// ---------------------------------------------------------------------------

type WeightProfile = Record<"matrix" | "numerology" | "human_design" | "jyotish", number>;

const PROFILES = (weightsData as { profiles: Record<string, WeightProfile & { note?: string }> }).profiles;

export interface SystemScores {
  matrix: number;
  numerology: number;
  human_design: number | null;
  jyotish: number | null;
}

/**
 * Взвешенное среднее по доступным системам. Если ДЧ/Джйотиш не посчитаны (нет
 * времени рождения), берём профиль "no_birth_time" и перенормируем его веса
 * так, чтобы сумма оставшихся двух была 1 — сам профиль в JSON оставляет 10%
 * "на будущее" под ДЧ/Джйотиш, которых здесь физически нет.
 */
export function calcWeightedScore(scores: SystemScores, context?: string): number {
  const hasFullSet = scores.human_design !== null && scores.jyotish !== null;
  const profileKey = hasFullSet ? context ?? "default" : "no_birth_time";
  const profile = PROFILES[profileKey] ?? PROFILES.default;

  const entries: [number, number][] = [[scores.matrix, profile.matrix], [scores.numerology, profile.numerology]];
  if (scores.human_design !== null) entries.push([scores.human_design, profile.human_design]);
  if (scores.jyotish !== null) entries.push([scores.jyotish, profile.jyotish]);

  const totalWeight = entries.reduce((s, [, w]) => s + w, 0);
  const weighted = entries.reduce((s, [score, w]) => s + score * w, 0);
  return Math.round((weighted / totalWeight) * 10) / 10;
}

export interface Verdict {
  label: string;
  hook: string;
}

export function getVerdict(score: number): Verdict {
  const bands = (verdictScaleData as { bands: { min: number; max: number; label: string; hook: string }[] }).bands;
  const band = bands.find((b) => score >= b.min && score <= b.max) ?? bands[bands.length - 1];
  return { label: band.label, hook: band.hook };
}

// ---------------------------------------------------------------------------
// Кросс-системные темы: где системы сходятся, а где расходятся
// ---------------------------------------------------------------------------

export type ThemeKey =
  | "emotional_intimacy" | "passion_sex" | "money_resources"
  | "family_kids" | "values_worldview" | "decision_rhythm";

interface ThemeSpec {
  key: ThemeKey;
  title: string;
  sources: Record<string, string>;
}

const THEMES = (themesData as { themes: ThemeSpec[] }).themes;

/** HD-каналы, явно упомянутые в спеке как сигнал темы (по ключу вида "26-44"). */
const HD_CHANNEL_HINTS: Record<ThemeKey, string[]> = {
  emotional_intimacy: ["6-59"],
  passion_sex: [],
  money_resources: ["26-44", "32-54"],
  family_kids: ["27-50", "6-59"],
  values_worldview: ["19-49"],
  decision_rhythm: [],
};

function hdChannelSignal(hd: HumanDesignRawFeatures, hints: string[]): number {
  if (hints.length === 0) return 50;
  const allKeys = [
    ...hd.connections.electromagnetic,
    ...hd.connections.companionship,
    ...hd.connections.dominance,
    ...hd.connections.compromise,
  ];
  return hints.some((h) => allKeys.includes(h)) ? 80 : 45;
}

/**
 * Сигнал 0-100 от каждой системы по теме — из уже посчитанных под-баллов
 * движков, не новые формулы. Смотри комментарии в каждой ветке за обоснованием
 * выбора конкретного под-балла.
 */
function themeSignals(
  key: ThemeKey,
  matrix: SystemReport<MatrixRawFeatures>,
  numerology: SystemReport<NumerologyRawFeatures>,
  hd: SystemReport<HumanDesignRawFeatures> | null,
  jyotish: SystemReport<JyotishRawFeatures> | null
): Partial<Record<"matrix" | "numerology" | "human_design" | "jyotish", number>> {
  const m = matrix.rawFeatures;
  const n = numerology.rawFeatures;
  const signals: Partial<Record<"matrix" | "numerology" | "human_design" | "jyotish", number>> = {};

  switch (key) {
    case "emotional_intimacy":
      // matrix: зона "любовь" — прямое совпадение с темой.
      signals.matrix = zoneWeight("love", m.pairArcana.love) * 100;
      // numerology: линии family (1-4-7) и selfworth (1-5-9) — ближайшие по
      // смыслу к «эмоциональной близости» из восьми линий психоматрицы.
      signals.numerology = (n.lineScores.family + n.lineScores.selfworth) / 2;
      if (hd) signals.human_design = hdChannelSignal(hd.rawFeatures, HD_CHANNEL_HINTS[key]);
      if (jyotish) {
        const kutas = jyotish.rawFeatures.gunaMilan.kutas;
        signals.jyotish = ((kutas.bhakoot.score / kutas.bhakoot.max) * 50 + (kutas.gana.score / kutas.gana.max) * 50);
      }
      break;

    case "passion_sex":
      // matrix: прямой зоны «страсть» нет — используем зону "дети" (в 5-зонной
      // модели проекта это зона творения/инстинктивного начала, ближайшая по
      // смыслу; явно интерпретация, не факт из ENGINE.md).
      signals.matrix = zoneWeight("kids", m.pairArcana.kids) * 100;
      // numerology: линия темперамента (4-5-6) — физическая/инстинктивная ось.
      signals.numerology = n.lineScores.temperament;
      if (hd) {
        const composite = hd.rawFeatures.connections.electromagnetic.length;
        signals.human_design = composite > 0 ? 85 : 40; // электромагнитный канал = классика "химии" в ДЧ
      }
      if (jyotish) {
        const yoni = jyotish.rawFeatures.gunaMilan.kutas.yoni;
        signals.jyotish = (yoni.score / yoni.max) * 100; // йони-кута = точное соответствие темы
      }
      break;

    case "money_resources":
      signals.matrix = zoneWeight("money", m.pairArcana.money) * 100; // зона "деньги" — прямое совпадение
      signals.numerology = n.lineScores.stability; // линия стабильности/быта (2-5-8)
      if (hd) signals.human_design = hdChannelSignal(hd.rawFeatures, HD_CHANNEL_HINTS[key]);
      if (jyotish) {
        const bhakoot = jyotish.rawFeatures.gunaMilan.kutas.bhakoot;
        signals.jyotish = (bhakoot.score / bhakoot.max) * 100; // бхакут явно проверяет «финансы» по data/kutas.json
      }
      break;

    case "family_kids":
      signals.matrix = zoneWeight("kids", m.pairArcana.kids) * 100; // зона "дети" — прямое совпадение
      signals.numerology = n.lineScores.family; // линия семьи (1-4-7) — прямое совпадение
      if (hd) signals.human_design = hdChannelSignal(hd.rawFeatures, HD_CHANNEL_HINTS[key]);
      if (jyotish) {
        const kutas = jyotish.rawFeatures.gunaMilan.kutas;
        signals.jyotish = ((kutas.nadi.score / kutas.nadi.max) * 50 + (kutas.bhakoot.score / kutas.bhakoot.max) * 50);
      }
      break;

    case "values_worldview":
      signals.matrix = zoneWeight("purpose", m.pairArcana.purpose) * 100; // зона "предназначение" — прямое совпадение
      signals.numerology = n.lineScores.spirit; // линия духовности/памяти (7-8-9)
      if (hd) signals.human_design = hdChannelSignal(hd.rawFeatures, HD_CHANNEL_HINTS[key]);
      if (jyotish) {
        const kutas = jyotish.rawFeatures.gunaMilan.kutas;
        signals.jyotish = ((kutas.varna.score / kutas.varna.max) * 50 + (kutas.graha_maitri.score / kutas.graha_maitri.max) * 50);
      }
      break;

    case "decision_rhythm":
      // matrix: зона "точка комфорта" — общий ритм совместности, ближайшая
      // существующая зона к теме темпа принятия решений (интерпретация).
      signals.matrix = zoneWeight("center", m.pairArcana.center) * 100;
      signals.numerology = n.lineScores.will; // линия воли/характера (1-2-3)
      if (hd) {
        // Ключевой сигнал темы по самому спеку: совпадение Авторитета — прямая
        // мера синхронности ритма принятия решений, уже используемая в скоринге ДЧ.
        signals.human_design = hd.rawFeatures.a.authority === hd.rawFeatures.b.authority ? 90 : 40;
      }
      if (jyotish) {
        const vashya = jyotish.rawFeatures.gunaMilan.kutas.vashya;
        signals.jyotish = (vashya.score / vashya.max) * 100; // вашья — единственная кута, явно названная в спеке для этой темы
      }
      break;
  }

  return signals;
}

export type ThemeVerdict = "agreement-high" | "agreement-low" | "contradiction" | "mixed";

export interface ThemeResult {
  key: ThemeKey;
  title: string;
  signals: Partial<Record<"matrix" | "numerology" | "human_design" | "jyotish", number>>;
  avg: number;
  range: number;
  verdict: ThemeVerdict;
}

/**
 * Классификация по min/max, а не по одному лишь размаху (range): матрица часто
 * даёт ровно 50 ("нейтрально по формуле" — арканум не попал ни в harmonic, ни
 * в tense список этой зоны), и этот технический "нейтраль" раздувал range даже
 * там, где остальные системы согласны, ложно помечая почти всё как "contradiction".
 * Настоящее противоречие — это когда есть и явный высокий, и явный низкий сигнал
 * одновременно (min<=35 и max>=65), а не просто широкий разброс сам по себе.
 */
function classifyTheme(avg: number, min: number, max: number): ThemeVerdict {
  if (min <= 35 && max >= 65) return "contradiction";
  if (avg >= 65 && min >= 45) return "agreement-high";
  if (avg <= 40 && max <= 55) return "agreement-low";
  return "mixed";
}

/**
 * Кросс-системный анализ считается только когда доступны все 4 системы:
 * правило "agreement" из спека ("≥3 систем дают один знак") не имеет смысла
 * на двух системах — тогда это просто совпадение, а не независимое схождение.
 */
export function calcCrossSystemThemes(
  matrix: SystemReport<MatrixRawFeatures>,
  numerology: SystemReport<NumerologyRawFeatures>,
  hd: SystemReport<HumanDesignRawFeatures> | null,
  jyotish: SystemReport<JyotishRawFeatures> | null
): ThemeResult[] | null {
  if (!hd || !jyotish) return null;

  return THEMES.map((spec) => {
    const signals = themeSignals(spec.key, matrix, numerology, hd, jyotish);
    const values = Object.values(signals).filter((v): v is number => v !== undefined);
    const avg = values.reduce((s, v) => s + v, 0) / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);
    return {
      key: spec.key,
      title: spec.title,
      signals,
      avg: Math.round(avg * 10) / 10,
      range: Math.round((max - min) * 10) / 10,
      verdict: classifyTheme(avg, min, max),
    };
  });
}
