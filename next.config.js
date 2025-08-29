/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    typedRoutes: false
  },
  images: {
    domains: ['cdn.cosmicjs.com', 'images.unsplash.com'],
    unoptimized: true
  }
}

module.exports = nextConfig