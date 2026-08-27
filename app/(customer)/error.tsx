"use client";

/**
 * 客人落單流程(/order、/order/[orderId])嘅 error boundary。
 * 對應 docs/PROJECT_PLAN.md 〈三、UI/美術方向〉嘅卡片視覺 + §4 語氣指南:
 * Server Component 拋錯(例如資料庫連線一時唔穩、或者本身有 bug)嗰陣,
 * 唔會再見到 Next.js 個原生冷冰冰錯誤畫面,而係著返品牌嘅卡片畫面,
 * 畀客人有得撳「重新整理」或者返去 /order 睇餐牌。
 *
 * 唔好喺呢度顯示 error.message 畀客人睇 —— 可能會漏咗內部實作細節,
 * 淨係用 console.error 留返個 stack 喺瀏覽器 console/監控度俾我哋查。
 */
import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LogoIcon } from "@/components/branding/logo";
import { buttonCopy, errorCopy } from "@/lib/copy/tone";

export default function CustomerError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // 跟返 app/api/cron/cleanup-stale-orders/route.ts 嗰種 [scope] tag 風格,
    // 方便日後喺 log 度篩返出嚟。
    console.error("[customer/error-boundary]", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 py-10">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <div className="mb-1 flex justify-center">
            <LogoIcon size={56} />
          </div>
          <CardTitle className="text-center font-[family-name:var(--font-display)] text-2xl text-[var(--cct-red-600)]">
            {errorCopy.boundaryTitle}
          </CardTitle>
          <CardDescription className="text-center">{errorCopy.boundaryDetail}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Button size="lg" className="w-full" onClick={() => reset()}>
            重新整理
          </Button>
          <Button asChild variant="secondary" size="lg" className="w-full">
            <Link href="/order">{buttonCopy.backToMenu}</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
