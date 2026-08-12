import type { Metadata } from "next";
import { ContentShell } from "@/components/content/ContentShell";
import styles from "@/components/content/content.module.css";

export const metadata: Metadata = {
  alternates: { canonical: "/politika-konfidentsialnosti/" },
  title: "Политика обработки персональных данных",
  description: "Как сервис «Совместимость» обращается с датами рождения и другими данными пользователей.",
};

const SECTIONS: { title: string; body: string }[] = [
  {
    title: "1. Какие данные вы вводите",
    body: "Для расчёта вы указываете даты рождения обоих партнёров и, по желанию, точное время и часовой пояс места рождения — это нужно только для Дизайна человека и Джйотиш. Имена партнёров вводить не обязательно, они используются исключительно для подписи результата на экране.",
  },
  {
    title: "2. Как эти данные обрабатываются",
    body: "Все расчёты выполняются локально в вашем браузере с помощью JavaScript. Введённые даты, время и результат расчёта никуда не отправляются — у сервиса нет сервера, который получает или хранит эти данные. Закрыв или обновив страницу, вы полностью удаляете введённую информацию.",
  },
  {
    title: "3. Файлы cookie и аналитика",
    body: "Сайт не устанавливает собственных cookie для отслеживания и не использует сторонние системы аналитики, обрабатывающие введённые вами данные о рождении.",
  },
  {
    title: "4. Права пользователя",
    body: "Поскольку данные не сохраняются, обращаться с запросом об удалении не требуется. Если у вас остались вопросы об обработке данных, напишите на почту, указанную на странице контактов.",
  },
];

export default function PrivacyPage() {
  return (
    <ContentShell
      breadcrumbs={[{ label: "Главная", href: "/" }, { label: "Политика конфиденциальности" }]}
    >
      <div className={styles.eyebrow}>Юридическая информация</div>
      <h1 className={styles.h1}>Политика обработки персональных данных</h1>

      <div className={styles.card} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {SECTIONS.map((s) => (
          <div key={s.title}>
            <h2 style={{ font: "600 14.5px var(--font-body)", color: "var(--ink)", margin: "0 0 6px" }}>
              {s.title}
            </h2>
            <p style={{ font: "400 13.5px/1.7 var(--font-body)", color: "var(--ink-soft)", margin: 0 }}>
              {s.body}
            </p>
          </div>
        ))}
      </div>
    </ContentShell>
  );
}
