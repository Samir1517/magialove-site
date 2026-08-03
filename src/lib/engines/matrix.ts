/**
 * Движок «Матрица судьбы» — см. kalkulator/service/systems/matrix/ENGINE.md.
 * Вход: дата рождения ×2 (время/место не нужны).
 *
 * ВАЖНО — интерпретационные решения этого движка (ENGINE.md описывает метод
 * конспективно, без точных формул для части точек; ниже — наше прочтение,
 * задокументированное явно, чтобы его можно было сверить с первоисточником
 * и скорректировать):
 *
 * 1. Прямой (кардинальный) квадрат — из ENGINE.md буквально:
 *    день → левый угол, месяц → верхний, год → правый, свод(день+месяц+год) → нижний.
 * 2. Наклонный квадрат (4 диагональные точки) — ENGINE.md п.6 "свод суммы соседних
 *    диагональных" мы читаем как: каждая диагональная точка = свод суммы двух
 *    ближайших кардинальных точек (классическая схема построения 8-лучевой звезды
 *    Матрицы судьбы).
 * 3. Центр = свод суммы 4 кардинальных углов — прямо по ENGINE.md п.5, это же
 *    и есть зона "center" (точка комфорта).
 * 4. Зона "purpose" (предназначение) = нижний угол (свод дня+месяца+года) —
 *    в большинстве публичных описаний метода эта точка называется точкой
 *    предназначения; используем её как наиболее устоявшуюся трактовку.
 * 5. Зоны "love"/"money"/"kids" явно не определены в ENGINE.md. Мы связали их
 *    с тремя из четырёх диагональных точек по смысловой близости:
 *      love  = день+месяц   (личное + связь)
 *      money = год+сумма    (наследие/карма + предназначение → материальный путь)
 *      kids  = сумма+день   (предназначение + личное → творение/дети)
 *    Четвёртая диагональ (месяц+год) не привязана к отдельной зоне.
 *    ЭТО ИНТЕРПРЕТАЦИЯ, а не факт из ENGINE.md — при наличии первоисточника
 *    (конкретной методики, на которую опирается проект) эти 3 присвоения
 *    стоит сверить и при необходимости поправить в POSITION_TO_ZONE ниже.
 * 6. Проекция на 7 чакр (`data/chakra_pair.json`) — берём 7 из 9 уже вычисленных
 *    точек (кардинальные месяц/сумма как верх/низ вертикали, центр — середина,
 *    4 диагонали — между ними), не считая дополнительных чакра-специфичных точек,
 *    т.к. точная формула их вычисления не определена в ENGINE.md.
 */

import { reduceTo } from "./utils";
import { parseBirthDate, type Person, type SystemReport } from "./types";
import { assertLicensed } from "./license-guard";

import arcanaData from "../data/matrix/arcana.json";
import zonesData from "../data/matrix/compatibility_zones.json";
import chakraData from "../data/matrix/chakra_pair.json";

const MAX_ARCANUM = 22;

// ---------------------------------------------------------------------------
// Индивидуальная матрица
// ---------------------------------------------------------------------------

export type PositionKey =
  | "day" // левый угол
  | "month" // верхний угол
  | "year" // правый угол
  | "sum" // нижний угол = свод(день+месяц+год)
  | "center" // свод(4 кардинальных угла)
  | "dm" // диагональ день+месяц (северо-запад)
  | "my" // диагональ месяц+год (северо-восток)
  | "ys" // диагональ год+сумма (юго-восток)
  | "sd"; // диагональ сумма+день (юго-запад)

export type IndividualMatrix = Record<PositionKey, number>;

/** Свод дня/года к диапазону арканов (≤22); месяц (1-12) сводить не нужно. */
function reduceArcanum(n: number): number {
  return reduceTo(n, MAX_ARCANUM);
}

export function calcIndividualMatrix(person: Person): IndividualMatrix {
  const { day, month, year } = parseBirthDate(person.birthDate);

  // reduceArcanum сам сводит итеративно, пока не станет ≤22 — двух проходов
  // не нужно: 1987 → digitSum=25 (>22) → digitSum=7 (≤22, стоп), ровно как в ENGINE.md.
  const dayR = reduceArcanum(day);
  const monthR = month; // 1-12, уже ≤22
  const yearR = reduceArcanum(year);

  const sum = reduceArcanum(dayR + monthR + yearR);
  const center = reduceArcanum(dayR + monthR + yearR + sum);

  const dm = reduceArcanum(dayR + monthR);
  const my = reduceArcanum(monthR + yearR);
  const ys = reduceArcanum(yearR + sum);
  const sd = reduceArcanum(sum + dayR);

  return {
    day: dayR,
    month: monthR,
    year: yearR,
    sum,
    center,
    dm,
    my,
    ys,
    sd,
  };
}

// ---------------------------------------------------------------------------
// Матрица пары (наложение)
// ---------------------------------------------------------------------------

export function overlayPair(a: IndividualMatrix, b: IndividualMatrix): IndividualMatrix {
  const keys = Object.keys(a) as PositionKey[];
  const result = {} as IndividualMatrix;
  for (const key of keys) {
    result[key] = reduceArcanum(a[key] + b[key]);
  }
  return result;
}

