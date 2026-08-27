"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus, X } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn, formatHKD } from "@/lib/utils";
import { buttonCopy, errorCopy, formalCopy, miscCopy } from "@/lib/copy/tone";
import { useCartStore } from "@/components/cart/cart-store";
import { createOrder } from "@/lib/actions/order";
import type { MenuItemWithOptions } from "@/components/menu/menu-item-card";
import type { ItemOption } from "@/lib/db/schema";

/* ────────────────────────────────────────────────────────────────
 * 1. AddItemSheet —— 客製化 bottom sheet(走青/走冰/套餐飲品等 chip
 *    選項 + 數量 stepper + 「嚟多樣!」掣),由 menu-item-card.tsx 嘅
 *    「+加」掣觸發。
 * ──────────────────────────────────────────────────────────────── */

const GROUP_ORDER: ItemOption["groupName"][] = ["走料", "加料", "套餐飲品", "其他"];

function groupOptions(options: ItemOption[]) {
  const groups = new Map<ItemOption["groupName"], ItemOption[]>();
  for (const group of GROUP_ORDER) groups.set(group, []);
  for (const option of options) {
    if (!groups.has(option.groupName)) groups.set(option.groupName, []);
    groups.get(option.groupName)!.push(option);
  }
  return Array.from(groups.entries()).filter(([, opts]) => opts.length > 0);
}

export function AddItemSheet({
  item,
  open,
  onOpenChange,
}: {
  item: MenuItemWithOptions;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const addItem = useCartStore((s) => s.addItem);
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  const [quantity, setQuantity] = React.useState(1);
  const [notes, setNotes] = React.useState("");

  // 每次開返個 sheet(或者換咗味嘢)就重置返做預設狀態
  React.useEffect(() => {
    if (!open) return;
    setSelectedIds(new Set(item.options.filter((o) => o.isDefault).map((o) => o.id)));
    setQuantity(1);
    setNotes("");
  }, [open, item]);

  const grouped = React.useMemo(() => groupOptions(item.options), [item.options]);
  const selectedOptions = item.options.filter((o) => selectedIds.has(o.id));
  const unitPrice =
    Number(item.price) + selectedOptions.reduce((sum, o) => sum + Number(o.priceDelta), 0);
  const lineTotal = unitPrice * quantity;

  function toggleOption(option: ItemOption) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(option.id)) {
        next.delete(option.id);
      } else {
        next.add(option.id);
      }
      return next;
    });
  }

  function handleAdd() {
    addItem({
      menuItemId: item.id,
      name: item.name,
      imageUrl: item.imageUrl,
      unitPrice: Number(item.price),
      quantity,
      notes,
      options: selectedOptions.map((o) => ({
        optionId: o.id,
        name: o.name,
        priceDelta: Number(o.priceDelta),
      })),
    });
    onOpenChange(false);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{item.name}</SheetTitle>
          {item.description && <SheetDescription>{item.description}</SheetDescription>}
        </SheetHeader>

        <div className="flex flex-col gap-5 pb-[env(safe-area-inset-bottom)]">
          {grouped.map(([groupName, options]) => (
            <div key={groupName} className="flex flex-col gap-2">
              <p className="font-[family-name:var(--font-mono-ui)] text-xs font-bold text-[var(--muted-foreground)]">
                {miscCopy.modifierSectionTitle} · {groupName}
              </p>
              <div className="flex flex-wrap gap-2">
                {options.map((option) => {
                  const selected = selectedIds.has(option.id);
                  const delta = Number(option.priceDelta);
                  return (
                    <Badge
                      key={option.id}
                      variant="chip"
                      role="button"
                      tabIndex={0}
                      data-selected={selected}
                      className="min-h-9 px-3 py-1.5"
                      onClick={() => toggleOption(option)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          toggleOption(option);
                        }
                      }}
                    >
                      {option.name}
                      {delta !== 0 && ` (${delta > 0 ? "+" : "-"}${formatHKD(Math.abs(delta))})`}
                    </Badge>
                  );
                })}
              </div>
            </div>
          ))}

          <div className="flex flex-col gap-2">
            <label
              htmlFor="cart-item-notes"
              className="font-[family-name:var(--font-mono-ui)] text-xs font-bold text-[var(--muted-foreground)]"
            >
              特別要求(可選)
            </label>
            <input
              id="cart-item-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="例如少甜、走蔥"
              className="h-10 rounded-md border-[1.5px] border-[var(--border)] bg-[var(--background)] px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
            />
          </div>

          <div className="flex items-center justify-between border-t border-[var(--border)] pt-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                aria-label="減少數量"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="flex h-9 w-9 items-center justify-center rounded-md border-[1.5px] border-[var(--cct-milktea-600)] disabled:opacity-40"
                disabled={quantity <= 1}
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-6 text-center font-[family-name:var(--font-mono-ui)] text-base font-bold">
                {quantity}
              </span>
              <button
                type="button"
                aria-label="增加數量"
                onClick={() => setQuantity((q) => q + 1)}
                className="flex h-9 w-9 items-center justify-center rounded-md border-[1.5px] border-[var(--cct-milktea-600)]"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <span className="font-[family-name:var(--font-heading-en)] text-2xl text-[var(--cct-red-500)]">
              {formatHKD(lineTotal)}
            </span>
          </div>

          <Button size="lg" onClick={handleAdd} className="w-full">
            {buttonCopy.addToOrder}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

