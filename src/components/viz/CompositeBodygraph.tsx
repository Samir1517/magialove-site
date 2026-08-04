import { CENTER_NAMES, centerOfGate, type CenterKey } from "@/lib/engines/human-design-tables";
import type { CompositeChannel } from "@/lib/engines/human_design";
import { CHANNEL_SOURCE_COLOR } from "@/lib/content/human-design";

/**
 * Композитный бодиграф пары: 9 центров и определённые в композите каналы,
 * раскрашенные по источнику (у обоих / у одного / электромагнитный).
 *
 * Схема упрощённая: каналы рисуются линиями между центрами, а не полными
 * парами ворот классической карты. Для задачи «увидеть, что и кем определено
 * в паре» этого достаточно; воспроизводить полную графику Rave-бодиграфа со
 * всеми 64 воротами здесь избыточно.
 */

interface ShapeProps {
  fill: string;
  stroke: string;
  strokeWidth: number;
  strokeDasharray?: string;
}

interface Center {
  /** Точка привязки линий канала. */
  anchor: [number, number];
  render: (p: ShapeProps) => React.ReactNode;
}

const CENTERS: Record<CenterKey, Center> = {
  head: { anchor: [160, 50], render: (p) => <polygon points="160,15 205,72 115,72" {...p} /> },
  ajna: { anchor: [160, 122], render: (p) => <polygon points="115,96 205,96 160,152" {...p} /> },
  throat: {
    anchor: [160, 206],
    render: (p) => <rect x="122" y="175" width="76" height="62" rx="6" {...p} />,
  },
  g: { anchor: [160, 313], render: (p) => <polygon points="160,265 208,313 160,361 112,313" {...p} /> },
  heart: { anchor: [247, 300], render: (p) => <polygon points="220,300 268,276 268,324" {...p} /> },
  spleen: { anchor: [62, 395], render: (p) => <polygon points="28,352 28,438 96,395" {...p} /> },
  solarplexus: {
    anchor: [258, 395],
    render: (p) => <polygon points="292,352 292,438 224,395" {...p} />,
  },
  sacral: {
    anchor: [160, 426],
    render: (p) => <rect x="122" y="395" width="76" height="62" rx="6" {...p} />,
  },
  root: {
    anchor: [160, 531],
    render: (p) => <rect x="122" y="500" width="76" height="62" rx="6" {...p} />,
  },
};

const ORDER = Object.keys(CENTERS) as CenterKey[];

/**
 * Округление координат до сотых: страница пререндерится в Node, а гидрируется
 * в браузере, и Math.hypot там может разойтись в последнем бите — React считает
 * это расхождением разметки и ругается на гидрацию.
 */
function r2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function CompositeBodygraph({
  channels,
  definedCenters,
}: {
  channels: CompositeChannel[];
  definedCenters: CenterKey[];
}) {
  const defined = new Set(definedCenters);

  // Несколько каналов между одной парой центров разводим перпендикулярным сдвигом,
  // иначе они лягут друг на друга (напр. 10-20, 20-34, 20-57 у Горла и Сакрала).
  const byPair = new Map<string, CompositeChannel[]>();
  for (const ch of channels) {
    const c1 = centerOfGate(ch.gates[0]);
    const c2 = centerOfGate(ch.gates[1]);
    if (c1 === c2) continue; // канал внутри одного центра рисовать нечем
    const pairKey = [c1, c2].sort().join("|");
    const bucket = byPair.get(pairKey);
    if (bucket) bucket.push(ch);
    else byPair.set(pairKey, [ch]);
  }

  const lines: React.ReactNode[] = [];
  for (const [pairKey, group] of byPair) {
    const [c1, c2] = pairKey.split("|") as CenterKey[];
    const [x1, y1] = CENTERS[c1].anchor;
    const [x2, y2] = CENTERS[c2].anchor;
    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.hypot(dx, dy) || 1;
    // Единичная нормаль — чтобы развести параллельные каналы одной пары центров.
    const nx = -dy / len;
    const ny = dx / len;

    group.forEach((ch, i) => {
      const offset = (i - (group.length - 1) / 2) * 7;
      const lx1 = r2(x1 + nx * offset);
      const ly1 = r2(y1 + ny * offset);
      const lx2 = r2(x2 + nx * offset);
      const ly2 = r2(y2 + ny * offset);

      if (ch.source === "electromagnetic") {
        // Конвенция ниши: электромагнитный канал — две половинки цветов
        // партнёров, встречающиеся в середине, + «искра» в точке стыка:
        // видно, как двое буквально достраивают друг друга.
        const gradId = `em-${ch.key}`;
        const mx = r2((lx1 + lx2) / 2);
        const my = r2((ly1 + ly2) / 2);
        lines.push(
          <g key={ch.key}>
            <defs>
              <linearGradient id={gradId} gradientUnits="userSpaceOnUse" x1={lx1} y1={ly1} x2={lx2} y2={ly2}>
                <stop offset="0%" stopColor={CHANNEL_SOURCE_COLOR.a} />
                <stop offset="48%" stopColor={CHANNEL_SOURCE_COLOR.a} />
                <stop offset="52%" stopColor={CHANNEL_SOURCE_COLOR.b} />
                <stop offset="100%" stopColor={CHANNEL_SOURCE_COLOR.b} />
              </linearGradient>
            </defs>
            <line x1={lx1} y1={ly1} x2={lx2} y2={ly2} stroke={`url(#${gradId})`} strokeWidth={5} strokeLinecap="round">
              <title>{`${ch.name} (${ch.key}) — электромагнитный: каждый даёт свою половину`}</title>
            </line>
            <circle cx={mx} cy={my} r={4.5} fill="#fff" stroke={CHANNEL_SOURCE_COLOR.electromagnetic} strokeWidth={2} />
          </g>
        );
        return;
      }

      lines.push(
        <line
          key={ch.key}
          x1={lx1}
          y1={ly1}
          x2={lx2}
          y2={ly2}
          stroke={CHANNEL_SOURCE_COLOR[ch.source]}
          strokeWidth={5}
          strokeLinecap="round"
        >
          <title>{`${ch.name} (${ch.key})`}</title>
        </line>
      );
    });
  }

  return (
    <svg
      viewBox="0 0 320 580"
      width="100%"
      style={{ maxWidth: 300, height: "auto" }}
      role="img"
      aria-label={`Композитный бодиграф пары: определено ${definedCenters.length} центров из девяти`}
    >
      {/* Каналы под фигурами центров, чтобы линии уходили «внутрь» фигур. */}
      <g>{lines}</g>
      <g>
        {ORDER.map((key) => {
          const isDefined = defined.has(key);
          return (
            <g key={key}>
              {CENTERS[key].render({
                fill: isDefined ? "#f6efe2" : "#ffffff",
                stroke: isDefined ? "#b99d74" : "#ddd0da",
                strokeWidth: 1.5,
                strokeDasharray: isDefined ? undefined : "5 4",
              })}
              <title>
                {`${CENTER_NAMES[key]} — ${isDefined ? "определён в композите" : "открыт в композите"}`}
              </title>
            </g>
          );
        })}
      </g>
    </svg>
  );
}
