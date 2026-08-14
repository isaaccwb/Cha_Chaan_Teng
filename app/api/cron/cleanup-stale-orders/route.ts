/**
 * GET /api/cron/cleanup-stale-orders
 *
 * Vercel Cron 觸發(見 vercel.ts 嘅 crons 設定,每日凌晨 4am),對應
 * docs/PROJECT_PLAN.md §7 風險緩解:客人落咗單但冇伙記確認(可能落單失敗
 * 一半、或者伙記漏睇),逾時嘅 pending 單自動取消,唔會一直卡喺廚房顯示屏度。
 */
import { and, eq, lt } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { orders, orderStatusHistory } from "@/lib/db/schema";
import { getCurrentRestaurantId } from "@/lib/tenant";

const STALE_MINUTES = 15;

export async function GET(req: Request) {
  // Vercel Cron 會自動帶 `Authorization: Bearer $CRON_SECRET`(如果有設定呢個
  // env)嚟 call。如果設定咗 CRON_SECRET 就驗一驗,防止外人亂 call 呢個 endpoint
  // 亂取消客人張單;冇設定就放行(local 開發方便)。
  if (process.env.CRON_SECRET) {
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return Response.json({ error: "未授權" }, { status: 401 });
    }
  }

  try {
    const db = getDb();
    const restaurantId = await getCurrentRestaurantId();
    const staleBefore = new Date(Date.now() - STALE_MINUTES * 60 * 1000);

    const staleOrders = await db
      .select()
      .from(orders)
      .where(
        and(
          eq(orders.restaurantId, restaurantId),
          eq(orders.status, "pending"),
          lt(orders.createdAt, staleBefore)
        )
      );

    let cancelledCount = 0;
    for (const order of staleOrders) {
      await db
        .update(orders)
        .set({ status: "cancelled", updatedAt: new Date() })
        .where(eq(orders.id, order.id));

      await db.insert(orderStatusHistory).values({
        orderId: order.id,
        fromStatus: "pending",
        toStatus: "cancelled",
        changedBy: null,
        note: "逾時未確認,系統自動取消",
      });

      cancelledCount += 1;
    }

    return Response.json({ cancelledCount });
  } catch (err) {
    console.error("[cron/cleanup-stale-orders]", err);
    return Response.json(
      { error: `清理逾時單失敗:${err instanceof Error ? err.message : String(err)}` },
      { status: 500 }
    );
  }
}
