"use client";

import * as React from "react";
import Image from "next/image";
import { UtensilsCrossed, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatHKD } from "@/lib/utils";
import { AddItemSheet } from "@/components/cart/cart-drawer";
import type { ItemOption, MenuItem } from "@/lib/db/schema";

export type MenuItemWithOptions = MenuItem & { options: ItemOption[] };

/**
 * 熱賣/老闆推介呢類 badge 冇對應嘅 DB 欄位(schema.menu_items 冇
 * `is_hot`/`is_chef_pick`),所以呢張卡淨係支援由父層明確傳落嚟嘅
 * `badge` prop,冇傳就乜都唔顯示 —— 唔會自己靠估邊味係熱賣。
 * 見呢個檔案結尾嘅整合筆記。
 */
export interface MenuItemCardProps {
  item: MenuItemWithOptions;
  badge?: "hot" | "chef" | "soup";
}

export function MenuItemCard({ item, badge }: MenuItemCardProps) {
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const soldOut = !item.isAvailable;

  return (
    <>
      <Card
        className={soldOut ? "pointer-events-none opacity-60" : undefined}
        aria-disabled={soldOut}
      >
        <CardContent className="flex gap-3 p-3">
          <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-md border-[1.5px] border-[var(--cct-milktea-600)] bg-[var(--cct-cream-50)]">
            {item.imageUrl ? (
              <Image
                src={item.imageUrl}
                alt={item.name}
                fill
                sizes="96px"
                className="object-cover sepia-[0.08]"
              />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-[var(--muted-foreground)]">
                <UtensilsCrossed className="h-6 w-6" />
              </div>
            )}
            {soldOut && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Badge variant="soldOut">賣晒</Badge>
              </div>
            )}
          </div>

          <div className="flex min-w-0 flex-1 flex-col justify-between">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                {item.code && (
                  <span className="font-[family-name:var(--font-mono-ui)] text-xs font-bold text-[var(--muted-foreground)]">
                    {item.code}
                  </span>
                )}
                <h3 className="truncate font-[family-name:var(--font-display)] text-base font-bold">
                  {item.name}
                </h3>
                {badge === "hot" && <Badge variant="hot">熱賣</Badge>}
                {badge === "chef" && <Badge variant="chef">老闆推介</Badge>}
                {badge === "soup" && <Badge variant="soup">今日靚湯</Badge>}
              </div>
              {item.description && (
                <p className="line-clamp-2 text-sm text-[var(--muted-foreground)]">{item.description}</p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <span className="font-[family-name:var(--font-heading-en)] text-2xl text-[var(--cct-red-500)]">
                {formatHKD(item.price)}
              </span>
              <button
                type="button"
                disabled={soldOut}
                onClick={() => setSheetOpen(true)}
                aria-label={`加${item.name}落單`}
                className="pointer-events-auto flex h-10 items-center gap-1 rounded-md bg-[var(--primary)] px-3 text-sm font-bold text-[var(--primary-foreground)] transition-all hover:shadow-cct-glow active:scale-[0.98] disabled:opacity-50"
              >
                <Plus className="h-4 w-4" />
                加
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {!soldOut && <AddItemSheet item={item} open={sheetOpen} onOpenChange={setSheetOpen} />}
    </>
  );
}
