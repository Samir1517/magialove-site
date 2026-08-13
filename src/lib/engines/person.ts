import { DEFAULT_TZ } from "@/lib/data/timezones";
import type { Person } from "./types";

/**
 * Пол в расчётах не участвует ни в одной из четырёх систем — поле техническое,
 * поэтому мы его и не спрашиваем. Трём системам из четырёх от места рождения
 * нужен только часовой пояс (см. lib/data/timezones.ts), Джйотишу — ещё и
 * координаты: лагна считается от местного звёздного времени.
 *
 * Координаты необязательны. По ссылкам, сохранённым до их появления в адресе,
 * их нет, поэтому всё, что от них зависит, обязано работать и без них.
 */
export function makePerson(
  birthDate: string,
  birthTime?: string,
  tz?: string,
  coords?: { lat: number; lon: number },
): Person {
  return {
    sex: "ж",
    birthDate,
    birthTime: birthTime || undefined,
    birthTimeKnown: Boolean(birthTime),
    birthPlace: { city: "", tz: tz || DEFAULT_TZ, lat: coords?.lat, lon: coords?.lon },
  };
}

/** Считает систему, но не роняет всю страницу, если данных не хватило. */
export function safely<T>(fn: () => T): T | null {
  try {
    return fn();
  } catch {
    return null;
  }
}
