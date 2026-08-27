# 茶記落單 App（Cha Chaan Teng Ordering Platform）——V1 企劃書

## 目錄

- [執行摘要](#執行摘要)
- [編輯註記：章節整合與落差修正](#編輯註記章節整合與落差修正)
- [一、商業計劃](#一商業計劃)
  1. [產品定位同價值主張](#1-產品定位同價值主張)
  2. [目標市場](#2-目標市場)
  3. [商業模式選項比較](#3-商業模式選項比較)
  4. [成本估算](#4-成本估算單一茶記規模月均估算)
  5. [Go-to-Market 策略](#5-go-to-market-策略)
  6. [Roadmap 分期](#6-roadmap-分期)
  7. [風險同緩解](#7-風險同緩解)
  8. [香港特色考慮](#8-香港特色考慮--產品設計要入哂形)
- [二、技術架構](#二技術架構)
  0. [前提聲明：靈魂唔可以搞丟](#0-前提聲明靈魂唔可以搞丟)
  1. [高層架構圖](#1-高層架構圖)
  2. [ORM 揀 Drizzle](#2-orm-揀-drizzle唔用-prisma--理由)
  3. [資料庫 Schema](#3-資料庫-schema)
  4. [API Routes 設計](#4-api-routes-設計server-actions-為主route-handlers-為輔)
  5. [Auth 設計](#5-auth-設計)
  6. [Mock 結賬流程設計](#6-mock-結賬流程設計)
  7. [Scalability Path](#7-scalability-pathv1-單茶記--v2-多茶記-saas)
  8. [部署設定](#8-部署設定)
  9. [V0 → V1 檔案結構遷移](#9-v0--v1-檔案結構遷移)
- [三、UI/美術方向](#三ui美術方向)
  0. [一句講晒個方向](#0-一句講晒個方向)
  1. [視覺參考同觀察](#1-視覺參考同觀察)
  2. [Design Tokens](#2-design-tokens)
  3. [UI 組件風格方向](#3-ui-組件風格方向)
  4. [Voice & Tone 文案語氣指南](#4-voice--tone-文案語氣指南)
  5. [Layout 建議](#5-layout-建議)
- [四、AI 圖片生成 Prompt 套件](#四ai-圖片生成-prompt-套件)
  0. [Style Anchor](#0-style-anchor每張相都要用)
  1. [現有 5 個餐 Prompt](#1-現有-5-個餐生圖-prompt)
  2. [擴充經典港式冰室/茶記 Item](#2-擴充經典港式冰室茶記-item建議加落-menu-令個-app-睇落更豐富)
  3. [圖片規格建議](#3-圖片規格建議)
  4. [生成流程簡述](#4-nextjs--vercel-ai-gateway--vercel-blob-生成流程簡述)
- [五、V1 開發 Checklist](#五v1-開發-checklist)

---

## 執行摘要

呢個項目由一個五分鐘就睇完嘅 Flask 練習 app 出發：一個 in-memory dict 存住 5 個餐、一張 HTML form 落單、冇 DB、冇登入、冇多用戶。V0 嘅價值淨係喺於「證明個落單邏輯行得通」——套餐加$10、凍飲加$6、熱飲加$3 呢啲計價規則寫死喺 code 度，部署喺 Vercel 用嘅係最原始嘅 `@vercel/python` + `vercel.json`。而家呢份企劃書要做嘅,係將呢個原型徹底重寫做 V1：一套用 Next.js App Router 全端起、Supabase Postgres 做資料層、shadcn 做 UI、支援客人 guest 落單同職員/老闆登入後台嘅**可商業化、可以擺出去見真老闆真客人**嘅系統，而且由第一日就喺 schema 度留低 `restaurant_id`，為之後嘅多租戶 SaaS 鋪路。

呢次重寫嘅核心唔淨係「換技術棧」,更加係將原本得個雛型嘅產品,補齊一間真.茶記實際落地要有嘅嘢：走青飛沙走奶呢類客製化要做成結構化 modifier 而唔係得返 free text、最低消費同加一服務費要做成可設定嘅開關、訂單要有完整狀態機同歷史紀錄、老闆要有睇單改單同睇銷售嘅後台、餐牌相要用 AI 一致風格生成唔使自己影相。呢啲都係「一間茶記真係用得落」同「得個demo」之間嘅分水嶺。

但整份企劃書最想強調嘅一點係：**呢個 app 嘅靈魂唔係功能齊唔齊全,係佢有冇個性**。市面上嘅 POS/落單 SaaS 好多都做到齊功能但冷冰冰,呢個項目刻意反其道而行——由按鈕文案「照單！」「嚟多樣！」,到錯誤提示「個伙記瞌咗眼,唔該等等再撳過」,到視覺上格仔紋、招牌紅、手寫感字體嘅運用,全部都係為咗留住 README 講嗰種「唔死板、有火氣」嘅茶記伙記口吻。技術升級、DB化、多用戶化係手段,唔係目的——目的係整一個「香港人一睇就知係自己友整、唔係外國佬抄嚟賣」嘅落單 app,呢個先係呢份企劃書最終想交付嘅產品差異化賣點。

---

## 編輯註記：章節整合與落差修正

整合四份原始章節時發現以下幾處落差同重複,已經喺下面內文直接修正,喺呢度列出决定同理據,方便 implementation workflow 知道邊個係「最終規格」:

1. **C 餐名稱拼寫不統一**：原「商業計劃」章節寫「陽州炒飯」,但「技術架構」嘅 seed 備註同「AI 圖片生成 Prompt」章節都寫「揚州炒飯」(正字)。→ **統一用「揚州炒飯」**,全文已修正。

2. **訂單狀態機顆粒度三份文件講法唔一致**：
   - 商業計劃 Roadmap 概念層面簡化講「已落單 → 已確認 → 已完成」3 態；
   - 技術架構定義咗完整嘅 6-state DB 狀態機（`pending / confirmed / preparing / ready / completed / cancelled`）；
   - UI 美術方向前台/後台顯示層淨係用 4 個廚房術語 label（新落單／落緊鑊／得咗／派咗）。
   → **統一決定**：DB 層以**技術架構嘅 6-state 狀態機為 source of truth**（商業計劃嘅 3 態講法純屬概念層面簡化描述,唔係實際規格）。UI 顯示層做以下 mapping：`pending`→「新落單」、`{confirmed, preparing}`→「落緊鑊」（呢兩個狀態喺 Kanban 視覺上合併做同一欄——職員撳「接單」由 `pending→confirmed`,再撳「開始整」由 `confirmed→preparing`,兩個掣、兩粒狀態,但 UI 統一顯示喺「落緊鑊」欄底,唔使開多一欄搞亂 4 段顯示邏輯）、`ready`→「得咗」、`completed`→「派咗」。`cancelled` 唔喺 4 段 stepper 度顯示,單獨用另一種視覺處理（例如卡片變灰/移除出主看板）。

3. **`restaurants` 表缺少商業計劃要求嘅「最低消費」同「加一服務費」設定欄位**：商業計劃 §8 明確要求呢兩樣要做成 restaurant-level 嘅**開關式設定**,但技術架構原本嘅 DDL 冇對應欄位。→ **已修正**：喺下面 §3.2 DDL 同 §3.3 Drizzle schema 嘅 `restaurants` 表加咗 `service_charge_enabled`、`service_charge_percent`、`min_spend_amount` 三個欄位（V1 做全店統一數值即可,time-slot-level 精細度留返 V2 先做,唔阻住 V1 上線）。落單流程同結賬計算要讀呢幾個欄位。

4. **AI 生圖 Route Handler 原本 code 用錯 function**：技術架構 §4.3 原本嘅 code snippet 用 `generateText`（呢個係文字生成用嘅 function,唔係生圖）,但 AI 圖片生成 Prompt 套件 §4 正確咁講明要用 `experimental_generateImage` / `generateImage`。→ **已修正**：下面 §4.3 code 已經改用正確嘅 AI SDK image generation API,implementation 時**唔可以照抄舊版 `generateText` 寫法**。

5. **AI 生圖模型 ID 唔應該鎖死**：技術架構原本寫死 `google/gemini-3.1-flash-image-preview`,AI 圖片生成 Prompt 套件就話「實際模型名以 implementation 嗰邊喺 Gateway dashboard 睇到嘅為準」。→ **統一決定**：唔鎖死單一 model id,implementation workflow 開工嗰陣去 Vercel AI Gateway dashboard 揀當其時可用嘅 image generation model,文件入面出現嘅具體 model id 一律當**參考例子**,唔係硬性規格。

6. **`menu_items` 補一個 `image_prompt` 欄位**：AI 圖片生成 Prompt 套件 §4 第5點提醒生圖用嘅完整 prompt 應該存低方便追溯,但原本 DDL 冇呢欄。→ **已修正**：下面 §3.2/§3.3 已加入 `image_prompt TEXT` 欄位。

除此之外,四份章節喺 V0→V1 嘅 5 個餐、加價規則（跟套餐+$10、凍飲+$6、熱飲+$3）、domain（`cctmenu.isaaccheng.xyz`）、GitHub repo、技術棧選擇（Next.js + Supabase + shadcn + AI Gateway）、guest 唔登入 / 職員登入嘅雙軌權限模型上完全一致,冇再發現矛盾。

---

## 一、商業計劃

*——由「阿伯睇餐牌都要老花鏡」到「一撳搞掂,老闆數得晒」*

### 1. 產品定位同價值主張

#### 一句講晒
**「畀茶記老闆一套佢請得起、伙記學得識、客人用得順嘅落單系統 —— 唔使成班伙記追住枱數走鬼咁走,老闆都睇得晒盤數。」**

#### 對老闆嘅價值
香港茶記嘅死穴從來唔係冇生意,係**人手**。舖租貴、人工貴、請人難、伙記流失率高,尖峰時段（早市、午市、下午茶、放工市）成間舖走晒鬼咁走。傳統紙牌手寫單有幾個實際問題:

- **記錯單、漏單** —— 伙記記性再好都好,九點鐘成間舖坐晒人,「呢枱係咪要走青㗎」呢啲嘢好易記錯,錯單即係嘥料、嘥時間、得罪客。
- **冇數據** —— 老闆想知邊個餐賣得最好、邊個時段最旺,得個靠估。紙仔單埋數完即掉,乜嘢生意智慧都留唔到低。
- **人手成本硬食** —— 一個企堂由朝做到黑淨係為咗行來行去問「要咩」、「埋唔埋單」,呢啲重複勞動本身可以由App分擔一部分,伙記可以專心出餐、清枱、招呼熟客。

App 唔係要炒晒啲伙記,係要畀老闆喺同一班人手下面,做多啲單、做少啲錯。

#### 對食客嘅價值
- **唔使等伙記嚟先先可以落單** —— 尤其一個人食晏,成日等到伙記得閒先可以叫嘢,好嘥時間。
- **走青、走冰、飛沙走奶呢啲客製化,寫得清清楚楚** —— 唔使大嗌都要伙記覆返一次先夠信。
- **睇得到餐牌相** —— 外地遊客、後生仔女未必識「淨牛」、「常餐」呢啲術語,一張圖勝過千言萬語。

#### 靈魂:唔可以做到冇個性
呢個唔係一個「企業級」訂餐系統,係一個**有伙記口吻嘅茶記App**。UI 文案、成功落單提示、錯誤訊息,都應該用返茶記伙記嗰種爽爽脆脆、市井、唔死板嘅語氣（例如落單完成可以係「搞掂!慢慢等,唔該借歪」,而唔係企業感嘅「Order Submitted Successfully」）。呢個「唔正經」嘅本土幽默感正正係呢個項目同市面上啲冷冰冰 SaaS POS 系統最大分別,一定要保留同放大,唔係裝飾,係核心差異化賣點。

### 2. 目標市場

#### V1 目標客群
**獨立經營、1 至 2 間分店嘅中小型茶記/冰室**,即係:

- 老闆自己或家族經營,唔屬於大快活、大家樂、翠華呢類已經有自己內部系統嘅連鎖集團
- 對數碼化有興趣,但**冇資本同IT人手**去搞複雜系統嘅舖頭
- 願意畀老闆或者伙記試用、俾意見嘅「熟人」舖頭（呢個正正配合第 5 點嘅 GTM 策略）

呢個市場喺香港數量龐大 —— 全港有數千間持牌食肆屬於呢個規模,但目前科技滲透率極低。

#### 現有替代方案同競爭分析

| 方案 | 主要問題 | 呢個App嘅優勢 |
|---|---|---|
| **紙牌手寫單** | 零軟件成本,但出錯率高、冇數據、人手密集 | 保留紙單做後備,但將落單數碼化、自動計數、留低銷售紀錄 |
| **foodpanda / Deliveroo 堂食QR落單** | 抽成動輒15-30%,茶記界對呢班平台已經有「食水深」嘅陰影(外賣年代畀佢哋剝完一層皮),品牌曝光畀平台騎劫,客人落單介面唔屬於自己間舖 | 唔抽成,品牌、UI、域名全部係茶記自己嘅,老闆話事 |
| **坊間 POS 系統**（如 iCHEF、Otter、傳統收銀機牌子） | 通常要買斷硬件、簽長約、月費貴（動輒$500-2000+/月加硬件租)、UI 唔係為香港茶記本土文化設計(冇「走青飛沙走奶」呢類客製化邏輯)、裝機要專人上門 | 純SaaS,零硬件負擔,響應式網頁,舊手機/舊 iPad 都用得,月費平好多、彈性高、可以隨時試用隨時走 |
| **完全唔做嘢,繼續用嗌** | 免費,但人手成本、出錯成本、翻座率損失都係隱藏成本 | 用低成本試點證明,ROI 好計 |

**核心優勢總結**:唔抽成、唔綁死約、唔使買硬件、貼地用語、可以逐步試(先得一間分店都得),呢個「輕、平、貼地」嘅定位正正填補咗「大POS系統太貴太重」同「純紙牌太原始」之間嘅市場空隙。

### 3. 商業模式選項比較

| 模式 | 優點 | 缺點 | 適合度 |
|---|---|---|---|
| **訂閱制(per 分店月費)** | 收入穩定可預測、老闆容易理解(同交租交水電一樣係固定開支)、唔會因為淡旺季波動而收入唔穩 | 初期要證明價值先肯畀錢 | ★★★★★ |
| **交易抽成(% per order)** | 高流量舖頭收入可觀、對細舖友善(冇生意就唔使畀錢) | 香港茶記對「抽成」呢兩個字有心理陰影(外賣平台後遺症),生意越好倒扣越多,老闆會有「幫你打工」嘅感覺,唔啱呢個市場文化 | ★★☆☆☆ |
| **一次性建站費** | 一筆過現金流、老闆感覺「買咗嘢返嚟」冇持續負擔感 | 冇持續收入,產品要不斷維護(DB、Vercel帳單、AI Gateway)但冇對應現金流,長遠唔可持續 | ★★☆☆☆(可作輔助) |
| **Freemium** | 零門檻試用,消除「新科技抗拒」呢個最大阻力,天然帶動口碑 | 免費用戶轉化率係最大風險,要設計清晰嘅付費牆 | ★★★★☆(作為入口) |

#### 推薦方向:**Freemium 入口 + Per-店月費訂閱為主軸**

- **免費層**:基本落單功能、限定菜式數量(例如10款以內)、標準模板風格,畀老闆「零成本試吓先」
- **付費層(月費,例如 HK$300–800/月/分店,視乎後續功能定價)**:無限菜式、AI生成餐牌相、銷售報表、自訂品牌色系/Logo(V2起)、優先客服支援
- **唔用交易抽成**——呢個係刻意選擇,因為要同foodpanda/Deliveroo呢類「食水深」平台做明顯區隔,建立「我哋唔係嚟賺你辛苦錢」嘅信任感,呢個信任感本身就係賣點。
- 可以喺 onboarding 階段象徵式收一次性「設置費」(例如幫手影相、上載菜單、簡單教學),但呢筆錢定位係**服務費**唔係產品費,主要收入仍然係月費訂閱。

### 4. 成本估算(單一茶記規模,月均估算)

**前提假設**:一間茶記,日均 150–300 張單,主要集中喺早午晚三個高峰時段,連同guest瀏覽菜單流量,月API/頁面請求量大約幾萬次級別。

> ⚠️ 以下純粹係基於現時對 Vercel 定價模式嘅理解做嘅**粗略估算**,唔係實際報價,實際數字要睇落單時 Vercel 官方最新方案同用量而定。

| 項目 | 服務 | 估算月費(USD) | 備註 |
|---|---|---|---|
| Hosting + Functions | Vercel **Pro** plan(商業用途必需,Hobby plan 條款唔容許商業營運) | ~$20/月(基本座位費) | 呢個規模嘅 function invocation / bandwidth 用量大機會喺 Pro plan 隨附額度之內,爆額外用量都係幾蚊到十幾蚊水平 |
| Database | Vercel Marketplace — **Supabase Postgres** | $0(免費層,細規模) 至 ~$19/月(如需升級到入門付費層) | 單一茶記嘅單量、菜單、用戶(職員)資料量細,免費/入門層應該夠用好耐 |
| AI 生圖 | **Vercel AI Gateway**(image generation,按用量計) | ~$1–5/月 | 唔係每張單都生圖,只係設置/更新菜單相先用到,一次過生20-30張相可能 $1-3,之後偶爾補一兩張,攤分落每個月成本好低 |
| **合計估算** | | **約 US$25–45/月(約 HK$195–350/月)** | 小規模單店起步價 |

**結論**:呢個成本結構意味住,即使月費訂閱定價喺 HK$300–500/月一間分店,毛利空間仍然相當健康,而且成本結構係**用量驅動**,規模擴大到多間分店/多租戶時邊際成本增幅有限,適合長遠SaaS化。建議喺實際上線前,用 Vercel Dashboard 嘅 Usage 頁做真實用量監察,避免高峰期(例如節日餐牌相集中生成)造成突發帳單。

### 5. Go-to-Market 策略

#### Phase 0 — 「自己友試單」(現在 – 3個月)
- 喺自己/朋友間茶記免費試用,老闆同伙記係第一批真實用戶,重點唔係賣嘢,係**摷UX問題**——例如尖峰時段網絡卡唔卡、伙記後台學唔學得識、走青飛沙走奶呢類客製化夠唔夠用
- 收集真實單量數據,驗證系統喺實際午市高峰下嘅穩定性
- 建立第一批「用家見證」(可以係老闆一句話咁短:「用咗都話快好多」)

#### Phase 1 — 「街坊口碑」(3–9個月)
- 靠現有試點舖嘅**生招牌效應**——第二、三間茶記見到隔籬舖用得順、老闆冇怨言,自然會問「你哋用緊咩」
- 透過飲食業人脈(相熟老闆互相介紹、茶記行家群組、地區商會)做轉介,唔洗落廣告費
- 提供「白手套」onboarding(幫手上載菜單、影/生成相、簡單教班)換取象徵式設置費 + 真實 case study

#### Phase 2 — 「準備規模化」(9–18個月)
- 累積3–5個成功案例後,開始整理成標準化 onboarding 流程(自助上載菜單、自助生成相、自助設定加一/最低消費)
- 呢個階段先開始構思正式嘅多租戶 self-serve signup(即係 V2 嘅範圍),減少人手介入,先可以真正規模化去賣畀更多茶記

**核心邏輯**:唔追求開頭就「賣畀好多間」,先用低成本試點跑出產品可信度,靠香港飲食業「熟人生意」文化去自然擴散,先再度投資做自助化規模化。

### 6. Roadmap 分期

#### **V1 —— 單一茶記 Prototype**(現階段)
- Next.js App Router + Supabase Postgres
- 客人 guest order(唔使登入),職員/老闆登入後台
- 後台:睇單、改菜單、睇基本銷售
- AI Gateway 生成一致風格嘅菜單相
- Mock 結賬流程（詳細 6-state 狀態機規格見〈二、技術架構 §6〉,呢度只做概念層面提及）,未接真銀行
- Schema 由第一日開始留 `restaurant_id` 欄位,為多租戶鋪路(雖然 V1 只得一間)

#### **V2 —— 多茶記 SaaS,白標/自訂品牌**
- 真正多租戶架構,`restaurant_id` 全面隔離
- 老闆自助上線:自訂 Logo、色系、域名/子域名(例如 `xxx.cctmenu.app`)
- Self-serve onboarding流程 + Billing整合(訂閱制收費自動化)
- 多間分店管理(如果同一老闆有幾間舖)

#### **V3 —— 真支付、會員、外賣整合、數據分析**
- 真實支付:八達通/FPS/信用卡(取代mock結賬)
- 會員/積分系統(儲印花電子化,茶記文化本身就有「儲夠十次送一個常餐」呢類慣例,值得數碼化保留)
- 外賣整合(自家外送 或者同foodpanda/Deliveroo 做API對接,但唔畀對方全面主導訂單流程)
- 老闆專屬 Data Analytics Dashboard:熱賣菜式排行、時段人流分析、翻座率、週期性趨勢(例如落雨天賣多咗熱嘢)

### 7. 風險同緩解

| 風險 | 描述 | 緩解方案 |
|---|---|---|
| **現金文化根深蒂固** | 香港茶記大量交易仍然係現金/八達通拍卡,老年客人唔慣手機落單 | V1 刻意用 mock checkout,唔強迫用戶用電子支付;App 定位係「落單」工具,埋單方式(現金/八達通/八達通機)完全唔受影響,保留伙記人手埋單選項並行運作 |
| **老闆/伙記對新科技嘅抗拒** | 茶記老闆年齡層偏高,對「要學新嘢」有天然抗拒;伙記流動率高,培訓成本高 | UI 要簡單到「唔識英文都識用」,全廣東話介面;提供落地式簡單教班(15分鐘教識);強調「唔使裝機、唔使買嘢」降低決策門檻 |
| **尖峰時段網絡/系統穩定性** | 午市/放工市人流爆棚,如果 WiFi 差或系統回應慢,反而拖慢出單,弄巧反拙 | 善用 Vercel Edge/CDN 天然嘅高可用性;前端做 optimistic UI + local caching,減少對即時網絡嘅依賴;保留紙牌落單做爆場後備 SOP,唔可以將所有雞蛋放晒一個籃 |
| **Guest order 冇登入,潛在走數/玩嘢風險** | 客人下單後可以唔嚟取餐,或者亂填枱號 | V1 唔連真銀行,金錢風險本身就低;可加枱號驗證(店員核對)、訂單有效時限(例如15分鐘未確認自動取消——實作見〈二、技術架構〉cron job) |
| **未來接真支付後嘅合規/私隱問題** | PCI DSS、支付牌照等監管要求 | V1/V2 唔觸碰,交由第三方持牌支付商(如 Stripe/本地支付網關)處理實際交易,平台唔直接經手客人卡資料 |

### 8. 香港特色考慮 —— 產品設計要「入哂形」

#### 茶記獨有落單術語 → 要做成結構化 modifier,唔係得返 free text
呢類術語（走青、走冰、走糖/少甜、飛沙走奶、走蔥、走香菜、加辣、細杯/大杯、常餐/快餐）應該喺 **item schema** 度做成明確嘅 modifier/option 集合,而唔係淨係一個備註輸入框:

- 每個菜式可以掛一組可勾選嘅 modifiers(例如凍飲類自動有「走冰」、「走糖」選項;炒河粉類自動有「走青」選項)
- 呢啲 modifier 應該係**可重用嘅全店級別設定**,老闆喺後台一次過設好,新增菜式時直接掛落去,唔使逐樣打字
- 呈現畀客人嗰陣,文案要用返地道講法(「走青」而唔係「不要蔥」),呢個係產品「有性格」嘅具體落地位

> 對應 schema：以上機制由〈二、技術架構〉§3 嘅 `item_options` 表實現（`group_name` enum：走料/加料/套餐飲品/其他）。

#### 餐飲業慣例 → 要喺 schema/設定層面反映
- **最低消費**:茶記喺某啲時段(例如午市)可能有 minimum spend 要求 —— 應該係 **restaurant-level 或 time-slot-level 設定**,落單流程要喺結賬前提示客人「未夠最低消費」（V1 做 restaurant-level 統一數值,見編輯註記第3點）
- **加一服務費**:唔係所有茶記都收,收唔收、幾多%要做成**開關式設定**(toggle + 百分比),埋單金額自動計落去,清楚列明畀客人睇(呢個係香港食肆常見爭議位,清晰列明可以減少糾紛)
- **套餐加價邏輯**(例如原有嘅「跟套餐加$10」、「凍飲加$6/熱飲加$3」)要保留為可設定嘅**加價規則(pricing rule)**,而唔係寫死喺code,方便老闆自己微調價錢(對應 `item_options.price_delta`)

#### 樓面文化 → 反映去落單UX流程
- 落單完成之後,可以有「嗌伙記」呢類明確 CTA(例如通知後台/枱號提示),模擬返「攞單走過去」嗰種即時感,唔好做到好似純網購咁冷冰冰
- 埋單環節保留「劃單」概念——即係一張枱可以持續加叫,唔係一次性落單就完結,呢個完全符合茶記「坐低慢慢加嘢」嘅實際用餐習慣

#### 總結一句
呢份計劃嘅核心邏輯係:**用平、輕、貼地嘅SaaS方案,填補「大POS太貴太重」同「紙牌太原始冇數據」之間嘅市場空隙**,靠熟人試點同口碑做規模化,收入模式揀訂閱制而唔係抽成以建立信任,同時將香港茶記獨有嘅落單文化(走青飛沙走奶、最低消費、加一)做成產品核心設計語言而唔係後加功能——呢個先係呢個App「唔死板」嘅靈魂所在。

---

## 二、技術架構

> 呢份係俾第二個 implementation workflow 直接攞去起 code 嘅架構規格。所有決定已經同項目擁有人 confirm 咗,唔使再問「用邊個技術」呢類問題,直接照起。

### 0. 前提聲明:靈魂唔可以搞丟

呢個 app 個賣點唔係「又一個落單系統」,係「有性格、講嘢串、似真係澳牛伙記」嗰種本土幽默感。所以喺架構層面要預埋一個位專門擺呢啲文案/語氣,唔好散落晒喺 component 度變成無法維護:

```
lib/copy/tone.ts        # 所有市井/抵死文案(下單成功、落單失敗、催單、埋單)集中管理
lib/ai/menu-image-prompt.ts  # AI 生圖 prompt template,鎖死「茶餐廳風格」畫風
```

呢兩個檔案下面章節會再提到。Implementation workflow 起呢兩個檔案嘅時候,文案要延續 README 講嗰種「唔死板、有火氣」嘅茶記伙記口吻,唔好變成企業 SaaS 口吻(例如唔好用「訂單已成功建立」呢種嘢,要用返似「搞掂!張單入咗去廚房,慢慢等」呢種)。

### 1. 高層架構圖

```
┌─────────────────────────────────────────────────────────────────────┐
│                         客人(唔使登入)                              │
│         手機瀏覽器 → cctmenu.isaaccheng.xyz/order                     │
└───────────────────────────────┬───────────────────────────────────────┘
                                 │ HTTPS
┌────────────────────────────────▼───────────────────────────────────────┐
│                    Vercel Edge Network + Domain                         │
│              cctmenu.isaaccheng.xyz (自訂 domain,原封不動)              │
└────────────────────────────────┬───────────────────────────────────────┘
                                 │
┌────────────────────────────────▼───────────────────────────────────────┐
│                Next.js App Router(Vercel Functions／Fluid Compute)     │
│                                                                          │
│  app/(customer)/          顧客落單前台 — RSC 讀 menu、Server Actions 落單 │
│  app/admin/                職員／老闆後台 — 受 middleware 保護            │
│  app/api/                  Route Handlers — webhook 性質 / polling / AI  │
│  middleware.ts             staff session 檢查,guard /admin/**           │
│  lib/db/                   Drizzle ORM client + schema                  │
│  lib/actions/               Server Actions(落單、改單狀態、改menu)      │
│  lib/ai/                    AI Gateway 生圖 client + prompt template     │
└───────┬───────────────────────┬──────────────────────┬─────────────────┘
        │                       │                      │
        ▼                       ▼                      ▼
┌───────────────┐   ┌───────────────────────┐  ┌─────────────────────────┐
│ Supabase Postgres  │   │  Vercel AI Gateway     │  │   Vercel Blob            │
│ (Vercel        │   │  (OIDC auth,唔使自己  │  │  (存生成好嘅餐牌相       │
│  Marketplace)  │   │   攞 provider key)     │  │   public access)         │
│ Drizzle ORM    │   │  image generation      │  │  menu-items/{id}.webp    │
│ 存全部業務資料  │   │  model(見編輯註記第5點) │  │  → image_url 存返落 DB   │
└───────────────┘   └───────────────────────┘  └─────────────────────────┘
```

**資料流向重點**:
- 生圖係**單向 pipeline**:老闆後台按「生成相片」→ Route Handler 叫 AI Gateway → 拎到 image bytes → 上傳去 Vercel Blob → 攞返 public URL → update `menu_items.image_url`。生成完之後前台睇到嘅永遠係 Blob URL,唔會即時再叫 AI(慳成本、慳 latency)。
- 前台落單全程唔叫外部 API,淨係讀寫 Supabase。

### 2. ORM 揀 Drizzle(唔用 Prisma) —— 理由

| 考慮點 | Drizzle | Prisma |
|---|---|---|
| Serverless cold start | 冇 query engine binary,起機快 | 有 Rust engine binary,cold start 較重(除非用 Accelerate) |
| 同 Postgres driver 配合 | `drizzle-orm/postgres-js` 配 Supabase 標準 TCP connection(pooled 用 pgbouncer transaction mode),官方一級支援 | 需要額外 Accelerate/connection pooling 先夠靚 |
| Schema 表達方式 | TypeScript 寫 schema,靠近原生 SQL,migration 用 `drizzle-kit` 產生純 SQL 檔(方便 code review) | Schema DSL 自成一套,migration 係自家格式 |
| Multi-tenant(V2 擴展) | 手寫 query 好易加 `.where(eq(table.restaurantId, ctx.restaurantId))`,冇隱藏 magic | 一樣做到,但 middleware/extension 寫法無 Drizzle直白 |
| Bundle size / 依賴 | 細 | 相對重 |

**結論:Drizzle + `postgres`(postgres-js)+ `drizzle-orm/postgres-js`**,用 `drizzle-kit` 出 migration SQL。呢個 driver 用標準 session-based TCP 連接,支援真正嘅多語句 `db.transaction()`(唔似 Neon 個 `neon-http` HTTP-only driver 咁對 transaction 支援有保留 —— 呢個項目早期評估過 Neon,後尾因為開發者本身熟 Supabase 生態,加上 postgres-js 嘅 transaction 支援更直接,而改用 Supabase)。

### 3. 資料庫 Schema

#### 3.1 ER 關係總覽

```
restaurants 1─┬─* menu_categories 1─* menu_items 1─* item_options
              │                                      │
              ├─* staff_users                         │
              │                                      │
              └─* orders 1─* order_items ─* order_item_options ─┘
                     │
                     └─* order_status_history
```

#### 3.2 SQL DDL(Postgres / Supabase)

```sql
-- ========== 0. Enums ==========
CREATE TYPE staff_role AS ENUM ('admin', 'staff');
CREATE TYPE order_status AS ENUM (
  'pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'
);
CREATE TYPE payment_status AS ENUM ('unpaid', 'mock_paid');
CREATE TYPE payment_method AS ENUM ('cash', 'octopus_mock', 'fps_mock');
CREATE TYPE option_group AS ENUM ('走料', '加料', '套餐飲品', '其他');

-- ========== 1. restaurants(V1 得一行,但一定要有) ==========
-- 註:service_charge_* / min_spend_amount 三個欄位為整合企劃書時新增,
--    對應商業計劃 §8「加一服務費」「最低消費」要做成 restaurant-level 開關設定嘅要求。
CREATE TABLE restaurants (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug                   TEXT NOT NULL UNIQUE,          -- e.g. 'cctmenu'
  name                   TEXT NOT NULL,                 -- 「XX冰室」
  domain                 TEXT UNIQUE,                   -- 'cctmenu.isaaccheng.xyz',V2 多租戶靠呢欄做 domain 對應
  phone                  TEXT,
  address                TEXT,
  timezone               TEXT NOT NULL DEFAULT 'Asia/Hong_Kong',
  currency               TEXT NOT NULL DEFAULT 'HKD',
  service_charge_enabled BOOLEAN NOT NULL DEFAULT FALSE, -- 加一服務費開關
  service_charge_percent NUMERIC(4,2) NOT NULL DEFAULT 0, -- 例如 10.00 = 加一
  min_spend_amount       NUMERIC(10,2),                  -- 最低消費金額,NULL = 冇設定
  is_active              BOOLEAN NOT NULL DEFAULT TRUE,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ========== 2. staff_users ==========
CREATE TABLE staff_users (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id  UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  email          TEXT NOT NULL,
  password_hash  TEXT NOT NULL,               -- bcrypt
  display_name   TEXT NOT NULL,
  role           staff_role NOT NULL DEFAULT 'staff',
  is_active      BOOLEAN NOT NULL DEFAULT TRUE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (restaurant_id, email)
);

-- ========== 3. menu_categories ==========
CREATE TABLE menu_categories (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id  UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  name           TEXT NOT NULL,               -- '常餐', '粉麵', '飲品'
  sort_order     INTEGER NOT NULL DEFAULT 0,
  is_active      BOOLEAN NOT NULL DEFAULT TRUE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ========== 4. menu_items ==========
-- 註:image_prompt 為整合企劃書時新增,對應 AI 生圖章節 §4 第5點「存返生呢張相用嘅
--    完整 prompt,方便日後追溯」嘅要求。
CREATE TABLE menu_items (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id  UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  category_id    UUID NOT NULL REFERENCES menu_categories(id) ON DELETE CASCADE,
  code           TEXT,                        -- 'A', 'B', 'C'... 保留V0 嘅餐牌代號
  name           TEXT NOT NULL,               -- '干炒牛河'
  description    TEXT,                        -- 老闆/AI 寫嘅賣點文案
  price          NUMERIC(10,2) NOT NULL,
  image_url      TEXT,                        -- Vercel Blob public URL
  image_prompt   TEXT,                        -- 生成呢張相用嘅完整 prompt(方便日後 re-generate)
  is_available   BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order     INTEGER NOT NULL DEFAULT 0,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_menu_items_restaurant ON menu_items(restaurant_id);

-- ========== 5. item_options(走青/走冰/加大套餐呢類 add-on) ==========
CREATE TABLE item_options (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id  UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  menu_item_id   UUID NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
  group_name     option_group NOT NULL DEFAULT '其他',
  name           TEXT NOT NULL,               -- '走青', '凍飲', '跟套餐(+$10)'
  price_delta    NUMERIC(10,2) NOT NULL DEFAULT 0,  -- 可正可負(走青一般 $0,跟套餐 +$10)
  is_default     BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order     INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX idx_item_options_item ON item_options(menu_item_id);

-- ========== 6. orders ==========
CREATE TABLE orders (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id    UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  order_number     SERIAL,                    -- 每日流水號顯示畀客/廚房睇(配合 created_at 日期用)
  table_number     TEXT,                      -- 客人自己填,V1 唔強制對枱
  guest_token      TEXT NOT NULL,             -- 隨機 opaque token,存喺瀏覽器 cookie,用嚟查自己張單
  status           order_status NOT NULL DEFAULT 'pending',
  payment_status   payment_status NOT NULL DEFAULT 'unpaid',
  payment_method   payment_method,
  subtotal         NUMERIC(10,2) NOT NULL,
  total            NUMERIC(10,2) NOT NULL,     -- = subtotal + 服務費(如啟用) ,並用於最低消費檢查
  notes            TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_orders_restaurant_status ON orders(restaurant_id, status);
CREATE INDEX idx_orders_guest_token ON orders(guest_token);

-- ========== 7. order_items ==========
CREATE TABLE order_items (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id            UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id        UUID NOT NULL REFERENCES menu_items(id),
  item_name_snapshot  TEXT NOT NULL,          -- 落單一刻嘅名(menu 之後改咗名都唔影響歷史單)
  unit_price_snapshot NUMERIC(10,2) NOT NULL,
  quantity            INTEGER NOT NULL DEFAULT 1,
  line_total          NUMERIC(10,2) NOT NULL,
  notes               TEXT
);
CREATE INDEX idx_order_items_order ON order_items(order_id);

-- ========== 8. order_item_options(每個 order_item 揀咗邊啲 add-on) ==========
CREATE TABLE order_item_options (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_item_id         UUID NOT NULL REFERENCES order_items(id) ON DELETE CASCADE,
  item_option_id        UUID NOT NULL REFERENCES item_options(id),
  name_snapshot         TEXT NOT NULL,
  price_delta_snapshot  NUMERIC(10,2) NOT NULL
);

-- ========== 9. order_status_history ==========
CREATE TABLE order_status_history (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id      UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  from_status   order_status,
  to_status     order_status NOT NULL,
  changed_by    UUID REFERENCES staff_users(id),  -- NULL = 客人自己觸發(落單嗰刻)/系統自動觸發(cron)
  note          TEXT,
  changed_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_order_status_history_order ON order_status_history(order_id);
```

#### 3.3 Drizzle schema 對應(`lib/db/schema.ts` 節錄)

```ts
import { pgTable, uuid, text, numeric, boolean, integer,
         timestamp, pgEnum, serial } from 'drizzle-orm/pg-core'

export const staffRoleEnum = pgEnum('staff_role', ['admin', 'staff'])
export const orderStatusEnum = pgEnum('order_status',
  ['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'])
export const paymentStatusEnum = pgEnum('payment_status', ['unpaid', 'mock_paid'])

export const restaurants = pgTable('restaurants', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  domain: text('domain').unique(),
  timezone: text('timezone').notNull().default('Asia/Hong_Kong'),
  currency: text('currency').notNull().default('HKD'),
  serviceChargeEnabled: boolean('service_charge_enabled').notNull().default(false),
  serviceChargePercent: numeric('service_charge_percent', { precision: 4, scale: 2 }).notNull().default('0'),
  minSpendAmount: numeric('min_spend_amount', { precision: 10, scale: 2 }),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const menuItems = pgTable('menu_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  restaurantId: uuid('restaurant_id').notNull().references(() => restaurants.id, { onDelete: 'cascade' }),
  categoryId: uuid('category_id').notNull().references(() => menuCategories.id, { onDelete: 'cascade' }),
  code: text('code'),
  name: text('name').notNull(),
  description: text('description'),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  imageUrl: text('image_url'),
  imagePrompt: text('image_prompt'),
  isAvailable: boolean('is_available').notNull().default(true),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})
// ... orders / order_items / order_item_options / order_status_history / staff_users 同樣 pattern
```

`lib/db/index.ts` 用**懶初始化**(build time 未必有 `DATABASE_URL`):

```ts
import postgres from 'postgres'
import { drizzle } from 'drizzle-orm/postgres-js'
import * as schema from './schema'

let _db: ReturnType<typeof drizzle> | null = null
export function getDb() {
  if (!_db) {
    const client = postgres(process.env.DATABASE_URL!, { prepare: false })
    _db = drizzle(client, { schema })
  }
  return _db
}
```

> `{ prepare: false }`:如果 `DATABASE_URL` 用 Supabase 嘅 pooled connection
> string(pgbouncer transaction mode,port 6543),呢個 pool 唔支援 prepared
> statement,關咗先安全。用直連 session mode(port 5432)就冇呢個問題。

> 注意:唔好用 `Proxy` 包 db client 做 lazy init,會同某啲 library 嘅內部 introspection 衝突。呢個 plain function pattern 已經夠用。

### 4. API Routes 設計(Server Actions 為主,Route Handlers 為輔)

**原則**:凡係「表單提交/頁面內互動」→ Server Actions;凡係「需要獨立 fetch、polling、第三方/長時間任務、或者將來要俾外部 client(App、第三方 kitchen display)call」→ Route Handlers。

#### 4.1 客人落單流程

| 步驟 | 實作方式 | 檔案 |
|---|---|---|
| 睇餐牌 | Server Component 直接 query DB(RSC 內直接 `getDb()`,唔使 API) | `app/(customer)/order/page.tsx` |
| 加入購物車 | Client-side state(`zustand`),純前端,唔叫後端 | `components/cart/cart-store.ts` |
| 提交落單 | **Server Action** `createOrder(cartPayload)` — 伺服器重新用 DB 價錢計算,唔信任前端傳嚟嘅價(防炒價),同時檢查 restaurant 嘅 `min_spend_amount` / `service_charge_*` 設定 | `lib/actions/order.ts` |
| 落單確認頁 | Server Component 讀返個新 order(用 `guest_token` cookie 驗證屬於自己) | `app/(customer)/order/[orderId]/page.tsx` |
| 睇緊單嘅狀態(輕量輪詢) | **Route Handler** `GET /api/orders/[id]/status`,client 用 `useEffect` 每 4~5 秒 poll,回傳 `{status, updatedAt}` | `app/api/orders/[id]/status/route.ts` |

`createOrder` Server Action 重點:
```ts
'use server'
export async function createOrder(input: CreateOrderInput) {
  const db = getDb()
  // 1. 讀返 restaurant_id(V1 靠 helper,V2 靠 domain 解析)
  const restaurantId = await getCurrentRestaurantId()
  // 2. 逐項用 DB 現價重新計算,唔用前端傳嚟嘅 price
  // 3. 讀 restaurant 嘅 min_spend_amount / service_charge_enabled+percent,
  //    計 subtotal → total,如未達最低消費要喺呢層 throw 錯誤(前端接住轉做提示文案)
  // 4. 產生 guest_token(crypto.randomUUID()),寫落 httpOnly cookie
  // 5. transaction: insert orders + order_items + order_item_options
  // 6. insert order_status_history (from=null, to='pending', changed_by=null)
  // 7. revalidatePath('/admin/orders')
  return { orderId, orderNumber }
}
```

#### 4.2 職員後台睇單/改單狀態

| 步驟 | 實作方式 | 檔案 |
|---|---|---|
| 職員登入 | Auth.js credentials(見第5節) | `app/(auth)/login/page.tsx` |
| 睇即時單(廚房顯示屏) | Server Component 初次載入 + **Route Handler** `GET /api/admin/orders?status=pending,confirmed,preparing` 俾 client poll(每 3~5 秒) | `app/api/admin/orders/route.ts` |
| 改單狀態(pending→confirmed→…) | **Server Action** `updateOrderStatus(orderId, nextStatus)`,內含狀態機合法性檢查 + 寫 `order_status_history` + `revalidatePath` | `lib/actions/staff-orders.ts` |
| 標記已找數(mock 結賬) | **Server Action** `markOrderPaid(orderId, method)` | `lib/actions/staff-orders.ts` |

> V1 用 polling 就夠(單一茶記,同時單量唔會太多)。V2 多租戶/單量大咗,先升級去 WebSocket(Vercel Functions 支援)或 Postgres LISTEN/NOTIFY 一類 realtime 方案,唔使推翻架構。

#### 4.3 老闆改 Menu 流程

| 步驟 | 實作方式 | 檔案 |
|---|---|---|
| CRUD 分類/品項/加料選項 | **Server Actions**(純表單提交) | `lib/actions/menu.ts` |
| Restaurant 設定(加一/最低消費) | **Server Action** `updateRestaurantSettings(input)` | `lib/actions/menu.ts` |
| AI 生成餐牌相 | **Route Handler** `POST /api/admin/menu-items/[id]/generate-image`(獨立 fetch + loading spinner UX,生成需時幾秒,唔啱塞入普通 form submit 嘅 Server Action 阻塞感) | `app/api/admin/menu-items/[id]/generate-image/route.ts` |
| 上下架(is_available 開關) | **Server Action** `toggleAvailability(itemId)` | `lib/actions/menu.ts` |

生圖 Route Handler 內部流程(**已按編輯註記第4/5點修正,改用正確嘅 AI SDK image generation API,唔再係 `generateText`,model id 只作示例**):
```ts
// app/api/admin/menu-items/[id]/generate-image/route.ts
import { experimental_generateImage as generateImage } from 'ai'
import { put } from '@vercel/blob'
import { buildMenuImagePrompt } from '@/lib/ai/menu-image-prompt'

export async function POST(req: Request, { params }: { params: { id: string } }) {
  await requireStaffRole(['admin'])           // 只有老闆可以重生相
  const item = await getMenuItemById(params.id)
  const prompt = buildMenuImagePrompt(item)     // 統一風格 prompt template

  const { image } = await generateImage({
    // 實際 model id 以 implementation 時 Vercel AI Gateway dashboard 揀到嘅
    // image generation model 為準,呢度純屬示例
    model: 'google/gemini-2.5-flash-image',
    prompt,
  })
  const blob = await put(`menu-items/${item.id}-${Date.now()}.webp`, image.uint8Array, {
    access: 'public',
    contentType: image.mediaType ?? 'image/webp',
  })
  await updateMenuItemImage(item.id, blob.url, prompt)  // prompt 一併存落 image_prompt
  return Response.json({ imageUrl: blob.url })
}
```

`lib/ai/menu-image-prompt.ts` 統一畫風(呢個係「保留靈魂」入面偏視覺嗰半,要同 tone.ts 互相呼應):
```ts
export function buildMenuImagePrompt(item: { name: string; description?: string }) {
  return `
Photorealistic food photography of a Hong Kong cha chaan teng (茶餐廳) dish: "${item.name}".
${item.description ?? ''}
Style: warm tungsten lighting, worn Formica table top, stainless steel plate,
slightly messy authentic HK diner presentation, shot from 45-degree angle,
shallow depth of field, no text/watermark, no cartoon/illustration — must look
like a real photo taken in an actual 冰室/茶記, not a polished studio shot.
`.trim()
}
```

> 完整版 STYLE_ANCHOR / NEGATIVE_PROMPT / 逐款菜式 prompt 見〈四、AI 圖片生成 Prompt 套件〉,`buildMenuImagePrompt` 實作要照抄嗰邊嘅完整內容,呢度淨係節錄示意。

#### 4.4 Route Handlers 總表

```
app/api/auth/[...nextauth]/route.ts     Auth.js handler(GET/POST)
app/api/orders/[id]/status/route.ts     GET — 客人輪詢自己張單狀態
app/api/admin/orders/route.ts           GET — 職員輪詢廚房顯示屏
app/api/admin/menu-items/[id]/generate-image/route.ts   POST — AI 生圖
app/api/cron/cleanup-stale-orders/route.ts   GET(Vercel Cron 觸發) — 清理逾時未確認嘅 pending 單
```

其餘所有 mutation 一律 Server Actions。

### 5. Auth 設計

#### 5.1 客人 —— 唔登入,用 guest token + table number

- 落單時前端要求填「枱號」(純文字,唔驗證,因為 V1 冇枱位管理系統)。
- 伺服器喺 `createOrder` 產生一個 `guest_token`(`crypto.randomUUID()`),存入 `orders.guest_token`,同時寫落 **httpOnly, sameSite=lax cookie**(`cct_guest_token`,有效期例如 6 小時)。
- 客人查自己張單狀態時,Route Handler 對比 cookie 入面嘅 token 同 `orders.guest_token` 是否相符,唔相符就 403 —— 咁就唔使登入都可以防止亂咁睇第啲人張單。

#### 5.2 職員/老闆 —— 建議用 Auth.js(NextAuth v5)Credentials + `staff_users` table,唔用 Clerk

| 考慮 | Auth.js + `staff_users` table(建議) | Clerk(Vercel Marketplace) |
|---|---|---|
| 是否需要獨立 `staff_users` schema | 直接對應,權限(`role: admin/staff`)就存喺自己 DB,query menu/order 嗰陣可以直接 join | Clerk 自己管用戶,`role` 要用 `publicMetadata` 或者要額外同步返落自己 DB,多一層 sync 邏輯 |
| 用戶量 | 得老闆+幾個伙記,幾條數 | 一樣夠用,但功能大殺雞用牛刀 |
| 成本 | 零(自己 DB) | 有 free tier,但用戶多咗要收費 |
| 起機時間 | 要自己寫 bcrypt hash / session,多少少工夫 | 幾行就有 UI,快 |
| V2 擴展(多茶記,可能要俾茶記自己嘅職員登入、甚至邀請流程) | 要自己加 invite flow | Clerk organizations 天生啱多租戶 |

**建議**:V1 用 **Auth.js v5 Credentials Provider**,因為需求已經明確要有 `staff_users` table(含 role),用自己 DB 做 auth source of truth 最直接、成本低、唔使跨系統同步。留返 Clerk 做 V2 candidate ——如果之後要做 SSO / 邀請制多茶記職員管理,先評估搬去 Clerk(到時 `staff_users` 可以留做 mirror table)。

```ts
// lib/auth.ts
import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { getStaffByEmail } from '@/lib/db/queries/staff'

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      authorize: async (creds) => {
        const staff = await getStaffByEmail(creds.email as string)
        if (!staff || !staff.isActive) return null
        const ok = await bcrypt.compare(creds.password as string, staff.passwordHash)
        if (!ok) return null
        return { id: staff.id, email: staff.email, name: staff.displayName, role: staff.role }
      },
    }),
  ],
  session: { strategy: 'jwt' },
  callbacks: {
    jwt: ({ token, user }) => { if (user) token.role = user.role; return token },
    session: ({ session, token }) => { session.user.role = token.role; return session },
  },
})
```

`middleware.ts` 保護 `/admin/**`:
```ts
export { auth as middleware } from '@/lib/auth'
export const config = { matcher: ['/admin/:path*', '/api/admin/:path*'] }
```

Menu 編輯類操作額外用 `requireStaffRole(['admin'])` 喺 Server Action 入面再驗一次 role(唔淨係靠 middleware 攔截頁面)。

### 6. Mock 結賬流程設計

#### 6.1 訂單狀態機

```
                 客人提交
                    │
                    ▼
   ┌──────────► pending ───────────┐
   │                │               │ 職員取消
   │      職員確認接單│               ▼
   │                ▼           cancelled
   │            confirmed ─────────┐
   │                │              │ (亦可取消)
   │      廚房開始整 │              ▼
   │                ▼          cancelled
   │            preparing
   │                │
   │      整好可以派 │
   │                ▼
   │              ready
   │                │
   │      畀咗客/埋咗單
   │                ▼
   └───────────  completed
```

規則:
- 合法轉移只有:`pending→confirmed`、`confirmed→preparing`、`preparing→ready`、`ready→completed`;`pending`/`confirmed` 可以直接去 `cancelled`;`pending` 亦可由系統(cron)自動轉去 `cancelled`(逾時未確認,見 §4.4 cron)。
- 每次轉移都寫一行落 `order_status_history`(記低邊個職員做嘅、幾點做;系統自動觸發時 `changed_by = NULL`,`note` 寫明原因)。
- 轉移邏輯統一喺 `lib/actions/staff-orders.ts` 用一個 `ALLOWED_TRANSITIONS` map 檢查,唔畀前端亂咁 PATCH 任意狀態。
- **前台顯示層**只用 4 段簡化 label(見〈編輯註記〉第2點嘅 mapping),DB 內部仍然完整記錄 6 個 status。

```ts
const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending:    ['confirmed', 'cancelled'],
  confirmed:  ['preparing', 'cancelled'],
  preparing:  ['ready'],
  ready:      ['completed'],
  completed:  [],
  cancelled:  [],
}
```

#### 6.2 「畀錢」點 mock

V1 冇真銀行 / payment gateway,「結賬」淨係一個**手動確認**動作,貼近真實茶記做法(客人食完去櫃檯畀現金/八達通,伙記喺 POS 度撳一下):

- `orders.payment_status`:`unpaid` → `mock_paid`。
- `orders.payment_method`:職員喺 UI 揀 `cash` / `octopus_mock` / `fps_mock`(純標籤,唔連任何真實支付 SDK)。
- 業務規則:`status` 轉做 `completed` 之前,要求 `payment_status = mock_paid`(Server Action 入面加一個 guard)。
- UI 上職員後台每張單有個「💰 埋單」掣,撳咗先可以撳「完成」。
- 結賬金額計算要包含 restaurant 嘅 `service_charge_enabled/percent`(如啟用,`total = subtotal * (1 + service_charge_percent/100)`)。

**升級去真銀行嗰陣(V2 之後)**:淨係要將 `markOrderPaid` 呢個 Server Action 換成叫真 payment gateway(例如 Stripe / 本地八達通 API)產生 checkout session,`payment_status` 由 webhook 驅動更新,`orders`/`order_status_history` schema 完全唔使改。

### 7. Scalability Path:V1 單茶記 → V2 多茶記 SaaS

**核心設計原則已經喺第3節做咗:every business table 都有 `restaurant_id` FK**(`menu_categories`、`menu_items`、`item_options`、`orders`、`staff_users`),呢個係成個 multi-tenant 擴展性嘅關鍵,理由:

1. **唔使加欄、唔使搬資料**:V2 要分租戶,唔使做痛苦嘅 schema migration 幫舊表逐張補返 `restaurant_id`,因為 V1 第一日已經有。
2. **Query 層一開始就強制帶 tenant 過濾**:所有 db query helper(`lib/db/queries/*.ts`)簽名要求 `restaurantId` 做第一個參數,例如:
   ```ts
   export function getMenuItems(restaurantId: string) {
     return db.select().from(menuItems).where(eq(menuItems.restaurantId, restaurantId))
   }
   ```
   V1 呢個 `restaurantId` 淨係嚟自一個 `lib/tenant.ts` helper 讀 env(`DEFAULT_RESTAURANT_ID`);V2 改為由 domain/subdomain 解析。呢個 helper 係**單一改動點**:
   ```ts
   // lib/tenant.ts — V1 實作
   export async function getCurrentRestaurantId() {
     return process.env.DEFAULT_RESTAURANT_ID!   // 未來 V2 改做讀 headers().get('host') 再 lookup restaurants.domain
   }
   ```
3. **Supabase Postgres Row-Level Security(RLS)**:V2 可以喺 DB 層加 RLS policy,令每個 connection 只睇到自己 `restaurant_id` 嘅 row,做多一重防護(V1 唔使開,但 schema 已經預埋咗 column,開 RLS 唔使改表)。
4. **`staff_users` 已經係 per-restaurant**:即刻可以支援「A 茶記職員睇唔到 B 茶記啲單」,唔使另起 mapping table。
5. **Auth 擴展**:V1 用 Auth.js + email/password 已經天然可以喺 `staff_users` 加 `restaurant_id`;V2 想加邀請制/多茶記管理,再評估搬 Clerk Organizations,`staff_users` 保留做 read model。
6. **未來 billing/plan 表**:V2 要加 `restaurants.plan`、`subscriptions` 呢類表,直接掛喺已經存在嘅 `restaurants.id` 度,唔影響現有表結構。

即係話:**V1 唯一「假嘅多租戶」係得一行 `restaurants` + env 變數指住佢**,但因為每張表已經有 FK,V2 要開新租戶淨係 insert 多一行 `restaurants` + 幫個 domain 加返個 DNS/`restaurants.domain` mapping,業務邏輯零改動。

### 8. 部署設定

#### 8.1 Custom domain

`cctmenu.isaaccheng.xyz` 已經掛喺依家嘅 Vercel project 度 —— **domain 係掛喺 project 層面,唔係掛喺 framework 層面**,所以由 Flask(`@vercel/python`)換成 Next.js,domain 設定完全唔使郁,Vercel dashboard → Project → Domains 果張表照舊。舊嘅 `vercel.json` 直接刪走,因為 Next.js 喺 Vercel 係 zero-config framework,唔再需要手動 `builds`/`routes`。

#### 8.2 `vercel.ts`(取代 `vercel.json`)

```ts
// vercel.ts
import { routes, type VercelConfig } from '@vercel/config/v1'

export const config: VercelConfig = {
  framework: 'nextjs',
  buildCommand: 'npm run build',
  installCommand: 'npm install',

  redirects: [
    // 舊 Flask 版留低嘅 legacy path,導返去新首頁
    routes.redirect('/order-old', '/order', { permanent: false }),
  ],

  headers: [
    routes.cacheControl('/images/(.*)', { public: true, maxAge: '30 days', immutable: true }),
  ],

  crons: [
    // 每日凌晨清埋前一日殘留嘅 pending/guest 單(防止 demo 環境愈谷愈多垃圾單,
    // 亦對應商業計劃 §7 風險緩解:pending 逾時未確認自動取消)
    { path: '/api/cron/cleanup-stale-orders', schedule: '0 4 * * *' },
  ],
}
```

#### 8.3 必要環境變數

| 變數 | 來源 | 說明 |
|---|---|---|
| `DATABASE_URL` | Vercel Marketplace(Supabase)自動注入 | Drizzle 用 |
| `AUTH_SECRET` | 手動生成(`npx auth secret`) | Auth.js JWT 簽名 |
| `DEFAULT_RESTAURANT_ID` | 手動設定,等於 seed 出嚟嗰行 `restaurants.id` | V1 tenant 解析用 |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob 自動注入 | 上傳生成圖片 |
| (AI Gateway)不需要手動 key | OIDC 自動處理(`vercel env pull` 產生 `VERCEL_OIDC_TOKEN`,deploy 後自動 refresh) | 生圖用 |

Local dev:`vercel link` → `vercel env pull .env.local`。

### 9. V0 → V1 檔案結構遷移

#### 9.1 舊檔對應新檔(邊個功能去咗邊)

| V0(Flask) | 對應 V1(Next.js)位置 | 備註 |
|---|---|---|
| `app.py`(route + 邏輯全部混埋) | 拆做 `app/(customer)/order/page.tsx` + `lib/actions/order.ts` + `lib/db/queries/menu.ts` | 邏輯同 UI 分離 |
| `dinner_menu` / `dinner_menu2` dict | `menu_items` table(seed script) | in-memory → DB |
| `套餐/凍飲/熱飲` 三個常數 | `item_options` rows(`option_group='套餐飲品'`) | 由寫死常數變成可喺後台編輯 |
| `templates/index.html` | `app/(customer)/order/page.tsx` + shadcn components | Jinja → RSC + Tailwind |
| `templates/result.html` | `app/(customer)/order/[orderId]/page.tsx` | 加咗訂單狀態顯示 |
| `static/css`、`static/js` | shadcn/Tailwind 取代,`components/` 底下 | |
| `static/images` | 遷移做 Vercel Blob 生成相/或者做 seed 圖 fallback | |
| `Make_Order.py` / `Make_Order_Final.py`(CLI 版) | 唔遷移,純粹保留做歷史文件/README 提及嘅原型 | 唔使刪,但唔進 Next.js app |
| `vercel.json` | `vercel.ts` | |
| `requirements.txt` | `package.json` | |

#### 9.2 新專案目錄樹

```
cha-chaan-teng/
├── vercel.ts
├── package.json
├── drizzle.config.ts
├── middleware.ts
│
├── app/
│   ├── (customer)/                     # 客人前台,唔使登入
│   │   ├── layout.tsx
│   │   ├── order/
│   │   │   ├── page.tsx                # 睇餐牌 + 加落購物車
│   │   │   └── [orderId]/page.tsx      # 落單確認 + 狀態
│   │
│   ├── (auth)/
│   │   └── login/page.tsx              # 職員登入
│   │
│   ├── admin/                          # 職員/老闆後台,middleware 保護
│   │   ├── layout.tsx
│   │   ├── orders/page.tsx             # 廚房顯示屏 / 睇單改狀態
│   │   ├── menu/
│   │   │   ├── page.tsx                # menu 列表
│   │   │   └── [itemId]/edit/page.tsx  # 編輯品項 + 生成AI相
│   │   └── reports/page.tsx            # 銷售報表
│   │
│   └── api/
│       ├── auth/[...nextauth]/route.ts
│       ├── orders/[id]/status/route.ts
│       ├── admin/
│       │   ├── orders/route.ts
│       │   └── menu-items/[id]/generate-image/route.ts
│       └── cron/cleanup-stale-orders/route.ts
│
├── components/
│   ├── ui/                             # shadcn 生成的元件
│   ├── cart/
│   │   ├── cart-store.ts               # zustand
│   │   └── cart-drawer.tsx
│   ├── menu/
│   │   └── menu-item-card.tsx
│   └── admin/
│       ├── order-status-badge.tsx
│       └── order-board.tsx
│
├── lib/
│   ├── db/
│   │   ├── index.ts                    # getDb() 懶初始化
│   │   ├── schema.ts
│   │   └── queries/
│   │       ├── menu.ts
│   │       ├── orders.ts
│   │       └── staff.ts
│   ├── actions/
│   │   ├── order.ts                    # createOrder
│   │   ├── staff-orders.ts             # updateOrderStatus, markOrderPaid
│   │   └── menu.ts                     # menu CRUD + restaurant 設定
│   ├── ai/
│   │   └── menu-image-prompt.ts
│   ├── copy/
│   │   └── tone.ts                     # 集中管理「澳牛式」文案
│   ├── auth.ts
│   └── tenant.ts                       # getCurrentRestaurantId()
│
└── drizzle/
    ├── migrations/                     # drizzle-kit 產生嘅 SQL
    └── seed.ts                         # 寫入預設 restaurant + 5 個經典餐 + item_options
```

`drizzle/seed.ts` 直接將 V0 嘅 5 個餐同加料規則轉做 seed data(A餐干炒牛河$65、B餐星洲炒米$60、**C餐揚州炒飯$68**、D餐銀芽炒米粉$55、E餐蝦仁炒飯$70,跟套餐+$10、凍飲+$6、熱飲+$3),確保 V1 上線一開始個 menu 同 V0 一致,之後老闆可以自己喺後台改。

---

## 三、UI/美術方向

### 0. 一句講晒個方向

**唔係做「懷舊主題嘅 SaaS app」,係做返一間開咗喺你部手機入面嘅真.茶記** —— 格仔地、紅底招牌、伙記口吻、埋單靚仔靚女,全部要喺 UI 度見到,但要靠設計系統收得住,唔可以做到廟街大牌檔咁亂,都唔可以做到中環 fintech app 咁冇魂。城市感懷舊(urban nostalgia)而唔係鄉土懷舊。

### 1. 視覺參考同觀察

#### 1.1 實體空間元素(要轉化做 UI 語言嘅)

| 實體元素 | 觀察 | UI 轉化建議 |
|---|---|---|
| **格仔地磚 / Terrazzo** | 傳統冰室常見墨綠+白、或紅+白格仔地磚,撞色但唔花,terrazzo floor 常同霓虹燈同時出現喺 retro-revival 設計 | 唔好整個滿版格仔底(太吵、拖累手機效能),改用**幼條格仔紋做 divider / footer band / empty-state 插圖底紋**,或者卡片 hover 時個底閃返一下格仔紋 |
| **手寫餐牌字 / 牆上價目表** | 懷舊冰室裝潢特色包括牆上手寫價餐牌 —— 毛筆字直接寫喺紙皮/牆上 | Menu item 標題用帶手寫感字體(見 2.2),價錢用粗身數字大大隻標紅 |
| **卡位 / Formica 摺枱 / 鏡牆 / 磚牆** | Booth seating, mirrors, tiled walls 係 cha chaan teng 嘅標誌性反覆出現元素,卡位皮通常係墨綠/酒紅色 | Card 組件嘅底色/邊框可以偷返 Formica 嘅撞色感(例如奶白底配紅邊),唔使真係貼張枱皮圖 |
| **霓虹招牌** | 香港霓虹招牌以紅、粉紅、青為主色,多用喺食肆招牌,「澳牛」「蘭芳園」呢類老字號招牌字都係呢種手繪風 | 主 CTA 按鈕、「熱賣」badge 可以用**霓虹風格嘅發光邊/glow shadow**(純CSS box-shadow 做,唔使真係做動畫燈管,商業產品要收),但唔好成頁都咁做,keep 做強調位先 |
| **墨綠地磚、粉紅/綠馬賽克磚** | 設計師由茶記磚色抽出嘅色板通常係「綠+粉」,深綠配鮮紅係另一個常見組合 | 呢個係色板嘅核心來源,見 2.1 |
| **吊扇、老式風扇、報紙糊天花** | 氣氛元素,唔會做成 UI 組件,但可以做 loading spinner 嘅靈感(吊扇轉動感) | Loading 用一個簡化吊扇葉旋轉 icon,好過用泛用 spinner |
| **手寫招牌字體「北魏真書」** | 北魏真書體係香港招牌最經典嘅手寫楷書風格,被稱為「香港人嘅身分象徵」;近年有寫字佬李漢嘅手稿數碼化做咗「李漢港楷」字體,係另一種更貼地嘅招牌手寫字 | 見 2.2 字體選用 |

#### 1.2 已落地嘅商業案例(可直接參考風格強度)

- **CLOT 凝結冰室** —— 潮牌 CLOT 做嘅 cha chaan teng pop-up,將格仔磚、卡位、霓虹燈重新包裝做潮流零售空間,示範咗「懷舊元素 × 現代簡約」點樣夾
- **Diptyque 香港旗艦店** —— 用穿孔鐵閘、terrazzo 地板、霓虹藝術裝置去講「老香港」,證明咗呢套視覺語言可以做到高級感而唔失地道
- **Kasa by Lim + Lu** —— 香港餐廳設計案例,示範現代茶記空間點樣用磚色同燈光做出唔死板嘅氛圍
- 呢啲案例嘅共通點:**顏色收斂(每個空間通常主打1-2隻懷舊色 + 大量白/米白留白),紋理做點綴唔做主角**。呢個原則直接搬去 UI:唔好成個 app 紅紅綠綠,用大量米白/奶茶色做底,紅/綠/金做強調。

### 2. Design Tokens

#### 2.1 色板(可直接開做 shadcn CSS variables)

**核心邏輯**:大面積用米白/奶茶色做底(唔好用純白 `#FFFFFF`,太似SaaS),紅色做主強調(CTA、價錢、熱賣),墨綠做次要強調(老火湯/健康向標籤),金色做點綴邊線,青色做「凍飲」語意色。

```css
:root {
  /* 品牌主色:招牌紅 / 茶記紅 */
  --cct-red-50:  #FDF2EE;
  --cct-red-100: #FADCD3;
  --cct-red-500: #E4432F;   /* 主紅,用喺 CTA / 熱賣 badge / 價錢 */
  --cct-red-600: #C8272C;   /* hover/深一階 */
  --cct-red-700: #9E1B1F;   /* pressed / 強調文字 */

  /* 奶茶啡黃系(底色 & 次要強調)*/
  --cct-cream-50:  #FBF3E3;  /* 全站底色,代替純白 */
  --cct-cream-100: #F3E4C8;  /* 卡片底色 */
  --cct-milktea-400: #D8A65C;
  --cct-milktea-600: #B87A33; /* 邊框 / icon 線色 */

  /* 冰室墨綠(次要強調 / 例湯・老闆推介類 badge)*/
  --cct-green-600: #2F6B52;
  --cct-green-800: #1B4D3E;

  /* 格仔藍(職員後台次要色 / status 標籤)*/
  --cct-blue-700: #274472;

  /* 霓虹青(凍飲語意色)*/
  --cct-teal-500: #1FA9A3;

  /* 金邊(點綴線 / icon)*/
  --cct-gold-500: #D9A441;

  /* 文字墨色(唔用純黑,帶少少啡調,更似印刷字)*/
  --cct-ink-900: #2B2320;
  --cct-ink-600: #5C4F49;

  /* shadcn 對應(直接 map 落 shadcn 慣用 token)*/
  --background: var(--cct-cream-50);
  --foreground: var(--cct-ink-900);
  --primary: var(--cct-red-500);
  --primary-foreground: #FFF8F0;
  --secondary: var(--cct-green-800);
  --secondary-foreground: #FFF8F0;
  --accent: var(--cct-gold-500);
  --muted: var(--cct-cream-100);
  --border: #E8D9BE;
  --destructive: #A31515; /* 取消單/售罄用,同主紅區分開 */
}

/* 職員後台可以考慮暗色模式(廚房/夜更用)*/
@media (prefers-color-scheme: dark) {
  :root {
    --background: #1E1A17;
    --foreground: #F3E4C8;
    --muted: #2B2420;
    --border: #3A2E26;
  }
}
```

> 說明:紅+米白+墨綠三色已經夠強烈,**唔好再加粉紅/紫呢類「潮牌感」色**,會偏離茶記調性變咗做文青咖啡店。金色淨係用喺線條/icon,唔好大面積填色(會太「賭場」)。

#### 2.2 字體

| 用途 | 字體 | 說明 |
|---|---|---|
| **中文標題 / 招牌感強調字**(店名、Menu 分類大標題、「熱賣」大字) | **LXGW WenKai TC(霞鶩文楷)** | 開源、免費商用、Google Fonts 有得直接 `@import`,帶毛筆楷書感,最接近「北魏真書」招牌字嘅神韻,但比純北魏體更易讀,適合數位排版。如果之後想砸多啲錢做品牌識別,可以另外**商業授權李漢港楷**,淨係用喺 logo / 主 wordmark,唔使全站用(授權貴、字數有限) |
| **中文內文 / UI 文字**(menu 描述、按鈕、表單) | **Noto Sans HK** | Google Fonts 官方香港字形版本,繁體香港用字正確(例:「乜」「咁」呢類粵字字形唔會用錯大陸/台灣字形),可讀性高,適合小字 |
| **英文/數字大字**(價錢、Hero 標題、桌號) | **Alfa Slab One** | 粗身 slab serif,好似舊式搪瓷招牌/罐頭字,用喺價錢同大數字上有懷舊工業感,Google Fonts 有 |
| **英文/數字 UI 文字**(按鈕英文字、狀態標籤、後台介面) | **Space Grotesk** | 帶少少性格嘅 grotesk,唔似 Inter/Helvetica 咁泛用企業感,但夠清晰做功能性文字 |

字重建議:中文標題用 700,內文用 400/500;英文價錢用 Alfa Slab One 單一字重(呢隻字體通常淨係得 400 但夠粗)。

#### 2.3 間距 / 圓角 / 陰影

- **間距**:跟 4px scale(4/8/12/16/24/32/48),手機版落單頁 padding 用 16px 做安全邊界,唔好學好多 SaaS 用 24px+ 太鬆(茶記係「打橫嚟」,資訊要密啲但唔亂)。
- **圓角**:**唔好用大圓角(rounded-2xl/3xl)** —— 太圓會變成「可愛文青app」,失去茶記嘅利落感。建議:
  - 卡片/按鈕:`rounded-md` (6-8px) —— 似餐牌卡紙嘅切角,唔係軟綿綿嘅膠囊形
  - Badge(熱賣/走青):`rounded-sm` (2-4px) 或者索性用**斜角貼紙感**(`clip-path` 剪一個角),似真係貼喺餐牌上嘅小紙牌
  - Input / Select:`rounded-md`,邊框用 1.5px 實線(`--cct-milktea-600`),唔好用無邊框嘅 flat design,茶記嘢要「睇得出個框喺邊」
- **陰影**:唔用泛用嘅 soft SaaS shadow(`0 4px 6px rgba(0,0,0,0.1)` 嗰種)。建議用**貼紙感嘅硬陰影** `2px 2px 0 rgba(43,35,32,0.15)` 做 card/badge,似手寫紙牌貼喺牆上嘅感覺;CTA 按鈕 hover 時可以加返一層**霓虹 glow**:`0 0 12px rgba(228,67,47,0.5)`。

### 3. UI 組件風格方向

#### 3.1 按鈕(Button)

- **Primary CTA**(「加入落單」「落單」):實心 `--cct-red-500`,白/米白字,`Alfa Slab One` 或 `Space Grotesk` 粗體,hover 時加霓虹 glow + 輕微 scale(1.02),唔好用漸層(gradient 太似地產app)。
- **Secondary**(「返回餐牌」「取消」):outline 風格,`--cct-milktea-600` 邊框 + 透明底,唔用灰色系(灰色太「企業」)。
- **Danger/取消單**:`--destructive` 實色,職員後台專用。
- 按鈕角落**唔好全圓**,用 `rounded-md`,文字全部用**中文為主**(見第4節),唔好淨係得英文 "Add to Cart" 呢類字眼。

#### 3.2 卡片(Menu Item Card)

- 底色 `--cct-cream-100`,邊框 1.5px `--cct-milktea-600` 或幼身雙線(模仿餐牌邊框雙線裝飾)。
- 相片用 4:3 或 1:1,四角唔好太圓,加返一層極輕微嘅暖色 overlay(`sepia` 5-10%)令 AI 生成相同真實相片睇落更統一唔會「太乾淨/AI感」。
- 價錢用 `Alfa Slab One` + `--cct-red-500`,字size 明顯大過品名,因為茶記睇餐牌係「先睇價錢定唔定食」。
- Hover/tap 效果:卡片輕微抬起 + 硬陰影加深,唔用泛用嘅 fade-in。

#### 3.3 標籤(Badge)

呢個係體現「有個性」最重要嘅地方 —— **唔好用泛用嘅 "New" "Popular" 綠色/藍色 pill**,要用返地道講法:

| Badge 中文 | 視覺 |
|---|---|
| 熱賣 | 紅底白字,斜角貼紙感(`clip-path` 切一角),略帶霓虹 glow |
| 老闆推介 | 金邊 + 墨綠字,較低調 |
| 今日靚湯 | 墨綠底奶白字 |
| 賣晒 | 灰底(唯一容許用灰色嘅位置)+ 斜線紋理 overlay,整張卡片降低透明度 60%,唔可以點擊 |
| 走青 / 走蛋 / 少甜 / 走冰(customization chip) | 白底 + 幼紅邊,toggle 揀選時反轉做紅底白字,唔用 checkbox,用「chip」形式一撳就切換 |
| 辣 🌶 | 用細粒紅色圓點 + 「辣」字,唔使太多 emoji(見第4節) |

#### 3.4 整體調性守則

- **顏色數量克制**:每個畫面最多見到 3 隻主色(米白底 + 紅強調 + 1 隻次要色),先夠力度。
- **紋理係調味唔係主菜**:格仔紋/磚紋淨係用喺 divider、empty state、loading,唔好做大面積 background,手機小螢幕會顯得亂同影響效能。
- **拒絕嘅風格**:漸層卡片、大量圓角膠囊按鈕、純白底藍色 accent(呢個係最典型嘅「泛用SaaS藍白風」,一定要避免)、Emoji 濫用做裝飾(emoji 淨係用喺客人易理解嘅地方,例如辣度,唔好成句文案塞晒 emoji)。

### 4. Voice & Tone 文案語氣指南

**原則**:似返樓下相熟茶記個伙記同你講嘢 —— 唔太客氣,但抵死、有溫度、識得照顧你。商業產品要收咗嗰種真.粗口/串到爆嘅市井感,改用「陰陰嘴笑」嘅程度,唔好變成侮辱或者冒犯。**永遠唔鬧客人,最多係「串下自己」(廚房/系統)嚟搞笑**。

#### 4.1 按鈕文字

| 情境 | 文案 | 唔好咁寫 |
|---|---|---|
| 加入落單 | 「嚟多樣!」/「加落單」 | 「加入購物車」 |
| 落單確認 | 「照單!」/「落單啦」 | 「確認訂單」 |
| 查看已叫嘅嘢 | 「睇返張單」 | 「查看購物車」 |
| 再叫多次 | 「照舊嚟多份」 | 「重新訂購」 |
| 取消 | 「唔要喇」 | 「取消」(呢個直接留低都okay,但選項1更有性格) |
| 返回餐牌 | 「返轉頭揀多樣」 | 「返回」 |
| 呼叫服務 | 「Sir/唔該埋單」(見4.4) | — |

#### 4.2 空狀態文字 (Empty States)

| 情境 | 文案 |
|---|---|
| 未揀嘢,個底空 | 「個底重未夠喎,快啲揀嘢先啦」 |
| 該分類冇貨/未有菜式 | 「呢頁重未開飯,睇吓第樣先」 |
| 職員後台:今日未有新單 | 「今日重靜英英,未有客到」 |
| 搜尋唔到菜式 | 「揾唔到喎,係咪打錯字?定係我哋未有呢味」 |

#### 4.3 落單確認 / 狀態語

- 落單成功:「單已落咗,師傅落緊鑊,唔該坐定定等埋佢!」
- 顯示訂單狀態(前台 4 段顯示 label,內部對應技術架構 §6 嘅 6-state DB 狀態機,mapping 見〈編輯註記〉第2點):
  1. `新落單`(對應 DB `pending`) —— 「新單啱啱到」
  2. `落緊鑊`(對應 DB `confirmed`/`preparing`) —— 「師傅手起刀落緊」
  3. `得咗`(對應 DB `ready`) —— 「得咗!唔該去攞」or「起碼啦,出爐喇」
  4. `派咗`(對應 DB `completed`) —— 「食得喇,慢用」
- 想加叫:「食緊食緊,想加多樣?照撳落單掣」
- 取消訂單(客人操作):「真係唔要?走寶㗎」

#### 4.4 錯誤提示

- 網絡/系統出錯:「個伙記瞌咗眼,唔該等等再撳過」
- 落單失敗:「單好似跌咗落地,唔該再嚟一次」
- 售罄先撳落單:「呢味賣晒喇,換樣先啦」
- 表單漏填(例如枱號):「枱號都未講,坐咗喺邊度呀大佬」
- Loading 太耐:「廚房好忙,唔該等多陣」
- 未夠最低消費(對應商業計劃 §8 / 技術架構 `min_spend_amount`):「未夠最低消費喎,加多樣先啦」

#### 4.5 其他點綴用語(散落喺 UI 各處,唔好塞晒喺同一頁)

- 首頁問候(guest landing):「嚟啦,想食乜?」/「熱定凍?」(喺選飲品時用做 section 標題)
- 客製化選項標題:「要點呀?」(走青/走蛋/少甜嗰組 chip 上面嘅標題)
- 職員後台今日總結:「今日賣咗 XX 碗,數得計」
- Footer/版權位:可以放一句「唔該幫襯,慢慢揀,唔使急」

**注意事項(節制原則)**:
- 唔好每句都加語氣詞,會膩。**主要 CTA 同確認/錯誤 3-4 個關鍵時刻**用足呢種語氣就夠,表單標籤、法律/條款、付款相關文字(雖然V1係mock)要轉返正常書面語,唔可以開玩笑(例如「總金額」「訂單編號」呢類唔使加花名)。
- 完全唔用粗口字(連諧音都唔好),「串」嘅尺度控制喺「損下自己盤生意/廚房」,唔好損客人。

### 5. Layout 建議

#### 5.1 客人落單頁(手機優先,掃碼進入)

```
┌─────────────────────────────┐
│ [Logo/店名-手寫感]   枱號: 8  │ ← sticky header, 米白底/紅字
├─────────────────────────────┤
│ [常餐][套餐][粉麵飯][飲品] > │ ← 橫向scroll分類chip, sticky
├─────────────────────────────┤
│ ┌─────────┐ 熱賣🏷️           │
│ │ 相片    │ A餐 干炒牛河      │
│ │         │ 香濃鑊氣,即叫即炒│
│ └─────────┘        $65 [+加]│ ← card, 價錢用slab字大大隻
│ ┌─────────┐                 │
│ │ 相片    │ B餐 星洲炒米      │
│ └─────────┘        $60 [+加]│
│         ⋮ (continue scroll) │
├─────────────────────────────┤
│ [睇返張單 · 共2樣 · $125] →  │ ← sticky bottom bar, 紅底大CTA
└─────────────────────────────┘
```

要點:
- **單欄卡片 list**(唔好用grid多欄,手機一手拇指操作要夠大掂位)。
- 分類 chip 用橫向滑動,唔好收埋喺 hamburger menu(客人枱頭掃碼要即刻見到嘢)。
- 撳「+加」入客製化 bottom sheet:走青/少甜/凍熱/加底 等 chip 選項 + 數量 stepper + 「加落單」按鈕,sheet 由底部滑出(mobile native pattern)。
- Sticky bottom bar 全程顯示已叫幾多樣同埋幾錢,撳落去先入 order summary 頁(列晒品項 + 枱號確認 + 大大隻「落單」CTA)。如 restaurant 設有最低消費,要喺呢頁清楚顯示同提示。
- 落單後跳去**確認頁**:顯示狀態 stepper(新落單→落緊鑊→得咗→派咗),底下有「想加多樣?」連返去餐牌。
- 全程**唔使登入**,靠 QR code 帶嘅 table token 分辨枱號 + session(cookie/localStorage 存返個 order session id)。

#### 5.2 職員/老闆後台(桌面優先,快速操作)

```
┌──────┬──────────────────────────────────┐
│ Side │  即時單 (Kanban)                   │
│ bar  │ ┌──新單──┬─落緊鑊─┬──得咗──┬已完成│
│ 落單 │ │枱3 2件 │枱5 3件 │枱1     │枱8   │
│ 餐牌 │ │[接單]  │[得咗]  │[派咗]  │      │
│ 報表 │ ├────────┼────────┼────────┤      │
│ 設定 │ │枱7 1件 │        │        │      │
└──────┴──────────────────────────────────┘
```

要點:
- **Kanban 式即時單版**係核心畫面,一開後台就見到,每張單卡顯示枱號、品項、落單時間,**用顏色標示等待時間**:<5分鐘綠框、5-10分鐘黃框、>10分鐘紅框(催單提示,唔使文字都睇得出急唔急)。
- 狀態推進**一撳掣就過下一欄**(接單/得咗/派咗),唔使拖曳(觸控裝置更快更少出錯),對應狀態機:`新落單 → 落緊鑊 → 得咗 → 派咗`。**「落緊鑊」欄接住 DB 嘅 `confirmed` 同 `preparing` 兩個狀態**(接單掣先 `pending→confirmed`,再一個「開始整」掣 `confirmed→preparing`,兩張掣但視覺上單卡留喺同一欄——實作細節見〈編輯註記〉第2點)。
- 餐牌管理頁:簡單 table list,每行有「有貨/賣晒」toggle 放到最當眼(呢個係老闆日常最常撳嘅掣),AI 相片有「重新生成」按鈕。
- 設定頁:加一服務費開關+百分比、最低消費金額輸入(對應 `restaurants.service_charge_*`/`min_spend_amount`)。
- 銷售報表:大數字 stat cards 行先(今日單數、今日營業額、熱賣Top3),detail chart 放落面,唔使一開波就係複雜圖表 —— 老闆睇手機/後枱位都要一眼睇明。
- 後台**要登入**(職員/老闆角色),但操作流程要快 —— 減少 modal/多步驟表單,優先 inline edit 同一撳過版嘅設計,因為呢個係返工用嘅工具唔係俾人慢慢逛嘅。
- 桌面版都可以保留少少個性文案(例如空狀態「今日重靜英英」),但**功能性字眼(狀態、按鈕、報表數字標籤)要清晰直接**,唔好為咗保持人設而犧牲操作效率 —— 呢度同客人頁唔同,客人頁可以玩多啲,職員頁應該「七分正經、三分抵死」。

---

## 四、AI 圖片生成 Prompt 套件

> 供 Vercel AI Gateway 圖片生成使用;實際 model id 以 implementation 時 Gateway dashboard 揀到嘅為準(見〈編輯註記〉第5點)。
>
> **2026-08-28 大幅重寫**:舊版 style anchor 寫「professional food photography...
> DSLR quality...soft natural window light」,實測生出嚟成套相太靚太乾淨、太
> 一式一樣,似西式雜誌/連鎖店 catalog,唔似真.香港茶記(用戶反饋原話:
> 「太假一式一樣」)。下面新版刻意反過來,寫成「真.茶記客人隨手影嘅相」,
> 用光管冷光、舊 Formica/不鏽鋼枱面、有崩邊嘅美耐皿碟呢類貼地細節取代乾淨
> 專業攝影棚感;每款菜式仲各自指定「Surface / Angle」(3 種表面 × 2 種角度
> 輪流分配,見 §1/§2 逐款),先至令成套相真係有變化 —— 單靠喺 style anchor
> 度寫句「vary background」係冇用嘅,每次生圖係獨立 call,個 model 唔知道
> 第二張用過乜嘢。同時因為 Vercel AI Gateway 而家要求帳戶要有信用卡先俾生圖
> (見 RUN-BOOK.md / Obsidian 記錄),完整可直接複製落其他生圖工具用嘅 16+2
> 個 compiled prompt 已經另外生成落 `docs/ai-image-prompts.md`(由
> `lib/ai/menu-image-prompt.ts` + `lib/ai/image-prompts.ts` 直接生成,呢兩個
> code 檔案先係 source of truth)。

### 0. Style Anchor(每張相都要用)

呢段係「共通句」,负责確保成套相睇落係同一間茶記、同一個攝影師影出嚟,唔會七國咁亂,但**唔強迫每張相用一模一樣嘅背景/角度**(嗰個位交返俾逐條 dish prompt 自己嘅 Surface/Angle 指定)。**寫法:放喺每條 dish-specific prompt 前面,再喺後面加返 negative/consistency 提示。**

```
STYLE ANCHOR (prepend to every prompt):
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

NEGATIVE PROMPT (apply to all): professional studio food photography, DSLR bokeh,
shallow depth of field, soft golden-hour window light, minimalist clean background,
white seamless backdrop, Western fine-dining plating, perfectly symmetrical
composition, overly polished glossy "stock photo" look, magazine-spread lighting,
cartoon, illustration, 3D render, CGI, plastic-looking food, text overlay,
watermark, logo, brand name, visible price-tag text, hands, arms, faces,
blurry or out-of-focus main dish, distorted plate shape, brand-new pristine
tableware.
```

> 用法:`FULL_PROMPT = STYLE_ANCHOR + "\n\nDISH:\n" + dishSpecificPrompt + "\n\n" + NEGATIVE_PROMPT`
>
> 完整版(連埋所有 16 款品項 + 2 個 bonus 嘅 compiled full prompt)見
> `docs/ai-image-prompts.md`,下面 §1/§2 淨係列返每款嘅 dish-specific 部分做
> 參考,唔重複貼成個 STYLE_ANCHOR。

### 1. 常餐/套餐分類 —— 生圖 Prompt(A-E)

每款開首嘅 `Surface / Angle:` 一行對應 §0 講嘅「唔靠 style anchor 講廢話,逐條
prompt 自己指定表面/角度」做法,3 種表面(舊 Formica 枱 / 不鏽鋼枱 / 紅米粒
terrazzo 櫃枱)+ 2 種角度(elevated 45° / near-top-down 70-75°)人手輪流分配。

#### A餐 干炒牛河 ($65)
```
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
```

#### B餐 星洲炒米 ($60)
```
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
```

#### C餐 揚州炒飯 ($68)
```
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
```

#### D餐 銀芽炒米粉 ($55)
```
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
```

#### E餐 蝦仁炒飯 ($70)
```
DISH: Surface / Angle: scratched brushed stainless-steel table; elevated ~45-degree
angle.
A plate of "shrimp fried rice" (蝦仁炒飯). Fluffy white fried rice studded
generously with plump pink-orange cooked shrimp (larger and more prominent
than in Yeung Chow rice — shrimp is the star), scrambled egg pieces, diced
spring onion, rice grains light and separated with a faint translucent
egg-coating sheen. 6-8 whole shrimp arranged a little unevenly across the top
of the rice mound, catching a small overexposed highlight from the fluorescent
tube overhead. A tarnished stainless-steel spoon rests at the plate's edge.
```

### 2. 飲品 / 三文治多士 / 小食甜品 / 湯麵分類 —— 生圖 Prompt(F-P,2026-08-27 加落 menu)

#### F. 凍奶茶 ($22)
```
DISH: Surface / Angle: red-and-cream speckled terrazzo/laminate counter; elevated
~45-degree angle showing the full glass profile.
A tall glass of iced Hong Kong-style milk tea (凍奶茶), served in a plain thick
clear glass (not fancy stemware) with condensation droplets running down the
outside and pooling on a small stained saucer underneath, deep reddish-brown
tea color, ice cubes visible through the glass, a slightly bent disposable
straw. Milk tea looks rich and opaque-brown, a faint creamy swirl visible at
the top where milk hasn't fully mixed. Fluorescent overhead light creates a
small hot highlight on the glass surface rather than a soft glow.
```

#### G. 熱奶茶 ($20)
```
DISH: Surface / Angle: worn honey-brown Formica tabletop with a faded paper placemat;
elevated ~45-degree angle.
A plain white ceramic cup (classic diner style, slightly thick rim, a faint
tea-stain ring visible on the inside near the top) of hot Hong Kong milk tea,
steam visibly rising under the flat fluorescent light, rich reddish-brown
color, served on a mismatched slightly chipped saucer with a tarnished small
metal teaspoon resting beside it. A sugar packet or condensed-milk canister
sits a little carelessly in the background, softly out of focus.
```

#### H. 檸檬茶 ($20)
```
DISH: Surface / Angle: scratched brushed stainless-steel table; elevated ~45-degree
angle showing the full glass profile.
A tall glass of Hong Kong-style lemon tea (檸檬茶) in the same plain thick
clear glass style as the milk tea, amber-golden tea color (lighter and more
transparent than milk tea, no milk), 3-4 thin lemon slices floating and
pressed against the glass wall, ice cubes visible, a slightly bent straw,
condensation droplets on the glass exterior pooling on a small stained saucer.
Overhead fluorescent light gives a slightly cool-green highlight on the glass.
```

#### I. 鴛鴦 ($22)
```
DISH: Surface / Angle: red-and-cream speckled terrazzo/laminate counter; elevated
~45-degree angle.
A plain white ceramic cup of yuenyeung (鴛鴦, Hong Kong coffee-milk-tea blend),
same well-used diner cup-and-saucer style as the hot milk tea, but the liquid
looks slightly darker and more matte than pure milk tea (a coffee undertone
visible at the surface), steam rising under the flat fluorescent light, a
tarnished small metal teaspoon resting on the chipped saucer beside the cup.
```

#### J. 餐蛋治 ($28)
```
DISH: Surface / Angle: worn honey-brown Formica tabletop; near-top-down ~70-degree
angle.
A classic Hong Kong luncheon meat and fried egg sandwich (餐蛋治), white
sandwich bread lightly toasted, crusts trimmed off, cut diagonally in half and
stacked a little unevenly to show the cross-section: a thick slice of pan-fried
luncheon meat (SPAM-style, browned crispy edges) and a fried egg with a
slightly runny yolk peeking out, a thin smear of butter visible at the bread
edge. Served on a plain worn plate with a couple of thin cucumber slices pushed
to the side, catching a slightly harsh highlight from the overhead light.
```

#### K. 西多士 ($26)
```
DISH: Surface / Angle: scratched brushed stainless-steel table; elevated ~45-degree
angle.
Hong Kong-style French toast (西多士), two thick slices of white bread
sandwiched with peanut butter filling, deep-fried golden-brown and crispy on
the outside, cut diagonally into triangles and stacked a little unevenly to
show the fluffy pale interior. A generous, slightly melting pat of butter sits
on top, golden syrup or condensed milk drizzled over it and pooling messily on
the plate rather than in a neat line — the pool has already started spreading
toward the plate's chipped rim.
```

#### L. 蛋撻 ($10)
```
DISH: Surface / Angle: red-and-cream speckled terrazzo/laminate counter; near-top-down
~75-degree angle.
Three freshly-baked Hong Kong egg tarts (蛋撻) on a plain well-used plate,
golden flaky crumbly pastry shell (visible layered lamination texture at the
edges), smooth glossy pale-yellow egg custard filling with a slight
caramelized sheen, still slightly warm-looking. Arranged in a loose,
not-quite-symmetrical cluster, one tart tilted to show the flaky side wall,
a few pastry crumbs scattered naturally around them on the plate.
```

#### M. 菠蘿油 ($16)
```
DISH: Surface / Angle: worn honey-brown Formica tabletop; elevated ~45-degree angle.
A pineapple bun (菠蘿包) sliced open with a thick slab of cold butter inserted
in the middle, the butter slightly melting unevenly from the bread's warmth on
one side. The bun top shows the signature golden-brown crackled "pineapple
skin" crust texture (cookie-like crust with a grid crack pattern), soft white
bread interior visible at the sides. Set a little off-center on a plain worn
plate, a few crumbs scattered naturally around it, catching a hard fluorescent
highlight on the crust.
```

#### N. 楊枝甘露 ($32)
```
DISH: Surface / Angle: scratched brushed stainless-steel table; elevated ~45-degree
angle.
A plain glass dessert bowl (not a dinner plate) of mango pomelo sago (楊枝甘
露), thick creamy pale-orange mango puree base, visible chunks of fresh diced
mango, translucent white sago pearls, and pomelo (grapefruit) sacs scattered
unevenly on top. Chilled, with a slightly fogged/condensation-dulled glass
exterior from the cold contents, served with a small worn spoon resting
sideways in the bowl rather than perfectly placed.
```

#### O. 雲吞麵 ($38)
```
DISH: Surface / Angle: red-and-cream speckled terrazzo/laminate counter; near-top-down
~70-degree angle.
A bowl of Hong Kong wonton noodle soup (雲吞麵), thin springy egg noodles
(蛋麵) coiled somewhat loosely in a clear pork-and-dried-flounder broth, 4-5
plump shrimp wontons with visible pink shrimp through the thin wonton skin, a
few strands of yellow chives scattered on top, served in a plain worn white
bowl (not a plate), broth clear and steaming under the flat overhead light,
a spoon resting against the bowl's rim rather than laid neatly beside it.
```

#### P. 牛腩麵 ($48)
```
DISH: Surface / Angle: worn honey-brown Formica tabletop; elevated ~45-degree angle.
A bowl of Hong Kong beef brisket noodle soup (牛腩麵), thick uneven chunks of
tender stewed beef brisket (some lean, some with soft connective tissue) piled
on top of flat ho fun noodles in a rich dark brown five-spice braising broth
that has slightly stained the inside rim of the bowl, a few sprigs of scallion
and cilantro scattered on top, steam rising under the harsh fluorescent light,
a faint oily sheen pooling at the broth's surface showing slow-braised
richness rather than a styled glisten.
```

### 3. Bonus item(冇對應實際 menu item,想擴充先用)

#### 常餐(Set Breakfast: Ham & Egg Sandwich + Milk Tea + Toast)
```
DISH: Surface / Angle: scratched brushed stainless-steel table, wider tray framing;
elevated ~40-degree angle to fit multiple items.
A full "set meal" (常餐) tray shot: a ham-and-fried-egg sandwich (火腿煎蛋治)
cut diagonally in half showing the fried egg yolk and ham layer, a slice of
Hong Kong-style toast with condensed milk or kaya on a side plate, and a cup of
hot milk tea steaming beside it. Items arranged as if a busy waiter just set
the tray down — not perfectly symmetrical, plates slightly overlapping, one
plate a little closer to the frame edge than the others.
```

#### 絲襪奶茶沖茶動作(Silk-Stocking Milk Tea Pouring Action Shot)
```
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
```

### 3. 圖片規格建議

| 用途 | 比例 (Aspect Ratio) | 建議解析度 | 備註 |
|---|---|---|---|
| Menu card thumbnail(menu grid 每格) | 1:1(正方形) | 800×800 px | 方便 grid layout 唔會裁得核突;用 `next/image` 做 responsive 縮圖 |
| Dish detail page(單品詳情頁 hero image) | 4:3 | 1600×1200 px | 橫向構圖,配 overhead-45度 shot 效果最好 |
| Optional:手機 hero banner(如首頁輪播) | 16:9 | 1920×1080 px | 用揀出嚟嘅代表菜(如干炒牛河)做主頁 banner |

- 生成時直接用對應比例出圖,唔好淨係生一個尺寸再靠 CSS 硬 crop——尤其係絲襪奶茶沖茶嗰張(動作構圖),crop 錯咗會好核突。
- 每個 dish 建議生成時多出 1-2 張候選(同一 prompt 跑幾次),人手揀最靚一張先存入 DB,唔好自動用第一張。
- 檔案格式:存做 WebP(Vercel Blob 支援),畀 Next.js `<Image>` 做自動優化。

### 4. Next.js + Vercel AI Gateway + Vercel Blob 生成流程簡述

**整體流程:**

1. **建 prompt 表**:喺 codebase 度(例如 `lib/ai/image-prompts.ts`)將上面第 0/1/2 部分嘅 `STYLE_ANCHOR` + 每個 dish 嘅 prompt 建成一個 map,key 用 `menu_items.id` 或者一個穩定 slug(例如 `"set-a-beef-hofun"`),方便日後 re-generate 個別相唔使成套重生。

2. **建一個 admin-only 後台工具/script**(唔係俾客人用,係俾老闆/職員喺後台管理頁按掣生圖,或者你本機跑一次過 seed script):
   - 用 **Vercel AI Gateway** 嘅 image generation model(例如透過 AI SDK 嘅 `experimental_generateImage` / `generateImage`,或者直接叫 Gateway 嘅 image endpoint,模型可揀 Gateway 上有嘅圖片生成 provider,例如 `openai/gpt-image-1` 或 Gateway 支援嘅其他圖片模型——實際模型名以 implementation 嗰邊喺 Gateway dashboard 睇到嘅為準,唔鎖死單一 model id,見〈編輯註記〉第5點)。
   - 因為係用 Gateway,唔使自己另外攞 OpenAI/其他 provider 嘅 API key,用返 project 已經有嘅 `AI_GATEWAY_API_KEY`(或 Vercel 自動注入嘅 OIDC token)就得。

3. **生成 → 存 Blob → 存 DB 嘅步驟**:
   ```
   for each dish in image-prompts map:
     1. fullPrompt = STYLE_ANCHOR + dish.prompt + NEGATIVE_PROMPT
     2. imageBuffer = await gateway.generateImage({ model, prompt: fullPrompt, size/aspectRatio })
     3. blobResult = await put(`menu-images/${dish.slug}.webp`, imageBuffer, { access: 'public' })
        // 用 @vercel/blob 嘅 put(),access: 'public' 因為餐牌相係公開俾客人睇
     4. UPDATE menu_items SET image_url = blobResult.url, image_prompt = fullPrompt
        WHERE id = dish.id
        (或者 restaurant_id + slug 做 upsert,配合 schema 度預留嘅 multi-tenant 欄位)
   ```

4. **執行方式建議**:
   - 唔好放喺客人落單嗰條 request path 度即時生圖(太慢、太貴、唔穩定)。
   - 應該做成一個一次性 **seed/admin script**(例如 `scripts/generate-menu-images.ts`,用 `tsx` 喺本機或者 CI 跑一次),或者掛喺後台管理頁一個「重新生成呢道菜張相」嘅按鈕,人手觸發,生完之後人手睇下靚唔靚先撳「用呢張」。
   - 生成完畢嘅 URL 存喺 `menu_items.image_url`(`text` 或 `varchar`),前端 menu list / detail page 直接用呢個 Blob public URL 畀 `next/image` render,配合 Blob CDN 做 cache,正常客人落單流程完全唔會觸發生圖。

5. **Schema 對應提醒**:`menu_items` 表除咗 `image_url`,已經喺〈二、技術架構〉§3 加咗 `image_prompt`(存返生呢張相用嘅完整 prompt 文字),方便日後想換相或者微調風格時可以追溯返原本用過乜嘢 prompt,唔使靠人腦記。

---

## 五、V1 開發 Checklist

> 呢個 checklist 直接對應上面四個章節嘅規格,俾 implementation workflow 分配畀唔同 agent 平行/順序執行。每個 milestone 內部任務盡量獨立可完成,跨 milestone 有依賴關係嘅已喺任務描述講明。

### M0 — 專案基礎與設計系統(Project & Design System Bootstrap)

- [ ] 建立 Next.js App Router 專案(`create-next-app`,TypeScript、Tailwind、ESLint),取代原本 `app.py`
- [ ] 刪除 V0 殘留嘅 `vercel.json`、`requirements.txt`、`templates/`、`static/`(保留 `Make_Order.py` / `Make_Order_Final.py` 做歷史文件,唔搬入新 app,理由見〈二、技術架構〉§9.1)
- [ ] 建立 `vercel.ts` 取代 `vercel.json`(內容見〈二、技術架構〉§8.2),設定 framework/build/install command、legacy redirect、cache headers、cron
- [ ] 初始化 shadcn/ui,加入所需 components(Button、Card、Sheet、Badge、Dialog、Tabs、Toast 等)
- [ ] 在 `app/globals.css` / `tailwind.config` 寫入〈三、UI/美術方向〉§2.1 全部色板 CSS variables(含 dark mode block)
- [ ] 用 `next/font` 載入四款字體:LXGW WenKai TC、Noto Sans HK、Alfa Slab One、Space Grotesk,設定對應 Tailwind font family token
- [ ] 建立 `lib/copy/tone.ts`:集中管理所有市井文案常量(按鈕、空狀態、確認/錯誤訊息,內容照抄〈三、UI/美術方向〉§4 全部表格)
- [ ] Vercel 專案 `vercel link` + `vercel env pull .env.local`,確認 Supabase Postgres、Blob 已經透過 Marketplace provision

### M1 — Setup Next.js + DB Schema

- [ ] 安裝 Drizzle:`drizzle-orm`、`drizzle-kit`、`postgres`
- [ ] 寫 `lib/db/schema.ts`:對應〈二、技術架構〉§3 全部 9 張表 + 4 個 enum(**記得包括整合企劃書時新增嘅欄位**:`restaurants.service_charge_enabled/percent`、`restaurants.min_spend_amount`、`menu_items.image_prompt`)
- [ ] 寫 `lib/db/index.ts` 用懶初始化 `getDb()` pattern(唔用 Proxy)
- [ ] 用 `drizzle-kit generate` 產生 migration SQL,run 落 Supabase
- [ ] 寫 `lib/tenant.ts` 嘅 `getCurrentRestaurantId()`(V1 讀 `DEFAULT_RESTAURANT_ID` env)
- [ ] 寫 `drizzle/seed.ts`:insert 一行 `restaurants`、5 個經典餐(A-E,價錢見附錄,**注意 C 餐正確名稱係「揚州炒飯」唔係「陽州炒飯」**)+ 對應 `item_options`(跟套餐+$10、凍飲+$6、熱飲+$3、走青/走冰等走料 modifier)
- [ ] Run seed,確認 DB 內容同 V0 一致
- [ ] 所有 `lib/db/queries/*.ts` helper function 簽名第一個參數強制要求 `restaurantId`(為 V2 多租戶鋪路)

### M2 — 客人落單流程

- [ ] `app/(customer)/layout.tsx`:客人前台 layout(sticky header、字體/色板套用)
- [ ] `app/(customer)/order/page.tsx`:Server Component 讀 menu(`getMenuItems(restaurantId)`),版面跟〈三、UI/美術方向〉§5.1(單欄卡片 list、橫向分類 chip)
- [ ] `components/menu/menu-item-card.tsx`:菜式卡片(相片4:3/1:1、slab 字體價錢、熱賣/老闆推介/賣晒 badge)
- [ ] Modifier bottom sheet(走青/走冰/套餐飲品等 chip 選擇 + 數量 stepper),資料嚟自 `item_options`
- [ ] `components/cart/cart-store.ts`:zustand 購物車 state(純前端)
- [ ] `components/cart/cart-drawer.tsx` + sticky bottom bar(已叫幾樣、總金額)
- [ ] 落單確認頁(order summary,列品項+枱號輸入+大CTA「落單」),如 restaurant 有最低消費要顯示提示
- [ ] `lib/actions/order.ts` 嘅 `createOrder` Server Action:伺服器重新用 DB 現價計算(唔信任前端價錢)、讀 `restaurant.min_spend_amount`/`service_charge_*` 計算 subtotal→total、產生 `guest_token` 寫 httpOnly cookie、transaction insert orders/order_items/order_item_options、insert `order_status_history`(from=null,to=pending)、`revalidatePath('/admin/orders')`
- [ ] `app/(customer)/order/[orderId]/page.tsx`:落單確認 + 狀態顯示(用 `guest_token` cookie 驗證屬於自己張單)
- [ ] `app/api/orders/[id]/status/route.ts`:GET route 俾客人端輪詢(4-5秒),回傳 `{status, updatedAt}`
- [ ] 客人端狀態 stepper UI:新落單/落緊鑊/得咗/派咗(4 段顯示,內部對應 6-state DB model,mapping 見〈編輯註記〉第2點)
- [ ] 套用 `lib/copy/tone.ts` 全部客人向文案(落單成功、空狀態、錯誤提示)

### M3 — 職員/老闆後台

- [ ] 安裝設定 Auth.js v5,`lib/auth.ts` Credentials provider + bcrypt
- [ ] `middleware.ts` 保護 `/admin/**`、`/api/admin/**`
- [ ] `app/(auth)/login/page.tsx` 職員登入頁
- [ ] `app/admin/layout.tsx` + sidebar(落單/餐牌/報表/設定)
- [ ] `app/admin/orders/page.tsx`:Kanban 廚房顯示屏(4欄:新單/落緊鑊/得咗/已完成,`落緊鑊` 欄合併 `confirmed`+`preparing` 兩個狀態,見〈編輯註記〉第2點),用顏色標示等待時間(<5min綠/5-10min黃/>10min紅)
- [ ] `app/api/admin/orders/route.ts`:GET route 俾後台輪詢(3-5秒)
- [ ] `lib/actions/staff-orders.ts`:`updateOrderStatus`(含 `ALLOWED_TRANSITIONS` 狀態機檢查 + 寫 `order_status_history`)、`markOrderPaid`(mock 結賬,含 payment_status guard:轉 completed 前必須 mock_paid)
- [ ] `app/admin/menu/page.tsx`:menu 列表 + 有貨/賣晒 toggle(`toggleAvailability` Server Action)
- [ ] `app/admin/menu/[itemId]/edit/page.tsx`:編輯品項表單(`lib/actions/menu.ts` CRUD:分類/品項/加料選項)
- [ ] Restaurant 設定 UI(`app/admin` 設定頁):加一服務費開關+百分比、最低消費金額(`updateRestaurantSettings` Server Action,對應〈編輯註記〉第3點新增嘅 schema 欄位)
- [ ] `app/admin/reports/page.tsx`:銷售報表(今日單數/營業額/熱賣Top3 stat cards)
- [ ] 職員後台 dark mode(廚房/夜更)套用〈三、UI/美術方向〉§2.1 dark block
- [ ] `requireStaffRole(['admin'])` guard 用喺 menu 編輯類 Server Action(唔淨係靠 middleware)

### M4 — AI 生圖整合

- [ ] `lib/ai/menu-image-prompt.ts`:實作 STYLE_ANCHOR + NEGATIVE_PROMPT + dish-specific prompt builder(內容照抄〈四、AI 圖片生成 Prompt 套件〉§0/1/2)
- [ ] 建 `lib/ai/image-prompts.ts` prompt map(key = menu_items.id 或穩定 slug)
- [ ] `app/api/admin/menu-items/[id]/generate-image/route.ts`:POST route,`requireStaffRole(['admin'])` guard,用 AI SDK 正確嘅 image generation API(`experimental_generateImage`/`generateImage`,**唔係 `generateText`**——見〈編輯註記〉第4點)叫 AI Gateway
- [ ] 生成結果用 `@vercel/blob` 嘅 `put()` 上傳(`menu-images/{slug}.webp`,`access:'public'`),update `menu_items.image_url` 同 `image_prompt`
- [ ] 老闆後台每個品項加「重新生成相片」按鈕 + loading spinner(吊扇轉動 icon,〈三、UI/美術方向〉§1.1 建議)
- [ ] 一次性 seed script `scripts/generate-menu-images.ts`(`tsx` 本機跑),為 5 個經典餐 + 建議擴充嘅 6 個經典 item(凍/熱奶茶、蛋撻、菠蘿油、楊枝甘露、常餐)一次過生圖
- [ ] 每個 dish 生成時要求對應長寬比(1:1 thumbnail / 4:3 detail),唔靠 CSS crop
- [ ] 圖片用 `next/image` render,加 5-10% sepia overlay 令 AI 相同真實相片睇落統一

### M5 — 部署上 cctmenu.isaaccheng.xyz

- [ ] 確認 `cctmenu.isaaccheng.xyz` domain 保留喺同一個 Vercel project(唔使重新設定 DNS)
- [ ] 刪走舊 `vercel.json`,確認新 `vercel.ts` 生效
- [ ] 設定必要 env vars:`DATABASE_URL`(Supabase 自動注入)、`AUTH_SECRET`(`npx auth secret`)、`DEFAULT_RESTAURANT_ID`(seed 出嚟嗰行 restaurants.id)、`BLOB_READ_WRITE_TOKEN`(自動注入)
- [ ] 建立 `app/api/cron/cleanup-stale-orders/route.ts`:實作業務規則(pending 超過15分鐘未確認自動轉 cancelled,對應商業計劃 §7 風險緩解)
- [ ] `vercel.ts` 內 crons 設定(`0 4 * * *` 或按需要調整頻率)
- [ ] Preview deployment 全流程手動測試:客人落單 → 職員接單 → 出單 → mock 埋單 → completed
- [ ] Production deploy,確認 custom domain HTTPS 正常
- [ ] 建立第一個真實 `restaurants` row + 職員帳號(老闆本人),對應 GTM Phase 0「自己友試單」

### M6 — QA、風險緩解與上線前檢查

- [ ] Guest order 邊界測試:cookie 過期、枱號亂填、guest_token 唔相符時查單應 403
- [ ] 尖峰時段模擬(同時多張單)測試 optimistic UI + polling 唔會爆
- [ ] 全部客人向/職員向文案過一次 tone.ts checklist,確保符合〈三、UI/美術方向〉§4 節制原則(唔可以句句加語氣詞,付款/法律相關文字要正常書面語)
- [ ] 老闆做 15 分鐘教學 walkthrough(對應商業計劃 GTM 落地式教班)
- [ ] 保留紙牌落單 SOP 文件(對應風險緩解:系統/網絡不穩定時後備方案)