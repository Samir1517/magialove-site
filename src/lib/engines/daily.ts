/**
 * Слой «сегодня для вашей пары»: аркан и число текущего дня, наложенные на
 * матрицу конкретной пары. Меняется каждые сутки — это то, ради чего есть смысл
 * возвращаться на страницу своей пары.
 *
 * Всё считается в браузере от системной даты пользователя, поэтому работает на
 * статическом экспорте без сервера и без пересборки сайта.
 *
 * Методика (наша, задокументированная — классические источники «аркана дня для
 * пары» не описывают, это прикладная надстройка над Матрицей судьбы):
 *   аркан дня        = свод(день + месяц + свод(год))
 *   аркан дня пары   = свод(центр парной матрицы + аркан дня)
 *   число дня пары   = свод чисел жизненного пути обоих + цифровая сумма даты
 */

import { digitSum, reduceTo, reduceLifePath } from "./utils";
import { calcIndividualMatrix, overlayPair } from "./matrix";
import { calcLifePath } from "./numerology";
import type { Person } from "./types";

const MAX_ARCANUM = 22;

export interface DailyReading {
  /** Дата в формате ГГГГ-ММ-ДД, от которой сделан расчёт. */
  isoDate: string;
  /** Аркан самого дня — общий для всех. */
  dayArcanum: number;
  /** Аркан дня, наложенный на матрицу этой пары. */
  pairArcanum: number;
  /** Число дня для пары. */
  pairNumber: number;
}

export function toIsoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function calcDaily(a: Person, b: Person, today: Date): DailyReading {
  const day = today.getDate();
  const month = today.getMonth() + 1;
  const year = today.getFullYear();

  const dayArcanum = reduceTo(day + month + reduceTo(year, MAX_ARCANUM), MAX_ARCANUM);

  const pairMatrix = overlayPair(calcIndividualMatrix(a), calcIndividualMatrix(b));
  const pairArcanum = reduceTo(pairMatrix.center + dayArcanum, MAX_ARCANUM);

  const pairNumber = reduceLifePath(
    calcLifePath(a) + calcLifePath(b) + digitSum(day) + digitSum(month) + digitSum(year)
  );

  return { isoDate: toIsoDate(today), dayArcanum, pairArcanum, pairNumber };
}

const MONTHS_GENITIVE = [
  "января", "февраля", "марта", "апреля", "мая", "июня",
  "июля", "августа", "сентября", "октября", "ноября", "декабря",
];

export function formatRuDate(d: Date): string {
  return `${d.getDate()} ${MONTHS_GENITIVE[d.getMonth()]}`;
}
