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
import { reduceLifePath } from "@/lib/engines/utils";
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

/**
 * Третий квадрат — «квадрат пары»: не сумма, а сравнение заполненности ячеек.
 * Логика ниши (numeroscop и др. дают её только текстом): оба сильны — резонанс,
 * один даёт качество за двоих — дополнение, пусто у обоих — зона выращивания.
 */
function PairSquare({
  aDigits,
  bDigits,
  nameA,
  nameB,
}: {
  aDigits: DigitCounts;
  bDigits: DigitCounts;
  nameA: string;
  nameB: string;
}) {
  const stateOf = (digit: number): "resonance" | "complement" | "empty" => {
    const a = aDigits[digit] ?? 0;
    const b = bDigits[digit] ?? 0;
    if (a > 0 && b > 0) return "resonance";
    if (a > 0 || b > 0) return "complement";
    return "empty";
  };

  const STATE_STYLE = {
    resonance: { background: "#f7dbe3", color: "#a2698a" },
    complement: { background: "#e7ddf3", color: "#7a5f9e" },
    empty: { background: "transparent", color: "var(--ink-faint)", border: "1px dashed #d8c7d8" },
  } as const;

  const STATE_LABEL = {
    resonance: "резонанс — сильно у обоих",
    complement: "дополнение — один даёт качество за двоих",
    empty: "у обоих пусто — качество выращивается вдвоём",
  } as const;

  return (
    <div className={styles.squareWrap}>
      <span className={styles.squareName}>Вместе</span>
      <div className={styles.square}>
        {SQUARE_ROWS.flat().map((digit) => {
          const state = stateOf(digit);
          const meaning = DIGIT_MEANINGS[digit];
          const who =
            state === "complement" ? ((aDigits[digit] ?? 0) > 0 ? nameA : nameB) : null;
          return (
            <div
              key={digit}
              className={styles.cell}
              style={STATE_STYLE[state]}
              title={`${meaning.title}: ${STATE_LABEL[state]}${who ? ` (даёт ${who})` : ""}`}
            >
              <span className={styles.cellDigits}>
                {state === "resonance" ? "✦✦" : state === "complement" ? "✦" : "—"}
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
  const detailed = !standaloneHref;

  // Число пары: свод суммы двух ЧЖП — приём ниши (общее число союза).
  const pairNumber = reduceLifePath(f.aLifePath + f.bLifePath);
  const pairInfo = getLifePathInfo(pairNumber);
  const unisonCount = lineKeys.filter((k) => f.lineDiffs[k] <= 1).length;

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
        <span className={styles.pathJoin}>=</span>
        <div className={`${styles.pathCard} ${styles.pathCardPair}`}>
          <span className={styles.pathNumber}>{pairNumber}</span>
          <span className={styles.pathMeta}>
            <span className={styles.pathName}>Число вашей пары · {pairInfo.name}</span>
            <span className={styles.pathLove}>
              Свод двух чисел жизненного пути — общий характер союза.
            </span>
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
          {detailed && (
            <PairSquare aDigits={f.aDigits} bDigits={f.bDigits} nameA={nameA} nameB={nameB} />
          )}
        </div>
        <Legend
          entries={
            detailed
              ? [
                  { color: BANDS.low.wash, text: "не заполнено — качество выращивается сознательно" },
                  { color: BANDS.mid.wash, text: "норма — работает без перекоса" },
                  { color: BANDS.high.wash, text: "избыток — сила, которая легко перехлёстывает" },
                  { color: "#f7dbe3", text: "✦✦ резонанс — сильно у обоих" },
                  { color: "#e7ddf3", text: "✦ дополнение — один даёт качество за двоих" },
                ]
              : [
                  { color: BANDS.low.wash, text: "не заполнено — качество выращивается сознательно" },
                  { color: BANDS.mid.wash, text: "норма — работает без перекоса" },
                  { color: BANDS.high.wash, text: "избыток — сила, которая легко перехлёстывает" },
                ]
          }
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
        <p className={styles.note} style={{ marginBottom: 12 }}>
          {unisonCount} из 8 линий — в унисон (разница силы не больше единицы).
        </p>
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
