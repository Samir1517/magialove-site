import { calcNavagraha } from "../src/lib/engines/jyotish";
import { findAspects } from "../src/components/viz/Biwheel";
import type { Person } from "../src/lib/engines/types";

const a: Person = { sex: "ж", birthDate: "1990-05-14", birthTime: "08:30", birthTimeKnown: true, birthPlace: { city: "Москва", tz: "Europe/Moscow" } };
const b: Person = { sex: "м", birthDate: "1988-11-02", birthTime: "19:15", birthTimeKnown: true, birthPlace: { city: "СПб", tz: "Europe/Moscow" } };

const ga = calcNavagraha(a);
const gb = calcNavagraha(b);
console.log("--- A ---");
for (const g of ga) console.log(`${g.symbol} ${g.name.padEnd(24)} ${g.rashiName.padEnd(10)} ${g.degreeInRashi.toFixed(2)}°  (lon ${g.siderealLon.toFixed(2)})`);
console.log("--- B ---");
for (const g of gb) console.log(`${g.symbol} ${g.name.padEnd(24)} ${g.rashiName.padEnd(10)} ${g.degreeInRashi.toFixed(2)}°`);

// Раху и Кету должны быть строго напротив (180°)
const rahu = ga.find(g => g.key === "rahu")!, ketu = ga.find(g => g.key === "ketu")!;
let d = Math.abs(rahu.siderealLon - ketu.siderealLon) % 360; if (d > 180) d = 360 - d;
console.log("\nRahu-Ketu opposition check (expect 180):", d.toFixed(4));

const asp = findAspects(ga, gb);
console.log("\naspects found:", asp.length);
for (const x of asp.slice(0, 8)) console.log(`  ${x.a.symbol} ${x.def.name} ${x.b.symbol}  орб ${x.exactness.toFixed(2)}°`);
console.log("\nany NaN:", [...ga, ...gb].some(g => Number.isNaN(g.siderealLon)));
