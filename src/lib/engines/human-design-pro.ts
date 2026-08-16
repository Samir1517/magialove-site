/**
 * Расширенный расчёт по Дизайну человека — то, чего нет в базовом результате.
 *
 * Базовый расчёт отвечает на вопрос «что мы создаём вдвоём»: композит, тема
 * связи, каналы, открытые центры пары. Здесь считается другое — механика
 * притяжения и обусловленности, разложенная поимённо:
 *
 *   1. Тип определения (сколько несвязанных кусков в карте) и мосты, которые
 *      партнёр замыкает. Человек с разрывом всю жизнь ищет того, кто его сошьёт.
 *   2. Подвешенные ворота — половина канала без пары. По Ра это «крючки»:
 *      тянет туда, где у тебя не хватает второй половины.
 *   3. Персональная обусловленность: чей определённый центр стоит напротив
 *      чьего открытого. Не «мы вдвоём открыты», а «в чём именно рядом с ним
 *      ты перестаёшь быть собой».
 *   4. Чего в паре нет вообще — темы, которых неоткуда взять. Самый честный
 *      блок: он говорит, на что не надо тратить годы.
 *
 * Ничего нового из эфемерид здесь не берётся: всё выводится из уже посчитанных
 * `PersonalDesign`. Модуль чистый — без React и без данных о содержании,
 * только структура. Тексты живут отдельно, в слое контента.
 */

import {
  CHANNELS,
  CENTER_GATES,
  MOTOR_CENTERS,
  centerOfGate,
  channelsOfGate,
  type CenterKey,
} from "./human-design-tables";
import { ALL_CENTERS, type PersonalDesign } from "./human_design";

// ---------------------------------------------------------------------------
// Общая утилита: связные группы определённых центров
// ---------------------------------------------------------------------------

/** Разбирает набор определённых каналов на связные группы центров. */
function centerGroups(definedChannels: string[], definedCenters: Set<CenterKey>): CenterKey[][] {
  const adjacency = new Map<CenterKey, CenterKey[]>();
  const link = (a: CenterKey, b: CenterKey) => {
    if (!adjacency.has(a)) adjacency.set(a, []);
    adjacency.get(a)!.push(b);
  };

  for (const key of definedChannels) {
    const [g1, g2] = key.split("-").map(Number);
    const c1 = centerOfGate(g1);
    const c2 = centerOfGate(g2);
    link(c1, c2);
    link(c2, c1);
  }

  const seen = new Set<CenterKey>();
  const groups: CenterKey[][] = [];

  for (const center of definedCenters) {
    if (seen.has(center)) continue;
    const group: CenterKey[] = [];
    const queue: CenterKey[] = [center];
    seen.add(center);
    while (queue.length) {
      const cur = queue.shift()!;
      group.push(cur);
      for (const next of adjacency.get(cur) ?? []) {
        if (!seen.has(next)) {
          seen.add(next);
          queue.push(next);
        }
      }
    }
    groups.push(group);
  }

  return groups;
}

// ---------------------------------------------------------------------------
// 1. Тип определения
// ---------------------------------------------------------------------------

export type DefinitionKind =
  | "none" // Рефлектор: определённых центров нет
  | "single"
  | "split"
  | "triple"
  | "quadruple";

export interface DefinitionResult {
  kind: DefinitionKind;
  /** Число несвязанных групп определённых центров. Для Рефлектора — 0. */
  groupCount: number;
  /** Сами группы, каждая — список ключей центров. */
  groups: CenterKey[][];
}

/**
 * Считает, на сколько несвязанных кусков распадается определение.
 *
 * Пять и больше групп в классике не выделяют отдельным названием — такие карты
 * встречаются крайне редко и читаются как четверное расщепление. Поэтому
 * `kind` упирается в "quadruple", а точное число всегда лежит в `groupCount`.
 */
export function calcDefinition(design: PersonalDesign): DefinitionResult {
  const groups = centerGroups(design.definedChannels, design.definedCenters);
  const groupCount = groups.length;

  let kind: DefinitionKind;
  if (groupCount === 0) kind = "none";
  else if (groupCount === 1) kind = "single";
  else if (groupCount === 2) kind = "split";
  else if (groupCount === 3) kind = "triple";
  else kind = "quadruple";

  return { kind, groupCount, groups };
}

// ---------------------------------------------------------------------------
// 2. Подвешенные ворота
// ---------------------------------------------------------------------------

