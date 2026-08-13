"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

import { calcMatrixCompatibility } from "@/lib/engines/matrix";
import { calcNumerologyCompatibility } from "@/lib/engines/numerology";
import { calcHumanDesignCompatibility } from "@/lib/engines/human_design";
import { calcJyotishCompatibility } from "@/lib/engines/jyotish";
import {
  calcWeightedScore,
  calcCrossSystemThemes,
  getVerdict,
  getEffectiveWeights,
} from "@/lib/engines/synthesis";
import {
  collectPairFactors,
  calcPairHighlights,
  calcPairArchetype,
  calcPairRoles,
} from "@/lib/engines/highlights";
import { makePerson, safely } from "@/lib/engines/person";
import { DEFAULT_TZ } from "@/lib/data/timezones";

import { DailySection } from "@/components/systems/DailySection";
import { SynthesisPanel } from "@/components/systems/SynthesisPanel";
import { FullReportForm } from "@/components/result/FullReportForm";
import { ShareActions } from "@/components/result/ShareActions";
import { PairSummary } from "@/components/result/PairSummary";
import { ScoreBreakdown } from "@/components/result/ScoreBreakdown";
import { SystemCards } from "@/components/result/SystemCards";
import systemStyles from "@/components/systems/systems.module.css";
import { ScorePetals } from "@/components/result/ScorePetals";
import { Reveal } from "@/components/viz/Reveal";
import { ScoreRing } from "@/components/viz/ScoreRing";
import { bandStyle, formatScore } from "@/components/viz/scale";
import styles from "@/components/result/result.module.css";

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
    return { a, b, matrix, numerology, humanDesign, jyotish, hasTimes };
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

  const { matrix, numerology, humanDesign, jyotish } = data;

  const systems = [
    { name: "Матрица судьбы", score: matrix.score },
    { name: "Нумерология", score: numerology.score },
    { name: "Дизайн человека", score: humanDesign?.score ?? null },
    { name: "Джйотиш", score: jyotish?.score ?? null },
  ];
  const known = systems.filter((s) => s.score !== null) as { name: string; score: number }[];
  const systemScores = {
    matrix: matrix.score,
    numerology: numerology.score,
    human_design: humanDesign?.score ?? null,
    jyotish: jyotish?.score ?? null,
  };
  const overall = calcWeightedScore(systemScores);
  const weights = getEffectiveWeights(systemScores);
  const verdict = getVerdict(overall);
  const overallBand = bandStyle(overall);
  const crossThemes = calcCrossSystemThemes(matrix, numerology, humanDesign, jyotish);
  const archetype = calcPairArchetype(overall, crossThemes, matrix, numerology);
  const factors = collectPairFactors(matrix, numerology, humanDesign, jyotish);
  const highlights = calcPairHighlights(factors);
  const roles = calcPairRoles(matrix, numerology, humanDesign);

  const qs = params.toString();
  const matrixHref = `/matrica-sudby-sovmestimost/rezultat?${qs}`;
  const numerologyHref = `/numerologiya-sovmestimost/rezultat?${qs}`;
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
          : `Твоя совместимость — ${formatScore(overall)}%`}
      </h1>
      <p className={styles.lede}>
        {known.length === 4
          ? "Четыре независимые системы посчитаны по твоим датам и времени рождения. Совпадения между ними весомее любого отдельного вывода — на них и стоит смотреть в первую очередь."
          : "Это быстрый срез по двум системам, которым достаточно только дат рождения. Дизайн человека и Джйотиш ждут точного времени рождения — они считаются по положению планет на момент, а не на дату."}
      </p>

      <div className={styles.overallCard}>
        <ScorePetals show={overall >= 80} />
        <div className={styles.archetypeRow}>
          <ScoreRing percent={overall} gradientId="overall-ring" size={158} stroke={11} />
          <div className={styles.archetypeMeta}>
            <div className={styles.eyebrow}>Тип вашей пары</div>
            <div className={styles.archetypeName}>«{archetype.name}»</div>
            <p className={styles.archetypeMotto}>{archetype.motto}</p>
            <div className={styles.archetypeLS}>
              <p className={styles.archetypeLSLine}>
                <strong>Свет:</strong> {archetype.light}
              </p>
              <p className={styles.archetypeLSLine}>
                <strong>Тень:</strong> {archetype.shadow}
              </p>
            </div>
          </div>
        </div>
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

      <p className={styles.positioning}>
        Процент — это не оценка вам. Это плотность мест, где вы совпадаете без усилий.
        Всё остальное не поломка, а то, что придётся проговаривать словами, — и почти
        всегда именно там пары и растут.
      </p>

      <ScoreBreakdown
        weights={weights}
        scores={systemScores}
        overall={overall}
        hasTimes={data.hasTimes}
      />

      <PairSummary highlights={highlights} roles={roles} nameA={nameA} nameB={nameB} />

      <Reveal>
        <ShareActions
          nameA={nameA !== "Первый партнёр" ? nameA : ""}
          nameB={nameB !== "Второй партнёр" ? nameB : ""}
          score={overall}
          verdictLabel={verdict.label}
        />
      </Reveal>

      {crossThemes && (
        <Reveal>
          <SynthesisPanel themes={crossThemes} />
        </Reveal>
      )}

      {/* Четыре системы — компактными карточками. Полные разделы отсюда убраны:
          на общей странице они и так шли в урезанном виде (углублённые схемы
          отключены), давая 47 экранов на телефоне. Всё подробное живёт на
          отдельных страницах систем, куда ведут ссылки из карточек. */}
      <Reveal>
        <div className={styles.sysCardsHead}>
          <h2 className={styles.sysCardsTitle}>Что сказала каждая система</h2>
          <p className={styles.sysCardsLede}>
            Коротко по каждой: балл, самое сильное место и то, что просит внимания.
            Подробный разбор с картами и схемами — по ссылке из карточки.
          </p>
        </div>
        <SystemCards
          factors={factors}
          scores={systemScores}
          hrefs={{
            matrix: matrixHref,
            numerology: numerologyHref,
            human_design: humanDesignHref,
            jyotish: jyotishHref,
          }}
        />
      </Reveal>

      {/* «Аркан дня» — после разбора пары, а не до него: человек пришёл за
          совместимостью, и обновляемый блок работает как повод вернуться
          завтра, а не как отвлечение от главного. */}
      <Reveal>
        <DailySection a={data.a} b={data.b} />
      </Reveal>

      {!data.hasTimes && <FullReportForm />}

      <div className={styles.nextSteps}>
        <h2 className={styles.nextStepsTitle}>Что с этим делать дальше</h2>
        <div className={styles.nextStepsList}>
          <Link href={matrixHref} className={styles.nextStep}>
            <span className={styles.nextStepTitle}>Углубиться в одну систему →</span>
            <span className={styles.nextStepText}>
              Тот же расчёт, но развёрнутый: по Матрице судьбы — все зоны союза и разбор
              каждого аркана отдельно.
            </span>
          </Link>
          <Link href="/po-imeni/" className={styles.nextStep}>
            <span className={styles.nextStepTitle}>Посчитать по именам →</span>
            <span className={styles.nextStepText}>
              Другой срез той же нумерологии: не дата рождения, а имя — то, чем вы друг
              друга зовёте каждый день.
            </span>
          </Link>
          <Link href="/o-servise/" className={styles.nextStep}>
            <span className={styles.nextStepTitle}>Как мы считаем →</span>
            <span className={styles.nextStepText}>
              Методика, первоисточники по каждой из четырёх систем и то, чего этот расчёт
              намеренно не делает.
            </span>
          </Link>
        </div>
      </div>

      <Link href="/" className={`btn ${styles.backLink}`}>
        Рассчитать другую пару
      </Link>
    </div>
  );
}
