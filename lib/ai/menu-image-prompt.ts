/**
 * AI 生圖 prompt template — 鎖死「茶餐廳風格」畫風。
 *
 * 對應 docs/PROJECT_PLAN.md 〈四、AI 圖片生成 Prompt 套件 §0〉。
 * 呢個係「保留靈魂」入面偏視覺嗰半,要同 lib/copy/tone.ts 互相呼應。
 *
 * 用法:FULL_PROMPT = STYLE_ANCHOR + "\n\nDISH:\n" + dishPrompt + "\n\n" + NEGATIVE_PROMPT
 * 實際逐款菜式嘅 dishPrompt 定義喺 lib/ai/image-prompts.ts。
 */

export const STYLE_ANCHOR = `
Professional food photography for a Hong Kong cha chaan teng (茶餐廳) menu.
Top-down 45-degree overhead angle, shot on a 50mm lens, shallow depth of field (f/2.8),
food served on a classic white melamine round plate with thin red or green rim
(the plate design must stay identical across all dishes in this set).
Background: weathered wood-grain formica tabletop in warm honey-brown tone,
slightly worn at the edges, authentic old-school Hong Kong diner texture.
Lighting: soft natural window light from the upper-left, warm color temperature (3200K-4000K),
gentle shadows, a little steam rising off hot food for freshness,
subtle glossy highlights on sauce/oil to show texture.
Color grading: warm nostalgic tone, slightly desaturated retro film look,
like a photo from a 1990s-2000s Hong Kong diner menu, not overly saturated or "clean commercial."
Small authentic props allowed at frame edges (chopsticks resting on a rest, a paper napkin,
a small dish of chili oil) but never covering the main dish.
Camera: sharp focus on food, background softly blurred at edges,
photorealistic, DSLR quality, 4K detail, no text, no watermark, no logo, no hands, no people.
`.trim();

export const NEGATIVE_PROMPT = `
blurry, low quality, cartoon, illustration, 3D render,
plastic-looking food, western plating style, minimalist white background,
studio softbox lighting, text overlay, watermark, logo, extra utensils cluttering frame,
distorted plate shape, inconsistent plate design.
`.trim();

export type ImageAspectRatio = "1:1" | "4:3" | "16:9";

export interface MenuImagePromptInput {
  /** 穩定 slug,用嚟做 blob 檔名 / prompt map key,例如 "set-a-beef-hofun" */
  slug: string;
  name: string;
  /** 逐款菜式嘅具體描述,嚟自 lib/ai/image-prompts.ts 嘅 DISH_PROMPTS map */
  dishPrompt: string;
  aspectRatio?: ImageAspectRatio;
}

/**
 * 將 style anchor + 逐款菜式 prompt + negative prompt 砌成完整嘅生圖 prompt。
 * 呢個函數嘅輸出應該原封不動存落 menu_items.image_prompt,方便日後追溯/重生。
 */
export function buildMenuImagePrompt(input: MenuImagePromptInput): string {
  return [
    STYLE_ANCHOR,
    "",
    `DISH: ${input.dishPrompt.trim()}`,
    "",
    `NEGATIVE PROMPT: ${NEGATIVE_PROMPT}`,
  ].join("\n");
}

/** Menu card thumbnail / detail hero / banner 三種用途嘅建議規格,對應 §3 */
export const IMAGE_SPECS: Record<
  "thumbnail" | "detail" | "banner",
  { aspectRatio: ImageAspectRatio; width: number; height: number }
> = {
  thumbnail: { aspectRatio: "1:1", width: 800, height: 800 },
  detail: { aspectRatio: "4:3", width: 1600, height: 1200 },
  banner: { aspectRatio: "16:9", width: 1920, height: 1080 },
};
