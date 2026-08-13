/**
 * Общий модуль работы с эфемеридами для движков Дизайн человека и Джйотиш.
 *
 * Технология: `astronomy-engine` (чистый TS/JS, без нативных зависимостей — работает
 * и в браузере, и при сборке) вместо `pyswisseph`, который указан в исходных ENGINE.md
 * как справочная технология, но является Python-библиотекой и несовместим со
 * статическим Next.js-экспортом. Даёт геоцентрические истинные эклиптические долготы
 * "of date" — тот же справочный кадр, что и режим по умолчанию в pyswisseph.
 *
 * Точность: достаточна для определения знака/дома/накшатры (границы в градусах),
 * не заявляется угловая секунда — для сверки с профессиональным ПО возможны
 * расхождения в пределах долей градуса.
 */

import {
  Body,
  GeoVector,
  Ecliptic,
  EclipticGeoMoon,
  SunPosition,
  SearchSunLongitude,
  SiderealTime,
  type AstroTime,
} from "astronomy-engine";
import { fromZonedTime } from "date-fns-tz";
import type { Person } from "./types";

// ---------------------------------------------------------------------------
// Локальное время рождения → момент UTC
// ---------------------------------------------------------------------------

/** Переводит местное время рождения (с IANA-таймзоной) в момент UTC. */
export function birthMoment(person: Person): Date {
  if (!person.birthTime) {
    throw new Error("Для расчёта по эфемеридам нужно точное время рождения");
  }
  const tz = person.birthPlace.tz ?? "UTC";
  const localIso = `${person.birthDate}T${person.birthTime}:00`;
  return fromZonedTime(localIso, tz);
}

// ---------------------------------------------------------------------------
// Тропические геоцентрические долготы (истинная эклиптика даты)
// ---------------------------------------------------------------------------

const OUTER_BODIES = [
  Body.Mercury,
  Body.Venus,
  Body.Mars,
  Body.Jupiter,
  Body.Saturn,
  Body.Uranus,
  Body.Neptune,
  Body.Pluto,
] as const;

export type PlanetKey =
  | "sun"
  | "moon"
  | "mercury"
  | "venus"
  | "mars"
  | "jupiter"
  | "saturn"
  | "uranus"
  | "neptune"
  | "pluto";

const BODY_BY_KEY: Record<Exclude<PlanetKey, "sun" | "moon">, Body> = {
  mercury: Body.Mercury,
  venus: Body.Venus,
  mars: Body.Mars,
  jupiter: Body.Jupiter,
  saturn: Body.Saturn,
  uranus: Body.Uranus,
  neptune: Body.Neptune,
  pluto: Body.Pluto,
};

/** Нормализация угла в диапазон [0, 360). */
export function norm360(deg: number): number {
  return ((deg % 360) + 360) % 360;
}

/** Тропическая геоцентрическая долгота Солнца (истинная эклиптика даты), градусы. */
export function sunLongitude(date: Date): number {
  return norm360(SunPosition(date).elon);
}

/** Тропическая геоцентрическая долгота Луны (истинная эклиптика даты), градусы. */
export function moonLongitude(date: Date): number {
  return norm360(EclipticGeoMoon(date).lon);
}

/** Тропическая геоцентрическая долгота планеты (кроме Солнца/Луны), градусы. */
export function planetLongitude(key: Exclude<PlanetKey, "sun" | "moon">, date: Date): number {
  const vec = GeoVector(BODY_BY_KEY[key], date, true);
  return norm360(Ecliptic(vec).elon);
}

/** Все тропические долготы разом — используется движком Дизайна человека. */
export function allTropicalLongitudes(date: Date): Record<PlanetKey, number> {
  const result = {
    sun: sunLongitude(date),
    moon: moonLongitude(date),
  } as Record<PlanetKey, number>;
  for (const key of Object.keys(BODY_BY_KEY) as (keyof typeof BODY_BY_KEY)[]) {
    result[key] = planetLongitude(key, date);
  }
  return result;
}

/**
 * Средний Северный узел Луны (Mean Node) — формула Meeus, "Astronomical
 * Algorithms" (стандартная, широко используемая в астрологическом ПО).
 * astronomy-engine не даёт готовой позиции узла на произвольный момент
 * (только SearchMoonNode — момент пересечения), поэтому считаем сами.
 */
export function meanNorthNodeLongitude(date: Date): number {
  const J2000_UTC = Date.UTC(2000, 0, 1, 12, 0, 0);
  const T = (date.getTime() - J2000_UTC) / (365.25 * 24 * 3600 * 1000) / 100; // юлианские века
  const omega = 125.0445222 - 1934.1362608 * T + 0.0020708 * T * T + (T * T * T) / 450000;
  return norm360(omega);
}

