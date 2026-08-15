/**
 * Движок «Джйотиш» — см. kalkulator/service/systems/jyotish/ENGINE.md.
 * Вход: дата + точное время + место рождения ×2.
 * Технология: astronomy-engine + сидерическая поправка (айянамша Лахири,
 * приближённая формула — см. ephemeris.ts) вместо pyswisseph.
 */

import {
  birthMoment,
  moonLongitude,
  sunLongitude,
  planetLongitude,
  meanNorthNodeLongitude,
  meanSouthNodeLongitude,
  toSidereal,
  ascendantSidereal,
} from "./ephemeris";
import { dignityOf, isCombust, type DignityState } from "@/lib/data/jyotish/dignities";
import {
  rashiIndex,
  rashiName,
  varnaRank,
  varnaOf,
  vashyaScore,
  vashyaGroupOf,
  ganaOf,
  ganaScore,
  yoniOf,
  yoniScore,
  grahaMaitriScore,
  lordOf,
  type Graha,
  type RashiName,
} from "./jyotish-tables";
import { parseBirthDate, type Person, type SystemReport } from "./types";
import { assertLicensed } from "./license-guard";

import nakshatraData from "../data/jyotish/nakshatra.json";
import kutasData from "../data/jyotish/kutas.json";
import doshasData from "../data/jyotish/doshas.json";

// ---------------------------------------------------------------------------
// Луна: накшатра, раши, нади
// ---------------------------------------------------------------------------

interface NakshatraEntry {
  i: number;
  name: string;
  nadi: string;
  rashi: string;
}

const NAKSHATRAS = (nakshatraData as { nakshatras: NakshatraEntry[] }).nakshatras;

const NAKSHATRA_WIDTH = 360 / 27; // 13°20'

export interface MoonPosition {
  siderealLon: number;
  nakshatraIndex: number;
  nakshatraName: string;
  nadi: string;
  rashiIndex: number;
  rashiName: RashiName;
}

/**
 * Накшатра и пада по сидерической долготе — для любой планеты, не только Луны.
 *
 * Пада — это четверть накшатры, 3°20′. Их 108 на круг, и это ровно те же
 * отрезки, из которых строится навамша: пада планеты и её знак в D-9 — одно и
 * то же деление, увиденное с двух сторон.
 */
export function nakshatraAt(siderealLon: number): {
  index: number;
  name: string;
  nadi: string;
  pada: number;
} {
  const idx = Math.min(Math.floor(siderealLon / NAKSHATRA_WIDTH) + 1, 27);
  const nak = NAKSHATRAS[idx - 1];
  const pada = Math.floor((siderealLon % NAKSHATRA_WIDTH) / (NAKSHATRA_WIDTH / 4)) + 1;
  return { index: nak.i, name: nak.name, nadi: nak.nadi, pada };
}

export function calcMoonPosition(person: Person): MoonPosition {
  const utc = birthMoment(person);
  const tropicalLon = moonLongitude(utc);
  const siderealLon = toSidereal(tropicalLon, utc);

  const nakIndex = Math.floor(siderealLon / NAKSHATRA_WIDTH) + 1;
  const nak = NAKSHATRAS[Math.min(nakIndex, 27) - 1];

  const rIndex = rashiIndex(siderealLon);

  return {
    siderealLon,
    nakshatraIndex: nak.i,
    nakshatraName: nak.name,
    nadi: nak.nadi,
    rashiIndex: rIndex,
    rashiName: rashiName(rIndex),
  };
}

// ---------------------------------------------------------------------------
// Наваграха — 9 «планет» классического Джйотиша, для биколеса
// ---------------------------------------------------------------------------

/**
 * Классический Джйотиш оперирует девятью грахами. Уран, Нептун и Плутон в него
 * не входят — они открыты много позже сложения традиции, поэтому в биколесе
 * сознательно не показываются, хотя движок эфемерид умеет их считать.
 */
export interface GrahaPosition {
  key: string;
  name: string;
  symbol: string;
  siderealLon: number;
  rashiIndex: number;
  rashiName: RashiName;
  /** Градус внутри знака, 0..30. */
  degreeInRashi: number;
  /**
   * Ретроградность (вакри). Считается сравнением долготы за час до и через час
   * после момента: если планета за это время сдвинулась назад — она вакри.
   * Раньше это поле было захардкожено в false, и ни одна планета никогда не
   * помечалась, хотя отрисовка «(R)» была написана.
   */
  retro: boolean;
  /** Экзальтация, падение, мулатрикона или своя обитель — либо null. */
  dignity: DignityState;
  /** Сожжена ли планета близостью к Солнцу. */
  combust: boolean;
}