export interface HangingGate {
  /** Активированные ворота, у которых не хватает пары. */
  gate: number;
  /** Каких ворот не хватает, чтобы канал замкнулся. */
  missingGate: number;
  /** Ключ канала, который замкнулся бы. */
  channelKey: string;
  channelName: string;
  /** Центр, из которого ворота торчат. */
  center: CenterKey;
  /** Центр, к которому канал вёл бы. */
  towardCenter: CenterKey;
}

/**
 * Все половины каналов, у которых нет второй половины.
 *
 * Ворота 10, 20, 34 и 57 входят каждые в три канала, поэтому одни и те же
 * ворота могут быть подвешены сразу по нескольким направлениям — это не
 * дубликат, а разные незакрытые каналы, и каждый тянет в свою сторону.
 */
export function calcHangingGates(design: PersonalDesign): HangingGate[] {
  const out: HangingGate[] = [];

  for (const gate of design.activatedGates) {
    for (const ch of channelsOfGate(gate)) {
      const [g1, g2] = ch.gates;
      const missingGate = g1 === gate ? g2 : g1;
      if (design.activatedGates.has(missingGate)) continue;
      out.push({
        gate,
        missingGate,
        channelKey: ch.key,
        channelName: ch.name,
        center: centerOfGate(gate),
        towardCenter: centerOfGate(missingGate),
      });
    }
  }

  return out.sort((x, y) => x.gate - y.gate || x.missingGate - y.missingGate);
}

// ---------------------------------------------------------------------------
// 3. Кто чьи подвешенные ворота закрывает
// ---------------------------------------------------------------------------

export interface ClosedHangingGate extends HangingGate {
  /** Партнёр, у которого есть недостающие ворота. */
  closedBy: "a" | "b";
}

/**
 * Подвешенные ворота одного, которые закрывает другой.
 *
 * Это и есть механика притяжения в чистом виде: тянет туда, где партнёр
 * достраивает недостающую половину. Ровно те же пары ворот дают
 * электромагнитные каналы в базовом расчёте — здесь они показаны с другой
 * стороны, поимённо и с указанием, чья половина чья.
 */
export function calcClosedHangingGates(
  owner: PersonalDesign,
  partner: PersonalDesign,
  partnerSide: "a" | "b"
): ClosedHangingGate[] {
  return calcHangingGates(owner)
    .filter((h) => partner.activatedGates.has(h.missingGate))
    .map((h) => ({ ...h, closedBy: partnerSide }));
}

// ---------------------------------------------------------------------------
// 4. Мосты: чем партнёр сшивает разрыв
// ---------------------------------------------------------------------------

export interface Bridge {
  channelKey: string;
  channelName: string;
  gates: [number, number];
  /** Ворота, которых у владельца карты не было. */
  gatesFromPartner: number[];
  /** Индексы групп владельца, которые этот канал соединяет. */
  joinsGroups: [number, number];
  centers: [CenterKey, CenterKey];
}

/**
 * Каналы, которые в паре замыкаются и при этом соединяют РАЗНЫЕ группы
 * определения владельца карты — то есть буквально сшивают его разрыв.
 *
 * Важно: канал, который просто добавляет пару новых центров сбоку, мостом не
 * считается. Мост — только то, что соединяет два уже существовавших куска.
 * Отсюда и практический смысл: без этого человека куски снова расходятся,
 * и «рядом с ним я целая» перестаёт быть метафорой.
 */
export function calcBridges(owner: PersonalDesign, partner: PersonalDesign): Bridge[] {
  const groups = centerGroups(owner.definedChannels, owner.definedCenters);
  if (groups.length < 2) return [];

  const groupOfCenter = new Map<CenterKey, number>();
  groups.forEach((group, index) => {
    for (const center of group) groupOfCenter.set(center, index);
  });

  const union = new Set<number>([...owner.activatedGates, ...partner.activatedGates]);
  const ownChannels = new Set(owner.definedChannels);
  const bridges: Bridge[] = [];

  for (const ch of CHANNELS) {
    if (ownChannels.has(ch.key)) continue;
    const [g1, g2] = ch.gates;
    if (!union.has(g1) || !union.has(g2)) continue;

    const c1 = centerOfGate(g1);
    const c2 = centerOfGate(g2);
    const group1 = groupOfCenter.get(c1);
    const group2 = groupOfCenter.get(c2);

    // Мост — только между двумя разными уже существующими группами.
    if (group1 === undefined || group2 === undefined || group1 === group2) continue;

    bridges.push({
      channelKey: ch.key,
      channelName: ch.name,
      gates: [g1, g2],
      gatesFromPartner: [g1, g2].filter((g) => !owner.activatedGates.has(g)),
      joinsGroups: [group1, group2],
      centers: [c1, c2],
    });
  }

  return bridges;
}

