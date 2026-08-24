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
import { RelatedPages, type RelatedLink } from "@/components/content/RelatedPages";
import { arcanumOfSign } from "@/lib/content/matrix-arcana-astro";
import { getArcanumInfo } from "@/lib/engines/matrix";
import {
  allZodiacPairSlugs,
  parseZodiacPairSlug as parseSlug,
  pairsOfSign,
  sameElementSigns,
  zodiacHref,
} from "@/lib/data/zodiac-pairs";
import styles from "@/components/content/content.module.css";

/**
 * 78 страниц (12 «сам с собой» + 66 уникальных пар, C(12,2)) — справочный
 * хаб без калькулятора, см. semantika/_generator.py секция "5. ЗНАКИ
 * ЗОДИАКА". Работа со слагами вынесена в @/lib/data/zodiac-pairs, чтобы
 * связи между страницами можно было строить и отсюда, и с других разделов.
 */

export { allZodiacPairSlugs };

/**
 * Куда вести читателя дальше. До этого страница пары была тупиком: с неё
 * нельзя было попасть даже на страницы двух её собственных знаков.
 *
 * Одиночный знак → все его 11 пар (страница знака становится хабом).
 * Пара → оба знака по отдельности + пары каждого из них со знаками стихии
 * второго: это соседи по смыслу, а не случайный список.
 */
function relatedLinks(a: ZodiacSign, b: ZodiacSign): RelatedLink[] {
  if (a.key === b.key) {
    return pairsOfSign(a).map(({ sign, href }) => ({
      href,
      // Оба знака в именительном: «Лев и Телец». С родительным у второго
      // («Лев и Тельца») подпись читается как оборванная фраза.
      label: `${a.name} и ${sign.name}`,
      note: `Стихии: ${ELEMENT_LABEL[a.element]} и ${ELEMENT_LABEL[sign.element]}`,
    }));
  }

  const links: RelatedLink[] = [
    {
      href: `/znaki-zodiaka/${a.slug}/`,
      label: `${a.name}: характер знака`,
      note: `${a.dateRange} · ${ELEMENT_LABEL[a.element]} · управитель ${a.ruler}`,
    },
    {
      href: `/znaki-zodiaka/${b.slug}/`,
      label: `${b.name}: характер знака`,
      note: `${b.dateRange} · ${ELEMENT_LABEL[b.element]} · управитель ${b.ruler}`,
    },
  ];

  for (const mate of sameElementSigns(b).slice(0, 2)) {
    if (mate.key === a.key) continue;
    links.push({
      href: zodiacHref(a, mate),
      label: `${a.name} и ${mate.name}`,
      note: `Тот же ${ELEMENT_LABEL[b.element].toLowerCase()}, что и у ${b.genitive}`,
    });
  }
  for (const mate of sameElementSigns(a).slice(0, 2)) {
    if (mate.key === b.key) continue;
    links.push({
      href: zodiacHref(b, mate),
      label: `${b.name} и ${mate.name}`,
      note: `Тот же ${ELEMENT_LABEL[a.element].toLowerCase()}, что и у ${a.genitive}`,
    });
  }

  return [...links, ...arcanumLinks(a, b)];
}

/**
 * Мост в Матрицу судьбы. В классической системе соответствий каждому из
 * двенадцати знаков отвечает свой старший аркан — это даёт читателю зодиака
 * честный повод заглянуть в другую систему сервиса, а не рекламную врезку.
 */
function arcanumLinks(a: ZodiacSign, b: ZodiacSign): RelatedLink[] {
  const out: RelatedLink[] = [];
  for (const sign of a.key === b.key ? [a] : [a, b]) {
    const n = arcanumOfSign(sign.name);
    if (n === null) continue;
    out.push({
      href: `/matrica-sudby-sovmestimost/arkany/${n}/`,
      label: `Аркан ${n} «${getArcanumInfo(n).name}»`,
      note: `Аркан ${sign.genitive} в Матрице судьбы`,
    });
  }
  return out;
}

/**
 * Заголовок страницы пары.
 *
 * Было: «Совместимость Дева и Льва» — родительный падеж у второго знака при
 * именительном у первого, то есть просто ошибка в русском. Родительный у обоих
 * («Совместимость Девы и Льва») грамматику чинит, но уводит оба ключевых слова
 * из именительного, в котором их набирают в поиске.
 *
 * Поэтому названия знаков вынесены вперёд и оба стоят в именительном, а слово
 * «совместимость» ушло во вторую часть: и грамматика верна, и ключ сохранён.
 * Побочная выгода: H1 теперь совпадает с title — так поисковик реже переписывает
 * заголовок в выдаче на свой.
 */
function pairTitle(a: ZodiacSign, b: ZodiacSign): string {
  return a.key === b.key
    ? `${a.name} и ${a.name}: совместимость внутри одного знака`
    : `${a.name} и ${b.name}: совместимость в любви, браке и дружбе`;
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
  return {
    alternates: { canonical: `/znaki-zodiaka/${pair}/` },
    title: pairTitle(a, b),
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
      <h1 className={styles.h1}>{pairTitle(a, b)}</h1>
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

      <RelatedPages
        headingId="zodiac-related"
        title={sameSign ? `Совместимость ${a.genitive} с другими знаками` : "Что почитать рядом"}
        lede={
          sameSign
            ? `Как ${a.name} сходится с каждым из остальных одиннадцати знаков — со стихиями, крестами и теневыми сторонами каждой пары.`
            : `Разборы двух этих знаков по отдельности и их пары с другими знаками той же стихии.`
        }
        links={relatedLinks(a, b)}
      />

      <CalcCta
        title="Узнай настоящую совместимость твоей пары"
        text="Знак зодиака — это только Солнце. Полный расчёт по Матрице судьбы, Нумерологии, Дизайну человека и Джйотиш учитывает гораздо больше — введи даты рождения обоих."
      />
    </ContentShell>
  );
}
