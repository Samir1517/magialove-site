import Link from "next/link";
import type { SystemReport } from "@/lib/engines/types";
import type { GrahaPosition, JyotishRawFeatures } from "@/lib/engines/jyotish";
import {
  DOSHA_READINGS,
  GUNA_THRESHOLDS,
  KUTA_READINGS,
  gunaBandLabel,
  type KutaKey,
} from "@/lib/content/jyotish";
import { ScoreRing } from "@/components/viz/ScoreRing";
import { ScoreBar } from "@/components/viz/ScoreBar";
import { NakshatraWheel } from "@/components/viz/NakshatraWheel";
import { JyotishCharts } from "./JyotishCharts";
import { Chip } from "@/components/viz/Legend";
import { ArticleDisclosure } from "@/components/viz/ArticleDisclosure";
import { getJyotishDoshaArticle, getJyotishKutaArticle, getJyotishNakshatraArticle } from "@/lib/content/articles";
import { BANDS, formatScore, toPercent } from "@/components/viz/scale";
import styles from "./systems.module.css";

import kutasData from "@/lib/data/jyotish/kutas.json";

const KUTA_META = (kutasData as { kutas: { key: KutaKey; title: string; max: number; checks: string }[] }).kutas;

/** Высокой считаем куту, набравшую больше половины своего максимума. */
function isHigh(score: number, max: number): boolean {
  return toPercent(score, max) >= 50;
}

