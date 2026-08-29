import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Vercel Blob 存生成好嘅餐牌相,domain 格式係 <store-id>.public.blob.vercel-storage.com
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
    ],
    // 餐牌成頁都係食物相,AVIF 支援嘅瀏覽器可以再細幾成 payload(Next 15 預設淨係 WebP)
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
