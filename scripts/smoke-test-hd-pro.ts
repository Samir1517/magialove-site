/**
 * Прогон расширенного расчёта по Дизайну человека на живых датах.
 *
 * Проверяет не только «не падает», но и внутреннюю согласованность:
 * подвешенные ворота не должны пересекаться с определёнными каналами,
 * сумма центров по группам определения должна сходиться с числом
 * определённых центров, а мосты обязаны соединять разные группы.
 */

import { calcPersonalDesign, ALL_CENTERS } from "../src/lib/engines/human_design";
import { calcHumanDesignPro, calcDefinition } from "../src/lib/engines/human-design-pro";
import { CENTER_NAMES, CHANNELS } from "../src/lib/engines/human-design-tables";
import { GATES } from "../src/lib/data/human_design/gates";
import type { Person } from "../src/lib/engines/types";

const partnerA: Person = {
  sex: "м",
  birthDate: "1990-08-17",
  birthTime: "14:30",
  birthTimeKnown: true,
  birthPlace: { city: "Москва", lat: 55.7558, lon: 37.6173, tz: "Europe/Moscow" },
};

const partnerB: Person = {
  sex: "ж",
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

console.log(
  failures === 0
    ? "\nВсе проверки согласованности пройдены."
    : `\nПРОВАЛОВ: ${failures}`
);
process.exit(failures === 0 ? 0 : 1);