export function JyotishSection({
  report,
  nameA = "Партнёр А",
  nameB = "Партнёр Б",
  standaloneHref,
  grahas,
}: {
  report: SystemReport<JyotishRawFeatures>;
  nameA?: string;
  nameB?: string;
  standaloneHref?: string;
  /** Положения грах обоих — для карт D-1 и D-9 на подробной странице. */
  grahas?: { a: GrahaPosition[]; b: GrahaPosition[] } | null;
}) {
  const f = report.rawFeatures;
  const total = f.gunaMilan.total;
  const detailed = !standaloneHref;

  return (
    <section className={styles.section} aria-labelledby="jyotish-title">
      <div className={styles.sectionHead}>
        <div className={styles.sectionHeadRow}>
          <div className={styles.eyebrow}>Джйотиш</div>
          {standaloneHref && (
            <Link href={standaloneHref} className={styles.detailLink}>
              Только эта система →
            </Link>
          )}
        </div>
        <h2 id="jyotish-title" className={styles.sectionTitle}>
          Аштакута: восемь совпадений
        </h2>
        <p className={styles.sectionLede}>
          Классический ведический метод сравнения пары по положению Луны — восемь
          показателей, вместе дающих 36 баллов. Мы показываем не только сумму, но и то,
          что стоит за каждым баллом.
        </p>
      </div>

      <ScoreRing
        percent={report.score}
        gradientId="jyotish-ring"
        label="Совместимость по Джйотиш"
        /* Имя ставим перед двоеточием, а не в родительном падеже: склонять
           произвольное имя («Луна Анны», но «Луна Игоря») надёжно нельзя, а
           «Луна Первый партнёр» — то, что получалось раньше без имён. */
        caption={`Гуна-милан: ${formatScore(total)} из 36 — ${gunaBandLabel(total)}. Луна, ${nameA}: накшатра ${f.a.moonNakshatra} (${f.a.moonRashi}). Луна, ${nameB}: ${f.b.moonNakshatra} (${f.b.moonRashi}).`}
      />

      <div>
        <h3 className={styles.blockTitle}>Накшатры Луны</h3>
        {detailed && (
          <div style={{ marginBottom: 16 }}>
            <NakshatraWheel
              aIndex={f.a.moonNakshatraIndex}
              bIndex={f.b.moonNakshatraIndex}
              aName={nameA}
              bName={nameB}
              aNakshatra={f.a.moonNakshatra}
              bNakshatra={f.b.moonNakshatra}
            />
          </div>
        )}
        <div className={styles.bars}>
          {[
            { name: nameA, idx: f.a.moonNakshatraIndex, nakshatra: f.a.moonNakshatra },
            { name: nameB, idx: f.b.moonNakshatraIndex, nakshatra: f.b.moonNakshatra },
          ].map(({ name, idx, nakshatra }) => {
            const article = getJyotishNakshatraArticle(idx);
            return article ? (
              <ArticleDisclosure
                key={name}
                article={article}
                eyebrow={`${name} · Накшатра «${nakshatra}»`}
                moreHref={`/dzhyotish-sovmestimost/nakshatry/${idx}/`}
                moreLabel={`Накшатра «${nakshatra}»: полное описание →`}
              />
            ) : null;
          })}
        </div>
      </div>

      {detailed && grahas && (
        <>
          <hr className={styles.divider} />
          <JyotishCharts a={grahas.a} b={grahas.b} nameA={nameA} nameB={nameB} />
        </>
      )}

      <hr className={styles.divider} />

      <div>
        <h3 className={styles.blockTitle}>Сумма Гуна-милан</h3>
        <ScoreBar
          label="Всего баллов"
          score={total}
          max={36}
          showAsFraction
          showBandLabel={false}
          ticks={GUNA_THRESHOLDS.map((t) => t / 36)}
          caption={`Традиционные пороги отмечены на шкале: 18 — приемлемо, 24 — хорошо, 30 — отлично. Твой результат — ${gunaBandLabel(total)}.`}
        />
      </div>

      <hr className={styles.divider} />

      <div>
        <h3 className={styles.blockTitle}>Восемь кут по отдельности</h3>
        <div className={styles.bars}>
          {KUTA_META.map((kuta) => {
            const result = f.gunaMilan.kutas[kuta.key];
            if (!result) return null;
            const reading = KUTA_READINGS[kuta.key];
            const high = isHigh(result.score, result.max);
            const article = getJyotishKutaArticle(kuta.key);
            // Светофор трёх состояний (паттерн тамильских порутамов
            // Uthamam/Madhyamam/Adhamam) — но без пугающего «плохо»:
            // полный балл, больше половины, половина и меньше.
            const state =
              result.score === result.max
                ? { label: "сильная сторона", band: BANDS.high }
                : high
                  ? { label: "рабочая зона", band: BANDS.mid }
                  : { label: "зона роста", band: BANDS.low };
            return (
              <div key={kuta.key} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                  <Chip color={state.band.ink} background={state.band.wash}>
                    {state.label}
                  </Chip>
                </div>
                <ScoreBar
                  label={`${kuta.title} — ${reading.about}`}
                  score={result.score}
                  max={result.max}
                  showAsFraction
                  showBandLabel={false}
                  caption={high ? reading.high : reading.low}
                />
                {article && (
                  <ArticleDisclosure
                    article={article}
                    eyebrow={`Кута «${kuta.title}»`}
                    moreHref="/dzhyotish-sovmestimost/8-kut/"
                    moreLabel={`Кута «${kuta.title}»: подробный разбор →`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <hr className={styles.divider} />

      <div>
        <h3 className={styles.blockTitle}>Доши: что традиция считает отягощением</h3>
        <div className={styles.bars}>
          {f.doshas.map((d) => {
            const reading = DOSHA_READINGS[d.key];
            const text = d.neutralized
              ? (reading?.neutralized ?? reading?.present)
              : d.active
                ? reading?.present
                : reading?.absent;
            const state = d.neutralized
              ? { label: "взаимно нейтрализована", band: BANDS.mid }
              : d.active
                ? { label: "присутствует", band: BANDS.low }
                : { label: "нет", band: BANDS.high };
            return (
              <div key={d.key} className={styles.doshaRow}>
                <div className={styles.doshaHead}>
                  <strong className={styles.doshaTitle}>{d.title}</strong>
                  <Chip color={state.band.ink} background={state.band.wash}>
                    {state.label}
                  </Chip>
                </div>
                <p className={styles.doshaText}>{text}</p>
                {(() => {
                  const article = getJyotishDoshaArticle(d.key);
                  return article ? (
                    <ArticleDisclosure
                      article={article}
                      eyebrow={d.title}
                      moreHref="/dzhyotish-sovmestimost/doshi/"
                      moreLabel={`${d.title}: подробный разбор →`}
                    />
                  ) : null;
                })()}
              </div>
            );
          })}
        </div>
        <p className={styles.note}>
          Доши мы показываем как часть классического метода, а не как приговор.
          Ни один из этих показателей не является медицинским или научным утверждением
          о вашем здоровье, детях или сроке отношений.
        </p>
      </div>

      <p className={styles.note}>
        Расчёт сидерический, айянамша Лахири (приближённая формула). Возможны расхождения
        в доли градуса с профессиональным астрологическим ПО; на определение накшатры и
        раши это в подавляющем большинстве случаев не влияет.
      </p>
    </section>
  );
}
