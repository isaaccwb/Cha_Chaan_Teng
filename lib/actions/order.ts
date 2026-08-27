"use server";

import { cookies, headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { getCurrentRestaurantId } from "@/lib/tenant";
import { getMenuItemById, getItemOptionsByIds } from "@/lib/db/queries/menu";
import {
  restaurants,
  orders,
  orderItems,
  orderItemOptions,
  orderStatusHistory,
} from "@/lib/db/schema";
import { errorCopy } from "@/lib/copy/tone";
import { checkRateLimit } from "@/lib/rate-limit";

const GUEST_TOKEN_COOKIE = "cct_guest_token";
const GUEST_TOKEN_MAX_AGE_SECONDS = 6 * 60 * 60; // 6 小時

// 防止一個 tab loop 狂 call createOrder 洗版廚房 Kanban:一個 key(IP 或
// guest_token)喺呢個 window 入面最多准落幾多次單
const ORDER_RATE_LIMIT_MAX_REQUESTS = 5;
const ORDER_RATE_LIMIT_WINDOW_MS = 2 * 60 * 1000; // 2 分鐘

export interface CreateOrderItemInput {
  menuItemId: string;
  quantity: number;
  optionIds: string[];
  notes?: string;
}

export interface CreateOrderInput {
  tableNumber: string;
  items: CreateOrderItemInput[];
}

/** 4 捨 5 入去 2 位小數,避免浮點誤差累積喺金額度 */
function round2(n: number) {
  return Math.round(n * 100) / 100;
}

/**
 * 客人落單 Server Action。
 *
 * 對應 docs/PROJECT_PLAN.md 〈二、技術架構 §4.1〉:伺服器完全唔信任前端
 * 傳嚟嘅價錢/選項,逐項用 DB 現價重新計算;讀 restaurant 嘅最低消費/加一
 * 服務費設定計 subtotal → total;transaction insert orders/order_items/
 * order_item_options;寫 order_status_history(from=null, to=pending);
 * 產生 guest_token 寫 httpOnly cookie;revalidate 職員後台落單頁。
 */
export async function createOrder(input: CreateOrderInput) {
  // 越早擋越好 —— 呢個 check 冇碰過 DB,擋咗一個 loop 狂 call 嘅 tab 都唔會
  // 洗到任何寫入成本(見 lib/rate-limit.ts 嘅 in-memory sliding window)。
  const headerList = await headers();
  const forwardedFor = headerList.get("x-forwarded-for");
  const clientIp = forwardedFor?.split(",")[0]?.trim();
  const guestTokenForRateLimit = (await cookies()).get(GUEST_TOKEN_COOKIE)?.value;
  const rateLimitKey = clientIp || guestTokenForRateLimit;
  if (rateLimitKey) {
    const allowed = checkRateLimit(rateLimitKey, {
      maxRequests: ORDER_RATE_LIMIT_MAX_REQUESTS,
      windowMs: ORDER_RATE_LIMIT_WINDOW_MS,
    });
    if (!allowed) {
      throw new Error(errorCopy.rateLimited);
    }
  }

  const restaurantId = await getCurrentRestaurantId();

  const tableNumber = input.tableNumber?.trim();
  if (!tableNumber) {
    throw new Error(errorCopy.missingTableNumber);
  }
  if (!input.items || input.items.length === 0) {
    throw new Error(errorCopy.orderFailed);
  }

  const db = getDb();

  // 逐項用 DB 現價重新計算(唔信任前端傳嚟嘅價/選項)
  const preparedItems: Array<{
    menuItem: NonNullable<Awaited<ReturnType<typeof getMenuItemById>>>;
    options: Awaited<ReturnType<typeof getItemOptionsByIds>>;
    quantity: number;
    notes: string | null;
    unitPrice: number;
    lineTotal: number;
  }> = [];
  for (const rawItem of input.items) {
    if (!rawItem.menuItemId || rawItem.quantity < 1) {
      throw new Error(errorCopy.orderFailed);
    }

    const menuItem = await getMenuItemById(restaurantId, rawItem.menuItemId);
    if (!menuItem || !menuItem.isAvailable) {
      throw new Error(errorCopy.soldOut);
    }

    const allOptions = await getItemOptionsByIds(restaurantId, rawItem.optionIds ?? []);
    // 淨係接受真係屬於呢味嘢嘅 option(防止亂夾第樣嘢嘅 option id 落嚟呃錢)
    const validOptions = allOptions.filter((opt) => opt.menuItemId === menuItem.id);

    const unitPrice =
      Number(menuItem.price) + validOptions.reduce((sum, opt) => sum + Number(opt.priceDelta), 0);
    const lineTotal = round2(unitPrice * rawItem.quantity);

    preparedItems.push({
      menuItem,
      options: validOptions,
      quantity: rawItem.quantity,
      notes: rawItem.notes?.trim() || null,
      unitPrice,
      lineTotal,
    });
  }

  const subtotal = round2(preparedItems.reduce((sum, item) => sum + item.lineTotal, 0));

  const [restaurant] = await db
    .select()
    .from(restaurants)
    .where(eq(restaurants.id, restaurantId))
    .limit(1);
  if (!restaurant) {
    throw new Error(errorCopy.orderFailed);
  }

  const minSpend = restaurant.minSpendAmount != null ? Number(restaurant.minSpendAmount) : null;
  if (minSpend != null && subtotal < minSpend) {
    throw new Error(errorCopy.belowMinSpend);
  }

  const total = restaurant.serviceChargeEnabled
    ? round2(subtotal * (1 + Number(restaurant.serviceChargePercent) / 100))
    : subtotal;

  const guestToken = crypto.randomUUID();

  // db 用 drizzle-orm/postgres-js(見 lib/db/index.ts),係真正 session-based
  // transaction,insert → .returning() → 再用嗰個 id 落下一個 insert 呢種
  // 寫法有標準 driver 支援,唔似之前 evaluate 過嘅 neon-http(HTTP-only,冇
  // 真正 multi-statement transaction)咁有風險。即使咁,呢個 sandbox 冇網絡/
  // DB連接,呢段實際運行結果仍然未實測過 —— 第一次連得住 DB 就用 seed 完嘅
  // menu 試落一張真單確認得(見 RUN-BOOK.md 第一項)。
  const { orderId, orderNumber } = await db.transaction(async (tx) => {
    const [order] = await tx
      .insert(orders)
      .values({
        restaurantId,
        tableNumber,
        guestToken,
        status: "pending",
        subtotal: subtotal.toFixed(2),
        total: total.toFixed(2),
      })
      .returning({ id: orders.id, orderNumber: orders.orderNumber });

    for (const item of preparedItems) {
      const [insertedItem] = await tx
        .insert(orderItems)
        .values({
          orderId: order.id,
          menuItemId: item.menuItem.id,
          itemNameSnapshot: item.menuItem.name,
          unitPriceSnapshot: item.unitPrice.toFixed(2),
          quantity: item.quantity,
          lineTotal: item.lineTotal.toFixed(2),
          notes: item.notes,
        })
        .returning({ id: orderItems.id });

      if (item.options.length > 0) {
        await tx.insert(orderItemOptions).values(
          item.options.map((opt) => ({
            orderItemId: insertedItem.id,
            itemOptionId: opt.id,
            nameSnapshot: opt.name,
            priceDeltaSnapshot: opt.priceDelta,
          }))
        );
      }
    }

    await tx.insert(orderStatusHistory).values({
      orderId: order.id,
      fromStatus: null,
      toStatus: "pending",
      changedBy: null,
    });

    return { orderId: order.id, orderNumber: order.orderNumber };
  });

  const cookieStore = await cookies();
  cookieStore.set(GUEST_TOKEN_COOKIE, guestToken, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: GUEST_TOKEN_MAX_AGE_SECONDS,
    path: "/",
  });

  revalidatePath("/admin/orders");

  return { orderId, orderNumber };
}
