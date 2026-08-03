/**
 * Движок «Джйотиш» — см. kalkulator/service/systems/jyotish/ENGINE.md.
 * Вход: дата + точное время + место рождения ×2.
 * Технология: astronomy-engine + сидерическая поправка (айянамша Лахири,
 * приближённая формула — см. ephemeris.ts) вместо pyswisseph.
 */

import {
  birthMoment,
  moonLongitude,
  sunLongitude,
  planetLongitude,
  meanNorthNodeLongitude,
  meanSouthNodeLongitude,
  toSidereal,
} from "./ephemeris";
import {
  rashiIndex,
  rashiName,
  varnaRank,
  vashyaScore,
  ganaOf,
  ganaScore,
  yoniOf,
  yoniScore,
  grahaMaitriScore,
  type RashiName,
} from "./jyotish-tables";
import { parseBirthDate, type Person, type SystemReport } from "./types";

import nakshatraData from "../data/jyotish/nakshatra.json";
import kutasData from "../data/jyotish/kutas.json";
import doshasData from "../data/jyotish/doshas.json";

// ---------------------------------------------------------------------------
// Луна: накшатра, раши, нади
// ---------------------------------------------------------------------------

interface NakshatraEntry {
  i: number;
  name: string;
  nadi: string;
  rashi: string;
}

const NAKSHATRAS = (nakshatraData as { nakshatras: NakshatraEntry[] }).nakshatras;

const NAKSHATRA_WIDTH = 360 / 27; // 13°20'

export interface MoonPosition {
  siderealLon: number;
  nakshatraIndex: number;
  nakshatraName: string;
  nadi: string;
  rashiIndex: number;
  rashiName: RashiName;
}

export function calcMoonPosition(person: Person): MoonPosition {
  const utc = birthMoment(person);
  const tropicalLon = moonLongitude(utc);
  const siderealLon = toSidereal(tropicalLon, utc);

  const nakIndex = Math.floor(siderealLon / NAKSHATRA_WIDTH) + 1;
  const nak = NAKSHATRAS[Math.min(nakIndex, 27) - 1];

  const rIndex = rashiIndex(siderealLon);

  return {
    siderealLon,
    nakshatraIndex: nak.i,
    nakshatraName: nak.name,
    nadi: nak.nadi,
    rashiIndex: rIndex,
    rashiName: rashiName(rIndex),
  };
}

// ---------------------------------------------------------------------------
// Наваграха — 9 «планет» классического Джйотиша, для биколеса
// ---------------------------------------------------------------------------

/**
 * Классический Джйотиш оперирует девятью грахами. Уран, Нептун и Плутон в него
 * не входят — они открыты много позже сложения традиции, поэтому в биколесе
 * сознательно не показываются, хотя движок эфемерид умеет их считать.
 */
export interface GrahaPosition {
  key: string;
  name: string;
  symbol: string;
  siderealLon: number;
  rashiIndex: number;
  rashiName: RashiName;
  /** Градус внутри знака, 0..30. */
  degreeInRashi: number;
}

const NAVAGRAHA: { key: string; name: string; symbol: string }[] = [
  { key: "sun", name: "Сурья (Солнце)", symbol: "☉" },
  { key: "moon", name: "Чандра (Луна)", symbol: "☾" },
  { key: "mars", name: "Мангала (Марс)", symbol: "♂" },
  { key: "mercury", name: "Будха (Меркурий)", symbol: "☿" },
  { key: "jupiter", name: "Гуру (Юпитер)", symbol: "♃" },
  { key: "venus", name: "Шукра (Венера)", symbol: "♀" },
  { key: "saturn", name: "Шани (Сатурн)", symbol: "♄" },
  { key: "rahu", name: "Раху (Северный узел)", symbol: "☊" },
  { key: "ketu", name: "Кету (Южный узел)", symbol: "☋" },
];

