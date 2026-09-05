/**
 * 12 знаков западного (тропического) зодиака — классические соответствия:
 * стихия, крест (кардинальный/фиксированный/мутабельный), управитель.
 * Общеизвестные факты традиции, не требующие отдельной проверки источников
 * (в отличие от Джйотиш/Дизайна человека — здесь нет узкоспециальных данных,
 * которые стоило бы перепроверять).
 *
 * ВАЖНО: этот раздел — справочный хаб вне 4 расчётных систем сервиса (см.
 * semantika/_generator.py, секция "5. ЗНАКИ ЗОДИАКА"). Здесь нет калькулятора —
 * страницы объясняют классическую совместимость по знаку Солнца и в конце
 * ведут на реальный расчёт по 4 системам.
 */

export type Element = "fire" | "earth" | "air" | "water";
export type Modality = "cardinal" | "fixed" | "mutable";

export interface ZodiacSign {
  key: string;
  name: string;
  genitive: string; // родительный падеж, для "совместимость Овна и..."
  slug: string;
  element: Element;
  modality: Modality;
  ruler: string;
  dateRange: string;
  strength: string;
  shadow: string;
}

export const ELEMENT_LABEL: Record<Element, string> = {
  fire: "Огонь",
  earth: "Земля",
  air: "Воздух",
  water: "Вода",
};

export const MODALITY_LABEL: Record<Modality, string> = {
  cardinal: "Кардинальный",
  fixed: "Фиксированный",
  mutable: "Мутабельный",
};

export const ZODIAC_SIGNS: ZodiacSign[] = [
  {
    key: "oven", name: "Овен", genitive: "Овна", slug: "oven",
    element: "fire", modality: "cardinal", ruler: "Марс", dateRange: "21 марта — 19 апреля",
    strength: "инициатива и смелость первого шага",
    shadow: "нетерпение и эгоцентричная спешка",
  },
  {
    key: "telec", name: "Телец", genitive: "Тельца", slug: "telec",
    element: "earth", modality: "fixed", ruler: "Венера", dateRange: "20 апреля — 20 мая",
    strength: "надёжность и чувственная устойчивость",
    shadow: "упрямство и собственничество",
  },
  {
    key: "bliznecy", name: "Близнецы", genitive: "Близнецов", slug: "bliznecy",
    element: "air", modality: "mutable", ruler: "Меркурий", dateRange: "21 мая — 20 июня",
    strength: "любопытство и лёгкость в общении",
    shadow: "непостоянство и поверхностность",
  },
  {
    key: "rak", name: "Рак", genitive: "Рака", slug: "rak",
    element: "water", modality: "cardinal", ruler: "Луна", dateRange: "21 июня — 22 июля",
    strength: "забота и эмоциональная чуткость",
    shadow: "обидчивость и цепляние за прошлое",
  },
  {
    key: "lev", name: "Лев", genitive: "Льва", slug: "lev",
    element: "fire", modality: "fixed", ruler: "Солнце", dateRange: "23 июля — 22 августа",
    strength: "щедрость и природная харизма",
    shadow: "тщеславие и потребность в постоянном восхищении",
  },
  {
    key: "deva", name: "Дева", genitive: "Девы", slug: "deva",
    element: "earth", modality: "mutable", ruler: "Меркурий", dateRange: "23 августа — 22 сентября",
    strength: "внимание к деталям и готовность помочь",
    shadow: "критичность и перфекционизм",
  },
  {
    key: "vesy", name: "Весы", genitive: "Весов", slug: "vesy",
    element: "air", modality: "cardinal", ruler: "Венера", dateRange: "23 сентября — 22 октября",
    strength: "дипломатичность и чувство прекрасного",
    shadow: "нерешительность и избегание конфликта",
  },
  {
    key: "skorpion", name: "Скорпион", genitive: "Скорпиона", slug: "skorpion",
    element: "water", modality: "fixed", ruler: "Марс/Плутон", dateRange: "23 октября — 21 ноября",
    strength: "глубина и абсолютная преданность",
    shadow: "ревность и скрытность",
  },
  {
    key: "strelec", name: "Стрелец", genitive: "Стрельца", slug: "strelec",
    element: "fire", modality: "mutable", ruler: "Юпитер", dateRange: "22 ноября — 21 декабря",
    strength: "оптимизм и жажда свободы",
    shadow: "бестактность и непостоянство обещаний",
  },
  {
    key: "kozerog", name: "Козерог", genitive: "Козерога", slug: "kozerog",
    element: "earth", modality: "cardinal", ruler: "Сатурн", dateRange: "22 декабря — 19 января",
    strength: "дисциплина и ответственность",
    shadow: "холодность и зацикленность на статусе",
  },
  {
    key: "vodoley", name: "Водолей", genitive: "Водолея", slug: "vodoley",
    element: "air", modality: "fixed", ruler: "Сатурн/Уран", dateRange: "20 января — 18 февраля",
    strength: "независимость и оригинальность мышления",
    shadow: "отстранённость и непредсказуемость",
  },
  {
    key: "ryby", name: "Рыбы", genitive: "Рыб", slug: "ryby",
    element: "water", modality: "mutable", ruler: "Юпитер/Нептун", dateRange: "19 февраля — 20 марта",
    strength: "сострадание и интуиция",
    shadow: "уход от реальности и растворение себя в другом",
  },
];

export function signByKey(key: string): ZodiacSign | undefined {
  return ZODIAC_SIGNS.find((s) => s.key === key);
}

/**
 * Три знака зодиака стоят во множественном числе, и глагол при них меняется:
 * «Лев приносит», но «Весы приносят». Без этого на страницах Близнецов, Весов
 * и Рыб — а это 33 страницы пар из 66 — выходило «Весы скорее настаивает».
 */
const PLURAL_KEYS = new Set(["bliznecy", "vesy", "ryby"]);

export function isPluralSign(s: ZodiacSign): boolean {
  return PLURAL_KEYS.has(s.key);
}

/**
 * Согласование глагола со знаком. Формы задаются обеими: автоматически
 * образовать множественное число в русском нельзя.
 *
 *   verb(sign, "приносит", "приносят")
 */
export function verb(s: ZodiacSign, singular: string, plural: string): string {
  return isPluralSign(s) ? plural : singular;
}

export function elementPairKey(a: Element, b: Element): string {
  return [a, b].sort().join("-");
}

export function modalityPairKey(a: Modality, b: Modality): string {
  return [a, b].sort().join("-");
}
