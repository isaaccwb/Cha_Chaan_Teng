/**
 * 對應 docs/PROJECT_PLAN.md 〈二、技術架構 §7〉。
 *
 * V1 得一間茶記,靠 env 變數指住嗰行 restaurants.id。
 * V2 多租戶擴展時,呢個係「單一改動點」—— 改做讀 headers().get('host')
 * 再 lookup restaurants.domain,其他所有 db query helper 嘅
 * `restaurantId` 參數簽名完全唔使改。
 */
export async function getCurrentRestaurantId(): Promise<string> {
  const id = process.env.DEFAULT_RESTAURANT_ID;
  if (!id) {
    throw new Error(
      "DEFAULT_RESTAURANT_ID 未設定。請喺 seed 之後將 restaurants.id 填入" +
        "環境變數(見 RUN-BOOK.md)。"
    );
  }
  return id;
}
