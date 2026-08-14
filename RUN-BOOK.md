# RUN-BOOK — 由呢度落地 V1

呢份文件係俾你(唔係俾 AI)喺你自己部有網絡嘅機度,一步步跑起呢個 V1 嘅。
成套 Next.js 原始碼已經寫晒喺呢個 repo(`v1-nextjs-rewrite` 分支),但**呢個
開發 sandbox 冇網絡權限**,所以以下所有涉及 npm/git/vercel 嘅指令都未跑過、
未測過 —— 你要跟住做先可以真正驗證得唔得。企劃書見 `docs/PROJECT_PLAN.md`。

## 0. 分支狀態

```
main                 — V0(原本個 Flask app)嘅快照,冇郁過
v1-nextjs-rewrite    — 你而家身處呢個分支,V1 全部新 code 都喺度
```

Push 之前記得諗清楚想點合併(直接 fast-forward main,定係開 PR review 一次)。

## 1. 首先要驗證嘅風險位(⚠️ 建議第一步就試,唔好留到最後)

`lib/actions/order.ts`(客人落單)同 `lib/actions/staff-orders.ts`(職員改單)
入面用到 `drizzle-orm/neon-http` 嘅 `db.transaction()` / 循序 insert。**呢個
driver 對「插入一row、攞返佢個 id、用嚟插第二個表」呢種寫法嘅支援程度,喺
冇連得到真 DB 嘅呢個 sandbox 入面冇辦法驗證過。**

驗證方法:跑完第 4-5 步(migrate + seed)之後,即刻用網頁落一張真單
(`/order` 頁揀嘢加落單 → 落單),睇吓:
- 個 order 同佢啲 order_items/order_item_options 係咪都真係插咗落 DB(用
  `npm run db:studio` 開 Drizzle Studio 睇)
- 落單流程有冇 throw error / 500

如果 `createOrder` 嗰步報錯或者資料插漏咗,最大機會就係 `db.transaction()`
喺 neon-http 度嘅行為同預期唔一致 —— fallback 做法係拆做唔用
`db.transaction()` 包住嘅循序 `await` insert(犧牲返少少原子性,但對應
PROJECT_PLAN §7 風險緩解嘅精神:V1 呢個 mock-payment prototype 唔追求
嚴格 atomic rollback)。

## 2. Prerequisites

```bash
node -v   # 建議 Node 20+
npm i -g vercel
vercel --version
```

## 3. 裝 dependencies

```bash
cd /Users/isaaccheng/Documents/Claude/Projects/Cha_Chaan_Teng-main
git checkout v1-nextjs-rewrite   # 應該已經喺呢個分支
npm install
```

`package.json` 入面啲 dependency 版本(Next 15、React 19、Drizzle 0.38、
NextAuth 5 beta 等)係手寫嘅合理估算,**未實際 `npm install` 過**,如果有
version 衝突,跟 npm 報嘅錯處理(通常係某個 peer dependency 想要更新/更舊
版本,`npm install` 個錯誤訊息會講得幾清楚)。

## 4. 連 Vercel project + provision DB/Blob

```bash
vercel link          # 連返去現有嗰個 project(cctmenu.isaaccheng.xyz 掛喺嗰個)
vercel env pull .env.local
```

如果個 project 重未有 Neon Postgres / Blob:

```bash
vercel integration add neon      # Vercel Marketplace provision Neon Postgres
vercel integration add blob      # 或者 Vercel dashboard → Storage → Create Blob store
vercel env pull .env.local       # provision 完再 pull 多次,攞返 DATABASE_URL / BLOB_READ_WRITE_TOKEN
```

再生成 Auth secret:

```bash
npx auth secret     # 會自動幫你寫入 .env.local 嘅 AUTH_SECRET(冇嘅話手動加)
```

`.env.local` 呢時應該有 `DATABASE_URL` + `BLOB_READ_WRITE_TOKEN` + `AUTH_SECRET`。
`DEFAULT_RESTAURANT_ID` 要等第 5 步 seed 完先有得填,先留空。

