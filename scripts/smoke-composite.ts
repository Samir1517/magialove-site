import { calcHumanDesignCompatibility } from "../src/lib/engines/human_design";
import type { Person } from "../src/lib/engines/types";

const a: Person = { sex: "ж", birthDate: "1990-05-14", birthTime: "08:30", birthTimeKnown: true, birthPlace: { city: "Москва", tz: "Europe/Moscow" } };
const b: Person = { sex: "м", birthDate: "1988-11-02", birthTime: "19:15", birthTimeKnown: true, birthPlace: { city: "Санкт-Петербург", tz: "Europe/Moscow" } };

const r = calcHumanDesignCompatibility(a, b);
const f = r.rawFeatures;
console.log("score:", r.score);
console.log("A:", f.a.type, "|", f.a.authority, "|", f.a.profile);
console.log("B:", f.b.type, "|", f.b.authority, "|", f.b.profile);
console.log("Connection Theme:", f.connectionTheme.key, "(defined+open =", f.connectionTheme.defined + f.connectionTheme.open, ")");
console.log("defined centers:", f.composite.definedCenters.join(", "));
console.log("open centers:", f.composite.openCenters.join(", ") || "(none)");
console.log("composite channels:", f.composite.channels.length);
const bySource: Record<string, number> = {};
for (const c of f.composite.channels) bySource[c.source] = (bySource[c.source] ?? 0) + 1;
console.log("by source:", bySource);
