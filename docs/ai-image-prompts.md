# AI 圖片生成 Prompt 套件

> 2026-08-28 因為 Vercel AI Gateway 而家要求帳戶要有信用卡先俾生圖(見 RUN-BOOK / Obsidian 記錄),
> 呢份文件係俾你自己攞去外面(Midjourney / DALL·E / Gemini / Stable Diffusion 等等)生圖用嘅完整 prompt,
> 已經包埋 STYLE_ANCHOR + 逐款菜式 DISH prompt + NEGATIVE PROMPT,照抄落去對應工具個 prompt 輸入框就得。

對應 `lib/ai/menu-image-prompt.ts` + `lib/ai/image-prompts.ts`(code 嗰邊嘅版本先係 source of truth,
呢份文件係由嗰兩個檔案直接生成,如果之後改咗 prompt,要重新跑一次生成先會同步)。

## 點解畫風同舊版唔同

舊版 STYLE_ANCHOR 寫「professional food photography...DSLR quality...soft natural window light」,
生出嚟成套相太靚太乾淨、太一式一樣,似西式雜誌/連鎖店 catalog,唔似真.香港茶記。新版刻意反過來,
寫成「真.茶記客人隨手影嘅相」—— 光管冷光、舊 Formica/不鏽鋼枱面、有崩邊嘅美耐皿碟、餐枱紙巾盒、
蘸醬碟油漬呢類貼地細節。每款菜式仲各自指定咗唔同嘅「Surface / Angle」(3 種表面 × 2 種角度輪流分配),
等成套相真係睇落有變化,唔係淨係口講「vary」但實際上每次生圖都用返一樣嘅背景。

## 用法

1. 揀一個支援 text-to-image 嘅工具(Midjourney、DALL·E 3、Gemini、Stable Diffusion 等)。
2. 逐款菜式,將下面成段(由 "Amateur-style photography..." 到 "NEGATIVE PROMPT:" 嗰行)照抄落個工具嘅 prompt 輸入框。
   如果個工具有獨立嘅 negative prompt 欄位,可以將 "NEGATIVE PROMPT:" 嗰段獨立剪出嚟填落去;
   如果冇獨立欄位(例如某啲工具淨係得一個 text box),成段(包括 negative 嗰句)照貼落去都得,
   個模型會自動理解 "NEGATIVE PROMPT:" 呢個標籤想表達乜嘢。
3. 建議每款生 2-3 張,人手揀最靚一張。
4. 生成完成之後,將圖片存做 WebP,再喺職員後台 → 餐牌 → 揀個品項 → Edit,
   手動上傳(或者將檔案放去 `public/` 再改 `image_url`,睇實際 admin UI 支援邊種上傳方式)。

## 建議圖片規格

| 用途 | 比例 | 建議解析度 |
|---|---|---|
| Menu 卡片縮圖 | 1:1 | 800×800 |
| 品項詳情 hero | 4:3 | 1600×1200 |
| 首頁 banner(可選) | 16:9 | 1920×1080 |

---

## A. A餐 干炒牛河 ($65.00)

```
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

DISH: Surface / Angle: worn honey-brown Formica tabletop with a faded, slightly
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

NEGATIVE PROMPT: professional studio food photography, DSLR bokeh, shallow depth of field,
soft golden-hour window light, minimalist clean background, white seamless
backdrop, Western fine-dining plating, perfectly symmetrical composition,
overly polished glossy "stock photo" look, magazine-spread lighting,
cartoon, illustration, 3D render, CGI, plastic-looking food,
text overlay, watermark, logo, brand name, visible price-tag text,
hands, arms, faces, blurry or out-of-focus main dish,
distorted plate shape, brand-new pristine tableware.
```

## B. B餐 星洲炒米 ($60.00)