// ---------------------------------------------------------------------------
// 5. Персональная обусловленность
// ---------------------------------------------------------------------------

export interface ConditioningItem {
  /** Центр, который у владельца карты открыт, а у партнёра определён. */
  center: CenterKey;
  /** Ворота партнёра в этом центре — чем именно он туда «светит». */
  partnerGates: number[];
  /** Ворота владельца в этом центре, если есть: открытый центр с активациями. */
  ownGates: number[];
}

/**
 * Центры, открытые у владельца карты и определённые у партнёра.
 *
 * Это места, где владелец принимает и усиливает чужую энергию как свою. У
 * блока обязательно две стороны: здесь же лежит и чувствительность к теме,
 * которой у партнёра нет, — открытый центр не дефект, а орган восприятия.
 *
 * `ownGates` важны отдельно: открытый центр с одной-двумя активациями ведёт
 * себя иначе, чем совсем пустой, и человек в нём цепляется именно за свои
 * ворота.
 */
export function calcConditioning(
  owner: PersonalDesign,
  partner: PersonalDesign
): ConditioningItem[] {
  const out: ConditioningItem[] = [];

  for (const center of ALL_CENTERS) {
    if (owner.definedCenters.has(center)) continue;
    if (!partner.definedCenters.has(center)) continue;

    out.push({
      center,
      partnerGates: CENTER_GATES[center].filter((g) => partner.activatedGates.has(g)),
      ownGates: CENTER_GATES[center].filter((g) => owner.activatedGates.has(g)),
    });
  }

  return out;
}

// ---------------------------------------------------------------------------
// 6. Чего в паре нет вообще
// ---------------------------------------------------------------------------

export interface AbsentTheme {
  channelKey: string;
  channelName: string;
  gates: [number, number];
  /**
   * "none"  — обеих ворот нет ни у кого: темы в паре нет как материала.
   * "half"  — одни ворота есть, вторых нет ни у кого: тема начата, но замкнуть
   *           её вдвоём невозможно, только через третьего человека.
   */
  kind: "none" | "half";
  /** Какие ворота канала в паре присутствуют (для kind === "half" — одни). */
  presentGates: number[];
}

/**
 * Каналы, которые пара не может закрыть никогда.
 *
 * Тот самый честный блок: набор ворот фиксируется в момент рождения и не
 * меняется, поэтому темы, которых нет ни у одного из двоих, не появятся ни от
 * работы над отношениями, ни от времени. Отделить «можно развить» от «неоткуда
 * взять» — это и есть польза, ради которой блок существует.
 *
 * Разделение на "none" и "half" принципиально: в первом случае тема не звучит
 * в паре вообще, во втором она звучит одной стороной и вечно ищет ответ,
 * которого внутри пары нет.
 */
export function calcAbsentThemes(a: PersonalDesign, b: PersonalDesign): AbsentTheme[] {
  const union = new Set<number>([...a.activatedGates, ...b.activatedGates]);
  const out: AbsentTheme[] = [];

  for (const ch of CHANNELS) {
    const [g1, g2] = ch.gates;
    const has1 = union.has(g1);
    const has2 = union.has(g2);
    if (has1 && has2) continue;

    const presentGates = [g1, g2].filter((g) => union.has(g));
    out.push({
      channelKey: ch.key,
      channelName: ch.name,
      gates: [g1, g2],
      kind: presentGates.length === 0 ? "none" : "half",
      presentGates,
    });
  }

  return out;
}

// ---------------------------------------------------------------------------
// 7. Общие ворота
// ---------------------------------------------------------------------------

export interface SharedGate {
  gate: number;
  center: CenterKey;
  /** Замкнут ли у обоих канал через эти ворота — тогда тема не просто общая, а рабочая. */
  bothInChannel: boolean;
}

