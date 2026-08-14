import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { orders } from "@/lib/db/schema";

const GUEST_TOKEN_COOKIE = "cct_guest_token";

/**
 * 客人查自己張單狀態(輕量輪詢用)。對比 cookie 入面嘅 guest_token 同
 * orders.guest_token 是否相符,唔相符就 403 —— 咁就唔使登入都可以防止
 * 亂咁睇第啲人張單。淨係回傳 { status, updatedAt },唔洩露品項/金額/
 * 枱號呢啲第啲人張單都有嘅資料。
 */
export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;

  const db = getDb();
  const [order] = await db.select().from(orders).where(eq(orders.id, id)).limit(1);

  if (!order) {
    return NextResponse.json({ error: "搵唔到呢張單" }, { status: 404 });
  }

  const cookieStore = await cookies();
  const guestToken = cookieStore.get(GUEST_TOKEN_COOKIE)?.value;

  if (!guestToken || guestToken !== order.guestToken) {
    return NextResponse.json({ error: "冇權睇呢張單" }, { status: 403 });
  }

  return NextResponse.json({ status: order.status, updatedAt: order.updatedAt });
}
