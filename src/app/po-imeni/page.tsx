import type { Metadata } from "next";
import Link from "next/link";
import { ContentShell } from "@/components/content/ContentShell";
import { NameForm } from "@/components/po-imeni/NameForm";
import { allNameNumberArticles } from "@/lib/content/articles";
import { PILOT_MALE_NAMES, PILOT_FEMALE_NAMES, nameSlug } from "@/lib/data/name-popularity";
import styles from "@/components/content/content.module.css";

const ORDER = [1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 22, 33];

export const metadata: Metadata = {
  alternates: { canonical: "/po-imeni/" },
  title: "Совместимость мужчины и женщины по имени",
  description:
    "Число Имени, Числа Души и Личности по кириллической таблице Пифагора — как имя показывает манеру самоподачи в паре. Расчёт без ввода даты рождения.",
};

export default function ByNameHubPage() {
  const articles = allNameNumberArticles();

  return (
    <ContentShell breadcrumbs={[{ label: "Главная", href: "/" }, { label: "По имени" }]}>
      <div className={styles.eyebrow}>Калькулятор</div>
      <h1 className={styles.h1}>Совместимость мужчины и женщины по имени</h1>
      <p className={styles.lede}>
        Число жизненного пути показывает жизненную задачу; Число Имени — совсем другое: то,
        как ты заявляешь о себе миру и что в тебе считывает партнёр в первую очередь. Мы
        считаем его по кириллической таблице Пифагора (позиция буквы по модулю 9) — методу,
        которым пользуется большинство русскоязычных калькуляторов имени, честно
        задокументированному как расчётная адаптация, а не подтверждённая Cheiro техника.
      </p>

      <div className={styles.card}>
        <NameForm />
      </div>

      <h2 style={{ font: "600 15px var(--font-body)", color: "var(--ink)", margin: 0 }}>
        12 чисел имени
      </h2>
      <div className={styles.grid}>
        {ORDER.map((n) => {
          const article = articles[String(n)];
          if (!article) return null;
          const name = article.title.match(/«([^»]+)»/)?.[1] ?? article.title;
          return (
            <Link key={n} href={`/po-imeni/chislo-imeni/${n}/`} className={styles.gridLink}>
              <span className={styles.gridLinkNum}>{n}</span>
              <span className={styles.gridLinkTitle}>{name}</span>
              <span className={styles.gridLinkText}>{article.capsule.slice(0, 70)}…</span>
            </Link>
          );
        })}
      </div>

      <div className={styles.sourceNote}>
        Число Имени — не замена{" "}
        <Link href="/numerologiya-sovmestimost/" style={{ color: "var(--accent)" }}>
          Числу жизненного пути и психоматрице
        </Link>
        , а дополнение к ним внутри той же нумерологии. Полный разбор пары по всем 4 системам
        сервиса считаем по дате рождения на{" "}
        <Link href="/" style={{ color: "var(--accent)" }}>
          главной странице
        </Link>
        .
      </div>

      <h2 style={{ font: "600 15px var(--font-body)", color: "var(--ink)", margin: 0 }}>
        Готовые расчёты популярных пар имён
      </h2>
      <div className={styles.grid}>
        {PILOT_MALE_NAMES.flatMap((m) =>
          PILOT_FEMALE_NAMES.map((f) => (
            <Link
              key={`${m}-${f}`}
              href={`/po-imeni/${nameSlug(m)}-i-${nameSlug(f)}/`}
              className={styles.gridLink}
            >
              <span className={styles.gridLinkTitle}>{m} и {f}</span>
              <span className={styles.gridLinkText}>Совместимость имён — реальный расчёт</span>
            </Link>
          ))
        )}
      </div>
    </ContentShell>
  );
}
