import { calcMatrixCompatibility } from "../src/lib/engines/matrix";
import { calcNumerologyCompatibility } from "../src/lib/engines/numerology";
import { calcHumanDesignCompatibility } from "../src/lib/engines/human_design";
import { calcJyotishCompatibility } from "../src/lib/engines/jyotish";
import { calcWeightedScore, calcCrossSystemThemes, getVerdict } from "../src/lib/engines/synthesis";
import type { Person } from "../src/lib/engines/types";

const a: Person = { sex: "ж", birthDate: "1990-05-14", birthTime: "08:30", birthTimeKnown: true, birthPlace: { city: "Москва", tz: "Europe/Moscow" } };
const b: Person = { sex: "м", birthDate: "1988-11-02", birthTime: "19:15", birthTimeKnown: true, birthPlace: { city: "СПб", tz: "Europe/Moscow" } };

const matrix = calcMatrixCompatibility(a, b);
const numerology = calcNumerologyCompatibility(a, b);
const hd = calcHumanDesignCompatibility(a, b);
const jyotish = calcJyotishCompatibility(a, b);

console.log("individual scores:", { matrix: matrix.score, numerology: numerology.score, hd: hd.score, jyotish: jyotish.score });

const full = calcWeightedScore({ matrix: matrix.score, numerology: numerology.score, human_design: hd.score, jyotish: jyotish.score });
console.log("weighted (full, default profile):", full);
console.log("verdict:", getVerdict(full));

const noTimes = calcWeightedScore({ matrix: matrix.score, numerology: numerology.score, human_design: null, jyotish: null });
console.log("weighted (no_birth_time):", noTimes);

const themes = calcCrossSystemThemes(matrix, numerology, hd, jyotish)!;
for (const t of themes) {
  console.log(`\n${t.title} [${t.verdict}] avg=${t.avg} range=${t.range}`);
  console.log("  signals:", JSON.stringify(t.signals));
}

const themesNoHD = calcCrossSystemThemes(matrix, numerology, null, jyotish);
console.log("\nthemes with HD missing (should be null):", themesNoHD);
