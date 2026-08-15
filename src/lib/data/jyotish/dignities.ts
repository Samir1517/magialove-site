/**
 * Достоинства планет в Джйотише: экзальтация, падение, своя обитель.
 *
 * Это классика, зафиксированная в «Брихат Парашара Хора Шастре» и повторённая
 * во всех учебниках: знание общего достояния, не чей-то авторский корпус.
 * Градусы экзальтации точные — планета сильнее всего именно в этой точке, а не
 * «где-то в знаке».
 *
 * Раху и Кету сюда не входят. У теневых точек нет тела, а классические тексты
 * расходятся в том, где их экзальтация: одни называют Телец и Скорпион, другие
 * Близнецы и Стрелец, третьи отрицают её вовсе. Выбирать одну версию и подавать
 * её как факт мы не будем — молчание честнее.
 */
export interface Dignity {
  /** Знак экзальтации и точный градус наибольшей силы. */
  exaltation: { rashi: string; degree: number };
  /** Знак падения — всегда противоположен экзальтации. */
  debilitation: { rashi: string; degree: number };
  /** Знаки, которыми планета управляет. */
  own: string[];
  /** Мулатрикона — «корневая треугольная» зона особой силы. */
  moolatrikona?: { rashi: string; from: number; to: number };
}

export const DIGNITIES: Record<string, Dignity> = {
  sun: {
    exaltation: { rashi: "Овен", degree: 10 },
    debilitation: { rashi: "Весы", degree: 10 },
    own: ["Лев"],
    moolatrikona: { rashi: "Лев", from: 0, to: 20 },
  },
  moon: {
    exaltation: { rashi: "Телец", degree: 3 },
    debilitation: { rashi: "Скорпион", degree: 3 },
    own: ["Рак"],
    moolatrikona: { rashi: "Телец", from: 4, to: 30 },
  },
  mars: {
    exaltation: { rashi: "Козерог", degree: 28 },
    debilitation: { rashi: "Рак", degree: 28 },
    own: ["Овен", "Скорпион"],
    moolatrikona: { rashi: "Овен", from: 0, to: 12 },
  },
  mercury: {
    exaltation: { rashi: "Дева", degree: 15 },
    debilitation: { rashi: "Рыбы", degree: 15 },
    own: ["Близнецы", "Дева"],
    moolatrikona: { rashi: "Дева", from: 16, to: 20 },
  },
  jupiter: {
    exaltation: { rashi: "Рак", degree: 5 },
    debilitation: { rashi: "Козерог", degree: 5 },
    own: ["Стрелец", "Рыбы"],
    moolatrikona: { rashi: "Стрелец", from: 0, to: 10 },
  },
  venus: {
    exaltation: { rashi: "Рыбы", degree: 27 },
    debilitation: { rashi: "Дева", degree: 27 },
    own: ["Телец", "Весы"],
    moolatrikona: { rashi: "Весы", from: 0, to: 15 },
  },
  saturn: {
    exaltation: { rashi: "Весы", degree: 20 },
    debilitation: { rashi: "Овен", degree: 20 },
    own: ["Козерог", "Водолей"],
    moolatrikona: { rashi: "Водолей", from: 0, to: 20 },
  },
};

export type DignityState =
  | "экзальтация"
  | "мулатрикона"
  | "своя обитель"
  | "падение"
  | null;

/**
 * Достоинство планеты по её знаку и градусу.
 *
 * Порядок проверок важен: мулатрикона всегда лежит внутри своего знака,
 * поэтому её нужно проверить раньше, иначе она никогда не сработает.
 */
export function dignityOf(key: string, rashi: string, degreeInRashi: number): DignityState {
  const d = DIGNITIES[key];
  if (!d) return null;
  if (rashi === d.exaltation.rashi) return "экзальтация";
  if (rashi === d.debilitation.rashi) return "падение";
  if (d.moolatrikona && rashi === d.moolatrikona.rashi) {
    const { from, to } = d.moolatrikona;
    if (degreeInRashi >= from && degreeInRashi < to) return "мулатрикона";
  }
  if (d.own.includes(rashi)) return "своя обитель";
  return null;
}

/** Насколько планета близка к точному градусу экзальтации или падения. */
export function exactness(key: string, rashi: string, degreeInRashi: number): number | null {
  const d = DIGNITIES[key];
  if (!d) return null;
  if (rashi === d.exaltation.rashi) return Math.abs(degreeInRashi - d.exaltation.degree);
  if (rashi === d.debilitation.rashi) return Math.abs(degreeInRashi - d.debilitation.degree);
  return null;
}

/**
 * Сожжение (астангата): планета слишком близко к Солнцу и «теряет голос».
 *
 * Орбисы традиционные и у разных школ отличаются на градус-два; берём
 * распространённый набор из БПХШ. Солнце само себя сжечь не может, у теневых
 * точек сожжения нет.
 */
const COMBUST_ORB: Record<string, number> = {
  moon: 12,
  mars: 17,
  mercury: 14,
  jupiter: 11,
  venus: 10,
  saturn: 15,
};

export function isCombust(key: string, lon: number, sunLon: number): boolean {
  const orb = COMBUST_ORB[key];
  if (!orb) return false;
  const diff = Math.abs(((lon - sunLon + 540) % 360) - 180);
  return 180 - diff <= orb;
}
