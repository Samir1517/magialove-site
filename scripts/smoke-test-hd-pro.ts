/**
 * Прогон расширенного расчёта по Дизайну человека на живых датах.
 *
 * Проверяет не только «не падает», но и внутреннюю согласованность:
 * подвешенные ворота не должны пересекаться с определёнными каналами,
 * сумма центров по группам определения должна сходиться с числом
 * определённых центров, а мосты обязаны соединять разные группы.
 */

import { calcPersonalDesign, ALL_CENTERS, ACTIVATION_BODIES } from "../src/lib/engines/human_design";
import { calcHumanDesignPro, calcDefinition, rankHighlights } from "../src/lib/engines/human-design-pro";
import { CENTER_NAMES, CHANNELS } from "../src/lib/engines/human-design-tables";
import { GATES } from "../src/lib/data/human_design/gates";
import { geneKey } from "../src/lib/data/human_design/gene-keys";
import { CONDITIONING_BY_CENTER } from "../src/lib/content/human-design-pro";
import { CHANNEL_PAIR, channelPair, BRIDGE_NOTE, PAIR_LABEL, pairLabel } from "../src/lib/content/human-design-channels-pair";
import { GATE_IN_PAIR, gateInPair, TRIAD_FRAME } from "../src/lib/content/human-design-triads";
import { applyGender, findUnexpanded } from "../src/lib/content/gender";
import { ABSENT_FRAME, CHANNEL_ABSENT, channelAbsent } from "../src/lib/content/human-design-absent";
import { OPENING, MAP_FRAME, ACTIVATION_BODY_MEANING, CLOSING } from "../src/lib/content/human-design-report-frame";
import type { Person } from "../src/lib/engines/types";

// Пол по умолчанию: женский у первого партнёра, мужской у второго — так же,
// как в форме. На расчёт не влияет нигде, только на род в текстах.
const partnerA: Person = {
  sex: "ж",
  birthDate: "1990-08-17",
  birthTime: "14:30",
  birthTimeKnown: true,
  birthPlace: { city: "Москва", lat: 55.7558, lon: 37.6173, tz: "Europe/Moscow" },
};

const partnerB: Person = {
  sex: "м",
  birthDate: "1992-03-05",
  birthTime: "08:15",
  birthTimeKnown: true,
  birthPlace: { city: "Санкт-Петербург", lat: 59.9311, lon: 30.3609, tz: "Europe/Moscow" },
};

const a = calcPersonalDesign(partnerA);
const b = calcPersonalDesign(partnerB);
const pro = calcHumanDesignPro(a, b);

const gateName = (g: number) => `${g} «${GATES[g]?.name ?? "?"}»`;

let failures = 0;
const check = (ok: boolean, message: string) => {
  if (!ok) {
    failures += 1;
    console.log(`  ПРОВАЛ: ${message}`);
  }
};

