import { and, eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { staffUsers } from "@/lib/db/schema";
import { getCurrentRestaurantId } from "@/lib/tenant";

/**
 * 用 email 揾返該茶記(V1 = getCurrentRestaurantId())嘅職員紀錄,
 * 俾 lib/auth.ts 嘅 Credentials provider 用嚟驗證登入。
 */
export async function getStaffByEmail(email: string) {
  const db = getDb();
  const restaurantId = await getCurrentRestaurantId();
  const [staff] = await db
    .select()
    .from(staffUsers)
    .where(and(eq(staffUsers.restaurantId, restaurantId), eq(staffUsers.email, email)))
    .limit(1);
  return staff ?? null;
}

export async function getStaffById(id: string) {
  const db = getDb();
  const [staff] = await db.select().from(staffUsers).where(eq(staffUsers.id, id)).limit(1);
  return staff ?? null;
}
