import type { Metadata } from "next";
import Link from "next/link";
import { ContentShell, CalcCta } from "@/components/content/ContentShell";
import { ZODIAC_SIGNS, ELEMENT_LABEL, MODALITY_LABEL } from "@/lib/data/zodiac";
import styles from "@/components/content/content.module.css";

export const metadata: Metadata = {
  alternates: { canonical: "/znaki-zodiaka/" },
  title: "Совместимость знаков зодиака: таблица и разбор пар",
  description:
    "Классическая совместимость 12 знаков зодиака по стихиям и крестам — светлые и теневые стороны каждой пары. Справочный раздел, в конце — ссылка на реальный расчёт по 4 системам.",
};

export default function ZodiacHubPage() {
  return (
    <ContentShell breadcrumbs={[{ label: "Главная", href: "/" }, { label: "Знаки зодиака" }]}>
      <div className={styles.eyebrow}>Знаки зодиака</div>
      <h1 className={styles.h1}>Совместимость знаков зодиака</h1>
      <p className={styles.lede}>
        Классическая западная астрология объясняет совместимость через стихию (огонь, земля,
        воздух, вода) и крест — кардинальный, фиксированный, мутабельный. Это справочный
        раздел: здесь нет расчёта, только устоявшаяся логика традиции по знаку Солнца — и
        честное напоминание, что настоящая совместимость пары определяется куда большим,
        чем один только знак.
      </p>

      <CalcCta
        title="Настоящий расчёт учитывает больше, чем знак Солнца"
        text="Матрица судьбы, Нумерология, Дизайн человека и Джйотиш — все четыре системы сервиса считают по точной дате (а два из них — и по времени) рождения, а не только по месяцу."
      />

      <h2 style={{ font: "600 15px var(--font-body)", color: "var(--ink)", margin: 0 }}>
        12 знаков
      </h2>
      <div className={styles.grid}>
        {ZODIAC_SIGNS.map((s) => (
          <div key={s.key} className={styles.gridLink} style={{ cursor: "default" }}>
            <span className={styles.gridLinkTitle}>{s.name}</span>
            <span className={styles.gridLinkText}>
              {s.dateRange} · {ELEMENT_LABEL[s.element]}, {MODALITY_LABEL[s.modality]}
            </span>
          </div>
        ))}
      </div>

      <h2 style={{ font: "600 15px var(--font-body)", color: "var(--ink)", margin: 0 }}>
        Совместимость по парам
      </h2>
      {ZODIAC_SIGNS.map((s1) => (
        <div key={s1.key}>
          <h3 style={{ font: "600 13px var(--font-body)", color: "var(--ink-soft)", margin: "0 0 8px" }}>
            {s1.name}
          </h3>
          <div className={styles.grid}>
            {ZODIAC_SIGNS.map((s2) => {
              const [a, b] = s1.name <= s2.name ? [s1, s2] : [s2, s1];
              const href =
                a.key === b.key ? `/znaki-zodiaka/${a.slug}/` : `/znaki-zodiaka/${a.slug}-${b.slug}/`;
              return (
                <Link key={s2.key} href={href} className={styles.gridLink}>
                  <span className={styles.gridLinkTitle}>
                    {s1.name} и {s2.name}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </ContentShell>
  );
}