for (const [label, side, design] of [
  ["A", pro.a, a],
  ["B", pro.b, b],
] as const) {
  console.log(`\n=== Партнёр ${label}: ${design.type}, профиль ${design.profile} ===`);

  const d = side.definition;
  console.log(`Определение: ${d.kind}, групп ${d.groupCount}`);
  d.groups.forEach((group, i) => {
    console.log(`  группа ${i + 1}: ${group.map((c) => CENTER_NAMES[c]).join(", ")}`);
  });

  // Сумма центров по группам обязана равняться числу определённых центров.
  const inGroups = d.groups.reduce((sum, g) => sum + g.length, 0);
  check(
    inGroups === design.definedCenters.size,
    `групп покрывают ${inGroups} центров, а определено ${design.definedCenters.size}`
  );

  console.log(`\nПодвешенные ворота (${side.hanging.length}):`);
  for (const h of side.hanging) {
    console.log(
      `  ${gateName(h.gate)} → не хватает ${gateName(h.missingGate)} ` +
        `(канал ${h.channelKey} «${h.channelName}», ${CENTER_NAMES[h.center]} → ${CENTER_NAMES[h.towardCenter]})`
    );
    // Подвешенные ворота не могут принадлежать уже определённому каналу.
    check(
      !design.definedChannels.includes(h.channelKey),
      `канал ${h.channelKey} одновременно определён и подвешен`
    );
    check(design.activatedGates.has(h.gate), `ворота ${h.gate} подвешены, но не активированы`);
    check(
      !design.activatedGates.has(h.missingGate),
      `ворота ${h.missingGate} считаются недостающими, но активированы`
    );
  }

  console.log(`\nИз них закрывает партнёр (${side.closedByPartner.length}):`);
  for (const h of side.closedByPartner) {
    console.log(`  ${gateName(h.gate)} + ${gateName(h.missingGate)} = канал ${h.channelKey} «${h.channelName}»`);
  }

  console.log(`\nМосты через партнёра (${side.bridges.length}):`);
  for (const br of side.bridges) {
    console.log(
      `  канал ${br.channelKey} «${br.channelName}» соединяет группы ` +
        `${br.joinsGroups[0] + 1} и ${br.joinsGroups[1] + 1}; от партнёра ворота ${br.gatesFromPartner.join(", ") || "—"}`
    );
    check(br.joinsGroups[0] !== br.joinsGroups[1], `мост ${br.channelKey} соединяет группу саму с собой`);
  }
  if (d.groupCount < 2) {
    check(side.bridges.length === 0, "мосты найдены при цельном определении");
  }

  console.log(`\nОбусловленность — открыт у ${label}, определён у партнёра (${side.conditioning.length}):`);
  for (const c of side.conditioning) {
    console.log(
      `  ${CENTER_NAMES[c.center]}: партнёр держит ворота ${c.partnerGates.join(", ")}` +
        (c.ownGates.length ? `; свои активации здесь — ${c.ownGates.join(", ")}` : "; своих активаций нет")
    );
    check(!design.definedCenters.has(c.center), `центр ${c.center} назван открытым, но он определён`);
  }
}

console.log(`\n=== Чего в паре нет (${pro.absent.length} каналов из ${CHANNELS.length}) ===`);
const none = pro.absent.filter((t) => t.kind === "none");
const half = pro.absent.filter((t) => t.kind === "half");
console.log(`Темы нет вообще — ${none.length}:`);
for (const t of none) console.log(`  ${t.channelKey} «${t.channelName}» (ворота ${t.gates.join(" и ")})`);
console.log(`Тема звучит одной стороной — ${half.length}:`);
for (const t of half) {
  console.log(`  ${t.channelKey} «${t.channelName}»: есть ${t.presentGates.join(", ")}, нет ${t.gates.filter((g) => !t.presentGates.includes(g)).join(", ")}`);
}

console.log(`\n=== Общие ворота (${pro.shared.length}) ===`);
for (const s of pro.shared) {
  console.log(`  ${gateName(s.gate)} · ${CENTER_NAMES[s.center]}${s.bothInChannel ? " — канал замкнут у обоих" : ""}`);
  check(a.activatedGates.has(s.gate) && b.activatedGates.has(s.gate), `ворота ${s.gate} названы общими, но есть не у обоих`);
}

const ranked = rankHighlights(pro);
console.log(`\n=== Ранжирование: топ-12 из ${ranked.length} ===`);
ranked.slice(0, 12).forEach((h, i) => {
  console.log(`  ${String(i + 1).padStart(2)}. вес ${String(h.weight).padStart(3)} · ${h.kind} · ${h.label}`);
});

// Список обязан быть отсортирован по убыванию веса.
for (let i = 1; i < ranked.length; i += 1) {
  check(ranked[i - 1].weight >= ranked[i].weight, `порядок сбит на позиции ${i}: ${ranked[i - 1].weight} < ${ranked[i].weight}`);
}

// Один канал — ровно одна строка в отчёте, чем бы он ни был для каждого из двоих.
const seenChannels = new Map<string, string>();
for (const h of ranked) {
  if (!h.channelKey) continue;
  const prev = seenChannels.get(h.channelKey);
  check(prev === undefined, `канал ${h.channelKey} попал в список дважды: «${prev}» и «${h.kind}»`);
  seenChannels.set(h.channelKey, h.kind);
}

// Мост поглощает закрытые ворота того же канала: если канал где-то мост, его
// строка обязана быть мостом, а не подвешенными воротами.
for (const side of ["a", "b"] as const) {
  for (const br of (side === "a" ? pro.a : pro.b).bridges) {
    check(
      ranked.find((h) => h.channelKey === br.channelKey)?.kind === "bridge",
      `канал ${br.channelKey} — мост у ${side}, но в списке не как мост`
    );
  }
}

