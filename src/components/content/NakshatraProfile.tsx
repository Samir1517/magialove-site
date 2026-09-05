import Link from "next/link";
import {
  NAKSHATRA_FACTS,
  GANA_MEANING,
  NADI_MEANING,
  nakshatraRow,
  nakshatraDegrees,
  nakshatraPadas,
} from "@/lib/content/nakshatra-facts";
import { ZODIAC_SIGNS } from "@/lib/data/zodiac";
import styles from "./content.module.css";

/**
 * Фактура накшатры: символ, божество, управитель, гана, йони, пады, градусы.
 *
 * Зачем блок появился. Страницы накшатр вылетели из поиска 2 сентября 2026 со
 * статусом «малоценная»: 489 слов, семь одинаковых по форме разделов и ноль
 * проверяемых данных. Уцелел кластер арканов — там 1400 слов и несколько
 * фактических слоёв. Этот компонент даёт накшатрам тот слой, которого им не
 * хватало: не пересказ настроения, а конкретика, которую можно сверить.
 *
 * Всё, что можно вычислить, вычисляется, а не хранится: границы в градусах
 * (круг делится на 27 равных отрезков) и знаки навамши для четырёх пад (108
 * пад проходят 12 знаков ровно девять раз). Так данные не разъедутся.
 */

/** Ссылка на знак зодиака по имени; раши бывает пограничным вида «Овен/Телец». */
function signLinks(rashi: string) {
  return rashi
    .split("/")
    .map((name) => ZODIAC_SIGNS.find((s) => s.name === name.trim()))
    .filter((s): s is (typeof ZODIAC_SIGNS)[number] => Boolean(s));
}

