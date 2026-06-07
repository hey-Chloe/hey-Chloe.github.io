/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',

  experimental: {
    mdxRs: true
  },

  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'api.dicebear.com' },
      { protocol: 'https', hostname: 'github.com' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' }
    ]
  }
}

export default nextConfig
