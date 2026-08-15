"use client";

import { useMemo } from "react";
import type { Person } from "@/lib/engines/types";
import { calcMarriageIndicators } from "@/lib/engines/jyotish";
import { safely } from "@/lib/engines/person";
import { bhavaOf } from "@/lib/data/jyotish/bhava";
import styles from "./systems.module.css";

/**
 * «Что в твоей карте написано про партнёрство».
 *
 * Вся остальная джйотишская выдача у нас построена на Луне: восемь кут и доши
 * сравнивают накшатры и знаки Луны. Это отвечает на вопрос «насколько вы
 * совпадаете», но молчит о том, что вообще сказано про отношения в отдельно
 * взятой карте. Классика читает брак прежде всего по седьмому дому и по
 * Венере — этот блок закрывает пробел.
 *
 * Источник правила — Брихат Парашара Хора Шастра, глава о караках: «Венера —
 * Карака жены» и «для жены (мужа) от Венеры и 7-го дома от Венеры». Венера
 * отвечает за супруга у обоих полов; расхожее «у женщины за мужа отвечает
 * Юпитер» — поздняя школьная традиция, и мы её не повторяем.
 */

/** Что означает планета-управитель как «хозяин» темы отношений. */
const LORD_MEANS: Record<string, string> = {
  "Солнце": "уверенность, достоинство и потребность быть замеченной",
  "Луна": "чувства, забота и потребность в покое рядом",
  "Марс": "напор, страсть и готовность спорить",
  "Меркурий": "разговор, лёгкость и общий интерес",
  "Юпитер": "смысл, щедрость и уважение",
  "Венера": "нежность, красота и удовольствие",
  "Сатурн": "надёжность, терпение и проверка временем",
};

const DIGNITY_SAY: Record<string, string> = {
  экзальтация: "стоит в лучшем для себя знаке — эта сторона отношений включается сама",
  мулатрикона: "стоит в своей сильной зоне — здесь у тебя запас",
  "своя обитель": "стоит у себя дома — тема устойчивая, ей можно доверять",
  падение: "стоит в самом неудобном для себя знаке — то же качество никуда не делось, но даётся усилием",
};

function Side({ person, name }: { person: Person; name: string }) {
  const d = useMemo(() => safely(() => calcMarriageIndicators(person)), [person]);
  if (!d) return null;

  const bhava = bhavaOf(d.lordHouse);
  const venusBhava = bhavaOf(d.venusHouse);
  const lordDig = d.lordDignity ? DIGNITY_SAY[d.lordDignity] : null;
  const venusDig = d.venusDignity ? DIGNITY_SAY[d.venusDignity] : null;

  return (
    <div className={styles.partnerCard}>
      <span className={styles.lsLabel}>{name}</span>

      <ul className={styles.lsList}>
        <li className={styles.lsItem}>
          <strong>Дом партнёрства: {d.seventhRashi}.</strong> Седьмой дом — участок карты,
          который отвечает за брак и любые отношения на равных. Он стоит ровно напротив
          первого, «тебя самой», то есть буквально описывает «не-я»: того, кого ты к себе
          подпускаешь. У тебя там знак {d.seventhRashi}, а значит хозяин темы —{" "}
          {d.seventhLord}: {LORD_MEANS[d.seventhLord]}.
        </li>

        <li className={styles.lsItem}>
          <strong>
            Где стоит хозяин: {d.lordHouse}-й дом, {d.lordRashi}.
          </strong>{" "}
          Куда ушёл управитель седьмого дома, туда и утекает тема отношений. Здесь это дом{" "}
          «{bhava.title}» — {bhava.meaning}
          {lordDig ? ` При этом ${d.seventhLord} ${lordDig}.` : ""}
          {d.lordRetro
            ? ` ${d.seventhLord} идёт вспять — с Земли видно, как планета движется по небу назад. В отношениях это про то, что человек сначала долго проживает всё внутри и только потом показывает наружу.`
            : ""}
          {d.lordCombust
            ? ` ${d.seventhLord} стоит слишком близко к Солнцу и «сгорает»: тема есть, но её плохо слышно за собственными интересами.`
            : ""}
        </li>

        <li className={styles.lsItem}>
          <strong>
            Венера: {d.venusRashi}, {d.venusHouse}-й дом.
          </strong>{" "}
          В классике именно Венера отвечает за образ супруга — и у мужчин, и у женщин.
          Стоит она в доме «{venusBhava.title}»: {venusBhava.meaning}
          {venusDig ? ` Венера ${venusDig}.` : ""}
          {d.venusCombust ? " Венера сожжена близостью к Солнцу — своё «хочу» здесь легко заглушается чужим." : ""}
        </li>

        <li className={styles.lsItem}>
          <strong>
            Проверка от Венеры: {d.seventhFromVenusRashi}, хозяин {d.seventhFromVenusLord}.
          </strong>{" "}
          Парашара велит смотреть супруга дважды: от седьмого дома и отдельно — от седьмого
          дома, отсчитанного от самой Венеры. Второй счёт показывает то же с другой стороны,
          и когда обе картины сходятся, вывод крепче.
        </li>
      </ul>
    </div>
  );
}

export function MarriageHouse({
  a,
  b,
  nameA,
  nameB,
}: {
  a: Person;
  b: Person;
  nameA: string;
  nameB: string;
}) {
  return (
    <div>
      <h3 className={styles.blockTitle}>Что в вашей карте написано про партнёрство</h3>
      <p className={styles.note} style={{ marginBottom: 10 }}>
        Восемь кут выше сравнивают вас двоих. А это — про каждого по отдельности: что
        вообще сказано об отношениях в его собственной карте, независимо от партнёра.
        Считается от Лагны, поэтому нужны время и место рождения; без них блок не
        показывается.
      </p>
      <div className={styles.lightShadow}>
        <Side person={a} name={nameA} />
        <Side person={b} name={nameB} />
      </div>
      <p className={styles.note}>
        Правило взято у Парашары: «Венера — Карака жены», и там же — «для жены (мужа) от
        Венеры и 7-го дома от Венеры». Поэтому Венеру мы читаем у обоих полов. Расхожее
        «у женщины за мужа отвечает Юпитер» — более поздняя школьная традиция: в списке
        карак Парашары Юпитер отвечает за учёность, богатство, сына и друга, но не за мужа.
      </p>
    </div>
  );
}
