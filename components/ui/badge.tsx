import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * 對應 §3.3:唔用泛用 "New"/"Popular" pill,用地道講法。
 * `sticker` variant 用 clip-path 剪一個角,模擬貼喺餐牌上嘅小紙牌感。
 */
const badgeVariants = cva(
  "inline-flex items-center px-2 py-0.5 text-xs font-bold font-[family-name:var(--font-mono-ui)]",
  {
    variants: {
      variant: {
        hot: "rounded-sm bg-[var(--cct-red-500)] text-white shadow-cct-glow [clip-path:polygon(0_0,100%_0,100%_70%,85%_100%,0_100%)]",
        chef: "rounded-sm border border-[var(--cct-gold-500)] text-[var(--cct-green-800)]",
        soup: "rounded-sm bg-[var(--cct-green-800)] text-[#FFF8F0]",
        soldOut:
          "rounded-sm bg-[var(--muted-foreground)] text-[var(--card)] opacity-80 [background-image:repeating-linear-gradient(45deg,transparent,transparent_4px,rgba(0,0,0,0.15)_4px,rgba(0,0,0,0.15)_8px)]",
        chip: "cursor-pointer rounded-sm border border-[var(--cct-red-500)] bg-transparent text-[var(--cct-red-700)] data-[selected=true]:bg-[var(--cct-red-500)] data-[selected=true]:text-white",
      },
    },
    defaultVariants: {
      variant: "chef",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