// Порядок обязан быть устойчивым: тот же расчёт — та же страница.
const again = rankHighlights(calcHumanDesignPro(a, b));
check(
  again.map((h) => h.label).join("|") === ranked.map((h) => h.label).join("|"),
  "повторный прогон дал другой порядок"
);

// Проверка полноты: каждый канал ровно один раз либо закрыт в композите, либо в absent.
const unionGates = new Set<number>([...a.activatedGates, ...b.activatedGates]);
const closedInPair = CHANNELS.filter((ch) => ch.gates.every((g) => unionGates.has(g)));
check(
  closedInPair.length + pro.absent.length === CHANNELS.length,
  `${closedInPair.length} закрытых + ${pro.absent.length} отсутствующих ≠ ${CHANNELS.length}`
);

// Рефлектор: определения нет, групп ноль.
const reflectorLike = calcDefinition({ ...a, definedCenters: new Set(), definedChannels: [] });
check(reflectorLike.kind === "none" && reflectorLike.groupCount === 0, "пустое определение не даёт kind=none");

// Все девять центров учтены.
check(ALL_CENTERS.length === 9, `центров ${ALL_CENTERS.length}, ожидалось 9`);

// --- Контент: собранный блок обусловленности на живых данных -----------------

console.log("\n\n=== СОБРАННЫЙ БЛОК: «Где вы меняете друг друга» ===");

// Читатель — первый партнёр: именно он заполнял форму. Значит сторона "a" —
// «открыт у тебя», сторона "b" — «открыт у партнёра». Пол берётся из тех же
// Person, что ушли в расчёт: по умолчанию женский у первого, мужской у второго.
const ctx = { self: partnerA.sex, other: partnerB.sex };
const g = (s: string) => applyGender(s, ctx);

for (const [side, data] of [
  ["a", pro.a],
  ["b", pro.b],
] as const) {
  for (const c of data.conditioning) {
    const t = CONDITIONING_BY_CENTER[c.center];
    const s = side === "a" ? t.you : t.partner;
    const heading = side === "a" ? "Партнёр влияет на тебя" : "Ты влияешь на партнёра";
    const openAt = side === "a" ? "у тебя" : "у партнёра";
    const definedAt = side === "a" ? "у партнёра" : "у тебя";

    console.log(`\n--- ${heading}: ${t.topic} ---`);
    console.log(
      `${CENTER_NAMES[c.center]} открыт ${openAt} · ${definedAt} включён воротами ${c.partnerGates.map(gateName).join(", ")}`
    );
    console.log(`\n${g(t.organ)}`);
    console.log(`\n${g(s.scene)}`);
    console.log(`\n${g(s.light)}`);
    if (c.ownGates.length) console.log(`\nСобственные активации: ${c.ownGates.map(gateName).join(", ")}. ${g(s.anchor)}`);
    console.log(`\nНе изменится: ${g(s.fixed)}`);
    console.log(`Изменится: ${g(s.changeable)}`);
  }
}

// Все девять центров обязаны иметь текст с обеих сторон: центр без описания
// оставит в платном разборе дырку ровно там, где человек ждёт объяснения.
// Длина проверяется раздельно — `topic` короткая подпись по замыслу.
for (const center of ALL_CENTERS) {
  const t = CONDITIONING_BY_CENTER[center];
  check(Boolean(t), `нет текста для центра ${center}`);
  if (!t) continue;
  check(t.topic.trim().length >= 4, `${center}.topic слишком короткий`);
  check(t.organ.trim().length > 60, `${center}.organ короче объяснения`);

  const fields: [string, string][] = [["organ", t.organ]];
  for (const [role, s] of [["you", t.you], ["partner", t.partner]] as const) {
    for (const [key, value] of Object.entries(s)) {
      check(value.trim().length > 40, `${center}.${role}.${key} пустое или слишком короткое`);
      fields.push([`${role}.${key}`, value]);
    }
  }

  for (const [where, value] of fields) {
    // Единственная проверка разметки, возможная без ложных срабатываний:
    // фигурная скобка, которая не раскрылась, — всегда опечатка. Проверку на
    // забытое голое «он» пришлось убрать, причина описана в content/gender.ts.
    const broken = findUnexpanded(value);
    check(broken.length === 0, `${center}.${where}: сломанная разметка ${broken.join(", ")}`);
    const asM = applyGender(value, { self: "м", other: "м" });
    check(!asM.includes("{"), `${center}.${where}: осталась нераскрытая скобка`);
  }
}

