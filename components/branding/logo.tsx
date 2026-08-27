import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * 品牌 logo 共用元件 —— 老闆提供嘅正式 logo(雄記冰室,2026-08-28)。
 * 原圖 `public/logo-full.png`(連人物插畫+「雄記冰室」字樣+SINCE 1978)
 * 用喺客人落單頁頂做 cover;裁走底部文字、淨係個圓形插畫章嘅
 * `public/logo-icon.png` 用喺 sticky header/職員後台 sidebar/登入頁呢類
 * 細版 branding 位,唔會因為縮太細而睇唔清文字。
 */

export function LogoIcon({ size = 32, className }: { size?: number; className?: string }) {
  return (
    <Image
      src="/logo-icon.png"
      alt=""
      width={size}
      height={size}
      className={cn("rounded-full", className)}
    />
  );
}

export function LogoFull({ className }: { className?: string }) {
  return (
    <Image
      src="/logo-full.png"
      alt="雄記冰室"
      width={280}
      height={543}
      priority
      className={cn("h-auto w-40 sm:w-48", className)}
    />
  );
}
