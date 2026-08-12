import type { Metadata } from "next";
import Link from "next/link";
import { ContentShell } from "@/components/content/ContentShell";
import { Expectations, HubFaq } from "@/components/content/HubDepth";
import { HeroForm } from "@/components/landing/HeroForm";
import { allLifePathArticles } from "@/lib/content/articles";
import styles from "@/components/content/content.module.css";

const ORDER = [1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 22, 33];

export const metadata: Metadata = {
  title: "Совместимость по нумерологии: расчёт по числам партнёров",
  description:
    "Число жизненного пути каждого партнёра плюс Квадрат Пифагора (психоматрица) — 12 чисел и 8 линий совместимости пары. По Cheiro's Book of Numbers и современной психоматрице.",
};

export default function NumerologyHubPage() {
  const articles = allLifePathArticles();

  return (
    <ContentShell
      breadcrumbs={[
        { label: "Главная", href: "/" },
        { label: "Нумерология" },
      ]}
    >
      <Link href="/po-date-rozhdeniya/" className={styles.eyebrow}>
        По дате рождения
      </Link>
      <h1 className={styles.h1}>Совместимость по нумерологии</h1>
      <p className={styles.lede}>
        Число жизненного пути — западная пифагорейско-халдейская традиция, кодифицированная
        Cheiro (<em>Cheiro&apos;s Book of Numbers</em>, 1926). Оно раскрывает суть человека
        в отношениях; в паре два числа складываются в конкретную динамику. Дополняет картину
        Квадрат Пифагора (психоматрица) — 8 линий совпадений и различий по цифрам полной даты
        рождения.
      </p>

      <div className={styles.card}>
        <HeroForm targetPath="/numerologiya-sovmestimost/rezultat" />
      </div>

      <Expectations
        title="Что ты увидишь в разборе"
        items={[
          {
            title: "Два числа жизненного пути",
            text: "Твоё и его — с разбором того, что происходит именно при их встрече. Одно и то же число рядом с разными числами ведёт себя по-разному, и разбор считает пару, а не два портрета подряд.",
          },
          {
            title: "Квадрат Пифагора на двоих",
            text: "Цветная сетка, где сразу видно, каких цифр у каждого много, каких нет вовсе, и где вы закрываете пробелы друг друга, а где давите в одну и ту же точку.",
          },
          {
            title: "Восемь линий совместимости",
            text: "Характер и воля, семья, быт, талант, самооценка, целеустремлённость, темперамент, духовность — по каждой видно, вы совпадаете, дополняете друг друга или тянете в разные стороны.",
          },
        ]}
      />

      <h2 className={styles.h2}>12 чисел жизненного пути</h2>
      <div className={styles.grid}>
        {ORDER.map((n) => {
          const article = articles[String(n)];
          if (!article) return null;
          const name = article.title.match(/«([^»]+)»/)?.[1] ?? article.title;
          return (
            <Link
              key={n}
              href={`/numerologiya-sovmestimost/chislo-zhiznennogo-puti/${n}/`}
              className={styles.gridLink}
            >
              <span className={styles.gridLinkNum}>{n}</span>
              <span className={styles.gridLinkTitle}>{name}</span>
              <span className={styles.gridLinkText}>{article.capsule.slice(0, 70)}…</span>
            </Link>
          );
        })}
      </div>

      <div className={styles.grid}>
        <Link href="/numerologiya-sovmestimost/psihomatritsa/" className={styles.gridLink}>
          <span className={styles.gridLinkTitle}>Психоматрица (Квадрат Пифагора) →</span>
          <span className={styles.gridLinkText}>8 линий совпадений и различий партнёров по цифрам даты рождения</span>
        </Link>
        <Link href="/po-imeni/" className={styles.gridLink}>
          <span className={styles.gridLinkTitle}>Число Имени →</span>
          <span className={styles.gridLinkText}>Та же нумерология, но по имени партнёров, а не по дате рождения</span>
        </Link>
        <Link href="/numerologiya-sovmestimost/karta/" className={styles.gridLink}>
          <span className={styles.gridLinkTitle}>Карта раздела →</span>
          <span className={styles.gridLinkText}>Все страницы Нумерологии на сервисе в одном месте</span>
        </Link>
        <Link href="/po-date-rozhdeniya/" className={styles.gridLink}>
          <span className={styles.gridLinkTitle}>Расчёт по дате рождения →</span>
          <span className={styles.gridLinkText}>
            Две даты — и сразу Нумерология с Матрицей судьбы, а со временем рождения ещё
            Дизайн человека и Джйотиш
          </span>
        </Link>
      </div>

      <HubFaq
        items={[
          {
            q: "Чем число жизненного пути отличается от знака зодиака?",
            a: "Знак зодиака берёт положение Солнца в момент рождения — это астрономия. Число жизненного пути берёт саму запись даты и сводит её к одной цифре — это арифметика. Поэтому знаков двенадцать, а чисел с мастер-числами тоже двенадцать, но совпадение чисто внешнее: люди одного знака могут иметь разные числа пути и наоборот. Нумерология описывает не темперамент, а сквозной сценарий — то, как человек раз за разом входит в отношения и что в них ищет.",
          },
          {
            q: "Какую дату вводить, если в документах она указана неверно?",
            a: "Ту, в которую ты действительно родилась. Нумерология работает с фактической датой рождения, а не с паспортной записью: если между ними расхождение, паспорт покажет чужой сценарий. Со временем то же правило — важен момент, а не то, что успели записать.",
          },
          {
            q: "Бывают ли несовместимые числа?",
            a: "Нет, и мы намеренно не пользуемся этим словом. Есть пары чисел, где притяжение сильное и мгновенное, и есть пары, где сближение идёт медленнее, потому что двое устроены по-разному. Второе не хуже первого: такие союзы дольше разгоняются и обычно устойчивее, потому что построены на договорённостях, а не на совпадении по умолчанию.",
          },
          {
            q: "Зачем ещё Квадрат Пифагора, если есть число пути?",
            a: "Число пути — это один вывод из всей даты, свёрнутый до цифры; много информации при этом теряется. Квадрат Пифагора использует все цифры даты и показывает не итог, а распределение: где у человека густо, где пусто. В паре именно это интереснее всего — пустая ячейка одного часто закрыта у второго, и наоборот, а две «густые» ячейки в одном месте дают ту самую точку, где вы бьётесь лбами.",
          },
        ]}
      />
    </ContentShell>
  );
}
