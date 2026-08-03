"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

import { calcMatrixCompatibility } from "@/lib/engines/matrix";
import { calcNumerologyCompatibility } from "@/lib/engines/numerology";
import { calcHumanDesignCompatibility } from "@/lib/engines/human_design";
import { calcJyotishCompatibility, calcNavagraha } from "@/lib/engines/jyotish";
import { calcWeightedScore, calcCrossSystemThemes, getVerdict } from "@/lib/engines/synthesis";
import { makePerson, safely } from "@/lib/engines/person";
import { DEFAULT_TZ } from "@/lib/data/timezones";

import { MatrixSection } from "@/components/systems/MatrixSection";
import { NumerologySection } from "@/components/systems/NumerologySection";
import { HumanDesignSection } from "@/components/systems/HumanDesignSection";
import { JyotishSection } from "@/components/systems/JyotishSection";
import { DailySection } from "@/components/systems/DailySection";
import { SynthesisPanel } from "@/components/systems/SynthesisPanel";
import { FullReportForm } from "@/components/result/FullReportForm";
import { Biwheel } from "@/components/viz/Biwheel";
import { bandStyle, formatScore } from "@/components/viz/scale";
import styles from "@/components/result/result.module.css";
import systemStyles from "@/components/systems/systems.module.css";

