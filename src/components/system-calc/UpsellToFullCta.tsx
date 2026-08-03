import Link from "next/link";

/** CTA со страницы одной системы к полному разбору по всем 4 — с теми же параметрами. */
export function UpsellToFullCta({ text, params }: { text: string; params: URLSearchParams }) {
  return (
    <div
      style={{
        background: "linear-gradient(135deg, #faf5f7, #f4eefa)",
        borderRadius: 22,
        padding: "28px 26px",
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      <h2 style={{ font: "italic 400 21px/1.3 var(--font-display)", color: "var(--ink)", margin: 0 }}>
        А что говорят остальные 3 системы?
      </h2>
      <p style={{ font: "400 13.5px/1.6 var(--font-body)", color: "var(--ink-soft)", margin: 0, maxWidth: "56ch" }}>
        {text}
      </p>
      <Link href={`/rezultat?${params.toString()}`} className="btn" style={{ padding: "13px 24px", fontSize: 13.5 }}>
        Открыть полный разбор по 4 системам
      </Link>
    </div>
  );
}
