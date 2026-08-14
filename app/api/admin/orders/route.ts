/**
 * GET /api/admin/orders —— 職員後台廚房顯示屏輪詢用(每 3-5 秒)。
 * 對應 docs/PROJECT_PLAN.md 〈二、技術架構 §4.2 / §4.4〉。
 *
 * 只回傳 pending/confirmed/preparing/ready 呢 4 個仲「郁緊」嘅狀態,
 * completed 唔喺呢度回傳(見 components/admin/order-board.tsx 頂部註解
 * 解釋點解、同埋呢個限制點樣喺 client 度處理)。
 */
import { NextResponse } from "next/server";
import { requireStaffRole } from "@/lib/auth";
import { getCurrentRestaurantId } from "@/lib/tenant";
import { getOrdersByStatus } from "@/lib/db/queries/orders";

export async function GET() {
  try {
    await requireStaffRole(["admin", "staff"]);
  } catch {
    return NextResponse.json({ error: "未登入或者冇權限" }, { status: 401 });
  }

  const restaurantId = await getCurrentRestaurantId();
  const orders = await getOrdersByStatus(restaurantId, [
    "pending",
    "confirmed",
    "preparing",
    "ready",
  ]);

  return NextResponse.json({ orders });
}
