import type { Metadata } from "next";
import { Noto_Sans_HK, Alfa_Slab_One, Space_Grotesk } from "next/font/google";
import "./globals.css";

// 中文內文 / UI 文字
const notoSansHK = Noto_Sans_HK({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-noto-sans-hk",
  display: "swap",
});

// 英文/數字大字(價錢、Hero 標題) — 舊式搪瓷招牌感
const alfaSlabOne = Alfa_Slab_One({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-alfa-slab",
  display: "swap",
});

// 英文/數字 UI 文字(按鈕、狀態標籤、後台介面)
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-space-grotesk",
  display: "swap",
});

export const metadata: Metadata = {
  title: "茶記落單",
  description: "香港茶記落單 App — 想食乜?撳幾撳就得。",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-HK">
      <head>
        {/*
          LXGW WenKai TC(霞鶩文楷)—— 中文標題/招牌感強調字,帶毛筆楷書感。
          用 <link> 直接叫 Google Fonts CSS2 API,避開 next/font/google 內部
          字體清單有冇收錄呢隻字嘅不確定性(build 嗰陣有網絡自然會 fetch 到)。
          --font-display-cjk 呢個 CSS variable 喺 globals.css 嘅 @theme 度已經
          set 好 fallback,就算字體一時未 load 到都唔會整頁散晒。
        */}
        <link
          href="https://fonts.googleapis.com/css2?family=LXGW+WenKai+TC:wght@400;700&display=swap"
          rel="stylesheet"
        />
        <style>{`:root { --font-display-cjk: "LXGW WenKai TC"; }`}</style>
      </head>
      <body
        className={`${notoSansHK.variable} ${alfaSlabOne.variable} ${spaceGrotesk.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
