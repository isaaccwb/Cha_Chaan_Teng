import Link from "next/link";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { getOrderForGuest } from "@/lib/db/queries/orders";
import { orderStatusCopy, confirmationCopy, buttonCopy, formalCopy } from "@/lib/copy/tone";
import { formatHKD, cn } from "@/lib/utils";
import type { orderStatusEnum } from "@/lib/db/schema";
import { OrderStatusPoller } from "@/components/order/order-status-poller";

const GUEST_TOKEN_COOKIE = "cct_guest_token";

// 前台顯示層 4 段(對應 lib/copy/tone.ts orderStatusCopy + PROJECT_PLAN 編輯註記第2點):
// pending → 新落單;{confirmed,preparing} → 落緊鑊;ready → 得咗;completed → 派咗
const STAGE_STATUSES: (typeof orderStatusEnum.enumValues)[number][] = [
  "pending",
  "confirmed",
  "ready",
  "completed",
];

function stageIndexFor(status: (typeof orderStatusEnum.enumValues)[number]) {
  if (status === "preparing") return STAGE_STATUSES.indexOf("confirmed");
  return STAGE_STATUSES.indexOf(status);
}

export default async function OrderStatusPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  const cookieStore = await cookies();
  const guestToken = cookieStore.get(GUEST_TOKEN_COOKIE)?.value;

  if (!guestToken) {
    notFound();
  }

  const result = await getOrderForGuest(orderId, guestToken);
  if (!result) {
    notFound();
  }

  const { order, items } = result;
  const isCancelled = order.status === "cancelled";
  const currentStage = stageIndexFor(order.status);

  return (
    <div className="flex flex-col gap-6 px-4 py-6">
      <OrderStatusPoller orderId={order.id} currentStatus={order.status} />
      <div className="text-center">
        <p className="font-[family-name:var(--font-mono-ui)] text-sm text-[var(--muted-foreground)]">
          {formalCopy.orderNumber} #{order.orderNumber}
        </p>
        <p className="mt-1 text-lg font-bold">
          {isCancelled ? orderStatusCopy.cancelled.detail : confirmationCopy.orderPlaced}
        </p>
      </div>

      {isCancelled ? (
        <div className="rounded-md border-[1.5px] border-[var(--border)] bg-[var(--muted)] px-4 py-3 text-center text-[var(--muted-foreground)]">
          {orderStatusCopy.cancelled.label}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <div className="flex gap-1.5">
            {STAGE_STATUSES.map((status, idx) => (
              <div
                key={status}
                className={cn(
                  "h-1.5 flex-1 rounded-full",
                  idx <= currentStage ? "bg-[var(--cct-red-500)]" : "bg-[var(--border)]"
                )}
              />
            ))}
          </div>
          <div className="flex gap-1.5">
            {STAGE_STATUSES.map((status, idx) => (
              <span
                key={status}
                className={cn(
                  "flex-1 text-center text-xs font-medium",
                  idx <= currentStage ? "text-[var(--foreground)]" : "text-[var(--muted-foreground)]"
                )}
              >
                {orderStatusCopy[status].label}
              </span>
            ))}
          </div>
        </div>
      )}

      {!isCancelled && (
        <p className="text-center text-sm text-[var(--muted-foreground)]">
          {orderStatusCopy[order.status].detail}
        </p>
      )}

      <div className="rounded-md border-[1.5px] border-[var(--cct-milktea-600)] bg-[var(--card)] p-4">
        <div className="mb-3 flex justify-between text-sm text-[var(--muted-foreground)]">
          <span>{formalCopy.tableNumber}</span>
          <span>{order.tableNumber ?? "—"}</span>
        </div>
        <ul className="flex flex-col gap-2">
          {items.map((item) => (
            <li key={item.id} className="flex flex-col gap-0.5 text-sm">
              <div className="flex justify-between">
                <span>
                  {item.itemNameSnapshot} × {item.quantity}
                </span>
                <span className="font-[family-name:var(--font-mono-ui)]">
                  {formatHKD(item.lineTotal)}
                </span>
              </div>
              {item.options.length > 0 && (
                <span className="text-xs text-[var(--muted-foreground)]">
                  {item.options.map((opt) => opt.nameSnapshot).join("、")}
                </span>
              )}
            </li>
          ))}
        </ul>
        <div className="mt-3 flex justify-between border-t border-[var(--border)] pt-3 text-base font-bold">
          <span>{formalCopy.totalAmount}</span>
          <span className="font-[family-name:var(--font-heading-en)] text-[var(--cct-red-500)]">
            {formatHKD(order.total)}
          </span>
        </div>
      </div>

      <div className="flex flex-col items-center gap-2 pt-2">
        <p className="text-sm text-[var(--muted-foreground)]">{confirmationCopy.wantMore}</p>
        <Link
          href="/order"
          className="inline-flex h-11 items-center justify-center rounded-md border-[1.5px] border-[var(--cct-milktea-600)] px-5 text-sm font-medium"
        >
          {buttonCopy.backToMenu}
        </Link>
      </div>
    </div>
  );
}
