/**
 * 一次性 seed script:為餐廳所有 menu item 用 AI Gateway 生成茶記風格相。
 * 對應 docs/PROJECT_PLAN.md checklist M4 / §4.3。
 *
 * 跑法(本機):npm run images:generate
 *
 * 跑之前必須要有以下 env 變數喺 process.env 度攞得到:
 *   - DATABASE_URL              Neon connection string
 *   - DEFAULT_RESTAURANT_ID     seed 出嚟嗰行 restaurants.id(先跑 `npm run db:seed`)
 *   - AI_GATEWAY_API_KEY        或者已經 `vercel env pull .env.local` 攞到嘅
 *                                VERCEL_OIDC_TOKEN(擇一即可)
 *   - BLOB_READ_WRITE_TOKEN     Vercel Blob 上傳權限
 *
 * 最簡單做法:喺 project 度跑一次 `vercel env pull .env.local` 攞晒上面呢啲,
 * 再用會讀 .env.local 嘅方式起呢個 script,例如:
 *   npx dotenv -e .env.local -- npm run images:generate
 * 或者直接 `export $(cat .env.local | xargs)` 之後再跑 `npm run images:generate`。
 *
 * 呢個 script 冇危險性(唔會刪嘢),但會實際計費(AI Gateway 生圖 + Blob 儲存),
 * 唔好隨手一直重複跑成套 —— 想補生單一張相用職員後台個掣(見
 * app/api/admin/menu-items/[id]/generate-image/route.ts)就夠。
 */
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { menuItems } from "@/lib/db/schema";
import {
  generateAndSaveMenuItemImage,
  MenuImageGenerationError,
  resolveDishPrompt,
} from "@/lib/ai/generate-menu-image";
import { DISH_NAMES } from "@/lib/ai/image-prompts";

function checkRequiredEnv(): boolean {
  let ok = true;

  if (!process.env.DATABASE_URL) {
    console.error(
      "未設定 DATABASE_URL。請跑 `vercel env pull .env.local`,或者手動喺 .env.local 填 Neon connection string。"
    );
    ok = false;
  }
  if (!process.env.DEFAULT_RESTAURANT_ID) {
    console.error(
      "未設定 DEFAULT_RESTAURANT_ID。請先跑 `npm run db:seed`,將出返嚟嗰個 restaurant id 填入 env,再嚟過。"
    );
    ok = false;
  }
  if (!process.env.AI_GATEWAY_API_KEY && !process.env.VERCEL_OIDC_TOKEN) {
    console.warn(
      "⚠ 未見 AI_GATEWAY_API_KEY 或 VERCEL_OIDC_TOKEN,call AI Gateway 好可能會 401。" +
        "建議跑 `vercel env pull .env.local` 攞返呢啲認證,或者手動 export AI_GATEWAY_API_KEY。"
    );
  }
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.warn("⚠ 未見 BLOB_READ_WRITE_TOKEN,上傳 Vercel Blob 好可能會失敗。");
  }

  return ok;
}

async function main() {
  if (!checkRequiredEnv()) {
    process.exit(1);
  }

  const restaurantId = process.env.DEFAULT_RESTAURANT_ID as string;
  const db = getDb();

  const items = await db.select().from(menuItems).where(eq(menuItems.restaurantId, restaurantId));

  if (items.length === 0) {
    console.log("呢間餐廳重未有任何 menu item,冇嘢好生。請先跑 `npm run db:seed`。");
    return;
  }

  console.log(`搵到 ${items.length} 個 menu item,開波生相……\n`);

  let done = 0;
  let failed = 0;

  for (const item of items) {
    const { slug } = resolveDishPrompt(item);
    const label = DISH_NAMES[slug] ?? (item.code ? `${item.code}餐 ${item.name}` : item.name);
    const progress = `${done + failed + 1}/${items.length}`;

    console.log(`生成緊 ${label}……(${progress})`);
    try {
      const { imageUrl } = await generateAndSaveMenuItemImage(item);
      done += 1;
      console.log(`  ✓ 搞掂!${label} → ${imageUrl}`);
    } catch (err) {
      failed += 1;
      const message = err instanceof MenuImageGenerationError ? err.message : String(err);
      console.error(`  ✗ ${label} 生失敗:${message}`);
    }
  }

  console.log(`\n完成 ${done}/${items.length},失敗 ${failed} 個。`);
  if (failed > 0) {
    console.log("有失敗嘅可以之後用職員後台個「重新生成」掣個別補返,唔使成套再嚟一次。");
    process.exitCode = 1;
  }
}

main()
  .catch((err) => {
    console.error("Script 中斷:", err);
    process.exitCode = 1;
  })
  .finally(() => {
    process.exit(process.exitCode ?? 0);
  });
