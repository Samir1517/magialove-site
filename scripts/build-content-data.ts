/**
 * Разбирает 69 написанных ранее markdown-статей из
 * kalkulator/service/systems/<система>/content/<категория>/ в структурированный JSON
 * и кладёт в site/src/lib/content-data — оттуда компоненты и SEO-страницы
 * импортируют их напрямую (статический экспорт не умеет читать fs в рантайме).
 *
 * Запуск: npx tsx scripts/build-content-data.ts
 * Перезапускать при правке исходных .md — сгенерированный JSON не редактируется руками.
 *
 * Формат исходных статей (все 69 файлов следуют одному шаблону):
 *   # Заголовок
 *   > **URL:** ...
 *   > **Источники/Первоисточник/...:** ...
 *   ---
 *   ## Капсула-ответ
 *   текст
 *   ## 1. Заголовок секции
 *   текст (может включать ### подзаголовки, - списки, **жирный**)
 *   ...
 *   *Дисклеймер: ...*
 */

import { readFileSync, writeFileSync, mkdirSync, readdirSync } from "node:fs";
import { join } from "node:path";

const SERVICE_ROOT = join(__dirname, "..", "..", "kalkulator", "service", "systems");
const OUT_DIR = join(__dirname, "..", "src", "lib", "content-data");

interface ParsedArticle {
  title: string;
  meta: string[];
  capsule: string;
  sections: { heading: string; body: string }[];
  disclaimer: string;
}

