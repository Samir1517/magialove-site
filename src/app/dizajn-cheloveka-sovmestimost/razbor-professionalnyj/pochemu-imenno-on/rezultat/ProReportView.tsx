"use client";

/**
 * Страница разбора «Почему именно он» — платный продукт.
 *
 * Порядок блоков утверждён и повторяет scripts/render-hd-pro-report.ts:
 * hero с ярлыком → главное за минуту → почему тянет → где меняете друг друга →
 * что не изменится → чего нет → карта → что с этим делать. Градиент глубины:
 * два первых места каждого типа развёрнуты, остальные в сжатой форме с
 * раскрытием. Пол влияет только на род в текстах — переключатель меняет
 * параметры адреса, чтобы пересланная ссылка сохраняла выбор.
 */

import { useMemo, useState, useEffect, useRef, type ReactNode } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

import { calcPersonalDesign, calcComposite, toPersonChart, ACTIVATION_BODIES } from "@/lib/engines/human_design";
import { calcHumanDesignPro, rankHighlights } from "@/lib/engines/human-design-pro";
import { CENTER_NAMES, CHANNELS, type CenterKey } from "@/lib/engines/human-design-tables";
import { makePerson, safely, parseSex } from "@/lib/engines/person";
import type { Sex } from "@/lib/content/gender";
import { applyGender } from "@/lib/content/gender";
import { gateInfo } from "@/lib/data/human_design/gates";
import { gateLineNameShort } from "@/lib/data/human_design/gate-line-names";
import { linePolarity } from "@/lib/data/human_design/line-polarity";
import { geneKey } from "@/lib/data/human_design/gene-keys";
import { channelTheme } from "@/lib/data/human_design/channel-themes";
import { CONDITIONING_BY_CENTER } from "@/lib/content/human-design-pro";
import { channelPair, pairLabel, BRIDGE_NOTE } from "@/lib/content/human-design-channels-pair";
import { gateInPair, TRIAD_FRAME, PERSONALIZED_MARK } from "@/lib/content/human-design-triads";
import { ABSENT_FRAME, channelAbsent } from "@/lib/content/human-design-absent";
import { OPENING, MAP_FRAME, ACTIVATION_BODY_MEANING, CLOSING } from "@/lib/content/human-design-report-frame";
import { CHANNEL_SOURCE_COLOR, CHANNEL_SOURCE_LABEL } from "@/lib/content/human-design";

import { Bodygraph } from "@/components/viz/Bodygraph";
import { Legend } from "@/components/viz/Legend";
import { Reveal } from "@/components/viz/Reveal";
import { DateTimeForm } from "@/components/system-calc/DateTimeForm";
import styles from "./pro.module.css";
import { VignetteArt, WaterSteamArt, AbsentArt } from "./ProArt";

const SELF_PATH = "/dizajn-cheloveka-sovmestimost/razbor-professionalnyj/pochemu-imenno-on/rezultat";

const gateName = (n: number) => `${n} «${gateInfo(n)?.name ?? "?"}»`;

/** Согласование числительного: 1 место, 2 места, 5 мест. */
function plural(n: number, one: string, few: string, many: string): string {
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 14) return many;
  const mod10 = n % 10;
  if (mod10 === 1) return one;
  if (mod10 >= 2 && mod10 <= 4) return few;
  return many;
}

/** Полоса прогресса чтения: длинный отчёт, читателю важно чувствовать объём. */
function ReadingProgress() {
  const fillRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement;
      const total = doc.scrollHeight - doc.clientHeight;
      const pct = total > 0 ? (doc.scrollTop / total) * 100 : 0;
      if (fillRef.current) fillRef.current.style.width = `${pct}%`;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <div className={styles.progress} aria-hidden="true">
      <div className={styles.progressFill} ref={fillRef} />
    </div>
  );
}

