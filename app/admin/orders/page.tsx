/**
 * 廚房顯示屏 Kanban —— 初次 SSR 載入,之後交返俾 client component
 * (components/admin/order-board.tsx)每 4 秒 poll app/api/admin/orders/route.ts。
 * 對應 docs/PROJECT_PLAN.md 〈二、技術架構 §4.2〉+〈三、UI/美術方向 §5.2〉。
 */
import { getCurrentRestaurantId } from "@/lib/tenant";
import { getOrdersByStatus } from "@/lib/db/queries/orders";
import { OrderBoard } from "@/components/admin/order-board";

// 廚房單版一定要即時,唔可以俾 Next.js cache 住上一次 render 嘅結果
export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const restaurantId = await getCurrentRestaurantId();

  const [liveOrders, completedOrders] = await Promise.all([
    getOrdersByStatus(restaurantId, ["pending", "confirmed", "preparing", "ready"]),
    getOrdersByStatus(restaurantId, ["completed"]),
  ]);

  return (
    <div className="flex flex-col gap-4">
      <header>
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold">即時單</h1>
        <p className="text-sm text-[var(--muted-foreground)]">出爐快過人講嘢,眼利啲追住個板</p>
      </header>

      <OrderBoard
        initialLiveOrders={liveOrders}
        initialCompletedOrders={completedOrders.slice(0, 20)}
      />
    </div>
  );
}
