import type { Metadata } from "next";
import Link from "next/link";
import { ContentShell, CalcCta } from "@/components/content/ContentShell";
import { HubFaq } from "@/components/content/HubDepth";
import { getJyotishNakshatraArticle } from "@/lib/content/articles";
import {
  NAKSHATRA_FACTS,
  GANA_MEANING,
  NADI_MEANING,
  allNakshatraRows,
  type Gana,
} from "@/lib/content/nakshatra-facts";
import styles from "@/components/content/content.module.css";

const NAKSHATRAS = allNakshatraRows();

export const metadata: Metadata = {
  alternates: { canonical: "/dzhyotish-sovmestimost/nakshatry/" },
  title: "27 накшатр Луны: значение для совместимости пары",
  description:
    "Все 27 накшатр: управитель, божество, символ, гана и йони каждой. Как лунная стоянка влияет на совместимость и чем она отличается от знака зодиака.",
};

/** Обрезка капсулы по границе слова — «…» посреди слова читается как сбой. */
function short(text: string, limit = 72): string {
  const clean = text.replace(/\*\*/g, "");
  if (clean.length <= limit) return clean;
  const cut = clean.slice(0, limit);
  const lastSpace = cut.lastIndexOf(" ");
  return `${cut.slice(0, lastSpace > 40 ? lastSpace : limit)}…`;
}

const GANA_ORDER: Gana[] = ["Дева", "Манушья", "Ракшаса"];
const NADI_ORDER = ["Ади", "Мадхья", "Антья"];

const FAQ = [
  {
    q: "Чем накшатра отличается от знака зодиака?",
    a: "Знак — это отрезок круга в 30 градусов, накшатра — в 13 градусов 20 минут, то есть более мелкое деление: их 27 против 12. Знак считают по Солнцу, накшатру — по Луне, и определяется она моментом рождения с точностью до часов. Поэтому двое одного знака часто оказываются в разных накшатрах, и в совместимости по Джйотиш весит именно накшатра.",
  },
  {
    q: "Как узнать свою накшатру?",
    a: "Нужны дата, точное время и место рождения: накшатра определяется положением Луны, а Луна проходит одну стоянку примерно за сутки и меняет их быстро. По одной лишь дате без времени точный ответ не получится — на границе стоянок ошибка в пару часов даёт другую накшатру. Наш расчёт по Джйотиш определяет её автоматически.",
  },
  {
    q: "Какие накшатры считаются несовместимыми?",
    a: "Отдельных «несовместимых» накшатр в традиции нет — оценивается сочетание. Больше всего баллов снимает совпадение нади у обоих партнёров: это называется нади-доша, и стоит она 8 баллов из 36. Логика в том, что партнёры одного склада остаются без того, кто уравновешивает. Второй по весу конфликт — божественная гана против демонической: слишком разная манера вести себя в споре.",
  },
  {
    q: "Сколько баллов из 36 дают накшатры?",
    a: "Все 36 баллов Гуна-милана считаются от накшатр обоих партнёров — это восемь параметров, называемых кутами, и вес у них разный: нади 8, бхакут 7, гана 6, граха-майтри 5, йони 4, тара 3, вашья 2, варна 1. Союз обычно считают подходящим от 18 баллов, но традиция смотрит и на то, какие именно куты просели: 20 баллов с нади-дошей читаются хуже, чем 18 ровных.",
  },
];