const NAVAGRAHA: { key: string; name: string; symbol: string }[] = [
  { key: "sun", name: "Сурья (Солнце)", symbol: "☉" },
  { key: "moon", name: "Чандра (Луна)", symbol: "☾" },
  { key: "mars", name: "Мангала (Марс)", symbol: "♂" },
  { key: "mercury", name: "Будха (Меркурий)", symbol: "☿" },
  { key: "jupiter", name: "Гуру (Юпитер)", symbol: "♃" },
  { key: "venus", name: "Шукра (Венера)", symbol: "♀" },
  { key: "saturn", name: "Шани (Сатурн)", symbol: "♄" },
  { key: "rahu", name: "Раху (Северный узел)", symbol: "☊" },
  { key: "ketu", name: "Кету (Южный узел)", symbol: "☋" },
];

export function calcNavagraha(person: Person): GrahaPosition[] {
  assertLicensed();
  const utc = birthMoment(person);
  const HOUR = 3600_000;
  const sunNow = toSidereal(sunLongitude(utc), utc);

  const lonAt = (key: string, at: Date): number => {
    if (key === "sun") return sunLongitude(at);
    if (key === "moon") return moonLongitude(at);
    if (key === "rahu") return meanNorthNodeLongitude(at);
    if (key === "ketu") return meanSouthNodeLongitude(at);
    return planetLongitude(key as "mars" | "mercury" | "jupiter" | "venus" | "saturn", at);
  };

  return NAVAGRAHA.map(({ key, name, symbol }) => {
    let tropical: number;
    if (key === "sun") tropical = sunLongitude(utc);
    else if (key === "moon") tropical = moonLongitude(utc);
    else if (key === "rahu") tropical = meanNorthNodeLongitude(utc);
    else if (key === "ketu") tropical = meanSouthNodeLongitude(utc);
    else tropical = planetLongitude(key as "mars" | "mercury" | "jupiter" | "venus" | "saturn", utc);

    const siderealLon = toSidereal(tropical, utc);
    const rIndex = rashiIndex(siderealLon);
    const rName = rashiName(rIndex);
    const degreeInRashi = siderealLon % 30;

    // Узлы движутся вспять всегда — это их природа, а не состояние.
    // Светила не бывают ретроградными вовсе.
    let retro = false;
    if (key === "rahu" || key === "ketu") retro = true;
    else if (key !== "sun" && key !== "moon") {
      const before = lonAt(key, new Date(utc.getTime() - HOUR));
      const after = lonAt(key, new Date(utc.getTime() + HOUR));
      // Разница через границу 0°/360° берётся кратчайшей дугой.
      const delta = ((after - before + 540) % 360) - 180;
      retro = delta < 0;
    }

    return {
      key,
      name,
      symbol,
      siderealLon,
      rashiIndex: rIndex,
      rashiName: rName,
      degreeInRashi,
      retro,
      dignity: dignityOf(key, rName, degreeInRashi),
      combust: key === "sun" ? false : isCombust(key, siderealLon, sunNow),
    };
  });
}

// ---------------------------------------------------------------------------
// Тара-кута: счёт накшатр в обе стороны, группы 3/5/7 (из 9) неблагоприятны
// ---------------------------------------------------------------------------

const TARA_INAUSPICIOUS_GROUPS = new Set([3, 5, 7]);

function taraGroup(fromIdx: number, toIdx: number): number {
  const count = ((toIdx - fromIdx + 27) % 27) + 1;
  const group = count % 9 === 0 ? 9 : count % 9;
  return group;
}

/** Тара из 3: считаем в обе стороны, штрафуем за каждое неблагоприятное направление. */
function taraScore(aIdx: number, bIdx: number): number {
  const forward = taraGroup(aIdx, bIdx);
  const backward = taraGroup(bIdx, aIdx);
  const goodCount = [forward, backward].filter((g) => !TARA_INAUSPICIOUS_GROUPS.has(g)).length;
  return (goodCount / 2) * 3;
}

