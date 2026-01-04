/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  async rewrites() {
    return {
      beforeFiles: [
        // Subdomain routing for AlertStream
        {
          source: '/:path*',
          has: [
            {
              type: 'host',
              value: 'alertstream.kestrelvoice.com',
            },
          ],
          destination: '/alertstream/:path*',
        },
        // Also support localhost subdomain for development
        {
          source: '/:path*',
          has: [
            {
              type: 'host',
              value: 'alertstream.localhost:3000',
            },
          ],
          destination: '/alertstream/:path*',
        },
      ],
    }
  },
}

module.exports = nextConfig
