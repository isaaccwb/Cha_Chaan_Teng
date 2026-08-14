"use client";

/**
 * Kanban 廚房顯示屏 —— 俾 app/admin/orders/page.tsx 用。
 * 對應 docs/PROJECT_PLAN.md 〈三、UI/美術方向 §5.2〉+〈編輯註記〉第2點。
 *
 * 4 欄:新落單(pending)/落緊鑊(confirmed+preparing 合併)/得咗(ready)/派咗(completed)。
 * 「落緊鑊」欄兩張掣:接單(pending→confirmed)、開始整(confirmed→preparing)。
 * 「得咗」欄要先揀付款方式 mock 埋單先可以撳「派咗」(completed 前置 guard 喺
 * updateOrderStatus server action 度做,呢度淨係 UI 引導)。
 *
 * Poll 邏輯:GET /api/admin/orders 淨係回傳 pending/confirmed/preparing/ready
 * (見 app/api/admin/orders/route.ts),completed 只喺初次 SSR 載入 + 本地
 * optimistic 搬移嗰陣先出現 —— 即係話如果第二個裝置將單標記完成,呢度嘅
 * 「派咗」欄唔會自動同步,要 reload page 先見到(V1 可接受嘅限制,規格入面
 * route 本身冇要求回傳 completed)。
 */

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { OrderStatusBadge, type OrderStatus } from "@/components/admin/order-status-badge";
import { updateOrderStatus, markOrderPaid, type PaymentMethod } from "@/lib/actions/staff-orders";
import { cn } from "@/lib/utils";
import type { getOrdersByStatus } from "@/lib/db/queries/orders";

export type OrderWithItems = Awaited<ReturnType<typeof getOrdersByStatus>>[number];

const LIVE_STATUSES: OrderStatus[] = ["pending", "confirmed", "preparing", "ready"];
const POLL_INTERVAL_MS = 4000;

const PAYMENT_METHOD_LABEL: Record<PaymentMethod, string> = {
  cash: "現金",
  octopus_mock: "八達通",
  fps_mock: "轉數快",
};

function minutesSince(date: Date | string) {
  const created = new Date(date).getTime();
  return Math.max(0, Math.floor((Date.now() - created) / 60000));
}

/** <5分鐘綠框、5-10分鐘黃框、>10分鐘紅框(對應 §5.2 要點) */
function waitBorderClass(minutes: number) {
  if (minutes < 5) return "border-[var(--cct-green-600)]";
  if (minutes <= 10) return "border-[var(--cct-gold-500)]";
  return "border-[var(--destructive)]";
}

