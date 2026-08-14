"use client";

import { useState } from "react";
import {
  CENTER_NAMES,
  CHANNELS,
  centerOfGate,
  type CenterKey,
} from "@/lib/engines/human-design-tables";
import type { CompositeChannel, PersonChart } from "@/lib/engines/human_design";
import { CHANNEL_SOURCE_COLOR, CHANNEL_SOURCE_LABEL } from "@/lib/content/human-design";
import {
  CENTER_COLOR,
  CENTER_SHAPES,
  GATE_POS,
  VIEWBOX,
  channelHalves,
  type Point,
} from "@/lib/data/human_design/bodygraph-layout";
import { gateInfo } from "@/lib/data/human_design/gates";
import { gateLine } from "@/lib/data/human_design/gate-lines";
import { gateLineName } from "@/lib/data/human_design/gate-line-names";
import { channelTheme } from "@/lib/data/human_design/channel-themes";
import styles from "./viz.module.css";

/** Классические цвета активаций: Личность — тёмная, Дизайн — красный. */
const PERSONALITY = "#3a2c3d";
const DESIGN = "#c0562f";
const UNDEFINED_FILL = "#fff";
const UNDEFINED_STROKE = "#d9cdd6";
const IDLE_CHANNEL = "#f2ebf0";
/** Цвет активаций периода возврата Сатурна. */
const SATURN = "#8c7fb5";

/**
 * Округление до сотых: страница пререндерится в Node, а гидрируется в браузере,
 * и вычисленная координата может разойтись в последнем бите — React считает это
 * расхождением разметки.
 */
function r2(n: number): number {
  return Math.round(n * 100) / 100;
}

type GateState = "none" | "personality" | "design" | "both";

function gateState(chart: PersonChart | null, gate: number): GateState {
  if (!chart) return "none";
  const p = chart.personalityLines[gate] !== undefined;
  const d = chart.designLines[gate] !== undefined;
  if (p && d) return "both";
  if (p) return "personality";
  if (d) return "design";
  return "none";
}

function gateColor(state: GateState): string {
  if (state === "design") return DESIGN;
  if (state === "none") return IDLE_CHANNEL;
  return PERSONALITY;
}

export interface BodygraphProps {
  /** Личная карта — режим одного человека. */
  person?: PersonChart;
  /** Композит — парный режим. */
  composite?: { channels: CompositeChannel[]; definedCenters: CenterKey[] };
  /** Обе карты: нужны для подсказки «какая линия у этих ворот у каждого». */
  a?: PersonChart;
  b?: PersonChart;
  nameA?: string;
  nameB?: string;
  /** Доп. активации (возврат Сатурна): ворота и замкнувшиеся ими каналы. */
  extraGates?: number[];
  extraChannels?: string[];
  /** Ворота периода → линия, отдельно по каждому партнёру. */
  extraLinesA?: Record<number, number>;
  extraLinesB?: Record<number, number>;
  size?: number;
  /** Подпись под картой, когда ничего не выбрано. */
  hint?: string;
  /** Приглушить всё, кроме электромагнитных каналов — «только вдвоём». */
  focusElectromagnetic?: boolean;
  /** Подпись карты в развороте на весь экран. */
  fullscreenTitle?: string;
}

