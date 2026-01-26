/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // ⚡ THE MAGIC WILDCARD: Allows ALL https domains
      },
      {
        protocol: 'http',
        hostname: '**', // Allows ALL http domains
      },
    ],
  },
};

export default nextConfig;