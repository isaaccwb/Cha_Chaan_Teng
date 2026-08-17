import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";

// 懶初始化:build time 未必有 DATABASE_URL(例如 `next build` 喺冇連 DB 嘅
// 環境跑),用 plain function pattern,唔好用 Proxy 包(會同某啲 library 嘅
// 內部 introspection 衝突) — 對應 docs/PROJECT_PLAN.md 〈二、技術架構 §3.3〉。
//
// Driver:Supabase Postgres 用標準 TCP 連接,揀 `postgres`(postgres-js)呢個
// driver 配 `drizzle-orm/postgres-js`(唔用 neon-http 個 HTTP-only driver)。
// 呢個 driver 支援真正嘅 session-based transaction,`db.transaction()` 喺
// lib/actions/order.ts 用嘅寫法有真實 driver 支援(唔似 neon-http 咁淨係
// batch HTTP call)。
let _db: ReturnType<typeof drizzle<typeof schema>> | null = null;

export function getDb() {
  if (!_db) {
    if (!process.env.DATABASE_URL) {
      throw new Error(
        "DATABASE_URL 未設定。本機開發請跑 `vercel env pull .env.local`," +
          "或者手動喺 .env.local 設定 Supabase connection string。"
      );
    }
    // prepare: false — Supabase 嘅 pooled connection(pgbouncer, transaction
    // mode)唔支援 prepared statement,關咗先安全;直連 session mode 就唔使。
    const client = postgres(process.env.DATABASE_URL, { prepare: false });
    _db = drizzle(client, { schema });
  }
  return _db;
}
