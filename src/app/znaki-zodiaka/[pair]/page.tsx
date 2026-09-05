import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ContentShell, CalcCta } from "@/components/content/ContentShell";
import {
  ZODIAC_SIGNS,
  ELEMENT_LABEL,
  MODALITY_LABEL,
  verb,
  type ZodiacSign,
} from "@/lib/data/zodiac";
import { elementText, modalityText, signPairNote } from "@/lib/content/zodiac";
import {
  aspectBetween,
  aspectInPair,
  elementsInPair,
  modalitiesInPair,
  pairScore,
  pairSpheres,
  rulersText,
  scoreVerdict,
} from "@/lib/content/zodiac-synastry";
import { zodiacPairFaq } from "@/lib/content/zodiac-faq";
import { HubFaq } from "@/components/content/HubDepth";
import { RelatedPages, type RelatedLink } from "@/components/content/RelatedPages";
import { arcanumOfSign } from "@/lib/content/matrix-arcana-astro";
import { getArcanumInfo } from "@/lib/engines/matrix";
import {
  allZodiacPairSlugs,
  parseZodiacPairSlug as parseSlug,
  pairsOfSign,
  sameElementSigns,
  zodiacHref,
} from "@/lib/data/zodiac-pairs";
import styles from "@/components/content/content.module.css";

/**
 * 78 страниц (12 «сам с собой» + 66 уникальных пар, C(12,2)) — справочный
 * хаб без калькулятора, см. semantika/_generator.py секция "5. ЗНАКИ
 * ЗОДИАКА". Работа со слагами вынесена в @/lib/data/zodiac-pairs, чтобы
 * связи между страницами можно было строить и отсюда, и с других разделов.
 */

export { allZodiacPairSlugs };

/**
 * Куда вести читателя дальше. До этого страница пары была тупиком: с неё
 * нельзя было попасть даже на страницы двух её собственных знаков.
 *
 * Одиночный знак → все его 11 пар (страница знака становится хабом).
 * Пара → оба знака по отдельности + пары каждого из них со знаками стихии
 * второго: это соседи по смыслу, а не случайный список.
 */
function relatedLinks(a: ZodiacSign, b: ZodiacSign): RelatedLink[] {
  if (a.key === b.key) {
    return pairsOfSign(a).map(({ sign, href }) => ({
      href,
      // Оба знака в именительном: «Лев и Телец». С родительным у второго
      // («Лев и Тельца») подпись читается как оборванная фраза.
      label: `${a.name} и ${sign.name}`,
      note: `Стихии: ${ELEMENT_LABEL[a.element]} и ${ELEMENT_LABEL[sign.element]}`,
    }));
  }

  const links: RelatedLink[] = [
    {
      href: `/znaki-zodiaka/${a.slug}/`,
      label: `${a.name}: характер знака`,
      note: `${a.dateRange} · ${ELEMENT_LABEL[a.element]} · управитель ${a.ruler}`,
    },
    {
      href: `/znaki-zodiaka/${b.slug}/`,
      label: `${b.name}: характер знака`,
      note: `${b.dateRange} · ${ELEMENT_LABEL[b.element]} · управитель ${b.ruler}`,
    },
  ];

  for (const mate of sameElementSigns(b).slice(0, 2)) {
    if (mate.key === a.key) continue;
    links.push({
      href: zodiacHref(a, mate),
      label: `${a.name} и ${mate.name}`,
      note: `Тот же ${ELEMENT_LABEL[b.element].toLowerCase()}, что и у ${b.genitive}`,
    });
  }
  for (const mate of sameElementSigns(a).slice(0, 2)) {
    if (mate.key === b.key) continue;
    links.push({
      href: zodiacHref(b, mate),
      label: `${b.name} и ${mate.name}`,
      note: `Тот же ${ELEMENT_LABEL[a.element].toLowerCase()}, что и у ${a.genitive}`,
    });
  }

  return [...links, ...arcanumLinks(a, b)];
}

/**
 * Мост в Матрицу судьбы. В классической системе соответствий каждому из
 * двенадцати знаков отвечает свой старший аркан — это даёт читателю зодиака
 * честный повод заглянуть в другую систему сервиса, а не рекламную врезку.
 */
