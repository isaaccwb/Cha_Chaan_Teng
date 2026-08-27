/**
 * 一次性 idempotent script:幫已經 seed 咗嘅現有 restaurant 補返
 * `drizzle/menu-data.ts` 入面有、但個 restaurant 重未有嘅分類/品項/加料選項。
 *
 * 對應 2026-08-27「demo menu 太薄,唔似真.茶記」跟進 —— production 一開始
 * 淨係得「常餐/套餐」1 個分類 5 個品項,呢個 script 負責補埋飲品/三文治多士/
 * 小食甜品/湯麵呢幾個新分類,唔會郁到現有分類/品項/落咗嘅單。
 *
 * 跑法:npx tsx --env-file=.env.local scripts/backfill-menu.ts
 *
 * Idempotent 判斷方式:逐個分類check 個 restaurant 係咪已經有同名分類,
 * 有就跳過(唔會刪/唔會覆蓋),冇先至插入。可以放心重複跑。
 */
import { eq, and } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { itemOptions, menuCategories, menuItems } from "@/lib/db/schema";
import { MENU } from "@/drizzle/menu-data";

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("未設定 DATABASE_URL。請跑 `vercel env pull .env.local`。");
    process.exit(1);
  }
  if (!process.env.DEFAULT_RESTAURANT_ID) {
    console.error("未設定 DEFAULT_RESTAURANT_ID。");
    process.exit(1);
  }

  const restaurantId = process.env.DEFAULT_RESTAURANT_ID;
  const db = getDb();

  const existingCategories = await db
    .select()
    .from(menuCategories)
    .where(eq(menuCategories.restaurantId, restaurantId));
  const existingNames = new Set(existingCategories.map((c) => c.name));
  const maxSortOrder = existingCategories.reduce((max, c) => Math.max(max, c.sortOrder), -1);

  console.log(
    `搵到 ${existingCategories.length} 個現有分類:${[...existingNames].join("、") || "(冇)"}`
  );

  let addedCategories = 0;
  let addedItems = 0;
  let nextSortOrder = maxSortOrder + 1;

  for (const category of MENU) {
    if (existingNames.has(category.name)) {
      console.log(`分類「${category.name}」已經存在,跳過(唔會覆蓋)`);
      continue;
    }

    const [insertedCategory] = await db
      .insert(menuCategories)
      .values({
        restaurantId,
        name: category.name,
        sortOrder: nextSortOrder++,
      })
      .returning();
    addedCategories += 1;
    console.log(`  ✓ 新分類「${insertedCategory.name}」開好喇`);

    for (const [itemIndex, item] of category.items.entries()) {
      const [existingItem] = await db
        .select()
        .from(menuItems)
        .where(and(eq(menuItems.restaurantId, restaurantId), eq(menuItems.code, item.code)))
        .limit(1);

      if (existingItem) {
        console.log(`  品項 ${item.code} ${item.name} 已經存在(code 撞咗),跳過`);
        continue;
      }

      const [insertedItem] = await db
        .insert(menuItems)
        .values({
          restaurantId,
          categoryId: insertedCategory.id,
          code: item.code,
          name: item.name,
          description: item.description,
          price: item.price,
          sortOrder: itemIndex,
        })
        .returning();
      addedItems += 1;
      console.log(`    ✓ ${item.code} ${item.name} $${item.price}`);

      if (item.options && item.options.length > 0) {
        await db.insert(itemOptions).values(
          item.options.map((option, optionIndex) => ({
            restaurantId,
            menuItemId: insertedItem.id,
            groupName: option.groupName,
            name: option.name,
            priceDelta: option.priceDelta,
            sortOrder: optionIndex,
          }))
        );
      }
    }
  }

  console.log("\n========================================");
  console.log(`Backfill 完成:新增 ${addedCategories} 個分類、${addedItems} 個品項。`);
  if (addedItems > 0) {
    console.log("記得跑 `npm run images:generate` 幫新品項生 AI 相(舊有已生相嘅唔會重生)。");
  }
  console.log("========================================\n");
}

main()
  .catch((err) => {
    console.error("Backfill 失敗:", err);
    process.exitCode = 1;
  })
  .finally(() => {
    process.exit(process.exitCode ?? 0);
  });
