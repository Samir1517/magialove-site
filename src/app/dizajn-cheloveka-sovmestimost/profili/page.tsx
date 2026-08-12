import type { Metadata } from "next";
import Link from "next/link";
import { ContentShell, CalcCta } from "@/components/content/ContentShell";
import { getHDProfileArticle, profileSlug } from "@/lib/content/articles";
import styles from "@/components/content/content.module.css";

export const metadata: Metadata = {
  alternates: { canonical: "/dizajn-cheloveka-sovmestimost/profili/" },
  title: "12 профилей Дизайна человека: значение профиля в совместимости пары",
  description:
    "Все 12 профилей Дизайна человека и их роль в паре: что означает каждая из шести линий, чем сознательная линия отличается от бессознательной и как профиль партнёра проявляется в отношениях.",
};

/** Канонический порядок 12 профилей: по первой линии, внутри — по второй. */
const PROFILES = [
  "1/3",
  "1/4",
  "2/4",
  "2/5",
  "3/5",
  "3/6",
  "4/6",
  "4/1",
  "5/1",
  "5/2",
  "6/2",
  "6/3",
];

/** Шесть линий гексаграммы — общий словарь, из которого собран любой профиль. */
const LINES = [
  { n: 1, name: "Исследователь", text: "нужна прочная база: сначала разобраться, потом действовать" },
  { n: 2, name: "Отшельник", text: "природный дар, который раскрывается в уединении" },
  { n: 3, name: "Экспериментатор", text: "учится пробами: то, что не сработало, — это знание" },
  { n: 4, name: "Оппортунист", text: "всё приходит через близкий круг и личные связи" },
  { n: 5, name: "Еретик", text: "на него проецируют роль спасителя — и ждут решения" },
  { n: 6, name: "Ролевая модель", text: "три фазы жизни: опыт, наблюдение, мудрость" },
];

function shortName(title: string): string {
  return title.match(/«([^»]+)»/)?.[1] ?? "";
}

export default function ProfilesHubPage() {
  return (
    <ContentShell
      breadcrumbs={[
        { label: "Главная", href: "/" },
        { label: "Дизайн человека", href: "/dizajn-cheloveka-sovmestimost/" },
        { label: "12 профилей" },
      ]}
    >
      <div className={styles.eyebrow}>Дизайн человека</div>
      <h1 className={styles.h1}>12 профилей: как профиль проявляется в паре</h1>
      <p className={styles.lede}>
        Профиль — это две цифры, а не одна роль. Первая описывает то, как человек осознаёт
        сам себя, вторая — то, как ведёт себя его тело, минуя осознание. Поэтому в паре
        почти всегда возникает одно и то же недоразумение: партнёр описывает вторую линию,
        которую человек в себе не видит, а человек защищает первую, знакомую и понятную.
        Разобравшись, где чья линия, вы перестаёте спорить о том, кто прав.
      </p>

      <CalcCta
        title="Узнай профили обоих партнёров"
        text="Профиль считается по положению Солнца в момент рождения — введи даты и время рождения обоих, и увидишь профиль каждого в общем разборе пары."
        href="/dizajn-cheloveka-sovmestimost/"
      />

      <div className={styles.grid}>
        {PROFILES.map((p) => {
          const article = getHDProfileArticle(p);
          if (!article) return null;
          return (
            <Link
              key={p}
              href={`/dizajn-cheloveka-sovmestimost/profili/${profileSlug(p)}/`}
              className={styles.gridLink}
            >
              <span className={styles.gridLinkNum}>{p}</span>
              <span className={styles.gridLinkTitle}>{shortName(article.title)}</span>
              <span className={styles.gridLinkText}>{article.capsule.slice(0, 80)}…</span>
            </Link>
          );
        })}
      </div>

      <div className={styles.card}>
        <h2 className={styles.ctaTitle}>Шесть линий, из которых собраны все профили</h2>
        <p className={styles.ctaText}>
          Профилей двенадцать, а линий всего шесть — каждая встречается и как первая
          (осознаваемая), и как вторая (видимая со стороны). Если знаешь, что делает
          каждая линия, любой незнакомый профиль читается сам собой.
        </p>
        <div className={styles.grid}>
          {LINES.map((l) => (
            <div key={l.n} className={styles.gridLink}>
              <span className={styles.gridLinkNum}>{l.n}</span>
              <span className={styles.gridLinkTitle}>{l.name}</span>
              <span className={styles.gridLinkText}>{l.text}</span>
            </div>
          ))}
        </div>
      </div>

      <p className={styles.sourceNote}>
        Профиль в первоисточнике — линия Солнца в Личности (сознательная сторона) и линия
        Солнца в Дизайне (бессознательная, рассчитанная на 88 солнечных градусов до
        рождения). Термины и структура — по Ра Уру Ху и Линде Баннелл, «The Definitive Book
        of Human Design» (IHDS, 2011). Разбор профиля — инструмент разговора и
        саморефлексии, а не приговор паре.
      </p>
    </ContentShell>
  );
}