// ---------------------------------------------------------------------------
// Мангал доша. Классика считает дом Марса в первую очередь от Лагны и лишь
// затем от Чандра-лагны (знака Луны). Лагну считаем, когда в Person доехали
// координаты города: она зависит от местного звёздного времени, поэтому без
// широты и долготы её не получить. По ссылкам, сохранённым до появления
// координат в адресе, остаётся прежний расчёт от Луны — он не требует места.
// ---------------------------------------------------------------------------

const MANGAL_DOSHA_HOUSES = new Set([1, 2, 4, 7, 8, 12]);

function houseBetween(anchorRashiIdx: number, targetRashiIdx: number): number {
  return ((targetRashiIdx - anchorRashiIdx + 12) % 12) + 1;
}

/**
 * Лагна — восходящий знак. Возвращает null, если места рождения нет: выдумывать
 * координаты по часовому поясу нельзя, Europe/Moscow тянется на десятки
 * градусов долготы, а это почти целый знак разницы в асценденте.
 */
export function calcLagna(person: Person): { rashiIndex: number; lon: number } | null {
  const { lat, lon } = person.birthPlace;
  if (lat === undefined || lon === undefined || !person.birthTimeKnown) return null;
  const asc = ascendantSidereal(birthMoment(person), lat, lon);
  return { rashiIndex: rashiIndex(asc), lon: asc };
}

// ---------------------------------------------------------------------------
// Чувствительность к точности времени рождения
// ---------------------------------------------------------------------------

/**
 * Что в карте поплывёт, если время рождения записано приблизительно.
 *
 * Человек обычно боится не за то. Он переживает за накшатру Луны — а Луна
 * проходит стоянку примерно за сутки, и полчаса её не сдвинут. Зато Лагна
 * меняет знак каждые два часа с небольшим, а иногда человек рождается прямо на
 * границе, и тогда полчаса переставляют все двенадцать домов разом.
 *
 * Поэтому мы не рассуждаем «примерно», а считаем: сколько минут осталось до
 * ближайшей смены и что конкретно изменится при ошибке в полчаса.
 */
export interface JyotishTimeSensitivity {
  /** Знак Лагны; null — нет места рождения или времени, лагну считать не из чего. */
  lagnaRashi: RashiName | null;
  /** Минут до следующей смены знака Лагны; null — дальше окна поиска. */
  toLagnaChange: number | null;
  /** Минут назад с прошлой смены; null — дальше окна поиска. */
  sinceLagnaChange: number | null;
  moonNakshatra: string;
  moonPada: number;
  /** Минут до смены пады Луны; null — дальше окна поиска. */
  toPadaChange: number | null;
  /** Что именно изменится при ошибке на ±shift минут. */
  fragile: { lagna: boolean; pada: boolean; nakshatra: boolean };
}

/** Окно поиска: дальше трёх часов «плюс-минус» уже не приблизительность, а незнание. */
const SENSITIVITY_WINDOW = 180;

export function calcJyotishTimeSensitivity(
  person: Person,
  shiftMinutes = 30
): JyotishTimeSensitivity {
  const utc = birthMoment(person);
  const { lat, lon } = person.birthPlace;
  const hasPlace = lat !== undefined && lon !== undefined && person.birthTimeKnown;

  const at = (offset: number) => new Date(utc.getTime() + offset * 60_000);
  const lagnaSign = (offset: number) =>
    hasPlace ? rashiIndex(ascendantSidereal(at(offset), lat, lon)) : null;
  const moonAt = (offset: number) => {
    const t = at(offset);
    return nakshatraAt(toSidereal(moonLongitude(t), t));
  };

  const lagna0 = lagnaSign(0);
  const moon0 = moonAt(0);

  // Ищем ближайшую границу простым шагом в минуту: точность здесь и нужна
  // минутная, а формулы дешёвые.
  const scan = (dir: 1 | -1, differs: (offset: number) => boolean): number | null => {
    for (let m = 1; m <= SENSITIVITY_WINDOW; m++) if (differs(dir * m)) return m;
    return null;
  };

  const lagnaDiffers = (offset: number) => lagnaSign(offset) !== lagna0;
  const padaDiffers = (offset: number) => {
    const m = moonAt(offset);
    return m.index !== moon0.index || m.pada !== moon0.pada;
  };

  return {
    lagnaRashi: lagna0 === null ? null : rashiName(lagna0),
    toLagnaChange: hasPlace ? scan(1, lagnaDiffers) : null,
    sinceLagnaChange: hasPlace ? scan(-1, lagnaDiffers) : null,
    moonNakshatra: moon0.name,
    moonPada: moon0.pada,
    toPadaChange: scan(1, padaDiffers),
    fragile: {
      lagna: hasPlace && (lagnaDiffers(shiftMinutes) || lagnaDiffers(-shiftMinutes)),
      pada: padaDiffers(shiftMinutes) || padaDiffers(-shiftMinutes),
      nakshatra:
        moonAt(shiftMinutes).index !== moon0.index || moonAt(-shiftMinutes).index !== moon0.index,
    },
  };
}

