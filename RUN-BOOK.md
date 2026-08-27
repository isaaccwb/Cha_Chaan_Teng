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

> ✅ **已實測驗證(2026-08-27)**:sandbox 依家原來有網絡,喺
> `vercel deploy` 出嚟嘅 preview URL 用瀏覽器真係落咗一張單(枱號
> 7、干炒牛河 ×1),跳到 `/order/[orderId]` 訂單追蹤頁顯示「訂單編號
> #7」;再直接用 `postgres-js` connect 返 pooled `DATABASE_URL` 查 DB,
> 確認 `orders`(`table_number: '7', status: 'pending', total: '65.00'`)
> 同 `order_items`(`item_name_snapshot: '干炒牛河', line_total: '65.00'`)
> 都真係插咗落去,`db.transaction()` + pgbouncer transaction mode 冇報錯。
> 下面呢段風險分析背景保留,但驗證結論已經係「得」。

DB driver 而家用緊 **Supabase Postgres + `drizzle-orm/postgres-js`**(標準
TCP session-based driver,唔係之前 evaluate 過但已經放棄嘅 Neon
`neon-http`)。`lib/actions/order.ts`(客人落單)同
`lib/actions/staff-orders.ts`(職員改單)入面用嘅 `db.transaction()` 有真正
driver 支援,理論上風險已經細好多。

如果你用 **Supabase 嘅 pooled connection string**(dashboard 度個 "Transaction"
mode,通常 port 6543),留意 `lib/db/index.ts` 已經加咗 `{ prepare: false }`
—— pgbouncer transaction mode 唔支援 prepared statement,冇呢個 flag 會報錯。
如果用返 "Session" mode 個直連 connection string(port 5432)就冇呢個限制。

驗證方法:跑完第 4-5 步(migrate + seed)之後,即刻用網頁落一張真單
(`/order` 頁揀嘢加落單 → 落單),睇吓:
- 個 order 同佢啲 order_items/order_item_options 係咪都真係插咗落 DB(用
  `npm run db:studio` 開 Drizzle Studio 睇,或者直接開 Supabase dashboard →
  Table Editor)
- 落單流程有冇 throw error / 500

如果 `createOrder` 嗰步報錯,睇清楚錯誤訊息係咪同 connection string 個 mode
(pooled vs session)有關;如果唔係,fallback 做法先至係拆做唔用
`db.transaction()` 包住嘅循序 `await` insert。

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

如果個 project 重未有 Supabase Postgres / Blob:

```bash
vercel integration add supabase  # Vercel Marketplace provision Supabase Postgres
vercel integration add blob      # 或者 Vercel dashboard → Storage → Create Blob store
vercel env pull .env.local       # provision 完再 pull 多次,攞返 DATABASE_URL / BLOB_READ_WRITE_TOKEN
```

`vercel integration add supabase` 中途可能會轉去 browser 做 Supabase 帳號
連結(呢種叫 "connectable" integration,CLI 揸唔到成個流程),跟住個 browser
步驟做完再返嚟落下一句指令。Provision 完之後去 Supabase dashboard →
Project Settings → Database,揀 **Transaction pooler**(port 6543)個
connection string 做 `DATABASE_URL`(Vercel Functions 用 pooled connection
啱啲,唔使自己管 connection 數量上限)。

再生成 Auth secret:

```bash
npx auth secret     # 會自動幫你寫入 .env.local 嘅 AUTH_SECRET(冇嘅話手動加)
```

`.env.local` 呢時應該有 `DATABASE_URL` + `BLOB_READ_WRITE_TOKEN` + `AUTH_SECRET`。
`DEFAULT_RESTAURANT_ID` 要等第 5 步 seed 完先有得填,先留空。

## 5. DB migration + seed