/**
 * Глобальный body имеет overflow «hidden auto» — это делает его
 * скролл-контейнером, и position:sticky липнет к нему, а не к окну: карта
 * оставалась в верху колонки, и при чтении карточек правая колонка пустела.
 * clip обрезает горизонталь так же, как hidden, но скролл-контейнер не
 * создаёт. Меняем только на этой странице и возвращаем как было при уходе.
 */
function useStickyFriendlyBody() {
  useEffect(() => {
    const prevX = document.body.style.overflowX;
    const prevY = document.body.style.overflowY;
    document.body.style.overflowX = "clip";
    document.body.style.overflowY = "visible";
    return () => {
      document.body.style.overflowX = prevX;
      document.body.style.overflowY = prevY;
    };
  }, []);
}

/** Имя центра для фраз со словом «центр»: у G в имени слово уже есть, и без
 * замены выходило «центр «G-центр (идентичность)»» — масло масляное. */
function centerLabel(center: CenterKey): string {
  return CENTER_NAMES[center].replace("G-центр", "G");
}

function Section({ eyebrow, title, children }: { eyebrow: string; title: string; children: ReactNode }) {
  return (
    <section className={styles.section}>
      <Reveal>
        <div className={styles.eyebrow}>{eyebrow}</div>
        <h2 className={styles.h2}>{title}</h2>
        {children}
      </Reveal>
    </section>
  );
}