function parseArticle(raw: string): ParsedArticle {
  const lines = raw.replace(/\r\n/g, "\n").split("\n");
  let i = 0;

  while (i < lines.length && !lines[i].startsWith("# ")) i++;
  const title = lines[i].replace(/^# /, "").trim();
  i++;

  const meta: string[] = [];
  while (i < lines.length) {
    const line = lines[i];
    if (line.startsWith("> ")) {
      meta.push(line.slice(2).trim());
      i++;
    } else if (line.trim() === "" || line.trim() === "---") {
      i++;
      if (lines[i - 1]?.trim() === "---") break;
    } else {
      break;
    }
  }

  const bodyText = lines.slice(i).join("\n");
  // Большинство статей: "*Дисклеймер: текст*". Арканы 1 и 16 (флагманские, расширенные
  // при ревизии) используют вариант "*Дисклеймер (сквозной для всех арканов сайта): текст*" —
  // поэтому после "Дисклеймер" до двоеточия допускаем произвольный текст в скобках.
  const disclaimerMatch = bodyText.match(/\*Дисклеймер[^:]*:[\s\S]*?\*\s*$/);
  const disclaimer = disclaimerMatch
    ? disclaimerMatch[0].trim().replace(/^\*/, "").replace(/\*$/, "").trim()
    : "";
  const withoutDisclaimer = disclaimerMatch
    ? bodyText.slice(0, disclaimerMatch.index).trim()
    : bodyText.trim();

  const rawSections = withoutDisclaimer.split(/\n(?=## )/g).filter(Boolean);
  let capsule = "";
  const sections: { heading: string; body: string }[] = [];

  for (const block of rawSections) {
    const headingMatch = block.match(/^## (.+)\n?/);
    if (!headingMatch) continue;
    const heading = headingMatch[1].trim();
    const body = block.slice(headingMatch[0].length).trim();
    // Арканы 1 и 16 используют "Капсула-ответ (для сниппета / нейроответа)" —
    // startsWith вместо точного равенства покрывает оба варианта.
    if (heading.startsWith("Капсула-ответ")) {
      capsule = body;
    } else {
      sections.push({ heading, body });
    }
  }

  return { title, meta, capsule, sections, disclaimer };
}

function loadDir(relDir: string): Record<string, ParsedArticle & { file: string }> {
  const dir = join(SERVICE_ROOT, relDir);
  const out: Record<string, ParsedArticle & { file: string }> = {};
  for (const file of readdirSync(dir)) {
    if (!file.endsWith(".md")) continue;
    const raw = readFileSync(join(dir, file), "utf-8");
    const parsed = parseArticle(raw);
    const slug = file.replace(/\.md$/, "");
    out[slug] = { ...parsed, file: slug };
  }
  return out;
}

mkdirSync(OUT_DIR, { recursive: true });

function write(name: string, data: unknown) {
  writeFileSync(join(OUT_DIR, `${name}.json`), JSON.stringify(data, null, 2) + "\n", "utf-8");
  console.log(`wrote ${name}.json`);
}

// --- Матрица: арканы (ключ — номер аркана без ведущего нуля) -------------
const arcanaRaw = loadDir("matrix/content/arkany");
const arcana: Record<string, ParsedArticle> = {};
for (const slug of Object.keys(arcanaRaw)) {
  const n = String(parseInt(slug, 10));
  arcana[n] = arcanaRaw[slug];
}
write("matrix-arcana", arcana);

// --- Нумерология: число жизненного пути (ключ — число) -------------------
const lifePathRaw = loadDir("numerology/content/chislo-zhiznennogo-puti");
const lifePath: Record<string, ParsedArticle> = {};
for (const slug of Object.keys(lifePathRaw)) {
  const n = String(parseInt(slug, 10));
  lifePath[n] = lifePathRaw[slug];
}
write("numerology-life-path", lifePath);

// --- Нумерология: линии психоматрицы (ключ = имя файла = ключ движка) ----
const psychomatrixRaw = loadDir("numerology/content/psihomatritsa");
const psychomatrix: Record<string, ParsedArticle> = {};
for (const slug of Object.keys(psychomatrixRaw)) psychomatrix[slug] = psychomatrixRaw[slug];
write("numerology-psychomatrix", psychomatrix);

// --- Нумерология: число имени (ключ — число) ------------------------------
const nameNumberRaw = loadDir("numerology/content/chislo-imeni");
const nameNumber: Record<string, ParsedArticle> = {};
for (const slug of Object.keys(nameNumberRaw)) {
  const n = String(parseInt(slug, 10));
  nameNumber[n] = nameNumberRaw[slug];
}
write("numerology-name-number", nameNumber);

// --- Дизайн человека: типы (ключ — русское название типа, как в движке) --
const HD_TYPE_SLUG_TO_ENGINE_KEY: Record<string, string> = {
  generator: "Генератор",
  "manifestiruyushchij-generator": "Манифестирующий генератор",
  manifestor: "Манифестор",
  proektor: "Проектор",
  reflektor: "Рефлектор",
};
const typesRaw = loadDir("human_design/content/tipy");
const types: Record<string, ParsedArticle> = {};
for (const slug of Object.keys(typesRaw)) {
  const key = HD_TYPE_SLUG_TO_ENGINE_KEY[slug];
  if (!key) throw new Error(`Нет соответствия engine-ключа для файла типа: ${slug}`);
  types[key] = typesRaw[slug];
}
write("hd-types", types);

// --- Дизайн человека: авторитеты (ключ — русское название, как в движке) -
const HD_AUTHORITY_SLUG_TO_ENGINE_KEY: Record<string, string> = {
  emocionalnyj: "Эмоциональный",
  sakralnyj: "Сакральный",
  selezenochnyj: "Селезёночный",
  "ego-serdechnyj": "Эго/Сердечный",
  samoproekcionnyj: "Самопроекционный",
  "mentalnyj-vneshnij": "Ментальный/внешний",
  lunnyj: "Лунный",
};
const authRaw = loadDir("human_design/content/avtoritety");
const authorities: Record<string, ParsedArticle> = {};
for (const slug of Object.keys(authRaw)) {
  const key = HD_AUTHORITY_SLUG_TO_ENGINE_KEY[slug];
  if (!key) throw new Error(`Нет соответствия engine-ключа для файла авторитета: ${slug}`);
  authorities[key] = authRaw[slug];
}
write("hd-authorities", authorities);

// --- Дизайн человека: типы связи (ключ = имя файла = ConnectionThemeKey) --
const connRaw = loadDir("human_design/content/svyazi");
const connections: Record<string, ParsedArticle> = {};
for (const slug of Object.keys(connRaw)) connections[slug] = connRaw[slug];
write("hd-connections", connections);

// --- Дизайн человека: каналы (ключ = имя файла = "{gateMin}-{gateMax}") --
const channelRaw = loadDir("human_design/content/kanaly");
const channels: Record<string, ParsedArticle> = {};
for (const slug of Object.keys(channelRaw)) channels[slug] = channelRaw[slug];
write("hd-channels", channels);

// --- Джйотиш: куты (ключ = имя движка, graha-maitri -> graha_maitri) -----
const kutaRaw = loadDir("jyotish/content/8-kut");
const kutas: Record<string, ParsedArticle> = {};
for (const slug of Object.keys(kutaRaw)) {
  const key = slug === "graha-maitri" ? "graha_maitri" : slug;
  kutas[key] = kutaRaw[slug];
}
write("jyotish-kutas", kutas);

// --- Джйотиш: доши (ключ = имя файла = ключ движка) -----------------------
const doshaRaw = loadDir("jyotish/content/doshi");
const doshas: Record<string, ParsedArticle> = {};
for (const slug of Object.keys(doshaRaw)) doshas[slug] = doshaRaw[slug];
write("jyotish-doshas", doshas);

// --- Джйотиш: накшатры (ключ — числовой индекс 1-27) ----------------------
const nakshatraRaw = loadDir("jyotish/content/nakshatry");
const nakshatras: Record<string, ParsedArticle> = {};
for (const slug of Object.keys(nakshatraRaw)) {
  const n = String(parseInt(slug, 10));
  nakshatras[n] = nakshatraRaw[slug];
}
write("jyotish-nakshatras", nakshatras);

const total =
  Object.keys(arcana).length +
  Object.keys(lifePath).length +
  Object.keys(psychomatrix).length +
  Object.keys(nameNumber).length +
  Object.keys(types).length +
  Object.keys(authorities).length +
  Object.keys(connections).length +
  Object.keys(channels).length +
  Object.keys(kutas).length +
  Object.keys(doshas).length +
  Object.keys(nakshatras).length;
console.log(`\nTotal articles parsed: ${total}`);
