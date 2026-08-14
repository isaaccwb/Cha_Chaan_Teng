/**
 * 老闆設定頁 —— 加一服務費開關/百分比、最低消費金額。
 * 對應 docs/PROJECT_PLAN.md 〈三、UI/美術方向 §5.2〉+
 * 〈二、技術架構 §4.3〉updateRestaurantSettings。
 *
 * Sidebar 一早就有連去 /admin/settings(見 app/admin/layout.tsx),
 * 呢頁補喺 integration pass 度,用返 lib/actions/menu.ts 已經寫好嘅
 * updateRestaurantSettings,唔使再加後端邏輯。
 */
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { restaurants } from "@/lib/db/schema";
import { requireStaffRole } from "@/lib/auth";
import { getCurrentRestaurantId } from "@/lib/tenant";
import { RestaurantSettingsForm } from "@/components/admin/restaurant-settings-form";

export default async function AdminSettingsPage() {
  await requireStaffRole(["admin"]);
  const restaurantId = await getCurrentRestaurantId();
  const db = getDb();

  const [restaurant] = await db
    .select()
    .from(restaurants)
    .where(eq(restaurants.id, restaurantId))
    .limit(1);

  if (!restaurant) {
    return <p className="text-[var(--muted-foreground)]">揾唔到呢間茶記嘅資料。</p>;
  }

  return (
    <div className="flex max-w-lg flex-col gap-6">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold">設定</h1>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          {restaurant.name} · 呢頁改嘅嘢即刻生效,落單流程會即時跟返新設定計數。
        </p>
      </div>

      <RestaurantSettingsForm
        initialServiceChargeEnabled={restaurant.serviceChargeEnabled}
        initialServiceChargePercent={Number(restaurant.serviceChargePercent)}
        initialMinSpendAmount={
          restaurant.minSpendAmount != null ? Number(restaurant.minSpendAmount) : null
        }
      />
    </div>
  );
}