/**
 * Ворота, активированные у обоих.
 *
 * Общая тема — это и то, что вас узнало друг в друге, и то, где вас топит
 * одинаково: в плохой день оба валятся в одну и ту же сторону, и подстраховать
 * некому. У блока обязательно две стороны, как и у всего остального.
 */
export function calcSharedGates(a: PersonalDesign, b: PersonalDesign): SharedGate[] {
  const out: SharedGate[] = [];

  for (const gate of a.activatedGates) {
    if (!b.activatedGates.has(gate)) continue;
    const bothInChannel = channelsOfGate(gate).some(
      (ch) => a.definedChannels.includes(ch.key) && b.definedChannels.includes(ch.key)
    );
    out.push({ gate, center: centerOfGate(gate), bothInChannel });
  }

  return out.sort((x, y) => x.gate - y.gate);
}

// ---------------------------------------------------------------------------
// 8. Ранжирование: куда тратить глубину
// ---------------------------------------------------------------------------

export type HighlightKind =
  | "bridge"
  | "closedHanging"
  | "conditioningBare"
  | "conditioningAnchored"
  | "sharedGate"
  | "absentHalf"
  | "absentNone";

export interface Highlight {
  kind: HighlightKind;
  /** Чья это тема: чья карта затронута. "both" — общее для пары. */
  side: "a" | "b" | "both";
  weight: number;
  gates: number[];
  channelKey?: string;
  center?: CenterKey;
  /** Техническая подпись для отладки и для якорей, не для показа читателю. */
  label: string;
}

/**
 * Веса. Вынесены отдельной таблицей намеренно: это редакционное решение о
 * том, что важнее в разговоре про отношения, а не факт из первоисточника.
 * Менять их можно и нужно, но осознанно и в одном месте.
 *
 * Логика порядка:
 *   мост            — отвечает сразу на «почему тянет» и «почему без него
 *                     разваливаюсь»; сильнее этого в парном чтении нет ничего;
 *   закрытые ворота — чистый механизм притяжения, поимённо;
 *   голый центр     — открытый центр совсем без своих ворот: человеку не за что
 *                     зацепиться, обусловленность максимальная;
 *   центр с якорем  — то же, но свои активации есть, и они держат;
 *   общие ворота    — удвоение темы, заметно обоим, но объясняет меньше;
 *   тема наполовину — есть запрос, ответа внутри пары нет;
 *   темы нет вовсе  — важно для честности, но узнавания не даёт: человек не
 *                     скучает по тому, чего никогда не пробовал.
 */
const HIGHLIGHT_WEIGHT: Record<HighlightKind, number> = {
  bridge: 100,
  closedHanging: 70,
  conditioningBare: 60,
  conditioningAnchored: 45,
  sharedGate: 40,
  absentHalf: 25,
  absentNone: 15,
};

/**
 * Моторные центры телеснее прочих: усталость, влечение и злость человек
 * замечает раньше, чем изменения в способе думать. Обусловленность по ним
 * узнаётся легче, поэтому небольшая надбавка.
 */
const MOTOR_BONUS = 8;

/**
 * Надбавка за взаимность: канал, где каждый достраивает другого, тянет сильнее
 * односторонней достройки и объясняется читателю легче — обоим есть что узнать
 * про себя, а не только одному.
 */
const MUTUAL_BONUS = 10;

/**
 * Собирает все находки в один упорядоченный список.
 *
 * Нужен ровно для одного: решить, где тратить развёрнутый текст, а где хватит
 * карточки. Равномерный отчёт не читают — у эталонов рынка перепад плотности
 * между верхушкой и хвостом достигает полусотни раз.
 *
 * Мост поглощает закрытые подвешенные ворота того же канала: это одно событие,
 * рассказанное дважды, и в отчёте оно должно быть одним блоком.
 */