/**
 * Показатели брака: 7-й дом и Венера как карака супруга.
 *
 * ОТКУДА ЭТО. Брихат Парашара Хора Шастра, глава о караках планет: «Венера —
 * Карака жены», и там же прямое правило — «для жены (мужа) от Венеры и 7-го
 * дома от Венеры». Обрати внимание: **Венера отвечает за супруга у обоих
 * полов**. Расхожее «у женщины за мужа отвечает Юпитер» — поздняя школьная
 * традиция, у Парашары Юпитер карака учёности, богатства, сына и друга, но не
 * мужа. Мы следуем источнику и говорим об этом вслух.
 *
 * ЗАЧЕМ. Вся остальная наша джйотишская выдача построена на Луне: восемь кут и
 * доши сравнивают накшатры и знаки Луны. Это отвечает на «насколько вы
 * совпадаете», но молчит о том, что вообще написано в карте про партнёрство.
 * Седьмой дом и Венера отвечают именно на это — и считаются из того, что
 * движок уже знает: Лагна, положения грах, достоинства.
 *
 * Без места и времени рождения Лагны нет, и весь блок честно не показывается:
 * седьмой дом отсчитывается от неё и без неё не существует.
 */
export interface MarriageIndicators {
  /** Знак, попавший в 7-й дом от Лагны. */
  seventhRashi: RashiName;
  /** Планета-управитель этого знака — «хозяин» темы партнёрства. */
  seventhLord: Graha;
  /** В каком доме от Лагны стоит управитель 7-го (1..12). */
  lordHouse: number;
  /** И в каком знаке. */
  lordRashi: RashiName;
  lordDignity: DignityState;
  lordRetro: boolean;
  lordCombust: boolean;
  /** Венера — карака супруга: где стоит и в каком состоянии. */
  venusRashi: RashiName;
  venusHouse: number;
  venusDignity: DignityState;
  venusCombust: boolean;
  /** 7-й дом ОТ ВЕНЕРЫ — вторая половина правила Парашары. */
  seventhFromVenusRashi: RashiName;
  seventhFromVenusLord: Graha;
}

export function calcMarriageIndicators(person: Person): MarriageIndicators | null {
  const lagna = calcLagna(person);
  if (!lagna) return null;

  const grahas = calcNavagraha(person);
  const find = (key: string) => grahas.find((g) => g.key === key)!;

  // rashiIndex у граха 1-based, houseBetween работает с тем же основанием.
  const lagnaIdx = lagna.rashiIndex;
  const seventhIdx = ((lagnaIdx - 1 + 6) % 12) + 1;
  const seventhRashi = rashiName(seventhIdx);
  const seventhLord = lordOf(seventhRashi);

  const LORD_KEY: Record<Graha, string> = {
    "Солнце": "sun", "Луна": "moon", "Марс": "mars", "Меркурий": "mercury",
    "Юпитер": "jupiter", "Венера": "venus", "Сатурн": "saturn",
  };
  const lord = find(LORD_KEY[seventhLord]);
  const venus = find("venus");
  const venusSeventhIdx = ((venus.rashiIndex - 1 + 6) % 12) + 1;
  const venusSeventhRashi = rashiName(venusSeventhIdx);

  return {
    seventhRashi,
    seventhLord,
    lordHouse: houseBetween(lagnaIdx, lord.rashiIndex),
    lordRashi: lord.rashiName,
    lordDignity: lord.dignity,
    lordRetro: lord.retro,
    lordCombust: lord.combust,
    venusRashi: venus.rashiName,
    venusHouse: houseBetween(lagnaIdx, venus.rashiIndex),
    venusDignity: venus.dignity,
    venusCombust: venus.combust,
    seventhFromVenusRashi: venusSeventhRashi,
    seventhFromVenusLord: lordOf(venusSeventhRashi),
  };
}

