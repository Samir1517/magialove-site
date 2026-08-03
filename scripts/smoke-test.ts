/**
 * Быстрая проверка движков на образце из kalkulator/service/samples/sample_pair_input.json.
 * Запуск: npx tsx scripts/smoke-test.ts
 */
import { calcMatrixCompatibility, getArcanumInfo } from "../src/lib/engines/matrix";
import { calcNumerologyCompatibility, getLifePathInfo } from "../src/lib/engines/numerology";
import type { Person } from "../src/lib/engines/types";

const partnerA: Person = {
  fullName: "Иван Петров",
  sex: "м",
  birthDate: "1990-08-17",
  birthTime: "14:30",
  birthTimeKnown: true,
  birthPlace: { city: "Москва", country: "Россия", lat: 55.7558, lon: 37.6173, tz: "Europe/Moscow" },
};

const partnerB: Person = {
  fullName: "Анна Смирнова",
  sex: "ж",
  birthDate: "1992-03-05",
  birthTime: "08:15",
  birthTimeKnown: true,
  birthPlace: { city: "Санкт-Петербург", country: "Россия", lat: 59.9311, lon: 30.3609, tz: "Europe/Moscow" },
};

console.log("=== МАТРИЦА СУДЬБЫ ===");
const matrixReport = calcMatrixCompatibility(partnerA, partnerB);
console.log("score:", matrixReport.score);
console.log("A matrix:", matrixReport.rawFeatures.aMatrix);
console.log("B matrix:", matrixReport.rawFeatures.bMatrix);
console.log("Pair matrix:", matrixReport.rawFeatures.pairMatrix);
console.log("Zones (arcana numbers):", matrixReport.rawFeatures.pairArcana);
for (const [zone, num] of Object.entries(matrixReport.rawFeatures.pairArcana)) {
  const info = getArcanumInfo(num as number);
  console.log(`  ${zone}: Аркан ${info.number} «${info.name}» — ${info.theme}`);
}
console.log(
  "Chakras:",
  matrixReport.rawFeatures.chakraBalance.map((c) => `${c.name}=${c.arcanum}`).join(", ")
);

console.log("\n=== НУМЕРОЛОГИЯ ===");
const numReport = calcNumerologyCompatibility(partnerA, partnerB);
console.log("score:", numReport.score);
console.log("A life path:", numReport.rawFeatures.aLifePath, getLifePathInfo(numReport.rawFeatures.aLifePath).name);
console.log("B life path:", numReport.rawFeatures.bLifePath, getLifePathInfo(numReport.rawFeatures.bLifePath).name);
console.log("Pair key:", numReport.rawFeatures.pairKey, "dyn:", numReport.rawFeatures.pairDynamic);
console.log("A psychomatrix:", numReport.rawFeatures.aPsychomatrix);
console.log("B psychomatrix:", numReport.rawFeatures.bPsychomatrix);
console.log("Line diffs:", numReport.rawFeatures.lineDiffs);
console.log("Line scores:", numReport.rawFeatures.lineScores);
