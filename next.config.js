/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  output: 'export',
  distDir: 'dist',
}

module.exports = nextConfig 