export interface MangalDosha {
  present: boolean;
  /** Дом Марса от Луны — считается всегда, места рождения не требует. */
  house: number;
  /** Дом Марса от Лагны — null, когда координат нет. */
  houseFromLagna: number | null;
  /** От чего именно доша: пусто, если её нет. */
  from: ("лагны" | "Луны")[];
}

export function calcMangalDosha(person: Person, moon: MoonPosition): MangalDosha {
  const utc = birthMoment(person);
  const marsRashiIdx = rashiIndex(toSidereal(planetLongitude("mars", utc), utc));

  const house = houseBetween(moon.rashiIndex, marsRashiIdx);
  const fromMoon = MANGAL_DOSHA_HOUSES.has(house);

  const lagna = calcLagna(person);
  const houseFromLagna = lagna ? houseBetween(lagna.rashiIndex, marsRashiIdx) : null;
  const fromLagna = houseFromLagna !== null && MANGAL_DOSHA_HOUSES.has(houseFromLagna);

  const from: ("лагны" | "Луны")[] = [];
  if (fromLagna) from.push("лагны");
  if (fromMoon) from.push("Луны");

  return { present: fromLagna || fromMoon, house, houseFromLagna, from };
}

// ---------------------------------------------------------------------------
// Аштакута (8 кута) → 36 баллов
// ---------------------------------------------------------------------------

/**
 * Из чего сложился балл одной куты.
 *
 * Раньше движок считал все эти величины и молча выбрасывал, а наружу отдавал
 * голое «2 из 4». Для читательницы, не знакомой с Джйотишем, такое число —
 * приговор из ниоткуда: проверить его нельзя, поспорить не с чем, поверить
 * можно только на слово. Поэтому исходные данные теперь доезжают до экрана.
 *
 * Здесь только факты; связный текст с именами партнёров собирает интерфейс —
 * имена движку не принадлежат.
 */
export interface KutaDetail {
  /** Что сравнивали у первого партнёра, короткой фразой. */
  a: string;
  /** То же у второго. */
  b: string;
  /** Почему получился именно такой балл. */
  verdict: string;
}

export interface GunaMilanResult {
  total: number;
  kutas: Record<string, { score: number; max: number }>;
  /** Расшифровка по тому же ключу, что и kutas. */
  details: Record<string, KutaDetail>;
}

/** Склад характера по гане — бытовыми словами, без оценки «хорошо/плохо». */
const GANA_TEMPER: Record<string, string> = {
  "Дэва": "мягкий, уступчивый склад",
  "Мануша": "смешанный, житейский склад",
  "Ракшаса": "резкий, напористый склад",
};

/** Что означает каждая нади в аюрведическом смысле. */
const NADI_MEANING: Record<string, string> = {
  "Ади": "ветер: подвижность, быстрая реакция, нервная система",
  "Мадхья": "жёлчь: жар, скорость обмена, вспыльчивость",
  "Антья": "слизь: влага, устойчивость, медленный разгон",
};

