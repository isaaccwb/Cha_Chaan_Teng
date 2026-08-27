import { FlatCompat } from "@eslint/eslintrc";
import { dirname } from "path";
import { fileURLToPath } from "url";

// ESLint 9 預設用 flat config,唔再食 .eslintrc.* —— 呢個 repo 之前冇跟到
// (見 RUN-BOOK.md §10),用 FlatCompat 包返 `eslint-config-next` 個舊式
// legacy config(next/core-web-vitals、next/typescript),寫法對應 Next.js
// 官方 `create-next-app` scaffold 出嚟嗰份。
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    // next-env.d.ts 係 Next.js 自動生成、明文寫住「唔好手動改」嗰隻檔案
    // (見檔案入面註解),裡面嘅 triple-slash reference 係官方寫法,唔算違規。
    ignores: [".next/**", "node_modules/**", "drizzle/migrations/**", "next-env.d.ts"],
  },
];

export default eslintConfig;
