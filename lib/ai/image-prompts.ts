/**
 * 逐款菜式生圖 prompt map。
 *
 * 對應 docs/PROJECT_PLAN.md 〈四、AI 圖片生成 Prompt 套件 §1/§2〉。
 * Key 用穩定 slug(唔用 DB uuid),方便 seed script 同 menu_items.code 對應,
 * 亦方便日後 re-generate 個別相唔使成套重生。
 *
 * 2026-08-28 重寫:每條 dish prompt 而家開首都有一行 `Surface / Angle:`,
 * 喺 3 種真.茶記表面(舊 Formica 枱/不鏽鋼枱/紅米粒紙皮石櫃枱)+ 2 種角度
 * (elevated 45° / near-top-down 70-75°)之間人手輪流分配,先至令成套相
 * 真係睇落有變化 —— 淨係喺 lib/ai/menu-image-prompt.ts 嘅 STYLE_ANCHOR 度
 * 寫「vary background」係冇用嘅(每次生圖係獨立 call,個 model 唔知道第二張
 * 用過乜嘢),要逐條 prompt 度講明先做得到。同時拎走咗舊版「melamine plate
 * with thin red/green rim」、「background same wood table」呢類逐條重複嘅
 * 樣板文字(已經搬咗去 STYLE_ANCHOR 統一講,唔使每條 dish 都抄一次,減少
 * 「一式一樣」嘅感覺)。
 *
 * 用法見 scripts/generate-menu-images.ts:
 *   const prompt = buildMenuImagePrompt({ slug, name, dishPrompt: DISH_PROMPTS[slug] })
 */

