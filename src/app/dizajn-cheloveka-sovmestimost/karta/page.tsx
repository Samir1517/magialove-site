import type { Metadata } from "next";
import Link from "next/link";
import { ContentShell } from "@/components/content/ContentShell";
import { CHANNELS } from "@/lib/engines/human-design-tables";
import styles from "@/components/content/content.module.css";

export const metadata: Metadata = {
  title: "Карта Дизайна человека: все страницы совместимости по системе",
  description:
    "Полный список страниц раздела «Дизайн человека» — калькулятор композита, 5 типов, 7 авторитетов, каналы связи и все 36 каналов.",
};

export default function HumanDesignKartaPage() {
  return (
    <ContentShell
      breadcrumbs={[
        { label: "Главная", href: "/" },
        { label: "Дизайн человека", href: "/dizajn-cheloveka-sovmestimost/" },
        { label: "Карта раздела" },
      ]}
    >
      <div className={styles.eyebrow}>Дизайн человека</div>
      <h1 className={styles.h1}>Карта раздела «Дизайн человека»</h1>
      <p className={styles.lede}>
        Все страницы совместимости по Дизайну человека: калькулятор композита пары, 5 типов,
        7 авторитетов, 4 типа связи каналов и разбор каждого из 36 каналов композита.
      </p>

      <h2 style={{ font: "600 15px var(--font-body)", color: "var(--ink)", margin: 0 }}>
        Основные страницы
      </h2>
      <div className={styles.grid}>
        <Link href="/dizajn-cheloveka-sovmestimost/" className={styles.gridLink}>
          <span className={styles.gridLinkTitle}>Совместимость по Дизайну человека →</span>
          <span className={styles.gridLinkText}>Калькулятор: композит пары по точному времени рождения</span>
        </Link>
        <Link href="/dizajn-cheloveka-sovmestimost/tipy/" className={styles.gridLink}>
          <span className={styles.gridLinkTitle}>5 типов в паре →</span>
          <span className={styles.gridLinkText}>Генератор, МГ, Проектор, Манифестор, Рефлектор</span>
        </Link>
        <Link href="/dizajn-cheloveka-sovmestimost/avtoritety/" className={styles.gridLink}>
          <span className={styles.gridLinkTitle}>7 авторитетов →</span>
          <span className={styles.gridLinkText}>Ритм принятия решений каждого партнёра</span>
        </Link>
        <Link href="/dizajn-cheloveka-sovmestimost/kanaly-svyazi/" className={styles.gridLink}>
          <span className={styles.gridLinkTitle}>Каналы связи →</span>
          <span className={styles.gridLinkText}>Электромагнитная, компаньонство, доминирование, компромисс</span>
        </Link>
      </div>

      <h2 style={{ font: "600 15px var(--font-body)", color: "var(--ink)", margin: 0 }}>
        Дополнительные страницы: 36 каналов композита
      </h2>
      <div className={styles.grid}>
        {CHANNELS.map((ch) => (
          <Link key={ch.key} href={`/dizajn-cheloveka-sovmestimost/kanaly/${ch.key}/`} className={styles.gridLink}>
            <span className={styles.gridLinkTitle}>{ch.name}</span>
            <span className={styles.gridLinkText}>Канал {ch.key} в композите пары</span>
          </Link>
        ))}
      </div>
    </ContentShell>
  );
}
