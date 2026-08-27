/**
 * 設定頁 —— 老闆(admin)可以改加一服務費開關/百分比、最低消費金額;
 * 任何登入咗嘅職員(admin 或 staff)都可以喺呢頁改自己個密碼。
 * 對應 docs/PROJECT_PLAN.md 〈三、UI/美術方向 §5.2〉+
 * 〈二、技術架構 §4.3〉updateRestaurantSettings,以及 RUN-BOOK.md §10
 * 「冇『職員改自己密碼』功能」跟進項。
 *
 * Sidebar(app/admin/layout.tsx)嘅「設定」連結冇按 role 篩走,所以呢頁
 * 唔可以再用 requireStaffRole(["admin"]) 一開波就擋晒 staff 角色 ——
 * 淨係擋「未登入」,餐廳設定表單先按 role 揀顯唔顯示。
 */
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import { restaurants } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { getCurrentRestaurantId } from "@/lib/tenant";
import { RestaurantSettingsForm } from "@/components/admin/restaurant-settings-form";
import { ChangePasswordForm } from "@/components/admin/change-password-form";

export default async function AdminSettingsPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }
  const isAdmin = session.user.role === "admin";

  const restaurantId = await getCurrentRestaurantId();
  const db = getDb();

  const [restaurant] = await db
    .select()
    .from(restaurants)
    .where(eq(restaurants.id, restaurantId))
    .limit(1);

  return (
    <div className="flex max-w-lg flex-col gap-8">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold">設定</h1>
        {isAdmin && restaurant && (
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            {restaurant.name} · 呢頁改嘅嘢即刻生效,落單流程會即時跟返新設定計數。
          </p>
        )}
      </div>

      {isAdmin && restaurant && (
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-[var(--muted-foreground)]">餐廳設定</h2>
          <RestaurantSettingsForm
            initialServiceChargeEnabled={restaurant.serviceChargeEnabled}
            initialServiceChargePercent={Number(restaurant.serviceChargePercent)}
            initialMinSpendAmount={
              restaurant.minSpendAmount != null ? Number(restaurant.minSpendAmount) : null
            }
          />
        </section>
      )}

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-[var(--muted-foreground)]">改密碼</h2>
        <ChangePasswordForm />
      </section>
    </div>
  );
}
