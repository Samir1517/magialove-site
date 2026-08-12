import type { Metadata } from "next";
import Link from "next/link";
import { ContentShell } from "@/components/content/ContentShell";
import { DateTimeForm } from "@/components/system-calc/DateTimeForm";
import styles from "@/components/content/content.module.css";

export const metadata: Metadata = {
  title: "Совместимость по Джйотиш (ведическая астрология): расчёт Гуна-милан",
  description:
    "Ведическая астрология считает совместимость пары по Аштакуте Гуна-милан (36 баллов, 8 кут) и трём дошам — Нади, Бхакут, Мангал. По Брихат Парашара Хора Шастре.",
};

export default function JyotishHubPage() {
  return (
    <ContentShell breadcrumbs={[{ label: "Главная", href: "/" }, { label: "Джйотиш" }]}>
      <div className={styles.eyebrow}>Калькулятор</div>
      <h1 className={styles.h1}>Совместимость по Джйотиш</h1>
      <p className={styles.lede}>
        Джйотиш — ведическая астрология, самый методологически строгий из четырёх подходов
        сервиса. Классический метод Аштакута Гуна-милан сравнивает сидерическое положение Луны
        обоих партнёров по восьми показателям (до 36 баллов) и проверяет три традиционных
        отягощения — доши. Расчёт требует точных даты, времени и часового пояса рождения.
      </p>

      <DateTimeForm targetPath="/dzhyotish-sovmestimost/rezultat" />

      <h2 style={{ font: "600 15px var(--font-body)", color: "var(--ink)", margin: 0 }}>
        Ведическая астрология совместимости: из чего состоит расчёт
      </h2>
      <div className={styles.grid}>
        <Link href="/dzhyotish-sovmestimost/8-kut/" className={styles.gridLink}>
          <span className={styles.gridLinkTitle}>8 кут Аштакуты →</span>
          <span className={styles.gridLinkText}>Варна, Вашья, Тара, Йони, Граха Майтри, Гана, Бхакут, Нади</span>
        </Link>
        <Link href="/dzhyotish-sovmestimost/doshi/" className={styles.gridLink}>
          <span className={styles.gridLinkTitle}>Доши →</span>
          <span className={styles.gridLinkText}>Нади, Бхакут, Мангал доша — без фатализма</span>
        </Link>
        <Link href="/dzhyotish-sovmestimost/nakshatry/" className={styles.gridLink}>
          <span className={styles.gridLinkTitle}>27 накшатр →</span>
          <span className={styles.gridLinkText}>Лунные дома ведической астрологии: божество, символ, гана</span>
        </Link>
        <Link href="/dzhyotish-sovmestimost/karta/" className={styles.gridLink}>
          <span className={styles.gridLinkTitle}>Карта раздела →</span>
          <span className={styles.gridLinkText}>Все страницы Джйотиш на сервисе в одном месте</span>
        </Link>
      </div>

      <div className={styles.sourceNote}>
        Не знаешь точное время рождения? Аштакуту без него не посчитать — Луна проходит
        накшатру примерно за сутки. Но{" "}
        <Link href="/po-date-rozhdeniya/" style={{ color: "var(--accent)" }}>
          расчёт по дате рождения
        </Link>{" "}
        — Матрица судьбы и Нумерология — работает от одних дат, без времени и места.
      </div>
    </ContentShell>
  );
}
