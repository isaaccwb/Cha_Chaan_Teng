"use server";

import { cookies } from "next/headers";
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

const GUEST_TOKEN_COOKIE = "cct_guest_token";
const GUEST_TOKEN_MAX_AGE_SECONDS = 6 * 60 * 60; // 6 小時

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
  const preparedItems = [];
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

  // ⚠️ 待驗證(見 RUN-BOOK.md 第一項):drizzle-orm/neon-http 嘅 db.transaction()
  // 用 Neon 嘅 HTTP batch transaction API,同傳統 session-based interactive
  // transaction 唔完全一樣。呢度用咗 insert → .returning() → 再用嗰個 id
  // 落下一個 insert 呢種「讀返上一步結果先落下一步」寫法,理論上 drizzle 官方
  // 支援(neon-http transaction 入面嘅 query 係真係逐條送出、逐條攞返結果,
  // 唔係一次過打晒包一齊送),但**未喺呢個 sandbox(冇網絡/DB連接)實測過**,
  // 第一次連得住 DB 就要即刻用 seed 完嘅 menu 試落一張真單確認得。如果發現
  // 唔work,fallback 做法係將呢個 transaction 拆做順序 await(唔用
  // db.transaction 包住),接受 V1 呢個低風險 mock-payment prototype
  // 唔追求嚴格 atomic rollback(對應商業計劃 §7 風險緩解嘅精神:V1 求穩唔求全)。
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
