import { calcJyotishCompatibility, calcMoonPosition } from "../src/lib/engines/jyotish";
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

console.log("A moon:", calcMoonPosition(partnerA));
console.log("B moon:", calcMoonPosition(partnerB));

const report = calcJyotishCompatibility(partnerA, partnerB);
console.log("\nScore:", report.score);
console.log("Guna Milan:", JSON.stringify(report.rawFeatures.gunaMilan, null, 2));
console.log("Doshas:", report.rawFeatures.doshas);
