import styles from "./content.module.css";

/**
 * Второй слой чтения на страницах калькуляторов.
 *
 * До этого хабы были устроены одинаково и плоско: заголовок, один абзац, форма,
 * решётка ссылок. Человеку, который ещё не готов вводить даты, читать было
 * нечего — а это большая часть трафика из поиска. Два блока ниже закрывают
 * ровно эту дыру: «Expectations» говорит, что она получит, «HubFaq» отвечает на
 * вопросы, которые иначе остаются без ответа и уводят обратно в выдачу.
 */

export function Expectations({
  title,
  items,
}: {
  title: string;
  items: { title: string; text: string }[];
}) {
  return (
    <>
      <h2 className={styles.h2}>{title}</h2>
      <div className={styles.expect}>
        {items.map((i) => (
          <div key={i.title} className={styles.expectItem}>
            <span className={styles.expectTitle}>{i.title}</span>
            <span className={styles.expectText}>{i.text}</span>
          </div>
        ))}
      </div>
    </>
  );
}

export interface FaqItem {
  q: string;
  a: string;
}

/**
 * FAQPage-разметка идёт вместе с блоком: расширенный сниппет FAQ Google убрал
 * в мае 2026, но AI-системы и Яндекс продолжают читать эту схему при отборе
 * источников — а первый вопрос раскрыт по умолчанию, чтобы блок не выглядел
 * пустым рядом ссылок.
 */
export function HubFaq({ items, title = "Частые вопросы" }: { items: FaqItem[]; title?: string }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((i) => ({
      "@type": "Question",
      name: i.q,
      acceptedAnswer: { "@type": "Answer", text: i.a },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      {title ? <h2 className={styles.h2}>{title}</h2> : null}
      <div className={styles.faq}>
        {items.map((i, n) => (
          <details key={i.q} className={styles.faqItem} open={n === 0}>
            <summary className={styles.faqQ}>{i.q}</summary>
            <p className={styles.faqA}>{i.a}</p>
          </details>
        ))}
      </div>
    </>
  );
}
