import Link from "next/link";
import styles from "./MainNav.module.css";

/**
 * Единое главное меню сайта — один источник правды для главной страницы и
 * для всех внутренних (ContentShell). Раньше навигация была только на
 * главной, и с внутренних страниц перейти в соседний раздел было нельзя.
 *
 * Состав: хаб «по дате рождения» + четыре системы. Это ровно те страницы,
 * что несут основные ключи (priority 0.9 в sitemap), поэтому сквозная
 * ссылка на них с каждой страницы работает и на навигацию, и на вес.
 * Служебные страницы (о сервисе, FAQ, политика) живут в футере — им
 * сквозной вес не нужен.
 */
const LINKS = [
  { href: "/po-date-rozhdeniya/", label: "По дате рождения" },
  { href: "/matrica-sudby-sovmestimost/", label: "Матрица судьбы" },
  { href: "/numerologiya-sovmestimost/", label: "Нумерология" },
  { href: "/dizajn-cheloveka-sovmestimost/", label: "Дизайн человека" },
  { href: "/dzhyotish-sovmestimost/", label: "Джйотиш" },
];

export function MainNav() {
  return (
    <nav className={styles.nav} aria-label="Основная навигация">
      {LINKS.map((l) => (
        <Link key={l.href} href={l.href}>
          {l.label}
        </Link>
      ))}
    </nav>
  );
}
