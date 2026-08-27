/**
 * 網站首頁(cctmenu 網域根路徑 `/`)。
 *
 * V1 起初淨係有 `(customer)` 同 `admin` 兩個 route group,冇 app/page.tsx,
 * 導致 `/` 一直 404 —— vercel.ts 個 `/order-old` redirect 註解仲寫住「導返去
 * 新首頁」,但呢頁其實一直未起。呢度補返:一個簡單歡迎頁,兩條路分岔
 * (客人落單 / 職員登入),風格跟 (auth)/login 個 Card 版面。
 *
 * 2026-08-28:呢頁先係真正嘅「封面」位 —— 老闆提供嘅正式 logo(人物插畫
 * +「雄記冰室」字樣 + SINCE 1978)放喺呢度,唔阻住任何操作流程(呢頁本身
 * 冇落單 UI,淨係兩粒 CTA 分岔去 /order 或 /login)。落單頁(/order)嗰邊
 * 用戶反饋話大 logo 會阻住揀嘢食,所以嗰邊已經改用返細 icon,大 logo 淨係
 * 留喺呢頁。
 */
import Link from "next/link";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { getCurrentRestaurantId } from "@/lib/tenant";
import { restaurants } from "@/lib/db/schema";
import { Button } from "@/components/ui/button";
import { buttonCopy, miscCopy } from "@/lib/copy/tone";
import { LogoFull } from "@/components/branding/logo";

export default async function HomePage() {
  const restaurantId = await getCurrentRestaurantId();
  const db = getDb();
  const [restaurant] = await db
    .select({ name: restaurants.name, address: restaurants.address })
    .from(restaurants)
    .where(eq(restaurants.id, restaurantId))
    .limit(1);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[var(--background)] px-6 text-center">
      <LogoFull />

      <div>
        <h1 className="font-[family-name:var(--font-display)] text-4xl font-bold text-[var(--cct-red-500)] sm:text-5xl">
          {restaurant?.name ?? "茶記落單"}
        </h1>
        <div className="cct-checker-strip mx-auto mt-3 w-16" />
      </div>

      <p className="max-w-xs text-lg text-[var(--foreground)]">{miscCopy.landingGreeting}</p>

      <Button asChild size="lg">
        <Link href="/order">{buttonCopy.viewMenu}</Link>
      </Button>

      {restaurant?.address && (
        <p className="text-xs text-[var(--muted-foreground)]">{restaurant.address}</p>
      )}

      <Link
        href="/login"
        className="mt-8 font-[family-name:var(--font-mono-ui)] text-xs text-[var(--muted-foreground)] underline underline-offset-4 hover:text-[var(--foreground)]"
      >
        職員 / 老闆登入
      </Link>
    </div>
  );
}
