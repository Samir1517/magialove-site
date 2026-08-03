import Link from "next/link";
import { Breadcrumbs, type Crumb } from "./Breadcrumbs";
import styles from "./content.module.css";

/** Общий каркас для всех справочных/SEO-страниц: шапка, крошки, подвал. */
export function ContentShell({
  breadcrumbs,
  children,
}: {
  breadcrumbs: Crumb[];
  children: React.ReactNode;
}) {
  return (
    <>
      <header className={styles.header}>
        <Link href="/" className={styles.logo}>
          СОВМЕСТИМОСТЬ
        </Link>
        <Link href="/" className="btn" style={{ padding: "10px 20px", fontSize: 13 }}>
          Рассчитать бесплатно
        </Link>
      </header>
      <Breadcrumbs items={breadcrumbs} />
      <div className={styles.wrap}>{children}</div>
      <footer className={styles.footer}>
        © Совместимость. Расчёт носит рекомендательный характер.{" "}
        <Link href="/o-servise/">О сервисе</Link> · <Link href="/faq/">Вопросы и ответы</Link> ·{" "}
        <Link href="/politika-konfidentsialnosti/">Конфиденциальность</Link>
      </footer>
    </>
  );
}

export function CalcCta({
  title,
  text,
  href = "/",
}: {
  title: string;
  text: string;
  /** Куда ведёт кнопка — по умолчанию главная (полный разбор по 4 системам). На страницах внутри
   * конкретной системы (арканы, каналы, кута и т.д.) передавайте href на хаб этой системы, чтобы
   * ссылочный вес и переход вели к тому же тематическому разделу, а не размывались на главную. */
  href?: string;
}) {
  return (
    <div className={styles.ctaBox}>
      <h2 className={styles.ctaTitle}>{title}</h2>
      <p className={styles.ctaText}>{text}</p>
      <Link href={href} className="btn" style={{ padding: "13px 24px", fontSize: 13.5 }}>
        Рассчитать бесплатно
      </Link>
    </div>
  );
}
