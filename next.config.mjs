/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.portaldocartao.com.br',
        pathname: '/static/assets/**',
      },
    ],
  },
}

export default nextConfig
