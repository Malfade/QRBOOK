/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  output: 'standalone',
  env: {
    DATABASE_URL: process.env.DATABASE_URL,
  },
}

module.exports = nextConfig

