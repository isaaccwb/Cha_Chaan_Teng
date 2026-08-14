/**
 * 職員/老闆登入 — Auth.js v5 Credentials Provider + 自己 staff_users 表。
 * 對應 docs/PROJECT_PLAN.md 〈二、技術架構 §5.2〉。
 *
 * 客人前台唔使呢個 —— 客人用 lib/actions/order.ts 度嘅 guest_token cookie
 * 機制(見 §5.1),同呢個 module 完全分開。
 */
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { getStaffByEmail } from "@/lib/db/queries/staff";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: "admin" | "staff";
    };
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "電郵", type: "email" },
        password: { label: "密碼", type: "password" },
      },
      authorize: async (creds) => {
        if (!creds?.email || !creds?.password) return null;
        const staff = await getStaffByEmail(creds.email as string);
        if (!staff || !staff.isActive) return null;
        const ok = await bcrypt.compare(creds.password as string, staff.passwordHash);
        if (!ok) return null;
        return {
          id: staff.id,
          email: staff.email,
          name: staff.displayName,
          role: staff.role,
        };
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },
  callbacks: {
    jwt: ({ token, user }) => {
      if (user) {
        token.id = user.id;
        token.role = (user as { role: "admin" | "staff" }).role;
      }
      return token;
    },
    session: ({ session, token }) => {
      session.user.id = token.id as string;
      session.user.role = token.role as "admin" | "staff";
      return session;
    },
  },
});

/**
 * 喺 Server Action 入面再驗一次 role,唔淨係靠 middleware 攔截頁面
 * (對應 §5.2 尾段)。用喺 menu 編輯類操作。
 */
export async function requireStaffRole(allowedRoles: Array<"admin" | "staff">) {
  const session = await auth();
  if (!session?.user) {
    throw new Error("未登入");
  }
  if (!allowedRoles.includes(session.user.role)) {
    throw new Error("冇權限做呢個操作");
  }
  return session.user;
}