function arcanumLinks(a: ZodiacSign, b: ZodiacSign): RelatedLink[] {
  const out: RelatedLink[] = [];
  for (const sign of a.key === b.key ? [a] : [a, b]) {
    const n = arcanumOfSign(sign.name);
    if (n === null) continue;
    out.push({
      href: `/matrica-sudby-sovmestimost/arkany/${n}/`,
      label: `Аркан ${n} «${getArcanumInfo(n).name}»`,
      note: `Аркан ${sign.genitive} в Матрице судьбы`,
    });
  }
  return out;
}

/**
 * Заголовок страницы пары.
 *
 * Было: «Совместимость Дева и Льва» — родительный падеж у второго знака при
 * именительном у первого, то есть просто ошибка в русском. Родительный у обоих
 * («Совместимость Девы и Льва») грамматику чинит, но уводит оба ключевых слова
 * из именительного, в котором их набирают в поиске.
 *
 * Поэтому названия знаков вынесены вперёд и оба стоят в именительном, а слово
 * «совместимость» ушло во вторую часть: и грамматика верна, и ключ сохранён.
 * Побочная выгода: H1 теперь совпадает с title — так поисковик реже переписывает
 * заголовок в выдаче на свой.
 */
function pairTitle(a: ZodiacSign, b: ZodiacSign): string {
  // Одиночный слаг вида /znaki-zodiaka/lev/ — это хаб знака, а не пара: на него
  // ссылаются анкором «Лев: характер знака», и ищут его как знак, а не как
  // «Лев и Лев». Заголовок должен обещать то же, что обещает ссылка.
  return a.key === b.key
    ? `${a.name}: характер знака и совместимость с другими знаками`
    : `${a.name} и ${b.name}: совместимость в любви, браке и дружбе`;
}

export function generateStaticParams() {
  return allZodiacPairSlugs().map((pair) => ({ pair }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ pair: string }>;
}): Promise<Metadata> {
  const { pair } = await params;
  const parsed = parseSlug(pair);
  if (!parsed) return {};
  const [a, b] = parsed;
  return {
    alternates: { canonical: `/znaki-zodiaka/${pair}/` },
    title: pairTitle(a, b),
    description:
      a.key === b.key
        ? `${a.name} (${a.dateRange}): стихия ${ELEMENT_LABEL[a.element]}, управитель ${a.ruler}. Сильная и теневая стороны знака и совместимость со всеми двенадцатью знаками зодиака.`
        : `Совместимость ${a.genitive} и ${b.genitive} в любви, браке и дружбе: аспект между знаками, стихии, кресты, управители и справочный балл пары.`,
  };
}

