import { DEFAULT_TZ } from "@/lib/data/timezones";
import type { Person } from "./types";

/**
 * Пол в расчётах не участвует ни в одной из четырёх систем — включая Джйотиш:
 * у Парашары супруг читается от Венеры у обоих полов. Поэтому в бесплатных
 * расчётах мы его не спрашиваем и он остаётся значением по умолчанию.
 *
 * Но на ТЕКСТ он влияет, и сильно: «он бодр наравне с тобой» про женщину
 * читается как ошибка. Поэтому профессиональный разбор пол спрашивает — только
 * ради рода в формулировках, а не ради расчёта. Умолчания там женский у
 * первого партнёра и мужской у второго; подстановка окончаний —
 * в `lib/content/gender.ts`.
 *
 * Трём системам из четырёх от места рождения нужен только часовой пояс
 * (см. lib/data/timezones.ts), Джйотишу — ещё и координаты: лагна считается от
 * местного звёздного времени.
 *
 * Координаты необязательны. По ссылкам, сохранённым до их появления в адресе,
 * их нет, поэтому всё, что от них зависит, обязано работать и без них.
 */
export function makePerson(
  birthDate: string,
  birthTime?: string,
  tz?: string,
  coords?: { lat: number; lon: number },
  sex: Person["sex"] = "ж",
): Person {
  return {
    sex,
    birthDate,
    birthTime: birthTime || undefined,
    birthTimeKnown: Boolean(birthTime),
    birthPlace: { city: "", tz: tz || DEFAULT_TZ, lat: coords?.lat, lon: coords?.lon },
  };
}

/**
 * Разбирает пол из адреса страницы. Всё, кроме явного «м», читается как
 * женский: умолчание должно срабатывать и на старых ссылках, где параметра
 * ещё нет.
 */
export function parseSex(raw: string | null, fallback: Person["sex"]): Person["sex"] {
  if (raw === "м" || raw === "m") return "м";
  if (raw === "ж" || raw === "f" || raw === "w") return "ж";
  return fallback;
}

/** Считает систему, но не роняет всю страницу, если данных не хватило. */
export function safely<T>(fn: () => T): T | null {
  try {
    return fn();
  } catch {
    return null;
  }
}
