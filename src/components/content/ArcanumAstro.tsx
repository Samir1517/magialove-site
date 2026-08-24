import Link from "next/link";
import { ARCANUM_ASTRO } from "@/lib/content/matrix-arcana-astro";
import { ZODIAC_SIGNS, ELEMENT_LABEL, type Element } from "@/lib/data/zodiac";
import styles from "./content.module.css";

/**
 * Астрологическое соответствие аркана + связь со справочником знаков зодиака.
 *
 * Ссылки не прописаны руками, а выведены из соответствия:
 * — знак → его собственная страница;
 * — планета → знаки, которыми она управляет (поле `ruler` в ZODIAC_SIGNS,
 *   включая составные вида «Марс/Плутон»);
 * — стихия → три знака этой стихии.
 *
 * Побочный эффект намеренный: 22 страницы арканов начинают питать кластер из
 * 78 страниц зодиака, который до этого был связан с сайтом одной ссылкой с хаба.
 */

const ELEMENT_KEY: Record<string, Element> = {
  Огонь: "fire",
  Земля: "earth",
  Воздух: "air",
  Вода: "water",
};

export function ArcanumAstro({ n, arcanumName }: { n: number; arcanumName: string }) {
  const astro = ARCANUM_ASTRO[n];
  if (!astro) return null;

  const signs =
    astro.kind === "sign"
      ? ZODIAC_SIGNS.filter((s) => s.name === astro.value)
      : astro.kind === "planet"
        ? ZODIAC_SIGNS.filter((s) => s.ruler.split("/").includes(astro.value))
        : ZODIAC_SIGNS.filter((s) => s.element === ELEMENT_KEY[astro.value]);

  const heading =
    astro.kind === "sign"
      ? `Какому знаку зодиака соответствует аркан`
      : astro.kind === "planet"
        ? `Какая планета стоит за этим арканом`
        : `Какая стихия у этого аркана`;

  const linkNote =
    astro.kind === "sign"
      ? `Знак этого аркана`
      : astro.kind === "planet"
        ? `Знак под управлением ${astro.value}`
        : `Знак стихии ${astro.value}`;

  return (
    <section className={styles.card} aria-labelledby={`astro-${n}`}>
      <h2 id={`astro-${n}`} className={styles.h2}>
        {heading}
      </h2>
      <p className={styles.text}>
        <strong>{arcanumName}</strong> — это{" "}
        {astro.kind === "element" ? `стихия ${astro.value}` : astro.value}. {astro.text}
      </p>
      {signs.length > 0 && (
        <>
          <p className={styles.note} style={{ marginBottom: 10 }}>
            {astro.kind === "element"
              ? `Ту же стихию несут три знака зодиака — их разборы совместимости у нас есть отдельно:`
              : `Разбор совместимости по этому знаку у нас есть отдельной страницей:`}
          </p>
          <div className={styles.grid}>
            {signs.map((s) => (
              <Link key={s.key} href={`/znaki-zodiaka/${s.slug}/`} className={styles.gridLink}>
                <span className={styles.gridLinkTitle}>{s.name}: совместимость знака</span>
                <span className={styles.gridLinkText}>
                  {linkNote} · {ELEMENT_LABEL[s.element]} · {s.dateRange}
                </span>
              </Link>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
