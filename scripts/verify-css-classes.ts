/**
 * Проверка: все ли классы, которые компоненты берут из CSS-модулей, там есть.
 *
 * Зачем. CSS-модули в TypeScript типизированы как Record<string, string>, и
 * обращение к несуществующему классу не роняет ни сборку, ни типы — просто
 * возвращает undefined. В разметку уходит class="" , элемент теряет всё
 * оформление, и заметить это можно только глазами на нужной странице.
 *
 * Так и случилось со страницей про расчёт бодиграфа: она использовала .text,
 * .note, .list и .listItem, которых в content.module.css не существовало.
 * Абзацы шли вплотную, зазор между ними был ровно нулевым.
 *
 * Запуск: npx tsx scripts/verify-css-classes.ts
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname, resolve, relative } from "node:path";

const ROOT = resolve(__dirname, "..");
const SRC = join(ROOT, "src");

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

const files = walk(SRC);
const cssClasses = new Map<string, Set<string>>();
for (const f of files.filter((f) => f.endsWith(".module.css"))) {
  const body = readFileSync(f, "utf8");
  const names = new Set(
    [...body.matchAll(/^\.([A-Za-z][A-Za-z0-9_]*)/gm)].map((m) => m[1]),
  );
  cssClasses.set(resolve(f), names);
}

type Problem = { file: string; usage: string; reason: string };
const problems: Problem[] = [];

for (const f of files.filter((f) => f.endsWith(".tsx") || f.endsWith(".ts"))) {
  const body = readFileSync(f, "utf8");
  const imports = [...body.matchAll(/import\s+(\w+)\s+from\s+"([^"]+\.module\.css)"/g)];
  for (const [, alias, spec] of imports) {
    const target = spec.startsWith("@/")
      ? resolve(SRC, spec.slice(2))
      : resolve(dirname(f), spec);
    const available = cssClasses.get(target);
    const where = relative(ROOT, f).replace(/\\/g, "/");
    if (!available) {
      problems.push({ file: where, usage: spec, reason: "модуль не найден" });
      continue;
    }
    // Строки импорта выкидываем: путь вида "content.module.css" сам по себе
    // читается как обращение content.module и давал ложное срабатывание.
    const code = body
      .split("\n")
      .filter((line) => !/^\s*import\s/.test(line))
      .join("\n");
    const used = new Set(
      [...code.matchAll(new RegExp(`\\b${alias}\\.([A-Za-z][A-Za-z0-9_]*)`, "g"))].map(
        (m) => m[1],
      ),
    );
    for (const name of used) {
      if (!available.has(name)) {
        problems.push({ file: where, usage: `${alias}.${name}`, reason: "класса нет в модуле" });
      }
    }
  }
}

if (problems.length === 0) {
  console.log("Все классы из CSS-модулей существуют — расхождений нет.");
} else {
  console.log(`Найдено расхождений: ${problems.length}\n`);
  for (const p of problems) console.log(`${p.file}\n   ${p.usage} — ${p.reason}`);
  process.exitCode = 1;
}
