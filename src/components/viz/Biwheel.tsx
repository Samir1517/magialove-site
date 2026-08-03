import type { GrahaPosition } from "@/lib/engines/jyotish";
import { RASHI_NAMES } from "@/lib/engines/jyotish-tables";

/**
 * Биколесо пары: два концентрических круга с сидерическими положениями девяти
 * грах обоих партнёров по 12 знакам, плюс линии синастрических аспектов между
 * ними.
 *
 * Ориентация традиционная: 0° Овна слева (9 часов), знаки идут против часовой
 * стрелки — поэтому экранный угол θ = 180° + долгота.
 */

const SIZE = 460;
const CX = SIZE / 2;
const CY = SIZE / 2;

const R_ZODIAC_OUT = 222;
const R_ZODIAC_IN = 188;
const R_RING_B = 164; // внешнее кольцо — партнёр Б
const R_RING_A = 122; // внутреннее кольцо — партнёр А
const R_INNER = 96; // круг аспектов

/**
 * Округление координат до сотых обязательно, а не косметично: страница
 * пререндерится в Node, а гидрируется в браузере, и Math.cos/Math.sin там могут
 * разойтись в последнем бите. React считает это расхождением разметки и ругается
 * на гидрацию. Округление до 2 знаков убирает разницу и заодно уменьшает HTML.
 */
function r2(n: number): number {
  return Math.round(n * 100) / 100;
}

function polar(r: number, lon: number): [number, number] {
  const theta = ((180 + lon) * Math.PI) / 180;
  return [r2(CX + r * Math.cos(theta)), r2(CY - r * Math.sin(theta))];
}

/**
 * Разводит близкие по долготе точки, чтобы глифы не наезжали друг на друга.
 * Работает по кругу: сортируем и раздвигаем соседей до минимального зазора.
 */
function spread(positions: GrahaPosition[], minGap = 9): Map<string, number> {
  const sorted = [...positions].sort((x, y) => x.siderealLon - y.siderealLon);
  const out = sorted.map((p) => p.siderealLon);
  for (let pass = 0; pass < 4; pass++) {
    for (let i = 0; i < out.length; i++) {
      const j = (i + 1) % out.length;
      let gap = out[j] - out[i];
      if (j === 0) gap += 360;
      if (gap < minGap) {
        const push = (minGap - gap) / 2;
        out[i] -= push;
        out[j] += push;
      }
    }
  }
  return new Map(sorted.map((p, i) => [p.key, ((out[i] % 360) + 360) % 360]));
}

// --- Аспекты ---------------------------------------------------------------

interface AspectDef {
  name: string;
  angle: number;
  orb: number;
  color: string;
}

/**
 * Мажорные аспекты птолемеевой системы. Цвета — из палитры проекта: соединение
 * золотом (слияние), гармоничные розовым (течение), напряжённые лиловым
 * (сопротивление). Красного нет сознательно: напряжённый аспект — не «плохо».
 */
const ASPECTS: AspectDef[] = [
  { name: "соединение", angle: 0, orb: 7, color: "#b99d74" },
  { name: "оппозиция", angle: 180, orb: 7, color: "#9b7fb0" },
  { name: "трин", angle: 120, orb: 6, color: "#d48ca6" },
  { name: "квадрат", angle: 90, orb: 6, color: "#9b7fb0" },
  { name: "секстиль", angle: 60, orb: 4, color: "#d48ca6" },
];

export interface Aspect {
  a: GrahaPosition;
  b: GrahaPosition;
  def: AspectDef;
  exactness: number;
}

export function findAspects(aList: GrahaPosition[], bList: GrahaPosition[]): Aspect[] {
  const found: Aspect[] = [];
  for (const a of aList) {
    for (const b of bList) {
      let diff = Math.abs(a.siderealLon - b.siderealLon) % 360;
      if (diff > 180) diff = 360 - diff;
      for (const def of ASPECTS) {
        const delta = Math.abs(diff - def.angle);
        if (delta <= def.orb) {
          found.push({ a, b, def, exactness: delta });
          break;
        }
      }
    }
  }
  return found.sort((x, y) => x.exactness - y.exactness);
}

// --- Компонент -------------------------------------------------------------

