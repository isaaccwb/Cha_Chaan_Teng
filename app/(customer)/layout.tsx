import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { getCurrentRestaurantId } from "@/lib/tenant";
import { restaurants } from "@/lib/db/schema";
import { miscCopy } from "@/lib/copy/tone";
import { LogoIcon } from "@/components/branding/logo";

/**
 * 客人前台 layout —— sticky header 顯示店 logo 細 icon + 店名,套用色板/字體。
 * 手機優先(對應 PROJECT_PLAN.md §5.1),客人全程唔使登入。
 *
 * Logo 元件見 components/branding/logo.tsx;成張大 logo 用喺 `/order` 頁頂
 * 做 cover(見該頁 code),呢度淨係用縮小版 icon 做長駐 branding。
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
      <footer className="mx-auto w-full max-w-lg px-4 py-6 text-center text-xs text-[var(--muted-foreground)]">
        {miscCopy.footerNote}
      </footer>
    </div>
  );
}
