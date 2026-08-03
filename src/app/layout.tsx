import type { Metadata } from "next";
import { Playfair_Display, Manrope } from "next/font/google";
import "./globals.css";

// Instrument Serif / Sora (исходный дизайн) не имеют кириллического набора
// в Google Fonts — заменены на ближайшие по характеру шрифты с поддержкой кириллицы.
const playfairDisplay = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin", "cyrillic"],
  weight: "500",
  style: ["normal", "italic"],
});

const manrope = Manrope({
  variable: "--font-body",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Совместимость мужчины и женщины — расчёт по 4 системам",
  description:
    "Мягкий и честный расчёт совместимости по нумерологии, Дизайну человека, Джйотиш и Матрице судьбы. Бесплатно, без регистрации, 2 минуты.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className={`${playfairDisplay.variable} ${manrope.variable}`}>
      <body>{children}</body>
    </html>
  );
}
