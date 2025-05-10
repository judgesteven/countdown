/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  generateEtags: false,
  compress: true,
  productionBrowserSourceMaps: false,
  swcMinify: true,
  output: 'standalone',
  experimental: {
    forceSwcTransforms: true
  },
  onDemandEntries: {
    maxInactiveAge: 0,
    pagesBufferLength: 0,
  },
  webpack: (config, { dev, isServer }) => {
    // Disable caching
    config.cache = false;
    return config;
  },
}

module.exports = nextConfig 