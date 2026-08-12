import type { Metadata } from "next";
import Link from "next/link";
import { ContentShell, CalcCta } from "@/components/content/ContentShell";
import { getJyotishNakshatraArticle } from "@/lib/content/articles";
import styles from "@/components/content/content.module.css";
import nakshatraData from "@/lib/data/jyotish/nakshatra.json";

const NAKSHATRAS = (nakshatraData as { nakshatras: { i: number; name: string }[] }).nakshatras;

export const metadata: Metadata = {
  alternates: { canonical: "/dzhyotish-sovmestimost/nakshatry/" },
  title: "27 накшатр Луны: значение для совместимости пары",
  description:
    "Управляющее божество, символ и гана каждой из 27 накшатр — лунных домов Джйотиш. Светлые и теневые качества, тема отношений. По Брихат Парашара Хора Шастре.",
};

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
        Накшатра — созвездие, в котором находилась Луна в момент твоего рождения: более точный
        и древний слой Джйотиш, чем знак зодиака. У каждой накшатры есть управляющее божество,
        символ и природа (гана), а также классические качества — конструктивные и теневые
        одновременно, как и в любой системе на этом сервисе.
      </p>

      <CalcCta
        title="Узнай накшатру твоей пары"
        text="Введи точное время и место рождения обоих — расчёт требует момента, а не только даты."
        href="/dzhyotish-sovmestimost/"
      />

      <div className={styles.grid}>
        {NAKSHATRAS.map((n) => {
          const article = getJyotishNakshatraArticle(n.i);
          if (!article) return null;
          return (
            <Link key={n.i} href={`/dzhyotish-sovmestimost/nakshatry/${n.i}/`} className={styles.gridLink}>
              <span className={styles.gridLinkNum}>{n.i}</span>
              <span className={styles.gridLinkTitle}>{n.name}</span>
              <span className={styles.gridLinkText}>{article.capsule.slice(0, 70)}…</span>
            </Link>
          );
        })}
      </div>
    </ContentShell>
  );
}
