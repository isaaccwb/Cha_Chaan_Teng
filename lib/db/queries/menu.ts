import { and, asc, eq } from "drizzle-orm";
import { unstable_cache } from "next/cache";
import { getDb } from "@/lib/db";
import { itemOptions, menuCategories, menuItems } from "@/lib/db/schema";

/** lib/actions/menu.ts 每個改 menu 嘅 mutation 之後都要 revalidateTag(呢個 helper 嘅結果) */
export function menuCacheTag(restaurantId: string) {
  return `menu-${restaurantId}`;
}

/**
 * 客人前台/職員後台共用:攞返成個 menu(分類 + 品項 + add-on options)。
 *
 * 呢度做兩件事:
 * 1. 原本分類/品項/加料 3 條 query 順序行(3 個 round trip),而家用
 *    Promise.all 一齊發,砌返一齊得返 1 個 round trip 嘅時間。
 * 2. 用 unstable_cache 包住,tag 用 menuCacheTag(restaurantId) —— /order
 *    頁一直 force-dynamic(要即時反映伙記改價/賣晒),但呢個 cache 令
 *    「即時」變成「伙記真係改咗嘢先重新查 DB」,唔使每一個客人揭頁都
 *    再打一次 DB。伙記喺 lib/actions/menu.ts 改任何嘢都會
 *    revalidateTag 呢個 tag,所以資料唔會舊。1 小時保底 revalidate
 *    純粹係防手民之誤漏咗某條 action 冇 revalidate。
 */
async function fetchMenuForRestaurant(restaurantId: string) {
  const db = getDb();

  const [categories, items, options] = await Promise.all([
    db
      .select()
      .from(menuCategories)
      .where(and(eq(menuCategories.restaurantId, restaurantId), eq(menuCategories.isActive, true)))
      .orderBy(asc(menuCategories.sortOrder)),
    db
      .select()
      .from(menuItems)
      .where(eq(menuItems.restaurantId, restaurantId))
      .orderBy(asc(menuItems.sortOrder)),
    db
      .select()
      .from(itemOptions)
      .where(eq(itemOptions.restaurantId, restaurantId))
      .orderBy(asc(itemOptions.sortOrder)),
  ]);

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

export async function getMenuForRestaurant(restaurantId: string) {
  const cached = unstable_cache(fetchMenuForRestaurant, ["menu-for-restaurant", restaurantId], {
    tags: [menuCacheTag(restaurantId)],
    revalidate: 3600,
  });
  return cached(restaurantId);
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
