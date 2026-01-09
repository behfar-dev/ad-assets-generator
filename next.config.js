/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'fal.media',
      },
      {
        protocol: 'https',
        hostname: '*.fal.media',
      },
      {
        protocol: 'https',
        hostname: 'v3.fal.media',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
    ],
  },
  serverExternalPackages: ['@mendable/firecrawl-js'],
  webpack: (config, { isServer }) => {
    // Exclude Node.js built-in modules from client-side bundling
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        undici: false,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        url: false,
        zlib: false,
        http: false,
        https: false,
        assert: false,
        os: false,
        path: false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;
