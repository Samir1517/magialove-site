/**
 * Иллюстрации страницы разбора — метафоры из самого текста, не украшения.
 *
 * Правила из скила дизайна: inline-SVG без внешних файлов, уникальные id
 * градиентов (иначе коллизии между SVG на одной странице), уникальные
 * aria-label, тонкие линии, палитра сущностей: она #c9548a, он #7e5bad,
 * общее #a17a2c.
 */

const HER = "#c9548a";
const HIM = "#7e5bad";
const GOLD = "#a17a2c";

/** Две линии сходятся в одну: метафора канала, который замыкается вдвоём. */
export function VignetteArt() {
  return (
    <svg
      viewBox="0 0 340 56"
      role="img"
      aria-label="Две линии, её и его, сходятся в одну общую"
      style={{ width: "100%", height: "auto", display: "block" }}
    >
      <defs>
        <linearGradient id="pro-vig-gold" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={GOLD} stopOpacity="0.95" />
          <stop offset="1" stopColor={GOLD} stopOpacity="0.55" />
        </linearGradient>
      </defs>
      {/* Толщина и размер точек подобраны глазами: тонкая версия читалась как
          случайная закорючка, а не как фирменный элемент. */}
      <path
        d="M8 10 C 90 10, 120 28, 170 28"
        fill="none"
        stroke={HER}
        strokeWidth={3.2}
        strokeLinecap="round"
      />
      <path
        d="M8 46 C 90 46, 120 28, 170 28"
        fill="none"
        stroke={HIM}
        strokeWidth={3.2}
        strokeLinecap="round"
      />
      <path
        d="M170 28 H 326"
        fill="none"
        stroke="url(#pro-vig-gold)"
        strokeWidth={3.6}
        strokeLinecap="round"
      />
      <circle cx={8} cy={10} r={5} fill={HER} />
      <circle cx={8} cy={46} r={5} fill={HIM} />
      <circle cx={170} cy={28} r={6} fill={GOLD} />
      <circle cx={326} cy={28} r={3.2} fill={GOLD} opacity={0.5} />
    </svg>
  );
}

/** Вода и пар: одно вещество в двух состояниях — метафора «неизменен состав,
 * изменчива частота». Рядом отдельная капля с другим составом. */
export function WaterSteamArt() {
  return (
    <svg
      viewBox="0 0 620 96"
      role="img"
      aria-label="Волна воды переходит в пар; рядом отдельная капля другого состава"
      style={{ width: "100%", height: "auto", display: "block", margin: "18px 0" }}
    >
      <defs>
        <linearGradient id="pro-water" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={HIM} stopOpacity="0.55" />
          <stop offset="1" stopColor={HER} stopOpacity="0.55" />
        </linearGradient>
      </defs>
      {/* Плотность подобрана глазами: бледная версия на светлом фоне читалась
          как случайные штрихи. Вода — волны, пар — те же волны, развёрнутые
          вверх, отдельная капля — состав, который водой не станет. */}
      <path
        d="M20 70 Q 60 56, 100 70 T 180 70 T 260 70 T 340 70"
        fill="none"
        stroke="url(#pro-water)"
        strokeWidth={3}
        strokeLinecap="round"
      />
      <path
        d="M20 84 Q 60 72, 100 84 T 180 84 T 260 84 T 340 84"
        fill="none"
        stroke="url(#pro-water)"
        strokeWidth={2.2}
        strokeLinecap="round"
        opacity={0.65}
      />
      <path d="M360 66 q 9 -13, 0 -24 q -8 -11, 2 -22" fill="none" stroke={HER} strokeWidth={2.6} strokeLinecap="round" opacity={0.9} />
      <path d="M390 70 q 10 -14, 0 -26 q -9 -12, 2 -24" fill="none" stroke={GOLD} strokeWidth={2.6} strokeLinecap="round" opacity={0.8} />
      <path d="M420 66 q 9 -13, 0 -24 q -8 -11, 2 -22" fill="none" stroke={HIM} strokeWidth={2.6} strokeLinecap="round" opacity={0.75} />
      <path
        d="M545 32 C 545 18, 562 12, 562 28 C 562 40, 553 47, 553 47 C 553 47, 545 41, 545 32 Z"
        fill="none"
        stroke={GOLD}
        strokeWidth={2.4}
      />
      <line x1={528} y1={64} x2={580} y2={64} stroke={GOLD} strokeWidth={2} opacity={0.6} strokeDasharray="3 5" />
    </svg>
  );
}

/** Незакрашенная область среди заполненных: метафора темы, которой в паре нет.
 * Спокойно, без драмы — пустое место, а не потеря. */
export function AbsentArt() {
  const dots: Array<[number, number, string]> = [
    [40, 30, HER], [78, 52, HIM], [116, 26, GOLD], [154, 48, HER],
    [420, 30, HIM], [458, 50, GOLD], [496, 28, HER], [534, 50, HIM], [572, 32, GOLD],
  ];
  return (
    <svg
      viewBox="0 0 620 80"
      role="img"
      aria-label="Заполненные точки и спокойная пустая область между ними"
      style={{ width: "100%", height: "auto", display: "block", margin: "18px 0" }}
    >
      {dots.map(([x, y, c], i) => (
        <circle key={i} cx={x} cy={y} r={5} fill={c} opacity={0.75} />
      ))}
      <ellipse
        cx={288}
        cy={40}
        rx={86}
        ry={26}
        fill="none"
        stroke="#c9b3c2"
        strokeWidth={1.6}
        strokeDasharray="4 7"
      />
    </svg>
  );
}
