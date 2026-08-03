import Link from "next/link";
import styles from "./page.module.css";
import { HeroForm } from "@/components/landing/HeroForm";
import { HeroIllustration } from "@/components/landing/HeroIllustration";

const METHODS = [
  {
    n: "01",
    title: "Нумерология",
    text: "Числа даты рождения раскрывают характер и сценарии отношений двоих.",
    href: "/po-date-rozhdeniya/numerologiya-sovmestimost/",
  },
  {
    n: "02",
    title: "Дизайн человека",
    text: "Тип и стратегия каждого показывают, как вам легче взаимодействовать.",
    href: "/dizajn-cheloveka-sovmestimost/",
  },
  {
    n: "03",
    title: "Джйотиш",
    text: "Ведическая астрология сверяет натальные карты и лунные дома пары.",
    href: "/dzhyotish-sovmestimost/",
  },
  {
    n: "04",
    title: "Матрица судьбы",
    text: "Архетипы на карте судьбы показывают точки притяжения и уроки друг для друга.",
    href: "/po-date-rozhdeniya/matrica-sudby-sovmestimost/",
  },
];

const STEPS = [
  {
    n: "1",
    title: "Введите даты рождения",
    text: "Ваши и его — этого достаточно для точного расчёта.",
  },
  {
    n: "2",
    title: "Получите разбор по 4 системам",
    text: "Совместимость по каждой из систем плюс общая картина.",
  },
  {
    n: "3",
    title: "Поймите, что делать дальше",
    text: "Конкретные рекомендации для вашей пары — тепло и без осуждения.",
  },
];

const ADVANTAGES = [
  {
    title: "Полная картина, а не один срез",
    text: "Гороскоп, нумерология или дизайн человека по отдельности показывают лишь часть пары. Мы сводим все четыре системы в одну картину.",
  },
  {
    title: "Совпадения — не случайность",
    text: "Когда четыре разные системы независимо сходятся на одном и том же выводе о вашей паре — это куда весомее одного прогноза.",
  },
  {
    title: "Понятный язык, без пугающих терминов",
    text: "Никакой сложной терминологии и категоричных «несовместимы». Только то, что реально можно применить в отношениях.",
  },
  {
    title: "Конкретные рекомендации",
    text: "Не просто описание характеров, а точки притяжения и то, что стоит проговорить друг с другом — по каждой системе.",
  },
  {
    title: "Бесплатный первый расчёт",
    text: "Полный разбор совместимости по всем четырём системам — бесплатно и без регистрации, прежде чем решать, идти ли глубже.",
  },
  {
    title: "2 минуты — и готово",
    text: "Достаточно двух дат рождения. Никаких долгих анкет и лишних вопросов.",
  },
];

