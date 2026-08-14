/**
 * POST /api/admin/menu-items/[id]/generate-image
 *
 * 職員後台「幫呢味嘢生張相/重生張相」掣叫嘅 endpoint。用 Route Handler 而唔係
 * Server Action 係因為呢個係獨立 fetch(要自己畫 loading spinner,生成需時
 * 幾秒,唔啱塞入表單 submit 嘅阻塞感)—— 對應 PROJECT_PLAN §4.3。
 *
 * 對應〈編輯註記〉第4/5點:一定要用 experimental_generateImage(唔係
 * generateText),model id 唔鎖死 —— 實際邏輯抽咗喺 lib/ai/generate-menu-image.ts
 * 俾呢度同 scripts/generate-menu-images.ts 共用。
 */
import { requireStaffRole } from "@/lib/auth";
import { getCurrentRestaurantId } from "@/lib/tenant";
import { getMenuItemById } from "@/lib/db/queries/menu";
import {
  generateAndSaveMenuItemImage,
  MenuImageGenerationError,
} from "@/lib/ai/generate-menu-image";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    await requireStaffRole(["admin"]);
  } catch (err) {
    const message = err instanceof Error ? err.message : "未登入";
    const status = message === "冇權限做呢個操作" ? 403 : 401;
    return Response.json({ error: message }, { status });
  }

  const restaurantId = await getCurrentRestaurantId();
  const item = await getMenuItemById(restaurantId, id);
  if (!item) {
    return Response.json({ error: "搵唔到呢個餐牌品項,可能已經被刪除" }, { status: 404 });
  }

  try {
    const { imageUrl } = await generateAndSaveMenuItemImage(item);
    return Response.json({ imageUrl });
  } catch (err) {
    const message =
      err instanceof MenuImageGenerationError
        ? err.message
        : `生圖失敗:${err instanceof Error ? err.message : String(err)}`;
    console.error("[generate-image]", item.id, err);
    return Response.json({ error: message }, { status: 502 });
  }
}