export function Biwheel({
  aGrahas,
  bGrahas,
  nameA,
  nameB,
}: {
  aGrahas: GrahaPosition[];
  bGrahas: GrahaPosition[];
  nameA: string;
  nameB: string;
}) {
  const aSpread = spread(aGrahas);
  const bSpread = spread(bGrahas);
  const aspects = findAspects(aGrahas, bGrahas);

  return (
    <svg
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      width="100%"
      style={{ maxWidth: SIZE, height: "auto" }}
      role="img"
      aria-label={`Биколесо пары: положения девяти грах ${nameA} и ${nameB} по 12 знакам зодиака`}
    >
      {/* Кольца */}
      <circle cx={CX} cy={CY} r={R_ZODIAC_OUT} fill="#fffcfd" stroke="#e8dce6" strokeWidth={1} />
      <circle cx={CX} cy={CY} r={R_ZODIAC_IN} fill="none" stroke="#e8dce6" strokeWidth={1} />
      <circle cx={CX} cy={CY} r={R_INNER} fill="#fffcfd" stroke="#e8dce6" strokeWidth={1} />

      {/* Сектора знаков */}
      {RASHI_NAMES.map((name, i) => {
        const start = i * 30;
        const [x1, y1] = polar(R_ZODIAC_IN, start);
        const [x2, y2] = polar(R_ZODIAC_OUT, start);
        const [lx, ly] = polar((R_ZODIAC_IN + R_ZODIAC_OUT) / 2, start + 15);
        return (
          <g key={name}>
            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#e8dce6" strokeWidth={1} />
            <text
              x={lx}
              y={ly}
              textAnchor="middle"
              dominantBaseline="central"
              style={{ font: "500 10px var(--font-body)", fill: "#a99aa9" }}
            >
              {name}
            </text>
          </g>
        );
      })}

      {/* Градусные метки каждые 10° */}
      {Array.from({ length: 36 }, (_, i) => i * 10).map((deg) => {
        const [x1, y1] = polar(R_ZODIAC_IN, deg);
        const [x2, y2] = polar(R_ZODIAC_IN - 6, deg);
        return <line key={deg} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#efe4ec" strokeWidth={1} />;
      })}

      {/* Аспектные линии в центре */}
      <g opacity={0.75}>
        {aspects.map((asp) => {
          const [x1, y1] = polar(R_INNER, asp.a.siderealLon);
          const [x2, y2] = polar(R_INNER, asp.b.siderealLon);
          return (
            <line
              key={`${asp.a.key}-${asp.b.key}`}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={asp.def.color}
              strokeWidth={asp.def.angle === 0 ? 1.8 : 1.2}
            >
              <title>{`${asp.a.name} ${asp.def.name} ${asp.b.name} (орб ${asp.exactness.toFixed(1)}°)`}</title>
            </line>
          );
        })}
      </g>

      {/* Грахи партнёра А (внутреннее кольцо) */}
      <g>
        {aGrahas.map((g) => {
          const lon = aSpread.get(g.key) ?? g.siderealLon;
          const [x, y] = polar(R_RING_A, lon);
          const [tx, ty] = polar(R_RING_A - 20, lon);
          const [px, py] = polar(R_INNER, g.siderealLon);
          return (
            <g key={g.key}>
              <line x1={x} y1={y} x2={px} y2={py} stroke="#edc4cd" strokeWidth={0.8} />
              <circle cx={x} cy={y} r={12} fill="#fbeef1" stroke="#d48ca6" strokeWidth={1} />
              <text
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="central"
                style={{ font: "13px var(--font-body)", fill: "#a2698a" }}
              >
                {g.symbol}
                <title>{`${nameA}: ${g.name} — ${g.rashiName} ${g.degreeInRashi.toFixed(1)}°`}</title>
              </text>
              <text
                x={tx}
                y={ty}
                textAnchor="middle"
                dominantBaseline="central"
                style={{ font: "500 8px var(--font-body)", fill: "#c3a9bd" }}
              >
                {Math.floor(g.degreeInRashi)}°
              </text>
            </g>
          );
        })}
      </g>

      {/* Грахи партнёра Б (внешнее кольцо) */}
      <g>
        {bGrahas.map((g) => {
          const lon = bSpread.get(g.key) ?? g.siderealLon;
          const [x, y] = polar(R_RING_B, lon);
          const [tx, ty] = polar(R_RING_B - 20, lon);
          return (
            <g key={g.key}>
              <circle cx={x} cy={y} r={12} fill="#f2ecf8" stroke="#9b7fb0" strokeWidth={1} />
              <text
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="central"
                style={{ font: "13px var(--font-body)", fill: "#7a5f90" }}
              >
                {g.symbol}
                <title>{`${nameB}: ${g.name} — ${g.rashiName} ${g.degreeInRashi.toFixed(1)}°`}</title>
              </text>
              <text
                x={tx}
                y={ty}
                textAnchor="middle"
                dominantBaseline="central"
                style={{ font: "500 8px var(--font-body)", fill: "#b3a2c1" }}
              >
                {Math.floor(g.degreeInRashi)}°
              </text>
            </g>
          );
        })}
      </g>

      {/* Центр */}
      <text
        x={CX}
        y={CY - 8}
        textAnchor="middle"
        style={{ font: "italic 15px var(--font-display)", fill: "#7a6a7d" }}
      >
        {nameA}
      </text>
      <text
        x={CX}
        y={CY + 12}
        textAnchor="middle"
        style={{ font: "italic 15px var(--font-display)", fill: "#7a6a7d" }}
      >
        и {nameB}
      </text>
    </svg>
  );
}