```
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

DISH: Surface / Angle: scratched brushed stainless-steel table with dull reflections;
near-top-down ~75-degree angle.
A plate of "Singapore-style fried rice vermicelli" (星洲炒米). Thin rice
vermicelli noodles stir-fried golden-yellow with curry powder, mixed with small
pink shrimp, thin egg ribbons, diced red and green bell pepper, bean sprouts,
and shredded barbecue pork (char siu) strips. Noodles look light and separated
(not oily/clumped), vivid turmeric-yellow color from curry powder, with visible
small flecks of red pepper and green scallion for contrast, a slight glossy
sheen from oil catching the flat fluorescent light overhead. A small chipped
saucer of chili oil with a drip mark sits just outside the frame's edge.

NEGATIVE PROMPT: professional studio food photography, DSLR bokeh, shallow depth of field,
soft golden-hour window light, minimalist clean background, white seamless
backdrop, Western fine-dining plating, perfectly symmetrical composition,
overly polished glossy "stock photo" look, magazine-spread lighting,
cartoon, illustration, 3D render, CGI, plastic-looking food,
text overlay, watermark, logo, brand name, visible price-tag text,
hands, arms, faces, blurry or out-of-focus main dish,
distorted plate shape, brand-new pristine tableware.
```

## C. C餐 揚州炒飯 ($68.00)

```
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

DISH: Surface / Angle: red-and-cream speckled terrazzo/laminate counter; elevated
~45-degree angle.
A plate of "Yeung Chow fried rice" (揚州炒飯) — the classic Cantonese fried
rice. Fluffy individually-separated white rice grains stir-fried with visible
diced ingredients: pink char siu (barbecue pork) cubes, pink shrimp, diced
carrot, green peas, diced egg (scrambled and chopped), and diced spring onion —
colors scattered a little unevenly through the rice, not an overly perfect
confetti pattern. Rice looks light and dry with a faint wok-fried sheen,
mounded slightly off-center on a plate with a small visible chip at the rim.
A laminated numbered table tag rests at the frame edge.

NEGATIVE PROMPT: professional studio food photography, DSLR bokeh, shallow depth of field,
soft golden-hour window light, minimalist clean background, white seamless
backdrop, Western fine-dining plating, perfectly symmetrical composition,
overly polished glossy "stock photo" look, magazine-spread lighting,
cartoon, illustration, 3D render, CGI, plastic-looking food,
text overlay, watermark, logo, brand name, visible price-tag text,
hands, arms, faces, blurry or out-of-focus main dish,
distorted plate shape, brand-new pristine tableware.
```

## D. D餐 銀芽炒米粉 ($55.00)

```
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

DISH: Surface / Angle: worn honey-brown Formica tabletop; near-top-down ~75-degree
angle.
A plate of "silver bean sprout fried rice vermicelli" (銀芽炒米粉). Very thin
white rice vermicelli noodles stir-fried simply with fresh silver bean sprouts
(mung bean sprouts with tails removed, extra crisp and pale), shredded egg, and
a few strands of chive — very light in color (minimal soy sauce, mostly
white/translucent noodles), an unglamorous "poor man's noodle" look under the
flat overhead fluorescent light, slightly wet-glossy rather than styled. Bean
sprouts scattered generously, a little unevenly, on top. A box of thin paper
napkins sits softly out of focus at the frame edge.

NEGATIVE PROMPT: professional studio food photography, DSLR bokeh, shallow depth of field,
soft golden-hour window light, minimalist clean background, white seamless
backdrop, Western fine-dining plating, perfectly symmetrical composition,
overly polished glossy "stock photo" look, magazine-spread lighting,
cartoon, illustration, 3D render, CGI, plastic-looking food,
text overlay, watermark, logo, brand name, visible price-tag text,
hands, arms, faces, blurry or out-of-focus main dish,
distorted plate shape, brand-new pristine tableware.
```

## E. E餐 蝦仁炒飯 ($70.00)