## 5. DB migration + seed

```bash
npm run db:generate   # drizzle-kit 由 lib/db/schema.ts 產生 migration SQL
npm run db:migrate    # 落去 Neon
npm run db:seed       # 插入 5 個經典餐 + admin 帳號,終端機會印低 restaurant.id
```

將終端機印出嚟嘅 `DEFAULT_RESTAURANT_ID=...` 填入 `.env.local`,同時去 Vercel
dashboard → Project → Settings → Environment Variables 都設定埋(deploy 要用)。

Seed 出嚟嘅 admin 帳號(**第一次登入即刻改密碼**):

```
電郵:boss@cctmenu.hk
密碼:ChangeMe123!
```

## 6. 本機跑起

```bash
npm run dev
```

跑得起嘅話開:
- http://localhost:3000/order —— 客人落單頁
- http://localhost:3000/login —— 職員登入(用返上面個 admin 帳號)
- http://localhost:3000/admin/orders —— 廚房 Kanban

## 7.(可選)AI 生成餐牌相

先去 Vercel Dashboard → AI Gateway,確認實際有邊個 image generation model
可用,對比 `lib/ai/generate-menu-image.ts` 頂部嘅 `IMAGE_MODEL` const
(而家寫死咗 `google/gemini-2.5-flash-image` 做預設估算,唔啱就改嗰一行)。

```bash
npm run images:generate    # 一次過幫 5 個經典餐生圖(seed 咗嘅 item)
```

或者登入後台 → 餐牌 → 揀個品項 → 「重新生成 AI 相片」逐張生。

## 8. Deploy

```bash
npm run build       # 本機先確認 build 得過(呢步喺呢個 sandbox 一定冇跑過)
vercel deploy        # preview
vercel deploy --prod # 確認 preview 冇問題先落 prod,custom domain 會自動跟返 project
```

## 9. Push 去 GitHub

```bash
git push -u origin main                # V0 快照
git push -u origin v1-nextjs-rewrite   # V1 rewrite,建議開 PR 畀自己 review 一次
```

## 10. 已知未實現 / 建議跟進(唔阻住上線,但要知)

- **`app/admin/menu/page.tsx` 冇分類/加料選項嘅新增 UI 入口確認**(職員後台
  agent 冇喺回報講清楚 —— 上線前自己click 一次成個 menu 管理流程,確認建
  分類/建品項/加走料選項嘅表單都齊全)
- **冇「職員改自己密碼」功能** —— admin 帳號密碼而家淨係喺 seed 嗰陣設定一次,
  想改要直接落 DB update `staff_users.password_hash`(用 bcrypt hash),或者
  之後加返一個「改密碼」頁
- **`components/ui/input.tsx` / `select.tsx` 未抽做共用 primitive** —— 職員
  後台表單而家用緊手寫嘅原生 input/select(有跟色板),日後如果要再加表單,
  值得抽出嚟做返 shared component
- **`lucide-react` 嘅 `Fan` icon 名有冇冇跟版本改咗** —— `npm install` 完
  第一次 `npm run build` 順便肉眼確認吓 admin 生圖按鈕嗰粒 icon 有冇 build 錯
- **LXGW WenKai TC 字體**用 `<link>` 叫 Google Fonts CSS2 API(見
  `app/layout.tsx`),冇網絡驗證過個 font family 名同 Google Fonts 個 catalog
  完全一致 —— 本機跑得起嗰陣留意吓標題字得唔得手寫楷書感,唔係就换個字體名
  再試
- **`/order-old` redirect**(`vercel.ts`)純粹係對應 V0 舊 path 嘅友善轉址,
  V0 冇呢條 path 都冇所謂,冇用可以刪走

## 11. 之後點揾我(Claude)跟進

跑完呢份 RUN-BOOK 之後,將遇到嘅 build/runtime 錯誤原文貼返俾我,我可以喺
呢個 sandbox 直接改 code(淨係唔可以幫你跑 `npm`/`vercel`/`git push` 呢類
要網絡嘅指令)。
