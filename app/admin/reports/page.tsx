/**
 * 銷售報表 —— 大數字 stat cards 行先(今日/本週/本月單數/營業額/熱賣Top3),
 * 底下加「訂單歷史」分頁列表,俾老闆/伙記查返舊單。
 * 對應 docs/PROJECT_PLAN.md 〈三、UI/美術方向 §5.2〉。
 *
 * 邏輯夠簡單,直接喺呢個 page.tsx 用 aggregate query,唔使起獨立
 * lib/db/queries/reports.ts —— 但 aggregate/分頁 query 本身抽咗去
 * lib/db/queries/orders.ts(getOrderStatsForRange / getOrdersInRange),
 * 淨係頁面組裝邏輯留喺呢度,因為呢兩個 query 同 getOrdersByStatus 屬於
 * 同一組「orders 表查詢」,擺埋一齊易搵過另開新檔案。
 *
 * 範圍切換(今日/本週/本月)用 searchParams(?range=),歷史列表分頁用
 * ?page=,一律 Link 帶參數,唔使 client component/JS —— 呢頁本身就唔係
 * 高頻互動頁,server component + 靜態連結夠晒用。
 */
import Link from "next/link";
import {
  getOrderStatsForRange,
  getOrdersInRange,
} from "@/lib/db/queries/orders";
import { getCurrentRestaurantId } from "@/lib/tenant";
import { getReportRangeBounds, REPORT_RANGE_LABELS, type ReportRange } from "@/lib/date-hk";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OrderStatusBadge } from "@/components/admin/order-status-badge";
import { formatHKD, cn } from "@/lib/utils";
import { emptyStateCopy, miscCopy } from "@/lib/copy/tone";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;
const RANGES: ReportRange[] = ["today", "week", "month"];

function isReportRange(value: string | undefined): value is ReportRange {
  return !!value && (RANGES as string[]).includes(value);
}

function formatDateTime(date: Date): string {
  const hkMs = date.getTime() + 8 * 60 * 60 * 1000;
  const hk = new Date(hkMs);
  const mm = String(hk.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(hk.getUTCDate()).padStart(2, "0");
  const hh = String(hk.getUTCHours()).padStart(2, "0");
  const min = String(hk.getUTCMinutes()).padStart(2, "0");
  return `${mm}/${dd} ${hh}:${min}`;
}

export default async function AdminReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string; page?: string }>;
}) {
  const params = await searchParams;
  const range: ReportRange = isReportRange(params.range) ? params.range : "today";
  const page = Math.max(1, Number(params.page) || 1);

  const restaurantId = await getCurrentRestaurantId();
  const { start, end } = getReportRangeBounds(range);

  const [{ orderCount, revenue, topItems }, { orders: historyOrders, total }] = await Promise.all([
    getOrderStatsForRange(restaurantId, start, end),
    getOrdersInRange(restaurantId, start, end, { limit: PAGE_SIZE, offset: (page - 1) * PAGE_SIZE }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const rangeLabel = REPORT_RANGE_LABELS[range];

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold">今日數得計</h1>
        <p className="text-sm text-[var(--muted-foreground)]">
          {miscCopy.staffRangeSummary(rangeLabel, orderCount)}
        </p>
      </header>

      <div className="flex gap-2">
        {RANGES.map((r) => (
          <Link
            key={r}
            href={`/admin/reports?range=${r}`}
            className={cn(
              "rounded-md border-[1.5px] px-4 py-2 text-sm font-medium transition-colors",
              r === range
                ? "border-[var(--cct-red-600)] bg-[var(--cct-red-600)] text-white"
                : "border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--muted)]"
            )}
          >
            {REPORT_RANGE_LABELS[r]}
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-[var(--muted-foreground)]">
              {rangeLabel}單數
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-[family-name:var(--font-heading-en)] text-4xl text-[var(--cct-red-600)]">
              {orderCount}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-[var(--muted-foreground)]">
              {rangeLabel}營業額
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-[family-name:var(--font-heading-en)] text-4xl text-[var(--cct-red-600)]">
              {formatHKD(revenue)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-[var(--muted-foreground)]">
              熱賣 Top 3
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topItems.length === 0 ? (
              <p className="text-sm text-[var(--muted-foreground)]">{emptyStateCopy.noOrdersToday}</p>
            ) : (
              <ol className="flex flex-col gap-1.5 text-sm">
                {topItems.map(([name, qty], idx) => (
                  <li key={name} className="flex items-center justify-between gap-2">
                    <span>
                      {idx + 1}. {name}
                    </span>
                    <span className="font-[family-name:var(--font-mono-ui)] text-[var(--muted-foreground)]">
                      {qty} 份
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>訂單歷史</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {historyOrders.length === 0 ? (
            <p className="text-sm text-[var(--muted-foreground)]">{emptyStateCopy.noOrdersInRange}</p>
          ) : (
            <>
              <div className="flex flex-col gap-2">
                {historyOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-md border-[1.5px] border-[var(--border)] p-3 text-sm"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-[family-name:var(--font-mono-ui)] font-bold">
                        #{order.orderNumber}
                      </span>
                      <span className="text-[var(--muted-foreground)]">
                        {formatDateTime(order.createdAt)}
                      </span>
                      {order.tableNumber && (
                        <span className="text-[var(--muted-foreground)]">檯 {order.tableNumber}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <OrderStatusBadge status={order.status} />
                      <span className="font-[family-name:var(--font-mono-ui)] font-bold text-[var(--cct-red-600)]">
                        {formatHKD(order.total)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="mt-2 flex items-center justify-between text-sm">
                  <Link
                    href={`/admin/reports?range=${range}&page=${page - 1}`}
                    aria-disabled={page <= 1}
                    className={cn(
                      "rounded-md border-[1.5px] border-[var(--border)] px-3 py-1.5",
                      page <= 1 ? "pointer-events-none opacity-40" : "hover:bg-[var(--muted)]"
                    )}
                  >
                    上一頁
                  </Link>
                  <span className="text-[var(--muted-foreground)]">
                    第 {page} / {totalPages} 頁(共 {total} 張單)
                  </span>
                  <Link
                    href={`/admin/reports?range=${range}&page=${page + 1}`}
                    aria-disabled={page >= totalPages}
                    className={cn(
                      "rounded-md border-[1.5px] border-[var(--border)] px-3 py-1.5",
                      page >= totalPages ? "pointer-events-none opacity-40" : "hover:bg-[var(--muted)]"
                    )}
                  >
                    下一頁
                  </Link>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