export default async function ZodiacPairPage({ params }: { params: Promise<{ pair: string }> }) {
  const { pair } = await params;
  const parsed = parseSlug(pair);
  if (!parsed) notFound();
  const [a, b] = parsed;
  const sameSign = a.key === b.key;

  const elements = elementText(a.element, b.element);
  const modalities = modalityText(a.modality, b.modality);
  const note = signPairNote(a, b);
  const aspect = aspectBetween(a, b);
  const score = pairScore(a, b);
  const spheres = pairSpheres(a, b);
  const rulers = rulersText(a, b);

  return (
    <ContentShell
      breadcrumbs={[
        { label: "Главная", href: "/" },
        { label: "Знаки зодиака", href: "/znaki-zodiaka/" },
        { label: sameSign ? a.name : `${a.name} и ${b.name}` },
      ]}
    >
      <div className={styles.eyebrow}>Знаки зодиака</div>
      <h1 className={styles.h1}>{pairTitle(a, b)}</h1>
      <p className={styles.lede}>
        {sameSign
          ? `${a.name} — ${MODALITY_LABEL[a.modality].toLowerCase()} знак стихии ${ELEMENT_LABEL[a.element]}, ${a.dateRange}, управитель ${a.ruler}. Сильная сторона знака — ${a.strength}, теневая — ${a.shadow}. Ниже разобрано, как ${a.name} ${verb(a, "сходится", "сходятся")} с каждым из двенадцати знаков и что происходит, когда оба партнёра родились под этим знаком.`
          : note}
      </p>

      {sameSign && (
        <section className={styles.card}>
          <h2 className={styles.h2}>Что за знак {a.name}</h2>
          <p className={styles.text}>
            {/* «Солнце проходит Льва / Весы» требует разных падежей для
                одушевлённых и неодушевлённых знаков — конструкция «в знаке
                <Именительный>» работает для всех двенадцати. */}
            Солнце находится в знаке {a.name} в период {a.dateRange}. Это{" "}
            {MODALITY_LABEL[a.modality].toLowerCase()} знак стихии{" "}
            {ELEMENT_LABEL[a.element].toLowerCase()} — то есть{" "}
            {a.modality === "cardinal"
              ? "знак, который начинает сезон и потому склонен запускать новое"
              : a.modality === "fixed"
                ? "знак середины сезона: он не начинает и не завершает, а удерживает"
                : "знак на сломе сезонов, отсюда гибкость и умение перестраиваться"}
            . Управитель — {a.ruler}.
          </p>
          <p className={styles.text}>
            <strong>Сильная сторона: </strong>
            {a.strength}. Это то, ради чего с {a.genitive} хорошо иметь дело, и то, что партнёр
            замечает первым.
          </p>
          <p className={styles.text}>
            <strong>Теневая сторона: </strong>
            {a.shadow}. Обычно это оборотная сторона той же силы, а не отдельный недостаток:
            она включается там, где знак перестаёт себя сдерживать.
          </p>
          <p className={styles.note}>
            Дальше на странице — что происходит, когда оба партнёра {a.name}, а в конце ссылки на
            все одиннадцать пар этого знака с остальными.
          </p>
        </section>
      )}

      <div className={styles.card} style={{ display: "flex", flexDirection: "column", gap: 22 }}>
        {/* Раньше здесь стояли два h2 с одними именами знаков — «Лев», «Овен».
            Как заголовки разделов они пустые: не говорят, о чём раздел. */}
        <div>
          <h2 className={styles.h2}>
            {sameSign ? `${a.name}: даты, стихия, управитель` : `${a.name} и ${b.name}: даты, стихии, управители`}
          </h2>
          <div className={styles.grid} style={{ gridTemplateColumns: "1fr 1fr" }}>
            <div>
              <h3 style={{ font: "600 14px var(--font-body)", color: "var(--ink)", margin: "0 0 6px" }}>{a.name}</h3>
              <p style={{ font: "400 13px/1.6 var(--font-body)", color: "var(--ink-soft)", margin: 0 }}>
                {a.dateRange} · Стихия: {ELEMENT_LABEL[a.element]} · Крест: {MODALITY_LABEL[a.modality]} · Управитель: {a.ruler}
              </p>
            </div>
            <div>
              <h3 style={{ font: "600 14px var(--font-body)", color: "var(--ink)", margin: "0 0 6px" }}>{b.name}</h3>
              <p style={{ font: "400 13px/1.6 var(--font-body)", color: "var(--ink-soft)", margin: 0 }}>
                {b.dateRange} · Стихия: {ELEMENT_LABEL[b.element]} · Крест: {MODALITY_LABEL[b.modality]} · Управитель: {b.ruler}
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 style={{ font: "600 15px var(--font-body)", color: "var(--ink)", margin: "0 0 8px" }}>
            Стихии: {ELEMENT_LABEL[a.element]} и {ELEMENT_LABEL[b.element]}
          </h2>
          <p style={{ font: "400 14px/1.75 var(--font-body)", color: "var(--ink-soft)", margin: "0 0 8px" }}>
            <strong style={{ color: "var(--ink)" }}>Конструктивно: </strong>{elements.light}
          </p>
          <p style={{ font: "400 14px/1.75 var(--font-body)", color: "var(--ink-soft)", margin: "0 0 8px" }}>
            <strong style={{ color: "var(--ink)" }}>Тень: </strong>{elements.shadow}
          </p>
          {/* Теория стихий одинакова у всех пар этого сочетания — абзац ниже
              привязывает её к двум конкретным знакам. */}
          <p style={{ font: "400 14px/1.75 var(--font-body)", color: "var(--ink-soft)", margin: 0 }}>
            {elementsInPair(a, b)}
          </p>
        </div>

        <div>
          <h2 style={{ font: "600 15px var(--font-body)", color: "var(--ink)", margin: "0 0 8px" }}>
            Кресты: {MODALITY_LABEL[a.modality]} и {MODALITY_LABEL[b.modality]}
          </h2>
          <p style={{ font: "400 14px/1.75 var(--font-body)", color: "var(--ink-soft)", margin: "0 0 8px" }}>
            <strong style={{ color: "var(--ink)" }}>Конструктивно: </strong>{modalities.light}
          </p>
          <p style={{ font: "400 14px/1.75 var(--font-body)", color: "var(--ink-soft)", margin: "0 0 8px" }}>
            <strong style={{ color: "var(--ink)" }}>Тень: </strong>{modalities.shadow}
          </p>
          <p style={{ font: "400 14px/1.75 var(--font-body)", color: "var(--ink-soft)", margin: 0 }}>
            {modalitiesInPair(a, b)}
          </p>
        </div>

        <p
          style={{
            font: "italic 400 12px/1.6 var(--font-body)",
            color: "var(--ink-faint)",
            margin: 0,
            paddingTop: 10,
            borderTop: "1px solid #f4eef1",
          }}
        >
          Это справочный разбор по классической западной астрологии — знаку Солнца,
          стихии и кресту. Он не заменяет расчёт по 4 системам сервиса, который учитывает
          не только Солнце, но и точную дату (а для двух систем — время и место) рождения.
        </p>
      </div>

      <section className={styles.card} aria-labelledby="aspect-block">
        <h2 id="aspect-block" className={styles.h2}>
          Аспект между знаками: {aspect.name} ({aspect.angle})
        </h2>
        <p className={styles.text}>
          Кроме стихии и креста у двух знаков есть третья характеристика — расстояние между
          ними по кругу зодиака. {sameSign ? `${a.name} и ${a.name} — это` : `${a.name} и ${b.name} разделяет`}{" "}
          {aspect.angle}, такой угол называют «{aspect.name}». Именно он объясняет, почему две
          пары с похожими стихиями ощущаются по-разному.
        </p>
        <p className={styles.text}>
          <strong>Что это даёт: </strong>
          {aspect.light}
        </p>
        <p className={styles.text}>
          <strong>Чем оборачивается: </strong>
          {aspect.shadow}
        </p>
        <p className={styles.text}>{aspectInPair(a, b)}</p>

        <h3 className={styles.h3}>Справочный балл пары: {score.total} из 90</h3>
        <p className={styles.text}>
          По классическим правилам {scoreVerdict(score.total)}. Балл складывается из четырёх
          частей, и мы показываем их полностью — чтобы было видно, из чего он получился:
        </p>
        <ul className={styles.list}>
          {score.parts.map((p) => (
            <li key={p.label} className={styles.listItem}>
              <strong>
                {p.label}: {p.value} из {p.max}
              </strong>{" "}
              — {p.why}
            </li>
          ))}
        </ul>
        <p className={styles.note}>
          Важная оговорка: процентов совместимости в самой астрологии не существует — это наша
          арифметика поверх классических правил, и публикуем мы её именно поэтому. Число
          описывает сочетание двух знаков, а не двух конкретных людей: месяц рождения — один
          параметр из многих.
        </p>
      </section>

      {rulers && (
        <section className={styles.card}>
          <h2 className={styles.h2}>{rulers.heading}</h2>
          <p className={styles.text}>{rulers.intro}</p>
          <p className={styles.text}>
            <strong>Что каждый приносит: </strong>
            {rulers.light}
          </p>
          <p className={styles.text}>
            <strong>Чем это оплачивается: </strong>
            {rulers.shadow}
          </p>
        </section>
      )}

      {spheres.map((s) => (
        <section key={s.heading} className={styles.card}>
          <h2 className={styles.h2}>{s.heading}</h2>
          <p className={styles.text}>{s.light}</p>
          <p className={styles.text}>{s.shadow}</p>
        </section>
      ))}

      <div className={styles.card}>
        <HubFaq
          items={zodiacPairFaq(a, b)}
          /* Через «про» нужен винительный, а он у знаков разный: «про Льва»,
             но «про Весы». Двоеточие снимает падеж вовсе. */
          title={sameSign ? `Частые вопросы: пара ${a.name} и ${a.name}` : `Частые вопросы: ${a.name} и ${b.name}`}
        />
      </div>

      <RelatedPages
        headingId="zodiac-related"
        title={sameSign ? `Совместимость ${a.genitive} с другими знаками` : "Что почитать рядом"}
        lede={
          sameSign
            ? `Как ${a.name} ${verb(a, "сходится", "сходятся")} с каждым из остальных одиннадцати знаков — со стихиями, крестами и теневыми сторонами каждой пары.`
            : `Разборы двух этих знаков по отдельности и их пары с другими знаками той же стихии.`
        }
        links={relatedLinks(a, b)}
      />

      <CalcCta
        title="Узнай настоящую совместимость твоей пары"
        text="Знак зодиака — это только Солнце. Полный расчёт по Матрице судьбы, Нумерологии, Дизайну человека и Джйотиш учитывает гораздо больше — введи даты рождения обоих."
      />
    </ContentShell>
  );
}
