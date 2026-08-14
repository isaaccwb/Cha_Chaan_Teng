"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Bottom sheet primitive,基於 @radix-ui/react-dialog 起(唔另外裝
 * vaul/tailwindcss-animate 呢類套件)。專攻 mobile native pattern:
 * 由底部滑出,fixed 喺 viewport 底,rounded-t-md 頂角。
 *
 * 進場動畫用 mount 之後一個 rAF tick 先切換 translate class 嚟做(而唔係
 * 靠 tailwindcss-animate 嘅 data-[state] animate-in,因為呢個專案冇裝
 * 嗰隻 plugin),退場就淨係即時卸載(Radix unmount 已經夠爽手)。
 */

const Sheet = DialogPrimitive.Root;
const SheetTrigger = DialogPrimitive.Trigger;
const SheetPortal = DialogPrimitive.Portal;
const SheetClose = DialogPrimitive.Close;

const SheetOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn("fixed inset-0 z-50 bg-black/50", className)}
    {...props}
  />
));
SheetOverlay.displayName = DialogPrimitive.Overlay.displayName;

const SheetContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
    hideClose?: boolean;
  }
>(({ className, children, hideClose, ...props }, ref) => {
  // mount 咗先滑上嚟,唔係一開就企喺原位(冇呢個 tick 就冇入場動畫)
  const [settled, setSettled] = React.useState(false);
  React.useEffect(() => {
    const raf = requestAnimationFrame(() => setSettled(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <SheetPortal>
      <SheetOverlay />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          "fixed inset-x-0 bottom-0 z-50 flex max-h-[85vh] flex-col overflow-hidden rounded-t-md border-x-[1.5px] border-t-[1.5px] border-[var(--cct-milktea-600)] bg-[var(--card)] text-[var(--card-foreground)] shadow-sticker transition-transform duration-300 ease-out will-change-transform",
          settled ? "translate-y-0" : "translate-y-full",
          className
        )}
        {...props}
      >
        <div className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-[var(--cct-milktea-600)] opacity-50" />
        <div className="min-h-0 flex-1 overflow-y-auto p-4">{children}</div>
        {!hideClose && (
          <DialogPrimitive.Close className="absolute right-3 top-3 rounded-sm p-1 opacity-70 hover:opacity-100">
            <X className="h-4 w-4" />
            <span className="sr-only">關閉</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </SheetPortal>
  );
});
SheetContent.displayName = DialogPrimitive.Content.displayName;

const SheetHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("mb-3 flex flex-col gap-1 pr-6", className)} {...props} />
);

const SheetTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn("font-[family-name:var(--font-display)] text-lg font-bold", className)}
    {...props}
  />
));
SheetTitle.displayName = DialogPrimitive.Title.displayName;

const SheetDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-[var(--muted-foreground)]", className)}
    {...props}
  />
));
SheetDescription.displayName = DialogPrimitive.Description.displayName;

export {
  Sheet,
  SheetTrigger,
  SheetPortal,
  SheetClose,
  SheetOverlay,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
};
