"use server";

/**
 * 老闆後台改 Menu(分類/品項/加料選項)+ restaurant 設定。
 * 對應 docs/PROJECT_PLAN.md 〈二、技術架構 §4.3〉。
 *
 * 全部用 requireStaffRole(['admin']) guard —— 唔淨係靠 middleware.ts
 * 攔截頁面,〈技術架構 §5.2〉尾段明確要求 Server Action 入面要再驗一次 role。
 *
 * getMenuItemForEdit 雖然係讀取(唔係 mutation),但因為
 * app/admin/menu/[itemId]/edit/page.tsx 要做成 client component 先可以
 * 撳掣即時 loading spinner 叫 AI 生圖 route(見嗰個檔案嘅註解解釋原因),
 * 所以呢個 helper 都放喺呢個 'use server' 檔案度,俾個 client page 直接
 * RPC call(Server Action 唔一定要用喺 <form action> 度,直接 import 落
 * client component 照樣得)。
 */

import { and, asc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getDb } from "@/lib/db";
import {
  itemOptions,
  menuCategories,
  menuItems,
  optionGroupEnum,
  restaurants,
} from "@/lib/db/schema";
import { requireStaffRole } from "@/lib/auth";
import { getCurrentRestaurantId } from "@/lib/tenant";

export type ActionResult = { success: true } | { success: false; error: string };
export type OptionGroup = (typeof optionGroupEnum.enumValues)[number];

// ========== 分類 Category ==========

export async function createMenuCategory(formData: FormData): Promise<ActionResult> {
  await requireStaffRole(["admin"]);
  const restaurantId = await getCurrentRestaurantId();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { success: false, error: "分類名唔可以空白" };

  const db = getDb();
  await db.insert(menuCategories).values({ restaurantId, name });
  revalidatePath("/admin/menu");
  return { success: true };
}

export async function updateMenuCategory(
  categoryId: string,
  formData: FormData
): Promise<ActionResult> {
  await requireStaffRole(["admin"]);
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { success: false, error: "分類名唔可以空白" };

  const db = getDb();
  await db.update(menuCategories).set({ name }).where(eq(menuCategories.id, categoryId));
  revalidatePath("/admin/menu");
  return { success: true };
}

export async function deleteMenuCategory(categoryId: string): Promise<ActionResult> {
  await requireStaffRole(["admin"]);
  const db = getDb();
  await db.delete(menuCategories).where(eq(menuCategories.id, categoryId));
  revalidatePath("/admin/menu");
  return { success: true };
}

// ========== 品項 Menu Item ==========

function parseItemForm(formData: FormData) {
  const categoryId = String(formData.get("categoryId") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const codeRaw = String(formData.get("code") ?? "").trim();
  const descriptionRaw = String(formData.get("description") ?? "").trim();
  const priceRaw = String(formData.get("price") ?? "").trim();
  const price = Number(priceRaw);

  if (!categoryId) return { error: "揀返個分類先" };
  if (!name) return { error: "品名唔可以空白" };
  if (!priceRaw || Number.isNaN(price) || price < 0) return { error: "價錢要填啱,唔可以係負數" };

  return {
    data: {
      categoryId,
      name,
      code: codeRaw || null,
      description: descriptionRaw || null,
      price: price.toFixed(2),
    },
  };
}

export async function createMenuItem(formData: FormData): Promise<ActionResult> {
  await requireStaffRole(["admin"]);
  const restaurantId = await getCurrentRestaurantId();
  const parsed = parseItemForm(formData);
  if (parsed.error) return { success: false, error: parsed.error };

  const db = getDb();
  await db.insert(menuItems).values({ restaurantId, ...parsed.data });
  revalidatePath("/admin/menu");
  return { success: true };
}

export async function updateMenuItem(itemId: string, formData: FormData): Promise<ActionResult> {
  await requireStaffRole(["admin"]);
  const parsed = parseItemForm(formData);
  if (parsed.error) return { success: false, error: parsed.error };

  const db = getDb();
  await db
    .update(menuItems)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(menuItems.id, itemId));
  revalidatePath("/admin/menu");
  revalidatePath(`/admin/menu/${itemId}/edit`);
  return { success: true };
}

export async function deleteMenuItem(itemId: string): Promise<ActionResult> {
  await requireStaffRole(["admin"]);
  const db = getDb();
  await db.delete(menuItems).where(eq(menuItems.id, itemId));
  revalidatePath("/admin/menu");
  return { success: true };
}