// ---------------------------------------------------------------------------
// Зоны и скоринг
// ---------------------------------------------------------------------------

export const POSITION_TO_ZONE: Record<"love" | "money" | "kids" | "purpose" | "center", PositionKey> = {
  purpose: "sum",
  center: "center",
  love: "dm",
  money: "ys",
  kids: "sd",
};

interface ZoneDef {
  title: string;
  maps_to: string[];
  harmonic_arcana: number[];
  tense_arcana: number[];
}

interface ZonesFile {
  zones: Record<string, ZoneDef>;
  scoring: { harmonic: number; neutral: number; tense: number };
}

const zones = zonesData as unknown as ZonesFile;

export type ZoneKey = keyof typeof POSITION_TO_ZONE;

/** Заголовки зон из compatibility_zones.json — для подписей в интерфейсе. */
export const ZONE_TITLES: Record<ZoneKey, string> = Object.fromEntries(
  (Object.keys(POSITION_TO_ZONE) as ZoneKey[]).map((k) => [k, zones.zones[k]?.title ?? k])
) as Record<ZoneKey, string>;

/** Характер зоны для этой пары: гармоничный аркан, напряжённый или прочий. */
export function zoneCharacter(zoneKey: string, arcanum: number): "harmonic" | "tense" | "other" {
  const zone = zones.zones[zoneKey];
  if (!zone) return "other";
  if (zone.harmonic_arcana.includes(arcanum)) return "harmonic";
  if (zone.tense_arcana.includes(arcanum)) return "tense";
  return "other";
}

export function zoneWeight(zoneKey: string, arcanum: number): number {
  const zone = zones.zones[zoneKey];
  if (!zone) return zones.scoring.neutral;
  if (zone.harmonic_arcana.includes(arcanum)) return zones.scoring.harmonic;
  if (zone.tense_arcana.includes(arcanum)) return zones.scoring.tense;
  return zones.scoring.neutral;
}

// ---------------------------------------------------------------------------
// Чакры (проекция на вертикаль — см. интерпретационное примечание в шапке файла)
// ---------------------------------------------------------------------------

const CHAKRA_PROJECTION: { key: string; position: PositionKey }[] = [
  { key: "sahasrara", position: "month" }, // верх
  { key: "ajna", position: "dm" },
  { key: "vishuddha", position: "my" },
  { key: "anahata", position: "center" }, // середина
  { key: "manipura", position: "ys" },
  { key: "svadhisthana", position: "sd" },
  { key: "muladhara", position: "sum" }, // низ
];

export interface ChakraBalanceItem {
  key: string;
  name: string;
  layer: string;
  pairMeaning: string;
  arcanum: number;
}

export function calcChakraBalance(pair: IndividualMatrix): ChakraBalanceItem[] {
  const chakras = (chakraData as { chakras: { key: string; name: string; layer: string; pair_meaning: string }[] }).chakras;
  return CHAKRA_PROJECTION.map(({ key, position }) => {
    const info = chakras.find((c) => c.key === key)!;
    return {
      key,
      name: info.name,
      layer: info.layer,
      pairMeaning: info.pair_meaning,
      arcanum: pair[position],
    };
  });
}

// ---------------------------------------------------------------------------
// Публичный расчёт
// ---------------------------------------------------------------------------

export interface MatrixRawFeatures {
  aMatrix: IndividualMatrix;
  bMatrix: IndividualMatrix;
  pairMatrix: IndividualMatrix;
  pairArcana: Record<ZoneKey, number>;
  chakraBalance: ChakraBalanceItem[];
}

export interface ArcanumInfo {
  number: number;
  name: string;
  theme: string;
  inPair: string;
}

export function getArcanumInfo(n: number): ArcanumInfo {
  const arcana = (arcanaData as { arcana: Record<string, { name: string; theme: string; in_pair: string }> }).arcana;
  const info = arcana[String(n)];
  return { number: n, name: info.name, theme: info.theme, inPair: info.in_pair };
}

export function calcMatrixCompatibility(a: Person, b: Person): SystemReport<MatrixRawFeatures> {
  assertLicensed();
  const aMatrix = calcIndividualMatrix(a);
  const bMatrix = calcIndividualMatrix(b);
  const pairMatrix = overlayPair(aMatrix, bMatrix);

  const pairArcana = Object.fromEntries(
    (Object.keys(POSITION_TO_ZONE) as ZoneKey[]).map((zoneKey) => [zoneKey, pairMatrix[POSITION_TO_ZONE[zoneKey]]])
  ) as Record<ZoneKey, number>;

  const chakraBalance = calcChakraBalance(pairMatrix);

  const zoneKeys = Object.keys(POSITION_TO_ZONE) as ZoneKey[];
  const weights = zoneKeys.map((zoneKey) => zoneWeight(zoneKey, pairArcana[zoneKey]));
  const score = (weights.reduce((s, w) => s + w, 0) / zoneKeys.length) * 100;

  return {
    score: Math.round(score * 10) / 10,
    rawFeatures: { aMatrix, bMatrix, pairMatrix, pairArcana, chakraBalance },
    blocks: {}, // текстовые блоки собираются отдельным слоем синтеза из content/arkany/*.md
  };
}
