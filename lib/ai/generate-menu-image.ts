/**
 * 生成 + 儲存單一 menu item 相嘅共用邏輯。
 *
 * 俾 app/api/admin/menu-items/[id]/generate-image/route.ts(職員後台人手重生單張相)
 * 同 scripts/generate-menu-images.ts(本機一次過 seed 成套相)共用,
 * 避免兩邊各自抄一份、日後改壞唔同步。
 *
 * 對應 docs/PROJECT_PLAN.md 〈二、技術架構 §4.3〉+〈編輯註記〉第4/5點
 * (一定要用 experimental_generateImage,唔係 generateText;model id 唔鎖死)。
 */
import { experimental_generateImage as generateImage } from "ai";
import { put } from "@vercel/blob";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { menuItems, type MenuItem } from "@/lib/db/schema";
import { buildMenuImagePrompt } from "@/lib/ai/menu-image-prompt";
import { DISH_PROMPTS } from "@/lib/ai/image-prompts";

/**
 * AI Gateway image generation model id。
 *
 * 呢個唔鎖死 —— 落地前記得去 Vercel Dashboard →（你個 team）→ AI Gateway
 * 睇實際上架緊嘅 image generation model 名,唔啱就改呢個 const 就得,
 * 唔使郁下面嘅邏輯。
 */
export const IMAGE_MODEL = "google/gemini-2.5-flash-image";

/**
 * menu_items.code('A'/'B'/'C'/'D'/'E')→ lib/ai/image-prompts.ts 嘅 DISH_PROMPTS slug。
 * 對應 docs/PROJECT_PLAN.md §9.2 seed data 嘅 5 個經典餐。
 *
 * 如果日後老闆自己加新 item(冇喺呢度 map 到),resolveDishPrompt 會 fallback
 * 用 item.description / item.name 做 ad-hoc dish prompt,唔會炒。
 */
export const MENU_CODE_TO_IMAGE_SLUG: Record<string, string> = {
  A: "set-a-beef-hofun",
  B: "set-b-singapore-noodles",
  C: "set-c-yeung-chow-rice",
  D: "set-d-silver-sprout-noodles",
  E: "set-e-shrimp-fried-rice",
};

export interface ResolvedDishPrompt {
  /** 用嚟做 blob 檔名前綴同 log 標籤嘅穩定 slug(揾唔到對應 DISH_PROMPTS 就用 item.id 代替) */
  slug: string;
  dishPrompt: string;
}

type MenuItemForPrompt = Pick<MenuItem, "id" | "code" | "name" | "description">;

/**
 * 由 menu item 嘅 code 揾返 lib/ai/image-prompts.ts 入面對應嗰款菜嘅 dish prompt;
 * 冇 code 對應(例如老闆自己加嘅新 item)就 fallback 用 description ?? name。
 */
export function resolveDishPrompt(item: MenuItemForPrompt): ResolvedDishPrompt {
  const mappedSlug = item.code ? MENU_CODE_TO_IMAGE_SLUG[item.code] : undefined;
  if (mappedSlug && DISH_PROMPTS[mappedSlug]) {
    return { slug: mappedSlug, dishPrompt: DISH_PROMPTS[mappedSlug] };
  }
  return { slug: item.id, dishPrompt: item.description ?? item.name };
}

/** 生圖 pipeline 任何一步失敗都包成呢個 error,方便 route/script 分辨同顯示有意義訊息 */
export class MenuImageGenerationError extends Error {}

/**
 * 生成單一 menu item 嘅相:砌 prompt → 用 AI Gateway image model 生圖
 * → 上傳 Vercel Blob → 寫返 menu_items.image_url / image_prompt。
 */
export async function generateAndSaveMenuItemImage(
  item: MenuItemForPrompt
): Promise<{ imageUrl: string; prompt: string }> {
  const { slug, dishPrompt } = resolveDishPrompt(item);
  const prompt = buildMenuImagePrompt({ slug, name: item.name, dishPrompt });

  let image: { uint8Array: Uint8Array; mediaType?: string } | undefined;
  try {
    const result = await generateImage({
      model: IMAGE_MODEL,
      prompt,
    });
    image = result.image;
  } catch (err) {
    throw new MenuImageGenerationError(
      `生成「${item.name}」張相失敗(model: ${IMAGE_MODEL}):${
        err instanceof Error ? err.message : String(err)
      }。可能係 Gateway 未認證(AI_GATEWAY_API_KEY / VERCEL_OIDC_TOKEN)或者個 model id 喺 Gateway dashboard 已經冇上架,請去 dashboard 核實。`
    );
  }

  if (!image) {
    throw new MenuImageGenerationError(
      `AI Gateway 冇返任何圖片(model: ${IMAGE_MODEL},item: ${item.name})`
    );
  }

  let blobUrl: string;
  try {
    const blob = await put(`menu-items/${item.id}-${Date.now()}.webp`, image.uint8Array, {
      access: "public",
      contentType: image.mediaType ?? "image/webp",
    });
    blobUrl = blob.url;
  } catch (err) {
    throw new MenuImageGenerationError(
      `張相生咗但上傳去 Vercel Blob 失敗:${err instanceof Error ? err.message : String(err)}。` +
        `請確認 BLOB_READ_WRITE_TOKEN 已經設定。`
    );
  }

  try {
    const db = getDb();
    await db
      .update(menuItems)
      .set({ imageUrl: blobUrl, imagePrompt: prompt, updatedAt: new Date() })
      .where(eq(menuItems.id, item.id));
  } catch (err) {
    throw new MenuImageGenerationError(
      `張相已經上傳去 ${blobUrl},但寫返 DB 失敗:${
        err instanceof Error ? err.message : String(err)
      }。相冇跌,但要人手補返個 image_url。`
    );
  }

  return { imageUrl: blobUrl, prompt };
}
