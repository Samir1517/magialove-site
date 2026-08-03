/**
 * Движок «Число имени» — расширяет исходный спек Нумерологии, где вход
 * заявлен как "дата+имя" (см. kalkulator/service/systems/numerology/ENGINE.md),
 * но таблиц для расчёта по имени в исходных данных не было, поэтому расчёт
 * по дате (число жизненного пути) был реализован раньше, а по имени — нет.
 *
 * МЕТОДИКА (задокументированное решение, не единственно возможное).
 * Кириллическая версия пифагорейской нумерологии имени строится по позиции
 * буквы в алфавите, сведённой по модулю 9 — прямой аналог латинской системы
 * (A=1..I=9, J=1..). Это стандартная, повсеместно используемая в русскоязычной
 * нумерологии таблица (напр. так же считают numeroscop.ru и большинство
 * подобных калькуляторов) — но не единственная: существуют версии с другим
 * порядком (напр. таблица Пифагора для чисел судьбы Александрова использует
 * иную раскладку). Мы выбрали позиционный mod-9 метод как наиболее
 * распространённый и легко проверяемый читателем вручную.
 *
 * Твёрдый и мягкий знаки (ъ, ь) не имеют собственного звука — исключены из
 * подсчёта (как и в большинстве таблиц). Й закреплён как согласная.
 *
 * Три числа, как в классической западной пифагорейской системе (Cheiro):
 *   Число Имени (Expression)   — сумма ВСЕХ букв, "как вы проявляетесь вовне".
 *   Число Души (Soul Urge)     — сумма ГЛАСНЫХ, "то, чего вы хотите на самом деле".
 *   Число Личности (Personality) — сумма СОГЛАСНЫХ, "как вас видят посторонние".
 */

import { reduceLifePath } from "./utils";

const ALPHABET =
  "абвгдеёжзийклмнопрстуфхцчшщъыьэюя".split("");

/** value(pos) = ((pos-1) % 9) + 1 — позиционная таблица Пифагора для кириллицы. */
const LETTER_VALUE: Record<string, number> = Object.fromEntries(
  ALPHABET.map((letter, i) => [letter, ((i) % 9) + 1])
);

const VOWELS = new Set(["а", "е", "ё", "и", "о", "у", "ы", "э", "ю", "я"]);
const SILENT = new Set(["ъ", "ь"]);

function normalize(name: string): string[] {
  return name
    .toLowerCase()
    .replace(/[^а-яё]/g, "")
    .split("")
    .filter((ch) => !SILENT.has(ch));
}

export interface NameNumbers {
  /** Число Имени — сумма всех букв. */
  expression: number;
  /** Число Души — сумма гласных. */
  soul: number;
  /** Число Личности — сумма согласных. */
  personality: number;
}

/** Считает три числа по полному имени (можно ФИО целиком или только имя). */
export function calcNameNumbers(fullName: string): NameNumbers {
  const letters = normalize(fullName);
  if (letters.length === 0) {
    throw new Error("Имя должно содержать хотя бы одну кириллическую букву");
  }

  let allSum = 0;
  let vowelSum = 0;
  let consonantSum = 0;

  for (const ch of letters) {
    const value = LETTER_VALUE[ch] ?? 0;
    allSum += value;
    if (VOWELS.has(ch)) vowelSum += value;
    else consonantSum += value;
  }

  return {
    expression: reduceLifePath(allSum),
    soul: reduceLifePath(vowelSum || 0),
    personality: reduceLifePath(consonantSum || 0),
  };
}

// ---------------------------------------------------------------------------
// Пара: сравнение по Числу Имени
// ---------------------------------------------------------------------------

/**
 * Балл близости по разнице чисел — та же шкала, что и в психоматрице
 * (`psychomatrix_lines.json` → `diff_scoring`): 0-1 разница = созвучие,
 * 2-3 = рабочая зона, 4+ = разные полюса. Переиспользуем готовое правило
 * вместо изобретения новой парной таблицы, которой для чисел имени не
 * существует ни в одном источнике.
 */
function diffScore(diff: number): number {
  if (diff <= 1) return 100;
  if (diff <= 3) return 60;
  return 20;
}

export interface NameCompatibilityRawFeatures {
  aNumbers: NameNumbers;
  bNumbers: NameNumbers;
  expressionDiff: number;
  soulDiff: number;
  personalityDiff: number;
}

export interface NameCompatibilityResult {
  score: number;
  rawFeatures: NameCompatibilityRawFeatures;
}

export function calcNameCompatibility(nameA: string, nameB: string): NameCompatibilityResult {
  const aNumbers = calcNameNumbers(nameA);
  const bNumbers = calcNameNumbers(nameB);

  const expressionDiff = Math.abs(aNumbers.expression - bNumbers.expression);
  const soulDiff = Math.abs(aNumbers.soul - bNumbers.soul);
  const personalityDiff = Math.abs(aNumbers.personality - bNumbers.personality);

  // Число Имени — основной показатель (вес 0.5), Душа и Личность — по 0.25:
  // Имя выражает пару вовне целиком, Душа/Личность — более частные срезы.
  const score =
    diffScore(expressionDiff) * 0.5 + diffScore(soulDiff) * 0.25 + diffScore(personalityDiff) * 0.25;

  return {
    score: Math.round(score * 10) / 10,
    rawFeatures: { aNumbers, bNumbers, expressionDiff, soulDiff, personalityDiff },
  };
}
