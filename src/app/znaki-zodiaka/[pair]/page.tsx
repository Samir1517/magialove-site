import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ContentShell, CalcCta } from "@/components/content/ContentShell";
import {
  ZODIAC_SIGNS,
  ELEMENT_LABEL,
  MODALITY_LABEL,
  type ZodiacSign,
} from "@/lib/data/zodiac";
import { elementText, modalityText, signPairNote } from "@/lib/content/zodiac";
import styles from "@/components/content/content.module.css";

/**
 * 78 страниц (12 «сам с собой» + 66 уникальных пар, C(12,2)) — справочный
 * хаб без калькулятора, см. semantika/_generator.py секция "5. ЗНАКИ
 * ЗОДИАКА". Канонический порядок пары — по алфавиту русского названия
 * (та же дедупликация, что и в исходном генераторе семантического ядра),
 * чтобы не публиковать одну и ту же пару дважды под разными URL.
 */

function canonicalPair(a: ZodiacSign, b: ZodiacSign): [ZodiacSign, ZodiacSign] {
  return a.name <= b.name ? [a, b] : [b, a];
}

export function allZodiacPairSlugs(): string[] {
  const seen = new Set<string>();
  const slugs: string[] = [];
  for (const s1 of ZODIAC_SIGNS) {
    for (const s2 of ZODIAC_SIGNS) {
      const [a, b] = canonicalPair(s1, s2);
      const slug = a.key === b.key ? a.slug : `${a.slug}-${b.slug}`;
      if (seen.has(slug)) continue;
      seen.add(slug);
      slugs.push(slug);
    }
  }
  return slugs;
}

function parseSlug(slug: string): [ZodiacSign, ZodiacSign] | null {
  for (const s1 of ZODIAC_SIGNS) {
    if (slug === s1.slug) return [s1, s1];
  }
  for (const s1 of ZODIAC_SIGNS) {
    for (const s2 of ZODIAC_SIGNS) {
      if (s1.key === s2.key) continue;
      const [a, b] = canonicalPair(s1, s2);
      if (slug === `${a.slug}-${b.slug}`) return [a, b];
    }
  }
  return null;
}

export function generateStaticParams() {
  return allZodiacPairSlugs().map((pair) => ({ pair }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ pair: string }>;
}): Promise<Metadata> {
  const { pair } = await params;
  const parsed = parseSlug(pair);
  if (!parsed) return {};
  const [a, b] = parsed;
  const title =
    a.key === b.key
      ? `Совместимость ${a.name} и ${a.name}: два представителя одного знака`
      : `Совместимость ${a.name} и ${b.genitive}: любовь, брак, дружба`;
  return {
    title,
    description: `Классическая астрологическая совместимость ${a.genitive} и ${b.genitive} — стихии, кресты, светлые и теневые стороны союза.`,
  };
}

export default async function ZodiacPairPage({ params }: { params: Promise<{ pair: string }> }) {
  const { pair } = await params;
  const parsed = parseSlug(pair);
  if (!parsed) notFound();
  const [a, b] = parsed;
  const sameSign = a.key === b.key;

  const elements = elementText(a.element, b.element);
  const modalities = modalityText(a.modality, b.modality);
  const note = signPairNote(a, b);

  return (
    <ContentShell
      breadcrumbs={[
        { label: "Главная", href: "/" },
        { label: "Знаки зодиака", href: "/znaki-zodiaka/" },
        { label: sameSign ? a.name : `${a.name} и ${b.name}` },
      ]}
    >
      <div className={styles.eyebrow}>Знаки зодиака</div>
      <h1 className={styles.h1}>
        {sameSign
          ? `Совместимость ${a.name} и ${a.name}: два представителя одного знака`
          : `Совместимость ${a.name} и ${b.genitive}: любовь, брак, дружба`}
      </h1>
      <p className={styles.lede}>{note}</p>

      <div className={styles.card} style={{ display: "flex", flexDirection: "column", gap: 22 }}>
        <div className={styles.grid} style={{ gridTemplateColumns: "1fr 1fr" }}>
          <div>
            <h2 style={{ font: "600 14px var(--font-body)", color: "var(--ink)", margin: "0 0 6px" }}>{a.name}</h2>
            <p style={{ font: "400 13px/1.6 var(--font-body)", color: "var(--ink-soft)", margin: 0 }}>
              {a.dateRange} · Стихия: {ELEMENT_LABEL[a.element]} · Крест: {MODALITY_LABEL[a.modality]} · Управитель: {a.ruler}
            </p>
          </div>
          <div>
            <h2 style={{ font: "600 14px var(--font-body)", color: "var(--ink)", margin: "0 0 6px" }}>{b.name}</h2>
            <p style={{ font: "400 13px/1.6 var(--font-body)", color: "var(--ink-soft)", margin: 0 }}>
              {b.dateRange} · Стихия: {ELEMENT_LABEL[b.element]} · Крест: {MODALITY_LABEL[b.modality]} · Управитель: {b.ruler}
            </p>
          </div>
        </div>

        <div>
          <h2 style={{ font: "600 15px var(--font-body)", color: "var(--ink)", margin: "0 0 8px" }}>
            Стихии: {ELEMENT_LABEL[a.element]} и {ELEMENT_LABEL[b.element]}
          </h2>
          <p style={{ font: "400 14px/1.75 var(--font-body)", color: "var(--ink-soft)", margin: "0 0 8px" }}>
            <strong style={{ color: "var(--ink)" }}>Конструктивно: </strong>{elements.light}
          </p>
          <p style={{ font: "400 14px/1.75 var(--font-body)", color: "var(--ink-soft)", margin: 0 }}>
            <strong style={{ color: "var(--ink)" }}>Тень: </strong>{elements.shadow}
          </p>
        </div>

        <div>
          <h2 style={{ font: "600 15px var(--font-body)", color: "var(--ink)", margin: "0 0 8px" }}>
            Кресты: {MODALITY_LABEL[a.modality]} и {MODALITY_LABEL[b.modality]}
          </h2>
          <p style={{ font: "400 14px/1.75 var(--font-body)", color: "var(--ink-soft)", margin: "0 0 8px" }}>
            <strong style={{ color: "var(--ink)" }}>Конструктивно: </strong>{modalities.light}
          </p>
          <p style={{ font: "400 14px/1.75 var(--font-body)", color: "var(--ink-soft)", margin: 0 }}>
            <strong style={{ color: "var(--ink)" }}>Тень: </strong>{modalities.shadow}
          </p>
        </div>

        <p
          style={{
            font: "italic 400 12px/1.6 var(--font-body)",
            color: "var(--ink-faint)",
            margin: 0,
            paddingTop: 10,
            borderTop: "1px solid #f4eef1",
          }}
        >
          Это справочный разбор по классической западной астрологии — знаку Солнца,
          стихии и кресту. Он не заменяет расчёт по 4 системам сервиса, который учитывает
          не только Солнце, но и точную дату (а для двух систем — время и место) рождения.
        </p>
      </div>

      <CalcCta
        title="Узнай настоящую совместимость твоей пары"
        text="Знак зодиака — это только Солнце. Полный расчёт по Матрице судьбы, Нумерологии, Дизайну человека и Джйотиш учитывает гораздо больше — введи даты рождения обоих."
      />
    </ContentShell>
  );
}