export function NakshatraProfile({ n, name }: { n: number; name: string }) {
  const facts = NAKSHATRA_FACTS[n];
  const row = nakshatraRow(n);
  if (!facts || !row) return null;

  const deg = nakshatraDegrees(n);
  const padas = nakshatraPadas(n);
  const gana = GANA_MEANING[facts.gana];
  const nadi = NADI_MEANING[row.nadi];
  const signs = signLinks(row.rashi);

  return (
    <>
      <section className={styles.card} aria-labelledby={`facts-${n}`}>
        <h2 id={`facts-${n}`} className={styles.h2}>
          Символ, божество и управитель накшатры {name}
        </h2>
        <p className={styles.text}>
          Накшатра — это лунная стоянка: отрезок неба, по которому Луна проходит примерно
          сутки. Весь круг поделён на 27 таких отрезков, и {name} занимает участок от{" "}
          {deg.from} до {deg.to} — считая от начала звёздного, а не привычного нам
          календарного зодиака. Если Луна в момент рождения человека стояла здесь, эта
          накшатра и считается его лунной стоянкой.
        </p>
        <ul className={styles.list}>
          <li className={styles.listItem}>
            <strong>Символ:</strong> {facts.symbol}. Символ в традиции не украшение — он и
            есть краткая запись характера: по нему читают, как накшатра ведёт себя в жизни.
          </li>
          <li className={styles.listItem}>
            <strong>Божество:</strong> {facts.deity}. Считается, что качества божества
            проступают в поведении человека с этой стоянкой Луны.
          </li>
          <li className={styles.listItem}>
            <strong>Планета-управитель:</strong> {facts.planet}. Та же планета открывает
            период жизни, который в Джйотиш называют даша — отрезок в несколько лет, когда
            её темы выходят на первый план.
          </li>
          <li className={styles.listItem}>
            <strong>Знак зодиака (раши):</strong>{" "}
            {signs.length > 0
              ? signs.map((s, i) => (
                  <span key={s.key}>
                    {i > 0 && " и "}
                    <Link href={`/znaki-zodiaka/${s.slug}/`}>{s.name}</Link>
                  </span>
                ))
              : row.rashi}
            . {signs.length > 1
              ? "Накшатра лежит на границе двух знаков, поэтому вбирает черты обоих."
              : "Знак задаёт общий фон, накшатра — детали внутри него."}
          </li>
        </ul>
      </section>

      <section className={styles.card} aria-labelledby={`gana-${n}`}>
        <h2 id={`gana-${n}`} className={styles.h2}>
          Какой темперамент даёт {name} в паре
        </h2>
        <p className={styles.text}>
          Гана — это темперамент накшатры, то есть манера вести себя в столкновении. Их
          три, по девять накшатр в каждой. У {name} гана{" "}
          <strong>
            {facts.gana} ({gana.label})
          </strong>
          . {gana.text}
        </p>
        <p className={styles.text}>
          В подсчёте совместимости гана даёт до 6 баллов из 36. Больше всего трений
          традиция ждёт от сочетания божественной и демонической ган: у одного партнёра
          манера сглаживать, у другого — говорить прямо, и каждый читает другого неверно.
          Мягкость выглядит как уклонение, прямота — как нападение, хотя ни тот ни другой
          не собирался ранить.
        </p>
        <p className={styles.note}>
          Нади у {name} — <strong>{row.nadi}</strong>: {nadi}. Это самый весомый параметр
          Гуна-милана, 8 баллов из 36. Причём совпадение здесь считается не плюсом, а
          минусом: одинаковая нади у обоих даёт нади-дошу, потому что партнёры получаются
          слишком похожего склада — некому уравновешивать.
        </p>
      </section>

      <section className={styles.card} aria-labelledby={`yoni-${n}`}>
        <h2 id={`yoni-${n}`} className={styles.h2}>
          Йони {name}: {facts.yoni.toLowerCase()}
        </h2>
        <p className={styles.text}>
          Йони — животное накшатры. В Гуна-милане им измеряют телесную совместимость: до 4
          баллов из 36. У {name} это <strong>{facts.yoni.toLowerCase()}</strong>, пол
          символа — {facts.yoniSex === "м" ? "мужской" : "женский"}. Логика традиции
          простая: у каждого животного свой ритм близости, и пары складываются тем легче,
          чем ближе эти ритмы. Дружественные животные дают 3 балла, нейтральные 2,
          враждующие 1, а у заклятых противников — ноль.
        </p>
        <p className={styles.note}>
          Читать это стоит как описание темпа, а не приговор телу. Разные йони означают,
          что паре придётся договариваться про близость словами, а не считывать друг друга
          с полувзгляда — многие пары так и живут, просто им нужен разговор.
        </p>
      </section>

      <section className={styles.card} aria-labelledby={`padas-${n}`}>
        <h2 id={`padas-${n}`} className={styles.h2}>
          Четыре пады {name}: почему две одинаковые накшатры звучат по-разному
        </h2>
        <p className={styles.text}>
          Каждая накшатра делится на четыре четверти — пады. Луна проходит паду примерно за
          шесть часов, и попадание в разные пады заметно меняет характер, хотя накшатра
          одна и та же. Поэтому двое с {name} могут быть непохожи: смотреть нужно на паду, а
          для неё нужно точное время рождения.
        </p>
        <div className={styles.grid}>
          {padas.map((sign, i) => {
            const s = ZODIAC_SIGNS.find((z) => z.name === sign);
            const inner = (
              <>
                <span className={styles.gridLinkNum}>{i + 1}</span>
                <span className={styles.gridLinkTitle}>Пада {i + 1} · {sign}</span>
                {/* Именительный падеж намеренно: названия знаков склоняются
                    по-разному («Тельца», но «Близнецов»), и подстановка
                    окончания давала «близнецыа». */}
                <span className={styles.gridLinkText}>
                  Примесь знака {sign} внутри {name}
                </span>
              </>
            );
            return s ? (
              <Link key={i} href={`/znaki-zodiaka/${s.slug}/`} className={styles.gridLink}>
                {inner}
              </Link>
            ) : (
              <div key={i} className={styles.gridLink}>
                {inner}
              </div>
            );
          })}
        </div>
        <p className={styles.note}>
          Знак рядом с падой — это знак навамши, вспомогательной карты, которую в Джйотиш
          читают именно про брак и близкие отношения. Проще говоря: пада показывает, какой
          дополнительный оттенок примешивается к накшатре в теме отношений.
        </p>
      </section>
    </>
  );
}
