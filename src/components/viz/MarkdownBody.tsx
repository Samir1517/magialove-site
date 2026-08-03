import { Fragment } from "react";

/**
 * Минимальный рендерер для тела секций наших статей — не общий markdown-парсер,
 * а разбор ровно того подмножества, которое реально встречается в 69 файлах
 * (проверено `grep` перед написанием): абзацы, "### " подзаголовки, плоские
 * списки "- ", инлайновый **жирный**. Без dangerouslySetInnerHTML: контент наш
 * собственный, но React-элементы проще поддерживать и безопаснее по умолчанию.
 */

/** Инлайновый **жирный** без блочной разметки — для однострочных капсул-тизеров. */
export function renderInline(text: string, keyPrefix: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g).filter(Boolean);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={`${keyPrefix}-${i}`}>{part.slice(2, -2)}</strong>;
    }
    return <Fragment key={`${keyPrefix}-${i}`}>{part}</Fragment>;
  });
}

type Block =
  | { type: "h4"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "p"; text: string };

function toBlocks(body: string): Block[] {
  const lines = body.split("\n");
  const blocks: Block[] = [];
  let para: string[] = [];
  let list: string[] = [];

  function flushPara() {
    if (para.length) {
      blocks.push({ type: "p", text: para.join(" ").trim() });
      para = [];
    }
  }
  function flushList() {
    if (list.length) {
      blocks.push({ type: "ul", items: list });
      list = [];
    }
  }

  for (const raw of lines) {
    const line = raw.trim();
    if (line === "") {
      flushPara();
      flushList();
    } else if (line.startsWith("### ")) {
      flushPara();
      flushList();
      blocks.push({ type: "h4", text: line.slice(4).trim() });
    } else if (line.startsWith("- ")) {
      flushPara();
      list.push(line.slice(2).trim());
    } else {
      flushList();
      para.push(line);
    }
  }
  flushPara();
  flushList();
  return blocks;
}

export function MarkdownBody({ body }: { body: string }) {
  const blocks = toBlocks(body);
  return (
    <>
      {blocks.map((block, i) => {
        const key = `b${i}`;
        if (block.type === "h4") {
          return (
            <h4 key={key} style={{ font: "600 13px var(--font-body)", color: "var(--ink)", margin: "12px 0 4px" }}>
              {renderInline(block.text, key)}
            </h4>
          );
        }
        if (block.type === "ul") {
          return (
            <ul key={key} style={{ margin: "0 0 10px", paddingLeft: 20, display: "flex", flexDirection: "column", gap: 5 }}>
              {block.items.map((item, j) => (
                <li key={`${key}-${j}`} style={{ font: "400 13px/1.65 var(--font-body)", color: "var(--ink-soft)" }}>
                  {renderInline(item, `${key}-${j}`)}
                </li>
              ))}
            </ul>
          );
        }
        return (
          <p key={key} style={{ font: "400 13px/1.7 var(--font-body)", color: "var(--ink-soft)", margin: "0 0 10px" }}>
            {renderInline(block.text, key)}
          </p>
        );
      })}
    </>
  );
}
