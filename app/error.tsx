"use client";

/**
 * 全站 root-level error boundary —— 兜底畀 (customer) route group 以外嘅
 * 頁面(職員/老闆後台 app/admin、登入頁 app/(auth) 等)。對象係自己人
 * 唔係客人,所以視覺唔使做到落單流程嗰種卡片級數,夠用、有得撳返轉頭
 * 就得(對應 §4 語氣指南節制原則)。
 *
 * 唔好喺畫面度顯示 error.message,留返 console.error 記錄就夠。
 */
import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { errorCopy } from "@/lib/copy/tone";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[root/error-boundary]", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[var(--background)] px-4 text-center text-[var(--foreground)]">
      <h1 className="font-[family-name:var(--font-display)] text-2xl text-[var(--cct-red-600)]">
        {errorCopy.boundaryTitle}
      </h1>
      <p className="text-sm text-[var(--muted-foreground)]">{errorCopy.boundaryDetailStaff}</p>
      <div className="flex gap-3">
        <Button onClick={() => reset()}>重新整理</Button>
        <Button asChild variant="secondary">
          <Link href="/">返首頁</Link>
        </Button>
      </div>
    </div>
  );
}
