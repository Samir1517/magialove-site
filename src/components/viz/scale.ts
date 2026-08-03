/**
 * Единый язык визуализации баллов для всех 4 систем.
 *
 * ПРИНЦИП (ARCHITECTURE.md §5 — «нет нейтральных качеств»): шкала НЕ является
 * приговором «хорошо/плохо». Поэтому здесь сознательно нет красного цвета
 * тревоги и слов «плохо»/«несовместимы»: низкий балл — это зона роста и
 * то, что паре стоит проговорить, а не диагноз. Палитра построена на тех же
 * тонах, что и лендинг (золото / розовый / лиловый), чтобы низкий балл читался
 * как другой характер связи, а не как ошибка.
 */

export type Band = "high" | "mid" | "low";

export interface BandStyle {
  key: Band;
  /** Короткая подпись рядом со шкалой. */
  label: string;
  /** Начало градиента заливки. */
  from: string;
  /** Конец градиента заливки. */
  to: string;
  /** Цвет текста-подписи на светлом фоне. */
  ink: string;
  /** Мягкая подложка (чипы, ячейки сетки). */
  wash: string;
}

export const BANDS: Record<Band, BandStyle> = {
  high: {
    key: "high",
    label: "созвучие",
    from: "#d6bd98",
    to: "#b99d74",
    ink: "#8a6c3e",
    wash: "#f6efe2",
  },
  mid: {
    key: "mid",
    label: "рабочая зона",
    from: "#edc4cd",
    to: "#d48ca6",
    ink: "#a2698a",
    wash: "#fbeef1",
  },
  low: {
    key: "low",
    label: "зона роста",
    from: "#cdbcdd",
    to: "#9b7fb0",
    ink: "#7a5f90",
    wash: "#f2ecf8",
  },
};

/** Порог отнесения процента к полосе. */
export function bandOf(percent: number): Band {
  if (percent >= 70) return "high";
  if (percent >= 45) return "mid";
  return "low";
}

export function bandStyle(percent: number): BandStyle {
  return BANDS[bandOf(percent)];
}

/** Приводит балл к процентам, безопасно обрабатывая max = 0. */
export function toPercent(score: number, max: number): number {
  if (max <= 0) return 0;
  return Math.max(0, Math.min(100, (score / max) * 100));
}

/** Аккуратное форматирование балла: 7 → «7», 6.5 → «6,5» (русская запятая). */
export function formatScore(n: number): string {
  const rounded = Math.round(n * 10) / 10;
  return String(rounded).replace(".", ",");
}
