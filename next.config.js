/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  generateEtags: false,
  compress: true,
  productionBrowserSourceMaps: false,
  swcMinify: true,
  output: 'standalone',
  onDemandEntries: {
    maxInactiveAge: 0,
    pagesBufferLength: 0,
  }
}

module.exports = nextConfig 