```
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

DISH: Surface / Angle: scratched brushed stainless-steel table; elevated ~45-degree
angle.
A plate of "shrimp fried rice" (蝦仁炒飯). Fluffy white fried rice studded
generously with plump pink-orange cooked shrimp (larger and more prominent
than in Yeung Chow rice — shrimp is the star), scrambled egg pieces, diced
spring onion, rice grains light and separated with a faint translucent
egg-coating sheen. 6-8 whole shrimp arranged a little unevenly across the top
of the rice mound, catching a small overexposed highlight from the fluorescent
tube overhead. A tarnished stainless-steel spoon rests at the plate's edge.

NEGATIVE PROMPT: professional studio food photography, DSLR bokeh, shallow depth of field,
soft golden-hour window light, minimalist clean background, white seamless
backdrop, Western fine-dining plating, perfectly symmetrical composition,
overly polished glossy "stock photo" look, magazine-spread lighting,
cartoon, illustration, 3D render, CGI, plastic-looking food,
text overlay, watermark, logo, brand name, visible price-tag text,
hands, arms, faces, blurry or out-of-focus main dish,
distorted plate shape, brand-new pristine tableware.
```

## F. 凍奶茶 ($22.00)

```
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

DISH: Surface / Angle: red-and-cream speckled terrazzo/laminate counter; elevated
~45-degree angle showing the full glass profile.
A tall glass of iced Hong Kong-style milk tea (凍奶茶), served in a plain thick
clear glass (not fancy stemware) with condensation droplets running down the
outside and pooling on a small stained saucer underneath, deep reddish-brown
tea color, ice cubes visible through the glass, a slightly bent disposable
straw. Milk tea looks rich and opaque-brown, a faint creamy swirl visible at
the top where milk hasn't fully mixed. Fluorescent overhead light creates a
small hot highlight on the glass surface rather than a soft glow.

NEGATIVE PROMPT: professional studio food photography, DSLR bokeh, shallow depth of field,
soft golden-hour window light, minimalist clean background, white seamless
backdrop, Western fine-dining plating, perfectly symmetrical composition,
overly polished glossy "stock photo" look, magazine-spread lighting,
cartoon, illustration, 3D render, CGI, plastic-looking food,
text overlay, watermark, logo, brand name, visible price-tag text,
hands, arms, faces, blurry or out-of-focus main dish,
distorted plate shape, brand-new pristine tableware.
```

## G. 熱奶茶 ($20.00)

```
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

DISH: Surface / Angle: worn honey-brown Formica tabletop with a faded paper placemat;
elevated ~45-degree angle.
A plain white ceramic cup (classic diner style, slightly thick rim, a faint
tea-stain ring visible on the inside near the top) of hot Hong Kong milk tea,
steam visibly rising under the flat fluorescent light, rich reddish-brown
color, served on a mismatched slightly chipped saucer with a tarnished small
metal teaspoon resting beside it. A sugar packet or condensed-milk canister
sits a little carelessly in the background, softly out of focus.

NEGATIVE PROMPT: professional studio food photography, DSLR bokeh, shallow depth of field,
soft golden-hour window light, minimalist clean background, white seamless
backdrop, Western fine-dining plating, perfectly symmetrical composition,
overly polished glossy "stock photo" look, magazine-spread lighting,
cartoon, illustration, 3D render, CGI, plastic-looking food,
text overlay, watermark, logo, brand name, visible price-tag text,
hands, arms, faces, blurry or out-of-focus main dish,
distorted plate shape, brand-new pristine tableware.
```

## H. 檸檬茶 ($20.00)

