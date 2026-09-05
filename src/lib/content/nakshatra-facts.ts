import nakshatraData from "@/lib/data/jyotish/nakshatra.json";

/**
 * Классическая фактура 27 накшатр: управитель, божество, символ, гана, йони.
 *
 * Зачем отдельный файл. В движке (`nakshatra.json`) лежит только то, что нужно
 * для подсчёта Гуна-милана — нади и раши. Остальное было рассыпано прозой по
 * 27 файлам `.md`, то есть существовало как текст, но не как данные: ни
 * перелинковать по гане, ни собрать FAQ, ни проверить на ошибку. Одна такая
 * ошибка там и жила — у Ашвини гана «Дева» была подписана как «человеческая»,
 * хотя Дева это божественная, а человеческая — Манушья.
 *
 * Все соответствия ниже — устойчивый корпус традиции (Брихат Парашара Хора
 * Шастра и следующая ей литература), а не авторская трактовка. Проверяемая
 * закономерность: управители идут циклом Кету → Венера → Солнце → Луна → Марс
 * → Раху → Юпитер → Сатурн → Меркурий, повторяясь трижды (порядок периодов
 * Вимшоттари даши), а ган ровно по 9 на каждую из трёх групп.
 */

export type Gana = "Дева" | "Манушья" | "Ракшаса";

export interface NakshatraFacts {
  /** Планета-управитель по Вимшоттари. */
  planet: string;
  /** Управляющее божество. */
  deity: string;
  /** Традиционный символ накшатры. */
  symbol: string;
  /** Гана — темперамент: божественная, человеческая, демоническая. */
  gana: Gana;
  /** Животное йони — используется в куте сексуальной совместимости. */
  yoni: string;
  /** Пол йони: у пары одинаковых животных разного пола кута считается иначе. */
  yoniSex: "м" | "ж";
}

export const NAKSHATRA_FACTS: Record<number, NakshatraFacts> = {
  1: { planet: "Кету", deity: "Ашвини Кумары", symbol: "голова коня", gana: "Дева", yoni: "Лошадь", yoniSex: "м" },
  2: { planet: "Венера", deity: "Яма", symbol: "йони, женское лоно", gana: "Манушья", yoni: "Слон", yoniSex: "м" },
  3: { planet: "Солнце", deity: "Агни", symbol: "лезвие, язык пламени", gana: "Ракшаса", yoni: "Овца", yoniSex: "ж" },
  4: { planet: "Луна", deity: "Брахма", symbol: "повозка, запряжённая волами", gana: "Манушья", yoni: "Змея", yoniSex: "м" },
  5: { planet: "Марс", deity: "Сома", symbol: "голова оленя", gana: "Дева", yoni: "Змея", yoniSex: "ж" },
  6: { planet: "Раху", deity: "Рудра", symbol: "капля, слеза", gana: "Манушья", yoni: "Собака", yoniSex: "ж" },
  7: { planet: "Юпитер", deity: "Адити", symbol: "колчан со стрелами", gana: "Дева", yoni: "Кошка", yoniSex: "ж" },
  8: { planet: "Сатурн", deity: "Брихаспати", symbol: "вымя коровы, распустившийся цветок", gana: "Дева", yoni: "Овца", yoniSex: "м" },
  9: { planet: "Меркурий", deity: "Наги", symbol: "свернувшаяся змея", gana: "Ракшаса", yoni: "Кошка", yoniSex: "м" },
  10: { planet: "Кету", deity: "Питри, души предков", symbol: "трон", gana: "Ракшаса", yoni: "Крыса", yoniSex: "м" },
  11: { planet: "Венера", deity: "Бхага", symbol: "передние ножки ложа", gana: "Манушья", yoni: "Крыса", yoniSex: "ж" },
  12: { planet: "Солнце", deity: "Арьяман", symbol: "задние ножки ложа", gana: "Манушья", yoni: "Корова", yoniSex: "м" },
  13: { planet: "Луна", deity: "Савитар", symbol: "раскрытая ладонь", gana: "Дева", yoni: "Буйвол", yoniSex: "ж" },
  14: { planet: "Марс", deity: "Тваштар, он же Вишвакарма", symbol: "жемчужина", gana: "Ракшаса", yoni: "Тигр", yoniSex: "ж" },
  15: { planet: "Раху", deity: "Ваю", symbol: "молодой росток на ветру", gana: "Дева", yoni: "Буйвол", yoniSex: "м" },
  16: { planet: "Юпитер", deity: "Индра и Агни", symbol: "триумфальная арка", gana: "Ракшаса", yoni: "Тигр", yoniSex: "м" },
  17: { planet: "Сатурн", deity: "Митра", symbol: "лотос", gana: "Дева", yoni: "Заяц", yoniSex: "ж" },
  18: { planet: "Меркурий", deity: "Индра", symbol: "серьга, зонт правителя", gana: "Ракшаса", yoni: "Заяц", yoniSex: "м" },
  19: { planet: "Кету", deity: "Ниррити", symbol: "связка корней", gana: "Ракшаса", yoni: "Собака", yoniSex: "м" },
  20: { planet: "Венера", deity: "Апас, воды", symbol: "веер, опахало", gana: "Манушья", yoni: "Обезьяна", yoniSex: "м" },
  21: { planet: "Солнце", deity: "Вишвадевы", symbol: "бивень слона", gana: "Манушья", yoni: "Мангуст", yoniSex: "м" },
  22: { planet: "Луна", deity: "Вишну", symbol: "ухо, три следа", gana: "Дева", yoni: "Обезьяна", yoniSex: "ж" },
  23: { planet: "Марс", deity: "восемь Васу", symbol: "барабан", gana: "Ракшаса", yoni: "Лев", yoniSex: "ж" },
  24: { planet: "Раху", deity: "Варуна", symbol: "пустой круг", gana: "Ракшаса", yoni: "Лошадь", yoniSex: "ж" },
  25: { planet: "Юпитер", deity: "Аджа Экапада", symbol: "передние ножки погребального ложа, меч", gana: "Манушья", yoni: "Лев", yoniSex: "м" },
  26: { planet: "Сатурн", deity: "Ахир Будхнья", symbol: "задние ножки ложа, змей глубин", gana: "Манушья", yoni: "Корова", yoniSex: "ж" },
  27: { planet: "Меркурий", deity: "Пушан", symbol: "рыба, барабан", gana: "Дева", yoni: "Слон", yoniSex: "ж" },
};

