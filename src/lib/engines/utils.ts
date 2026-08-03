/**
 * Общие числовые утилиты для арифметических движков (Матрица судьбы, Нумерология).
 */

/** Сумма цифр числа. */
export function digitSum(n: number): number {
  return Math.abs(n)
    .toString()
    .split("")
    .reduce((sum, d) => sum + Number(d), 0);
}

/**
 * Свод числа последовательным суммированием цифр, пока результат не станет ≤ max.
 * Используется в Матрице судьбы (max=22 — диапазон арканов) и в Нумерологии (max=9,
 * с исключением мастер-чисел — см. {@link reduceLifePath}).
 *
 * Пример (Матрица, max=22): 29 → 2+9=11 (11≤22, стоп — НЕ сводится дальше до 2).
 * Пример (Матрица, max=22): 1987 → 1+9+8+7=25 → 2+5=7 (25>22, сводим ещё раз).
 */
export function reduceTo(n: number, max: number): number {
  let x = n;
  while (x > max) {
    x = digitSum(x);
  }
  return x;
}

/** Мастер-числа нумерологии — не сводятся до однозначных. */
export const MASTER_NUMBERS = [11, 22, 33] as const;

/**
 * Свод числа до однозначного (1-9), но с остановкой на мастер-числе 11/22/33,
 * если оно возникло в процессе свода. Используется для Числа жизненного пути.
 */
export function reduceLifePath(n: number): number {
  let x = n;
  while (x > 9 && !(MASTER_NUMBERS as readonly number[]).includes(x)) {
    x = digitSum(x);
  }
  return x;
}
