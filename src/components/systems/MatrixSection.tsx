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
import { MatrixOctagram } from "@/components/viz/MatrixOctagram";
import { ChakraTable } from "@/components/viz/ChakraTable";
import { ArticleDisclosure } from "@/components/viz/ArticleDisclosure";
import { getMatrixArticle } from "@/lib/content/articles";
import styles from "./systems.module.css";

/**
 * Пояснение к характеру зоны. Принцип §5: «прочий» аркан — не пустое место,
 * а качество, которое просто не попало ни в список гармоничных, ни в список
 * напряжённых для этой конкретной зоны; направление ему задаёте вы.
 */
const CHARACTER_NOTE: Record<"harmonic" | "tense", string> = {
  harmonic: "Аркан работает на эту зону: качество здесь включается легко и само.",
  tense: "Аркан даёт этой зоне напряжение — не поломку, а задачу, которую придётся решать осознанно.",
};

/**
 * «Прочий» аркан выпадает чаще всех остальных характеров вместе взятых: у
 * большинства пар так закрыты три-четыре зоны из пяти. Одна общая фраза на все
 * пять шла тогда подряд четырьмя одинаковыми абзацами, и раздел начинал
 * читаться как незаполненный шаблон. Поэтому смысл («направление задаёте вы»)
 * один, а формулировка у каждой зоны своя и говорит именно про эту зону.
 */
const NEUTRAL_NOTE: Record<ZoneKey, string> = {
  love: "По формуле аркан не тянет эту зону ни вверх, ни вниз. В любви это значит, что готового сценария у вас нет: близость здесь такая, какой вы её сделаете сами.",
  money: "Формула не задаёт этой зоне направления. В деньгах это скорее хорошо: нет ни встроенной лёгкости, ни встроенного конфликта — работают только ваши договорённости.",
  kids: "Аркан не толкает эту зону ни в одну сторону. Творчество и родительство здесь держатся не на предрасположенности, а на том, находите ли вы на них время.",
  purpose: "По формуле зона нейтральна. Общий смысл союза вам не выдан готовым — он тот, который вы двое проговорите и выберете.",
  center: "Формула оставляет эту зону открытой. Каким будет ваш общий комфорт, определяет быт и привычки, а не расклад арканов.",
};

export function MatrixSection({
  report,
  standaloneHref,
  nameA = "Она",
  nameB = "Он",
}: {
  report: SystemReport<MatrixRawFeatures>;
  /** Если задано — ссылка «только эта система» на отдельный калькулятор (показывается на общем /rezultat/). */
  standaloneHref?: string;
  nameA?: string;
  nameB?: string;
}) {
  const f = report.rawFeatures;
  const zoneKeys = Object.keys(ZONE_TITLES) as ZoneKey[];
  // На отдельной странице системы показываем углублённые схемы; на общем
  // результате 4 систем они были бы перегрузом (октаграмма + таблица чакр).
  const detailed = !standaloneHref;

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
          У каждого из вас своя матрица, но вместе вы складываете третью — ту, которой
          нет ни у одного по отдельности. Именно она объясняет, почему с этим человеком
          ты ведёшь себя не так, как с другими: дело не в характере, а в том, что
          включается только рядом с ним. Ниже — пять зон этой общей карты. В каждой свой
          аркан, и у каждого аркана две стороны: одно и то же качество может держать вас
          или изматывать — решает не аркан, а куда вы его направляете.
        </p>
      </div>

      <ScoreRing
        percent={report.score}
        gradientId="matrix-ring"
        label="Совместимость по Матрице судьбы"
        caption="Балл собран по пяти зонам общей матрицы: любовь, деньги, дети, предназначение и точка комфорта."
      />

      {detailed && (
        <div>
          <h3 className={styles.blockTitle}>Октаграмма вашей общей матрицы</h3>
          <p className={styles.note} style={{ marginBottom: 12 }}>
            Ромб — то, что вы принесли сами: день, месяц, год и кармический свод. Прямой
            квадрат — родовые диагонали, то, что пришло из ваших семей раньше вас. В центре
            сердцевина союза: точка, к которой сходится всё остальное. Нажми на любую —
            расскажем, что она значит именно для вас двоих.
          </p>
          <MatrixOctagram pair={f.pairMatrix} />
        </div>
      )}

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
                  caption={`${info.inPair} ${
                    character === "other" ? NEUTRAL_NOTE[zone] : CHARACTER_NOTE[character]
                  }`}
                />
                {article && (
                  <ArticleDisclosure
                    article={article}
                    eyebrow={`Аркан ${info.number} «${info.name}» в зоне «${ZONE_TITLES[zone]}»`}
                    moreHref={`/matrica-sudby-sovmestimost/arkany/${info.number}/`}
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
        <p className={styles.note} style={{ marginBottom: 12 }}>
          Семь уровней, на которых пара встречается: от быта и денег внизу до общего
          смысла наверху. Ссоры почти всегда идут не там, где кажется: разговор о
          немытой посуде — это нижний уровень, а обида на «ты меня не слышишь» — совсем
          другой. Посмотри, какой аркан стоит на каждом.
        </p>
        {detailed && (
          <div style={{ marginBottom: 16 }}>
            <ChakraTable
              balance={f.chakraBalance}
              aMatrix={f.aMatrix}
              bMatrix={f.bMatrix}
              nameA={nameA}
              nameB={nameB}
            />
          </div>
        )}
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