export function calcNavagraha(person: Person): GrahaPosition[] {
  const utc = birthMoment(person);
  return NAVAGRAHA.map(({ key, name, symbol }) => {
    let tropical: number;
    if (key === "sun") tropical = sunLongitude(utc);
    else if (key === "moon") tropical = moonLongitude(utc);
    else if (key === "rahu") tropical = meanNorthNodeLongitude(utc);
    else if (key === "ketu") tropical = meanSouthNodeLongitude(utc);
    else tropical = planetLongitude(key as "mars" | "mercury" | "jupiter" | "venus" | "saturn", utc);

    const siderealLon = toSidereal(tropical, utc);
    const rIndex = rashiIndex(siderealLon);
    return {
      key,
      name,
      symbol,
      siderealLon,
      rashiIndex: rIndex,
      rashiName: rashiName(rIndex),
      degreeInRashi: siderealLon % 30,
    };
  });
}

// ---------------------------------------------------------------------------
// Тара-кута: счёт накшатр в обе стороны, группы 3/5/7 (из 9) неблагоприятны
// ---------------------------------------------------------------------------

const TARA_INAUSPICIOUS_GROUPS = new Set([3, 5, 7]);

function taraGroup(fromIdx: number, toIdx: number): number {
  const count = ((toIdx - fromIdx + 27) % 27) + 1;
  const group = count % 9 === 0 ? 9 : count % 9;
  return group;
}

/** Тара из 3: считаем в обе стороны, штрафуем за каждое неблагоприятное направление. */
function taraScore(aIdx: number, bIdx: number): number {
  const forward = taraGroup(aIdx, bIdx);
  const backward = taraGroup(bIdx, aIdx);
  const goodCount = [forward, backward].filter((g) => !TARA_INAUSPICIOUS_GROUPS.has(g)).length;
  return (goodCount / 2) * 3;
}

// ---------------------------------------------------------------------------
// Мангал доша (нужен асцендент — эклиптическая долгота восходящего знака
// не считается этим движком без времени/места, но для Марса в домах от Луны
// используем упрощение: дом Марса считаем от Лунного знака, как это делают
// некоторые школы Чандра-лагна вместо строгой Лагны — задокументированное
// упрощение при отсутствии в проекте расчёта асцендента).
// ---------------------------------------------------------------------------

const MANGAL_DOSHA_HOUSES = new Set([1, 2, 4, 7, 8, 12]);

function marsHouseFromMoon(moonRashiIdx: number, marsRashiIdx: number): number {
  return ((marsRashiIdx - moonRashiIdx + 12) % 12) + 1;
}

export function calcMangalDosha(person: Person, moon: MoonPosition): { present: boolean; house: number } {
  const utc = birthMoment(person);
  const marsTropical = planetLongitude("mars", utc);
  const marsSidereal = toSidereal(marsTropical, utc);
  const marsRashiIdx = rashiIndex(marsSidereal);
  const house = marsHouseFromMoon(moon.rashiIndex, marsRashiIdx);
  return { present: MANGAL_DOSHA_HOUSES.has(house), house };
}

// ---------------------------------------------------------------------------
// Аштакута (8 кута) → 36 баллов
// ---------------------------------------------------------------------------

export interface GunaMilanResult {
  total: number;
  kutas: Record<string, { score: number; max: number }>;
}

export function calcGunaMilan(a: MoonPosition, b: MoonPosition): GunaMilanResult {
  const varna = varnaRank(a.rashiName) >= varnaRank(b.rashiName) ? 1 : 0;
  const vashya = vashyaScore(a.rashiName, b.rashiName);
  const tara = taraScore(a.nakshatraIndex, b.nakshatraIndex);
  const yoni = yoniScore(yoniOf(a.nakshatraIndex), yoniOf(b.nakshatraIndex));
  const grahaMaitri = grahaMaitriScore(a.rashiName, b.rashiName);
  const gana = ganaScore(ganaOf(a.nakshatraIndex), ganaOf(b.nakshatraIndex));
  const bhakootDistance = Math.min(
    ((b.rashiIndex - a.rashiIndex + 12) % 12) + 1,
    ((a.rashiIndex - b.rashiIndex + 12) % 12) + 1
  );
  const bhakootBad = bhakootDistance === 6 || bhakootDistance === 2; // 6/8 или 2/12 (расстояние симметрично)
  const bhakoot = bhakootBad ? 0 : 7;
  const nadi = a.nadi === b.nadi ? 0 : 8;

  const kutas = { varna, vashya, tara, yoni, graha_maitri: grahaMaitri, gana, bhakoot, nadi };
  const total = Object.values(kutas).reduce((s, v) => s + v, 0);

  const kutaMax: Record<string, number> = Object.fromEntries(
    (kutasData as { kutas: { key: string; max: number }[] }).kutas.map((k) => [k.key, k.max])
  );

  return {
    total: Math.round(total * 100) / 100,
    kutas: Object.fromEntries(
      Object.entries(kutas).map(([key, score]) => [key, { score, max: kutaMax[key] }])
    ),
  };
}

