import type { Metadata } from "next";
import Link from "next/link";
import styles from "./page.module.css";
import { MainNav } from "@/components/nav/MainNav";
import { HubFaq } from "@/components/content/HubDepth";
import { HeroForm } from "@/components/landing/HeroForm";
import { HeroIllustration } from "@/components/landing/HeroIllustration";
import { SITE_URL } from "@/lib/site-config";

// Только canonical: title, description и og берутся из layout.tsx — metadata
// в Next.js сливается по полям, а не заменяется целиком. В layout canonical
// класть нельзя: его унаследовали бы страницы результатов, а canonical на
// noindex-странице — противоречивый сигнал для поисковика.
export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

const HOME_SCHEMA = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: "Совместимость",
      description:
        "Расчёт совместимости мужчины и женщины по 4 системам: Матрица судьбы, Нумерология, Дизайн человека, Джйотиш.",
      inLanguage: "ru",
    },
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: "Совместимость",
      url: SITE_URL,
      logo: `${SITE_URL}/icon.svg`,
    },
    {
      "@type": "WebApplication",
      name: "Калькулятор совместимости по 4 системам",
      url: SITE_URL,
      applicationCategory: "LifestyleApplication",
      operatingSystem: "Any (веб-браузер)",
      offers: { "@type": "Offer", price: "0", priceCurrency: "RUB" },
      description:
        "Бесплатный расчёт совместимости пары по Матрице судьбы, Нумерологии, Дизайну человека и Джйотиш прямо в браузере, без регистрации.",
    },
  ],
};

const METHODS = [
  {
    n: "01",
    title: "Нумерология",
    text: "Числа даты рождения раскрывают характер и сценарии отношений двоих.",
    href: "/numerologiya-sovmestimost/",
  },
  {
    n: "02",
    title: "Дизайн человека",
    text: "Тип и стратегия каждого показывают, как тебе легче взаимодействовать с ним.",
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
    href: "/matrica-sudby-sovmestimost/",
  },
];

const STEPS = [
  {
    n: "1",
    title: "Введи две даты рождения",
    text: "Твою и его. Имена — по желанию: с ними разбор будет обращаться к вам по именам.",
  },
  {
    n: "2",
    title: "Получи разбор по 4 системам",
    text: "Совместимость по каждой из систем плюс общая картина.",
  },
  {
    n: "3",
    title: "Пойми, что делать дальше",
    text: "Конкретные рекомендации для твоей пары — тепло и без осуждения.",
  },
];

/** Что реально показывает страница результата — по порядку, как она читается. */
const PREVIEW = [
  {
    label: "Общий балл",
    title: "Процент — и как он получен",
    text: "Не «число из воздуха»: под баллом раскрывается таблица с реальными весами систем и вкладом каждой. Видно, что именно его вытянуло, а что опустило.",
  },
  {
    label: "Тип пары",
    title: "Как называется ваш союз",
    text: "Один из двенадцати архетипов с девизом, светлой и теневой стороной. Это то, что запоминается и пересказывается подруге, — и то, с чего начинается узнавание себя.",
  },
  {
    label: "Главное",
    title: "Сильная нить и зона роста",
    text: "Из десятков посчитанных факторов выбираются те, что действительно выделяются: за что ваша пара держится и где чаще всего спотыкается.",
  },
  {
    label: "Роли",
    title: "Кто что несёт в паре",
    text: "Кто задаёт темп, кто удерживает тепло, что вы оба делаете одинаково хорошо. Без «главного» и «ведомого» — просто распределение.",
  },
  {
    label: "Разбор",
    title: "Четыре системы по отдельности",
    text: "Октаграмма Матрицы, Квадрат Пифагора, композитный бодиграф, колесо накшатр — всё интерактивное, с расшифровкой каждого элемента при клике.",
  },
  {
    label: "Завтра",
    title: "Аркан дня для вашей пары",
    text: "Короткий срез на сегодня — то, ради чего к разбору возвращаются не один раз.",
  },
];

const ADVANTAGES = [
  {
    title: "Полная картина, а не один срез",
    text: "Гороскоп, нумерология или дизайн человека по отдельности показывают лишь часть твоей пары. Мы сводим все четыре системы в одну картину.",
  },
  {
    title: "Совпадения — не случайность",
    text: "Когда четыре разные системы независимо сходятся на одном и том же выводе о твоей паре — это куда весомее одного прогноза.",
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
    title: "Даты никуда не уходят",
    text: "Расчёт целиком выполняется в твоём браузере: ни даты, ни время, ни результат не отправляются на сервер и нигде не сохраняются. Закрыла вкладку — данных не осталось.",
  },
];