export default function Home() {
  return (
    <>
      <header className={styles.header}>
        <div className={styles.logo}>СОВМЕСТИМОСТЬ</div>
        <nav className={styles.nav} aria-label="Основная навигация">
          <a href="#methods">Методы</a>
          <a href="#how">Как это работает</a>
          <a href="#advantages">Преимущества</a>
        </nav>
        <a href="#top" className={`btn ${styles.headerCta}`}>
          Рассчитать бесплатно
        </a>
      </header>

      <section id="top" className={styles.hero} aria-label="Главный экран">
        <svg
          style={{
            position: "absolute",
            top: -30,
            left: -60,
            width: 260,
            height: 260,
            opacity: 0.6,
            zIndex: 0,
            animation: "glowDrift 10s ease-in-out infinite",
          }}
          viewBox="0 0 260 260"
          fill="none"
          aria-hidden="true"
        >
          <circle cx="130" cy="130" r="130" fill="url(#heroGlowGradient)" />
          <defs>
            <radialGradient id="heroGlowGradient">
              <stop offset="0%" stopColor="#EDC4CD" />
              <stop offset="100%" stopColor="#EDC4CD" stopOpacity="0" />
            </radialGradient>
          </defs>
        </svg>
        <div
          className="glow-blob"
          style={{
            width: 320,
            height: 320,
            top: -80,
            right: -100,
            background: "radial-gradient(circle,#F4EEFA,transparent 70%)",
            animation: "glowPulse 9s ease-in-out infinite",
          }}
          aria-hidden="true"
        />
        <div
          className="glow-blob"
          style={{
            width: 260,
            height: 260,
            bottom: -60,
            right: "20%",
            background: "radial-gradient(circle,rgba(214,189,152,.4),transparent 70%)",
            animation: "glowPulseSlow 12s ease-in-out infinite",
          }}
          aria-hidden="true"
        />

        <div className={styles.heroGrid}>
          <div>
            <div className={styles.eyebrow}>СОВМЕСТИМОСТЬ ✧ ДЛЯ ДВОИХ</div>
            <h1 className={styles.h1}>
              «Почему с ним всё так по-другому?» — узнайте за 2 минуты
            </h1>
            <p className={styles.heroLede}>
              Мягкий и честный расчёт вашей совместимости по нумерологии, дизайну человека,
              джйотишу и матрице судьбы. Сильные стороны пары, зоны роста и то, что важно
              проговорить друг с другом.
            </p>
            <HeroForm />
            <div className={styles.heroNote}>
              Бесплатно · без регистрации · займёт 2 минуты · или{" "}
              <Link href="/po-imeni/">посчитайте по именам</Link>
            </div>
          </div>
          <div className={styles.heroImageWrap}>
            <HeroIllustration />
          </div>
        </div>
      </section>

      <section id="methods" className={styles.container} aria-labelledby="methods-title">
        <div className={styles.sectionHead}>
          <div className={styles.sectionEyebrow}>ЧТО МЫ АНАЛИЗИРУЕМ</div>
          <h2 id="methods-title" className={styles.sectionTitle}>
            Четыре системы, одна честная картина
          </h2>
        </div>
        <div className={styles.methodsGrid}>
          {METHODS.map((m) => (
            <Link key={m.n} href={m.href} className={`card method-card ${styles.methodCard}`}>
              <div className={styles.methodNumber}>{m.n}</div>
              <div className={styles.cardTitle}>{m.title}</div>
              <div className={styles.cardText}>{m.text}</div>
            </Link>
          ))}
        </div>
      </section>

      <section id="how" className={styles.howSection} aria-labelledby="how-title">
        <div className={styles.container}>
          <div className={styles.sectionHead}>
            <h2 id="how-title" className={styles.sectionTitle}>
              Как это работает
            </h2>
          </div>
          <div className={styles.stepsGrid}>
            {STEPS.map((s) => (
              <div key={s.n} className={styles.step}>
                <div className={styles.stepNumber}>{s.n}</div>
                <div className={styles.cardTitle}>{s.title}</div>
                <div className={styles.cardText}>{s.text}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="advantages" className={styles.advantages} aria-labelledby="advantages-title">
        <div className={styles.sectionHead}>
          <div className={styles.sectionEyebrow}>ПОЧЕМУ ТАК ТОЧНЕЕ</div>
          <h2 id="advantages-title" className={`${styles.sectionTitle} ${styles.sectionTitleWide}`}>
            Большинство сервисов смотрят только одну систему. Мы — все четыре сразу
          </h2>
        </div>
        <div className={styles.advantagesGrid}>
          {ADVANTAGES.map((a) => (
            <div key={a.title} className={`card ${styles.advantageCard}`}>
              <div className={styles.advantageDot} aria-hidden="true" />
              <div className={styles.cardTitle}>{a.title}</div>
              <div className={styles.cardText}>{a.text}</div>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.ctaBanner} aria-labelledby="cta-title">
        <div
          className="glow-blob"
          style={{
            width: 420,
            height: 420,
            top: "50%",
            left: "50%",
            transform: "translate(-50%,-50%)",
            background: "radial-gradient(circle,rgba(214,189,152,.35),transparent 70%)",
            animation: "glowPulseSlow 8s ease-in-out infinite",
          }}
          aria-hidden="true"
        />
        <h2 id="cta-title" className={styles.ctaTitle}>
          Узнайте, что стоит за вашими отношениями
        </h2>
        <p className={styles.ctaLede}>Первый расчёт совместимости — бесплатно, без регистрации</p>
        <a href="#top" className={`btn ${styles.ctaButton}`}>
          Рассчитать бесплатно
        </a>
      </section>

      <footer className={styles.footer}>
        <nav className={styles.footerLinks} aria-label="Дополнительная навигация">
          <Link href="/znaki-zodiaka/">Знаки зодиака</Link>
          <Link href="/po-imeni/">Совместимость по именам</Link>
          <Link href="/o-servise/">О сервисе</Link>
          <Link href="/faq/">Вопросы и ответы</Link>
          <Link href="/politika-konfidentsialnosti/">Конфиденциальность</Link>
        </nav>
        <div className={styles.footerText}>
          © Совместимость. Расчёт носит рекомендательный характер.
        </div>
      </footer>
    </>
  );
}