```
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

DISH: Surface / Angle: scratched brushed stainless-steel table; elevated ~45-degree
angle showing the full glass profile.
A tall glass of Hong Kong-style lemon tea (檸檬茶) in the same plain thick
clear glass style as the milk tea, amber-golden tea color (lighter and more
transparent than milk tea, no milk), 3-4 thin lemon slices floating and
pressed against the glass wall, ice cubes visible, a slightly bent straw,
condensation droplets on the glass exterior pooling on a small stained saucer.
Overhead fluorescent light gives a slightly cool-green highlight on the glass.

NEGATIVE PROMPT: professional studio food photography, DSLR bokeh, shallow depth of field,
soft golden-hour window light, minimalist clean background, white seamless
backdrop, Western fine-dining plating, perfectly symmetrical composition,
overly polished glossy "stock photo" look, magazine-spread lighting,
cartoon, illustration, 3D render, CGI, plastic-looking food,
text overlay, watermark, logo, brand name, visible price-tag text,
hands, arms, faces, blurry or out-of-focus main dish,
distorted plate shape, brand-new pristine tableware.
```

## I. 鴛鴦 ($22.00)

```
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

DISH: Surface / Angle: red-and-cream speckled terrazzo/laminate counter; elevated
~45-degree angle.
A plain white ceramic cup of yuenyeung (鴛鴦, Hong Kong coffee-milk-tea blend),
same well-used diner cup-and-saucer style as the hot milk tea, but the liquid
looks slightly darker and more matte than pure milk tea (a coffee undertone
visible at the surface), steam rising under the flat fluorescent light, a
tarnished small metal teaspoon resting on the chipped saucer beside the cup.

NEGATIVE PROMPT: professional studio food photography, DSLR bokeh, shallow depth of field,
soft golden-hour window light, minimalist clean background, white seamless
backdrop, Western fine-dining plating, perfectly symmetrical composition,
overly polished glossy "stock photo" look, magazine-spread lighting,
cartoon, illustration, 3D render, CGI, plastic-looking food,
text overlay, watermark, logo, brand name, visible price-tag text,
hands, arms, faces, blurry or out-of-focus main dish,
distorted plate shape, brand-new pristine tableware.
```

## J. 餐蛋治 ($28.00)

```
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

DISH: Surface / Angle: worn honey-brown Formica tabletop; near-top-down ~70-degree
angle.
A classic Hong Kong luncheon meat and fried egg sandwich (餐蛋治), white
sandwich bread lightly toasted, crusts trimmed off, cut diagonally in half and
stacked a little unevenly to show the cross-section: a thick slice of pan-fried
luncheon meat (SPAM-style, browned crispy edges) and a fried egg with a
slightly runny yolk peeking out, a thin smear of butter visible at the bread
edge. Served on a plain worn plate with a couple of thin cucumber slices pushed
to the side, catching a slightly harsh highlight from the overhead light.

NEGATIVE PROMPT: professional studio food photography, DSLR bokeh, shallow depth of field,
soft golden-hour window light, minimalist clean background, white seamless
backdrop, Western fine-dining plating, perfectly symmetrical composition,
overly polished glossy "stock photo" look, magazine-spread lighting,
cartoon, illustration, 3D render, CGI, plastic-looking food,
text overlay, watermark, logo, brand name, visible price-tag text,
hands, arms, faces, blurry or out-of-focus main dish,
distorted plate shape, brand-new pristine tableware.
```

## K. 西多士 ($26.00)

```
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

DISH: Surface / Angle: scratched brushed stainless-steel table; elevated ~45-degree
angle.
Hong Kong-style French toast (西多士), two thick slices of white bread
sandwiched with peanut butter filling, deep-fried golden-brown and crispy on
the outside, cut diagonally into triangles and stacked a little unevenly to
show the fluffy pale interior. A generous, slightly melting pat of butter sits
on top, golden syrup or condensed milk drizzled over it and pooling messily on
the plate rather than in a neat line — the pool has already started spreading
toward the plate's chipped rim.

NEGATIVE PROMPT: professional studio food photography, DSLR bokeh, shallow depth of field,
soft golden-hour window light, minimalist clean background, white seamless
backdrop, Western fine-dining plating, perfectly symmetrical composition,
overly polished glossy "stock photo" look, magazine-spread lighting,
cartoon, illustration, 3D render, CGI, plastic-looking food,
text overlay, watermark, logo, brand name, visible price-tag text,
hands, arms, faces, blurry or out-of-focus main dish,
distorted plate shape, brand-new pristine tableware.
```

