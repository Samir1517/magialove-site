import Link from "next/link";
import {
  LINE_META,
  VERDICT_ACTION,
  VERDICT_META,
  calcProfileLines,
  type LineNumber,
} from "@/lib/content/profile-lines";
import { profileSlug } from "@/lib/content/articles";
import { Chip } from "@/components/viz/Legend";
import { BANDS } from "@/components/viz/scale";
import styles from "./systems.module.css";

/**
 * Разбор линий профиля пары: где у двоих одинаковые «правила жизни», а где
 * разные. Дополняет композит, который считает каналы и центры, — профиль в
 * официальный Partnership Analysis не входит вовсе, и это оговорено в сноске.
 *
 * Практический смысл блока — снять самый частый источник взаимного вреда:
 * попытку помочь партнёру по своим правилам, искренне считая их общими.
 */
export function ProfileLines({
  profileA,
  profileB,
  nameA,
  nameB,
}: {
  profileA: string;
  profileB: string;
  nameA: string;
  nameB: string;
}) {
  const result = calcProfileLines(profileA, profileB);
  if (!result) return null;

  const { a, b, shared, harmonies, verdict } = result;
  const meta = VERDICT_META[verdict];
  const band = verdict === "dissonance" ? BANDS.mid : BANDS.high;

  const ownA = a.filter((l) => !shared.includes(l));
  const ownB = b.filter((l) => !shared.includes(l));

  const person = (name: string, lines: LineNumber[], profile: string) => (
    <div className={styles.partnerCard} style={{ borderColor: "var(--accent-pink)" }}>
      <span className={styles.lsLabel}>{name}</span>
      <Link
        href={`/dizajn-cheloveka-sovmestimost/profili/${profileSlug(profile)}/`}
        className={styles.profileLink}
      >
        Профиль {profile}
      </Link>
      <p className={styles.lsText}>
        {lines
          .map((l) => `${l} — ${LINE_META[l].name}`)
          .join(", ")}
      </p>
    </div>
  );

  return (
    <div>
      <h3 className={styles.blockTitle}>Линии профиля: одинаковые правила или разные</h3>

      <div className={styles.lightShadow} style={{ marginBottom: 16 }}>
        {person(nameA, a, profileA)}
        {person(nameB, b, profileB)}
      </div>

      <div className={styles.doshaRow}>
        <div className={styles.doshaHead}>
          <strong className={styles.doshaTitle}>{meta.title}</strong>
          <Chip color={band.ink} background={band.wash}>
            {meta.chip}
          </Chip>
        </div>
        <p className={styles.doshaText}>{meta.lead}</p>
      </div>

      {shared.length > 0 && (
        <div className={styles.bars} style={{ marginTop: 16 }}>
          {shared.map((line) => (
            <div key={line} className={styles.stepCard}>
              <span className={styles.lsLabel}>
                Общая линия {line} · {LINE_META[line].name}
              </span>
              <p className={styles.lsText}>{LINE_META[line].right}</p>
              <p className={styles.note} style={{ margin: 0 }}>
                Это ваша совместная территория: здесь вы можете развиваться вместе и быть
                друг другу опорой, не переводя себя на чужой язык.
              </p>
            </div>
          ))}
        </div>
      )}

      {harmonies.length > 0 && (
        <div className={styles.bars} style={{ marginTop: 16 }}>
          {harmonies.map((h) => (
            <div key={`${h.from}-${h.to}`} className={styles.stepCard}>
              <span className={styles.lsLabel}>
                Гармония линий {h.from} и {h.to}
              </span>
              <p className={styles.lsText}>
                {LINE_META[h.from].name} ({LINE_META[h.from].keynote}) и{" "}
                {LINE_META[h.to].name} ({LINE_META[h.to].keynote}) занимают зеркальные позиции
                на двух «этажах» гексаграммы — именно такую пару Ра Уру Ху называл гармонией
                линий. Линда Баннелл описывает это так: частоты у вас разные, но у них есть
                потенциал звучать согласованно. Одинаковыми вас это не делает — но объясняет,
                почему по этой теме договориться проще, чем можно было ожидать при такой
                разнице профилей.
              </p>
            </div>
          ))}
        </div>
      )}

      {(ownA.length > 0 || ownB.length > 0) && (
        <>
          <p className={styles.note} style={{ marginTop: 18 }}>
            {shared.length > 0
              ? "По остальным линиям вы устроены по-разному. Ниже — что для каждого из вас работает, а что ломает. Своё применяйте к себе; чужое читайте как чужое, а не как ошибку."
              : "Ниже — что работает для каждого из вас, а что ломает. Обратите внимание: «неправильное» для одного часто и есть рост для другого. Своё применяйте к себе, за партнёром признайте его собственное."}
          </p>
          <div className={styles.lightShadow} style={{ marginTop: 12 }}>
            {[
              { name: nameA, lines: ownA },
              { name: nameB, lines: ownB },
            ].map(({ name, lines }) => (
              <div key={name} className={styles.lightCard}>
                {/* Имя перед двоеточием, а не в родительном падеже: склонять
                    произвольное имя надёжно нельзя («для Ани», но «для Игоря»,
                    и «для Первый партнёр» на странице без имён). */}
                <span className={styles.lsLabel}>{name}: что работает и что ломает</span>
                {lines.length === 0 ? (
                  <p className={styles.lsText}>
                    Обе линии совпадают с линиями партнёра — отдельных правил нет.
                  </p>
                ) : (
                  lines.map((l) => (
                    <div key={l} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      <strong className={styles.doshaTitle}>
                        Линия {l} · {LINE_META[l].name}
                      </strong>
                      <p className={styles.lsText}>{LINE_META[l].right}</p>
                      <p className={styles.lsText} style={{ color: "var(--ink-soft)" }}>
                        <em>Разрушительно:</em> {LINE_META[l].wrong}
                      </p>
                    </div>
                  ))
                )}
              </div>
            ))}
          </div>
        </>
      )}

      <div className={styles.stepCard} style={{ marginTop: 18 }}>
        <span className={styles.lsLabel}>Что с этим делать</span>
        <p className={styles.lsText}>{VERDICT_ACTION[verdict]}</p>
      </div>

      <p className={styles.note} style={{ marginTop: 16 }}>
        Из первоисточника здесь: шесть линий гексаграммы с ключевыми словами Ра Уру Ху,
        деление на нижнюю триграмму (1–3, обращённую внутрь) и верхнюю (4–6, обращённую
        вовне), гармония линий 1–4, 2–5, 3–6, а также три соотношения профилей у Линды
        Баннелл, директора Международной школы Дизайна человека: резонанс (профили
        совпадают целиком), гармония и диссонанс.
        {shared.length > 0 && verdict === "shared" && (
          <>
            {" "}
            Случай одной совпадающей линии — трактовка школ ДЧ, а не первоисточника: в
            официальном корпусе резонансом называют только полное совпадение профилей.
          </>
        )}{" "}
        Профиль не входит в официальный анализ партнёрства Ра Уру Ху — там разбираются
        каналы и центры, — и балл совместимости из профиля мы намеренно не выводим:
        Баннелл прямо ставит стратегию и авторитет выше этой механики.
      </p>
    </div>
  );
}
