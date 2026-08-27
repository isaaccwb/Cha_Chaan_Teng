import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { getCurrentRestaurantId } from "@/lib/tenant";
import { restaurants } from "@/lib/db/schema";
import { miscCopy } from "@/lib/copy/tone";
import { LogoIcon } from "@/components/branding/logo";

/**
 * 客人前台 layout —— sticky header 顯示店 logo 細 icon + 店名,套用色板/字體;
 * footer 尾二都有個細 icon,喺 slogan 字上面,做多一次低調 branding。
 * 手機優先(對應 PROJECT_PLAN.md §5.1),客人全程唔使登入。
 *
 * Logo 元件見 components/branding/logo.tsx。成張大 logo(連人物插畫+
 * 「雄記冰室」字樣)淨係用喺 app/page.tsx(網域根路徑「封面」首頁),
 * 呢個 layout 全程淨係用縮小版 icon —— 2026-08-28 用戶反饋:大 logo放
 * 落單頁頂會阻住人揀嘢食,所以落單流程入面(呢個 layout 包住嘅
 * /order、/order/[orderId])淨係用細 icon,唔會有大型非功能性內容
 * 擋住第一屏。
 */
export default async function CustomerLayout({ children }: { children: React.ReactNode }) {
  const restaurantId = await getCurrentRestaurantId();
  const db = getDb();
  const [restaurant] = await db
    .select({ name: restaurants.name })
    .from(restaurants)
    .where(eq(restaurants.id, restaurantId))
    .limit(1);

  return (
    <div className="flex min-h-screen flex-col bg-[var(--background)] text-[var(--foreground)]">
      <header className="sticky top-0 z-30 border-b-[1.5px] border-[var(--cct-milktea-600)] bg-[var(--background)] px-4 py-3">
        <div className="mx-auto flex max-w-lg items-center justify-between">
          <div className="flex items-center gap-2">
            <LogoIcon size={32} />
            <h1 className="font-[family-name:var(--font-display)] text-xl font-bold text-[var(--cct-red-500)]">
              {restaurant?.name ?? "茶記落單"}
            </h1>
          </div>
          <p className="font-[family-name:var(--font-mono-ui)] text-xs text-[var(--muted-foreground)]">
            {miscCopy.landingGreeting}
          </p>
        </div>
      </header>
      <main className="mx-auto w-full max-w-lg flex-1">{children}</main>
      <footer className="mx-auto flex w-full max-w-lg flex-col items-center gap-2 px-4 py-6 text-center text-xs text-[var(--muted-foreground)]">
        <LogoIcon size={40} />
        <p>{miscCopy.footerNote}</p>
      </footer>
    </div>
  );
}