// --- Триады Генных ключей ----------------------------------------------------

// Для платного продукта пробелы недопустимы: человек заплатил и открыл разбор,
// а у партнёра в ключевых воротах пусто. Поэтому проверяются все 64, а не
// «сколько получилось распознать».
for (let gate = 1; gate <= 64; gate += 1) {
  const t = geneKey(gate);
  check(Boolean(t), `нет триады для ворот ${gate}`);
  if (!t) continue;
  for (const [key, value] of Object.entries(t)) {
    check(value.trim().length > 2, `${gate}.${key}: пустое имя`);
    // Имя уровня — одно-два слова. Длинная строка означает, что в данные
    // затесалось предложение из текста главы.
    check(value.trim().length <= 40, `${gate}.${key}: слишком длинное имя «${value}»`);
    // Заглавная не в начале — след капители в оригинале: так «Щедрость»
    // приезжала как «ЩЕдрость».
    check(!/(?<=.)[А-ЯЁ]/.test(value.replace(/\s[А-ЯЁ]/g, " x")), `${gate}.${key}: капитель в «${value}»`);
    check(!/[A-Za-z]/.test(value), `${gate}.${key}: латиница в «${value}»`);
  }
}

// --- Тексты каналов в паре ---------------------------------------------------

// Канал без текста оставит в платном разборе дырку ровно там, где человек ждёт
// объяснения, почему его тянет. Поэтому проверяются все 36, а не только те,
// что выпали у тестовой пары.
for (const ch of CHANNELS) {
  const t = channelPair(ch.key);
  check(Boolean(t), `нет парного текста для канала ${ch.key} «${ch.name}»`);
  if (!t) continue;
  for (const [key, value] of Object.entries(t)) {
    check(value.trim().length > 60, `${ch.key}.${key}: слишком коротко`);
    const broken = findUnexpanded(value);
    check(broken.length === 0, `${ch.key}.${key}: сломанная разметка ${broken.join(", ")}`);
    check(!applyGender(value, { self: "м", other: "м" }).includes("{"), `${ch.key}.${key}: нераскрытая скобка`);
  }
}
// Обратная проверка: лишний ключ означает опечатку в номере канала, и текст
// молча не покажется никогда.
for (const key of Object.keys(CHANNEL_PAIR)) {
  check(CHANNELS.some((c) => c.key === key), `канала ${key} не существует — опечатка в ключе`);
}

console.log("\n=== Каналы тестовой пары: почему тянет ===");
for (const h of rankHighlights(pro).filter((x) => x.kind === "bridge" || x.kind === "closedHanging").slice(0, 3)) {
  const t = channelPair(h.channelKey!)!;
  const ch = CHANNELS.find((c) => c.key === h.channelKey)!;
  console.log(`\n--- ${ch.name} (${ch.key})${h.kind === "bridge" ? " · мост" : ""} ---`);
  console.log(g(t.appears));
  console.log(`\nПочему тянет: ${g(t.pull)}`);
  console.log(`\nОбратная сторона: ${g(t.shadow)}`);
  if (h.kind === "bridge") console.log(`\n${BRIDGE_NOTE.light}\n\n${BRIDGE_NOTE.shadow}\n\n${BRIDGE_NOTE.action}`);
}

// Тема без описания в паре оставит в главном блоке разбора пустое место.
for (let gate = 1; gate <= 64; gate += 1) {
  const t = gateInPair(gate);
  check(Boolean(t), `нет парного описания темы для ворот ${gate}`);
  if (!t) continue;
  for (const [key, value] of Object.entries(t)) {
    check(value.trim().length > 30, `${gate}.${key}: слишком коротко`);
    const broken = findUnexpanded(value);
    check(broken.length === 0, `${gate}.${key}: сломанная разметка ${broken.join(", ")}`);
    check(!applyGender(value, { self: "м", other: "м" }).includes("{"), `${gate}.${key}: нераскрытая скобка`);
  }
}
for (const key of Object.keys(GATE_IN_PAIR)) {
  const n = Number(key);
  check(n >= 1 && n <= 64, `ворот ${key} не существует`);
}
for (const [key, value] of Object.entries(TRIAD_FRAME)) {
  check(value.trim().length > 100, `рамка ${key}: слишком коротко`);
}