export function rankHighlights(pro: HumanDesignPro): Highlight[] {
  const out: Highlight[] = [];

  // Канал — одно событие, даже если он одновременно мост для одного и
  // закрытые подвешенные ворота для другого. Сначала собираем всё, что про
  // канал известно, и только потом решаем, чем он является для пары; иначе
  // читатель получает два блока об одном и том же.
  interface ChannelFact {
    gates: [number, number];
    bridgeFor: ("a" | "b")[];
    closedFor: ("a" | "b")[];
  }
  const byChannel = new Map<string, ChannelFact>();
  const factOf = (key: string, gates: [number, number]): ChannelFact => {
    let fact = byChannel.get(key);
    if (!fact) {
      fact = { gates, bridgeFor: [], closedFor: [] };
      byChannel.set(key, fact);
    }
    return fact;
  };

  for (const [side, data] of [
    ["a", pro.a],
    ["b", pro.b],
  ] as const) {
    for (const br of data.bridges) {
      factOf(br.channelKey, br.gates).bridgeFor.push(side);
    }
    for (const h of data.closedByPartner) {
      const [g1, g2] = h.channelKey.split("-").map(Number) as [number, number];
      factOf(h.channelKey, [g1, g2]).closedFor.push(side);
    }
  }

  for (const [channelKey, fact] of byChannel) {
    const isBridge = fact.bridgeFor.length > 0;
    const kind: HighlightKind = isBridge ? "bridge" : "closedHanging";
    const touched = new Set<"a" | "b">([...fact.bridgeFor, ...fact.closedFor]);
    const side = touched.size === 2 ? "both" : [...touched][0];

    out.push({
      kind,
      side,
      // Взаимность усиливает: когда каждый достраивает другого, тяга сильнее и
      // объяснить её человеку проще, чем одностороннюю.
      weight: HIGHLIGHT_WEIGHT[kind] + (touched.size === 2 ? MUTUAL_BONUS : 0),
      gates: fact.gates,
      channelKey,
      label: `канал ${channelKey}`,
    });
  }

  for (const [side, data] of [
    ["a", pro.a],
    ["b", pro.b],
  ] as const) {
    for (const c of data.conditioning) {
      const kind: HighlightKind = c.ownGates.length === 0 ? "conditioningBare" : "conditioningAnchored";
      const motor = MOTOR_CENTERS.includes(c.center) ? MOTOR_BONUS : 0;
      out.push({
        kind,
        side,
        weight: HIGHLIGHT_WEIGHT[kind] + motor,
        gates: c.partnerGates,
        center: c.center,
        label: `${c.center} обусловлен у ${side}`,
      });
    }
  }

  for (const s of pro.shared) {
    out.push({
      kind: "sharedGate",
      side: "both",
      weight: HIGHLIGHT_WEIGHT.sharedGate + (s.bothInChannel ? 5 : 0),
      gates: [s.gate],
      center: s.center,
      label: `общие ворота ${s.gate}`,
    });
  }

  for (const t of pro.absent) {
    const kind: HighlightKind = t.kind === "half" ? "absentHalf" : "absentNone";
    out.push({
      kind,
      side: "both",
      weight: HIGHLIGHT_WEIGHT[kind],
      gates: t.gates,
      channelKey: t.channelKey,
      label: `нет темы ${t.channelKey}`,
    });
  }

  // Вес по убыванию; при равном весе — устойчивый порядок по подписи, чтобы
  // один и тот же расчёт всегда давал одинаковую страницу.
  return out.sort((x, y) => y.weight - x.weight || x.label.localeCompare(y.label, "ru"));
}

// ---------------------------------------------------------------------------
// Сводка
// ---------------------------------------------------------------------------

export interface ProSide {
  definition: DefinitionResult;
  hanging: HangingGate[];
  /** Подвешенные ворота этого человека, которые закрывает партнёр. */
  closedByPartner: ClosedHangingGate[];
  /** Каналы партнёра, сшивающие разрыв этого человека. */
  bridges: Bridge[];
  /** Центры этого человека, открытые у него и определённые у партнёра. */
  conditioning: ConditioningItem[];
}

export interface HumanDesignPro {
  a: ProSide;
  b: ProSide;
  /** Ворота, активированные у обоих. */
  shared: SharedGate[];
  /** Темы, которых в паре нет — общее для обоих. */
  absent: AbsentTheme[];
}

export function calcHumanDesignPro(a: PersonalDesign, b: PersonalDesign): HumanDesignPro {
  return {
    shared: calcSharedGates(a, b),
    a: {
      definition: calcDefinition(a),
      hanging: calcHangingGates(a),
      closedByPartner: calcClosedHangingGates(a, b, "b"),
      bridges: calcBridges(a, b),
      conditioning: calcConditioning(a, b),
    },
    b: {
      definition: calcDefinition(b),
      hanging: calcHangingGates(b),
      closedByPartner: calcClosedHangingGates(b, a, "a"),
      bridges: calcBridges(b, a),
      conditioning: calcConditioning(b, a),
    },
    absent: calcAbsentThemes(a, b),
  };
}
