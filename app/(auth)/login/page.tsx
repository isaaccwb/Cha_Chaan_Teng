/**
 * 職員/老闆登入頁。對應 docs/PROJECT_PLAN.md 〈二、技術架構 §5.2〉。
 * 桌面優先、簡單直接,但留少少人性化文案(唔使做到企業 HR system 咁悶)。
 * 表單標籤用返正常書面語(對應〈三、UI/美術方向 §4〉節制原則)。
 */
import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { signIn } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

async function staffLogin(formData: FormData) {
  "use server";
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: "/admin/orders",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      redirect("/login?error=1");
    }
    // NEXT_REDIRECT 呢類內部訊號一樣會行呢個 catch,一定要重新 throw
    // 唔可以吞咗佢,否則登入成功都會跳唔到轉頁。
    throw error;
  }
}

export default async function StaffLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--background)] px-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="font-[family-name:var(--font-display)] text-2xl text-[var(--cct-red-600)]">
            開工喇
          </CardTitle>
          <CardDescription>職員 / 老闆登入,入返你間舖嘅電郵同密碼</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={staffLogin} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-sm font-medium">
                電郵
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="username"
                required
                className="h-11"
                placeholder="you@example.com"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-sm font-medium">
                密碼
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="h-11"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="rounded-md border-[1.5px] border-[var(--destructive)] bg-[var(--cct-red-50)] px-3 py-2 text-sm text-[var(--destructive)]">
                電郵或者密碼唔啱,唔該撳多次啦
              </p>
            )}

            <Button type="submit" size="lg" className="mt-2 w-full">
              入去開工
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