export function ProReportView() {
  const params = useSearchParams();
  const router = useRouter();
  useStickyFriendlyBody();

  const dateA = params.get("a");
  const dateB = params.get("b");
  const timeA = params.get("at");
  const timeB = params.get("bt");
  const tzA = params.get("atz") ?? undefined;
  const tzB = params.get("btz") ?? undefined;
  const nameA = params.get("na")?.trim() || "";
  const nameB = params.get("nb")?.trim() || "";
  const sexA = parseSex(params.get("sa"), "ж");
  const sexB = parseSex(params.get("sb"), "м");

  const data = useMemo(() => {
    if (!dateA || !dateB || !timeA || !timeB) return null;
    return safely(() => {
      const a = calcPersonalDesign(makePerson(dateA, timeA, tzA, undefined, sexA));
      const b = calcPersonalDesign(makePerson(dateB, timeB, tzB, undefined, sexB));
      const pro = calcHumanDesignPro(a, b);
      return {
        a,
        b,
        pro,
        ranked: rankHighlights(pro),
        composite: calcComposite(a, b),
        // PersonChart-формат — для канонического бодиграфа и его подсказок.
        aChart: toPersonChart(a),
        bChart: toPersonChart(b),
      };
    });
  }, [dateA, dateB, timeA, timeB, tzA, tzB, sexA, sexB]);

  // Род в текстах: «ты» — первый партнёр, «партнёр» — второй.
  const g = useMemo(() => {
    const ctx = { self: sexA, other: sexB };
    return (s: string) => applyGender(s, ctx);
  }, [sexA, sexB]);

  // Наведение на карточку подсвечивает канал на канонической карте. Клик по
  // самой карте открывает её собственную подсказку — скролл к карточке ей
  // только мешал бы.
  const [hoverChannel, setHoverChannel] = useState<string | null>(null);

  const setSex = (key: "sa" | "sb", value: Sex) => {
    const next = new URLSearchParams(params.toString());
    next.set(key, value);
    router.replace(`${SELF_PATH}?${next.toString()}`, { scroll: false });
  };

  if (!dateA || !dateB || !timeA || !timeB || !data) {
    return (
      <div className={styles.wrap}>
        <div className={styles.topBar}>
          <Link href="/" className={styles.brand}>СОВМЕСТИМОСТЬ</Link>
        </div>
        <div className={styles.hero}>
          <div className={styles.heroEyebrow}>Профессиональный разбор · Дизайн человека</div>
          <h1 className={styles.heroLabel}>Почему именно он</h1>
          <div className={styles.heroLede}>
            <p>
              Разбор строится на моменте рождения обоих: дата, время и часовой пояс.
              Данные никуда не отправляются — весь расчёт происходит в твоём браузере.
            </p>
          </div>
        </div>
        <DateTimeForm targetPath={SELF_PATH} />
      </div>
    );
  }

  const { a, b, pro, ranked, composite, aChart, bChart } = data;

  const heName = nameB || "Партнёр";
  const pairNames = nameA && nameB ? `${nameA} и ${nameB}` : "ваша пара";

  // Каналы: два развёрнутых, остальные строкой.
  const chanItems = ranked.filter((x) => x.kind === "bridge" || x.kind === "closedHanging");
  const DEEP = 2;
  const topChannel = chanItems[0] ?? null;
  const label = topChannel ? pairLabel(topChannel.channelKey!) : null;

  // Обусловленность в порядке ранжирования.
  const condItems = ranked
    .filter((x) => x.kind === "conditioningBare" || x.kind === "conditioningAnchored")
    .map((h) => {
      const side = h.side as "a" | "b";
      const item = (side === "a" ? pro.a : pro.b).conditioning.find((c) => c.center === h.center)!;
      return { side, item };
    });

  const tileTop = topChannel ? CHANNELS.find((c) => c.key === topChannel.channelKey) : null;
  const tileCond = condItems[0] ?? null;
  const noneThemes = pro.absent.filter((t) => t.kind === "none");
  const halfThemes = pro.absent.filter((t) => t.kind === "half");

  let sameNameShown = false;

  return (
    <div className={styles.wrap}>
      <ReadingProgress />
      <div className={styles.topBar}>
        <Link href="/" className={styles.brand}>СОВМЕСТИМОСТЬ</Link>
        <span className={styles.brand}>Профессиональный разбор</span>
      </div>

      {/* ============ HERO ============ */}
      <header className={styles.hero}>
        <div className={styles.heroEyebrow}>Дизайн человека · «Почему именно он»</div>
        <div className={styles.heroNames}>{pairNames}</div>
        {label && <h1 className={styles.heroLabel}>Вы — {label}</h1>}
        <div className={styles.heroVignette}><VignetteArt /></div>
        <div className={styles.heroLede}>
          <p>{OPENING.readFreely}</p>
          <p>{OPENING.whatThisIs}</p>
          <p>{OPENING.howWeCount}</p>
        </div>
        <div className={styles.sexSwitch}>
          <span>Как обращаться в тексте:</span>
          <span className={styles.sexGroup}>
            ты —
            {(["ж", "м"] as const).map((v) => (
              <button
                key={v}
                type="button"
                className={sexA === v ? `${styles.sexBtn} ${styles.sexBtnActive}` : styles.sexBtn}
                onClick={() => setSex("sa", v)}
              >
                {v === "ж" ? "она" : "он"}
              </button>
            ))}
          </span>
          <span className={styles.sexGroup}>
            партнёр —
            {(["м", "ж"] as const).map((v) => (
              <button
                key={v}
                type="button"
                className={sexB === v ? `${styles.sexBtn} ${styles.sexBtnActive}` : styles.sexBtn}
                onClick={() => setSex("sb", v)}
              >
                {v === "м" ? "он" : "она"}
              </button>
            ))}
          </span>
        </div>
      </header>

      {/* ============ ГЛАВНОЕ ЗА МИНУТУ ============ */}
      <Section eyebrow="Сначала ответ" title="Главное за минуту">
        <div className={styles.tiles}>
          {tileTop && (
            <div className={styles.tile}>
              <div className={styles.tileLabel}>Что вас держит</div>
              <div className={styles.tileValue}>Канал {tileTop.name}</div>
              <div className={styles.tileNote}>
                {channelTheme(tileTop.key)} Каждый закрывает другому недостающую половину —
                поодиночке этого нет ни у кого из вас.
              </div>
            </div>
          )}
          {tileCond && (
            <div className={styles.tile}>
              <div className={styles.tileLabel}>Что вас изматывает</div>
              <div className={styles.tileValue}>{CONDITIONING_BY_CENTER[tileCond.item.center].topic}</div>
              <div className={styles.tileNote}>
                Здесь у одного центр открыт, а у второго включён. Это не характер и не
                вредность: так работает механика.
              </div>
            </div>
          )}
          <div className={styles.tile}>
            <div className={styles.tileLabel}>Что не изменится</div>
            <div className={styles.tileValue}>
              {pro.shared.length} {plural(pro.shared.length, "общая тема", "общие темы", "общих тем")}
            </div>
            <div className={styles.tileNote}>
              Это то, что вас узнало друг в друге, — и то, где вы проседаете одновременно.
              Меняется не набор тем, а уровень, на котором они проживаются.
            </div>
          </div>
          <div className={styles.tile}>
            <div className={styles.tileLabel}>Чего нет вовсе</div>
            <div className={styles.tileValue}>
              {noneThemes.length} {plural(noneThemes.length, "тема", "темы", "тем")} из 36
            </div>
            <div className={styles.tileNote}>
              Это норма для любой пары — но именно на такие темы обычно уходят годы
              «мы просто мало старались».
            </div>
          </div>
        </div>
      </Section>

      <hr className={styles.divider} />

      {/* ============ ПОЧЕМУ ТЯНЕТ ============ */}
      <Section eyebrow="Механика притяжения" title={g("Почему тянет именно к {п:нему|ней}")}>
        {/* Единственное место, где термины «канал» и «ворота» получают бытовой
            перевод, — дальше страница пользуется ими свободно. */}
        <p className={styles.lede}>
          На карте Дизайна человека между центрами протянуты каналы — ниточки из двух
          половинок. Каждая половинка называется воротами, у неё свой номер и своё имя.
          Когда одна половинка твоя, а вторая — {g("{п:его|её}")}, канал замыкается только
          вдвоём: у пары появляется то, чего нет ни у одного поодиночке. Вот ваши такие
          места.
        </p>
        <p className={styles.mark}>{PERSONALIZED_MARK}</p>
        <div className={styles.channelsGrid}>
          <div>
            {chanItems.slice(0, DEEP).map((item) => {
              const t = channelPair(item.channelKey!)!;
              const ch = CHANNELS.find((c) => c.key === item.channelKey)!;
              const isBridge = item.kind === "bridge";
              return (
                <article
                  key={ch.key}
                  id={`pro-ch-${ch.key}`}
                  className={hoverChannel === ch.key ? `${styles.card} ${styles.cardHi}` : styles.card}
                  onMouseEnter={() => setHoverChannel(ch.key)}
                  onMouseLeave={() => setHoverChannel(null)}
                >
                  <h3 className={styles.cardTitle}>
                    {ch.name} ({ch.key})
                    {isBridge && <span className={styles.cardTag}>мост</span>}
                  </h3>
                  <p className={styles.cardText}>{g(t.appears)}</p>
                  <p className={styles.cardText}>
                    <span className={styles.cardLabel}>Почему тянет. </span>{g(t.pull)}
                  </p>
                  <p className={styles.cardText}>
                    <span className={styles.cardLabel}>Обратная сторона. </span>{g(t.shadow)}
                  </p>
                  {isBridge && (
                    <div className={styles.bridgeBox}>
                      <p className={styles.cardText}>{BRIDGE_NOTE.light}</p>
                      <p className={styles.cardText}>{BRIDGE_NOTE.shadow}</p>
                      <p className={styles.cardText}>{BRIDGE_NOTE.action}</p>
                    </div>
                  )}
                </article>
              );
            })}

            {chanItems.length > DEEP && (
              <>
                <p className={styles.note}>
                  Ещё {chanItems.length - DEEP}{" "}
                  {plural(chanItems.length - DEEP, "место", "места", "мест")}, где вы достраиваете
                  друг друга, — коротко:
                </p>
                <ul className={styles.compactList}>
                  {chanItems.slice(DEEP).map((item) => {
                    const t = channelPair(item.channelKey!)!;
                    const ch = CHANNELS.find((c) => c.key === item.channelKey)!;
                    return (
                      <li
                        key={ch.key}
                        id={`pro-ch-${ch.key}`}
                        className={styles.compactItem}
                        onMouseEnter={() => setHoverChannel(ch.key)}
                        onMouseLeave={() => setHoverChannel(null)}
                      >
                        <span className={styles.compactName}>{ch.name} ({ch.key})</span>
                        <p className={styles.compactText}>{g(t.pull)}</p>
                      </li>
                    );
                  })}
                </ul>
              </>
            )}
          </div>

          <div className={styles.graphSide}>
            {/* Канонический бодиграф: геометрия классики неизменна, режим
                композита и подсказки — те же, что на бесплатной странице. */}
            <Bodygraph
              composite={{ channels: composite.channels, definedCenters: composite.definedCenters }}
              a={aChart}
              b={bChart}
              nameA={nameA || "Первый партнёр"}
              nameB={nameB || "Второй партнёр"}
              size={300}
              highlightKey={hoverChannel}
              hint="Наведи на карточку слева — канал подсветится. Коснись линии на карте — расскажем, что это."
            />
            <Legend
              entries={(["electromagnetic", "both", "a", "b"] as const)
                .filter((s) => composite.channels.some((c) => c.source === s))
                .map((s) => ({ color: CHANNEL_SOURCE_COLOR[s], text: CHANNEL_SOURCE_LABEL[s] }))}
            />
          </div>
        </div>
      </Section>

      <hr className={styles.divider} />

      {/* ============ ГДЕ ВЫ МЕНЯЕТЕ ДРУГ ДРУГА ============ */}
      <Section eyebrow="Обусловленность" title="Где вы меняете друг друга">
        {condItems.slice(0, 2).map(({ side, item }) => {
          const t = CONDITIONING_BY_CENTER[item.center];
          const s = side === "a" ? t.you : t.partner;
          return (
            <article key={`${side}-${item.center}`} className={`${styles.condCard} ${side === "a" ? styles.condHim : styles.condHer}`}>
              <h3 className={styles.cardTitle}>
                {side === "a" ? `${heName} влияет на тебя` : g("Ты влияешь на {п:него|неё}")}: {t.topic}
              </h3>
              <p className={styles.condMeta}>
                Центр «{centerLabel(item.center)}» открыт {side === "a" ? "у тебя" : "у партнёра"}, а{" "}
                {side === "a" ? "у партнёра" : "у тебя"} включён воротами{" "}
                {item.partnerGates.map(gateName).join(", ")}
              </p>
              <p className={styles.cardText}>{g(t.organ)}</p>
              <p className={styles.cardText}>{g(s.scene)}</p>
              <p className={styles.cardText}>{g(s.light)}</p>
              {item.ownGates.length > 0 && (
                <p className={styles.cardText}>
                  <span className={styles.cardLabel}>
                    {side === "a" ? "Твои ворота здесь: " : "Его ворота здесь: "}
                  </span>
                  {item.ownGates.map(gateName).join(", ")}. {g(s.anchor)}
                </p>
              )}
              <div className={styles.fixedRow}>
                <span className={styles.fixedLabel}>Не изменится</span>
                {g(s.fixed)}
              </div>
              <div className={styles.fixedRow}>
                <span className={styles.fixedLabel}>Изменится</span>
                {g(s.changeable)}
              </div>
            </article>
          );
        })}

        {condItems.length > 2 && (
          <>
            <p className={styles.note}>
              Ещё {condItems.length - 2}{" "}
              {plural(condItems.length - 2, "место", "места", "мест")}, где вы влияете друг на
              друга. Если тема попадёт в больное — разверни её целиком.
            </p>
            {condItems.slice(2).map(({ side, item }) => {
              const t = CONDITIONING_BY_CENTER[item.center];
              const s = side === "a" ? t.you : t.partner;
              return (
                <details key={`${side}-${item.center}`} className={styles.detailsBox}>
                  <summary>
                    <span className={styles.compactName}>
                      {t.topic} — центр «{centerLabel(item.center)}» (открыт {side === "a" ? "у тебя" : "у партнёра"})
                    </span>
                  </summary>
                  <div className={styles.detailsInner}>
                    <p className={styles.cardText}>{g(t.organ)}</p>
                    <p className={styles.cardText}>{g(s.scene)}</p>
                    <p className={styles.cardText}>{g(s.light)}</p>
                    {item.ownGates.length > 0 && (
                      <p className={styles.cardText}>
                        <span className={styles.cardLabel}>Свои ворота в открытом центре: </span>
                        {item.ownGates.map(gateName).join(", ")}. {g(s.anchor)}
                      </p>
                    )}
                    <div className={styles.fixedRow}>
                      <span className={styles.fixedLabel}>Не изменится</span>
                      {g(s.fixed)}
                    </div>
                    <div className={styles.fixedRow}>
                      <span className={styles.fixedLabel}>Изменится</span>
                      {g(s.changeable)}
                    </div>
                  </div>
                </details>
              );
            })}
          </>
        )}
      </Section>

      <hr className={styles.divider} />

      {/* ============ ЧТО НЕ ИЗМЕНИТСЯ ============ */}
      <Section eyebrow="Самая честная часть" title={g("Что в {п:нём|ней} не изменится, а что изменится")}>
        <p className={styles.lede}>{TRIAD_FRAME.intro}</p>
        <p className={styles.lede}>{g(TRIAD_FRAME.formula)}</p>
        <WaterSteamArt />
        <p className={styles.note}>{TRIAD_FRAME.water}</p>
        <p className={styles.note}>{TRIAD_FRAME.trigger}</p>
        <p className={styles.note}>{TRIAD_FRAME.caution}</p>

        {pro.shared.length > 0 && (
          <>
            <h3 className={styles.cardTitle} style={{ marginTop: 28 }}>Темы, которые есть у вас обоих</h3>
            <p className={styles.note}>{TRIAD_FRAME.shared}</p>
            <p className={styles.note}>{TRIAD_FRAME.sharedHowToRead}</p>
            <p className={styles.mark}>{PERSONALIZED_MARK}</p>
            {pro.shared.map((sh) => {
              const k = geneKey(sh.gate)!;
              const gp = gateInPair(sh.gate)!;
              const nm = gateInfo(sh.gate)?.name ?? "";
              const collides = [k.shadow, k.gift, k.siddhi].some(
                (v) => v.toLowerCase() === nm.toLowerCase()
              );
              const explain = collides && !sameNameShown;
              if (explain) sameNameShown = true;
              return (
                <div key={sh.gate}>
                  {explain && <p className={styles.note}>{TRIAD_FRAME.sameName}</p>}
                  <div className={styles.themeCard}>
                    <div className={styles.themeGate}>
                      <span className={styles.themeShared} aria-hidden="true" />
                      {gateName(sh.gate)}
                    </div>
                    <div className={styles.themeRow}>
                      <span className={styles.themeLevel}>в страхе</span>
                      <span className={styles.themeText}>
                        <span className={styles.themeName}>«{k.shadow}»</span> — {g(gp.shadow)}
                      </span>
                    </div>
                    <div className={styles.themeRow}>
                      <span className={styles.themeLevel}>в силе</span>
                      <span className={styles.themeText}>
                        <span className={styles.themeName}>«{k.gift}»</span> — {g(gp.gift)}
                      </span>
                    </div>
                    <div className={styles.themeRow}>
                      <span className={styles.themeLevel}>предел</span>
                      <span className={styles.themeText}>«{k.siddhi}»</span>
                    </div>
                    {gp.key && (
                      <div className={styles.themeKeyRow}>
                        <span className={styles.themeKeyLabel}>Как с этим обращаться</span>
                        {g(gp.key)}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </>
        )}
      </Section>

      <hr className={styles.divider} />

      {/* ============ ЧЕГО В ПАРЕ НЕТ ============ */}
      <Section eyebrow="О чём обычно молчат" title="Чего в вашей паре нет">
        <p className={styles.lede}>{ABSENT_FRAME.intro}</p>
        <p className={styles.note}>{ABSENT_FRAME.norm}</p>
        <p className={styles.note}>{ABSENT_FRAME.water}</p>

        {halfThemes.length > 0 && (
          <>
            <h3 className={styles.cardTitle} style={{ marginTop: 24 }}>{ABSENT_FRAME.halfTitle}</h3>
            <p className={styles.note}>{ABSENT_FRAME.half}</p>
            <ul className={styles.absentList}>
              {halfThemes.map((t) => {
                const present = t.presentGates[0];
                const missing = t.gates.find((x) => !t.presentGates.includes(x))!;
                return (
                  <li key={t.channelKey} className={styles.absentItem}>
                    {channelTheme(t.channelKey) ?? t.channelName}
                    <div className={styles.absentHint}>
                      Есть {gateName(present)}, не хватает {gateName(missing)} — ни у кого из вас.
                    </div>
                  </li>
                );
              })}
            </ul>
            <p className={styles.note}>{ABSENT_FRAME.halfAction}</p>
          </>
        )}

        {noneThemes.length > 0 && (
          <>
            <h3 className={styles.cardTitle} style={{ marginTop: 24 }}>{ABSENT_FRAME.noneTitle}</h3>
            <p className={styles.note}>{ABSENT_FRAME.none}</p>
            <AbsentArt />
            <ul className={styles.absentList}>
              {noneThemes.map((t) => (
                <li key={t.channelKey} className={styles.absentItem}>
                  {channelAbsent(t.channelKey) ?? t.channelName}
                </li>
              ))}
            </ul>
          </>
        )}

        <p className={styles.lede}>{ABSENT_FRAME.closing}</p>
      </Section>

      <hr className={styles.divider} />

      {/* ============ ПОЛНАЯ КАРТА ============ */}
      <Section eyebrow="Справочник пары" title="Полная карта: 26 точек каждого">
        <p className={styles.note}>{MAP_FRAME.intro}</p>
        <details className={styles.detailsBox}>
          <summary>
            <span className={styles.compactName}>Как читать карту: два момента и тринадцать тел</span>
          </summary>
          <div className={styles.detailsInner}>
            <p className={styles.note}>{MAP_FRAME.twoMoments}</p>
            <p className={styles.note}>{MAP_FRAME.personality}</p>
            <p className={styles.note}>{MAP_FRAME.design}</p>
            <p className={styles.note}>{MAP_FRAME.polarity}</p>
            <ul className={styles.bodiesList}>
              {ACTIVATION_BODIES.map((body) => (
                <li key={body}>
                  <strong>{body}</strong> — {ACTIVATION_BODY_MEANING[body]}
                </li>
              ))}
            </ul>
          </div>
        </details>

        <div className={styles.mapCols}>
          {([
            [nameA ? `${nameA} — ты` : "Ты", a],
            [nameB || "Партнёр", b],
          ] as const).map(([title, design]) => (
            <div key={title}>
              <div className={styles.mapColTitle}>{title}</div>
              {([
                ["Личность", design.personalityGates, styles.dotPersonality, "то, как человек себя знает"],
                ["Дизайн", design.designGates, styles.dotDesign, "то, что видят другие"],
              ] as const).map(([part, gates, dotCls, hint]) => (
                <div key={part}>
                  <div className={styles.mapPart}>
                    <span className={dotCls} aria-hidden="true" /> {part} — {hint}
                  </div>
                  {gates.map((x, i) => {
                    const body = ACTIVATION_BODIES[i];
                    const nm = gateLineNameShort(x.gate, x.line);
                    const pol = linePolarity(x.gate, x.line);
                    const mark =
                      pol?.ex === body ? (
                        <span className={styles.polEasy}> · идёт само</span>
                      ) : pol?.det === body ? (
                        <span className={styles.polHard}> · даётся усилием</span>
                      ) : null;
                    return (
                      <div key={`${part}-${body}`} className={styles.mapRow}>
                        <span className={styles.mapBody}>{body}</span> {x.gate}.{x.line}{" "}
                        «{gateInfo(x.gate)?.name ?? "?"}»{nm ? ` — ${nm}` : ""}
                        {mark}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          ))}
        </div>
      </Section>

      <hr className={styles.divider} />

      {/* ============ ЧТО С ЭТИМ ДЕЛАТЬ ============ */}
      <Section eyebrow="Не вердикт, а инструменты" title="Что с этим делать">
        <p className={styles.lede}>{CLOSING.intro}</p>

        <h3 className={styles.cardTitle} style={{ marginTop: 20 }}>{CLOSING.needsTitle}</h3>
        <p className={styles.note}>{g(CLOSING.needsHint)}</p>
        {/* Хвост «это твоё собственное…» один раз в подводке, а не в каждом
            пункте: шесть одинаковых окончаний подряд читались как сбой шаблона. */}
        <ul className={styles.closeList}>
          {[...a.definedCenters].map((center) => (
            <li key={center}>
              {CONDITIONING_BY_CENTER[center].topic} — центр «{centerLabel(center)}»
            </li>
          ))}
        </ul>

        <h3 className={styles.cardTitle} style={{ marginTop: 20 }}>{CLOSING.easyTitle}</h3>
        <p className={styles.note}>{CLOSING.easyHint}</p>
        <ul className={styles.closeList}>
          {chanItems.slice(0, 4).map((item) => {
            const ch = CHANNELS.find((c) => c.key === item.channelKey)!;
            return <li key={ch.key}>{ch.name} — {channelTheme(ch.key)}</li>;
          })}
          {pro.shared.length > 0 && (
            <li>
              Общие темы: {pro.shared.slice(0, 5).map((s) => gateInfo(s.gate)?.name ?? s.gate).join(", ")} —
              здесь вы устроены одинаково, договариваться не нужно.
            </li>
          )}
        </ul>

        {/* У пары может не оказаться «голых» открытых центров — тогда заголовок
            с пустым списком выглядел бы как сбой, поэтому блок условный. */}
        {condItems.some(({ item }) => item.ownGates.length === 0) && (
          <>
            <h3 className={styles.cardTitle} style={{ marginTop: 20 }}>{CLOSING.avoidTitle}</h3>
            <p className={styles.note}>{g(CLOSING.avoidHint)}</p>
            <ul className={styles.closeList}>
              {condItems
                .filter(({ item }) => item.ownGates.length === 0)
                .map(({ side, item }) => (
                  <li key={`${side}-${item.center}`}>
                    Решать вопросы про «{CONDITIONING_BY_CENTER[item.center].topic}» на усталости и
                    в спешке: {side === "a" ? "здесь ты принимаешь" : "здесь партнёр принимает"}{" "}
                    чужое за своё сильнее всего.
                  </li>
                ))}
            </ul>
          </>
        )}

        <div className={styles.qCard}>
          <h3 className={styles.cardTitle}>{CLOSING.questionsTitle}</h3>
          <p className={styles.note}>{CLOSING.questionsHint}</p>
          <ol className={styles.qList}>
            {CLOSING.questions.map((q) => (
              <li key={q}>{g(q)}</li>
            ))}
          </ol>
        </div>

        <div className={styles.disclaimer}>{CLOSING.disclaimer}</div>
        <div className={styles.warmth}>{g(CLOSING.warmth)}</div>
      </Section>
    </div>
  );
}
