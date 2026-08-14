import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

// 懶初始化:build time 未必有 DATABASE_URL(例如 `next build` 喺冇連 DB 嘅
// 環境跑),用 plain function pattern,唔好用 Proxy 包(會同某啲 library 嘅
// 內部 introspection 衝突) — 對應 docs/PROJECT_PLAN.md 〈二、技術架構 §3.3〉。
let _db: ReturnType<typeof drizzle<typeof schema>> | null = null;

export function getDb() {
  if (!_db) {
    if (!process.env.DATABASE_URL) {
      throw new Error(
        "DATABASE_URL 未設定。本機開發請跑 `vercel env pull .env.local`," +
          "或者手動喺 .env.local 設定 Neon connection string。"
      );
    }
    _db = drizzle(neon(process.env.DATABASE_URL), { schema });
  }
  return _db;
}
