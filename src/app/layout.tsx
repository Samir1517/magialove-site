import type { Metadata } from "next";
import Script from "next/script";
import { Playfair_Display, Manrope } from "next/font/google";
import { SITE_URL } from "@/lib/site-config";
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

const TITLE = "Совместимость мужчины и женщины — расчёт по 4 системам сразу";
const DESCRIPTION =
  "Бесплатный тест на совместимость мужчины и женщины онлайн — сразу по 4 системам: Матрица судьбы, Нумерология, Дизайн человека, Джйотиш. Без регистрации, 2 минуты.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  verification: {
    google: "u6DbBMzc-cIrYQy76NneNnxBMEwe-SbcPKjZ5sv649M",
    yandex: "e0734ba61a986dda",
  },
  openGraph: {
    type: "website",
    locale: "ru_RU",
    siteName: "Совместимость",
    title: TITLE,
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className={`${playfairDisplay.variable} ${manrope.variable}`}>
      <body>
        {children}
        <Script id="yandex-metrika" strategy="afterInteractive">
          {`(function(m,e,t,r,i,k,a){
              m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
              m[i].l=1*new Date();
              for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
              k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
          })(window, document,'script','https://mc.yandex.ru/metrika/tag.js?id=111264619', 'ym');

          ym(111264619, 'init', {ssr:true, webvisor:true, clickmap:true, ecommerce:"dataLayer", referrer: document.referrer, url: location.href, accurateTrackBounce:true, trackLinks:true});`}
        </Script>
        <noscript>
          <div>
            <img
              src="https://mc.yandex.ru/watch/111264619"
              style={{ position: "absolute", left: "-9999px" }}
              alt=""
            />
          </div>
        </noscript>
      </body>
    </html>
  );
}
