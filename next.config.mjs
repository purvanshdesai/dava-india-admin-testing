/** @type {import('next').NextConfig} */
const env = process.env.NEXT_PUBLIC_ENV
let opts = {
  basePath: env === 'local' ? '' : process.env.NEXT_PUBLIC_BASE_PATH,
  env: {
    DATE_FORMAT: process.env.NEXT_PUBLIC_DATE_FORMAT ?? 'DD/MM/YYYY',
    TIME_FORMAT: process.env.NEXT_PUBLIC_TIME_FORMAT ?? 'hh:mm A',
    DATE_TIME_FORMAT:
      process.env.NEXT_PUBLIC_DATE_TIME_FORMAT ?? 'DD/MM/YYYY hh:mm A'
  },
  webpack: (config, { dev }) => {
    if (config.cache && !dev) {
      config.cache = Object.freeze({
        type: 'memory'
      })
    }
    // Important: return the modified config
    return config
  }
}

const nextConfig = {
  ...opts,
  experimental: {
    preloadEntriesOnStart: false,
    webpackMemoryOptimizations: true
  },
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3030',
        pathname: '/attachments/**'
      },
      {
        protocol: 'https',
        hostname: 'techpepo-development-s3.s3.ap-south-1.amazonaws.com',
        pathname: '/**'
      },
      {
        protocol: 'https',
        hostname: 'media.davaindia.com',
        pathname: '/**'
      },
      {
        protocol: 'https',
        hostname: 'cdn.pixabay.com',
        pathname: '/**'
      },
      {
        protocol: 'https',
        hostname: 'media.springernature.com',
        pathname: '/**'
      },
      {
        protocol: 'https',
        hostname: 'xtcare-lms.s3.us-east-2.amazonaws.com',
        pathname: '/**'
      },
      {
        protocol: 'https',
        hostname: 'www.researchgate.net',
        pathname: '/**'
      }
    ]
  },
  webpack(config, { nextRuntime }) {
    if (nextRuntime === 'nodejs') {
      config.resolve.alias.canvas = false
    }

    return config
  }
}

export default nextConfig
