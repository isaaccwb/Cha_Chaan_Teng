import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * 共用 select primitive —— 見 components/ui/input.tsx 頂部註解,
 * 同一段 class name 之前喺 admin/menu 兩個 page 度各寫一次。
 */
const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        "h-10 rounded-md border-[1.5px] border-[var(--input)] bg-transparent px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] disabled:opacity-50",
        className
      )}
      {...props}
    >
      {children}
    </select>
  )
);
Select.displayName = "Select";

export { Select };
