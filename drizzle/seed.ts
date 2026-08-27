/**
 * V1 seed script — 對應 docs/PROJECT_PLAN.md §9.2 / checklist M1。
 *
 * 跑法:npm run db:seed
 * 前提:DATABASE_URL 已經設定好(`vercel env pull .env.local`,或者手動喺
 * .env.local 填 Neon connection string)。
 *
 * 呢個 script 冇做 idempotent 檢查 —— 淨係應該喺全新/測試環境跑一次。
 * 再跑一次會撞 restaurants.slug / domain 嘅 unique constraint 而失敗,
 * 呢個係特登嘅安全網,唔想你手多多喺已經有數據嘅 DB 度重複 seed。
 *
 * 已經 seed 過、想加多啲分類/品項落現有 restaurant?用
 * `scripts/backfill-menu.ts`(idempotent,唔會撞現有數據)。
 *
 * 完整餐牌資料(分類/品項/加料選項)寫喺 `drizzle/menu-data.ts`,呢兩個
 * script 共用,避免手抄兩份唔同步。
 */
import bcrypt from "bcryptjs";
import { getDb } from "@/lib/db";
import { itemOptions, menuCategories, menuItems, restaurants, staffUsers } from "@/lib/db/schema";
import { MENU } from "@/drizzle/menu-data";

const ADMIN_EMAIL = "boss@cctmenu.hk";
const ADMIN_PLACEHOLDER_PASSWORD = "ChangeMe123!";

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error(
      "未設定 DATABASE_URL。請跑 `vercel env pull .env.local`,或者手動喺 .env.local 填 Neon connection string。"
    );
    process.exit(1);
  }

  const db = getDb();

  console.log("開緊間舖……");
  const [restaurant] = await db
    .insert(restaurants)
    .values({
      slug: "cctmenu",
      name: "雄記冰室",
      domain: "cctmenu.isaaccheng.xyz",
      serviceChargeEnabled: false,
      minSpendAmount: null,
    })
    .returning();
  console.log(`  ✓ restaurant 開好喇:${restaurant.name} (${restaurant.id})`);

  for (const [categoryIndex, category] of MENU.entries()) {
    console.log(`開緊分類「${category.name}」……`);
    const [insertedCategory] = await db
      .insert(menuCategories)
      .values({
        restaurantId: restaurant.id,
        name: category.name,
        sortOrder: categoryIndex,
      })
      .returning();
    console.log(`  ✓ 分類「${insertedCategory.name}」開好喇`);

    for (const [itemIndex, item] of category.items.entries()) {
      const [insertedItem] = await db
        .insert(menuItems)
        .values({
          restaurantId: restaurant.id,
          categoryId: insertedCategory.id,
          code: item.code,
          name: item.name,
          description: item.description,
          price: item.price,
          sortOrder: itemIndex,
        })
        .returning();
      console.log(`  ✓ ${item.code} ${item.name} $${item.price}`);

      if (item.options && item.options.length > 0) {
        await db.insert(itemOptions).values(
          item.options.map((option, optionIndex) => ({
            restaurantId: restaurant.id,
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
  console.log("  ✓ 全部分類/品項/加料選項都落好喇");

  console.log("開緊 admin 帳號……");
  const passwordHash = await bcrypt.hash(ADMIN_PLACEHOLDER_PASSWORD, 10);
  const [admin] = await db
    .insert(staffUsers)
    .values({
      restaurantId: restaurant.id,
      email: ADMIN_EMAIL,
      passwordHash,
      displayName: "老闆",
      role: "admin",
    })
    .returning();
  console.log(`  ✓ admin 帳號開好喇:${admin.email}`);

  console.log("\n========================================");
  console.log("Seed 完成!");
  console.log(`Admin 電郵:${ADMIN_EMAIL}`);
  console.log(`Admin 密碼(placeholder):${ADMIN_PLACEHOLDER_PASSWORD}`);
  console.log("⚠ 呢個係臨時密碼,第一次登入之後即刻去後台改返個人密碼。");
  console.log("----------------------------------------");
  console.log("請將以下值填入 .env.local / Vercel Project Env 嘅 DEFAULT_RESTAURANT_ID:");
  console.log(`  DEFAULT_RESTAURANT_ID=${restaurant.id}`);
  console.log("========================================\n");
}

main()
  .catch((err) => {
    console.error("Seed 失敗:", err);
    process.exitCode = 1;
  })
  .finally(() => {
    process.exit(process.exitCode ?? 0);
  });
