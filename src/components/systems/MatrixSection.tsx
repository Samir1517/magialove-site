import Link from "next/link";
import type { SystemReport } from "@/lib/engines/types";
import {
  getArcanumInfo,
  zoneCharacter,
  zoneWeight,
  ZONE_TITLES,
  type MatrixRawFeatures,
  type ZoneKey,
} from "@/lib/engines/matrix";
import { ScoreRing } from "@/components/viz/ScoreRing";
import { ScoreBar } from "@/components/viz/ScoreBar";
import { ArticleDisclosure } from "@/components/viz/ArticleDisclosure";
import { getMatrixArticle } from "@/lib/content/articles";
import styles from "./systems.module.css";

/**
 * Пояснение к характеру зоны. Принцип §5: «прочий» аркан — не пустое место,
 * а качество, которое просто не попало ни в список гармоничных, ни в список
 * напряжённых для этой конкретной зоны; направление ему задаёте вы.
 */
const CHARACTER_NOTE: Record<"harmonic" | "tense" | "other", string> = {
  harmonic: "Аркан работает на эту зону: качество здесь включается легко и само.",
  tense: "Аркан даёт этой зоне напряжение — не поломку, а задачу, которую придётся решать осознанно.",
  other: "Аркан для этой зоны нейтрален по формуле — но нейтральных качеств не бывает. Куда оно повернётся, решает то, служит оно вам двоим или только одному из двоих.",
};

export function MatrixSection({
  report,
  standaloneHref,
}: {
  report: SystemReport<MatrixRawFeatures>;
  /** Если задано — ссылка «только эта система» на отдельный калькулятор (показывается на общем /rezultat/). */
  standaloneHref?: string;
}) {
  const f = report.rawFeatures;
  const zoneKeys = Object.keys(ZONE_TITLES) as ZoneKey[];

  return (
    <section className={styles.section} aria-labelledby="matrix-title">
      <div className={styles.sectionHead}>
        <div className={styles.sectionHeadRow}>
          <div className={styles.eyebrow}>Матрица судьбы</div>
          {standaloneHref && (
            <Link href={standaloneHref} className={styles.detailLink}>
              Только эта система →
            </Link>
          )}
        </div>
        <h2 id="matrix-title" className={styles.sectionTitle}>
          Пять зон твоего союза
        </h2>
        <p className={styles.sectionLede}>
          Твоя матрица и матрица партнёра наложены друг на друга — получается третья,
          общая. Её точки показывают, где вам легко, а где придётся работать осознанно.
        </p>
      </div>

      <ScoreRing
        percent={report.score}
        gradientId="matrix-ring"
        label="Совместимость по Матрице судьбы"
        caption="Балл собран по пяти зонам общей матрицы: любовь, деньги, дети, предназначение и точка комфорта."
      />

      <div>
        <h3 className={styles.blockTitle}>Зоны пары</h3>
        <div className={styles.bars}>
          {zoneKeys.map((zone) => {
            const arcanum = f.pairArcana[zone];
            const info = getArcanumInfo(arcanum);
            const character = zoneCharacter(zone, arcanum);
            const article = getMatrixArticle(arcanum);
            return (
              <div key={zone} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <ScoreBar
                  label={`${ZONE_TITLES[zone]} · Аркан ${info.number} «${info.name}»`}
                  score={zoneWeight(zone, arcanum) * 100}
                  max={100}
                  showBandLabel={false}
                  caption={`${info.inPair} ${CHARACTER_NOTE[character]}`}
                />
                {article && (
                  <ArticleDisclosure
                    article={article}
                    eyebrow={`Аркан ${info.number} «${info.name}» в зоне «${ZONE_TITLES[zone]}»`}
                    moreHref={`/po-date-rozhdeniya/matrica-sudby-sovmestimost/arkany/${info.number}/`}
                    moreLabel={`Аркан ${info.number} «${info.name}»: значение и совместимость →`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <hr className={styles.divider} />

      <div>
        <h3 className={styles.blockTitle}>Баланс по чакрам</h3>
        <ul className={styles.openList}>
          {f.chakraBalance.map((c) => {
            const info = getArcanumInfo(c.arcanum);
            return (
              <li key={c.key} className={styles.openItem}>
                <strong className={styles.openName}>
                  {c.name} · Аркан {info.number} «{info.name}»
                </strong>
                <span className={styles.doshaText}>{c.pairMeaning}</span>
              </li>
            );
          })}
        </ul>
      </div>

      <p className={styles.note}>
        Трактовка арканов опирается на «Священную книгу Тота» Владимира Шмакова (1916),
        где аркан понимается как состояние, и дополняется «Книгой Тота» Алистера Кроули
        (1944). Привязка зон «любовь», «деньги» и «дети» к диагональным точкам —
        интерпретация нашего сервиса; предназначение и центр берутся напрямую по методу.
      </p>
    </section>
  );
}
