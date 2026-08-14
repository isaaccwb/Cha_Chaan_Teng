import { Badge } from "@/components/ui/badge";
import { orderStatusCopy } from "@/lib/copy/tone";
import type { orderStatusEnum } from "@/lib/db/schema";
import { cn } from "@/lib/utils";

/**
 * 統一顯示訂單狀態,文案一律嚟自 lib/copy/tone.ts 嘅 orderStatusCopy
 * (前台 4 段簡化 label,對應〈編輯註記〉第2點 mapping),唔喺呢度自己
 * 再寫一份 label map。
 */
export type OrderStatus = (typeof orderStatusEnum.enumValues)[number];

const STATUS_VARIANT: Record<OrderStatus, "hot" | "chef" | "soup" | "soldOut" | "chip"> = {
  pending: "hot",
  confirmed: "chef",
  preparing: "chef",
  ready: "soup",
  completed: "chip",
  cancelled: "soldOut",
};

export function OrderStatusBadge({
  status,
  className,
}: {
  status: OrderStatus;
  className?: string;
}) {
  const copy = orderStatusCopy[status];
  return (
    <Badge
      variant={STATUS_VARIANT[status]}
      data-selected={status === "completed" ? true : undefined}
      className={cn("shrink-0 normal-case", className)}
      title={copy.detail}
    >
      {copy.label}
    </Badge>
  );
}