export function calcGunaMilan(a: MoonPosition, b: MoonPosition): GunaMilanResult {
  const varna = varnaRank(a.rashiName) >= varnaRank(b.rashiName) ? 1 : 0;
  const vashya = vashyaScore(a.rashiName, b.rashiName);
  const tara = taraScore(a.nakshatraIndex, b.nakshatraIndex);
  const yoni = yoniScore(yoniOf(a.nakshatraIndex), yoniOf(b.nakshatraIndex));
  const grahaMaitri = grahaMaitriScore(a.rashiName, b.rashiName);
  const gana = ganaScore(ganaOf(a.nakshatraIndex), ganaOf(b.nakshatraIndex));
  const bhakootDistance = Math.min(
    ((b.rashiIndex - a.rashiIndex + 12) % 12) + 1,
    ((a.rashiIndex - b.rashiIndex + 12) % 12) + 1
  );
  const bhakootBad = bhakootDistance === 6 || bhakootDistance === 2; // 6/8 или 2/12 (расстояние симметрично)
  const bhakoot = bhakootBad ? 0 : 7;
  const nadi = a.nadi === b.nadi ? 0 : 8;

  const kutas = { varna, vashya, tara, yoni, graha_maitri: grahaMaitri, gana, bhakoot, nadi };
  const total = Object.values(kutas).reduce((s, v) => s + v, 0);

  const kutaMax: Record<string, number> = Object.fromEntries(
    (kutasData as { kutas: { key: string; max: number }[] }).kutas.map((k) => [k.key, k.max])
  );

  return {
    total: Math.round(total * 100) / 100,
    kutas: Object.fromEntries(
      Object.entries(kutas).map(([key, score]) => [key, { score, max: kutaMax[key] }])
    ),
    details: gunaMilanDetails(a, b, { varna, vashya, yoni, grahaMaitri, gana, bhakootDistance }),
  };
}