## L. 蛋撻 ($10.00)

```
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

DISH: Surface / Angle: red-and-cream speckled terrazzo/laminate counter; near-top-down
~75-degree angle.
Three freshly-baked Hong Kong egg tarts (蛋撻) on a plain well-used plate,
golden flaky crumbly pastry shell (visible layered lamination texture at the
edges), smooth glossy pale-yellow egg custard filling with a slight
caramelized sheen, still slightly warm-looking. Arranged in a loose,
not-quite-symmetrical cluster, one tart tilted to show the flaky side wall,
a few pastry crumbs scattered naturally around them on the plate.

NEGATIVE PROMPT: professional studio food photography, DSLR bokeh, shallow depth of field,
soft golden-hour window light, minimalist clean background, white seamless
backdrop, Western fine-dining plating, perfectly symmetrical composition,
overly polished glossy "stock photo" look, magazine-spread lighting,
cartoon, illustration, 3D render, CGI, plastic-looking food,
text overlay, watermark, logo, brand name, visible price-tag text,
hands, arms, faces, blurry or out-of-focus main dish,
distorted plate shape, brand-new pristine tableware.
```

## M. 菠蘿油 ($16.00)

```
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

DISH: Surface / Angle: worn honey-brown Formica tabletop; elevated ~45-degree angle.
A pineapple bun (菠蘿包) sliced open with a thick slab of cold butter inserted
in the middle, the butter slightly melting unevenly from the bread's warmth on
one side. The bun top shows the signature golden-brown crackled "pineapple
skin" crust texture (cookie-like crust with a grid crack pattern), soft white
bread interior visible at the sides. Set a little off-center on a plain worn
plate, a few crumbs scattered naturally around it, catching a hard fluorescent
highlight on the crust.

NEGATIVE PROMPT: professional studio food photography, DSLR bokeh, shallow depth of field,
soft golden-hour window light, minimalist clean background, white seamless
backdrop, Western fine-dining plating, perfectly symmetrical composition,
overly polished glossy "stock photo" look, magazine-spread lighting,
cartoon, illustration, 3D render, CGI, plastic-looking food,
text overlay, watermark, logo, brand name, visible price-tag text,
hands, arms, faces, blurry or out-of-focus main dish,
distorted plate shape, brand-new pristine tableware.
```

## N. 楊枝甘露 ($32.00)

```
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

DISH: Surface / Angle: scratched brushed stainless-steel table; elevated ~45-degree
angle.
A plain glass dessert bowl (not a dinner plate) of mango pomelo sago (楊枝甘
露), thick creamy pale-orange mango puree base, visible chunks of fresh diced
mango, translucent white sago pearls, and pomelo (grapefruit) sacs scattered
unevenly on top. Chilled, with a slightly fogged/condensation-dulled glass
exterior from the cold contents, served with a small worn spoon resting
sideways in the bowl rather than perfectly placed.

NEGATIVE PROMPT: professional studio food photography, DSLR bokeh, shallow depth of field,
soft golden-hour window light, minimalist clean background, white seamless
backdrop, Western fine-dining plating, perfectly symmetrical composition,
overly polished glossy "stock photo" look, magazine-spread lighting,
cartoon, illustration, 3D render, CGI, plastic-looking food,
text overlay, watermark, logo, brand name, visible price-tag text,
hands, arms, faces, blurry or out-of-focus main dish,
distorted plate shape, brand-new pristine tableware.
```

## O. 雲吞麵 ($38.00)