export function Bodygraph({
  person,
  composite,
  a,
  b,
  nameA = "Первый партнёр",
  nameB = "Второй партнёр",
  extraGates = [],
  extraChannels = [],
  extraLinesA,
  extraLinesB,
  size = 320,
  hint = "Наведи курсор или коснись канала — расскажем, что это.",
  focusElectromagnetic = false,
  fullscreenTitle,
}: BodygraphProps) {
  // На телефоне 64 номера ворот в карте шириной 270px рендерятся мельче 5px —
  // прочитать нельзя. Разворот на весь экран решает это, не раздувая карту в
  // потоке страницы.
  const [full, setFull] = useState(false);
  const [selected, setSelected] = useState<
    { kind: "channel"; key: string } | { kind: "gate"; gate: number } | null
  >(null);

  const isPair = Boolean(composite);
  const definedCenters: CenterKey[] = composite
    ? composite.definedCenters
    : person
      ? person.definedCenterKeys
      : [];
  const compositeByKey = new Map((composite?.channels ?? []).map((c) => [c.key, c]));
  const extraGateSet = new Set(extraGates);
  const extraChannelSet = new Set(extraChannels);

  /** Цвет половины канала со стороны конкретных ворот. */
  function halfColor(gate: number, channelKey: string): string {
    if (isPair) {
      const c = compositeByKey.get(channelKey);
      // Режим «только вдвоём»: остальное уводим в фон, чтобы главное не
      // терялось среди всего, что и так есть у каждого по отдельности.
      if (focusElectromagnetic && c && c.source !== "electromagnetic") return IDLE_CHANNEL;
      // Канал периода красим фиолетовым только если натально его нет вовсе:
      // иначе «погода» перекрасила бы то, что и так есть в карте.
      if (!c) return extraChannelSet.has(channelKey) || extraGateSet.has(gate) ? SATURN : IDLE_CHANNEL;
      if (c.source === "electromagnetic") {
        // Каждый даёт свою половину — красим половину по её владельцу.
        const owner = a && a.activatedGates.includes(gate) ? "a" : "b";
        return CHANNEL_SOURCE_COLOR[owner];
      }
      return CHANNEL_SOURCE_COLOR[c.source];
    }
    const own = gateState(person ?? null, gate);
    if (own === "none" && (extraChannelSet.has(channelKey) || extraGateSet.has(gate))) return SATURN;
    return gateColor(own);
  }

  /** В режиме «только вдвоём» остальное уходит в фон и по толщине тоже. */
  function isDimmed(key: string): boolean {
    if (!focusElectromagnetic || !isPair) return false;
    const c = compositeByKey.get(key);
    return !c || c.source !== "electromagnetic";
  }

  function channelActive(key: string, g1: number, g2: number): boolean {
    if (extraChannelSet.has(key)) return true;
    if (isPair) return compositeByKey.has(key);
    if (!person) return false;
    return person.definedChannels.includes(key) || person.definedChannels.includes(`${g2}-${g1}`);
  }

  /** Точка, у которой всплывает подсказка: сами ворота либо середина канала. */
  const anchor: Point | null = (() => {
    if (!selected) return null;
    if (selected.kind === "gate") return GATE_POS[selected.gate];
    const ch = CHANNELS.find((c) => c.key === selected.key);
    if (!ch) return null;
    const { first, second } = channelHalves(ch.key, ch.gates[0], ch.gates[1]);
    const pts = [...first, ...second.slice(1)];
    return pts[Math.floor(pts.length / 2)];
  })();

  const selectedInfo = (() => {
    if (!selected) return null;
    if (selected.kind === "channel") {
      const ch = CHANNELS.find((c) => c.key === selected.key);
      if (!ch) return null;
      const [g1, g2] = ch.gates;
      const c = compositeByKey.get(ch.key);
      const extra = extraChannelSet.has(ch.key);
      const gi1 = gateInfo(g1);
      const gi2 = gateInfo(g2);
      return {
        title: `Канал ${ch.key} «${ch.name}»`,
        lines: [
          // Сначала о чём канал, потом уже из чего он собран: человек нажимает
          // на линию, чтобы понять смысл, а не чтобы свериться с номерами.
          channelTheme(ch.key) ?? "",
          `${g1} ${gi1 ? `«${gi1.name}» ` : ""}(${CENTER_NAMES[centerOfGate(g1)]}) — ${g2} ${gi2 ? `«${gi2.name}» ` : ""}(${CENTER_NAMES[centerOfGate(g2)]}).`,
          c
            ? CHANNEL_SOURCE_LABEL[c.source]
            : extra
              ? "В карте рождения этого канала нет — он появляется в период возврата Сатурна."
              : "",
        ].filter(Boolean),
      };
    }
    const gate = selected.gate;
    const center = CENTER_NAMES[centerOfGate(gate)];
    // Ворота периода возврата Сатурна учитываем наравне с натальными: иначе
    // на активном фиолетовом канале подсказка сообщала бы, что ворот нет.
    const describe = (
      chart: PersonChart | undefined,
      name: string,
      periodLines?: Record<number, number>
    ) => {
      if (!chart) return null;
      const p = chart.personalityLines[gate];
      const d = chart.designLines[gate];
      const period = periodLines?.[gate];
      // Запись «ворота.линия», имя этой позиции и её смысл. Имя — из книги
      // (терминология системы), фраза — наша. Профильные имена линий сюда не
      // подставляем: они про профиль, а не про активацию ворот.
      const say = (label: string, line: number) => {
        const nm = gateLineName(gate, line);
        const meaning = gateLine(gate, line);
        const head = nm ? `${label} ${gate}.${line} «${nm}»` : `${label} ${gate}.${line}`;
        return meaning ? `${head} — ${meaning}` : `${head}.`;
      };
      const parts: string[] = [];
      if (p !== undefined) parts.push(say("Личность", p));
      if (d !== undefined) parts.push(say("Дизайн", d));
      if (period !== undefined) parts.push(say("Возврат Сатурна", period));
      if (parts.length === 0) return `${name}: этих ворот нет.`;
      return `${name}. ${parts.join(" ")}`;
    };
    const gi = gateInfo(gate);
    return {
      title: gi ? `Ворота ${gate} «${gi.name}» · ${center}` : `Ворота ${gate} · ${center}`,
      lines: [
        // Суть ворот идёт первой строкой: номер сам по себе человеку ничего
        // не говорит, а именно за смыслом он на кружок и нажал.
        gi?.essence ?? "",
        describe(a ?? person, nameA, extraLinesA),
        describe(b, nameB, extraLinesB),
      ].filter((x): x is string => Boolean(x)),
    };
  })();

  return (
    <div className={styles.bodygraphWrap}>
      {/* Сцена шириной ровно с карту: подсказка зажимается по её границам,
          а не по всей ширине блока — иначе у краёв она вылезала. */}
      <div className={styles.bodygraphStage}>
      <svg
        viewBox={`0 0 ${VIEWBOX.width} ${VIEWBOX.height}`}
        width={size}
        height={(size * VIEWBOX.height) / VIEWBOX.width}
        role="img"
        aria-label={
          isPair ? "Композитный бодиграф пары" : `Бодиграф: ${person?.type ?? ""}`
        }
        className={styles.bodygraphSvg}
      >
        {/* Каналы: сначала все неактивные подложкой, потом активные поверх */}
        {CHANNELS.map((ch) => {
          const [g1, g2] = ch.gates;
          const { first, second } = channelHalves(ch.key, g1, g2);
          const active = channelActive(ch.key, g1, g2);
          const isSel = selected?.kind === "channel" && selected.key === ch.key;
          const pts = (p: Point[]) => p.map(([x, y]) => `${r2(x)},${r2(y)}`).join(" ");
          const dim = isDimmed(ch.key);
          const width = dim ? 1.6 : isSel ? 6.5 : active ? 5 : 1.6;
          return (
            <g
              key={ch.key}
              onMouseEnter={() => active && setSelected({ kind: "channel", key: ch.key })}
              onMouseLeave={() => setSelected(null)}
              onClick={() => active && setSelected({ kind: "channel", key: ch.key })}
              style={{ cursor: active ? "pointer" : "default" }}
            >
              {/* широкая прозрачная «дорожка» — чтобы в канал было легко попасть */}
              <polyline
                points={pts([...first, ...second.slice(1)])}
                fill="none"
                stroke="transparent"
                strokeWidth={15}
              />
              <polyline
                points={pts(first)}
                fill="none"
                stroke={active ? halfColor(g1, ch.key) : IDLE_CHANNEL}
                strokeWidth={width}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <polyline
                points={pts(second)}
                fill="none"
                stroke={active ? halfColor(g2, ch.key) : IDLE_CHANNEL}
                strokeWidth={width}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>
          );
        })}

        {/* Центры */}
        {(Object.keys(CENTER_SHAPES) as CenterKey[]).map((key) => {
          const shape = CENTER_SHAPES[key];
          const defined = definedCenters.includes(key);
          // Определённый центр закрашивается СВОИМ каноническим цветом:
          // по ним карту и узнают. Неопределённый — белый с тонким контуром.
          const props = {
            fill: defined ? CENTER_COLOR[key].fill : UNDEFINED_FILL,
            stroke: defined ? CENTER_COLOR[key].stroke : UNDEFINED_STROKE,
            strokeWidth: defined ? 1.8 : 1.2,
          };
          return (
            <g key={key}>
              {shape.polygon ? (
                <polygon points={shape.polygon} {...props} />
              ) : (
                <rect {...shape.rect!} {...props} />
              )}
              <title>
                {CENTER_NAMES[key]} — {defined ? "определён" : "открыт"}
              </title>
            </g>
          );
        })}

        {/* Ворота поверх центров */}
        {(Object.keys(GATE_POS) as unknown as string[]).map((g) => {
          const gate = Number(g);
          const [x, y] = GATE_POS[gate];
          const inPair = isPair;
          const stateA = gateState(a ?? person ?? null, gate);
          const stateB = gateState(b ?? null, gate);
          const extra = extraGateSet.has(gate);
          // Натальная активация всегда важнее «погоды»: ворота, которые есть в
          // карте рождения, не должны перекрашиваться в цвет периода.
          const natalActive = inPair ? stateA !== "none" || stateB !== "none" : stateA !== "none";
          const active = natalActive || extra;
          const shared = inPair && stateA !== "none" && stateB !== "none";
          const isSel = selected?.kind === "gate" && selected.gate === gate;

          // Ворота, не входящие ни в один электромагнитный канал, тоже гаснут.
          const emGate =
            !focusElectromagnetic ||
            !isPair ||
            (composite?.channels ?? []).some(
              (c) => c.source === "electromagnetic" && c.gates.includes(gate)
            );
          const fill = !emGate
            ? "#fff"
            : natalActive
            ? shared
              ? CHANNEL_SOURCE_COLOR.both
              : inPair
                ? CHANNEL_SOURCE_COLOR[stateA !== "none" ? "a" : "b"]
                : gateColor(stateA)
            : extra
              ? SATURN
              : "#fff";

          return (
            <g
              key={gate}
              onMouseEnter={() => setSelected({ kind: "gate", gate })}
              onMouseLeave={() => setSelected(null)}
              onClick={() => setSelected({ kind: "gate", gate })}
              style={{ cursor: "pointer" }}
            >
              <circle cx={x} cy={y} r={isSel ? 8.2 : 6.4} fill={fill} stroke="#fff" strokeWidth={1.4} />
              <text
                x={x}
                y={y + 2.6}
                textAnchor="middle"
                className={styles.gateNumber}
                fill={active ? "#fff" : "#b4a3b0"}
              >
                {gate}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Подсказка всплывает у самого элемента, а не внизу: иначе на каждый
          клик приходится переводить взгляд через всю карту и обратно. Позиция
          в процентах от viewBox, поэтому не съезжает при любом масштабе.
          Уходит влево у правого края и вниз у верхнего, чтобы не обрезалась. */}
      {selectedInfo && anchor && (
        <div
          className={styles.bodygraphTip}
          style={{
            // Подсказка центрируется на элементе и зажимается в границы карты:
            // сама карта узкая, и без ограничения подсказка вылезала за край.
            left: `clamp(4px, calc(${(anchor[0] / VIEWBOX.width) * 100}% - 105px), calc(100% - 214px))`,
            top: `${(anchor[1] / VIEWBOX.height) * 100}%`,
            transform:
              anchor[1] < VIEWBOX.height * 0.25 ? "translateY(14px)" : "translateY(calc(-100% - 14px))",
          }}
          role="status"
        >
          <strong className={styles.bodygraphInfoTitle}>{selectedInfo.title}</strong>
          {selectedInfo.lines.map((l) => (
            <span key={l} className={styles.bodygraphInfoLine}>
              {l}
            </span>
          ))}
        </div>
      )}
      </div>

      <div className={styles.bodygraphInfo} aria-live="polite">
        <span className={styles.bodygraphInfoLine}>
          {selectedInfo ? selectedInfo.title : hint}
        </span>
      </div>

      <button type="button" className={styles.bodygraphExpand} onClick={() => setFull(true)}>
        Развернуть карту
      </button>

      {full && (
        <div className={styles.bodygraphModal} role="dialog" aria-modal="true">
          <div className={styles.bodygraphModalHead}>
            <strong>{fullscreenTitle ?? "Бодиграф"}</strong>
            <button type="button" onClick={() => setFull(false)} className={styles.bodygraphClose}>
              Закрыть
            </button>
          </div>
          <div className={styles.bodygraphModalBody}>
            <Bodygraph
              person={person}
              composite={composite}
              a={a}
              b={b}
              nameA={nameA}
              nameB={nameB}
              extraGates={extraGates}
              extraChannels={extraChannels}
              extraLinesA={extraLinesA}
              extraLinesB={extraLinesB}
              focusElectromagnetic={focusElectromagnetic}
              size={560}
              hint={hint}
            />
          </div>
        </div>
      )}
    </div>
  );
}
