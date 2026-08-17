"use server";

/**
 * 職員後台改單狀態 / mock 埋單。
 * 對應 docs/PROJECT_PLAN.md 〈二、技術架構 §4.2 / §6.1 / §6.2〉。
 *
 * 合法轉移一律用 lib/db/schema.ts 嘅 ORDER_STATUS_TRANSITIONS 做檢查,
 * 唔喺呢度另外定義一份 —— 果個先係 source of truth。
 *
 * 注意:getDb() 用嘅係 drizzle-orm/postgres-js(標準 session-based Postgres
 * driver,連 Supabase),支援真正嘅多語句 transaction,所以下面「寫 order +
 * 寫 history」用 db.transaction() 包住,兩步一齊成功或者一齊 rollback。
 */

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getDb } from "@/lib/db";
import {
  orders,
  orderStatusHistory,
  ORDER_STATUS_TRANSITIONS,
  orderStatusEnum,
  paymentMethodEnum,
} from "@/lib/db/schema";
import { requireStaffRole } from "@/lib/auth";
import { getCurrentRestaurantId } from "@/lib/tenant";
import { getOrderById } from "@/lib/db/queries/orders";

export type OrderStatus = (typeof orderStatusEnum.enumValues)[number];
export type PaymentMethod = (typeof paymentMethodEnum.enumValues)[number];

export type ActionResult = { success: true } | { success: false; error: string };

/**
 * 改單狀態,一律要合乎 ORDER_STATUS_TRANSITIONS。
 * 轉去 'completed' 之前強制要求 paymentStatus = 'mock_paid'
 * (對應〈技術架構 §6.2〉:埋咗先可以話送咗)。
 */
export async function updateOrderStatus(
  orderId: string,
  nextStatus: OrderStatus
): Promise<ActionResult> {
  const staff = await requireStaffRole(["admin", "staff"]);
  const restaurantId = await getCurrentRestaurantId();

  const existing = await getOrderById(restaurantId, orderId);
  if (!existing) {
    return { success: false, error: "揾唔到呢張單,可能已經被人執咗" };
  }

  const currentStatus = existing.order.status as OrderStatus;
  const allowedNext = ORDER_STATUS_TRANSITIONS[currentStatus];

  if (!allowedNext.includes(nextStatus)) {
    return {
      success: false,
      error: `呢張單而家係「${currentStatus}」,唔可以直接跳去「${nextStatus}」`,
    };
  }

  if (nextStatus === "completed" && existing.order.paymentStatus !== "mock_paid") {
    return { success: false, error: "未埋單喎,先撳「埋單」先可以派咗佢" };
  }

  const db = getDb();

  await db.transaction(async (tx) => {
    await tx
      .update(orders)
      .set({ status: nextStatus, updatedAt: new Date() })
      .where(eq(orders.id, orderId));

    await tx.insert(orderStatusHistory).values({
      orderId,
      fromStatus: currentStatus,
      toStatus: nextStatus,
      changedBy: staff.id,
    });
  });

  revalidatePath("/admin/orders");
  return { success: true };
}

/**
 * Mock 埋單:payment_status unpaid → mock_paid,記低用邊種方式。
 * 純標籤,唔連任何真實支付 SDK(對應〈技術架構 §6.2〉)。
 */
export async function markOrderPaid(
  orderId: string,
  paymentMethod: PaymentMethod
): Promise<ActionResult> {
  await requireStaffRole(["admin", "staff"]);
  const restaurantId = await getCurrentRestaurantId();

  const existing = await getOrderById(restaurantId, orderId);
  if (!existing) {
    return { success: false, error: "揾唔到呢張單,可能已經被人執咗" };
  }
  if (existing.order.paymentStatus === "mock_paid") {
    return { success: true };
  }

  const db = getDb();
  await db
    .update(orders)
    .set({ paymentStatus: "mock_paid", paymentMethod, updatedAt: new Date() })
    .where(eq(orders.id, orderId));

  revalidatePath("/admin/orders");
  return { success: true };
}