```
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

DISH: Surface / Angle: red-and-cream speckled terrazzo/laminate counter; near-top-down
~70-degree angle.
A bowl of Hong Kong wonton noodle soup (雲吞麵), thin springy egg noodles
(蛋麵) coiled somewhat loosely in a clear pork-and-dried-flounder broth, 4-5
plump shrimp wontons with visible pink shrimp through the thin wonton skin, a
few strands of yellow chives scattered on top, served in a plain worn white
bowl (not a plate), broth clear and steaming under the flat overhead light,
a spoon resting against the bowl's rim rather than laid neatly beside it.

NEGATIVE PROMPT: professional studio food photography, DSLR bokeh, shallow depth of field,
soft golden-hour window light, minimalist clean background, white seamless
backdrop, Western fine-dining plating, perfectly symmetrical composition,
overly polished glossy "stock photo" look, magazine-spread lighting,
cartoon, illustration, 3D render, CGI, plastic-looking food,
text overlay, watermark, logo, brand name, visible price-tag text,
hands, arms, faces, blurry or out-of-focus main dish,
distorted plate shape, brand-new pristine tableware.
```

## P. 牛腩麵 ($48.00)

```
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

DISH: Surface / Angle: worn honey-brown Formica tabletop; elevated ~45-degree angle.
A bowl of Hong Kong beef brisket noodle soup (牛腩麵), thick uneven chunks of
tender stewed beef brisket (some lean, some with soft connective tissue) piled
on top of flat ho fun noodles in a rich dark brown five-spice braising broth
that has slightly stained the inside rim of the bowl, a few sprigs of scallion
and cilantro scattered on top, steam rising under the harsh fluorescent light,
a faint oily sheen pooling at the broth's surface showing slow-braised
richness rather than a styled glisten.

NEGATIVE PROMPT: professional studio food photography, DSLR bokeh, shallow depth of field,
soft golden-hour window light, minimalist clean background, white seamless
backdrop, Western fine-dining plating, perfectly symmetrical composition,
overly polished glossy "stock photo" look, magazine-spread lighting,
cartoon, illustration, 3D render, CGI, plastic-looking food,
text overlay, watermark, logo, brand name, visible price-tag text,
hands, arms, faces, blurry or out-of-focus main dish,
distorted plate shape, brand-new pristine tableware.
```

---

## Bonus(冇對應實際 menu item,想用先用)

## 常餐(bonus,冇對應 menu item)

```
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

DISH: Surface / Angle: scratched brushed stainless-steel table, wider tray framing;
elevated ~40-degree angle to fit multiple items.
A full "set meal" (常餐) tray shot: a ham-and-fried-egg sandwich (火腿煎蛋治)
cut diagonally in half showing the fried egg yolk and ham layer, a slice of
Hong Kong-style toast with condensed milk or kaya on a side plate, and a cup of
hot milk tea steaming beside it. Items arranged as if a busy waiter just set
the tray down — not perfectly symmetrical, plates slightly overlapping, one
plate a little closer to the frame edge than the others.

NEGATIVE PROMPT: professional studio food photography, DSLR bokeh, shallow depth of field,
soft golden-hour window light, minimalist clean background, white seamless
backdrop, Western fine-dining plating, perfectly symmetrical composition,
overly polished glossy "stock photo" look, magazine-spread lighting,
cartoon, illustration, 3D render, CGI, plastic-looking food,
text overlay, watermark, logo, brand name, visible price-tag text,
hands, arms, faces, blurry or out-of-focus main dish,
distorted plate shape, brand-new pristine tableware.
```

## 絲襪奶茶(沖茶動作圖,bonus,冇對應 menu item)

```
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

DISH: Surface / Angle: dynamic side angle at counter height (not overhead) — a sliver
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

NEGATIVE PROMPT: professional studio food photography, DSLR bokeh, shallow depth of field,
soft golden-hour window light, minimalist clean background, white seamless
backdrop, Western fine-dining plating, perfectly symmetrical composition,
overly polished glossy "stock photo" look, magazine-spread lighting,
cartoon, illustration, 3D render, CGI, plastic-looking food,
text overlay, watermark, logo, brand name, visible price-tag text,
hands, arms, faces, blurry or out-of-focus main dish,
distorted plate shape, brand-new pristine tableware.
```

