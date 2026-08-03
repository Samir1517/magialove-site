import Link from "next/link";
import type { SystemReport } from "@/lib/engines/types";
import {
  getLifePathInfo,
  LINE_TITLES,
  type NumerologyRawFeatures,
  type PsychomatrixLineKey,
  type DigitCounts,
} from "@/lib/engines/numerology";
import {
  COUNT_BAND_LABEL,
  DIGIT_MEANINGS,
  DIFF_BAND_TITLE,
  LINE_READINGS,
  countBand,
  diffBand,
  digitReading,
} from "@/lib/content/numerology";
import { ScoreRing } from "@/components/viz/ScoreRing";
import { ScoreBar } from "@/components/viz/ScoreBar";
import { Legend } from "@/components/viz/Legend";
import { ArticleDisclosure } from "@/components/viz/ArticleDisclosure";
import { getLifePathArticle, getPsychomatrixArticle } from "@/lib/content/articles";
import { BANDS } from "@/components/viz/scale";
import styles from "./systems.module.css";

/** Классическая раскладка Квадрата Пифагора: столбцы 1-2-3 / 4-5-6 / 7-8-9. */
const SQUARE_ROWS: number[][] = [
  [1, 4, 7],
  [2, 5, 8],
  [3, 6, 9],
];

const CELL_STYLE = {
  deficit: { background: BANDS.low.wash, color: BANDS.low.ink },
  norm: { background: BANDS.mid.wash, color: BANDS.mid.ink },
  excess: { background: BANDS.high.wash, color: BANDS.high.ink },
} as const;

function PythagorasSquare({ name, digits }: { name: string; digits: DigitCounts }) {
  return (
    <div className={styles.squareWrap}>
      <span className={styles.squareName}>{name}</span>
      <div className={styles.square}>
        {SQUARE_ROWS.flat().map((digit) => {
          const count = digits[digit] ?? 0;
          const band = countBand(count);
          const meaning = DIGIT_MEANINGS[digit];
          return (
            <div
              key={digit}
              className={styles.cell}
              style={CELL_STYLE[band]}
              title={`${meaning.title} — ${COUNT_BAND_LABEL[band]}. ${digitReading(digit, count)}`}
            >
              <span className={styles.cellDigits}>
                {count > 0 ? String(digit).repeat(count) : "—"}
              </span>
              <span className={styles.cellLabel}>{meaning.title}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function NumerologySection({
  report,
  nameA = "Партнёр А",
  nameB = "Партнёр Б",
  standaloneHref,
}: {
  report: SystemReport<NumerologyRawFeatures>;
  nameA?: string;
  nameB?: string;
  standaloneHref?: string;
}) {
  const f = report.rawFeatures;
  const aInfo = getLifePathInfo(f.aLifePath);
  const bInfo = getLifePathInfo(f.bLifePath);
  const lineKeys = Object.keys(LINE_TITLES) as PsychomatrixLineKey[];

  return (
    <section className={styles.section} aria-labelledby="numerology-title">
      <div className={styles.sectionHead}>
        <div className={styles.sectionHeadRow}>
          <div className={styles.eyebrow}>Нумерология</div>
          {standaloneHref && (
            <Link href={standaloneHref} className={styles.detailLink}>
              Только эта система →
            </Link>
          )}
        </div>
        <h2 id="numerology-title" className={styles.sectionTitle}>
          Числа твоей пары
        </h2>
        <p className={styles.sectionLede}>
          Западная пифагорейско-халдейская традиция плюс Квадрат Пифагора. Мы смотрим не
          «сошлись ли числа», а где вы с партнёром совпадаете — и что это совпадение вам стоит.
        </p>
      </div>

      <ScoreRing
        percent={report.score}
        gradientId="numerology-ring"
        label="Совместимость по нумерологии"
        caption={`Числа жизненного пути ${f.aLifePath} и ${f.bLifePath}: динамика «${f.pairDynamic}».`}
      />

      <div className={styles.pathPair}>
        <div className={styles.pathCard}>
          <span className={styles.pathNumber}>{f.aLifePath}</span>
          <span className={styles.pathMeta}>
            <span className={styles.pathName}>{aInfo.name}</span>
            <span className={styles.pathLove}>{aInfo.love}</span>
          </span>
        </div>
        <span className={styles.pathJoin}>и</span>
        <div className={styles.pathCard}>
          <span className={styles.pathNumber}>{f.bLifePath}</span>
          <span className={styles.pathMeta}>
            <span className={styles.pathName}>{bInfo.name}</span>
            <span className={styles.pathLove}>{bInfo.love}</span>
          </span>
        </div>
      </div>

      <div className={styles.bars}>
        {[
          { n: f.aLifePath, name: nameA },
          ...(f.bLifePath !== f.aLifePath ? [{ n: f.bLifePath, name: nameB }] : []),
        ].map(({ n, name }) => {
          const article = getLifePathArticle(n);
          return article ? (
            <ArticleDisclosure
              key={n}
              article={article}
              eyebrow={`Число ${n} — ${name}`}
              moreHref={`/po-date-rozhdeniya/numerologiya-sovmestimost/chislo-zhiznennogo-puti/${n}/`}
              moreLabel={`Число жизненного пути ${n}: характеристика и совместимость →`}
            />
          ) : null;
        })}
      </div>

      <hr className={styles.divider} />

      <div>
        <h3 className={styles.blockTitle}>Квадрат Пифагора: из чего вы с партнёром собраны</h3>
        <div className={styles.squares}>
          <PythagorasSquare name={nameA} digits={f.aDigits} />
          <PythagorasSquare name={nameB} digits={f.bDigits} />
        </div>
        <Legend
          entries={[
            { color: BANDS.low.wash, text: "не заполнено — качество выращивается сознательно" },
            { color: BANDS.mid.wash, text: "норма — работает без перекоса" },
            { color: BANDS.high.wash, text: "избыток — сила, которая легко перехлёстывает" },
          ]}
        />
        <p className={styles.note}>
          Избыток здесь не «лучше», а недостаток не «хуже»: пустая ячейка означает, что
          качество не включается само собой, а тройка и больше — что оно включается даже
          тогда, когда не нужно. Наведи курсор на ячейку, чтобы прочитать её трактовку.
        </p>
      </div>

      <hr className={styles.divider} />

      <div>
        <h3 className={styles.blockTitle}>8 линий: где вы с партнёром совпадаете, а где дополняете</h3>
        <div className={styles.bars}>
          {lineKeys.map((key) => {
            const diff = f.lineDiffs[key];
            const band = diffBand(diff);
            const article = getPsychomatrixArticle(key);
            return (
              <div key={key} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <ScoreBar
                  label={LINE_TITLES[key]}
                  score={f.lineScores[key]}
                  max={100}
                  showBandLabel={false}
                  caption={`${DIFF_BAND_TITLE[band]} (разница ${diff}). ${LINE_READINGS[key][band]}`}
                />
                {article && (
                  <ArticleDisclosure
                    article={article}
                    eyebrow={LINE_TITLES[key]}
                    moreHref="/po-date-rozhdeniya/numerologiya-sovmestimost/psihomatritsa/"
                    moreLabel={`Психоматрица: линия «${LINE_TITLES[key]}» подробно →`}
                  />
                )}
              </div>
            );
          })}
        </div>
        <p className={styles.note}>
          Психоматрица — современная символическая техника (систематизирована Александром
          Александровым, Россия, 2000-е), а не древнее и не научное знание. Её ценность —
          в языке для разговора о паре, а не в предсказании.
        </p>
      </div>
    </section>
  );
}
