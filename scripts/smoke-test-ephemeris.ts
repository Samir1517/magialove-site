import { sunLongitude, moonLongitude, planetLongitude, lahiriAyanamsha, toSidereal, findDesignMoment, birthMoment } from "../src/lib/engines/ephemeris";
import type { Person } from "../src/lib/engines/types";

const partnerA: Person = {
  sex: "м",
  birthDate: "1990-08-17",
  birthTime: "14:30",
  birthTimeKnown: true,
  birthPlace: { city: "Москва", lat: 55.7558, lon: 37.6173, tz: "Europe/Moscow" },
};

const utc = birthMoment(partnerA);
console.log("Birth UTC:", utc.toISOString(), "(местное 1990-08-17 14:30 Europe/Moscow, летнее время => UTC-3)");

const sunLon = sunLongitude(utc);
console.log("Sun tropical longitude:", sunLon.toFixed(2), "° (ожидаем ~143-145°, конец Льва)");

const moonLon = moonLongitude(utc);
console.log("Moon tropical longitude:", moonLon.toFixed(2), "°");

console.log("Mars:", planetLongitude("mars", utc).toFixed(2), "°");
console.log("Jupiter:", planetLongitude("jupiter", utc).toFixed(2), "°");

const ayanamsha = lahiriAyanamsha(utc);
console.log("Lahiri ayanamsha at this date:", ayanamsha.toFixed(4), "° (ожидаем ~23.9-24.0° для 1990х)");

const siderealMoon = toSidereal(moonLon, utc);
console.log("Moon sidereal longitude:", siderealMoon.toFixed(2), "°");

const design = findDesignMoment(utc);
const daysBefore = (utc.getTime() - design.getTime()) / (24 * 3600 * 1000);
console.log("Design moment:", design.toISOString(), `(~${daysBefore.toFixed(1)} дней до рождения, ожидаем ~88)`);
const designSun = sunLongitude(design);
console.log("Sun longitude at design moment:", designSun.toFixed(2), "° (должно быть на 88° меньше долготы рождения:", ((sunLon - 88 + 360) % 360).toFixed(2), ")");
