import type { Metadata } from "next";
import Link from "next/link";
import { ContentShell, CalcCta } from "@/components/content/ContentShell";
import { CHANNELS } from "@/lib/engines/human-design-tables";
import { getHDChannelArticle } from "@/lib/content/articles";
import styles from "@/components/content/content.module.css";

export const metadata: Metadata = {
  title: "36 каналов Дизайна человека: значение каждого канала в композите",
  description:
    "Полный список 36 каналов Rave-мандалы — что означает каждый канал, если он определён в композите вашей пары, целиком у одного партнёра или электромагнитно (по половине у каждого).",
};

export default function ChannelsHubPage() {
  return (
    <ContentShell
      breadcrumbs={[
        { label: "Главная", href: "/" },
        { label: "Дизайн человека", href: "/dizajn-cheloveka-sovmestimost/" },
        { label: "36 каналов" },
      ]}
    >
      <div className={styles.eyebrow}>Дизайн человека</div>
      <h1 className={styles.h1}>36 каналов: значение в композите пары</h1>
      <p className={styles.lede}>
        Каждый канал соединяет два центра через пару ворот. В композите пары канал может
        закрыться четырьмя разными способами: у обоих независимо, только у одного партнёра,
        или электромагнитно — когда каждый даёт свою половину, и качество появляется в паре,
        которого нет ни у кого по отдельности.
      </p>

      <CalcCta
        title="Узнайте каналы вашего композита"
        text="Введите даты и время рождения обоих — увидите реальный композитный бодиграф пары."
        href="/dizajn-cheloveka-sovmestimost/"
      />

      <div className={styles.grid}>
        {CHANNELS.map((ch) => {
          const article = getHDChannelArticle(ch.key);
          if (!article) return null;
          return (
            <Link key={ch.key} href={`/dizajn-cheloveka-sovmestimost/kanaly/${ch.key}/`} className={styles.gridLink}>
              <span className={styles.gridLinkTitle}>
                {ch.name} ({ch.key})
              </span>
              <span className={styles.gridLinkText}>{article.capsule.slice(0, 70)}…</span>
            </Link>
          );
        })}
      </div>
    </ContentShell>
  );
}
