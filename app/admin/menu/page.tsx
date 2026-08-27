/**
 * Menu 列表 —— 有貨/賣晒 toggle 放最當眼位置(老闆日常最常撳嘅掣)。
 * 對應 docs/PROJECT_PLAN.md 〈三、UI/美術方向 §5.2〉+〈二、技術架構 §4.3〉。
 */
import Image from "next/image";
import Link from "next/link";
import { getCurrentRestaurantId } from "@/lib/tenant";
import { getMenuForRestaurant } from "@/lib/db/queries/menu";
import { createMenuCategory, createMenuItem, toggleAvailability } from "@/lib/actions/menu";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { formatHKD } from "@/lib/utils";
import { emptyStateCopy } from "@/lib/copy/tone";

export const dynamic = "force-dynamic";

export default async function AdminMenuPage() {
  const restaurantId = await getCurrentRestaurantId();
  const categories = await getMenuForRestaurant(restaurantId);

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold">餐牌管理</h1>
        <p className="text-sm text-[var(--muted-foreground)]">
          邊味賣晒即刻撳走,唔好累到伙記走出走入解畫
        </p>
      </header>

      {categories.length === 0 && (
        <p className="text-sm text-[var(--muted-foreground)]">{emptyStateCopy.emptyCategory}</p>
      )}

      {categories.map((category) => (
        <Card key={category.id}>
          <CardHeader>
            <CardTitle>{category.name}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {category.items.length === 0 ? (
              <p className="text-sm text-[var(--muted-foreground)]">呢個分類重未有品項</p>
            ) : (
              category.items.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-md border-[1.5px] border-[var(--border)] p-3"
                >
                  <div className="flex items-center gap-3">
                    {item.imageUrl ? (
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        width={48}
                        height={48}
                        className="h-12 w-12 rounded-md object-cover"
                      />
                    ) : (
                      <div className="h-12 w-12 shrink-0 rounded-md bg-[var(--muted)]" />
                    )}
                    <div>
                      <p className="font-medium">
                        {item.code ? `${item.code}. ` : ""}
                        {item.name}
                      </p>
                      <p className="font-[family-name:var(--font-mono-ui)] text-sm text-[var(--cct-red-600)]">
                        {formatHKD(item.price)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {!item.isAvailable && <Badge variant="soldOut">賣晒</Badge>}
                    <form
                      action={async () => {
                        "use server";
                        await toggleAvailability(item.id);
                      }}
                    >
                      <Button
                        type="submit"
                        variant={item.isAvailable ? "secondary" : "primary"}
                        size="sm"
                      >
                        {item.isAvailable ? "標記賣晒" : "翻叫得"}
                      </Button>
                    </form>
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/admin/menu/${item.id}/edit`}>編輯</Link>
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      ))}

      <Card>
        <CardHeader>
          <CardTitle>加新分類</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            action={async (formData) => {
              "use server";
              await createMenuCategory(formData);
            }}
            className="flex flex-col gap-2"
          >
            <div className="flex gap-2">
              <Input
                name="name"
                placeholder="例如:粉麵飯"
                required
                pattern=".*\S.*"
                title="唔可以淨係得空格"
                className="flex-1"
              />
              <Button type="submit" variant="secondary">
                新增
              </Button>
            </div>
            <p className="text-xs text-[var(--muted-foreground)]">分類名唔可以淨係得空格</p>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>加新品項</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            action={async (formData) => {
              "use server";
              await createMenuItem(formData);
            }}
            className="grid grid-cols-1 gap-3 sm:grid-cols-2"
          >
            <Select name="categoryId" required defaultValue="">
              <option value="" disabled>
                揀分類
              </option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
            <Input name="code" placeholder="代號(例如 A)" />
            <div className="flex flex-col gap-1">
              <Input
                name="name"
                placeholder="品名"
                required
                pattern=".*\S.*"
                title="品名唔可以淨係得空格"
              />
              <p className="text-xs text-[var(--muted-foreground)]">品名唔可以淨係得空格</p>
            </div>
            <div className="flex flex-col gap-1">
              <Input name="price" type="number" step="0.01" min="0" placeholder="價錢" required />
              <p className="text-xs text-[var(--muted-foreground)]">價錢要係 0 或以上嘅數字</p>
            </div>
            <textarea
              name="description"
              placeholder="賣點描述(俾 AI 生圖/落單頁參考)"
              rows={2}
              className="h-auto rounded-md border-[1.5px] border-[var(--input)] bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] sm:col-span-2"
            />
            <Button type="submit" className="sm:col-span-2">
              加落餐牌
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
