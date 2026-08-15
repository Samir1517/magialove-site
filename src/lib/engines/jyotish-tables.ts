/**
 * Классические справочные таблицы Джйотиш, нужные для расчёта Аштакута Гуна-милан,
 * которых нет в kalkulator/service/systems/jyotish/data/*.json (там — только
 * тексты и веса, без самих астрологических соответствий). Источник — Брихат
 * Парашара Хора Шастра (BPHS) и устоявшаяся практика построения Аштакуты.
 *
 * Упрощения, отмеченные явно там, где применены (Вашья и Йони — из-за отсутствия
 * в data/ полных таблиц-градаций, используем сокращённые 2-3-уровневые версии
 * вместо полной классической сетки с половинными баллами).
 */

export type RashiName =
  | "Овен" | "Телец" | "Близнецы" | "Рак" | "Лев" | "Дева"
  | "Весы" | "Скорпион" | "Стрелец" | "Козерог" | "Водолей" | "Рыбы";

export const RASHI_NAMES: RashiName[] = [
  "Овен", "Телец", "Близнецы", "Рак", "Лев", "Дева",
  "Весы", "Скорпион", "Стрелец", "Козерог", "Водолей", "Рыбы",
];

/** Раши по сидерической долготе Луны: индекс 1-12 (Овен=1 ... Рыбы=12). */
export function rashiIndex(siderealLon: number): number {
  return Math.floor(siderealLon / 30) + 1;
}

export function rashiName(index: number): RashiName {
  return RASHI_NAMES[index - 1];
}

// ---------------------------------------------------------------------------
// Варна (духовный темперамент по стихии знака)
// ---------------------------------------------------------------------------

/** 4 варны по иерархии (для сравнения "не ниже партнёра"), 4 = высшая. */
const VARNA_RANK: Record<RashiName, number> = {
  // Брахман (вода) — 4
  "Рак": 4, "Скорпион": 4, "Рыбы": 4,
  // Кшатрий (огонь) — 3
  "Овен": 3, "Лев": 3, "Стрелец": 3,
  // Вайшья (земля) — 2
  "Телец": 2, "Дева": 2, "Козерог": 2,
  // Шудра (воздух) — 1
  "Близнецы": 1, "Весы": 1, "Водолей": 1,
};

export function varnaRank(rashi: RashiName): number {
  return VARNA_RANK[rashi];
}

/**
 * Название варны и стихия знака. Нужны, чтобы объяснить читателю, откуда взялся
 * балл: «1 из 1» без пояснения — число из ниоткуда.
 */
const VARNA_NAME: Record<number, { name: string; element: string }> = {
  4: { name: "брахман", element: "вода" },
  3: { name: "кшатрий", element: "огонь" },
  2: { name: "вайшья", element: "земля" },
  1: { name: "шудра", element: "воздух" },
};

export function varnaOf(rashi: RashiName): { name: string; element: string } {
  return VARNA_NAME[VARNA_RANK[rashi]];
}

// ---------------------------------------------------------------------------
// Вашья (группа притяжения/власти) — упрощённая 5-группная схема
// ---------------------------------------------------------------------------

type VashyaGroup = "chatushpada" | "manava" | "jalachara" | "vanachara" | "keeta";

const VASHYA_GROUP: Record<RashiName, VashyaGroup> = {
  "Овен": "chatushpada", "Телец": "chatushpada", "Стрелец": "chatushpada", "Козерог": "chatushpada",
  "Близнецы": "manava", "Дева": "manava", "Весы": "manava", "Водолей": "manava",
  "Рак": "jalachara", "Рыбы": "jalachara",
  "Лев": "vanachara",
  "Скорпион": "keeta",
};

