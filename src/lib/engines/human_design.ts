/**
 * Движок «Дизайн человека» — см. kalkulator/service/systems/human_design/ENGINE.md.
 * Вход: дата + точное время + место рождения ×2.
 * Технология: astronomy-engine (тропические геоцентрические долготы) вместо
 * pyswisseph — см. ephemeris.ts.
 *
 * Активация ворот: считаем по Солнцу, Луне, 7 классическим планетам + Раху/Кету
 * (Северный/Южный узел) — 10 тел, в двух моментах (Личность=рождение,
 * Дизайн=−88° солнечной дуги) = до 20 активаций на человека. Не считаем Землю
 * отдельно (её ворота = ворота Солнца+180°, зеркальны и не меняют определённость
 * центров/тип в подавляющем большинстве случаев) — задокументированное упрощение.
 */

import { birthMoment, findDesignMoment, sunLongitude, moonLongitude, planetLongitude, meanNorthNodeLongitude, meanSouthNodeLongitude, norm360 } from "./ephemeris";
import {
  longitudeToGateLine,
  centerOfGate,
  channelsOfGate,
  CENTER_NAMES,
  CHANNELS,
  type CenterKey,
  type GateLine,
} from "./human-design-tables";
import type { Person, SystemReport } from "./types";
import { assertLicensed } from "./license-guard";

import typesData from "../data/human_design/types.json";
import connectionThemesData from "../data/human_design/connection_themes.json";

// ---------------------------------------------------------------------------
// Активация ворот по обоим моментам (Личность/Дизайн)
// ---------------------------------------------------------------------------

export type HDType = "Генератор" | "Манифестирующий генератор" | "Проектор" | "Манифестор" | "Рефлектор";
export type Authority =
  | "Эмоциональный" | "Сакральный" | "Селезёночный" | "Эго/Сердечный" | "Самопроекционный"
  | "Ментальный/внешний" | "Лунный";

function gatesAtMoment(utc: Date): GateLine[] {
  const longitudes = [
    sunLongitude(utc),
    moonLongitude(utc),
    planetLongitude("mercury", utc),
    planetLongitude("venus", utc),
    planetLongitude("mars", utc),
    planetLongitude("jupiter", utc),
    planetLongitude("saturn", utc),
    planetLongitude("uranus", utc),
    planetLongitude("neptune", utc),
    planetLongitude("pluto", utc),
    meanNorthNodeLongitude(utc),
    meanSouthNodeLongitude(utc),
  ];
  return longitudes.map((lon) => longitudeToGateLine(norm360(lon)));
}

export interface PersonalDesign {
  activatedGates: Set<number>;
  personalityGates: GateLine[];
  designGates: GateLine[];
  definedCenters: Set<CenterKey>;
  definedChannels: string[]; // ключи каналов вида "1-8"
  type: HDType;
  authority: Authority;
  profile: string; // "X/Y"
}

function definedCentersAndChannels(activated: Set<number>): { centers: Set<CenterKey>; channels: string[] } {
  const channels: string[] = [];
  const centers = new Set<CenterKey>();
  const seen = new Set<string>();
  for (const gate of activated) {
    for (const ch of channelsOfGate(gate)) {
      if (seen.has(ch.key)) continue;
      const [g1, g2] = ch.gates;
      if (activated.has(g1) && activated.has(g2)) {
        seen.add(ch.key);
        channels.push(ch.key);
        centers.add(centerOfGate(g1));
        centers.add(centerOfGate(g2));
      }
    }
  }
  return { centers, channels };
}

/** Проверяет связность (по определённым каналам) между двумя центрами — BFS. */
function centersConnected(from: CenterKey, targets: CenterKey[], definedChannels: string[]): boolean {
  const adjacency = new Map<CenterKey, CenterKey[]>();
  for (const key of definedChannels) {
    const [g1, g2] = key.split("-").map(Number);
    const c1 = centerOfGate(g1);
    const c2 = centerOfGate(g2);
    (adjacency.get(c1) ?? adjacency.set(c1, []).get(c1)!).push(c2);
    (adjacency.get(c2) ?? adjacency.set(c2, []).get(c2)!).push(c1);
  }
  const visited = new Set<CenterKey>([from]);
  const queue: CenterKey[] = [from];
  while (queue.length) {
    const cur = queue.shift()!;
    if (targets.includes(cur)) return true;
    for (const next of adjacency.get(cur) ?? []) {
      if (!visited.has(next)) {
        visited.add(next);
        queue.push(next);
      }
    }
  }
  return false;
}

function determineType(centers: Set<CenterKey>, channels: string[]): HDType {
  const sacralDefined = centers.has("sacral");
  const throatDefined = centers.has("throat");
  const otherMotors: CenterKey[] = ["heart", "solarplexus", "root"];
  const throatConnectedToMotor =
    throatDefined && centersConnected("throat", sacralDefined ? [...otherMotors, "sacral"] : otherMotors, channels);

  if (centers.size === 0) return "Рефлектор";
  if (sacralDefined) {
    return throatConnectedToMotor ? "Манифестирующий генератор" : "Генератор";
  }
  return throatConnectedToMotor ? "Манифестор" : "Проектор";
}

