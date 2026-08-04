"use client";

import { useState } from "react";
import Link from "next/link";
import type { SystemReport } from "@/lib/engines/types";
import type { HumanDesignRawFeatures } from "@/lib/engines/human_design";
import { CENTER_NAMES } from "@/lib/engines/human-design-tables";
import {
  CHANNEL_SOURCE_COLOR,
  CHANNEL_SOURCE_LABEL,
  CHANNEL_SOURCE_MEANING,
  OPEN_CENTER_FOR_PAIR,
  themeContent,
} from "@/lib/content/human-design";
import { ScoreRing } from "@/components/viz/ScoreRing";
import { CompositeBodygraph } from "@/components/viz/CompositeBodygraph";
import { Legend } from "@/components/viz/Legend";
import { ArticleDisclosure } from "@/components/viz/ArticleDisclosure";
import {
  getHDAuthorityArticle,
  getHDChannelArticle,
  getHDConnectionArticle,
  getHDTypeArticle,
} from "@/lib/content/articles";
import styles from "./systems.module.css";

const SOURCE_ORDER = ["electromagnetic", "both", "a", "b"] as const;

export function HumanDesignSection({
  report,
  nameA = "Партнёр А",
  nameB = "Партнёр Б",
  standaloneHref,
}: {
  report: SystemReport<HumanDesignRawFeatures>;
  nameA?: string;
  nameB?: string;
  standaloneHref?: string;
}) {
  const f = report.rawFeatures;
  const theme = themeContent(f.connectionTheme.defined);
  const composite = f.composite;
  const detailed = !standaloneHref;

  // Связка «карточка канала ↔ линия на бодиграфе»: наведение на карточку
  // подсвечивает линию, клик по линии скроллит к карточке.
  const [hoverChannel, setHoverChannel] = useState<string | null>(null);
  const scrollToChannel = (key: string) => {
    document.getElementById(`hd-channel-${key}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    setHoverChannel(key);
    setTimeout(() => setHoverChannel(null), 2000);
  };

  const counts = SOURCE_ORDER.map((source) => ({
    source,
    items: composite.channels.filter((c) => c.source === source),
  })).filter((g) => g.items.length > 0);

  return (
    <section className={styles.section} aria-labelledby="hd-title">
      <div className={styles.sectionHead}>
        <div className={styles.sectionHeadRow}>
          <div className={styles.eyebrow}>Дизайн человека</div>
          {standaloneHref && (
            <Link href={standaloneHref} className={styles.detailLink}>
              Только эта система →
            </Link>
          )}
        </div>
        <h2 id="hd-title" className={styles.sectionTitle}>
          Композит: что вы с партнёром создаёте вдвоём
        </h2>
        <p className={styles.sectionLede}>
          В Дизайне человека пара образует третью карту — композит. В нём каналы обоих
          складываются, и появляются новые, которых нет ни у кого по отдельности.
        </p>
      </div>

      {/* Заголовочная метрика */}
      <div className={styles.themeCard}>
        <div className={styles.themeKey}>{f.connectionTheme.key}</div>
        <div className={styles.themeMeta}>
          <div className={styles.themeTitle}>
            {theme.subtitle}
            {theme.folkName && <span className={styles.themeFolk}> · {theme.folkName}</span>}
          </div>
          <p className={styles.themeEssence}>{theme.essence}</p>
        </div>
      </div>

      <div className={styles.lightShadow}>
        <div className={styles.lightCard}>
          <span className={styles.lsLabel}>Когда работает</span>
          <p className={styles.lsText}>{theme.light}</p>
        </div>
        <div className={styles.shadowCard}>
          <span className={styles.lsLabel}>Теневая сторона</span>
          <p className={styles.lsText}>{theme.shadow}</p>
        </div>
      </div>

      {detailed && (
        <div className={styles.lightShadow}>
          {[
            { name: nameA, person: f.a, color: CHANNEL_SOURCE_COLOR.a },
            { name: nameB, person: f.b, color: CHANNEL_SOURCE_COLOR.b },
          ].map(({ name, person, color }) => (
            <div key={name} className={styles.partnerCard} style={{ borderColor: color }}>
              <span className={styles.lsLabel} style={{ color }}>
                {name}
              </span>
              <p className={styles.lsText}>
                <strong>{person.type}</strong> · профиль {person.profile}
                <br />
                Авторитет: {person.authority}
                <br />
                Определено центров: {person.definedCenters.length} из 9
              </p>
            </div>
          ))}
        </div>
      )}

      <p className={styles.note}>
        Само по себе число темы — не оценка. В Дизайне человека решает не тема, а вход:
        отношения, в которые оба вошли по своей Стратегии и Авторитету, проживаются
        как ландшафт; отношения, в которые вошли из страха или расчёта, превращают
        напряжение этой же темы в её патологию.
      </p>

      <hr className={styles.divider} />

      <div className={styles.graphLayout}>
        <div>
          <h3 className={styles.blockTitle}>Композитный бодиграф</h3>
          <CompositeBodygraph
            channels={composite.channels}
            definedCenters={composite.definedCenters}
            highlightKey={hoverChannel}
            onChannelClick={scrollToChannel}
          />
          <Legend
            entries={SOURCE_ORDER.map((s) => ({
              color: CHANNEL_SOURCE_COLOR[s],
              text: CHANNEL_SOURCE_LABEL[s],
            }))}
          />
        </div>

        <div className={styles.graphSide}>
          <div>
            <h3 className={styles.blockTitle}>Твои двери наружу</h3>
            {composite.openCenters.length === 0 ? (
              <p className={styles.doshaText}>
                Открытых центров нет — вся девятка определена. Внешнему миру попасть внутрь
                твоей пары почти нечем.
              </p>
            ) : (
              <ul className={styles.openList}>
                {composite.openCenters.map((c) => (
                  <li key={c} className={styles.openItem}>
                    <strong className={styles.openName}>{CENTER_NAMES[c]}</strong>
                    <span className={styles.doshaText}>{OPEN_CENTER_FOR_PAIR[c]}</span>
                  </li>
                ))}
              </ul>
            )}
            <p className={styles.note}>
              Какие именно центры открыты, важнее их количества: открытые центры — это места,
              где вы с партнёром обусловливаетесь внешним вдвоём и одновременно.
            </p>
          </div>
        </div>
      </div>

      <hr className={styles.divider} />

      <div>
        <h3 className={styles.blockTitle}>Каналы композита ({composite.channels.length})</h3>
        <div className={styles.bars}>
          {counts.map((group) => (
            <div key={group.source} className={styles.doshaRow}>
              <div className={styles.doshaHead}>
                <span
                  className={styles.legendSwatchInline}
                  style={{ background: CHANNEL_SOURCE_COLOR[group.source] }}
                  aria-hidden="true"
                />
                <strong className={styles.doshaTitle}>
                  {CHANNEL_SOURCE_LABEL[group.source]} — {group.items.length}
                </strong>
              </div>
              <p className={styles.doshaText}>{CHANNEL_SOURCE_MEANING[group.source]}</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {group.items.map((c) => {
                  const article = getHDChannelArticle(c.key);
                  return (
                    <div
                      key={c.key}
                      id={`hd-channel-${c.key}`}
                      onMouseEnter={() => setHoverChannel(c.key)}
                      onMouseLeave={() => setHoverChannel(null)}
                      style={
                        hoverChannel === c.key
                          ? { outline: "2px solid var(--accent-pink)", outlineOffset: 4, borderRadius: 14, transition: "outline-color 0.2s ease" }
                          : undefined
                      }
                    >
                      {article ? (
                        <ArticleDisclosure
                          article={article}
                          eyebrow={`${c.name} (${c.key})`}
                          moreHref={`/dizajn-cheloveka-sovmestimost/kanaly/${c.key}/`}
                          moreLabel={`Канал ${c.name} (${c.key}): разбор для пары →`}
                        />
                      ) : (
                        <p className={styles.channelList}>
                          {c.name} ({c.key})
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <hr className={styles.divider} />

      <div>
        <h3 className={styles.blockTitle}>Типы связи, которые сложились у вас с партнёром</h3>
        <p className={styles.note} style={{ marginBottom: 4 }}>
          Классические 4 типа связи каналов Дизайна человека — отдельная от Connection
          Theme классификация: она смотрит не на композит целиком, а на то, как именно
          закрывается каждый отдельный канал между вами.
        </p>
        <div className={styles.bars}>
          {(Object.keys(f.connections) as (keyof typeof f.connections)[])
            .filter((themeKey) => f.connections[themeKey].length > 0)
            .map((themeKey) => {
              const article = getHDConnectionArticle(themeKey);
              return article ? (
                <ArticleDisclosure
                  key={themeKey}
                  article={article}
                  eyebrow={`${article.title.split(" в композите")[0]} — ${f.connections[themeKey].length} канал(ов)`}
                  moreHref="/dizajn-cheloveka-sovmestimost/kanaly-svyazi/"
                  moreLabel={`${article.title.split(" в композите")[0]}: подробный разбор →`}
                />
              ) : null;
            })}
        </div>
      </div>

      <hr className={styles.divider} />

      <div>
        <h3 className={styles.blockTitle}>Каждый по отдельности</h3>
        <div className={styles.squares}>
          <div className={styles.personCard}>
            <span className={styles.squareName}>{nameA}</span>
            <span className={styles.personType}>{f.a.type}</span>
            <span className={styles.doshaText}>
              Авторитет: {f.a.authority} · Профиль: {f.a.profile}
            </span>
          </div>
          <div className={styles.personCard}>
            <span className={styles.squareName}>{nameB}</span>
            <span className={styles.personType}>{f.b.type}</span>
            <span className={styles.doshaText}>
              Авторитет: {f.b.authority} · Профиль: {f.b.profile}
            </span>
          </div>
        </div>

        <div className={styles.bars} style={{ marginTop: 16 }}>
          {Array.from(new Set([f.a.type, f.b.type])).map((type) => {
            const article = getHDTypeArticle(type);
            return article ? (
              <ArticleDisclosure
                key={type}
                article={article}
                eyebrow={`Тип «${type}»`}
                moreHref="/dizajn-cheloveka-sovmestimost/tipy/"
                moreLabel={`Тип «${type}» в паре: подробный разбор →`}
              />
            ) : null;
          })}
          {Array.from(new Set([f.a.authority, f.b.authority])).map((authority) => {
            const article = getHDAuthorityArticle(authority);
            return article ? (
              <ArticleDisclosure
                key={authority}
                article={article}
                eyebrow={`Авторитет «${authority}»`}
                moreHref="/dizajn-cheloveka-sovmestimost/avtoritety/"
                moreLabel={`Авторитет «${authority}»: подробный разбор →`}
              />
            ) : null;
          })}
        </div>
      </div>

      <ScoreRing
        percent={report.score}
        gradientId="hd-ring"
        label="Совместимость по Дизайну человека"
        caption="Балл складывается из типов связи между каналами и совпадения ритма принятия решений."
      />

      <p className={styles.note}>
        Метрика Connection Theme — официальная (Jovian Archive). Расхожие английские
        названия тем — устойчивая мнемоника практиков, а не подтверждённая формулировка
        Ра Уру Ху; ниже 5/4 общепринятого названия не существует.
      </p>
    </section>
  );
}
