/**
 * 銷售報表 —— 大數字 stat cards 行先(今日單數/今日營業額/熱賣Top3)。
 * 對應 docs/PROJECT_PLAN.md 〈三、UI/美術方向 §5.2〉。
 *
 * 邏輯夠簡單,直接喺呢個 page.tsx 用 getDb() 做 aggregate query,
 * 唔使起獨立 lib/db/queries/reports.ts(對應任務指示)。
 */
import { and, eq, gte, inArray } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { orderItems, orders } from "@/lib/db/schema";
import { getCurrentRestaurantId } from "@/lib/tenant";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatHKD } from "@/lib/utils";
import { emptyStateCopy, miscCopy } from "@/lib/copy/tone";

export const dynamic = "force-dynamic";

/** 香港冇日光節約時間,UTC+8 寫死就夠,計返今日凌晨 0 點(HKT)嘅 UTC 時間 */
function hongKongTodayStart(): Date {
  const HK_OFFSET_MS = 8 * 60 * 60 * 1000;
  const hkNow = new Date(Date.now() + HK_OFFSET_MS);
  const hkMidnightUtcMs =
    Date.UTC(hkNow.getUTCFullYear(), hkNow.getUTCMonth(), hkNow.getUTCDate()) - HK_OFFSET_MS;
  return new Date(hkMidnightUtcMs);
}

export default async function AdminReportsPage() {
  const restaurantId = await getCurrentRestaurantId();
  const db = getDb();
  const todayStart = hongKongTodayStart();

  const todaysOrders = await db
    .select()
    .from(orders)
    .where(and(eq(orders.restaurantId, restaurantId), gte(orders.createdAt, todayStart)));

  const activeOrders = todaysOrders.filter((o) => o.status !== "cancelled");
  const orderCount = todaysOrders.length;
  const revenue = activeOrders.reduce((sum, o) => sum + Number(o.total), 0);

  const activeOrderIds = activeOrders.map((o) => o.id);
  const items = activeOrderIds.length
    ? await db.select().from(orderItems).where(inArray(orderItems.orderId, activeOrderIds))
    : [];

  const salesByItem = new Map<string, number>();
  for (const item of items) {
    salesByItem.set(item.itemNameSnapshot, (salesByItem.get(item.itemNameSnapshot) ?? 0) + item.quantity);
  }
  const top3 = [...salesByItem.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold">
          今日數得計
        </h1>
        <p className="text-sm text-[var(--muted-foreground)]">
          {miscCopy.staffDailySummary(orderCount)}
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-[var(--muted-foreground)]">
              今日單數
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-[family-name:var(--font-heading-en)] text-4xl text-[var(--cct-red-600)]">
              {orderCount}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-[var(--muted-foreground)]">
              今日營業額
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-[family-name:var(--font-heading-en)] text-4xl text-[var(--cct-red-600)]">
              {formatHKD(revenue)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-[var(--muted-foreground)]">
              熱賣 Top 3
            </CardTitle>
          </CardHeader>
          <CardContent>
            {top3.length === 0 ? (
              <p className="text-sm text-[var(--muted-foreground)]">{emptyStateCopy.noOrdersToday}</p>
            ) : (
              <ol className="flex flex-col gap-1.5 text-sm">
                {top3.map(([name, qty], idx) => (
                  <li key={name} className="flex items-center justify-between gap-2">
                    <span>
                      {idx + 1}. {name}
                    </span>
                    <span className="font-[family-name:var(--font-mono-ui)] text-[var(--muted-foreground)]">
                      {qty} 份
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