function gunaMilanDetails(
  a: MoonPosition,
  b: MoonPosition,
  s: {
    varna: number;
    vashya: number;
    yoni: number;
    grahaMaitri: number;
    gana: number;
    bhakootDistance: number;
  }
): Record<string, KutaDetail> {
  const varnaA = varnaOf(a.rashiName);
  const varnaB = varnaOf(b.rashiName);
  const yoniA = yoniOf(a.nakshatraIndex);
  const yoniB = yoniOf(b.nakshatraIndex);
  const ganaA = ganaOf(a.nakshatraIndex);
  const ganaB = ganaOf(b.nakshatraIndex);
  const lordA = lordOf(a.rashiName);
  const lordB = lordOf(b.rashiName);
  const taraForward = taraGroup(a.nakshatraIndex, b.nakshatraIndex);
  const taraBackward = taraGroup(b.nakshatraIndex, a.nakshatraIndex);
  const bad = (g: number) => (TARA_INAUSPICIOUS_GROUPS.has(g) ? "беспокойная" : "спокойная");

  return {
    varna: {
      a: `${a.rashiName} — стихия «${varnaA.element}», варна «${varnaA.name}»`,
      b: `${b.rashiName} — стихия «${varnaB.element}», варна «${varnaB.name}»`,
      verdict:
        (s.varna === 1
          ? "Балл традиция даёт, когда варна первого партнёра не ниже варны второго, — здесь так и вышло. "
          : "Балл традиция даёт, когда варна первого партнёра не ниже варны второго, — здесь порядок обратный, и правило балл не засчитывает. ") +
        "Варна — это не «выше и ниже» как человек, а склад: вода живёт чувством, огонь порывом, земля делом, воздух мыслью. И честно: правило несимметрично — поменяешь партнёров местами, и балл именно в этом пункте изменится. Вес у него самый маленький из восьми, 1 из 36.",
    },
    vashya: {
      a: `${a.rashiName} — группа «${vashyaGroupOf(a.rashiName)}»`,
      b: `${b.rashiName} — группа «${vashyaGroupOf(b.rashiName)}»`,
      verdict:
        "Вашья — про притяжение и про то, кто кого легче «уговаривает». Знаки заранее разбиты на пять групп: четвероногие, люди, водные, лесные, насекомые. " +
        (s.vashya === 2
          ? "Вы в одной группе: тяга взаимная и ровная, никто никого не ведёт за собой."
          : s.vashya === 1
            ? "Группы соседние: влияние есть, но одностороннее — кто-то уступает чаще."
            : "Группы не пересекаются: власти друг над другом почти нет. Это не ссора, а независимость — каждый остаётся при своём, и договариваться придётся словами, а не влиянием."),
    },
    tara: {
      a: `счёт от своей накшатры «${a.nakshatraName}» до «${b.nakshatraName}» даёт ${taraForward}-ю группу из девяти — ${bad(taraForward)}`,
      b: `счёт в обратную сторону даёт ${taraBackward}-ю — ${bad(taraBackward)}`,
      verdict:
        "Накшатры — 27 лунных стоянок, участков неба по 13°20′. Тара считает, через сколько стоянок лежит накшатра партнёра, и делит счёт на девять групп; 3-ю, 5-ю и 7-ю традиция считает беспокойными. Мы проверяем в обе стороны и снимаем половину балла за каждое беспокойное направление — потому что взгляд одного на другого не обязан совпадать со взглядом в обратную сторону.",
    },
    yoni: {
      a: `«${a.nakshatraName}» — животное-символ ${yoniA.toLowerCase()}`,
      b: `«${b.nakshatraName}» — ${yoniB.toLowerCase()}`,
      verdict:
        "Йони — про телесную и инстинктивную сторону: темп, потребность в близости, привычку к контакту. У каждой накшатры свой зверь-символ. " +
        (s.yoni === 4
          ? "Зверь один и тот же — потребности совпадают почти без перевода."
          : s.yoni === 0
            ? "Эту пару животных традиция называет враждебной: ритмы разные, и близость требует прямого разговора о том, кому чего и сколько нужно."
            : "Пара нейтральная: не тянет и не отталкивает.") +
        " У нас шкала упрощена до трёх ступеней — 4, 2 или 0; в классических таблицах есть и промежуточные оценки.",
    },
    graha_maitri: {
      a: `${a.rashiName} — управитель ${lordA}`,
      b: `${b.rashiName} — управитель ${lordB}`,
      verdict:
        "У каждого знака есть планета-хозяин, и Граха Майтри сравнивает не вас, а этих двух хозяев: насколько легко вам понимать друг друга без объяснений. " +
        (s.grahaMaitri === 5
          ? "Планета одна и та же — мысль читается с полуслова."
          : s.grahaMaitri === 4
            ? "Планеты дружественны — разное, но переводимое."
            : s.grahaMaitri === 3
              ? "Планеты нейтральны: понимание есть, но его надо проговаривать, само не появится."
              : "Планеты в традиции враждебны: логика у вас устроена по-разному, и там, где одному очевидно, второму нужно объяснение. Это про перевод, а не про нелюбовь."),
    },
    gana: {
      a: `«${a.nakshatraName}» — гана «${ganaA}»: ${GANA_TEMPER[ganaA]}`,
      b: `«${b.nakshatraName}» — гана «${ganaB}»: ${GANA_TEMPER[ganaB]}`,
      verdict:
        "Гана — темперамент по накшатре, три типа: Дэва (мягкий), Мануша (житейский), Ракшаса (напористый). Названия переводятся как «божественный», «человеческий» и «демонический», но это метафора темпа, а не оценка человека. " +
        (ganaA === ganaB
          ? "Темперамент один и тот же — скорость и громкость у вас общие."
          : s.gana >= 5
            ? "Темпераменты разные, но традиция считает их сходящимися: один мягче, второй практичнее — и это скорее дополняет, чем мешает."
            : s.gana === 1
              ? "Темпераменты противоположны: одному нужно мягче, второму быстрее. Это самая частая причина бытовых ссор на ровном месте — и она лечится договорённостью о темпе."
              : "Темпераменты традиция считает несходящимися: разная скорость и разная громкость. Не приговор, но место, где придётся сознательно подстраиваться."),
    },
    bhakoot: {
      a: `Луна в знаке ${a.rashiName}`,
      b: `Луна в знаке ${b.rashiName}`,
      verdict:
        `Бхакут считает знаки от одной Луны до другой: здесь одна стоит в ${s.bhakootDistance}-м знаке от другой. ` +
        (s.bhakootDistance === 6
          ? "Позиция 6/8 — традиция считает её самой напряжённой: разный жизненный ритм и разные представления о безопасности."
          : s.bhakootDistance === 2
            ? "Позиция 2/12 — про деньги, быт и границы: вам легко зацепиться именно на бытовом уровне."
            : "Напряжённых расстояний 6/8 и 2/12 у вас нет, поэтому балл полный.") +
        " Пункт весит 7 из 36 — второй по значимости после нади.",
    },
    nadi: {
      a: `«${a.nakshatraName}» — нади «${a.nadi}» (${NADI_MEANING[a.nadi] ?? "конституция по аюрведе"})`,
      b: `«${b.nakshatraName}» — нади «${b.nadi}» (${NADI_MEANING[b.nadi] ?? "конституция по аюрведе"})`,
      verdict:
        "Нади — конституция по аюрведе, три типа: ветер, жёлчь, слизь. " +
        (a.nadi === b.nadi
          ? "Нади совпали, и традиция снимает здесь все 8 баллов — это самый тяжёлый пункт Аштакуты. Классический довод про здоровье потомства мы не повторяем: это не медицинское утверждение, и проверить его нечем. Практический смысл проще — вы устаёте и восстанавливаетесь одинаково, поэтому проседаете тоже одновременно, и подстраховать друг друга в такой момент некому."
          : "Нади разные — полные 8 баллов. Вы утомляетесь и восстанавливаетесь по-разному, а значит редко падаете с ног в один и тот же день."),
    },
  };
}

