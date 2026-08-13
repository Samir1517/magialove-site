import { findCityByTz } from "@/lib/data/cities";

/**
 * Координаты места рождения в адресе расчёта. Нужны одному Джйотишу — лагна
 * считается от местного звёздного времени, и вывести её из часового пояса
 * нельзя: Europe/Moscow тянется на десятки градусов долготы, а десять градусов
 * это почти целый знак разницы в асценденте.
 *
 * Параметры необязательные. Ссылки, сохранённые до их появления, продолжают
 * работать — расчёт тогда идёт от знака Луны, как и раньше.
 */
export interface Coords {
  lat: number;
  lon: number;
}

/**
 * Два знака после запятой — это около километра. Лагна смещается примерно на
 * градус за четыре минуты звёздного времени, то есть километр долготы стоит
 * доли угловой секунды: точность заведомо избыточна, зато адрес короткий.
 */
export function putCoords(params: URLSearchParams, side: "a" | "b", c: Coords | null): void {
  if (!c) return;
  params.set(`${side}lat`, c.lat.toFixed(2));
  params.set(`${side}lon`, c.lon.toFixed(2));
}

export function readCoords(
  get: (key: string) => string | null,
  side: "a" | "b",
): Coords | undefined {
  const lat = Number(get(`${side}lat`));
  const lon = Number(get(`${side}lon`));
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return undefined;
  if (get(`${side}lat`) === null || get(`${side}lon`) === null) return undefined;
  return { lat, lon };
}

/**
 * Координаты города, который сейчас показан в поле. Поле предзаполнено, и если
 * человек его не трогал, onChange не сработает — но в поле написано конкретное
 * название, поэтому взять координаты именно этого города честно.
 */
export function coordsOfShownCity(tz: string): Coords | null {
  const city = findCityByTz(tz);
  return city ? { lat: city.lat, lon: city.lon } : null;
}