export function ResultView() {
  const params = useSearchParams();
  const dateA = params.get("a");
  const dateB = params.get("b");
  const timeA = params.get("at") ?? "";
  const timeB = params.get("bt") ?? "";
  const tzA = params.get("atz") ?? DEFAULT_TZ;
  const tzB = params.get("btz") ?? DEFAULT_TZ;
  const nameA = params.get("na")?.trim() || "Первый партнёр";
  const nameB = params.get("nb")?.trim() || "Второй партнёр";

  const data = useMemo(() => {
    if (!dateA || !dateB) return null;
    const a = makePerson(dateA, timeA, tzA);
    const b = makePerson(dateB, timeB, tzB);

    const matrix = safely(() => calcMatrixCompatibility(a, b));
    const numerology = safely(() => calcNumerologyCompatibility(a, b));
    if (!matrix || !numerology) return null;

    const hasTimes = Boolean(timeA && timeB);
    const humanDesign = hasTimes ? safely(() => calcHumanDesignCompatibility(a, b)) : null;
    const jyotish = hasTimes ? safely(() => calcJyotishCompatibility(a, b)) : null;
    const grahas = hasTimes
      ? safely(() => ({ a: calcNavagraha(a), b: calcNavagraha(b) }))
      : null;

    return { a, b, matrix, numerology, humanDesign, jyotish, grahas, hasTimes };
  }, [dateA, dateB, timeA, timeB, tzA, tzB]);

  if (!dateA || !dateB || !data) {
    return (
      <div className={styles.wrap}>
        <p className={styles.missing}>
          Не хватает данных для расчёта.{" "}
          <Link href="/">Вернитесь на главную и укажите обе даты рождения</Link>.
        </p>
      </div>
    );
  }

  const { matrix, numerology, humanDesign, jyotish, grahas } = data;

  const systems = [
    { name: "Матрица судьбы", score: matrix.score },
    { name: "Нумерология", score: numerology.score },
    { name: "Дизайн человека", score: humanDesign?.score ?? null },
    { name: "Джйотиш", score: jyotish?.score ?? null },
  ];
  const known = systems.filter((s) => s.score !== null) as { name: string; score: number }[];
  const overall = calcWeightedScore({
    matrix: matrix.score,
    numerology: numerology.score,
    human_design: humanDesign?.score ?? null,
    jyotish: jyotish?.score ?? null,
  });
  const verdict = getVerdict(overall);
  const overallBand = bandStyle(overall);
  const crossThemes = calcCrossSystemThemes(matrix, numerology, humanDesign, jyotish);

  const qs = params.toString();
  const matrixHref = `/po-date-rozhdeniya/matrica-sudby-sovmestimost/rezultat?${qs}`;
  const numerologyHref = `/po-date-rozhdeniya/numerologiya-sovmestimost/rezultat?${qs}`;
  const humanDesignHref = `/dizajn-cheloveka-sovmestimost/rezultat?${qs}`;
  const jyotishHref = `/dzhyotish-sovmestimost/rezultat?${qs}`;

  return (
    <div className={styles.wrap}>
      <div className={styles.topBar}>
        <Link href="/" className={styles.brand}>
          СОВМЕСТИМОСТЬ
        </Link>
      </div>

      <div className={styles.eyebrow}>
        {known.length === 4 ? "Полный разбор по 4 системам" : "Предварительный результат"}
      </div>
      <h1 className={styles.title}>
        {nameA !== "Первый партнёр" && nameB !== "Второй партнёр"
          ? `${nameA} и ${nameB} — ${formatScore(overall)}%`
          : `Ваша совместимость — ${formatScore(overall)}%`}
      </h1>
      <p className={styles.lede}>
        {known.length === 4
          ? "Четыре независимые системы посчитаны по вашим датам и времени рождения. Совпадения между ними весомее любого отдельного вывода — на них и стоит смотреть в первую очередь."
          : "Это быстрый срез по двум системам, которым достаточно только дат рождения. Дизайн человека и Джйотиш ждут точного времени рождения — они считаются по положению планет на момент, а не на дату."}
      </p>

      <div className={styles.overallCard}>
        <div className={styles.systemScores}>
          {systems.map((s) => (
            <div key={s.name} className={styles.systemScore}>
              <span className={styles.systemName}>{s.name}</span>
              {s.score !== null ? (
                <span className={styles.systemValue} style={{ color: bandStyle(s.score).ink }}>
                  {formatScore(s.score)}%
                </span>
              ) : (
                <span className={styles.systemPending}>нужно время рождения</span>
              )}
            </div>
          ))}
        </div>
        <p className={systemStyles.doshaText} style={{ color: overallBand.ink }}>
          <strong>{verdict.label}.</strong> {verdict.hook} Балл взвешен по системам, а не
          усреднён поровну: {data.hasTimes
            ? "Дизайну человека и Джйотиш отдан больший вес как более детальным по входным данным"
            : "пока не введено время рождения, вес несут Матрица и Нумерология"}
          .
        </p>
      </div>

      <DailySection a={data.a} b={data.b} />

      {crossThemes && <SynthesisPanel themes={crossThemes} />}

      <MatrixSection report={matrix} standaloneHref={matrixHref} />

      <NumerologySection report={numerology} nameA={nameA} nameB={nameB} standaloneHref={numerologyHref} />

      {humanDesign ? (
        <HumanDesignSection report={humanDesign} nameA={nameA} nameB={nameB} standaloneHref={humanDesignHref} />
      ) : null}

      {jyotish ? (
        <>
          <JyotishSection report={jyotish} nameA={nameA} nameB={nameB} standaloneHref={jyotishHref} />
          {grahas && (
            <section className={systemStyles.section} aria-labelledby="biwheel-title">
              <div className={systemStyles.sectionHead}>
                <div className={systemStyles.eyebrow}>Биколесо</div>
                <h2 id="biwheel-title" className={systemStyles.sectionTitle}>
                  Две карты в одном круге
                </h2>
                <p className={systemStyles.sectionLede}>
                  Внутреннее кольцо — {nameA}, внешнее — {nameB}. Линии в центре
                  показывают синастрические аспекты: золотые — соединения, розовые —
                  гармоничные, лиловые — напряжённые. Наведите курсор на любой символ.
                </p>
              </div>
              <div style={{ display: "flex", justifyContent: "center" }}>
                <Biwheel aGrahas={grahas.a} bGrahas={grahas.b} nameA={nameA} nameB={nameB} />
              </div>
              <p className={systemStyles.note}>
                Положения сидерические (айянамша Лахири), показаны девять грах
                классического Джйотиша. Уран, Нептун и Плутон в традицию не входят.
              </p>
            </section>
          )}
        </>
      ) : null}

      {!data.hasTimes && <FullReportForm />}

      <Link href="/" className={`btn ${styles.backLink}`}>
        Рассчитать другую пару
      </Link>
    </div>
  );
}
