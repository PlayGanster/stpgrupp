import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // // Включаем статический экспорт
  output: 'standalone',

  // // Эта опция решает проблемы с роутингом (создает index.html в папках вместо page.html)
  // trailingSlash: true,

  reactStrictMode: false,
  images: {
    unoptimized: true, // Это ОБЯЗАТЕЛЬНО для static export
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.mds.yandex.net',
      },
      {
        protocol: "https",
        hostname: 'i.pinimg.com'
      },
      {
        protocol: "https",
        hostname: 'pitergsm.ru'
      },
      {
        protocol: "https",
        hostname: 'images.uzum.uz'
      },
      {
        protocol: "https",
        hostname: "api.stgrupp.tech"
      }
      // Можно добавить другие домены, если нужно
      // {
      //   protocol: 'https',
      //   hostname: 'example.com',
      // },
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