/** Упрощённая матрица совместимости групп Вашья (0/1/2 балла из 2 макс.). */
const VASHYA_SCORE: Record<VashyaGroup, Partial<Record<VashyaGroup, number>>> = {
  chatushpada: { chatushpada: 2, manava: 1, jalachara: 1 },
  manava: { manava: 2, chatushpada: 1, jalachara: 1, vanachara: 1 },
  jalachara: { jalachara: 2, chatushpada: 1, manava: 1 },
  vanachara: { vanachara: 2, manava: 1 },
  keeta: { keeta: 2 },
};

/** Название группы Вашья по-русски — для объяснения балла в интерфейсе. */
const VASHYA_NAME: Record<VashyaGroup, string> = {
  chatushpada: "четвероногие",
  manava: "люди",
  jalachara: "водные",
  vanachara: "лесные",
  keeta: "насекомые",
};

export function vashyaGroupOf(rashi: RashiName): string {
  return VASHYA_NAME[VASHYA_GROUP[rashi]];
}

export function vashyaScore(a: RashiName, b: RashiName): number {
  const ga = VASHYA_GROUP[a];
  const gb = VASHYA_GROUP[b];
  return VASHYA_SCORE[ga]?.[gb] ?? VASHYA_SCORE[gb]?.[ga] ?? 0;
}

// ---------------------------------------------------------------------------
// Гана (темперамент по накшатре): Дэва / Мануша / Ракшаса
// ---------------------------------------------------------------------------

export type Gana = "Дэва" | "Мануша" | "Ракшаса";

/** Накшатры 1-27 → гана. Источник: классическая классификация BPHS. */
export const NAKSHATRA_GANA: Gana[] = [
  "Дэва", "Мануша", "Ракшаса", // 1 Ашвини, 2 Бхарани, 3 Криттика
  "Мануша", "Дэва", "Ракшаса", // 4 Рохини, 5 Мригашира, 6 Ардра
  "Дэва", "Мануша", "Ракшаса", // 7 Пунарвасу, 8 Пушья, 9 Ашлеша
  "Ракшаса", "Мануша", "Мануша", // 10 Магха, 11 Пурва Пхалгуни, 12 Уттара Пхалгуни
  "Мануша", "Дэва", "Ракшаса", // 13 Хаста, 14 Читра, 15 Свати
  "Ракшаса", "Мануша", "Ракшаса", // 16 Вишакха, 17 Анурадха, 18 Джйештха
  "Ракшаса", "Мануша", "Дэва", // 19 Мула, 20 Пурва Ашадха, 21 Уттара Ашадха
  "Дэва", "Ракшаса", "Ракшаса", // 22 Шравана, 23 Дхаништха, 24 Шатабхиша
  "Мануша", "Мануша", "Дэва", // 25 Пурва Бхадрапада, 26 Уттара Бхадрапада, 27 Ревати
];

export function ganaOf(nakshatraIndex: number): Gana {
  return NAKSHATRA_GANA[nakshatraIndex - 1];
}

/** Классическая таблица баллов Гана-куты (из 6), [гана партнёра A][гана партнёра B]. */
const GANA_SCORE: Record<Gana, Record<Gana, number>> = {
  "Дэва": { "Дэва": 6, "Мануша": 5, "Ракшаса": 1 },
  "Мануша": { "Дэва": 6, "Мануша": 6, "Ракшаса": 0 },
  "Ракшаса": { "Дэва": 1, "Мануша": 0, "Ракшаса": 6 },
};

export function ganaScore(a: Gana, b: Gana): number {
  return GANA_SCORE[a][b];
}

// ---------------------------------------------------------------------------
// Йони (сексуальная/инстинктивная совместимость) — упрощённая 3-уровневая схема
// ---------------------------------------------------------------------------

/** Накшатры 1-27 → животное йони. Источник: классическая классификация BPHS. */
export const NAKSHATRA_YONI: string[] = [
  "Лошадь", "Слон", "Овца", // 1-3
  "Змея", "Змея", "Собака", // 4-6
  "Кошка", "Овца", "Кошка", // 7-9
  "Крыса", "Крыса", "Корова", // 10-12
  "Буйвол", "Тигр", "Буйвол", // 13-15
  "Тигр", "Заяц", "Заяц", // 16-18
  "Собака", "Обезьяна", "Мангуст", // 19-21
  "Обезьяна", "Лев", "Лев", // 22-24
  "Корова", "Мангуст", "Слон", // 25-27
];

