import { and, asc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { itemOptions, menuCategories, menuItems } from "@/lib/db/schema";

/** 客人前台/職員後台共用:攞返成個 menu(分類 + 品項 + add-on options) */
export async function getMenuForRestaurant(restaurantId: string) {
  const db = getDb();

  const categories = await db
    .select()
    .from(menuCategories)
    .where(and(eq(menuCategories.restaurantId, restaurantId), eq(menuCategories.isActive, true)))
    .orderBy(asc(menuCategories.sortOrder));

  const items = await db
    .select()
    .from(menuItems)
    .where(eq(menuItems.restaurantId, restaurantId))
    .orderBy(asc(menuItems.sortOrder));

  const options = await db
    .select()
    .from(itemOptions)
    .where(eq(itemOptions.restaurantId, restaurantId))
    .orderBy(asc(itemOptions.sortOrder));

  return categories.map((category) => ({
    ...category,
    items: items
      .filter((item) => item.categoryId === category.id)
      .map((item) => ({
        ...item,
        options: options.filter((opt) => opt.menuItemId === item.id),
      })),
  }));
}

/** 落單 Server Action 用嚟重新用 DB 現價計算,唔信任前端傳嚟嘅價(防炒價) */
export async function getMenuItemById(restaurantId: string, menuItemId: string) {
  const db = getDb();
  const [item] = await db
    .select()
    .from(menuItems)
    .where(and(eq(menuItems.id, menuItemId), eq(menuItems.restaurantId, restaurantId)))
    .limit(1);
  return item ?? null;
}

export async function getItemOptionsByIds(restaurantId: string, optionIds: string[]) {
  if (optionIds.length === 0) return [];
  const db = getDb();
  const rows = await db
    .select()
    .from(itemOptions)
    .where(eq(itemOptions.restaurantId, restaurantId));
  return rows.filter((row) => optionIds.includes(row.id));
}
