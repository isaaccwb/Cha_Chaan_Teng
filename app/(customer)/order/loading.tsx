/**
 * /order 嘅 loading skeleton —— Next.js App Router 會自動用呢個 wrap 住
 * page.tsx 做 Suspense fallback,唔使自己手動加 <Suspense>。
 *
 * page.tsx 一直 force-dynamic(要即時反映伙記改嘢),所以每次都要真係
 * 等 DB 查完先有內容 —— 呢個 skeleton 令客人一撳開個頁即刻見到嘢郁,
 * 唔使見住白版等,對應效能優化其中一項(streaming,唔係靠 cache)。
 */
function SkeletonCard() {
  return (
    <div className="flex animate-pulse gap-3 rounded-md border-[1.5px] border-[var(--cct-milktea-600)] bg-[var(--card)] p-3">
      <div className="h-24 w-24 shrink-0 rounded-md bg-[var(--muted)]" />
      <div className="flex flex-1 flex-col justify-between gap-2 py-1">
        <div className="flex flex-col gap-2">
          <div className="h-4 w-2/3 rounded bg-[var(--muted)]" />
          <div className="h-3 w-full rounded bg-[var(--muted)]" />
        </div>
        <div className="h-6 w-16 rounded bg-[var(--muted)]" />
      </div>
    </div>
  );
}

export default function OrderLoading() {
  return (
    <div className="flex flex-col gap-3 px-4 pt-3 pb-28">
      <div className="flex h-12 w-full gap-2">
        <div className="h-full w-20 animate-pulse rounded-md bg-[var(--muted)]" />
        <div className="h-full w-20 animate-pulse rounded-md bg-[var(--muted)]" />
        <div className="h-full w-20 animate-pulse rounded-md bg-[var(--muted)]" />
      </div>
      <div className="mt-1 flex flex-col gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  );
}
