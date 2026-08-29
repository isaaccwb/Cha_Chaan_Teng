import { and, count, desc, eq, gte, inArray, lte } from "drizzle-orm";
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

/**
 * 報表用:指定日期範圍(HKT,見 lib/date-hk.ts)嘅單數、營業額、熱賣 Top 3。
 * 營業額同 getOrdersByStatus 一樣淨係計 status !== 'cancelled' 嘅單。
 * 對應 app/admin/reports/page.tsx 原本內嵌嘅 aggregate 邏輯,抽出嚟俾
 * 唔同範圍(今日/本週/本月)共用,唔使複製貼上。
 */
export async function getOrderStatsForRange(restaurantId: string, start: Date, end: Date) {
  const db = getDb();

  const rangeOrders = await db
    .select()
    .from(orders)
    .where(
      and(eq(orders.restaurantId, restaurantId), gte(orders.createdAt, start), lte(orders.createdAt, end))
    );

  const activeOrders = rangeOrders.filter((o) => o.status !== "cancelled");
  const orderCount = rangeOrders.length;
  const revenue = activeOrders.reduce((sum, o) => sum + Number(o.total), 0);

  const activeOrderIds = activeOrders.map((o) => o.id);
  const items = activeOrderIds.length
    ? await db.select().from(orderItems).where(inArray(orderItems.orderId, activeOrderIds))
    : [];

  const salesByItem = new Map<string, number>();
  for (const item of items) {
    salesByItem.set(item.itemNameSnapshot, (salesByItem.get(item.itemNameSnapshot) ?? 0) + item.quantity);
  }
  const topItems = [...salesByItem.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3);

  return { orderCount, revenue, topItems };
}

/**
 * 訂單歷史用:指定日期範圍內嘅單,分頁,新單排先。
 * 唔連 items/options(嗰啲太重,列表頁淨係要顯示概要),要睇單內容
 * 用返 getOrderById。
 */
export async function getOrdersInRange(
  restaurantId: string,
  start: Date,
  end: Date,
  { limit, offset }: { limit: number; offset: number }
) {
  const db = getDb();

  const whereClause = and(
    eq(orders.restaurantId, restaurantId),
    gte(orders.createdAt, start),
    lte(orders.createdAt, end)
  );

  const [rows, [{ total }]] = await Promise.all([
    db.select().from(orders).where(whereClause).orderBy(desc(orders.createdAt)).limit(limit).offset(offset),
    db.select({ total: count() }).from(orders).where(whereClause),
  ]);

  return { orders: rows, total };
}