// ---------------------------------------------------------------------------
// Доши и штрафы
// ---------------------------------------------------------------------------

interface DoshaEntry {
  title: string;
  penalty: number;
}

const doshas = (doshasData as { doshas: Record<string, DoshaEntry> }).doshas;

export interface DoshaResult {
  key: string;
  title: string;
  penalty: number;
  active: boolean;
  neutralized?: boolean;
}

export function calcDoshas(a: Person, b: Person, aMoon: MoonPosition, bMoon: MoonPosition): DoshaResult[] {
  const results: DoshaResult[] = [];

  const nadiSame = aMoon.nadi === bMoon.nadi;
  results.push({ key: "nadi", title: doshas.nadi.title, penalty: doshas.nadi.penalty, active: nadiSame });

  const bhakootDistance = Math.min(
    ((bMoon.rashiIndex - aMoon.rashiIndex + 12) % 12) + 1,
    ((aMoon.rashiIndex - bMoon.rashiIndex + 12) % 12) + 1
  );
  const bhakootBad = bhakootDistance === 6 || bhakootDistance === 2;
  results.push({ key: "bhakoot", title: doshas.bhakoot.title, penalty: doshas.bhakoot.penalty, active: bhakootBad });

  const aMangal = calcMangalDosha(a, aMoon);
  const bMangal = calcMangalDosha(b, bMoon);
  const bothManglik = aMangal.present && bMangal.present;
  const oneManglik = aMangal.present !== bMangal.present;
  results.push({
    key: "mangal",
    title: doshas.mangal.title,
    penalty: doshas.mangal.penalty,
    active: oneManglik, // по традиции: манглик у обоих — доша взаимно нейтрализуется
    neutralized: bothManglik,
  });

  return results;
}

// ---------------------------------------------------------------------------
// Публичный расчёт
// ---------------------------------------------------------------------------

export interface JyotishRawFeatures {
  a: { moonNakshatra: string; moonNakshatraIndex: number; moonRashi: RashiName; mangalDosha: boolean };
  b: { moonNakshatra: string; moonNakshatraIndex: number; moonRashi: RashiName; mangalDosha: boolean };
  gunaMilan: GunaMilanResult;
  doshas: DoshaResult[];
}

export function calcJyotishCompatibility(a: Person, b: Person): SystemReport<JyotishRawFeatures> {
  assertLicensed();
  const aMoon = calcMoonPosition(a);
  const bMoon = calcMoonPosition(b);

  const gunaMilan = calcGunaMilan(aMoon, bMoon);
  const doshaResults = calcDoshas(a, b, aMoon, bMoon);

  const penaltyTotal = doshaResults
    .filter((d) => d.active && !d.neutralized)
    .reduce((s, d) => s + d.penalty, 0);

  const rawScore = (gunaMilan.total / 36) * 100 + penaltyTotal; // penalty уже отрицательный
  const score = Math.max(0, Math.min(100, Math.round(rawScore * 10) / 10));

  const aMangal = calcMangalDosha(a, aMoon);
  const bMangal = calcMangalDosha(b, bMoon);

  return {
    score,
    rawFeatures: {
      a: {
        moonNakshatra: aMoon.nakshatraName,
        moonNakshatraIndex: aMoon.nakshatraIndex,
        moonRashi: aMoon.rashiName,
        mangalDosha: aMangal.present,
      },
      b: {
        moonNakshatra: bMoon.nakshatraName,
        moonNakshatraIndex: bMoon.nakshatraIndex,
        moonRashi: bMoon.rashiName,
        mangalDosha: bMangal.present,
      },
      gunaMilan,
      doshas: doshaResults,
    },
    blocks: {}, // текстовые блоки — из content/8-kut/*.md и content/doshi/*.md
  };
}
