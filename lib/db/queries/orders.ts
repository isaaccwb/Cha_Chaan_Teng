import { and, desc, eq, inArray } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { orderItemOptions, orderItems, orders, orderStatusHistory } from "@/lib/db/schema";

/** 客人查自己張單(用 guest_token cookie 驗證,喺呢層直接 filter,唔靠前端) */
export async function getOrderForGuest(orderId: string, guestToken: string) {
  const db = getDb();
  const [order] = await db
    .select()
    .from(orders)
    .where(and(eq(orders.id, orderId), eq(orders.guestToken, guestToken)))
    .limit(1);
  if (!order) return null;
  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));
  if (items.length === 0) return { order, items: [] as Array<(typeof items)[number] & { options: (typeof orderItemOptions.$inferSelect)[] }> };
  const options = await db
    .select()
    .from(orderItemOptions)
    .where(
      inArray(
        orderItemOptions.orderItemId,
        items.map((i) => i.id)
      )
    );
  return {
    order,
    items: items.map((item) => ({
      ...item,
      options: options.filter((o) => o.orderItemId === item.id),
    })),
  };
}

/** 職員後台廚房顯示屏:攞返指定狀態嘅單(V1 用 polling) */
export async function getOrdersByStatus(restaurantId: string, statuses: string[]) {
  const db = getDb();
  const rows = await db
    .select()
    .from(orders)
    .where(
      and(
        eq(orders.restaurantId, restaurantId),
        // @ts-expect-error drizzle enum array narrowing — statuses 嚟自受控嘅 orderStatusEnum 值
        inArray(orders.status, statuses)
      )
    )
    .orderBy(desc(orders.createdAt));

  if (rows.length === 0) return [];

  const items = await db
    .select()
    .from(orderItems)
    .where(
      inArray(
        orderItems.orderId,
        rows.map((r) => r.id)
      )
    );

  return rows.map((order) => ({
    ...order,
    items: items.filter((item) => item.orderId === order.id),
  }));
}

export async function getOrderById(restaurantId: string, orderId: string) {
  const db = getDb();
  const [order] = await db
    .select()
    .from(orders)
    .where(and(eq(orders.id, orderId), eq(orders.restaurantId, restaurantId)))
    .limit(1);
  if (!order) return null;
  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));
  const itemOptionsRows = await db
    .select()
    .from(orderItemOptions)
    .where(
      inArray(
        orderItemOptions.orderItemId,
        items.map((i) => i.id)
      )
    );
  return {
    order,
    items: items.map((item) => ({
      ...item,
      options: itemOptionsRows.filter((o) => o.orderItemId === item.id),
    })),
  };
}

export async function getOrderStatusHistory(orderId: string) {
  const db = getDb();
  return db
    .select()
    .from(orderStatusHistory)
    .where(eq(orderStatusHistory.orderId, orderId))
    .orderBy(desc(orderStatusHistory.changedAt));
}