```bash
npm run db:generate   # drizzle-kit 由 lib/db/schema.ts 產生 migration SQL
npm run db:migrate    # 落去 Supabase
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

> ✅ **已完成(2026-08-27)**:sandbox 依家有網絡 + `vercel` CLI 已經用
> `isaaccwb` 身份登入,`vercel deploy` → `vercel deploy --prod` 兩步都喺
> 呢個 session 直接跑咗。`cctmenu.isaaccheng.xyz` 已經由舊 V0 Flask app
> (`dpl_...`,797 日前部署)切咗去 V1 Next.js(`dpl_DHrXBU2gnvhdK5gcMeVjoXFSHcEc`),
> curl 確認 `/` 同 `/order` 都 200 同顯示正確內容。**記得盡快登入
> `boss@cctmenu.hk`(seed 密碼 `ChangeMe123!`)去 `/admin/settings` 改
> 密碼**——而家有真人客戶會摷到呢個 domain。

## 9. Push 去 GitHub

```bash
git push -u origin main                # V0 快照
git push -u origin v1-nextjs-rewrite   # V1 rewrite,建議開 PR 畀自己 review 一次
```

## 10. 已知未實現 / 建議跟進(唔阻住上線,但要知)

- ~~BLOB_READ_WRITE_TOKEN 未 provision~~ —— 已用 `vercel blob create-store`
  開好 `cctmenu-blob`(public access),連咗去 project,Production/Preview/
  Development 三邊都注入咗(2026-08-24)
- ~~`app/admin/menu/page.tsx` 冇分類/加料選項嘅新增 UI 入口確認~~ ——
  已核實:建分類、建品項(`/admin/menu`)、加走料選項(`/admin/menu/[itemId]/edit`)
  三個表單都齊全,`npm run build` 已通過(2026-08-26)
- ~~冇「職員改自己密碼」功能~~ —— 已加 `lib/actions/staff.ts` 嘅
  `changeOwnPassword`(用 `auth()` 攞返而家登入緊嗰個人,驗返舊密碼先准改,
  唔靠傳 id 過嚟以免改到第二個人)+ `components/admin/change-password-form.tsx`,
  掛咗喺 `/admin/settings` 度,admin/staff 兩種角色都見得到(2026-08-26)
- ~~`components/ui/input.tsx` / `select.tsx` 未抽做共用 primitive~~ ——
  已抽出嚟,原本四處手寫同一串 class name 嘅地方(`admin/menu` 兩頁、
  `login` 頁、`restaurant-settings-form.tsx`)都改用返呢兩個 primitive(2026-08-26)
- ~~`lucide-react` 嘅 `Fan` icon 名有冇跟版本改咗~~ —— `npm run build` 已通過,
  icon 冇 build 錯(2026-08-26)
- ~~LXGW WenKai TC 字體~~ —— 已用 `curl` 叫過 Google Fonts CSS2 API,
  `font-family: 'LXGW WenKai TC'` 同 `app/layout.tsx` 寫嘅名完全一致,
  有真正回到 `.ttf` 檔案(2026-08-26)
- **`/order-old` redirect**(`vercel.ts`)純粹係對應 V0 舊 path 嘅友善轉址,
  V0 冇呢條 path 都冇所謂,冇用可以刪走 —— 留低唔郁(未見有壞處)
- ~~`npm run lint` 冇 `eslint.config.js`,ESLint v9 一行都跑唔到~~ ——
  已加 `eslint.config.mjs`(用 `FlatCompat` 包 `eslint-config-next`,
  跟 Next.js 官方 scaffold 寫法),順手修埋跑出嚟嘅 2 個 finding:
  `next-env.d.ts`(自動生成、明文話唔好手動改嗰隻)加入 ignore 清單;
  `app/layout.tsx` 個 `@next/next/no-page-custom-font` warning 係 rule
  唔識 App Router 嘅 false positive,加咗 `eslint-disable-next-line` +
  註解解釋。`npm run lint` 同 `npm run build`(`rm -rf .next` 之後乾淨
  跑過)而家都通晒(2026-08-27)

## 11. 之後點揾我(Claude)跟進

跑完呢份 RUN-BOOK 之後,將遇到嘅 build/runtime 錯誤原文貼返俾我,我可以喺
呢個 sandbox 直接改 code(淨係唔可以幫你跑 `npm`/`vercel`/`git push` 呢類
要網絡嘅指令)。
