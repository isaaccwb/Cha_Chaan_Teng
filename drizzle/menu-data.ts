/**
 * 完整餐牌資料 —— 由 `drizzle/seed.ts`(全新環境 bootstrap)同
 * `scripts/backfill-menu.ts`(幫已經 seed 咗嘅環境補新分類/品項)共用,
 * 避免兩邊分開手抄一份、日後改壞唔同步。
 *
 * 2026-08-27 由淨得 1 個分類 5 個品項(全部炒飯/炒麵)擴充做 5 個分類
 * 16 個品項 —— 之前個版本 demo 出嚟唔似真.茶記(冇飲品、冇三文治多士、
 * 冇小食甜品),見 RUN-BOOK.md / Obsidian 「Demo 現況」記錄。
 *
 * 每個品項嘅 `code` 對應 `lib/ai/generate-menu-image.ts` 嘅
 * `MENU_CODE_TO_IMAGE_SLUG`,揾到就用 `lib/ai/image-prompts.ts` 嗰邊
 * 已經寫好嘅專屬 AI 生圖 prompt,唔使淨係靠 description fallback。
 */
import type { optionGroupEnum } from "@/lib/db/schema";

export type SeedItemOption = {
  groupName: (typeof optionGroupEnum.enumValues)[number];
  name: string;
  priceDelta: string;
};

export type SeedItem = {
  code: string;
  name: string;
  description: string;
  price: string;
  options?: SeedItemOption[];
};

export type SeedCategory = {
  name: string;
  items: SeedItem[];
};

const COMBO_DRINK_OPTIONS: SeedItemOption[] = [
  { groupName: "套餐飲品", name: "跟套餐(+$10)", priceDelta: "10.00" },
  { groupName: "套餐飲品", name: "凍飲(+$6)", priceDelta: "6.00" },
  { groupName: "套餐飲品", name: "熱飲(+$3)", priceDelta: "3.00" },
  { groupName: "走料", name: "走青", priceDelta: "0.00" },
];

const COLD_DRINK_OPTIONS: SeedItemOption[] = [
  { groupName: "走料", name: "走冰", priceDelta: "0.00" },
  { groupName: "走料", name: "少甜", priceDelta: "0.00" },
];

const HOT_DRINK_OPTIONS: SeedItemOption[] = [
  { groupName: "走料", name: "少甜", priceDelta: "0.00" },
];

export const MENU: SeedCategory[] = [
  {
    name: "常餐/套餐",
    items: [
      {
        code: "A",
        name: "干炒牛河",
        description: "鑊氣十足,乾身唔油膩",
        price: "65.00",
        options: COMBO_DRINK_OPTIONS,
      },
      {
        code: "B",
        name: "星洲炒米",
        description: "咖喱香,微辣惹味",
        price: "60.00",
        options: COMBO_DRINK_OPTIONS,
      },
      {
        code: "C",
        name: "揚州炒飯",
        description: "粒粒分明,叉燒蝦仁樣樣齊",
        price: "68.00",
        options: COMBO_DRINK_OPTIONS,
      },
      {
        code: "D",
        name: "銀芽炒米粉",
        description: "清爽少油,銀芽夠爽脆",
        price: "55.00",
        options: COMBO_DRINK_OPTIONS,
      },
      {
        code: "E",
        name: "蝦仁炒飯",
        description: "蝦仁飽滿,鑊氣夠香",
        price: "70.00",
        options: COMBO_DRINK_OPTIONS,
      },
    ],
  },
  {
    name: "飲品",
    items: [
      {
        code: "F",
        name: "凍奶茶",
        description: "絲襪奶茶,茶味夠濃唔會薄",
        price: "22.00",
        options: COLD_DRINK_OPTIONS,
      },
      {
        code: "G",
        name: "熱奶茶",
        description: "凍飲同價,傳統茶記例牌",
        price: "20.00",
        options: HOT_DRINK_OPTIONS,
      },
      {
        code: "H",
        name: "檸檬茶",
        description: "鮮檸檬,消滯解膩",
        price: "20.00",
        options: COLD_DRINK_OPTIONS,
      },
      {
        code: "I",
        name: "鴛鴦",
        description: "咖啡加奶茶,一杯搞掂",
        price: "22.00",
        options: HOT_DRINK_OPTIONS,
      },
    ],
  },
  {
    name: "三文治/多士",
    items: [
      {
        code: "J",
        name: "餐蛋治",
        description: "餐肉煎蛋,茶記早餐例牌",
        price: "28.00",
        options: [
          { groupName: "加料", name: "加蛋(+$3)", priceDelta: "3.00" },
          { groupName: "走料", name: "走青瓜", priceDelta: "0.00" },
        ],
      },
      {
        code: "K",
        name: "西多士",
        description: "花生醬夾脆多士,煉奶淋面",
        price: "26.00",
        options: [
          { groupName: "加料", name: "加煉奶(+$3)", priceDelta: "3.00" },
          { groupName: "走料", name: "走牛油", priceDelta: "0.00" },
        ],
      },
    ],
  },
  {
    name: "小食/甜品",
    items: [
      {
        code: "L",
        name: "蛋撻",
        description: "酥皮蛋撻,啱啱出爐",
        price: "10.00",
      },
      {
        code: "M",
        name: "菠蘿油",
        description: "菠蘿包夾厚切冷凍牛油",
        price: "16.00",
        options: [{ groupName: "加料", name: "加牛油(+$3)", priceDelta: "3.00" }],
      },
      {
        code: "N",
        name: "楊枝甘露",
        description: "芒果西米,清甜冰涼",
        price: "32.00",
      },
    ],
  },
  {
    name: "湯麵",
    items: [
      {
        code: "O",
        name: "雲吞麵",
        description: "鮮蝦雲吞,幼蛋麵彈牙",
        price: "38.00",
        options: [
          { groupName: "走料", name: "走蔥", priceDelta: "0.00" },
          { groupName: "加料", name: "加底(+$5)", priceDelta: "5.00" },
        ],
      },
      {
        code: "P",
        name: "牛腩麵",
        description: "原塊炆牛腩,湯底夠火喉",
        price: "48.00",
        options: [
          { groupName: "走料", name: "走青", priceDelta: "0.00" },
          { groupName: "加料", name: "加底(+$5)", priceDelta: "5.00" },
        ],
      },
    ],
  },
];
