import { defineConfig } from "drizzle-kit";
import { readFileSync } from "fs";

// drizzle-kit 淨係識自動讀 `.env`,唔識 Next.js 慣用嘅 `.env.local`,
// 所以喺呢度手動補讀,唔使裝多個 dotenv 套件。
if (!process.env.DATABASE_URL) {
  try {
    const envLocal = readFileSync(".env.local", "utf-8");
    for (const line of envLocal.split("\n")) {
      const match = line.match(/^([\w.-]+)=(.*)$/);
      if (match) {
        const [, key, rawValue] = match;
        const value = rawValue.replace(/^["']|["']$/g, "");
        if (!process.env[key]) process.env[key] = value;
      }
    }
  } catch {
    // .env.local 唔存在就算,跌返去下面 process.env.DATABASE_URL! 嘅原生錯誤提示
  }
}

export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./drizzle/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  strict: true,
  verbose: true,
});
