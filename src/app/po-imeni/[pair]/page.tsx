import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ContentShell, CalcCta } from "@/components/content/ContentShell";
import { ArticleDisclosure } from "@/components/viz/ArticleDisclosure";
import { ScoreRing } from "@/components/viz/ScoreRing";
import { calcNameCompatibility } from "@/lib/engines/name-numerology";
import { getNameNumberArticle } from "@/lib/content/articles";
import { PILOT_MALE_NAMES, PILOT_FEMALE_NAMES, nameSlug } from "@/lib/data/name-popularity";
import styles from "@/components/content/content.module.css";

/**
 * Пилотные страницы имён (8×8 = 64 пары) — см. semantika/_generator.py.
 * Слаг вида "александр-i-анастасия": имена кириллицей как есть, разделитель —
 * латинское "i" (транслитерация союза "и"), в точности по формату, который
 * уже был согласован с пользователем в семантическом ядре.
 *
 * Частотность пар — не точный Wordstat (недоступен без входа в аккаунт, см.
 * lib/data/name-popularity.ts), а обоснованная оценка по реальной статистике
 * популярности имён. Контент на каждой странице не шаблонный: числа и текст
 * считаются движком `name-numerology.ts` заново для каждой конкретной пары.
 */

interface PairParams {
  m: string;
  f: string;
  slug: string;
}

function allPairs(): PairParams[] {
  const pairs: PairParams[] = [];
  for (const m of PILOT_MALE_NAMES) {
    for (const f of PILOT_FEMALE_NAMES) {
      pairs.push({ m, f, slug: `${nameSlug(m)}-i-${nameSlug(f)}` });
    }
  }
  return pairs;
}

export function generateStaticParams() {
  return allPairs().map((p) => ({ pair: p.slug }));
}

function getData(slug: string): PairParams | null {
  return allPairs().find((p) => p.slug === slug) ?? null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ pair: string }>;
}): Promise<Metadata> {
  const { pair } = await params;
  const data = getData(pair);
  if (!data) return {};
  return {
    alternates: { canonical: `/po-imeni/${pair}/` },
    title: `${data.m} и ${data.f}: совместимость имён`,
    description: `Совместимость имён ${data.m} и ${data.f} по нумерологии — Число Имени, Число Души, Число Личности каждого и общий балл пары.`,
  };
}

export default async function NamePairPage({ params }: { params: Promise<{ pair: string }> }) {
  const { pair } = await params;
  const data = getData(pair);
  if (!data) notFound();
  const { m, f } = data;

  const result = calcNameCompatibility(m, f);
  const { aNumbers, bNumbers } = result.rawFeatures;
  const articleA = getNameNumberArticle(aNumbers.expression);
  const articleB = getNameNumberArticle(bNumbers.expression);

  return (
    <ContentShell
      breadcrumbs={[
        { label: "Главная", href: "/" },
        { label: "По имени", href: "/po-imeni/" },
        { label: `${m} и ${f}` },
      ]}
    >
      <div className={styles.eyebrow}>По имени</div>
      <h1 className={styles.h1}>{m} и {f}: совместимость имён</h1>
      <p className={styles.lede}>
        Число Имени показывает манеру самоподачи каждого из вас — как ты заявляешь о себе
        миру, а не жизненную задачу (её раскрывает число жизненного пути по дате рождения).
        Ниже — реальный расчёт по кириллической таблице Пифагора для имён {m} и {f}.
      </p>

      <ScoreRing
        percent={result.score}
        gradientId="pair-ring"
        label="Совместимость имён"
        caption={`Числа Имени: ${aNumbers.expression} и ${bNumbers.expression}.`}
      />

      <div className={styles.grid} style={{ gridTemplateColumns: "1fr 1fr" }}>
        <div className={styles.card}>
          <h2 style={{ font: "600 14px var(--font-body)", color: "var(--ink)", margin: "0 0 10px" }}>{m}</h2>
          <p style={{ font: "400 13px/1.7 var(--font-body)", color: "var(--ink-soft)", margin: 0 }}>
            Число Имени: <strong>{aNumbers.expression}</strong> · Число Души: <strong>{aNumbers.soul}</strong> ·
            {" "}Число Личности: <strong>{aNumbers.personality}</strong>
          </p>
        </div>
        <div className={styles.card}>
          <h2 style={{ font: "600 14px var(--font-body)", color: "var(--ink)", margin: "0 0 10px" }}>{f}</h2>
          <p style={{ font: "400 13px/1.7 var(--font-body)", color: "var(--ink-soft)", margin: 0 }}>
            Число Имени: <strong>{bNumbers.expression}</strong> · Число Души: <strong>{bNumbers.soul}</strong> ·
            {" "}Число Личности: <strong>{bNumbers.personality}</strong>
          </p>
        </div>
      </div>

      {articleA && (
        <div className={styles.card}>
          <ArticleDisclosure article={articleA} eyebrow={`${m} · Число имени ${aNumbers.expression}`} />
        </div>
      )}
      {articleB && aNumbers.expression !== bNumbers.expression && (
        <div className={styles.card}>
          <ArticleDisclosure article={articleB} eyebrow={`${f} · Число имени ${bNumbers.expression}`} />
        </div>
      )}

      <CalcCta
        title="Узнай полную совместимость твоей пары"
        text="Число имени — только один срез. Введи даты рождения, чтобы увидеть полный разбор по всем 4 системам сервиса."
      />
    </ContentShell>
  );
}