/** Что гана означает для пары. Свет и тень, как во всём остальном контенте. */
export const GANA_MEANING: Record<Gana, { label: string; text: string }> = {
  Дева: {
    label: "божественная",
    text: "Мягкий, уступчивый склад: такой партнёр гасит конфликт раньше, чем тот разгорится, и почти всегда готов пойти навстречу первым. Оборотная сторона — уступает и там, где надо было сказать «нет», а потом копит невысказанное.",
  },
  Манушья: {
    label: "человеческая",
    text: "Смешанный склад, самый обычный: партнёр умеет и договариваться, и стоять на своём, но выбирает не всегда вовремя. В паре это даёт живой баланс, а в тяжёлый момент — колебание между «промолчать» и «настоять».",
  },
  Ракшаса: {
    label: "демоническая",
    text: "Резкий, напористый склад: такой партнёр говорит правду в лицо и не боится столкновения — с ним понятно, где стоишь. Оборотная сторона в том, что резкость прилетает и по мелочам, а извинение приходит позже, чем нужно было.",
  },
};

/** Нади — 8 баллов из 36, самый весомый параметр Гуна-милана. */
export const NADI_MEANING: Record<string, string> = {
  Ади: "начало, ветер (вата): подвижность, быстрый обмен идеями, лёгкость на подъём",
  Мадхья: "середина, огонь (питта): напор, ясность цели, способность додавить результат",
  Антья: "конец, вода и земля (капха): устойчивость, терпение, способность выдерживать долгое",
};

interface NakshatraRow {
  i: number;
  name: string;
  nadi: string;
  rashi: string;
}
const ROWS = (nakshatraData as { nakshatras: NakshatraRow[] }).nakshatras;

export function nakshatraRow(n: number): NakshatraRow | undefined {
  return ROWS.find((x) => x.i === n);
}

/** Все 27 строк — для хабов и обходов. */
export function allNakshatraRows(): NakshatraRow[] {
  return ROWS;
}

/**
 * Границы накшатры в сидерическом зодиаке. Круг 360° делится на 27 равных
 * отрезков по 13°20', поэтому считается, а не хранится.
 */
export function nakshatraDegrees(n: number): { from: string; to: string } {
  const step = 360 / 27; // 13.333…°
  const fmt = (deg: number) => {
    const d = Math.floor(deg);
    const m = Math.round((deg - d) * 60);
    return `${d}°${String(m).padStart(2, "0")}′`;
  };
  return { from: fmt((n - 1) * step), to: fmt(n * step) };
}

const SIGNS_ORDER = [
  "Овен", "Телец", "Близнецы", "Рак", "Лев", "Дева",
  "Весы", "Скорпион", "Стрелец", "Козерог", "Водолей", "Рыбы",
];

/**
 * Навамша-знаки четырёх пад накшатры.
 *
 * Считается, а не хранится: 27 накшатр по 4 пады дают 108 отрезков, и они
 * последовательно проходят круг из 12 знаков ровно девять раз. Первая пада
 * Ашвини — Овен, дальше подряд без пропусков.
 */
export function nakshatraPadas(n: number): string[] {
  const start = (n - 1) * 4;
  return [0, 1, 2, 3].map((k) => SIGNS_ORDER[(start + k) % 12]);
}

/** Накшатры той же ганы — для перелинковки по темпераменту. */
export function sameGana(n: number): number[] {
  const g = NAKSHATRA_FACTS[n]?.gana;
  if (!g) return [];
  return Object.entries(NAKSHATRA_FACTS)
    .filter(([k, v]) => Number(k) !== n && v.gana === g)
    .map(([k]) => Number(k));
}

/** Накшатры с той же йони — ключ к куте сексуальной совместимости. */
export function sameYoni(n: number): number[] {
  const y = NAKSHATRA_FACTS[n]?.yoni;
  if (!y) return [];
  return Object.entries(NAKSHATRA_FACTS)
    .filter(([k, v]) => Number(k) !== n && v.yoni === y)
    .map(([k]) => Number(k));
}

/** Накшатры под тем же управителем — один период Вимшоттари даши. */
export function samePlanet(n: number): number[] {
  const p = NAKSHATRA_FACTS[n]?.planet;
  if (!p) return [];
  return Object.entries(NAKSHATRA_FACTS)
    .filter(([k, v]) => Number(k) !== n && v.planet === p)
    .map(([k]) => Number(k));
}
