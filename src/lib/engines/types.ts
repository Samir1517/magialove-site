/**
 * Общие типы входа/выхода движков — зеркалят core/schemas/input.schema.json
 * и core/schemas/pair_report.schema.json исходного проекта.
 */

export interface BirthPlace {
  city: string;
  country?: string;
  lat?: number;
  lon?: number;
  /** IANA-таймзона, напр. "Europe/Moscow". Нужна для движков с эфемеридами. */
  tz?: string;
}

export interface Person {
  fullName?: string;
  sex: "м" | "ж";
  /** ГГГГ-ММ-ДД */
  birthDate: string;
  /** ЧЧ:ММ местное время рождения */
  birthTime?: string;
  birthTimeKnown: boolean;
  birthPlace: BirthPlace;
}

export interface PairInput {
  partnerA: Person;
  partnerB: Person;
  context?: "брак_семья" | "текущие_отношения" | "на_старте" | "деловое_партнёрство";
}

export interface SystemBlocks {
  essence?: string;
  strengths?: string[];
  weaknesses?: string[];
  risks?: string[];
  potential?: string;
  dangers?: string[];
  positive_types?: string[];
  roles?: string;
}

export interface SystemReport<RawFeatures = unknown> {
  score: number;
  rawFeatures: RawFeatures;
  blocks: SystemBlocks;
}

/** Разобранная дата рождения на составляющие. */
export interface DateParts {
  day: number;
  month: number;
  year: number;
}

export function parseBirthDate(isoDate: string): DateParts {
  const [year, month, day] = isoDate.split("-").map(Number);
  if (!year || !month || !day) {
    throw new Error(`Некорректная дата рождения: "${isoDate}", ожидается ГГГГ-ММ-ДД`);
  }
  return { day, month, year };
}
