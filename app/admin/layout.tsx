/**
 * 職員/老闆後台 layout —— sidebar(落單/餐牌/報表/設定)+ 登入檢查。
 * 對應 docs/PROJECT_PLAN.md 〈三、UI/美術方向 §5.2〉。
 *
 * middleware.ts 已經掛咗 auth 喺 /admin/** 度,但呢層 layout 自己都要用
 * auth() 再驗一次同埋 redirect(唔淨係靠 middleware,對應〈技術架構 §5.2〉
 * 尾段「Server Action 入面再驗一次 role」嘅同一套精神,呢度係頁面層)。
 *
 * 桌面優先:固定側邊 sidebar + 主內容區。職員後台文案「七分正經、三分抵死」,
 * 唔好為咗保持人設犧牲操作效率(§5.2 尾段)。
 */
import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { LogoIcon } from "@/components/branding/logo";

const NAV_ITEMS = [
  { href: "/admin/orders", label: "落單" },
  { href: "/admin/menu", label: "餐牌" },
  { href: "/admin/reports", label: "報表" },
  { href: "/admin/settings", label: "設定" },
] as const;

async function logout() {
  "use server";
  await signOut({ redirectTo: "/login" });
}

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const roleLabel = session.user.role === "admin" ? "老闆" : "伙記";

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <aside className="flex shrink-0 flex-col gap-6 border-b-[1.5px] border-[var(--border)] bg-[var(--cct-cream-100)] p-4 lg:w-56 lg:border-b-0 lg:border-r-[1.5px]">
        <div>
          <div className="flex items-center gap-2">
            <LogoIcon size={36} />
            <p className="font-[family-name:var(--font-display)] text-xl font-bold text-[var(--cct-red-600)]">
              茶記後台
            </p>
          </div>
          <div className="cct-checker-strip mt-2 w-14" />
        </div>

        <nav className="flex flex-row gap-1 overflow-x-auto lg:flex-1 lg:flex-col lg:overflow-visible">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--muted)]"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="border-t-[1.5px] border-[var(--border)] pt-3">
          <p className="text-sm font-medium">{session.user.name}</p>
          <p className="text-xs text-[var(--muted-foreground)]">{roleLabel}帳號</p>
          <form action={logout} className="mt-3">
            <Button type="submit" variant="secondary" size="sm" className="w-full">
              登出
            </Button>
          </form>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
    </div>
  );
}