/** 有貨/賣晒 toggle —— 老闆後台最當眼、最常撳嘅掣 */
export async function toggleAvailability(itemId: string): Promise<ActionResult> {
  await requireStaffRole(["admin"]);
  const db = getDb();

  const [item] = await db
    .select({ isAvailable: menuItems.isAvailable })
    .from(menuItems)
    .where(eq(menuItems.id, itemId))
    .limit(1);
  if (!item) return { success: false, error: "揾唔到呢個品項" };

  await db
    .update(menuItems)
    .set({ isAvailable: !item.isAvailable, updatedAt: new Date() })
    .where(eq(menuItems.id, itemId));

  revalidatePath("/admin/menu");
  revalidatePath(`/admin/menu/${itemId}/edit`);
  return { success: true };
}

/**
 * 俾 app/admin/menu/[itemId]/edit/page.tsx(client component)攞編輯用嘅
 * 品項 + 全店分類清單 + 呢個品項嘅 add-on options,一次過讀晒。
 */
export async function getMenuItemForEdit(itemId: string) {
  await requireStaffRole(["admin"]);
  const restaurantId = await getCurrentRestaurantId();
  const db = getDb();

  const [item] = await db
    .select()
    .from(menuItems)
    .where(and(eq(menuItems.id, itemId), eq(menuItems.restaurantId, restaurantId)))
    .limit(1);
  if (!item) return null;

  const categories = await db
    .select()
    .from(menuCategories)
    .where(eq(menuCategories.restaurantId, restaurantId))
    .orderBy(asc(menuCategories.sortOrder));

  const options = await db
    .select()
    .from(itemOptions)
    .where(eq(itemOptions.menuItemId, itemId))
    .orderBy(asc(itemOptions.sortOrder));

  return { item, categories, options };
}

// ========== 加料選項 Item Options(走青/走冰/跟套餐呢類) ==========

function parseOptionForm(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const groupName = String(formData.get("groupName") ?? "其他") as OptionGroup;
  const priceDeltaRaw = String(formData.get("priceDelta") ?? "0").trim();
  const priceDelta = priceDeltaRaw === "" ? 0 : Number(priceDeltaRaw);
  const isDefault = formData.get("isDefault") === "on";

  if (!name) return { error: "加料名唔可以空白" };
  if (!optionGroupEnum.enumValues.includes(groupName)) return { error: "分組揀錯咗" };
  if (Number.isNaN(priceDelta)) return { error: "加價要係數字(可以係 0 或者負數)" };

  return { data: { name, groupName, priceDelta: priceDelta.toFixed(2), isDefault } };
}

export async function createItemOption(itemId: string, formData: FormData): Promise<ActionResult> {
  await requireStaffRole(["admin"]);
  const restaurantId = await getCurrentRestaurantId();
  const parsed = parseOptionForm(formData);
  if (parsed.error) return { success: false, error: parsed.error };

  const db = getDb();
  await db.insert(itemOptions).values({ restaurantId, menuItemId: itemId, ...parsed.data });
  revalidatePath(`/admin/menu/${itemId}/edit`);
  revalidatePath("/admin/menu");
  return { success: true };
}

export async function updateItemOption(
  optionId: string,
  formData: FormData
): Promise<ActionResult> {
  await requireStaffRole(["admin"]);
  const parsed = parseOptionForm(formData);
  if (parsed.error) return { success: false, error: parsed.error };

  const db = getDb();
  await db.update(itemOptions).set(parsed.data).where(eq(itemOptions.id, optionId));
  revalidatePath("/admin/menu");
  return { success: true };
}

export async function deleteItemOption(optionId: string): Promise<ActionResult> {
  await requireStaffRole(["admin"]);
  const db = getDb();
  await db.delete(itemOptions).where(eq(itemOptions.id, optionId));
  revalidatePath("/admin/menu");
  return { success: true };
}

// ========== Restaurant 設定(加一服務費 / 最低消費) ==========

export type RestaurantSettingsInput = {
  serviceChargeEnabled: boolean;
  serviceChargePercent: number;
  minSpendAmount: number | null;
};

export async function updateRestaurantSettings(
  input: RestaurantSettingsInput
): Promise<ActionResult> {
  await requireStaffRole(["admin"]);

  if (Number.isNaN(input.serviceChargePercent) || input.serviceChargePercent < 0) {
    return { success: false, error: "服務費百分比要係 0 或以上嘅數字" };
  }
  if (input.minSpendAmount !== null && (Number.isNaN(input.minSpendAmount) || input.minSpendAmount < 0)) {
    return { success: false, error: "最低消費要係 0 或以上嘅數字" };
  }

  const restaurantId = await getCurrentRestaurantId();
  const db = getDb();
  await db
    .update(restaurants)
    .set({
      serviceChargeEnabled: input.serviceChargeEnabled,
      serviceChargePercent: input.serviceChargePercent.toFixed(2),
      minSpendAmount: input.minSpendAmount === null ? null : input.minSpendAmount.toFixed(2),
    })
    .where(eq(restaurants.id, restaurantId));

  revalidatePath("/admin/menu");
  revalidatePath("/admin/settings");
  return { success: true };
}