const HOME_FAQ = [
  {
    q: "Это серьёзный расчёт или развлечение?",
    a: "Расчётная часть — настоящая: положения планет считаются по эфемеридам с точностью до минут, арифметика Матрицы и Нумерологии воспроизводима по первоисточникам, веса систем зафиксированы и показаны прямо в результате. Но ни одна из четырёх систем не является наукой, и мы этого не скрываем. Считай разбор хорошим поводом посмотреть на свою пару со стороны и назвать вслух то, что обычно остаётся непроговорённым, — а не прогнозом будущего.",
  },
  {
    q: "А если результат окажется низким?",
    a: "Низкий балл не означает, что вам не быть вместе. Он означает, что там, где другим парам легко по умолчанию, вам придётся договариваться словами. Мы намеренно не пользуемся словом «несовместимы»: у каждой пары в разборе есть и то, на чём она держится, и то, что её изматывает, — и второе почти всегда поддаётся изменению, если его назвать.",
  },
  {
    q: "Зачем вам время и город рождения?",
    a: "Только для расчёта. Дизайн человека и Джйотиш считают положение планет на момент рождения, а не на дату: Луна проходит около 13° в сутки, поэтому ошибка в несколько часов меняет результат. Город нужен ради часового пояса. Всё считается прямо в твоём браузере — данные не уходят на сервер и нигде не сохраняются. Если времени не знаешь, расчёт всё равно будет: две системы из четырёх работают от одних дат.",
  },
  {
    q: "Нужно ли знать имя и согласие партнёра?",
    a: "Нет. Достаточно даты рождения; имена — только чтобы разбор читался по-человечески, и их можно не вводить. Расчёт анонимный и бесплатный, регистрации нет.",
  },
];

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(HOME_SCHEMA) }}
      />
      <header className={styles.header}>
        <div className={styles.logo}>СОВМЕСТИМОСТЬ</div>
        <MainNav />
        <a href="#top" className={`btn ${styles.headerCta}`}>
          Рассчитать совместимость
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
              Совместимость мужчины и женщины: расчёт по 4 системам сразу
            </h1>
            <p className={styles.heroLede}>
              «Почему с ним всё так по-другому?» — если ты хоть раз задавала себе этот вопрос,
              этот тест для тебя. Бесплатный тест на совместимость мужчины и женщины онлайн:
              мягкий и честный расчёт сразу по нумерологии, дизайну человека, джйотишу и матрице
              судьбы. Ты увидишь сильные стороны вашей пары, зоны роста и то, что важно
              проговорить друг с другом.
            </p>
            <HeroForm />
            <div className={styles.heroNote}>
              Бесплатно · без регистрации · всё считается в твоём браузере · или{" "}
              <Link href="/po-imeni/">посчитай по именам</Link>
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
            Четыре системы, одна честная картина совместимости
          </h2>
        </div>
        <div className={styles.methodsGrid}>
          {METHODS.map((m) => (
            <Link key={m.n} href={m.href} className={`card method-card ${styles.methodCard}`}>
              <div className={styles.methodNumber}>{m.n}</div>
              <h3 className={styles.cardTitle}>{m.title}</h3>
              <div className={styles.cardText}>{m.text}</div>
            </Link>
          ))}
        </div>
      </section>

      <section id="how" className={styles.howSection} aria-labelledby="how-title">
        <div className={styles.container}>
          <div className={styles.sectionHead}>
            <h2 id="how-title" className={styles.sectionTitle}>
              Как рассчитать совместимость мужчины и женщины
            </h2>
          </div>
          <div className={styles.stepsGrid}>
            {STEPS.map((s) => (
              <div key={s.n} className={styles.step}>
                <div className={styles.stepNumber}>{s.n}</div>
                <h3 className={styles.cardTitle}>{s.title}</h3>
                <div className={styles.cardText}>{s.text}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.preview} aria-labelledby="preview-title">
        <div className={styles.sectionHead}>
          <div className={styles.sectionEyebrow}>ЧТО ТЫ ПОЛУЧИШЬ</div>
          <h2 id="preview-title" className={styles.sectionTitle}>
            Из чего состоит разбор вашей пары
          </h2>
        </div>
        <div className={styles.previewGrid}>
          {PREVIEW.map((p) => (
            <div key={p.label} className={styles.previewItem}>
              <span className={styles.previewLabel}>{p.label}</span>
              <h3 className={styles.cardTitle}>{p.title}</h3>
              <div className={styles.cardText}>{p.text}</div>
            </div>
          ))}
        </div>
      </section>

      <section id="advantages" className={styles.advantages} aria-labelledby="advantages-title">
        <div className={styles.sectionHead}>
          <div className={styles.sectionEyebrow}>ПОЧЕМУ ТАК ТОЧНЕЕ</div>
          <h2 id="advantages-title" className={`${styles.sectionTitle} ${styles.sectionTitleWide}`}>
            Большинство сервисов проверяют совместимость только по одной системе. Мы — по всем четырём сразу
          </h2>
        </div>
        <div className={styles.advantagesGrid}>
          {ADVANTAGES.map((a) => (
            <div key={a.title} className={`card ${styles.advantageCard}`}>
              <div className={styles.advantageDot} aria-hidden="true" />
              <h3 className={styles.cardTitle}>{a.title}</h3>
              <div className={styles.cardText}>{a.text}</div>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.faqSection} aria-labelledby="home-faq-title">
        <div className={styles.sectionHead}>
          <div className={styles.sectionEyebrow}>ЧЕСТНЫЕ ОТВЕТЫ</div>
          <h2 id="home-faq-title" className={styles.sectionTitle}>
            То, что обычно спрашивают до расчёта
          </h2>
        </div>
        <div className={styles.faqInner}>
          <HubFaq title="" items={HOME_FAQ} />
        </div>
        <div className={styles.sectionHead} style={{ marginTop: 26 }}>
          <Link href="/faq/" className={styles.faqMore}>
            Все вопросы и ответы о сервисе →
          </Link>
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
          Узнай совместимость мужчины и женщины прямо сейчас
        </h2>
        <p className={styles.ctaLede}>Первый расчёт совместимости — бесплатно, без регистрации</p>
        <a href="#top" className={`btn ${styles.ctaButton}`}>
          Рассчитать совместимость
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
          © {new Date().getFullYear()} Совместимость. Все права защищены. Расчёт носит
          рекомендательный характер. Копирование текстов сайта без разрешения запрещено.
        </div>
      </footer>
    </>
  );
}
