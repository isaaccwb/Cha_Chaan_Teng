// 對應 docs/PROJECT_PLAN.md 〈二、技術架構 §8.2〉,取代舊 vercel.json。
// domain(cctmenu.isaaccheng.xyz)掛喺 Vercel project 層面,呢度唔使郁。
import { routes, type VercelConfig } from "@vercel/config/v1";

export const config: VercelConfig = {
  framework: "nextjs",
  buildCommand: "npm run build",
  installCommand: "npm install",

  redirects: [
    // 舊 Flask 版留低嘅 legacy path,導返去新首頁
    routes.redirect("/order-old", "/order", { permanent: false }),
  ],

  headers: [
    routes.cacheControl("/images/(.*)", { public: true, maxAge: "30 days", immutable: true }),
  ],

  crons: [
    // 每日凌晨清埋逾時未確認嘅 pending 單(對應商業計劃 §7 風險緩解)
    { path: "/api/cron/cleanup-stale-orders", schedule: "0 4 * * *" },
  ],
};
