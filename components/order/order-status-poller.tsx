"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

/**
 * 客人落單確認頁嘅輕量輪詢 —— 每 5 秒問一次
 * GET /api/orders/[id]/status,狀態有變就 router.refresh() 令個 Server
 * Component 頁面重新攞返最新資料,唔使將成頁改做 client component。
 *
 * 對應 docs/PROJECT_PLAN.md 〈二、技術架構 §4.1〉輕量輪詢設計。
 */
export function OrderStatusPoller({
  orderId,
  currentStatus,
}: {
  orderId: string;
  currentStatus: string;
}) {
  const router = useRouter();
  const lastStatus = useRef(currentStatus);

  useEffect(() => {
    if (currentStatus === "completed" || currentStatus === "cancelled") return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/orders/${orderId}/status`, { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        if (data.status && data.status !== lastStatus.current) {
          lastStatus.current = data.status;
          router.refresh();
        }
      } catch {
        // 靜默失敗,下一次 tick 再試(對應 errorCopy.networkError 嘅精神 ——
        // 唔好因為一次 poll 失敗就嚇親個客)
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [orderId, currentStatus, router]);

  return null;
}
