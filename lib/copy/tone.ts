/**
 * 「澳牛式」文案集中管理
 *
 * 對應 docs/PROJECT_PLAN.md 〈三、UI/美術方向 §4 Voice & Tone 文案語氣指南〉。
 *
 * 呢個檔案係成個 app「唔死板」嗰個靈魂嘅其中一半(另一半係
 * lib/ai/menu-image-prompt.ts 嘅畫風),所有客人向/職員向文案要集中
 * 喺呢度,唔好散落晒喺 component 度變成無法維護。
 *
 * 節制原則(§4 尾段):唔好每句都加語氣詞,主要 CTA 同確認/錯誤 3-4 個
 * 關鍵時刻用足呢種語氣就夠;表單標籤、法律/條款、付款相關文字要轉返
 * 正常書面語,唔可以開玩笑。完全唔用粗口字(連諧音都唔好)。
 */

export const buttonCopy = {
  viewMenu: "睇餐牌落單",
  addToOrder: "嚟多樣!",
  confirmOrder: "落單啦",
  viewCart: "睇返張單",
  reorderSame: "照舊嚟多份",
  cancel: "唔要喇",
  backToMenu: "返轉頭揀多樣",
  callStaff: "唔該埋單",
  submitOrder: "照單!",
} as const;

export const emptyStateCopy = {
  emptyCart: "個底重未夠喎,快啲揀嘢先啦",
  emptyCategory: "呢頁重未開飯,睇吓第樣先",
  noOrdersToday: "今日重靜英英,未有客到",
  searchNoResult: "揾唔到喎,係咪打錯字?定係我哋未有呢味",
} as const;

export const orderStatusCopy = {
  // 前台顯示 4 段簡化 label,DB 內部仍然係完整 6-state 狀態機
  // (見 docs/PROJECT_PLAN.md〈編輯註記〉第2點 mapping)
  pending: { label: "新落單", detail: "新單啱啱到" },
  confirmed: { label: "落緊鑊", detail: "師傅手起刀落緊" },
  preparing: { label: "落緊鑊", detail: "師傅手起刀落緊" },
  ready: { label: "得咗", detail: "得咗!唔該去攞" },
  completed: { label: "派咗", detail: "食得喇,慢用" },
  cancelled: { label: "已取消", detail: "呢張單取消咗" },
} as const;

export const confirmationCopy = {
  orderPlaced: "單已落咗,師傅落緊鑊,唔該坐定定等埋佢!",
  wantMore: "食緊食緊,想加多樣?照撳落單掣",
  cancelConfirm: "真係唔要?走寶㗎",
} as const;

export const errorCopy = {
  networkError: "個伙記瞌咗眼,唔該等等再撳過",
  orderFailed: "單好似跌咗落地,唔該再嚟一次",
  soldOut: "呢味賣晒喇,換樣先啦",
  missingTableNumber: "枱號都未講,坐咗喺邊度呀大佬",
  slowKitchen: "廚房好忙,唔該等多陣",
  belowMinSpend: "未夠最低消費喎,加多樣先啦",
  rateLimited: "咦,啱啱先落過單,等陣先啦",
  // error.tsx boundary 專用(Server Component 拋錯/連線唔穩嗰種意外),
  // 唔好將 error.message 顯示畀客人睇,以下係統一嘅友善版文案。
  boundaryTitle: "唔好意思,好似有啲問題",
  boundaryDetail: "個系統好似食滯咗,唔該撳「重新整理」再試多次",
  boundaryDetailStaff: "頁面出咗啲問題,撳「重新整理」睇吓得唔得",
} as const;

export const miscCopy = {
  landingGreeting: "嚟啦,想食乜?",
  drinkSectionTitle: "熱定凍?",
  modifierSectionTitle: "要點呀?",
  staffDailySummary: (count: number) => `今日賣咗 ${count} 碗,數得計`,
  footerNote: "唔該幫襯,慢慢揀,唔使急",
} as const;

/**
 * 正常書面語 — 用喺表單標籤、法律/條款、付款相關文字,唔好加花名。
 */
export const formalCopy = {
  tableNumber: "枱號",
  totalAmount: "總金額",
  orderNumber: "訂單編號",
  subtotal: "小計",
  serviceCharge: "服務費",
  minSpendNotice: (amount: string) => `此時段最低消費 ${amount}`,
  paymentMethod: "付款方式",
  paymentStatusUnpaid: "未找數",
  paymentStatusPaid: "已找數",
} as const;
