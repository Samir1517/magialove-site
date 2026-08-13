/**
 * Карта возврата Сатурна — «погода периода», а не вторая натальная карта.
 *
 * ЧТО ЭТО ПО ИСТОЧНИКУ. Анализ циклов (Cycle Analysis) — официальная часть
 * корпуса: Ра Уру Ху вёл сертификационный курс «Life Cycles Analysis» (2005),
 * тема входит в программу IHDS (Professional Training Level II «Cycles and
 * Connections»). Карта строится на момент, когда Сатурн возвращается в ту же
 * точку эклиптики, что и в день рождения (примерно 29–30 лет), и читается как
 * тема и обусловленность периода — IHDS называет это «погодой» отрезка жизни.
 *
 * ЧЕГО ЭТА КАРТА НЕ ДЕЛАЕТ. Она не меняет и не дополняет натальную карту.
 * Тип, Стратегия и Авторитет в Дизайне человека постоянны: натальная карта
 * считается по неизменным положениям планет, поэтому «второго типа» у человека
 * не появляется. Официальная формулировка Jovian Archive: «Transits don't
 * change who you are. They condition you, but they don't define you». Поэтому
 * здесь считается и показывается ВРЕМЕННЫЙ ПРОФИЛЬ периода (так эту карту
 * подают и русскоязычные школы), но НЕ второй тип — его не существует.
 */

import type { Person } from "./types";
import { birthMoment, findDesignMoment, norm360, planetLongitude } from "./ephemeris";
import { calcPersonalDesign } from "./human_design";
import { CHANNELS, longitudeToGateLine } from "./human-design-tables";
import {
  sunLongitude,
  moonLongitude,
  meanNorthNodeLongitude,
  meanSouthNodeLongitude,
} from "./ephemeris";

const DAY_MS = 86_400_000;
/** Сидерический период Сатурна — стартовая точка поиска. */
const SATURN_YEARS = 29.4571;

function gatesAtMoment(utc: Date): { gate: number; line: number }[] {
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

/** Кратчайшая угловая разница в диапазоне −180…180. */
function angleDiff(a: number, b: number): number {
  return ((a - b + 540) % 360) - 180;
}

/**
 * Момент первого возврата Сатурна: ищем, когда его долгота снова совпадёт с
 * натальной. Сначала грубо шагаем по неделе от ожидаемого срока, затем режем
 * интервал пополам до точности в час — Сатурн идёт медленно (~2′ в сутки), так
 * что этого с запасом хватает для попадания в нужные ворота.
 */
export function findSaturnReturn(birthUtc: Date): Date | null {
  const natal = norm360(planetLongitude("saturn", birthUtc));
  const approx = new Date(birthUtc.getTime() + SATURN_YEARS * 365.2422 * DAY_MS);

  let lo = new Date(approx.getTime() - 400 * DAY_MS);
  let prev = angleDiff(norm360(planetLongitude("saturn", lo)), natal);

  for (let i = 1; i <= 120; i++) {
    const t = new Date(lo.getTime() + i * 7 * DAY_MS);
    const cur = angleDiff(norm360(planetLongitude("saturn", t)), natal);
    // Смена знака при малом модуле = пересечение натальной точки (а не
    // «перескок» через противоположную сторону круга).
    if (prev <= 0 && cur >= 0 && Math.abs(cur - prev) < 90) {
      let a = new Date(t.getTime() - 7 * DAY_MS);
      let b = t;
      for (let j = 0; j < 24; j++) {
        const mid = new Date((a.getTime() + b.getTime()) / 2);
        const dm = angleDiff(norm360(planetLongitude("saturn", mid)), natal);
        if (dm < 0) a = mid;
        else b = mid;
      }
      return new Date((a.getTime() + b.getTime()) / 2);
    }
    prev = cur;
    lo = lo;
  }
  return null;
}

export interface SaturnSide {
  /** Ворота, которых нет в натальной карте, но есть в карте возврата. */
  gates: number[];
  /** Каналы, замыкающиеся только с учётом этих ворот. */
  channels: string[];
  /** Ворота периода → линия внутри них: нужно для подсказки по воротам. */
  lines: Record<number, number>;
  /** Временный профиль периода. Тип намеренно не считаем — он не меняется. */
  profile: string;
  /** Дата возврата (ISO, для подписи). */
  date: string;
}

export interface SaturnAddition {
  a: SaturnSide;
  b: SaturnSide;
  /** То же для общей карты пары: что добавляется композиту. */
  pair: { gates: number[]; channels: string[] };
}

function sideFor(person: Person): SaturnSide | null {
  const birth = birthMoment(person);
  const ret = findSaturnReturn(birth);
  if (!ret) return null;

  const natal = calcPersonalDesign(person);
  const personality = gatesAtMoment(ret);
  const design = gatesAtMoment(findDesignMoment(ret));
  const all = new Set([...personality, ...design].map((g) => g.gate));

  const gates = [...all].filter((g) => !natal.activatedGates.has(g)).sort((x, y) => x - y);

  // Канал считаем добавившимся, только если натально он НЕ был замкнут, а с
  // воротами периода замыкается: иначе подсветили бы то, что и так есть.
  const combined = new Set([...natal.activatedGates, ...all]);
  const channels = CHANNELS.filter((ch) => {
    const [g1, g2] = ch.gates;
    const wasNatal = natal.activatedGates.has(g1) && natal.activatedGates.has(g2);
    return !wasNatal && combined.has(g1) && combined.has(g2);
  }).map((ch) => ch.key);

  // Линия для каждых «сатурновых» ворот: без неё подсказка по воротам на
  // активном канале периода сообщала бы, что ворот нет вовсе.
  const lines: Record<number, number> = {};
  for (const g of [...personality, ...design]) {
    if (!natal.activatedGates.has(g.gate) && lines[g.gate] === undefined) lines[g.gate] = g.line;
  }

  return {
    gates,
    channels,
    lines,
    profile: `${personality[0].line}/${design[0].line}`,
    date: ret.toISOString().slice(0, 10),
  };
}

export function calcSaturnAddition(a: Person, b: Person): SaturnAddition | null {
  const sa = sideFor(a);
  const sb = sideFor(b);
  if (!sa || !sb) return null;

  // Для общей карты объединяем то, что добавляется каждому: композит пары
  // собирается из ворот обоих, поэтому и «погода» на нём общая.
  const gates = [...new Set([...sa.gates, ...sb.gates])].sort((x, y) => x - y);
  const channels = [...new Set([...sa.channels, ...sb.channels])];

  return { a: sa, b: sb, pair: { gates, channels } };
}
