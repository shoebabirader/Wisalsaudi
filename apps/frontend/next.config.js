/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: '**.vercel.app',
      },
    ],
    formats: ['image/avif', 'image/webp'],
  },
  turbopack: {},
};

module.exports = nextConfig;
