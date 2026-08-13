/**
 * Числовая сверка нашей раскладки бодиграфа с эталоном.
 *
 * Эталон — нормализованные координаты (0..1) из разметки Maia Mechanics
 * Imaging / открытого SVG bodygraph-blank проекта hdkit. Сверяем не на глаз:
 * позиции всех 64 ворот, вершины девяти центров, длины и углы всех 36 каналов.
 *
 * Запуск: npx tsx scripts/verify-bodygraph.ts
 * Эталонные данные лежат в scripts/bodygraph-reference.json.
 */

import { readFileSync, existsSync } from "node:fs";
import { GATE_POS, CENTER_SHAPES, VIEWBOX, channelHalves } from "../src/lib/data/human_design/bodygraph-layout";
import { CHANNELS, type CenterKey } from "../src/lib/engines/human-design-tables";

const REF_PATH = "scripts/bodygraph-reference.json";

interface Reference {
  /** Что принято за 0 и 1 по каждой оси. */
  note?: string;
  gates: Record<string, [number, number]>;
  centers: Record<string, [number, number][]>;
  nodes?: Record<string, [number, number]>;
  channels?: Record<string, { len: number; angles: number[] }>;
}

/** Допуск в долях габарита карты. 0.015 ≈ 6px при ширине 410. */
const TOL_POS = 0.015;
/** Допуск по углу канала, градусы. */
const TOL_ANGLE = 4;
/** Допуск по длине канала, доли габарита. */
const TOL_LEN = 0.02;

if (!existsSync(REF_PATH)) {
  console.error(`Нет файла эталона: ${REF_PATH}`);
  console.error("Положи туда JSON с блоками gates / centers / nodes / channels.");
  process.exit(1);
}

const ref: Reference = JSON.parse(readFileSync(REF_PATH, "utf8"));

/** Габариты нашей карты по фактическому содержимому, а не по viewBox. */
function contentBox() {
  const xs: number[] = [];
  const ys: number[] = [];
  for (const shape of Object.values(CENTER_SHAPES)) {
    if (shape.polygon) {
      for (const p of shape.polygon.split(" ")) {
        const [x, y] = p.split(",").map(Number);
        xs.push(x);
        ys.push(y);
      }
    } else if (shape.rect) {
      xs.push(shape.rect.x, shape.rect.x + shape.rect.width);
      ys.push(shape.rect.y, shape.rect.y + shape.rect.height);
    }
  }
  return { x0: Math.min(...xs), x1: Math.max(...xs), y0: Math.min(...ys), y1: Math.max(...ys) };
}

const box = contentBox();
const nx = (x: number) => (x - box.x0) / (box.x1 - box.x0);
const ny = (y: number) => (y - box.y0) / (box.y1 - box.y0);

let problems = 0;
const report = (msg: string) => {
  console.log(msg);
  problems++;
};

console.log("=== Пропорция карты ===");
const ratio = (box.x1 - box.x0) / (box.y1 - box.y0);
console.log(`наша ${ratio.toFixed(3)} · эталон 0.60–0.65 ${ratio >= 0.58 && ratio <= 0.67 ? "✓" : "✗"}`);
if (ratio < 0.58 || ratio > 0.67) problems++;

console.log("\n=== Ворота (отклонение в долях габарита) ===");
const deviations: { gate: number; d: number }[] = [];
for (let g = 1; g <= 64; g++) {
  const our = GATE_POS[g];
  const theirs = ref.gates[String(g)];
  if (!our) { report(`ворота ${g}: НЕТ У НАС`); continue; }
  if (!theirs) { console.log(`ворота ${g}: нет в эталоне — пропуск`); continue; }
  const d = Math.hypot(nx(our[0]) - theirs[0], ny(our[1]) - theirs[1]);
  deviations.push({ gate: g, d });
  if (d > TOL_POS) report(`ворота ${g}: отклонение ${d.toFixed(3)} (допуск ${TOL_POS})`);
}
if (deviations.length) {
  const sorted = [...deviations].sort((a, b) => b.d - a.d);
  const avg = deviations.reduce((s, x) => s + x.d, 0) / deviations.length;
  console.log(`среднее отклонение ${avg.toFixed(4)}, худшие: ${sorted.slice(0, 5).map((x) => `${x.gate}=${x.d.toFixed(3)}`).join(" ")}`);
}