export const DISH_PROMPTS: Record<string, string> = {
  // ===== 現有 5 個經典餐(V0 → V1 seed) =====
  "set-a-beef-hofun": `
Surface / Angle: worn honey-brown Formica tabletop with a faded, slightly
crumpled disposable paper placemat printed with barely-legible Chinese text;
elevated ~45-degree angle.
A large plate of "gon chau ngau ho" (Cantonese dry-fried flat rice noodles with
beef). Wide flat rice noodles (hor fun) stir-fried until slightly charred with
visible wok hei (smoky black char marks on noodle edges), tossed with tender
sliced beef strips seared to medium, silver bean sprouts, sliced spring onion,
and a few strands of yellow chives, glistening with dark soy sauce sheen. The
noodles look slightly separated and glossy, not clumped, with visible char
spots proving wok-fried technique, piled generously and a little messily onto
a well-used plate with a faint yellowed rim stain. A metal cup of disposable
wooden chopsticks sits at the frame edge.
`.trim(),

  "set-b-singapore-noodles": `
Surface / Angle: scratched brushed stainless-steel table with dull reflections;
near-top-down ~75-degree angle.
A plate of "Singapore-style fried rice vermicelli" (星洲炒米). Thin rice
vermicelli noodles stir-fried golden-yellow with curry powder, mixed with small
pink shrimp, thin egg ribbons, diced red and green bell pepper, bean sprouts,
and shredded barbecue pork (char siu) strips. Noodles look light and separated
(not oily/clumped), vivid turmeric-yellow color from curry powder, with visible
small flecks of red pepper and green scallion for contrast, a slight glossy
sheen from oil catching the flat fluorescent light overhead. A small chipped
saucer of chili oil with a drip mark sits just outside the frame's edge.
`.trim(),

  "set-c-yeung-chow-rice": `
Surface / Angle: red-and-cream speckled terrazzo/laminate counter; elevated
~45-degree angle.
A plate of "Yeung Chow fried rice" (揚州炒飯) — the classic Cantonese fried
rice. Fluffy individually-separated white rice grains stir-fried with visible
diced ingredients: pink char siu (barbecue pork) cubes, pink shrimp, diced
carrot, green peas, diced egg (scrambled and chopped), and diced spring onion —
colors scattered a little unevenly through the rice, not an overly perfect
confetti pattern. Rice looks light and dry with a faint wok-fried sheen,
mounded slightly off-center on a plate with a small visible chip at the rim.
A laminated numbered table tag rests at the frame edge.
`.trim(),

  "set-d-silver-sprout-noodles": `
Surface / Angle: worn honey-brown Formica tabletop; near-top-down ~75-degree
angle.
A plate of "silver bean sprout fried rice vermicelli" (銀芽炒米粉). Very thin
white rice vermicelli noodles stir-fried simply with fresh silver bean sprouts
(mung bean sprouts with tails removed, extra crisp and pale), shredded egg, and
a few strands of chive — very light in color (minimal soy sauce, mostly
white/translucent noodles), an unglamorous "poor man's noodle" look under the
flat overhead fluorescent light, slightly wet-glossy rather than styled. Bean
sprouts scattered generously, a little unevenly, on top. A box of thin paper
napkins sits softly out of focus at the frame edge.
`.trim(),

  "set-e-shrimp-fried-rice": `
Surface / Angle: scratched brushed stainless-steel table; elevated ~45-degree
angle.
A plate of "shrimp fried rice" (蝦仁炒飯). Fluffy white fried rice studded
generously with plump pink-orange cooked shrimp (larger and more prominent
than in Yeung Chow rice — shrimp is the star), scrambled egg pieces, diced
spring onion, rice grains light and separated with a faint translucent
egg-coating sheen. 6-8 whole shrimp arranged a little unevenly across the top
of the rice mound, catching a small overexposed highlight from the fluorescent
tube overhead. A tarnished stainless-steel spoon rests at the plate's edge.
`.trim(),

  // ===== 2026-08-27 擴充餐牌新增品項(2026-08-28 重寫畫風)=====
  "iced-milk-tea": `
Surface / Angle: red-and-cream speckled terrazzo/laminate counter; elevated
~45-degree angle showing the full glass profile.
A tall glass of iced Hong Kong-style milk tea (凍奶茶), served in a plain thick
clear glass (not fancy stemware) with condensation droplets running down the
outside and pooling on a small stained saucer underneath, deep reddish-brown
tea color, ice cubes visible through the glass, a slightly bent disposable
straw. Milk tea looks rich and opaque-brown, a faint creamy swirl visible at
the top where milk hasn't fully mixed. Fluorescent overhead light creates a
small hot highlight on the glass surface rather than a soft glow.
`.trim(),

  "hot-milk-tea": `
Surface / Angle: worn honey-brown Formica tabletop with a faded paper placemat;
elevated ~45-degree angle.
A plain white ceramic cup (classic diner style, slightly thick rim, a faint
tea-stain ring visible on the inside near the top) of hot Hong Kong milk tea,
steam visibly rising under the flat fluorescent light, rich reddish-brown
color, served on a mismatched slightly chipped saucer with a tarnished small
metal teaspoon resting beside it. A sugar packet or condensed-milk canister
sits a little carelessly in the background, softly out of focus.
`.trim(),

  "lemon-tea": `
Surface / Angle: scratched brushed stainless-steel table; elevated ~45-degree
angle showing the full glass profile.
A tall glass of Hong Kong-style lemon tea (檸檬茶) in the same plain thick
clear glass style as the milk tea, amber-golden tea color (lighter and more
transparent than milk tea, no milk), 3-4 thin lemon slices floating and
pressed against the glass wall, ice cubes visible, a slightly bent straw,
condensation droplets on the glass exterior pooling on a small stained saucer.
Overhead fluorescent light gives a slightly cool-green highlight on the glass.
`.trim(),

  "yuenyeung": `
Surface / Angle: red-and-cream speckled terrazzo/laminate counter; elevated
~45-degree angle.
A plain white ceramic cup of yuenyeung (鴛鴦, Hong Kong coffee-milk-tea blend),
same well-used diner cup-and-saucer style as the hot milk tea, but the liquid
looks slightly darker and more matte than pure milk tea (a coffee undertone
visible at the surface), steam rising under the flat fluorescent light, a
tarnished small metal teaspoon resting on the chipped saucer beside the cup.
`.trim(),

  "luncheon-meat-egg-sandwich": `
Surface / Angle: worn honey-brown Formica tabletop; near-top-down ~70-degree
angle.
A classic Hong Kong luncheon meat and fried egg sandwich (餐蛋治), white
sandwich bread lightly toasted, crusts trimmed off, cut diagonally in half and
stacked a little unevenly to show the cross-section: a thick slice of pan-fried
luncheon meat (SPAM-style, browned crispy edges) and a fried egg with a
slightly runny yolk peeking out, a thin smear of butter visible at the bread
edge. Served on a plain worn plate with a couple of thin cucumber slices pushed
to the side, catching a slightly harsh highlight from the overhead light.
`.trim(),

  "french-toast": `
Surface / Angle: scratched brushed stainless-steel table; elevated ~45-degree
angle.
Hong Kong-style French toast (西多士), two thick slices of white bread
sandwiched with peanut butter filling, deep-fried golden-brown and crispy on
the outside, cut diagonally into triangles and stacked a little unevenly to
show the fluffy pale interior. A generous, slightly melting pat of butter sits
on top, golden syrup or condensed milk drizzled over it and pooling messily on
the plate rather than in a neat line — the pool has already started spreading
toward the plate's chipped rim.
`.trim(),

  "egg-tart": `
Surface / Angle: red-and-cream speckled terrazzo/laminate counter; near-top-down
~75-degree angle.
Three freshly-baked Hong Kong egg tarts (蛋撻) on a plain well-used plate,
golden flaky crumbly pastry shell (visible layered lamination texture at the
edges), smooth glossy pale-yellow egg custard filling with a slight
caramelized sheen, still slightly warm-looking. Arranged in a loose,
not-quite-symmetrical cluster, one tart tilted to show the flaky side wall,
a few pastry crumbs scattered naturally around them on the plate.
`.trim(),

  "pineapple-bun-butter": `
Surface / Angle: worn honey-brown Formica tabletop; elevated ~45-degree angle.
A pineapple bun (菠蘿包) sliced open with a thick slab of cold butter inserted
in the middle, the butter slightly melting unevenly from the bread's warmth on
one side. The bun top shows the signature golden-brown crackled "pineapple
skin" crust texture (cookie-like crust with a grid crack pattern), soft white
bread interior visible at the sides. Set a little off-center on a plain worn
plate, a few crumbs scattered naturally around it, catching a hard fluorescent
highlight on the crust.
`.trim(),

  "mango-pomelo-sago": `
Surface / Angle: scratched brushed stainless-steel table; elevated ~45-degree
angle.
A plain glass dessert bowl (not a dinner plate) of mango pomelo sago (楊枝甘
露), thick creamy pale-orange mango puree base, visible chunks of fresh diced
mango, translucent white sago pearls, and pomelo (grapefruit) sacs scattered
unevenly on top. Chilled, with a slightly fogged/condensation-dulled glass
exterior from the cold contents, served with a small worn spoon resting
sideways in the bowl rather than perfectly placed.
`.trim(),

  "wonton-noodle-soup": `
Surface / Angle: red-and-cream speckled terrazzo/laminate counter; near-top-down
~70-degree angle.
A bowl of Hong Kong wonton noodle soup (雲吞麵), thin springy egg noodles
(蛋麵) coiled somewhat loosely in a clear pork-and-dried-flounder broth, 4-5
plump shrimp wontons with visible pink shrimp through the thin wonton skin, a
few strands of yellow chives scattered on top, served in a plain worn white
bowl (not a plate), broth clear and steaming under the flat overhead light,
a spoon resting against the bowl's rim rather than laid neatly beside it.
`.trim(),

  "beef-brisket-noodle-soup": `
Surface / Angle: worn honey-brown Formica tabletop; elevated ~45-degree angle.
A bowl of Hong Kong beef brisket noodle soup (牛腩麵), thick uneven chunks of
tender stewed beef brisket (some lean, some with soft connective tissue) piled
on top of flat ho fun noodles in a rich dark brown five-spice braising broth
that has slightly stained the inside rim of the bowl, a few sprigs of scallion
and cilantro scattered on top, steam rising under the harsh fluorescent light,
a faint oily sheen pooling at the broth's surface showing slow-braised
richness rather than a styled glisten.
`.trim(),

  "set-breakfast": `
Surface / Angle: scratched brushed stainless-steel table, wider tray framing;
elevated ~40-degree angle to fit multiple items.
A full "set meal" (常餐) tray shot: a ham-and-fried-egg sandwich (火腿煎蛋治)
cut diagonally in half showing the fried egg yolk and ham layer, a slice of
Hong Kong-style toast with condensed milk or kaya on a side plate, and a cup of
hot milk tea steaming beside it. Items arranged as if a busy waiter just set
the tray down — not perfectly symmetrical, plates slightly overlapping, one
plate a little closer to the frame edge than the others.
`.trim(),

  "silk-stocking-milk-tea-pour": `
Surface / Angle: dynamic side angle at counter height (not overhead) — a sliver
of red-and-green checkered floor tile softly out of focus in the far
background.
Action shot of Hong Kong "silk stocking" milk tea being poured/pulled between
two dented metal jugs held apart, creating a long visible stream of
reddish-brown tea with light foam/bubbles forming, motion-frozen mid-pour,
droplets visible in the air catching a hard fluorescent highlight. A worn
cloth tea sock (絲襪) strainer rests on one jug's spout. NOTE: exclude
hands/arms from frame if possible — focus on the jugs and tea stream only; if
a hand must appear, keep it partially cropped at the frame edge, no visible
face.
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
  "lemon-tea": "檸檬茶",
  "yuenyeung": "鴛鴦",
  "luncheon-meat-egg-sandwich": "餐蛋治",
  "french-toast": "西多士",
  "egg-tart": "蛋撻",
  "pineapple-bun-butter": "菠蘿油",
  "mango-pomelo-sago": "楊枝甘露",
  "wonton-noodle-soup": "雲吞麵",
  "beef-brisket-noodle-soup": "牛腩麵",
  "set-breakfast": "常餐(bonus,冇對應 menu item)",
  "silk-stocking-milk-tea-pour": "絲襪奶茶(沖茶動作圖,bonus,冇對應 menu item)",
};
