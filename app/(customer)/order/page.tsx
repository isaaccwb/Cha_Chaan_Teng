import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { getCurrentRestaurantId } from "@/lib/tenant";
import { getMenuForRestaurant } from "@/lib/db/queries/menu";
import { restaurants } from "@/lib/db/schema";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { MenuItemCard } from "@/components/menu/menu-item-card";
import { CartBar } from "@/components/cart/cart-drawer";
import { emptyStateCopy } from "@/lib/copy/tone";

/**
 * 客人落單頁 —— 單欄卡片 list + 橫向分類 chip + sticky bottom bar。
 * 對應 PROJECT_PLAN.md 〈三、UI/美術方向 §5.1〉。
 *
 * 呢個 page 冇用任何 dynamic API(getCurrentRestaurantId 淨係讀 env var),
 * Next.js 預設會當佢係靜態頁面,build 嗰陣凍結晒 HTML,之後職員後台改
 * 賣晒/落價/相片都唔會喺呢頁反映,要重新 deploy 先見到 —— 對落單頁嚟講
 * 呢個絕對唔啱,強制行 dynamic rendering(同 app/admin/menu/page.tsx
 * 用緊嘅做法一致)。
 */
export const dynamic = "force-dynamic";

export default async function OrderPage() {
  const restaurantId = await getCurrentRestaurantId();
  const db = getDb();

  const [categories, [restaurant]] = await Promise.all([
    getMenuForRestaurant(restaurantId),
    db
      .select({
        minSpendAmount: restaurants.minSpendAmount,
        serviceChargeEnabled: restaurants.serviceChargeEnabled,
        serviceChargePercent: restaurants.serviceChargePercent,
      })
      .from(restaurants)
      .where(eq(restaurants.id, restaurantId))
      .limit(1),
  ]);

  const visibleCategories = categories.filter((c) => c.items.length > 0);

  return (
    <div className="pb-28">
      {visibleCategories.length === 0 ? (
        <p className="px-4 py-16 text-center text-[var(--muted-foreground)]">
          {emptyStateCopy.emptyCategory}
        </p>
      ) : (
        <Tabs defaultValue={visibleCategories[0].id} className="flex flex-col gap-3 px-4 pt-3">
          <TabsList className="w-full justify-start overflow-x-auto">
            {visibleCategories.map((category) => (
              <TabsTrigger key={category.id} value={category.id}>
                {category.name}
              </TabsTrigger>
            ))}
          </TabsList>

          {visibleCategories.map((category) => (
            <TabsContent key={category.id} value={category.id} className="mt-1 flex flex-col gap-3">
              {category.items.map((item) => (
                <MenuItemCard key={item.id} item={item} />
              ))}
            </TabsContent>
          ))}
        </Tabs>
      )}

      <CartBar
        minSpendAmount={restaurant?.minSpendAmount != null ? Number(restaurant.minSpendAmount) : null}
        serviceChargeEnabled={restaurant?.serviceChargeEnabled ?? false}
        serviceChargePercent={restaurant ? Number(restaurant.serviceChargePercent) : 0}
      />
    </div>
  );
}