console.log("\n=== Центры (вершины) ===");
for (const key of Object.keys(CENTER_SHAPES) as CenterKey[]) {
  const theirs = ref.centers[key];
  if (!theirs) { console.log(`${key}: нет в эталоне — пропуск`); continue; }
  const shape = CENTER_SHAPES[key];
  let ours: [number, number][];
  if (shape.polygon) {
    ours = shape.polygon.split(" ").map((p) => p.split(",").map(Number) as [number, number]);
  } else {
    const r = shape.rect!;
    ours = [[r.x, r.y], [r.x + r.width, r.y], [r.x + r.width, r.y + r.height], [r.x, r.y + r.height]];
  }
  if (ours.length !== theirs.length) {
    report(`${key}: разное число вершин — у нас ${ours.length}, в эталоне ${theirs.length}`);
    continue;
  }
  // Вершины могут быть перечислены с другого угла — ищем лучший сдвиг.
  let best = Infinity;
  for (let shift = 0; shift < ours.length; shift++) {
    let worst = 0;
    for (let i = 0; i < ours.length; i++) {
      const o = ours[(i + shift) % ours.length];
      const t = theirs[i];
      worst = Math.max(worst, Math.hypot(nx(o[0]) - t[0], ny(o[1]) - t[1]));
    }
    best = Math.min(best, worst);
  }
  if (best > TOL_POS) report(`${key}: макс. отклонение вершины ${best.toFixed(3)}`);
  else console.log(`${key}: ✓ (${best.toFixed(3)})`);
}

if (ref.channels) {
  console.log("\n=== Каналы: длины и углы ===");
  for (const ch of CHANNELS) {
    const theirs = ref.channels[ch.key];
    if (!theirs) continue;
    const [g1, g2] = ch.gates;
    const { first, second } = channelHalves(ch.key, g1, g2);
    const pts = [...first, ...second.slice(1)];
    let len = 0;
    for (let i = 0; i < pts.length - 1; i++) {
      len += Math.hypot(nx(pts[i + 1][0]) - nx(pts[i][0]), ny(pts[i + 1][1]) - ny(pts[i][1]));
    }
    if (Math.abs(len - theirs.len) > TOL_LEN) {
      report(`канал ${ch.key}: длина ${len.toFixed(3)} против ${theirs.len.toFixed(3)}`);
    }
    const ourAngles = [first, second].map((half) => {
      const a = half[0];
      const b = half[half.length - 1];
      return (Math.atan2(ny(b[1]) - ny(a[1]), nx(b[0]) - nx(a[0])) * 180) / Math.PI;
    });
    for (let i = 0; i < Math.min(ourAngles.length, theirs.angles.length); i++) {
      let diff = Math.abs(ourAngles[i] - theirs.angles[i]) % 360;
      if (diff > 180) diff = 360 - diff;
      // Половина могла быть записана в обратном направлении.
      const flipped = Math.abs(180 - diff);
      if (Math.min(diff, flipped) > TOL_ANGLE) {
        report(`канал ${ch.key}, половина ${i + 1}: угол ${ourAngles[i].toFixed(1)}° против ${theirs.angles[i].toFixed(1)}°`);
      }
    }
  }
}

console.log(`\n=== Итог: ${problems === 0 ? "расхождений нет" : `расхождений — ${problems}`} ===`);
console.log(`viewBox ${VIEWBOX.width}×${VIEWBOX.height}, контент ${(box.x1 - box.x0).toFixed(0)}×${(box.y1 - box.y0).toFixed(0)}`);
process.exit(problems === 0 ? 0 : 1);
