import { calcPersonalDesign, calcHumanDesignCompatibility } from "../src/lib/engines/human_design";
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

console.log("=== Partner A design ===");
const aDesign = calcPersonalDesign(partnerA);
console.log("Type:", aDesign.type);
console.log("Authority:", aDesign.authority);
console.log("Profile:", aDesign.profile);
console.log("Defined centers:", [...aDesign.definedCenters]);
console.log("Defined channels:", aDesign.definedChannels);
console.log("Personality gates:", aDesign.personalityGates);
console.log("Design gates:", aDesign.designGates);

console.log("\n=== Partner B design ===");
const bDesign = calcPersonalDesign(partnerB);
console.log("Type:", bDesign.type);
console.log("Authority:", bDesign.authority);
console.log("Profile:", bDesign.profile);
console.log("Defined centers:", [...bDesign.definedCenters]);
console.log("Defined channels:", bDesign.definedChannels);

console.log("\n=== Compatibility ===");
const report = calcHumanDesignCompatibility(partnerA, partnerB);
console.log("Score:", report.score);
console.log("Connections:", report.rawFeatures.connections);
