/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  generateEtags: true,
  compress: true,
  productionBrowserSourceMaps: false,
  swcMinify: true,
  experimental: {
    appDir: false
  },
  assetPrefix: '.',
  basePath: '',
  trailingSlash: true,
}

module.exports = nextConfig 