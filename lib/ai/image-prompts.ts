/**
 * 逐款菜式生圖 prompt map。
 *
 * 對應 docs/PROJECT_PLAN.md 〈四、AI 圖片生成 Prompt 套件 §1/§2〉。
 * Key 用穩定 slug(唔用 DB uuid),方便 seed script 同 menu_items.code 對應,
 * 亦方便日後 re-generate 個別相唔使成套重生。
 *
 * 用法見 scripts/generate-menu-images.ts:
 *   const prompt = buildMenuImagePrompt({ slug, name, dishPrompt: DISH_PROMPTS[slug] })
 */

export const DISH_PROMPTS: Record<string, string> = {
  // ===== 現有 5 個經典餐(V0 → V1 seed) =====
  "set-a-beef-hofun": `
A large plate of "gon chau ngau ho" (Cantonese dry-fried flat rice noodles with beef).
Wide flat rice noodles (hor fun) stir-fried until slightly charred with visible wok hei
(smoky black char marks on noodle edges), tossed with tender sliced beef strips
seared to medium, silver bean sprouts, sliced spring onion, and a few strands of yellow chives,
glistening with dark soy sauce sheen. The noodles should look slightly separated and glossy,
not clumped, with visible char spots proving wok-fried technique.
Steam gently rising. Plate filled generously, mounded slightly in the center.
`.trim(),

  "set-b-singapore-noodles": `
A plate of "Singapore-style fried rice vermicelli" (星洲炒米).
Thin rice vermicelli noodles stir-fried golden-yellow with curry powder,
mixed with small pink shrimp, thin egg ribbons, diced red and green bell pepper,
bean sprouts, and shredded barbecue pork (char siu) strips.
Noodles should look light and separated (not oily/clumped), vivid turmeric-yellow color
from curry powder, with visible small flecks of red pepper and green scallion for contrast.
Slight glossy sheen from oil, a few shrimp visible on top for appetite appeal.
`.trim(),

  "set-c-yeung-chow-rice": `
A plate of "Yeung Chow fried rice" (揚州炒飯) — the classic Cantonese fried rice.
Fluffy individually-separated white rice grains stir-fried with visible diced ingredients:
pink char siu (barbecue pork) cubes, pink shrimp, diced carrot, green peas,
diced egg (scrambled and chopped), and diced spring onion — all colors evenly distributed
through the rice for a colorful confetti look. Rice should look light, dry, and fluffy
(not wet or greasy), with a faint wok-fried sheen. Mounded into a small dome shape on the plate.
`.trim(),

  "set-d-silver-sprout-noodles": `
A plate of "silver bean sprout fried rice vermicelli" (銀芽炒米粉).
Very thin white rice vermicelli noodles stir-fried simply with fresh silver bean sprouts
(mung bean sprouts with tails removed, extra crisp and pale), shredded egg,
and a few strands of chive, very light pale color (minimal soy sauce, mostly white/translucent
noodles), showing an elegant minimalist "poor man's noodle" look — clean, light, slightly wet-glossy.
Bean sprouts should look fresh and crunchy, scattered generously on top for texture contrast.
`.trim(),

  "set-e-shrimp-fried-rice": `
A plate of "shrimp fried rice" (蝦仁炒飯).
Fluffy white fried rice studded generously with plump pink-orange cooked shrimp
(shrimp larger and more prominent than in Yeung Chow rice — shrimp is the star),
scrambled egg pieces, diced spring onion, rice grains light and separated with a faint
translucent egg-coating sheen (egg-fried rice style, glossy not greasy).
6-8 whole shrimp visible arranged attractively across the top of the rice mound.
`.trim(),

  // ===== 建議擴充嘅經典冰室/茶記 item =====
  "iced-milk-tea": `
A tall glass of iced Hong Kong-style milk tea (凍奶茶), served in a classic
thick clear glass with condensation droplets on the outside, deep reddish-brown tea color,
ice cubes visible through the glass, a thin straw, served on a small saucer.
Milk tea should look rich and opaque-brown (not pale), slight creamy swirl visible at the top
where milk hasn't fully mixed. Background same wood table, water condensation ring under glass.
`.trim(),

  "hot-milk-tea": `
A white ceramic cup (classic diner style, slightly thick rim) of hot Hong Kong milk tea,
steam visibly rising, rich reddish-brown color, served on a matching white saucer with
a small metal teaspoon resting beside it. Sugar packet or condensed milk canister
optionally softly blurred in the background corner.
`.trim(),

  "egg-tart": `
Three freshly-baked Hong Kong egg tarts (蛋撻) arranged on the melamine plate,
golden flaky crumbly pastry shell (visible layered lamination texture at the edges),
smooth glossy pale-yellow egg custard filling with a slight caramelized sheen on top,
still slightly warm looking. Arranged in a small triangle cluster, one tart slightly
tilted to show the flaky side wall texture.
`.trim(),

  "pineapple-bun-butter": `
A pineapple bun (菠蘿包) sliced open with a thick slab of cold butter inserted
in the middle, butter slightly melting from the bread's warmth. Bun top should show
the signature golden-brown crackled "pineapple skin" crust texture (cookie-like crust
with a grid crack pattern), soft white bread interior visible at the sides.
Served on the melamine plate, a few crumbs scattered naturally around it.
`.trim(),

  "mango-pomelo-sago": `
A dessert bowl (not the round dinner plate — use a simple white glass dessert bowl instead)
of mango pomelo sago (楊枝甘露), thick creamy pale-orange mango puree base,
visible chunks of fresh diced mango, translucent white sago pearls, pomelo (grapefruit) sacs
scattered on top, a mint leaf garnish optional. Glossy, chilled, appetizing sheen on the surface,
served with a small spoon resting in the bowl.
`.trim(),

  "set-breakfast": `
A full "set meal" (常餐) tray shot — same overhead 45-degree angle but wider frame
to fit multiple items on the wood table: a ham-and-fried-egg sandwich (火腿煎蛋治) cut diagonally
in half showing the fried egg yolk and ham layer, a slice of Hong Kong-style toast with
kaya/butter or condensed milk on a side plate, and a cup of hot milk tea steaming beside it.
All items arranged naturally as if on a real breakfast tray, not perfectly symmetrical.
`.trim(),

  // ===== 2026-08-27 擴充餐牌新增品項 =====
  "lemon-tea": `
A tall glass of Hong Kong-style lemon tea (檸檬茶), served in the same classic
thick clear glass as the milk tea, amber-golden tea color (lighter and more
transparent than milk tea, no milk), 3-4 thin lemon slices floating and pressed
against the glass wall, ice cubes visible, a thin straw, small saucer underneath,
condensation droplets on the glass exterior. Background same wood table.
`.trim(),

  "yuenyeung": `
A white ceramic cup of yuenyeung (鴛鴦, Hong Kong coffee-milk-tea blend), same
classic diner cup and saucer as the hot milk tea shot, but the liquid should look
slightly darker and more matte than pure milk tea (coffee undertone visible),
steam rising gently, small metal teaspoon resting on the saucer beside the cup.
`.trim(),

  "luncheon-meat-egg-sandwich": `
A classic Hong Kong luncheon meat and fried egg sandwich (餐蛋治), white sandwich
bread lightly toasted, cut diagonally in half and stacked to show the cross-section:
a thick slice of pan-fried luncheon meat (SPAM-style, browned crispy edges) and a
fried egg with a slightly runny yolk peeking out, a thin smear of butter visible at
the bread edge, crusts trimmed off. Served on the melamine plate with a few thin
cucumber slices on the side for color contrast.
`.trim(),

  "french-toast": `
Hong Kong-style French toast (西多士), two thick slices of white bread sandwiched
with peanut butter filling, deep-fried golden-brown and crispy on the outside,
cut diagonally into triangles and stacked slightly overlapping to show the fluffy
pale interior. A generous pat of butter melting on top, golden syrup or condensed
milk drizzled over, a small puddle of syrup pooling on the plate.
`.trim(),

  "wonton-noodle-soup": `
A bowl of Hong Kong wonton noodle soup (雲吞麵), thin springy egg noodles (蛋麵)
coiled neatly in a clear pork-and-dried-flounder broth, 4-5 plump shrimp wontons
with visible pink shrimp through the thin wonton skin, a few strands of yellow
chives on top, served in a simple white bowl (not the round plate), broth clear
and steaming, a spoon resting beside the bowl.
`.trim(),

  "beef-brisket-noodle-soup": `
A bowl of Hong Kong beef brisket noodle soup (牛腩麵), thick chunks of tender
stewed beef brisket (some lean, some with soft connective tissue) piled on top of
flat ho fun noodles in a rich dark brown five-spice braising broth, a few sprigs
of scallion and cilantro scattered on top, served in a simple white bowl, steam
rising, glossy sheen on the brisket showing slow-braised tenderness.
`.trim(),

  "silk-stocking-milk-tea-pour": `
Action shot of Hong Kong "silk stocking" milk tea being poured/pulled between
two metal jugs held high apart, creating a long visible stream of reddish-brown tea
with light foam/bubbles forming, motion-frozen mid-pour, droplets visible in the air.
A cloth tea sock (絲襪) strainer visible resting on a jug spout in the background.
This shot breaks from the standard overhead-plate framing — use a dynamic slightly-lower
side angle instead, but keep the same warm lighting and wood-table background for consistency.
NOTE: exclude hands/arms from frame if possible — focus on the jugs and tea stream only;
if a hand must appear, keep it partially cropped at frame edge, no visible face.
`.trim(),
};

/** slug → 建議顯示名(繁體中文),俾 seed script / admin 工具用 */
export const DISH_NAMES: Record<string, string> = {
  "set-a-beef-hofun": "A餐 干炒牛河",
  "set-b-singapore-noodles": "B餐 星洲炒米",
  "set-c-yeung-chow-rice": "C餐 揚州炒飯",
  "set-d-silver-sprout-noodles": "D餐 銀芽炒米粉",
  "set-e-shrimp-fried-rice": "E餐 蝦仁炒飯",
  "iced-milk-tea": "凍奶茶",
  "hot-milk-tea": "熱奶茶",
  "egg-tart": "蛋撻",
  "pineapple-bun-butter": "菠蘿油",
  "mango-pomelo-sago": "楊枝甘露",
  "set-breakfast": "常餐",
  "silk-stocking-milk-tea-pour": "絲襪奶茶(沖茶動作圖)",
  "lemon-tea": "檸檬茶",
  "yuenyeung": "鴛鴦",
  "luncheon-meat-egg-sandwich": "餐蛋治",
  "french-toast": "西多士",
  "wonton-noodle-soup": "雲吞麵",
  "beef-brisket-noodle-soup": "牛腩麵",
};