function determineAuthority(centers: Set<CenterKey>): Authority {
  if (centers.has("solarplexus")) return "Эмоциональный";
  if (centers.has("sacral")) return "Сакральный";
  if (centers.has("spleen")) return "Селезёночный";
  if (centers.has("heart")) return "Эго/Сердечный";
  if (centers.has("g")) return "Самопроекционный";
  if (centers.size > 0) return "Ментальный/внешний";
  return "Лунный";
}

export function calcPersonalDesign(person: Person): PersonalDesign {
  const personalityUtc = birthMoment(person);
  const designUtc = findDesignMoment(personalityUtc);

  const personalityGates = gatesAtMoment(personalityUtc);
  const designGates = gatesAtMoment(designUtc);

  const activatedGates = new Set<number>([...personalityGates, ...designGates].map((g) => g.gate));
  const { centers, channels } = definedCentersAndChannels(activatedGates);

  const type = determineType(centers, channels);
  const authority = determineAuthority(centers);

  // Профиль: линия Солнца в Личности / линия Солнца в Дизайне.
  const personalitySunLine = personalityGates[0].line;
  const designSunLine = designGates[0].line;
  const profile = `${personalitySunLine}/${designSunLine}`;

  return {
    activatedGates,
    personalityGates,
    designGates,
    definedCenters: centers,
    definedChannels: channels,
    type,
    authority,
    profile,
  };
}

// ---------------------------------------------------------------------------
// Композит пары: 4 типа связи каналов
// ---------------------------------------------------------------------------

export type ConnectionThemeKey = "electromagnetic" | "companionship" | "dominance" | "compromise";

export interface ConnectionResult {
  theme: ConnectionThemeKey;
  channelKey: string;
  channelName: string;
}

export function calcConnections(a: PersonalDesign, b: PersonalDesign): ConnectionResult[] {
  const results: ConnectionResult[] = [];

  for (const ch of CHANNELS) {
    const [g1, g2] = ch.gates;
    const aHas1 = a.activatedGates.has(g1);
    const aHas2 = a.activatedGates.has(g2);
    const bHas1 = b.activatedGates.has(g1);
    const bHas2 = b.activatedGates.has(g2);

    const aFull = aHas1 && aHas2;
    const bFull = bHas1 && bHas2;
    const aHalf = aHas1 !== aHas2;
    const bHalf = bHas1 !== bHas2;

    // Electromagnetic: у каждого своя половина, и вместе они закрывают канал целиком.
    if (aHalf && bHalf && aHas1 !== bHas1) {
      results.push({ theme: "electromagnetic", channelKey: ch.key, channelName: ch.name });
      continue;
    }
    // Companionship: канал целиком определён у ОБОИХ независимо.
    if (aFull && bFull) {
      results.push({ theme: "companionship", channelKey: ch.key, channelName: ch.name });
      continue;
    }
    // Dominance: канал целиком у одного, у другого — ни одной половины.
    if ((aFull && !bHas1 && !bHas2) || (bFull && !aHas1 && !aHas2)) {
      results.push({ theme: "dominance", channelKey: ch.key, channelName: ch.name });
      continue;
    }
    // Compromise: у одного целиком, у другого — ровно половина (не закрывающая канал).
    if ((aFull && bHalf) || (bFull && aHalf)) {
      results.push({ theme: "compromise", channelKey: ch.key, channelName: ch.name });
    }
  }
  return results;
}

// ---------------------------------------------------------------------------
// Публичный расчёт
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Композит пары и Connection Theme
// ---------------------------------------------------------------------------

/** Откуда в композите взялся определённый канал. */
export type ChannelSource = "both" | "a" | "b" | "electromagnetic";

export interface CompositeChannel {
  key: string;
  name: string;
  gates: [number, number];
  source: ChannelSource;
}

export const ALL_CENTERS = Object.keys(CENTER_NAMES) as CenterKey[];

export interface CompositeDefinition {
  channels: CompositeChannel[];
  definedCenters: CenterKey[];
  openCenters: CenterKey[];
}

/**
 * Композит («connection chart») пары: объединяем активированные ворота обоих и
 * смотрим, какие каналы закрываются целиком. Сюда автоматически попадают и
 * электромагнитные каналы — где каждый партнёр даёт свою половину, и центр
 * становится определённым, хотя по отдельности он не определён ни у кого.
 */
export function calcComposite(a: PersonalDesign, b: PersonalDesign): CompositeDefinition {
  const union = new Set<number>([...a.activatedGates, ...b.activatedGates]);
  const channels: CompositeChannel[] = [];
  const defined = new Set<CenterKey>();

  for (const ch of CHANNELS) {
    const [g1, g2] = ch.gates;
    if (!union.has(g1) || !union.has(g2)) continue;

    const aFull = a.activatedGates.has(g1) && a.activatedGates.has(g2);
    const bFull = b.activatedGates.has(g1) && b.activatedGates.has(g2);
    const source: ChannelSource =
      aFull && bFull ? "both" : aFull ? "a" : bFull ? "b" : "electromagnetic";

    channels.push({ key: ch.key, name: ch.name, gates: [g1, g2], source });
    defined.add(centerOfGate(g1));
    defined.add(centerOfGate(g2));
  }

  return {
    channels,
    definedCenters: ALL_CENTERS.filter((c) => defined.has(c)),
    openCenters: ALL_CENTERS.filter((c) => !defined.has(c)),
  };
}

