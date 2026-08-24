import { Fragment } from "react";
import Link from "next/link";

/**
 * Минимальный рендерер для тела секций наших статей — не общий markdown-парсер,
 * а разбор ровно того подмножества, которое реально встречается в 69 файлах
 * (проверено `grep` перед написанием): абзацы, "### " подзаголовки, плоские
 * списки "- ", инлайновый **жирный** и ссылки [текст](/адрес).
 * Без dangerouslySetInnerHTML: контент наш собственный, но React-элементы проще
 * поддерживать и безопаснее по умолчанию.
 *
 * Уровень подзаголовка задаётся снаружи: одна и та же статья рендерится и как
 * самостоятельная SEO-страница (секция = h2, значит подзаголовок = h3), и внутри
 * раскрывашки на странице результата (секция = h4, значит подзаголовок = h5).
 * Прибитый гвоздями h4 давал на страницах арканов дыру в иерархии h2 → h4.
 */

/** Разбирает **жирный** и [текст](адрес); всё остальное — обычный текст. */
export function renderInline(text: string, keyPrefix: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^)\s]+\))/g).filter(Boolean);
  return parts.map((part, i) => {
    const key = `${keyPrefix}-${i}`;

    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={key}>{part.slice(2, -2)}</strong>;
    }

    const link = /^\[([^\]]+)\]\(([^)\s]+)\)$/.exec(part);
    if (link) {
      const [, label, href] = link;
      // Внутренние адреса — через Link (клиентский переход, вес перелинковки),
      // внешние — обычной ссылкой в новую вкладку.
      return href.startsWith("/") ? (
        <Link key={key} href={href}>
          {label}
        </Link>
      ) : (
        <a key={key} href={href} target="_blank" rel="noopener nofollow">
          {label}
        </a>
      );
    }

    return <Fragment key={key}>{part}</Fragment>;
  });
}

type Block =
  | { type: "sub"; text: string }
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
      blocks.push({ type: "sub", text: line.slice(4).trim() });
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

export function MarkdownBody({
  body,
  headingLevel = "h4",
}: {
  body: string;
  /** Уровень "### "-подзаголовка: на ступень ниже заголовка секции у вызывающего. */
  headingLevel?: "h3" | "h4" | "h5";
}) {
  const blocks = toBlocks(body);
  const Sub = headingLevel;
  return (
    <>
      {blocks.map((block, i) => {
        const key = `b${i}`;
        if (block.type === "sub") {
          return (
            <Sub key={key} style={{ font: "600 13px var(--font-body)", color: "var(--ink)", margin: "12px 0 4px" }}>
              {renderInline(block.text, key)}
            </Sub>
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