console.log("\n=== Блок «что не изменится» на общих темах пары ===");
console.log(TRIAD_FRAME.formula);
for (const s of pro.shared.slice(0, 4)) {
  const k = geneKey(s.gate)!;
  const p = gateInPair(s.gate)!;
  console.log(`\n${gateName(s.gate)} — общая тема`);
  console.log(`  В страхе «${k.shadow}»: ${g(p.shadow)}`);
  console.log(`  В силе «${k.gift}»: ${g(p.gift)}`);
  console.log(`  Предел: «${k.siddhi}»`);
}

// --- Обвязка разбора ---------------------------------------------------------

for (const [name, frame] of [
  ["ABSENT_FRAME", ABSENT_FRAME],
  ["OPENING", OPENING],
  ["MAP_FRAME", MAP_FRAME],
] as const) {
  for (const [key, value] of Object.entries(frame)) {
    // Ключи на «Title» — короткие заголовки по замыслу.
    const min = key.endsWith("Title") ? 10 : 80;
    check(typeof value === "string" && value.trim().length > min, `${name}.${key}: пусто или слишком коротко`);
  }
}

// У каждого канала обязана быть фраза про его отсутствие: без неё в блоке
// «чего нет» останется голое название, а это читается как оглавление.
for (const ch of CHANNELS) {
  const t = channelAbsent(ch.key);
  check(Boolean(t), `нет фразы об отсутствии для канала ${ch.key} «${ch.name}»`);
  if (t) check(t.trim().length > 60, `${ch.key}: фраза об отсутствии слишком короткая`);
}
for (const key of Object.keys(CHANNEL_ABSENT)) {
  check(CHANNELS.some((c) => c.key === key), `канала ${key} не существует — опечатка в ключе`);
}

// Каждое из тринадцати тел обязано быть объяснено: строка карты без пояснения
// читается как бухгалтерия.
for (const body of ACTIVATION_BODIES) {
  const m = ACTIVATION_BODY_MEANING[body];
  check(Boolean(m) && m.trim().length > 60, `нет пояснения для тела «${body}»`);
}
check(
  Object.keys(ACTIVATION_BODY_MEANING).length === ACTIVATION_BODIES.length,
  `пояснений ${Object.keys(ACTIVATION_BODY_MEANING).length}, а тел ${ACTIVATION_BODIES.length}`
);

check(CLOSING.questions.length === 8, `вопросов ${CLOSING.questions.length}, ожидалось 8`);
for (const q of CLOSING.questions) {
  check(q.trim().endsWith("?"), `вопрос без знака вопроса: «${q}»`);
  // От первого лица — иначе это советы, а не чек-лист. Границы слова заданы
  // явно: `\b` в JavaScript про ASCII и с кириллицей не срабатывает вовсе.
  check(
    /(?<![а-яё])(я|мо[ейюия]|мен[яе]|себ[яе])(?![а-яё])/i.test(q),
    `вопрос не от первого лица: «${q}»`
  );
}
check(CLOSING.disclaimer.length > 200, "дисклеймер слишком короткий для финальной мысли");
check(findUnexpanded(CLOSING.warmth).length === 0, "warmth: сломанная разметка");

// Ярлык пары обязан быть у всех 36 каналов: главный канал может оказаться
// любым, и пара без имени выглядит как сбой.
for (const ch of CHANNELS) {
  const l = pairLabel(ch.key);
  check(Boolean(l), `нет ярлыка пары для канала ${ch.key} «${ch.name}»`);
  if (l) check(l.trim().length >= 15 && l.trim().length <= 80, `${ch.key}: ярлык вне разумной длины`);
}
for (const key of Object.keys(PAIR_LABEL)) {
  check(CHANNELS.some((c) => c.key === key), `ярлык для несуществующего канала ${key}`);
}

console.log("\n=== Финал разбора ===");
console.log(`${CLOSING.questionsTitle}:`);
CLOSING.questions.forEach((q, i) => console.log(`  ${i + 1}. ${q}`));
console.log(`\n${CLOSING.disclaimer}`);

console.log(
  failures === 0
    ? "\nВсе проверки согласованности пройдены."
    : `\nПРОВАЛОВ: ${failures}`
);
process.exit(failures === 0 ? 0 : 1);