export interface ConnectionTheme {
  /** Определённых центров в композите. */
  defined: number;
  /** Открытых центров (defined + open = 9). */
  open: number;
  /** Обозначение вида "7/2". */
  key: string;
}

export function calcConnectionTheme(composite: CompositeDefinition): ConnectionTheme {
  const defined = composite.definedCenters.length;
  const open = ALL_CENTERS.length - defined;
  return { defined, open, key: `${defined}/${open}` };
}

// ---------------------------------------------------------------------------
// Публичный расчёт
// ---------------------------------------------------------------------------

/**
 * Полная карта одного человека — то, что нужно, чтобы нарисовать его личный
 * бодиграф рядом с бодиграфом партнёра: какие ворота активированы, какими
 * именно активациями (Личность / Дизайн) и с какой линией внутри ворот.
 */
export interface PersonChart {
  type: HDType;
  authority: Authority;
  profile: string;
  definedCenters: string[];
  /** Ключи центров (не названия) — для раскраски бодиграфа. */
  definedCenterKeys: CenterKey[];
  definedChannels: string[];
  activatedGates: number[];
  /** Ворота → линия внутри них. Нужны для подсказки «какая линия у кого». */
  personalityLines: Record<number, number>;
  designLines: Record<number, number>;
}

export interface HumanDesignRawFeatures {
  a: PersonChart;
  b: PersonChart;
  connections: Record<ConnectionThemeKey, string[]>;
  /** Композит пары — основа для Connection Theme и композитного бодиграфа. */
  composite: CompositeDefinition;
  connectionTheme: ConnectionTheme;
}

function typeAuthorityModifier(a: PersonalDesign, b: PersonalDesign): number {
  const types = (typesData as { pair_dynamics: Record<string, string> }).pair_dynamics;
  const key1 = `${a.type}+${b.type}`;
  const key2 = `${b.type}+${a.type}`;
  const hasKnownDynamic = key1 in types || key2 in types;
  const sameAuthority = a.authority === b.authority;
  // Модификатор ±15, применённый как отклонение от нейтрали: известная гармоничная
  // динамика типов и совпадающий авторитет — в плюс; иначе нейтрально. Конкретных
  // числовых порогов ENGINE.md не задаёт — используем консервативную половину
  // заявленного диапазона на каждый фактор.
  let modifier = 0;
  if (hasKnownDynamic) modifier += 7.5;
  if (sameAuthority) modifier += 7.5;
  else modifier -= 7.5; // разный ритм решений — заявленный в pair_note главный риск
  return modifier;
}

/** Свод активаций в «ворота → линия»: одни ворота могут прийти дважды. */
function linesByGate(gates: GateLine[]): Record<number, number> {
  const out: Record<number, number> = {};
  for (const g of gates) if (out[g.gate] === undefined) out[g.gate] = g.line;
  return out;
}

function toPersonChart(d: PersonalDesign): PersonChart {
  return {
    type: d.type,
    authority: d.authority,
    profile: d.profile,
    definedCenters: [...d.definedCenters].map((c) => CENTER_NAMES[c]),
    definedCenterKeys: [...d.definedCenters],
    definedChannels: d.definedChannels,
    activatedGates: [...d.activatedGates].sort((x, y) => x - y),
    personalityLines: linesByGate(d.personalityGates),
    designLines: linesByGate(d.designGates),
  };
}

export function calcHumanDesignCompatibility(a: Person, b: Person): SystemReport<HumanDesignRawFeatures> {
  assertLicensed();
  const aDesign = calcPersonalDesign(a);
  const bDesign = calcPersonalDesign(b);
  const connections = calcConnections(aDesign, bDesign);
  const composite = calcComposite(aDesign, bDesign);

  const themes = (connectionThemesData as { themes: Record<ConnectionThemeKey, { score: number }> }).themes;
  const byTheme: Record<ConnectionThemeKey, string[]> = {
    electromagnetic: [],
    companionship: [],
    dominance: [],
    compromise: [],
  };
  for (const c of connections) byTheme[c.theme].push(c.channelKey);

  const weightedScores = connections.map((c) => themes[c.theme].score);
  const baseScore =
    weightedScores.length > 0 ? weightedScores.reduce((s, v) => s + v, 0) / weightedScores.length : 50;

  const modifier = typeAuthorityModifier(aDesign, bDesign);
  const score = Math.max(0, Math.min(100, Math.round((baseScore + modifier) * 10) / 10));

  return {
    score,
    rawFeatures: {
      a: toPersonChart(aDesign),
      b: toPersonChart(bDesign),
      connections: byTheme,
      composite,
      connectionTheme: calcConnectionTheme(composite),
    },
    blocks: {}, // текстовые блоки — из content/tipy/*.md, content/avtoritety/*.md, content/svyazi/*.md
  };
}
