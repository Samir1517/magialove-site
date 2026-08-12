import type { Metadata } from "next";
import { ContentShell } from "@/components/content/ContentShell";
import styles from "@/components/content/content.module.css";

export const metadata: Metadata = {
  alternates: { canonical: "/kontakty/" },
  title: "Контакты",
  description: "Как связаться с сервисом «Совместимость».",
};

export default function ContactsPage() {
  return (
    <ContentShell breadcrumbs={[{ label: "Главная", href: "/" }, { label: "Контакты" }]}>
      <div className={styles.eyebrow}>Контакты</div>
      <h1 className={styles.h1}>Связаться с нами</h1>
      <div className={styles.card}>
        <p style={{ font: "400 14px/1.7 var(--font-body)", color: "var(--ink-soft)", margin: 0 }}>
          По вопросам о работе сервиса, найденным неточностям в расчётах или предложениям
          пишите на почту:{" "}
          <a href="mailto:rf.konsalt@gmail.com" style={{ color: "var(--accent)" }}>
            rf.konsalt@gmail.com
          </a>
          .
        </p>
      </div>
    </ContentShell>
  );
}