/** Южный узел — всегда напротив Северного. */
export function meanSouthNodeLongitude(date: Date): number {
  return norm360(meanNorthNodeLongitude(date) + 180);
}

// ---------------------------------------------------------------------------
// Айянамша Лахири (сидерическая поправка для Джйотиш)
// ---------------------------------------------------------------------------

/**
 * Линейное приближение айянамши Лахири (Chitra Paksha): 23.85325° на эпоху J2000.0
 * (2000-01-01 12:00 TT) + скорость прецессии ~50.2388475"/год.
 *
 * Это упрощение официальной полиномиальной формулы Swiss Ephemeris — расхождение
 * не превышает нескольких угловых минут в диапазоне действующих дат рождения,
 * чего достаточно для определения накшатры (ширина 13°20′) и раши (30°), но
 * НЕ подходит для задач, требующих угловую секунду точности.
 */
export function lahiriAyanamsha(date: Date): number {
  const J2000_UTC = Date.UTC(2000, 0, 1, 12, 0, 0);
  const yearsSinceJ2000 = (date.getTime() - J2000_UTC) / (365.25 * 24 * 3600 * 1000);
  const AYANAMSHA_AT_J2000_DEG = 23.85325;
  const PRECESSION_DEG_PER_YEAR = 50.2388475 / 3600;
  return AYANAMSHA_AT_J2000_DEG + yearsSinceJ2000 * PRECESSION_DEG_PER_YEAR;
}

/** Переводит тропическую долготу в сидерическую (Лахири) на заданную дату. */
export function toSidereal(tropicalLon: number, date: Date): number {
  return norm360(tropicalLon - lahiriAyanamsha(date));
}

// ---------------------------------------------------------------------------
// Поиск момента "-88° солнечной дуги" (Дизайн в системе Дизайна человека)
// ---------------------------------------------------------------------------

/**
 * Находит момент времени, когда геоцентрическая тропическая долгота Солнца была
 * на 88° меньше, чем в момент рождения (~88 дней до рождения — "Дизайн" в системе
 * Дизайна человека). Ищет назад от даты рождения, с запасом 100 дней.
 */
export function findDesignMoment(birthUtc: Date): Date {
  const birthSunLon = sunLongitude(birthUtc);
  const targetLon = norm360(birthSunLon - 88);
  // Ищем от точки на 100 дней раньше рождения вперёд к рождению — так регион поиска
  // гарантированно содержит момент истинного пересечения targetLon.
  const searchStart = new Date(birthUtc.getTime() - 100 * 24 * 3600 * 1000);
  const found: AstroTime | null = SearchSunLongitude(targetLon, searchStart, 100);
  if (!found) {
    throw new Error("Не удалось найти момент -88° солнечной дуги");
  }
  return found.date;
}

// ---------------------------------------------------------------------------
// Асцендент (Лагна)
// ---------------------------------------------------------------------------

/**
 * Наклон эклиптики на дату (формула IAU 1980, линейный член). Разница с полной
 * формулой на исторических датах — доли угловой секунды, что для определения
 * знака асцендента (30°) избыточно точно.
 */
function obliquityDeg(date: Date): number {
  const J2000_UTC = Date.UTC(2000, 0, 1, 12, 0, 0);
  const centuries = (date.getTime() - J2000_UTC) / (36525 * 24 * 3600 * 1000);
  return 23.439291 - 0.0130042 * centuries;
}

/**
 * Тропическая долгота асцендента — точки эклиптики, восходящей над горизонтом.
 *
 * Классическая формула: tan(Asc) = cos(RAMC) / −(sin(RAMC)·cos ε + tan φ · sin ε),
 * где RAMC — местное звёздное время в градусах, φ — географическая широта.
 * Без широты и долготы места асцендент посчитать нельзя в принципе: он зависит
 * не только от момента, но и от точки на Земле.
 */
export function ascendantTropical(utc: Date, lat: number, lon: number): number {
  const rad = Math.PI / 180;
  // SiderealTime отдаёт гринвичское звёздное время в часах.
  const lstHours = SiderealTime(utc) + lon / 15;
  const ramc = norm360(lstHours * 15) * rad;
  const eps = obliquityDeg(utc) * rad;
  const phi = lat * rad;

  const asc = Math.atan2(
    Math.cos(ramc),
    -(Math.sin(ramc) * Math.cos(eps) + Math.tan(phi) * Math.sin(eps))
  );
  return norm360((asc / rad + 360) % 360);
}

/** Сидерический (Лахири) асцендент — то, что в Джйотиш называют Лагной. */
export function ascendantSidereal(utc: Date, lat: number, lon: number): number {
  return toSidereal(ascendantTropical(utc, lat, lon), utc);
}
