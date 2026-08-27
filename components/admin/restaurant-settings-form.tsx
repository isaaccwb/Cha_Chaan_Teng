"use client";

import { useState, useTransition } from "react";
import { updateRestaurantSettings } from "@/lib/actions/menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function RestaurantSettingsForm({
  initialServiceChargeEnabled,
  initialServiceChargePercent,
  initialMinSpendAmount,
}: {
  initialServiceChargeEnabled: boolean;
  initialServiceChargePercent: number;
  initialMinSpendAmount: number | null;
}) {
  const [serviceChargeEnabled, setServiceChargeEnabled] = useState(initialServiceChargeEnabled);
  const [serviceChargePercent, setServiceChargePercent] = useState(
    String(initialServiceChargePercent)
  );
  const [minSpendAmount, setMinSpendAmount] = useState(
    initialMinSpendAmount != null ? String(initialMinSpendAmount) : ""
  );
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    startTransition(async () => {
      const result = await updateRestaurantSettings({
        serviceChargeEnabled,
        serviceChargePercent: Number(serviceChargePercent),
        minSpendAmount: minSpendAmount.trim() === "" ? null : Number(minSpendAmount),
      });
      setMessage(
        result.success
          ? { type: "ok", text: "搞掂,已經更新。" }
          : { type: "error", text: result.error }
      );
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-5 rounded-md border-[1.5px] border-[var(--cct-milktea-600)] bg-[var(--card)] p-5 shadow-sticker"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-medium">加一服務費</p>
          <p className="text-sm text-[var(--muted-foreground)]">
            開咗嘅話,結賬金額會自動加返呢個百分比。
          </p>
        </div>
        <input
          type="checkbox"
          checked={serviceChargeEnabled}
          onChange={(e) => setServiceChargeEnabled(e.target.checked)}
          className="mt-1 h-5 w-5 accent-[var(--cct-red-500)]"
        />
      </div>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">服務費百分比(%)</span>
        <Input
          type="number"
          min={0}
          step="0.5"
          disabled={!serviceChargeEnabled}
          value={serviceChargePercent}
          onChange={(e) => setServiceChargePercent(e.target.value)}
          className="h-11 bg-[var(--background)]"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">最低消費金額($,留空 = 冇設最低消費)</span>
        <Input
          type="number"
          min={0}
          step="1"
          value={minSpendAmount}
          onChange={(e) => setMinSpendAmount(e.target.value)}
          placeholder="例如 50"
          className="h-11 bg-[var(--background)]"
        />
      </label>

      {message && (
        <p
          className={
            message.type === "ok"
              ? "text-sm text-[var(--cct-green-800)]"
              : "text-sm text-[var(--destructive)]"
          }
        >
          {message.text}
        </p>
      )}

      <Button type="submit" disabled={isPending}>
        {isPending ? "更新緊…" : "更新設定"}
      </Button>
    </form>
  );
}