export default function NakshatrasHubPage() {
  return (
    <ContentShell
      breadcrumbs={[
        { label: "Главная", href: "/" },
        { label: "Джйотиш", href: "/dzhyotish-sovmestimost/" },
        { label: "27 накшатр" },
      ]}
    >
      <div className={styles.eyebrow}>Джйотиш</div>
      <h1 className={styles.h1}>27 накшатр: лунные дома в совместимости пары</h1>
      <p className={styles.lede}>
        Накшатра — участок неба, в котором стояла Луна в момент рождения. Это более древний и
        более точный слой Джйотиш, чем знак зодиака: стоянок 27 против 12 знаков, и меняются
        они примерно раз в сутки. У каждой есть управляющее божество, символ, планета и
        характер — со светлой и теневой сторонами сразу, как и всё остальное на этом сервисе.
      </p>

      <CalcCta
        title="Узнай накшатру твоей пары"
        text="Введи точное время и место рождения обоих — расчёт требует момента, а не только даты."
        href="/dzhyotish-sovmestimost/"
      />

      <div className={styles.card}>
        <h2 className={styles.h2}>Все 27 лунных стоянок</h2>
        <p className={styles.text}>
          Под каждой накшатрой — её планета-управитель и гана, то есть темперамент. Нажмите,
          чтобы прочитать разбор: символ, божество, четыре пады, йони и что эта стоянка даёт
          паре.
        </p>
        <div className={styles.grid}>
          {NAKSHATRAS.map((n) => {
            const article = getJyotishNakshatraArticle(n.i);
            const f = NAKSHATRA_FACTS[n.i];
            if (!article) return null;
            return (
              <Link
                key={n.i}
                href={`/dzhyotish-sovmestimost/nakshatry/${n.i}/`}
                className={styles.gridLink}
              >
                <span className={styles.gridLinkNum}>{n.i}</span>
                <span className={styles.gridLinkTitle}>{n.name}</span>
                <span className={styles.gridLinkText}>
                  {f ? `${f.planet} · гана ${f.gana} · ${n.rashi}` : n.rashi}
                </span>
                <span className={styles.gridLinkText}>{short(article.capsule)}</span>
              </Link>
            );
          })}
        </div>
      </div>

      <div className={styles.card}>
        <h2 className={styles.h2}>Три ганы: как накшатра ведёт себя в ссоре</h2>
        <p className={styles.text}>
          Гана — темперамент накшатры, и это второй по весу параметр после нади: до 6 баллов из
          36. Групп три, ровно по девять стоянок в каждой. Труднее всего традиция считает пару
          «божественная плюс демоническая»: один сглаживает, второй говорит прямо, и каждый
          принимает манеру другого на свой счёт.
        </p>
        {GANA_ORDER.map((g) => (
          <div key={g} style={{ marginTop: 14 }}>
            <h3 className={styles.h3}>
              {g} гана — {GANA_MEANING[g].label}
            </h3>
            <p className={styles.text}>{GANA_MEANING[g].text}</p>
            <p className={styles.note}>
              {NAKSHATRAS.filter((n) => NAKSHATRA_FACTS[n.i]?.gana === g).map((n, i) => (
                <span key={n.i}>
                  {i > 0 && ", "}
                  <Link href={`/dzhyotish-sovmestimost/nakshatry/${n.i}/`}>{n.name}</Link>
                </span>
              ))}
            </p>
          </div>
        ))}
      </div>

      <div className={styles.card}>
        <h2 className={styles.h2}>Три нади: почему совпадение здесь считается минусом</h2>
        <p className={styles.text}>
          Нади — самый весомый параметр Гуна-милана, 8 баллов из 36. И единственный, где
          совпадение партнёров работает против них: одинаковая нади у обоих даёт нади-дошу.
          Смысл в том, что двое одного склада усиливают общие сильные стороны, но и общие
          слабые — уравновесить некому.
        </p>
        {NADI_ORDER.map((nd) => (
          <div key={nd} style={{ marginTop: 14 }}>
            <h3 className={styles.h3}>Нади {nd}</h3>
            <p className={styles.text}>{NADI_MEANING[nd]}</p>
            <p className={styles.note}>
              {NAKSHATRAS.filter((n) => n.nadi === nd).map((n, i) => (
                <span key={n.i}>
                  {i > 0 && ", "}
                  <Link href={`/dzhyotish-sovmestimost/nakshatry/${n.i}/`}>{n.name}</Link>
                </span>
              ))}
            </p>
          </div>
        ))}
      </div>

      <div className={styles.card}>
        <HubFaq items={FAQ} title="Частые вопросы про накшатры" />
      </div>
    </ContentShell>
  );
}
