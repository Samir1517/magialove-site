/**
 * Итоговая сборка: прогон всех 4 движков на kalkulator/service/samples/sample_pair_input.json,
 * вывод в форме, близкой к core/schemas/pair_report.schema.json.
 */
import { calcMatrixCompatibility } from "../src/lib/engines/matrix";
import { calcNumerologyCompatibility } from "../src/lib/engines/numerology";
import { calcHumanDesignCompatibility } from "../src/lib/engines/human_design";
import { calcJyotishCompatibility } from "../src/lib/engines/jyotish";
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

const matrix = calcMatrixCompatibility(partnerA, partnerB);
const numerology = calcNumerologyCompatibility(partnerA, partnerB);
const humanDesign = calcHumanDesignCompatibility(partnerA, partnerB);
const jyotish = calcJyotishCompatibility(partnerA, partnerB);

const report = {
  meta: {
    generated_at: "2026-08-03",
    context: "текущие_отношения",
    inputs_known: { time: true, place: true },
  },
  systems: {
    matrix: { score: matrix.score, raw_features: matrix.rawFeatures },
    numerology: { score: numerology.score, raw_features: numerology.rawFeatures },
    human_design: { score: humanDesign.score, raw_features: humanDesign.rawFeatures },
    jyotish: { score: jyotish.score, raw_features: jyotish.rawFeatures },
  },
  synthesis: {
    sis_score:
      Math.round(
        ((matrix.score + numerology.score + humanDesign.score + jyotish.score) / 4) * 10
      ) / 10,
  },
};

console.log(JSON.stringify(report, (key, value) => (value instanceof Set ? [...value] : value), 2));

console.log("\n=== СВОДКА БАЛЛОВ ===");
console.log("Матрица судьбы:", matrix.score);
console.log("Нумерология:", numerology.score);
console.log("Дизайн человека:", humanDesign.score);
console.log("Джйотиш:", jyotish.score);
console.log("Средний (простое среднее, без весов из weights.json):", report.synthesis.sis_score);
