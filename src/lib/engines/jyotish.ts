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
  ascendantSidereal,
} from "./ephemeris";
import { dignityOf, isCombust, type DignityState } from "@/lib/data/jyotish/dignities";
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
import { assertLicensed } from "./license-guard";

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
  /**
   * Ретроградность (вакри). Считается сравнением долготы за час до и через час
   * после момента: если планета за это время сдвинулась назад — она вакри.
   * Раньше это поле было захардкожено в false, и ни одна планета никогда не
   * помечалась, хотя отрисовка «(R)» была написана.
   */
  retro: boolean;
  /** Экзальтация, падение, мулатрикона или своя обитель — либо null. */
  dignity: DignityState;
  /** Сожжена ли планета близостью к Солнцу. */
  combust: boolean;
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
  assertLicensed();
  const utc = birthMoment(person);
  const HOUR = 3600_000;
  const sunNow = toSidereal(sunLongitude(utc), utc);

  const lonAt = (key: string, at: Date): number => {
    if (key === "sun") return sunLongitude(at);
    if (key === "moon") return moonLongitude(at);
    if (key === "rahu") return meanNorthNodeLongitude(at);
    if (key === "ketu") return meanSouthNodeLongitude(at);
    return planetLongitude(key as "mars" | "mercury" | "jupiter" | "venus" | "saturn", at);
  };

  return NAVAGRAHA.map(({ key, name, symbol }) => {
    let tropical: number;
    if (key === "sun") tropical = sunLongitude(utc);
    else if (key === "moon") tropical = moonLongitude(utc);
    else if (key === "rahu") tropical = meanNorthNodeLongitude(utc);
    else if (key === "ketu") tropical = meanSouthNodeLongitude(utc);
    else tropical = planetLongitude(key as "mars" | "mercury" | "jupiter" | "venus" | "saturn", utc);

    const siderealLon = toSidereal(tropical, utc);
    const rIndex = rashiIndex(siderealLon);
    const rName = rashiName(rIndex);
    const degreeInRashi = siderealLon % 30;

    // Узлы движутся вспять всегда — это их природа, а не состояние.
    // Светила не бывают ретроградными вовсе.
    let retro = false;
    if (key === "rahu" || key === "ketu") retro = true;
    else if (key !== "sun" && key !== "moon") {
      const before = lonAt(key, new Date(utc.getTime() - HOUR));
      const after = lonAt(key, new Date(utc.getTime() + HOUR));
      // Разница через границу 0°/360° берётся кратчайшей дугой.
      const delta = ((after - before + 540) % 360) - 180;
      retro = delta < 0;
    }

    return {
      key,
      name,
      symbol,
      siderealLon,
      rashiIndex: rIndex,
      rashiName: rName,
      degreeInRashi,
      retro,
      dignity: dignityOf(key, rName, degreeInRashi),
      combust: key === "sun" ? false : isCombust(key, siderealLon, sunNow),
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
// Мангал доша. Классика считает дом Марса в первую очередь от Лагны и лишь
// затем от Чандра-лагны (знака Луны). Лагну считаем, когда в Person доехали
// координаты города: она зависит от местного звёздного времени, поэтому без
// широты и долготы её не получить. По ссылкам, сохранённым до появления
// координат в адресе, остаётся прежний расчёт от Луны — он не требует места.
// ---------------------------------------------------------------------------

const MANGAL_DOSHA_HOUSES = new Set([1, 2, 4, 7, 8, 12]);

function houseBetween(anchorRashiIdx: number, targetRashiIdx: number): number {
  return ((targetRashiIdx - anchorRashiIdx + 12) % 12) + 1;
}

/**
 * Лагна — восходящий знак. Возвращает null, если места рождения нет: выдумывать
 * координаты по часовому поясу нельзя, Europe/Moscow тянется на десятки
 * градусов долготы, а это почти целый знак разницы в асценденте.
 */
export function calcLagna(person: Person): { rashiIndex: number; lon: number } | null {
  const { lat, lon } = person.birthPlace;
  if (lat === undefined || lon === undefined || !person.birthTimeKnown) return null;
  const asc = ascendantSidereal(birthMoment(person), lat, lon);
  return { rashiIndex: rashiIndex(asc), lon: asc };
}

export interface MangalDosha {
  present: boolean;
  /** Дом Марса от Луны — считается всегда, места рождения не требует. */
  house: number;
  /** Дом Марса от Лагны — null, когда координат нет. */
  houseFromLagna: number | null;
  /** От чего именно доша: пусто, если её нет. */
  from: ("лагны" | "Луны")[];
}

export function calcMangalDosha(person: Person, moon: MoonPosition): MangalDosha {
  const utc = birthMoment(person);
  const marsRashiIdx = rashiIndex(toSidereal(planetLongitude("mars", utc), utc));

  const house = houseBetween(moon.rashiIndex, marsRashiIdx);
  const fromMoon = MANGAL_DOSHA_HOUSES.has(house);

  const lagna = calcLagna(person);
  const houseFromLagna = lagna ? houseBetween(lagna.rashiIndex, marsRashiIdx) : null;
  const fromLagna = houseFromLagna !== null && MANGAL_DOSHA_HOUSES.has(houseFromLagna);

  const from: ("лагны" | "Луны")[] = [];
  if (fromLagna) from.push("лагны");
  if (fromMoon) from.push("Луны");

  return { present: fromLagna || fromMoon, house, houseFromLagna, from };
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
  assertLicensed();
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