// ---------------------------------------------------------------------------
// Доши и штрафы
// ---------------------------------------------------------------------------

interface DoshaEntry {
  title: string;
  penalty: number;
}

const doshas = (doshasData as { doshas: Record<string, DoshaEntry> }).doshas;

export interface DoshaResult {
  key: string;
  title: string;
  penalty: number;
  active: boolean;
  neutralized?: boolean;
}

export function calcDoshas(a: Person, b: Person, aMoon: MoonPosition, bMoon: MoonPosition): DoshaResult[] {
  const results: DoshaResult[] = [];

  const nadiSame = aMoon.nadi === bMoon.nadi;
  results.push({ key: "nadi", title: doshas.nadi.title, penalty: doshas.nadi.penalty, active: nadiSame });

  const bhakootDistance = Math.min(
    ((bMoon.rashiIndex - aMoon.rashiIndex + 12) % 12) + 1,
    ((aMoon.rashiIndex - bMoon.rashiIndex + 12) % 12) + 1
  );
  const bhakootBad = bhakootDistance === 6 || bhakootDistance === 2;
  results.push({ key: "bhakoot", title: doshas.bhakoot.title, penalty: doshas.bhakoot.penalty, active: bhakootBad });

  const aMangal = calcMangalDosha(a, aMoon);
  const bMangal = calcMangalDosha(b, bMoon);
  const bothManglik = aMangal.present && bMangal.present;
  const oneManglik = aMangal.present !== bMangal.present;
  results.push({
    key: "mangal",
    title: doshas.mangal.title,
    penalty: doshas.mangal.penalty,
    active: oneManglik, // по традиции: манглик у обоих — доша взаимно нейтрализуется
    neutralized: bothManglik,
  });

  return results;
}

// ---------------------------------------------------------------------------
// Публичный расчёт
// ---------------------------------------------------------------------------

export interface JyotishRawFeatures {
  a: { moonNakshatra: string; moonNakshatraIndex: number; moonRashi: RashiName; mangalDosha: boolean };
  b: { moonNakshatra: string; moonNakshatraIndex: number; moonRashi: RashiName; mangalDosha: boolean };
  gunaMilan: GunaMilanResult;
  doshas: DoshaResult[];
}

export function calcJyotishCompatibility(a: Person, b: Person): SystemReport<JyotishRawFeatures> {
  const aMoon = calcMoonPosition(a);
  const bMoon = calcMoonPosition(b);

  const gunaMilan = calcGunaMilan(aMoon, bMoon);
  const doshaResults = calcDoshas(a, b, aMoon, bMoon);

  const penaltyTotal = doshaResults
    .filter((d) => d.active && !d.neutralized)
    .reduce((s, d) => s + d.penalty, 0);

  const rawScore = (gunaMilan.total / 36) * 100 + penaltyTotal; // penalty уже отрицательный
  const score = Math.max(0, Math.min(100, Math.round(rawScore * 10) / 10));

  const aMangal = calcMangalDosha(a, aMoon);
  const bMangal = calcMangalDosha(b, bMoon);

  return {
    score,
    rawFeatures: {
      a: {
        moonNakshatra: aMoon.nakshatraName,
        moonNakshatraIndex: aMoon.nakshatraIndex,
        moonRashi: aMoon.rashiName,
        mangalDosha: aMangal.present,
      },
      b: {
        moonNakshatra: bMoon.nakshatraName,
        moonNakshatraIndex: bMoon.nakshatraIndex,
        moonRashi: bMoon.rashiName,
        mangalDosha: bMangal.present,
      },
      gunaMilan,
      doshas: doshaResults,
    },
    blocks: {}, // текстовые блоки — из content/8-kut/*.md и content/doshi/*.md
  };
}
