"use server";

/**
 * 職員/老闆自己嘅帳號操作(而家淨係改自己密碼)。
 * 對應 RUN-BOOK.md §10「冇『職員改自己密碼』功能」跟進項。
 *
 * 同 lib/actions/menu.ts 唔同,呢度唔用 requireStaffRole 揀 allowedRoles
 * ——admin 同 staff 都應該可以改自己密碼,所以直接用 auth() 攞返
 * 「而家登入緊嗰個人」,再照佢自己個 id 更新,唔會俾人改到第二個人嘅密碼。
 */
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { staffUsers } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { getStaffById } from "@/lib/db/queries/staff";
import type { ActionResult } from "@/lib/actions/menu";

const MIN_PASSWORD_LENGTH = 8;

export async function changeOwnPassword(formData: FormData): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "未登入,請重新登入" };
  }

  const currentPassword = String(formData.get("currentPassword") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!currentPassword || !newPassword || !confirmPassword) {
    return { success: false, error: "請填晒所有欄位" };
  }
  if (newPassword.length < MIN_PASSWORD_LENGTH) {
    return { success: false, error: `新密碼要至少 ${MIN_PASSWORD_LENGTH} 個字` };
  }
  if (newPassword !== confirmPassword) {
    return { success: false, error: "兩次新密碼打得唔一樣" };
  }

  const staff = await getStaffById(session.user.id);
  if (!staff) {
    return { success: false, error: "揾唔到你嘅職員紀錄,請重新登入" };
  }

  const ok = await bcrypt.compare(currentPassword, staff.passwordHash);
  if (!ok) {
    return { success: false, error: "而家個密碼打錯咗" };
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);
  const db = getDb();
  await db.update(staffUsers).set({ passwordHash }).where(eq(staffUsers.id, staff.id));

  return { success: true };
}