function OrderCard({
  order,
  onLocalPatch,
  triggerPoll,
}: {
  order: OrderWithItems;
  onLocalPatch: (orderId: string, patch: Partial<OrderWithItems>) => void;
  triggerPoll: () => void;
}) {
  const [isBusy, setIsBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const waitMinutes = minutesSince(order.createdAt);

  async function runStatusChange(nextStatus: OrderStatus) {
    setActionError(null);
    setIsBusy(true);
    const result = await updateOrderStatus(order.id, nextStatus);
    setIsBusy(false);
    if (!result.success) {
      setActionError(result.error);
      return;
    }
    onLocalPatch(order.id, { status: nextStatus });
    triggerPoll();
  }

  async function runMarkPaid(method: PaymentMethod) {
    setActionError(null);
    setIsBusy(true);
    const result = await markOrderPaid(order.id, method);
    setIsBusy(false);
    if (!result.success) {
      setActionError(result.error);
      return;
    }
    onLocalPatch(order.id, { paymentStatus: "mock_paid", paymentMethod: method });
  }

  return (
    <Card className={cn("border-2", waitBorderClass(waitMinutes))}>
      <CardHeader className="flex-row items-start justify-between gap-2 pb-2">
        <div>
          <p className="font-[family-name:var(--font-mono-ui)] text-sm font-bold">
            枱 {order.tableNumber || "—"} · #{order.orderNumber}
          </p>
          <p className="text-xs text-[var(--muted-foreground)]">{waitMinutes} 分鐘前落單</p>
        </div>
        <OrderStatusBadge status={order.status} />
      </CardHeader>
      <CardContent className="flex flex-col gap-2 pt-0">
        <ul className="flex flex-col gap-0.5 text-sm">
          {order.items.map((item) => (
            <li key={item.id} className="flex justify-between gap-2">
              <span>{item.itemNameSnapshot}</span>
              <span className="font-[family-name:var(--font-mono-ui)] text-[var(--muted-foreground)]">
                ×{item.quantity}
              </span>
            </li>
          ))}
        </ul>

        {actionError && <p className="text-xs text-[var(--destructive)]">{actionError}</p>}

        {order.status === "pending" && (
          <Button size="sm" disabled={isBusy} onClick={() => runStatusChange("confirmed")}>
            接單
          </Button>
        )}

        {order.status === "confirmed" && (
          <Button size="sm" disabled={isBusy} onClick={() => runStatusChange("preparing")}>
            開始整
          </Button>
        )}

        {order.status === "preparing" && (
          <Button size="sm" disabled={isBusy} onClick={() => runStatusChange("ready")}>
            得咗
          </Button>
        )}

        {order.status === "ready" &&
          (order.paymentStatus === "mock_paid" ? (
            <Button size="sm" disabled={isBusy} onClick={() => runStatusChange("completed")}>
              派咗
            </Button>
          ) : (
            <div className="flex flex-col gap-1.5">
              <p className="text-xs text-[var(--muted-foreground)]">未埋單 · 撳低邊種找數</p>
              <div className="flex flex-wrap gap-1.5">
                {(Object.keys(PAYMENT_METHOD_LABEL) as PaymentMethod[]).map((method) => (
                  <Button
                    key={method}
                    size="sm"
                    variant="secondary"
                    disabled={isBusy}
                    onClick={() => runMarkPaid(method)}
                  >
                    💰 {PAYMENT_METHOD_LABEL[method]}
                  </Button>
                ))}
              </div>
            </div>
          ))}
      </CardContent>
    </Card>
  );
}

const COLUMNS: { key: string; label: string; statuses: OrderStatus[] }[] = [
  { key: "pending", label: "新落單", statuses: ["pending"] },
  { key: "cooking", label: "落緊鑊", statuses: ["confirmed", "preparing"] },
  { key: "ready", label: "得咗", statuses: ["ready"] },
  { key: "completed", label: "派咗", statuses: ["completed"] },
];

export function OrderBoard({
  initialLiveOrders,
  initialCompletedOrders,
}: {
  initialLiveOrders: OrderWithItems[];
  initialCompletedOrders: OrderWithItems[];
}) {
  const [orders, setOrders] = useState<OrderWithItems[]>([
    ...initialLiveOrders,
    ...initialCompletedOrders,
  ]);

  const poll = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/orders", { cache: "no-store" });
      if (!res.ok) return;
      const data = (await res.json()) as { orders: OrderWithItems[] };
      setOrders((prev) => {
        // 保留本地已知嘅 completed/cancelled 單(route 唔會回傳呢啲),
        // 其餘(即4個 live 狀態)一律用伺服器最新資料整個替換。
        const rest = prev.filter((o) => !LIVE_STATUSES.includes(o.status));
        return [...rest, ...data.orders];
      });
    } catch {
      // 靜靜哋 fail,下一個 poll cycle 再嚟過(對應 errorCopy 網絡出錯精神,
      // 但呢度係背景輪詢,唔使打擾緊職員睇緊嘅單)
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(poll, POLL_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [poll]);

  const patchOrderLocally = useCallback(
    (orderId: string, patch: Partial<OrderWithItems>) => {
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, ...patch } : o)));
    },
    []
  );

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {COLUMNS.map((column) => {
        const columnOrders = orders
          .filter((o) => column.statuses.includes(o.status))
          .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        return (
          <div key={column.key} className="flex flex-col gap-2">
            <div className="flex items-center justify-between rounded-md bg-[var(--muted)] px-3 py-2">
              <h2 className="font-[family-name:var(--font-display)] text-base font-bold">
                {column.label}
              </h2>
              <span className="font-[family-name:var(--font-mono-ui)] text-sm text-[var(--muted-foreground)]">
                {columnOrders.length}
              </span>
            </div>
            <div className="flex flex-col gap-2">
              {columnOrders.length === 0 ? (
                <p className="rounded-md border border-dashed border-[var(--border)] p-4 text-center text-xs text-[var(--muted-foreground)]">
                  未有單
                </p>
              ) : (
                columnOrders.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    onLocalPatch={patchOrderLocally}
                    triggerPoll={poll}
                  />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
