import { Suspense } from "react";
import Link from "next/link";
import { getArcanumInfo } from "@/lib/engines/matrix";
import { arcanumRelations } from "@/lib/content/matrix-arcana-relations";
import { KeepParamsLink } from "./KeepParamsLink";
import styles from "./content.module.css";

/**
 * Блок «этот аркан рядом с другими» на странице аркана.
 *
 * Двойное назначение. Для читателя: в его матрице девять позиций, и вопрос
 * «как это сочетается с соседней зоной» возникает сразу после чтения своей —
 * здесь на него отвечают. Для сайта: это несущая перелинковка кластера, каждый
 * аркан получает 4–5 входящих ссылок с осмысленным анкором вместо голых
 * «предыдущий/следующий» (см. matrix-arcana-relations.ts).
 */
export function ArcanumRelations({ n }: { n: number }) {
  const relations = arcanumRelations(n);
  if (relations.length === 0) return null;

  const self = getArcanumInfo(n);

  return (
    <section className={styles.card} aria-labelledby={`relations-${n}`}>
      <h2 id={`relations-${n}`} className={styles.h2}>
        Что меняется, когда рядом стоит другой аркан
      </h2>
      <p className={styles.text}>
        В общей матрице пары девять позиций, и в них стоят разные арканы: один отвечает за
        любовь, другой за деньги, третий за точку комфорта. Читать их поодиночке — половина
        дела: качества складываются и меняют друг друга. Ниже — что происходит, когда рядом с
        «{self.name}» в вашей карте оказывается один из этих арканов.
      </p>
      <ul className={styles.relList}>
        {relations.map((rel) => {
          const info = getArcanumInfo(rel.to);
          return (
            <li key={rel.to} className={styles.relItem}>
              {/* Переход к соседнему аркану сохраняет расчёт: иначе на второй
                  же странице человек теряет свои даты и путь назад. */}
              <Suspense
                fallback={
                  <Link href={`/matrica-sudby-sovmestimost/arkany/${rel.to}/`} className={styles.relLink}>
                    Аркан {info.number} «{info.name}»
                  </Link>
                }
              >
                <KeepParamsLink href={`/matrica-sudby-sovmestimost/arkany/${rel.to}/`} className={styles.relLink}>
                  Аркан {info.number} «{info.name}»
                </KeepParamsLink>
              </Suspense>
              <p className={styles.relText}>{rel.text}</p>
            </li>
          );
        })}
      </ul>
      <p className={styles.note}>
        Своя пара арканов у каждой матрицы:{" "}
        <Link href="/matrica-sudby-sovmestimost/">посчитайте общую матрицу по двум датам рождения</Link>, чтобы
        увидеть, какие из этих качеств стоят рядом именно у вас.
      </p>
    </section>
  );
}
