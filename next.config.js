/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable experimental features for better performance
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },

  // Temporarily ignore TypeScript errors during build
  typescript: {
    ignoreBuildErrors: true,
  },

  // Temporarily disable TypeScript checking for production build
  typescript: {
    ignoreBuildErrors: true,
  },



  // Image optimization
  images: {
    domains: [
      'image.tmdb.org',
      'img.youtube.com',
      'i.ytimg.com',
      'yt3.ggpht.com',
      'i.scdn.co',
      'maps.googleapis.com',
      'lh3.googleusercontent.com',
      'youtube.com',
      'www.youtube.com',
      'ytimg.com'
    ],
    formats: ['image/webp', 'image/avif'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.youtube.com',
      },
      {
        protocol: 'https',
        hostname: '**.ytimg.com',
      },
      {
        protocol: 'https',
        hostname: '**.ggpht.com',
      }
    ],
  },

  // Compression and optimization
  compress: true,
  poweredByHeader: false,

  // Bundle analyzer (only when ANALYZE=true)
  ...(process.env.ANALYZE === 'true' && {
    webpack: (config) => {
      config.plugins.push(
        new (require('@next/bundle-analyzer')({
          enabled: true,
        }))()
      )
      return config
    },
  }),

  // Headers for security and performance
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig