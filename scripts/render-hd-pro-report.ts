/**
 * Сборка профессионального разбора целиком, в порядке чтения.
 *
 * Нужен не для проверок — для вычитки. Пока текст лежит кусками по файлам,
 * невозможно понять, как он читается подряд: где повтор, где обрыв, где
 * человек устанет. Смоук-тест отвечает на вопрос «всё ли на месте», этот
 * скрипт — на вопрос «каково это читать».
 *
 * Запуск: npx tsx scripts/render-hd-pro-report.ts > разбор.txt
 */

import { calcPersonalDesign, ACTIVATION_BODIES } from "../src/lib/engines/human_design";
import { calcHumanDesignPro, rankHighlights } from "../src/lib/engines/human-design-pro";
import { CENTER_NAMES, CHANNELS } from "../src/lib/engines/human-design-tables";
import { channelTheme } from "../src/lib/data/human_design/channel-themes";
import { GATES } from "../src/lib/data/human_design/gates";
import { gateLineNameShort } from "../src/lib/data/human_design/gate-line-names";
import { linePolarity } from "../src/lib/data/human_design/line-polarity";
import { geneKey } from "../src/lib/data/human_design/gene-keys";
import { CONDITIONING_BY_CENTER } from "../src/lib/content/human-design-pro";
import { channelPair, BRIDGE_NOTE } from "../src/lib/content/human-design-channels-pair";
import { gateInPair, TRIAD_FRAME, PERSONALIZED_MARK } from "../src/lib/content/human-design-triads";
import { ABSENT_FRAME } from "../src/lib/content/human-design-absent";
import { OPENING, MAP_FRAME, ACTIVATION_BODY_MEANING, CLOSING } from "../src/lib/content/human-design-report-frame";
import { applyGender } from "../src/lib/content/gender";
import type { Person } from "../src/lib/engines/types";

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
const ranked = rankHighlights(pro);
const ctx = { self: partnerA.sex, other: partnerB.sex };
const g = (s: string) => applyGender(s, ctx);

const p = (...lines: string[]) => console.log(lines.join("\n"));
const h1 = (s: string) => p("", "", "=".repeat(70), s.toUpperCase(), "=".repeat(70));
const h2 = (s: string) => p("", `— ${s} —`);
const gateName = (n: number) => `${n} «${GATES[n]?.name ?? "?"}»`;

/** Согласование числительного: 1 место, 2 места, 5 мест. */
function plural(n: number, one: string, few: string, many: string): string {
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 14) return many;
  const mod10 = n % 10;
  if (mod10 === 1) return one;
  if (mod10 >= 2 && mod10 <= 4) return few;
  return many;
}

// --- 1. Начало ---------------------------------------------------------------
h1("Профессиональный разбор пары");
p("", OPENING.readFreely, "", OPENING.whatThisIs, "", OPENING.howWeCount);

// --- 1a. Главное за минуту ---------------------------------------------------
// Человек заплатил и хочет ответ, а не путешествие на четыреста строк. Выжимка
// даёт его сразу; дальше он читает уже не за ответом, а за подробностями — это
// принципиально более спокойный режим чтения.
h1("Главное за минуту");
const topChannel = ranked.find((x) => x.kind === "bridge" || x.kind === "closedHanging");
const topCond = ranked.find((x) => x.kind === "conditioningBare" || x.kind === "conditioningAnchored");
if (topChannel) {
  const ch = CHANNELS.find((c) => c.key === topChannel.channelKey)!;
  p("", `ЧТО ВАС ДЕРЖИТ. ${channelTheme(ch.key) ?? ch.name} Это место, где каждый достраивает другого: ` +
    `${topChannel.kind === "bridge" ? "и оно же сшивает разрыв в карте — отсюда ощущение целости рядом с ним." : "поодиночке этого нет ни у кого из вас."}`);
}
if (topCond) {
  const t = CONDITIONING_BY_CENTER[topCond.center!];
  p("", `ЧТО ВАС ИЗМАТЫВАЕТ. Сильнее всего вы влияете друг на друга в теме «${t.topic}» — ` +
    `там, где у одного центр открыт, а у второго включён. Это не характер и не вредность: так работает механика.`);
}
p("", `ЧТО НЕ ИЗМЕНИТСЯ. Набор тем у каждого из вас фиксирован с рождения. Общих тем у вас ${pro.shared.length}, ` +
  `и это одновременно то, что вас узнало друг в друге, и то, где вы проседаете одновременно. ` +
  `Меняется не набор, а уровень, на котором каждая тема проживается.`);
p("", `Тем, которых у вас нет вовсе, — ${pro.absent.filter((x) => x.kind === "none").length} из 36. ` +
  `Это норма для любой пары, но именно на них обычно уходят годы «мы просто мало старались».`);

// --- 2. Почему тянет ---------------------------------------------------------
h1("Почему тянет именно к нему");
const channels = ranked.filter((x) => x.kind === "bridge" || x.kind === "closedHanging");
// Градиент глубины. Полный разбор получают только два первых места, дальше —
// карточка в две строки. Первая версия печатала пять одинаковых по структуре
// блоков подряд, и к четвёртому текст начинал пролистываться: та же рамка,
// тот же ритм, только слова другие. У эталонов рынка перепад плотности между
// верхушкой и хвостом достигает полусотни раз, и это не экономия, а забота о
// дочитываемости.
const DEEP = 2;
p("", PERSONALIZED_MARK);
channels.slice(0, DEEP).forEach((item) => {
  const t = channelPair(item.channelKey!)!;
  const ch = CHANNELS.find((c) => c.key === item.channelKey)!;
  h2(`${ch.name} (${ch.key})${item.kind === "bridge" ? " · и это мост" : ""}`);
  p("", g(t.appears), "", `Почему тянет. ${g(t.pull)}`, "", `Обратная сторона. ${g(t.shadow)}`);
  if (item.kind === "bridge") p("", BRIDGE_NOTE.light, "", BRIDGE_NOTE.shadow, "", BRIDGE_NOTE.action);
});

const rest = channels.slice(DEEP);
if (rest.length) {
  h2(`Ещё ${rest.length} ${plural(rest.length, "место", "места", "мест")}, где вы достраиваете друг друга`);
  p("Коротко — по одной строке на каждое. Если что-то зацепит, разверни в карте ниже.", "");
  for (const item of rest) {
    const t = channelPair(item.channelKey!)!;
    const ch = CHANNELS.find((c) => c.key === item.channelKey)!;
    p(`• ${ch.name} (${ch.key}) — ${channelTheme(ch.key) ?? ""}`, `  ${g(t.pull)}`, "");
  }
}

// --- 3. Где вы меняете друг друга --------------------------------------------
h1("Где вы меняете друг друга");
for (const [side, data] of [["a", pro.a], ["b", pro.b]] as const) {
  for (const c of data.conditioning) {
    const t = CONDITIONING_BY_CENTER[c.center];
    const s = side === "a" ? t.you : t.partner;
    h2(`${side === "a" ? "Партнёр влияет на тебя" : "Ты влияешь на партнёра"}: ${t.topic}`);
    // Слово «центр» стоит здесь не для красоты: названия центров разного рода
    // («Селезёнка», «Горло», «Сакральный»), и без него выходило «Селезёнка
    // открыт». С «центром» прилагательное согласуется всегда.
    p(`Центр «${CENTER_NAMES[c.center]}» открыт ${side === "a" ? "у тебя" : "у партнёра"}, ` +
      `а ${side === "a" ? "у партнёра" : "у тебя"} включён воротами ${c.partnerGates.map(gateName).join(", ")}`);
    p("", g(t.organ), "", g(s.scene), "", g(s.light));
    if (c.ownGates.length) {
      // ownGates — ворота того, у кого центр ОТКРЫТ. На стороне партнёра это
      // его ворота, а не твои, и подпись обязана это отражать.
      const whose = side === "a" ? "Твои активации" : "Его активации";
      p("", `${whose} здесь: ${c.ownGates.map(gateName).join(", ")}. ${g(s.anchor)}`);
    }
    p("", `НЕ ИЗМЕНИТСЯ: ${g(s.fixed)}`, `ИЗМЕНИТСЯ: ${g(s.changeable)}`);
  }
}

// --- 4. Что не изменится -----------------------------------------------------
h1("Что в нём не изменится, а что изменится");
p("", TRIAD_FRAME.intro, "", TRIAD_FRAME.formula, "", TRIAD_FRAME.water, "", TRIAD_FRAME.trigger, "", TRIAD_FRAME.caution);
if (pro.shared.length) {
  h2("Темы, которые есть у вас обоих");
  p(TRIAD_FRAME.shared, "", TRIAD_FRAME.sharedHowToRead);
  for (const s of pro.shared) {
    const k = geneKey(s.gate)!;
    const gp = gateInPair(s.gate)!;
    p("", `${gateName(s.gate)}`,
      `  в страхе «${k.shadow}» — ${g(gp.shadow)}`,
      `  в силе «${k.gift}» — ${g(gp.gift)}`,
      `  предел — «${k.siddhi}»`);
  }
}

// --- 5. Чего в паре нет ------------------------------------------------------
h1("Чего в вашей паре нет");
p("", ABSENT_FRAME.intro, "", ABSENT_FRAME.norm, "", ABSENT_FRAME.water);
const none = pro.absent.filter((t) => t.kind === "none");
const half = pro.absent.filter((t) => t.kind === "half");
// Здесь берётся нейтральная тема канала, а НЕ описание того, что канал даёт.
// Первая версия подставляла `channelPair().appears` — и под заголовком
// «замкнуть вдвоём нельзя» выходил восторженный список из тринадцати
// прекрасных вещей, которых у пары никогда не будет. Читать такое после
// оплаты незачем.
h2(ABSENT_FRAME.halfTitle);
p(ABSENT_FRAME.half, "");
for (const t of half) {
  const owner = t.presentGates[0];
  const missing = t.gates.find((x) => !t.presentGates.includes(x))!;
  p(`• ${channelTheme(t.channelKey) ?? t.channelName}`,
    `  Есть ${gateName(owner)}, не хватает ${gateName(missing)} — ни у кого из вас.`);
}
p("", ABSENT_FRAME.halfAction);
h2(ABSENT_FRAME.noneTitle);
p(ABSENT_FRAME.none, "");
for (const t of none) p(`• ${channelTheme(t.channelKey) ?? t.channelName}`);
p("", ABSENT_FRAME.closing);

// --- 6. Карта ----------------------------------------------------------------
h1("Полная карта: 26 активаций каждого");
p("", MAP_FRAME.intro, "", MAP_FRAME.twoMoments, "", MAP_FRAME.personality, "", MAP_FRAME.design, "", MAP_FRAME.polarity);
for (const [label, design] of [["Ты", a], ["Партнёр", b]] as const) {
  h2(label);
  for (const [side, list] of [["Личность", design.personalityGates], ["Дизайн", design.designGates]] as const) {
    p("", `${side}:`);
    list.forEach((x, i) => {
      const body = ACTIVATION_BODIES[i];
      const nm = gateLineNameShort(x.gate, x.line);
      const pol = linePolarity(x.gate, x.line);
      // Полярность обещана в рамке блока, значит обязана быть показана.
      const mark = pol?.ex === body ? "  ← идёт само" : pol?.det === body ? "  ← даётся усилием" : "";
      p(`  ${body} — ворота ${x.gate}.${x.line} «${GATES[x.gate]?.name ?? "?"}»${nm ? `, позиция «${nm}»` : ""}${mark}`);
    });
  }
}
h2("Что означает каждое тело");
for (const body of ACTIVATION_BODIES) p(`  ${body} — ${ACTIVATION_BODY_MEANING[body]}`);

// --- 7. Финал ----------------------------------------------------------------
h1("Что с этим делать");
p("", CLOSING.intro);
// Списки собираются из находок. Первая версия печатала одни подводки, и разбор
// заканчивался тремя пустыми разделами — худшее, чем можно закончить платный
// текст.
h2(CLOSING.needsTitle);
p(CLOSING.needsHint, "");
for (const center of [...a.definedCenters]) {
  p(`• ${CONDITIONING_BY_CENTER[center].topic} — центр «${CENTER_NAMES[center]}» у тебя включён, это твоё собственное и не зависит от него.`);
}

h2(CLOSING.easyTitle);
p(CLOSING.easyHint, "");
for (const item of ranked.filter((x) => x.kind === "bridge" || x.kind === "closedHanging").slice(0, 4)) {
  const ch = CHANNELS.find((c) => c.key === item.channelKey)!;
  p(`• ${channelTheme(ch.key) ?? ch.name}`);
}
for (const s of pro.shared.slice(0, 3)) {
  p(`• ${gateName(s.gate)} — общая тема: понимаете друг друга здесь без слов.`);
}

h2(CLOSING.avoidTitle);
p(CLOSING.avoidHint, "");
for (const [side, data] of [["a", pro.a], ["b", pro.b]] as const) {
  for (const c of data.conditioning.filter((x) => x.ownGates.length === 0)) {
    const t = CONDITIONING_BY_CENTER[c.center];
    p(`• Решать вопросы про «${t.topic}» на усталости и в спешке: ` +
      `${side === "a" ? "здесь ты" : "здесь партнёр"} принимает чужое за своё сильнее всего.`);
  }
}
h2(CLOSING.questionsTitle);
p(CLOSING.questionsHint, "");
CLOSING.questions.forEach((q, i) => p(`  ${i + 1}. ${q}`));
p("", "", CLOSING.disclaimer);
