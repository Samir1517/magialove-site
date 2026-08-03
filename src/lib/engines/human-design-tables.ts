/**
 * Справочные таблицы Дизайна человека, которых нет в data/*.json (там —
 * только 8 каналов-примеров из 36 и 6 линий профиля вместо 12 сочетаний).
 * Источники: сверено WebSearch/WebFetch по официальной терминологии школы
 * (см. комментарии в /dizajn-cheloveka-sovmestimost/kanaly-svyazi/* и /dizajn-cheloveka-sovmestimost/avtoritety/*)
 * — колесо 64 ворот (каждое ровно 5.625° = 360/64), 9 центров и 36 каналов.
 *
 * Колесо ворот проверено арифметически: Ворота 25 начинаются в 28°15′00″ Рыб
 * (=358.25° абс.) и заканчиваются в 3°52′30″ Овна (=3.875°=358.25+5.625) —
 * оба значения независимо подтверждены источником и совпадают ТОЧНО с шагом
 * 5.625°, что даёт высокую уверенность в верности всей последовательности.
 */

// ---------------------------------------------------------------------------
// Колесо 64 ворот
// ---------------------------------------------------------------------------

/** Начало ворот №25 (первых по кругу от 0°) — абсолютный градус эклиптики. */
export const WHEEL_START_DEG = 358.25;

export const GATE_WIDTH = 360 / 64; // 5.625°
export const LINE_WIDTH = GATE_WIDTH / 6; // 0.9375°

/** Последовательность номеров ворот по кругу, начиная с WHEEL_START_DEG. */
export const GATE_WHEEL: number[] = [
  25, 17, 21, 51, 42, 3, 27, 24, 2, 23, 8, 20, 16, 35, 45, 12, 15, 52, 39, 53, 62, 56,
  31, 33, 7, 4, 29, 59, 40, 64, 47, 6, 46, 18, 48, 57, 32, 50, 28, 44, 1, 43, 14, 34,
  9, 5, 26, 11, 10, 58, 38, 54, 61, 60, 41, 19, 13, 49, 30, 55, 37, 63, 22, 36,
];

export interface GateLine {
  gate: number;
  line: number;
}

/** Определяет ворота+линию по абсолютной эклиптической долготе (тропической). */
export function longitudeToGateLine(lon: number): GateLine {
  const offset = ((lon - WHEEL_START_DEG) % 360 + 360) % 360;
  const gateIndex = Math.floor(offset / GATE_WIDTH);
  const withinGate = offset - gateIndex * GATE_WIDTH;
  const line = Math.floor(withinGate / LINE_WIDTH) + 1;
  return { gate: GATE_WHEEL[gateIndex], line: Math.min(line, 6) };
}

// ---------------------------------------------------------------------------
// 9 центров и их ворота
// ---------------------------------------------------------------------------

export type CenterKey =
  | "head" | "ajna" | "throat" | "g" | "heart" | "spleen" | "sacral" | "solarplexus" | "root";

export const CENTER_NAMES: Record<CenterKey, string> = {
  head: "Голова",
  ajna: "Аджна",
  throat: "Горло",
  g: "G-центр (идентичность)",
  heart: "Сердце/Эго",
  spleen: "Селезёнка",
  sacral: "Сакральный",
  solarplexus: "Солнечное сплетение",
  root: "Корневой",
};

export const CENTER_GATES: Record<CenterKey, number[]> = {
  head: [61, 63, 64],
  ajna: [4, 11, 17, 24, 43, 47],
  throat: [8, 12, 16, 20, 23, 31, 33, 35, 45, 56, 62],
  g: [1, 2, 7, 10, 13, 15, 25, 46],
  heart: [21, 26, 40, 51],
  spleen: [18, 28, 32, 44, 48, 50, 57],
  sacral: [3, 5, 9, 14, 27, 29, 34, 42, 59],
  solarplexus: [6, 22, 30, 36, 37, 49, 55],
  root: [19, 38, 39, 41, 52, 53, 54, 58, 60],
};

const GATE_CENTER_MAP: Record<number, CenterKey> = {};
for (const [center, gates] of Object.entries(CENTER_GATES) as [CenterKey, number[]][]) {
  for (const gate of gates) GATE_CENTER_MAP[gate] = center;
}

export function centerOfGate(gate: number): CenterKey {
  return GATE_CENTER_MAP[gate];
}

/** 4 "моторных" центра — источник энергии действия. */
export const MOTOR_CENTERS: CenterKey[] = ["sacral", "heart", "solarplexus", "root"];

// ---------------------------------------------------------------------------
// 36 каналов
// ---------------------------------------------------------------------------

export interface ChannelDef {
  gates: [number, number];
  key: string; // "низший-высший", напр. "1-8"
  name: string;
}

const RAW_CHANNELS: [number, number, string][] = [
  [1, 8, "Вдохновения"], [2, 14, "Биения"], [3, 60, "Мутации"], [4, 63, "Логики"],
  [5, 15, "Ритма"], [6, 59, "Близости"], [7, 31, "Альфа"], [9, 52, "Концентрации"],
  [10, 20, "Пробуждения"], [10, 34, "Исследования"], [10, 57, "Совершенной формы"],
  [11, 56, "Любопытства"], [12, 22, "Открытости"], [13, 33, "Блудного сына"],
  [16, 48, "Волны"], [17, 62, "Принятия"], [18, 58, "Суждения"], [19, 49, "Синтеза"],
  [20, 34, "Харизмы"], [20, 57, "Мозговой волны"], [21, 45, "Денежная линия"],
  [23, 43, "Структурирования"], [24, 61, "Осознания"], [25, 51, "Инициации"],
  [26, 44, "Капитуляции"], [27, 50, "Сохранения"], [28, 38, "Борьбы"],
  [29, 46, "Открытия"], [30, 41, "Узнавания"], [32, 54, "Преобразования"],
  [34, 57, "Силы"], [35, 36, "Быстротечности"], [37, 40, "Сообщества"],
  [39, 55, "Эмоционирования"], [42, 53, "Созревания"], [47, 64, "Абстракции"],
];

export const CHANNELS: ChannelDef[] = RAW_CHANNELS.map(([a, b, name]) => ({
  gates: [Math.min(a, b), Math.max(a, b)],
  key: `${Math.min(a, b)}-${Math.max(a, b)}`,
  name,
}));

/** Каналы, в которых участвует данное ворота (обычно один, но 10/20/34/57 — по три). */
const CHANNELS_BY_GATE: Record<number, ChannelDef[]> = {};
for (const ch of CHANNELS) {
  for (const g of ch.gates) {
    (CHANNELS_BY_GATE[g] ??= []).push(ch);
  }
}

export function channelsOfGate(gate: number): ChannelDef[] {
  return CHANNELS_BY_GATE[gate] ?? [];
}
