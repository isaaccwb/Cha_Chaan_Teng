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
  },
};

export default nextConfig;
