/**
 * Движок «Нумерология» — см. kalkulator/service/systems/numerology/ENGINE.md.
 * Вход: дата рождения ×2 (+ имя опционально, для числа выражения/души — сейчас
 * не реализовано, т.к. в data/ нет таблиц для этого расчёта).
 *
 * Психоматрица (Квадрат Пифагора): ENGINE.md и psychomatrix_lines.json определяют
 * 8 линий как триады цифр (напр. "воля" = 1-2-3), без описания "дополнительных чисел"
 * классической методики Александрова. Реализуем самодостаточную версию, прямо
 * соответствующую данным проекта: значение линии = сумма количества вхождений
 * каждой из 3 цифр линии в полную дату рождения (ДДММГГГГ). Это задокументированное
 * упрощение — при необходимости точного воспроизведения классической методики
 * с "дополнительными числами" потребуется отдельно расширить формулу.
 */

import { digitSum, reduceLifePath } from "./utils";
import { parseBirthDate, type Person, type SystemReport } from "./types";

import lifePathData from "../data/numerology/life_path.json";
import pairMatrixData from "../data/numerology/pair_matrix.json";
import linesData from "../data/numerology/psychomatrix_lines.json";

// ---------------------------------------------------------------------------
// Число жизненного пути
// ---------------------------------------------------------------------------

export function calcLifePath(person: Person): number {
  const { day, month, year } = parseBirthDate(person.birthDate);
  const total = digitSum(day) + digitSum(month) + digitSum(year);
  return reduceLifePath(total);
}

export interface LifePathInfo {
  number: number;
  name: string;
  love: string;
}

export function getLifePathInfo(n: number): LifePathInfo {
  const numbers = (lifePathData as { numbers: Record<string, { name: string; love: string }> }).numbers;
  const info = numbers[String(n)];
  return { number: n, name: info.name, love: info.love };
}

// ---------------------------------------------------------------------------
// Психоматрица (Квадрат Пифагора)
// ---------------------------------------------------------------------------

export type PsychomatrixLineKey =
  | "will"
  | "family"
  | "stability"
  | "talent"
  | "selfworth"
  | "goal"
  | "temperament"
  | "spirit";

const LINE_DIGITS: Record<PsychomatrixLineKey, number[]> = {
  will: [1, 2, 3],
  family: [1, 4, 7],
  stability: [2, 5, 8],
  talent: [3, 6, 9],
  selfworth: [1, 5, 9],
  goal: [3, 5, 7],
  temperament: [4, 5, 6],
  spirit: [7, 8, 9],
};

/** Частота каждой цифры 1-9 в полной дате рождения (ДДММГГГГ). */
function digitFrequency(person: Person): Record<number, number> {
  const { day, month, year } = parseBirthDate(person.birthDate);
  const raw = `${String(day).padStart(2, "0")}${String(month).padStart(2, "0")}${year}`;
  const freq: Record<number, number> = {};
  for (const ch of raw) {
    const d = Number(ch);
    freq[d] = (freq[d] ?? 0) + 1;
  }
  return freq;
}

export type Psychomatrix = Record<PsychomatrixLineKey, number>;

export function calcPsychomatrix(person: Person): Psychomatrix {
  const freq = digitFrequency(person);
  const result = {} as Psychomatrix;
  for (const key of Object.keys(LINE_DIGITS) as PsychomatrixLineKey[]) {
    result[key] = LINE_DIGITS[key].reduce((sum, digit) => sum + (freq[digit] ?? 0), 0);
  }
  return result;
}

interface LineDiffScoring {
  lines: { key: PsychomatrixLineKey; title: string }[];
  diff_scoring: Record<string, number>;
}

const linesFile = linesData as unknown as LineDiffScoring;

/**
 * Количество каждой цифры 1-9 — это и есть ячейки Квадрата Пифагора.
 * Ноль в классической сетке не используется, поэтому не возвращается.
 */
