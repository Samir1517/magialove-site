import type { Metadata } from "next";
import Link from "next/link";
import { ContentShell } from "@/components/content/ContentShell";
import { HeroForm } from "@/components/landing/HeroForm";
import styles from "@/components/content/content.module.css";

export const metadata: Metadata = {
  title: "Совместимость мужчины и женщины по дате рождения",
  description:
    "Расчёт совместимости по дате рождения сразу по двум системам — Матрице судьбы и Нумерологии. Бесплатно, без регистрации, без ввода имени.",
};

export default function ByDateHubPage() {
  return (
    <ContentShell breadcrumbs={[{ label: "Главная", href: "/" }, { label: "По дате рождения" }]}>
      <div className={styles.eyebrow}>Калькулятор</div>
      <h1 className={styles.h1}>Совместимость мужчины и женщины по дате рождения</h1>
      <p className={styles.lede}>
        Введи обе даты рождения — и сразу получи расчёт по двум системам, которым для
        точного результата не нужны ни время, ни место рождения: Матрице судьбы и Нумерологии.
        Если позже добавишь точное время — откроются ещё Дизайн человека и Джйотиш.
      </p>

      <div className={styles.card}>
        <HeroForm />
      </div>

      <div className={styles.grid}>
        <Link href="/po-date-rozhdeniya/matrica-sudby-sovmestimost/" className={styles.gridLink}>
          <span className={styles.gridLinkTitle}>Матрица судьбы →</span>
          <span className={styles.gridLinkText}>22 аркана, 5 зон союза, свет и тень каждого качества</span>
        </Link>
        <Link href="/po-date-rozhdeniya/numerologiya-sovmestimost/" className={styles.gridLink}>
          <span className={styles.gridLinkTitle}>Нумерология →</span>
          <span className={styles.gridLinkText}>Число жизненного пути и Квадрат Пифагора твоей пары</span>
        </Link>
      </div>
    </ContentShell>
  );
}
