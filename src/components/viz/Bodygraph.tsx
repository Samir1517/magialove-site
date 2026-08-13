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
  CENTER_SHAPES,
  GATE_POS,
  VIEWBOX,
  channelMid,
} from "@/lib/data/human_design/bodygraph-layout";
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
  size?: number;
  /** Подпись под картой, когда ничего не выбрано. */
  hint?: string;
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
  size = 320,
  hint = "Наведи курсор или коснись канала — расскажем, что это.",
}: BodygraphProps) {
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

  function channelActive(key: string, g1: number, g2: number): boolean {
    if (extraChannelSet.has(key)) return true;
    if (isPair) return compositeByKey.has(key);
    if (!person) return false;
    return person.definedChannels.includes(key) || person.definedChannels.includes(`${g2}-${g1}`);
  }

  const selectedInfo = (() => {
    if (!selected) return null;
    if (selected.kind === "channel") {
      const ch = CHANNELS.find((c) => c.key === selected.key);
      if (!ch) return null;
      const [g1, g2] = ch.gates;
      const c = compositeByKey.get(ch.key);
      const extra = extraChannelSet.has(ch.key);
      return {
        title: `Канал ${ch.key} «${ch.name}»`,
        lines: [
          `Ворота ${g1} (${CENTER_NAMES[centerOfGate(g1)]}) — ворота ${g2} (${CENTER_NAMES[centerOfGate(g2)]}).`,
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
    const describe = (chart: PersonChart | undefined, name: string) => {
      if (!chart) return null;
      const p = chart.personalityLines[gate];
      const d = chart.designLines[gate];
      if (p === undefined && d === undefined) return `${name}: этих ворот нет.`;
      const parts: string[] = [];
      if (p !== undefined) parts.push(`Личность — линия ${p}`);
      if (d !== undefined) parts.push(`Дизайн — линия ${d}`);
      return `${name}: ${parts.join(", ")}.`;
    };
    return {
      title: `Ворота ${gate} · ${center}`,
      lines: [describe(a ?? person, nameA), describe(b, nameB)].filter(
        (x): x is string => Boolean(x)
      ),
    };
  })();

  return (
    <div className={styles.bodygraphWrap}>
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
          const p1 = GATE_POS[g1];
          const p2 = GATE_POS[g2];
          const mid = channelMid(ch.key, p1, p2);
          const active = channelActive(ch.key, g1, g2);
          const isSel = selected?.kind === "channel" && selected.key === ch.key;
          return (
            <g
              key={ch.key}
              onMouseEnter={() => active && setSelected({ kind: "channel", key: ch.key })}
              onMouseLeave={() => setSelected(null)}
              onClick={() => active && setSelected({ kind: "channel", key: ch.key })}
              style={{ cursor: active ? "pointer" : "default" }}
            >
              {/* широкая прозрачная «дорожка» для попадания курсором */}
              <polyline
                points={`${r2(p1[0])},${r2(p1[1])} ${r2(mid[0])},${r2(mid[1])} ${r2(p2[0])},${r2(p2[1])}`}
                fill="none"
                stroke="transparent"
                strokeWidth={14}
              />
              <line
                x1={r2(p1[0])}
                y1={r2(p1[1])}
                x2={r2(mid[0])}
                y2={r2(mid[1])}
                stroke={active ? halfColor(g1, ch.key) : IDLE_CHANNEL}
                strokeWidth={isSel ? 6 : active ? 4.5 : 1.6}
                strokeLinecap="round"
              />
              <line
                x1={r2(mid[0])}
                y1={r2(mid[1])}
                x2={r2(p2[0])}
                y2={r2(p2[1])}
                stroke={active ? halfColor(g2, ch.key) : IDLE_CHANNEL}
                strokeWidth={isSel ? 6 : active ? 4.5 : 1.6}
                strokeLinecap="round"
              />
            </g>
          );
        })}

        {/* Центры */}
        {(Object.keys(CENTER_SHAPES) as CenterKey[]).map((key) => {
          const shape = CENTER_SHAPES[key];
          const defined = definedCenters.includes(key);
          const props = {
            fill: defined ? "#f6eef2" : UNDEFINED_FILL,
            stroke: defined ? "#c9a9bd" : UNDEFINED_STROKE,
            strokeWidth: defined ? 2 : 1.2,
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

          const fill = natalActive
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
              <circle cx={x} cy={y} r={isSel ? 8.6 : 6.9} fill={fill} stroke="#fff" strokeWidth={1.4} />
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

      <div className={styles.bodygraphInfo} aria-live="polite">
        {selectedInfo ? (
          <>
            <strong className={styles.bodygraphInfoTitle}>{selectedInfo.title}</strong>
            {selectedInfo.lines.map((l) => (
              <span key={l} className={styles.bodygraphInfoLine}>
                {l}
              </span>
            ))}
          </>
        ) : (
          <span className={styles.bodygraphInfoLine}>{hint}</span>
        )}
      </div>
    </div>
  );
}