export type DigitCounts = Record<number, number>;

export function calcDigitCounts(person: Person): DigitCounts {
  const freq = digitFrequency(person);
  const counts: DigitCounts = {};
  for (let d = 1; d <= 9; d++) counts[d] = freq[d] ?? 0;
  return counts;
}

/** Заголовки 8 линий из psychomatrix_lines.json — для подписей шкал в интерфейсе. */
export const LINE_TITLES: Record<PsychomatrixLineKey, string> = Object.fromEntries(
  linesFile.lines.map((l) => [l.key, l.title])
) as Record<PsychomatrixLineKey, string>;

function diffScore(diff: number): number {
  if (diff <= 1) return linesFile.diff_scoring["0-1"];
  if (diff <= 3) return linesFile.diff_scoring["2-3"];
  return linesFile.diff_scoring["4+"];
}

// ---------------------------------------------------------------------------
// Пара: base(pair_matrix) + средняя по линиям
// ---------------------------------------------------------------------------

interface PairMatrixEntry {
  base: number;
  dyn: string;
  note: string;
}

interface PairMatrixFile {
  pairs: Record<string, PairMatrixEntry>;
}

const pairMatrix = (pairMatrixData as unknown as PairMatrixFile).pairs;

function pairKeyFor(a: number, b: number): string {
  const [lo, hi] = a <= b ? [a, b] : [b, a];
  return `${lo}-${hi}`;
}

export function getPairMatrixEntry(a: number, b: number): { key: string; entry: PairMatrixEntry } {
  const key = pairKeyFor(a, b);
  const entry = pairMatrix[key] ?? pairMatrix["_default"];
  return { key, entry };
}

// ---------------------------------------------------------------------------
// Публичный расчёт
// ---------------------------------------------------------------------------

export interface NumerologyRawFeatures {
  aLifePath: number;
  bLifePath: number;
  pairKey: string;
  pairDynamic: string;
  aPsychomatrix: Psychomatrix;
  bPsychomatrix: Psychomatrix;
  /** Ячейки Квадрата Пифагора (цифра → сколько раз встречается в дате). */
  aDigits: DigitCounts;
  bDigits: DigitCounts;
  lineDiffs: Record<PsychomatrixLineKey, number>;
  lineScores: Record<PsychomatrixLineKey, number>;
}

export function calcNumerologyCompatibility(a: Person, b: Person): SystemReport<NumerologyRawFeatures> {
  const aLifePath = calcLifePath(a);
  const bLifePath = calcLifePath(b);
  const { key: pairKey, entry } = getPairMatrixEntry(aLifePath, bLifePath);

  const aPsychomatrix = calcPsychomatrix(a);
  const bPsychomatrix = calcPsychomatrix(b);

  const lineKeys = Object.keys(LINE_DIGITS) as PsychomatrixLineKey[];
  const lineDiffs = {} as Record<PsychomatrixLineKey, number>;
  const lineScores = {} as Record<PsychomatrixLineKey, number>;
  for (const key of lineKeys) {
    const diff = Math.abs(aPsychomatrix[key] - bPsychomatrix[key]);
    lineDiffs[key] = diff;
    lineScores[key] = diffScore(diff);
  }
  const avgLineScore = lineKeys.reduce((s, k) => s + lineScores[k], 0) / lineKeys.length;

  const score = entry.base * 0.6 + avgLineScore * 0.4;

  return {
    score: Math.round(score * 10) / 10,
    rawFeatures: {
      aLifePath,
      bLifePath,
      pairKey,
      pairDynamic: entry.dyn,
      aPsychomatrix,
      bPsychomatrix,
      aDigits: calcDigitCounts(a),
      bDigits: calcDigitCounts(b),
      lineDiffs,
      lineScores,
    },
    blocks: {}, // текстовые блоки — из content/chislo-zhiznennogo-puti/*.md и content/psihomatritsa/*.md
  };
}
