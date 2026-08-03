import { DEFAULT_TZ } from "@/lib/data/timezones";
import type { Person } from "./types";

/**
 * Пол в расчётах не участвует ни в одной из четырёх систем — поле техническое,
 * поэтому мы его и не спрашиваем. Место рождения нужно только часовым поясом
 * (см. lib/data/timezones.ts).
 */
export function makePerson(birthDate: string, birthTime?: string, tz?: string): Person {
  return {
    sex: "ж",
    birthDate,
    birthTime: birthTime || undefined,
    birthTimeKnown: Boolean(birthTime),
    birthPlace: { city: "", tz: tz || DEFAULT_TZ },
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
