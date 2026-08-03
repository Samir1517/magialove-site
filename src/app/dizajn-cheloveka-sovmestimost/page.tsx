import type { Metadata } from "next";
import Link from "next/link";
import { ContentShell } from "@/components/content/ContentShell";
import { DateTimeForm } from "@/components/system-calc/DateTimeForm";
import styles from "@/components/content/content.module.css";

export const metadata: Metadata = {
  title: "Совместимость по Дизайну человека: расчёт композита",
  description:
    "Композит пары в Дизайне человека — объединение каналов двух людей, включая электромагнитные. Connection Theme, типы, авторитеты и каналы связи. По Ра Уру Ху и Линде Баннелл.",
};

export default function HumanDesignHubPage() {
  return (
    <ContentShell breadcrumbs={[{ label: "Главная", href: "/" }, { label: "Дизайн человека" }]}>
      <div className={styles.eyebrow}>Калькулятор</div>
      <h1 className={styles.h1}>Совместимость по Дизайну человека</h1>
      <p className={styles.lede}>
        Дизайн человека считает не сходство характеров, а композит — третью карту, которая
        появляется при наложении каналов двух людей (включая электромагнитные, которых нет
        ни у кого по отдельности). Ключевая метрика композита — Connection Theme: сколько из
        девяти центров пары определены, а сколько остаются открытыми внешнему миру. Для
        расчёта нужно точное время рождения обоих — Луна и планеты считаются на момент,
        а не на дату.
      </p>

      <DateTimeForm targetPath="/dizajn-cheloveka-sovmestimost/rezultat" />

      <div className={styles.grid}>
        <Link href="/dizajn-cheloveka-sovmestimost/tipy/" className={styles.gridLink}>
          <span className={styles.gridLinkTitle}>5 типов →</span>
          <span className={styles.gridLinkText}>Генератор, МГ, Проектор, Манифестор, Рефлектор в паре</span>
        </Link>
        <Link href="/dizajn-cheloveka-sovmestimost/avtoritety/" className={styles.gridLink}>
          <span className={styles.gridLinkTitle}>7 авторитетов →</span>
          <span className={styles.gridLinkText}>Ритм принятия решений каждого партнёра</span>
        </Link>
        <Link href="/dizajn-cheloveka-sovmestimost/kanaly-svyazi/" className={styles.gridLink}>
          <span className={styles.gridLinkTitle}>Каналы связи →</span>
          <span className={styles.gridLinkText}>Электромагнитная, компаньонство, доминирование, компромисс</span>
        </Link>
        <Link href="/dizajn-cheloveka-sovmestimost/karta/" className={styles.gridLink}>
          <span className={styles.gridLinkTitle}>Карта раздела →</span>
          <span className={styles.gridLinkText}>Все страницы Дизайна человека на сервисе в одном месте</span>
        </Link>
      </div>
    </ContentShell>
  );
}
