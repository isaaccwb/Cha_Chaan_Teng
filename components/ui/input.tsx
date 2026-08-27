import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * 共用 input primitive —— 抽出嚟之前,`app/admin/menu/page.tsx`、
 * `app/admin/menu/[itemId]/edit/page.tsx`、`app/(auth)/login/page.tsx`、
 * `components/admin/restaurant-settings-form.tsx` 各自手寫同一串
 * class name(見 RUN-BOOK.md §10)。統一用返呢個 primitive,日後要調
 * 淨係改一處。
 */
const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "h-10 rounded-md border-[1.5px] border-[var(--input)] bg-transparent px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";

export { Input };