/* ────────────────────────────────────────────────────────────────
 * 2. CartBar —— sticky bottom bar(顯示已叫幾多樣同幾錢),撳落去開
 *    埋單 sheet(列晒品項 + 枱號輸入 + 落單掣)。
 * ──────────────────────────────────────────────────────────────── */

export function CartBar({
  minSpendAmount = null,
  serviceChargeEnabled = false,
  serviceChargePercent = 0,
}: {
  minSpendAmount?: number | null;
  serviceChargeEnabled?: boolean;
  serviceChargePercent?: number;
}) {
  const router = useRouter();
  const lines = useCartStore((s) => s.lines);
  const tableNumber = useCartStore((s) => s.tableNumber);
  const setTableNumber = useCartStore((s) => s.setTableNumber);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const clear = useCartStore((s) => s.clear);

  const [open, setOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const count = lines.reduce((sum, l) => sum + l.quantity, 0);
  const subtotal = lines.reduce(
    (sum, l) => sum + (l.unitPrice + l.options.reduce((s, o) => s + o.priceDelta, 0)) * l.quantity,
    0
  );
  const belowMinSpend = minSpendAmount != null && subtotal < minSpendAmount;
  const estimatedTotal = serviceChargeEnabled ? subtotal * (1 + serviceChargePercent / 100) : subtotal;

  if (count === 0) return null;

  async function handleSubmit() {
    if (!tableNumber.trim()) {
      setError(errorCopy.missingTableNumber);
      return;
    }
    if (belowMinSpend) {
      setError(errorCopy.belowMinSpend);
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      const result = await createOrder({
        tableNumber: tableNumber.trim(),
        items: lines.map((l) => ({
          menuItemId: l.menuItemId,
          quantity: l.quantity,
          optionIds: l.options.map((o) => o.optionId),
          notes: l.notes || undefined,
        })),
      });
      clear();
      setOpen(false);
      router.push(`/order/${result.orderId}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : errorCopy.orderFailed);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <div className="fixed inset-x-0 bottom-0 z-40 border-t-[1.5px] border-[var(--cct-milktea-600)] bg-[var(--background)] p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex h-12 w-full items-center justify-between rounded-md bg-[var(--primary)] px-5 text-[var(--primary-foreground)] shadow-cct-glow transition-transform active:scale-[0.98]"
        >
          <span className="font-[family-name:var(--font-mono-ui)] text-sm font-bold">
            {buttonCopy.viewCart} · 共{count}樣
          </span>
          <span className="font-[family-name:var(--font-heading-en)] text-xl">{formatHKD(subtotal)}</span>
        </button>
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>{buttonCopy.viewCart}</SheetTitle>
          </SheetHeader>

          <div className="flex flex-col gap-4 pb-[env(safe-area-inset-bottom)]">
            <ul className="flex flex-col gap-3">
              {lines.map((line) => {
                const lineUnit = line.unitPrice + line.options.reduce((s, o) => s + o.priceDelta, 0);
                return (
                  <li
                    key={line.lineId}
                    className="flex items-start justify-between gap-3 border-b border-[var(--border)] pb-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-[family-name:var(--font-display)] font-bold">{line.name}</p>
                      {line.options.length > 0 && (
                        <p className="truncate text-xs text-[var(--muted-foreground)]">
                          {line.options.map((o) => o.name).join("、")}
                        </p>
                      )}
                      {line.notes && (
                        <p className="truncate text-xs text-[var(--muted-foreground)]">備註:{line.notes}</p>
                      )}
                      <div className="mt-1 flex items-center gap-2">
                        <button
                          type="button"
                          aria-label="減少數量"
                          onClick={() => updateQuantity(line.lineId, line.quantity - 1)}
                          className="flex h-7 w-7 items-center justify-center rounded-md border-[1.5px] border-[var(--cct-milktea-600)]"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-5 text-center text-sm font-bold">{line.quantity}</span>
                        <button
                          type="button"
                          aria-label="增加數量"
                          onClick={() => updateQuantity(line.lineId, line.quantity + 1)}
                          className="flex h-7 w-7 items-center justify-center rounded-md border-[1.5px] border-[var(--cct-milktea-600)]"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className="font-[family-name:var(--font-heading-en)] text-lg text-[var(--cct-red-500)]">
                        {formatHKD(lineUnit * line.quantity)}
                      </span>
                      <button
                        type="button"
                        aria-label="移除"
                        onClick={() => removeItem(line.lineId)}
                        className="flex h-9 w-9 items-center justify-center text-[var(--muted-foreground)] hover:text-[var(--destructive)]"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="cart-table-number"
                className="text-sm font-medium text-[var(--foreground)]"
              >
                {formalCopy.tableNumber}
              </label>
              <input
                id="cart-table-number"
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                placeholder="例如 8"
                className="h-11 rounded-md border-[1.5px] border-[var(--border)] bg-[var(--background)] px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
              />
            </div>

            <div className="flex flex-col gap-1 border-t border-[var(--border)] pt-3 text-sm">
              <div className="flex justify-between">
                <span className="text-[var(--muted-foreground)]">{formalCopy.subtotal}</span>
                <span>{formatHKD(subtotal)}</span>
              </div>
              {serviceChargeEnabled && (
                <div className="flex justify-between">
                  <span className="text-[var(--muted-foreground)]">
                    {formalCopy.serviceCharge}({serviceChargePercent}%)
                  </span>
                  <span>{formatHKD(estimatedTotal - subtotal)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-bold">
                <span>{formalCopy.totalAmount}</span>
                <span className="font-[family-name:var(--font-heading-en)] text-[var(--cct-red-500)]">
                  {formatHKD(estimatedTotal)}
                </span>
              </div>
              {minSpendAmount != null && (
                <p
                  className={cn(
                    "text-xs",
                    belowMinSpend ? "font-bold text-[var(--destructive)]" : "text-[var(--muted-foreground)]"
                  )}
                >
                  {formalCopy.minSpendNotice(formatHKD(minSpendAmount))}
                </p>
              )}
            </div>

            {error && (
              <p className="rounded-md bg-[var(--cct-red-50)] px-3 py-2 text-sm text-[var(--cct-red-700)]">
                {error}
              </p>
            )}

            <Button size="lg" onClick={handleSubmit} disabled={isSubmitting} className="w-full">
              {isSubmitting ? "落緊單…" : buttonCopy.confirmOrder}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
