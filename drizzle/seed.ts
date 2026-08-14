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
 */
import bcrypt from "bcryptjs";
import { getDb } from "@/lib/db";
import { itemOptions, menuCategories, menuItems, restaurants, staffUsers } from "@/lib/db/schema";

const ADMIN_EMAIL = "boss@cctmenu.hk";
const ADMIN_PLACEHOLDER_PASSWORD = "ChangeMe123!";

const CLASSIC_SETS = [
  { code: "A", name: "干炒牛河", description: "鑊氣十足,乾身唔油膩", price: "65.00" },
  { code: "B", name: "星洲炒米", description: "咖喱香,微辣惹味", price: "60.00" },
  { code: "C", name: "揚州炒飯", description: "粒粒分明,叉燒蝦仁樣樣齊", price: "68.00" },
  { code: "D", name: "銀芽炒米粉", description: "清爽少油,銀芽夠爽脆", price: "55.00" },
  { code: "E", name: "蝦仁炒飯", description: "蝦仁飽滿,鑊氣夠香", price: "70.00" },
] as const;

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
      name: "常樂冰室",
      domain: "cctmenu.isaaccheng.xyz",
      serviceChargeEnabled: false,
      minSpendAmount: null,
    })
    .returning();
  console.log(`  ✓ restaurant 開好喇:${restaurant.name} (${restaurant.id})`);

  console.log("開緊分類……");
  const [category] = await db
    .insert(menuCategories)
    .values({
      restaurantId: restaurant.id,
      name: "常餐/套餐",
      sortOrder: 0,
    })
    .returning();
  console.log(`  ✓ 分類「${category.name}」開好喇`);

  console.log("落緊 5 個經典餐……");
  const insertedItems: (typeof menuItems.$inferSelect)[] = [];
  for (const [index, set] of CLASSIC_SETS.entries()) {
    const [item] = await db
      .insert(menuItems)
      .values({
        restaurantId: restaurant.id,
        categoryId: category.id,
        code: set.code,
        name: set.name,
        description: set.description,
        price: set.price,
        sortOrder: index,
      })
      .returning();
    insertedItems.push(item);
    console.log(`  ✓ ${set.code}餐 ${set.name} $${set.price}`);
  }

  console.log("掛緊套餐加價/走料選項……");
  for (const item of insertedItems) {
    await db.insert(itemOptions).values([
      {
        restaurantId: restaurant.id,
        menuItemId: item.id,
        groupName: "套餐飲品",
        name: "跟套餐(+$10)",
        priceDelta: "10.00",
        sortOrder: 0,
      },
      {
        restaurantId: restaurant.id,
        menuItemId: item.id,
        groupName: "套餐飲品",
        name: "凍飲(+$6)",
        priceDelta: "6.00",
        sortOrder: 1,
      },
      {
        restaurantId: restaurant.id,
        menuItemId: item.id,
        groupName: "套餐飲品",
        name: "熱飲(+$3)",
        priceDelta: "3.00",
        sortOrder: 2,
      },
      {
        restaurantId: restaurant.id,
        menuItemId: item.id,
        groupName: "走料",
        name: "走青",
        priceDelta: "0.00",
        sortOrder: 3,
      },
    ]);
  }
  console.log("  ✓ 每個餐都掛咗跟套餐/凍飲/熱飲/走青選項");

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
