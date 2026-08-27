/**
 * AI 生圖 prompt template — 鎖死「香港懷舊茶記」畫風。
 *
 * 對應 docs/PROJECT_PLAN.md 〈四、AI 圖片生成 Prompt 套件 §0〉。
 * 呢個係「保留靈魂」入面偏視覺嗰半,要同 lib/copy/tone.ts 互相呼應。
 *
 * 2026-08-28 大幅重寫:舊版本寫「professional food photography...DSLR quality
 * ...soft natural window light」,生出嚟成套相太靚太乾淨、太一式一樣,睇落似
 * 西式雜誌/連鎖店 catalog,唔似真.香港茶記(用戶反饋原話:「太假一式一樣」)。
 * 新版本刻意反過來:寫成「真.茶記客人隨手影嘅相」,用光管冷光、舊 Formica/
 * 不鏽鋼枱面、有崩邊嘅美耐皿碟呢類貼地細節,取代乾淨專業攝影棚感。表面/角度
 * 由每個 dish prompt 自己指定(見 lib/ai/image-prompts.ts 逐款嘅 "Surface/Angle"
 * 一行),3 種表面 + 2 種角度輪流用,先至真係做到成套相有變化,唔靠喺呢個
 * STYLE_ANCHOR 度得個「vary」得個講字(單次生圖冇上文下理知道其他相張乜樣)。
 *
 * 用法:FULL_PROMPT = STYLE_ANCHOR + "\n\nDISH:\n" + dishPrompt + "\n\n" + NEGATIVE_PROMPT
 * 實際逐款菜式嘅 dishPrompt 定義喺 lib/ai/image-prompts.ts。
 */

export const STYLE_ANCHOR = `
Amateur-style photography of real Hong Kong cha chaan teng (茶餐廳) food — the
look of an actual customer's phone or old compact-camera snapshot taken inside a
real old-school Hong Kong diner, NOT a polished professional food-photography
shoot. This must NOT look like a Western restaurant menu, a food magazine
spread, or a clean commercial catalog photo.

Lighting: harsh, flat overhead fluorescent tube lighting (white-to-slightly-green
cast, roughly 5000-6500K), sometimes mixed with warm incandescent wall light
bleeding in from one side — a slightly mismatched, unglamorous color temperature
typical of a real cha chaan teng, not soft golden-hour window light. Small hot
spots of overexposure on shiny sauce/oil are fine and expected; shadows should be
a bit harsh and short, not moody or dramatic.

Tableware: simple, well-used white melamine plates/bowls with a thin green or
red rim, occasional small chips or a faint yellowed stain near the rim from years
of use — same general plate family across the set, but each one allowed its own
small imperfection rather than looking brand-new and identical.

Authentic clutter allowed at frame edges (never covering the dish itself): a
metal cup holding a couple of disposable wooden chopsticks, a small stained
saucer with a chili-oil or soy-sauce drip mark, a roll or box of thin paper
napkins (a near-universal fixture on every cha chaan teng table), a laminated
numbered table tag, a slightly tarnished stainless-steel spoon.

Camera & framing: shot like a real compact camera or phone snapshot — mostly
deep focus rather than a creamy shallow-DOF blur, framed a little casually and
slightly off-center, as if someone just set the dish down and snapped it before
eating, not a perfectly centered studio composition. No visible hands, arms,
faces, text, watermark, or logo.

Color grading: warm but slightly flat and a touch undersaturated, with a hint of
fluorescent green-cyan cast creeping into the highlights — like a real photo
from an old Hong Kong cha chaan teng taken on an ordinary digital camera around
2005-2012, not a curated "artsy desaturated film" look and not an oversaturated
glossy commercial shot.

The specific table surface and camera angle for this dish are given below in
the DISH section (Surface / Angle line) — follow that, not a fixed default,
so the surface and framing actually differ from one dish to the next.
`.trim();

export const NEGATIVE_PROMPT = `
professional studio food photography, DSLR bokeh, shallow depth of field,
soft golden-hour window light, minimalist clean background, white seamless
backdrop, Western fine-dining plating, perfectly symmetrical composition,
overly polished glossy "stock photo" look, magazine-spread lighting,
cartoon, illustration, 3D render, CGI, plastic-looking food,
text overlay, watermark, logo, brand name, visible price-tag text,
hands, arms, faces, blurry or out-of-focus main dish,
distorted plate shape, brand-new pristine tableware.
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
