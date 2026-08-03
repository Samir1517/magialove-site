import { calcNameNumbers, calcNameCompatibility } from "../src/lib/engines/name-numerology";

for (const name of ["Анна", "Пётр", "Александр", "Мария"]) {
  console.log(name, "->", calcNameNumbers(name));
}

console.log("\npair:", calcNameCompatibility("Анна", "Пётр"));

// sanity: known letter values
const letters = ["а","б","в","г","д","е","ё","ж","з","и","й","к","л","м","н","о","п","р","с","т","у","ф","х","ц","ч","ш","щ","ъ","ы","ь","э","ю","я"];
console.log("\nAlphabet length:", letters.length, "(expect 33)");