export function yoniOf(nakshatraIndex: number): string {
  return NAKSHATRA_YONI[nakshatraIndex - 1];
}

/** Пары животных, традиционно считающиеся "врагами" (0 баллов из 4). */
const YONI_ENEMIES: [string, string][] = [
  ["Лошадь", "Буйвол"], ["Слон", "Лев"], ["Овца", "Обезьяна"],
  ["Змея", "Мангуст"], ["Собака", "Заяц"], ["Кошка", "Крыса"],
  ["Корова", "Тигр"],
];

function areYoniEnemies(a: string, b: string): boolean {
  return YONI_ENEMIES.some(([x, y]) => (x === a && y === b) || (x === b && y === a));
}

/** Упрощённая шкала: совпадение=4, вражда=0, всё остальное=2 (из классических 0/1/2/3/4). */
export function yoniScore(a: string, b: string): number {
  if (a === b) return 4;
  if (areYoniEnemies(a, b)) return 0;
  return 2;
}

// ---------------------------------------------------------------------------
// Граха Майтри (ментальная дружба через управителей знаков)
// ---------------------------------------------------------------------------

export type Graha = "Солнце" | "Луна" | "Марс" | "Меркурий" | "Юпитер" | "Венера" | "Сатурн";

const RASHI_LORD: Record<RashiName, Graha> = {
  "Овен": "Марс", "Телец": "Венера", "Близнецы": "Меркурий", "Рак": "Луна",
  "Лев": "Солнце", "Дева": "Меркурий", "Весы": "Венера", "Скорпион": "Марс",
  "Стрелец": "Юпитер", "Козерог": "Сатурн", "Водолей": "Сатурн", "Рыбы": "Юпитер",
};

export function lordOf(rashi: RashiName): Graha {
  return RASHI_LORD[rashi];
}

/** Классическая таблица натуральной дружбы планет (BPHS): друг/нейтрал/враг. */
const GRAHA_RELATION: Record<Graha, { friends: Graha[]; enemies: Graha[] }> = {
  "Солнце": { friends: ["Луна", "Марс", "Юпитер"], enemies: ["Венера", "Сатурн"] },
  "Луна": { friends: ["Солнце", "Меркурий"], enemies: [] },
  "Марс": { friends: ["Солнце", "Луна", "Юпитер"], enemies: ["Меркурий"] },
  "Меркурий": { friends: ["Солнце", "Венера"], enemies: ["Луна"] },
  "Юпитер": { friends: ["Солнце", "Луна", "Марс"], enemies: ["Меркурий", "Венера"] },
  "Венера": { friends: ["Меркурий", "Сатурн"], enemies: ["Солнце", "Луна"] },
  "Сатурн": { friends: ["Меркурий", "Венера"], enemies: ["Солнце", "Луна", "Марс"] },
};

function relation(a: Graha, b: Graha): "same" | "friend" | "neutral" | "enemy" {
  if (a === b) return "same";
  if (GRAHA_RELATION[a].friends.includes(b) && GRAHA_RELATION[b].friends.includes(a)) return "friend";
  if (GRAHA_RELATION[a].enemies.includes(b) && GRAHA_RELATION[b].enemies.includes(a)) return "enemy";
  return "neutral";
}

/** Граха Майтри из 5: одна и та же планета=5, взаимные друзья=4, нейтрал=3, один враг=1, взаимные враги=0. */
export function grahaMaitriScore(a: RashiName, b: RashiName): number {
  const rel = relation(lordOf(a), lordOf(b));
  switch (rel) {
    case "same": return 5;
    case "friend": return 4;
    case "neutral": return 3;
    case "enemy": return 0;
  }
}
