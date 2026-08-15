/**
 * Карты Джйотиш для отрисовки: раши (D-1) и навамша (D-9).
 *
 * Формат — южноиндийский: знаки жёстко закреплены за клетками сетки 4×4, дома
 * «переезжают». Выбран не по вкусу, а по двум причинам. Первая: он строится
 * без Лагны, а северо-индийский без неё бессмысленен — там дома фиксированы,
 * и без асцендента в клетки нечего положить. Вторая: знаки на одном месте у
 * обоих партнёров, поэтому две карты сравниваются клетка в клетку.
 *
 * Дома считаем от Луны (Чандра-лагна) — это классическая техника, и она
 * согласована с остальным расчётом: вся Аштакута построена на Луне.
 */

import { nakshatraAt, type GrahaPosition } from "./jyotish";
import type { DignityState } from "@/lib/data/jyotish/dignities";

/** Ширина навамши: 30° / 9 = 3°20′ — ровно одна пада накшатры. */
const NAVAMSA_ARC = 10 / 3;

/**
 * Знак навамши по сидерической долготе. Работает без таблиц: отсчёт навамш
 * идёт сквозной по всему кругу, поэтому подвижные знаки автоматически
 * начинают с себя, фиксированные — с девятого, двойственные — с пятого.
 */
export function navamsaRashi(siderealLon: number): number {
  return Math.floor(siderealLon / NAVAMSA_ARC) % 12;
}

export interface ChartGraha {
  key: string;
  /** Латинское сокращение — де-факто стандарт в картах Джйотиш. */
  short: string;
  name: string;
  symbol: string;
  rashiIndex: number;
  degreeInRashi: number;
  /** Ретроградность традиционно помечается как (R). */
  retro: boolean;
  /** Экзальтация, падение, мулатрикона, своя обитель — либо null. */
  dignity: DignityState;
  /** Сожжена близостью к Солнцу. */
  combust: boolean;
  /** Накшатра — лунная стоянка, в которой стоит планета. */
  nakshatra: string;
  /** Пада — четверть накшатры, 1..4. */
  pada: number;
}

const SHORT: Record<string, string> = {
  sun: "Su", moon: "Mo", mars: "Ma", mercury: "Me", jupiter: "Ju",
  venus: "Ve", saturn: "Sa", rahu: "Ra", ketu: "Ke",
};

/**
 * Накшатра и пада планеты. Свойство сидерической долготы, поэтому одинаково
 * верно и для D-1, и для D-9: в навамше у планеты другой знак, но стоянка та же.
 */
function nakshatraOf(g: GrahaPosition): { nakshatra: string; pada: number } {
  const n = nakshatraAt(g.siderealLon);
  return { nakshatra: n.name, pada: n.pada };
}

/** Раши-карта D-1: планеты по их знакам. */
export function rashiChart(grahas: GrahaPosition[]): ChartGraha[] {
  return grahas.map((g) => ({
    ...nakshatraOf(g),
    key: g.key,
    short: SHORT[g.key] ?? g.key,
    name: g.name,
    symbol: g.symbol,
    // GrahaPosition.rashiIndex приходит 1-based (Овен=1), а ChartGraha всюду
    // 0-based: так его читают CELL, RASHI_GLYPH и navamsaChart. Без вычитания
    // D-1 рисовала планеты на знак вперёд, а Рыбы (12) не находили клетки в
    // сетке 0..11 и пропадали с карты совсем.
    rashiIndex: g.rashiIndex - 1,
    degreeInRashi: g.degreeInRashi,
    retro: g.retro,
    dignity: g.dignity,
    combust: g.combust,
  }));
}

/** Навамша D-9 — в традиции карта супруга и главный индикатор силы планет. */
export function navamsaChart(grahas: GrahaPosition[]): ChartGraha[] {
  return grahas.map((g) => {
    const rashi = navamsaRashi(g.siderealLon);
    return {
      ...nakshatraOf(g),
      key: g.key,
      short: SHORT[g.key] ?? g.key,
      name: g.name,
      symbol: g.symbol,
      rashiIndex: rashi,
      degreeInRashi: (g.siderealLon % NAVAMSA_ARC) * 9,
      retro: g.retro,
      // Достоинство считается по знаку основной карты: в навамше у планеты
      // другой знак, и переносить туда экзальтацию из D-1 было бы неверно.
      dignity: null,
      combust: g.combust,
    };
  });
}

/**
 * Варготтама — планета, попавшая в один и тот же знак в D-1 и D-9. Классика
 * считает такую планету особенно устойчивой: то, что она обещает, человек
 * получает в жизни, а не только «на бумаге».
 */
export function vargottama(grahas: GrahaPosition[]): Set<string> {
  const out = new Set<string>();
  for (const g of grahas) {
    // navamsaRashi 0-based, g.rashiIndex 1-based — сравнивать напрямую нельзя:
    // так варготтама помечалась у планет, чей знак в D-9 на один вперёд.
    if (navamsaRashi(g.siderealLon) === g.rashiIndex - 1) out.add(g.key);
  }
  return out;
}

/** Номер дома от опорного знака (1..12). Для Чандра-лагны опора — знак Луны. */
export function houseFrom(anchorRashi: number, rashi: number): number {
  return ((rashi - anchorRashi + 12) % 12) + 1;
}

/**
 * Мангал доша: Марс в 1, 2, 4, 7, 8 или 12 доме. Классика считает её от
 * Лагны, от Луны и от Венеры; без времени и места рождения доступны две
 * последние — их и проверяем, честно оговаривая это в интерфейсе.
 */
export const MANGAL_HOUSES = [1, 2, 4, 7, 8, 12];

export function mangalFrom(anchorRashi: number, marsRashi: number): boolean {
  return MANGAL_HOUSES.includes(houseFrom(anchorRashi, marsRashi));
}

export const RASHI_NAMES = [
  "Овен", "Телец", "Близнецы", "Рак", "Лев", "Дева",
  "Весы", "Скорпион", "Стрелец", "Козерог", "Водолей", "Рыбы",
];

export const RASHI_GLYPH = ["♈", "♉", "♊", "♋", "♌", "♍", "♎", "♏", "♐", "♑", "♒", "♓"];

/**
 * Раскладка южноиндийской сетки 4×4: [строка, столбец] для каждого знака.
 * Рыбы в левом верхнем углу, Овен — вторая клетка верхнего ряда, дальше по
 * часовой стрелке. Середина 2×2 остаётся пустой под подпись карты.
 */
export const CELL: [number, number][] = [
  [0, 1], [0, 2], [0, 3], [1, 3], [2, 3], [3, 3],
  [3, 2], [3, 1], [3, 0], [2, 0], [1, 0], [0, 0],
];
