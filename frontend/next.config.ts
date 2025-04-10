// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   eslint: {
//     ignoreDuringBuilds: true, // Disable ESLint during the build process
//   },
//   images: {
//     remotePatterns: [
//       {
//         protocol: 'https',
//         hostname: 'drive.google.com',
//         pathname: '/uc/**',
//       },
//       {
//         protocol: 'https',
//         hostname: 'cdn.discordapp.com',
//         pathname: '/**',
//       },
//       {
//         protocol: 'http',
//         hostname: 'localhost',
//         port: '5000',
//         pathname: '/**',
//       },
//       {
//         protocol: 'https',
//         hostname: 'res.cloudinary.com',
//         pathname: '/**',
//       },
//     ],
//   },
// };

// export default nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Add async rewrites for API
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://infinitedriven.com/api/:path*'
      }
    ]
  },
  // Specify webpack as the bundler to avoid Turbopack conflicts
  experimental: {
    // Disable turbopack
    turbo: {
      enabled: false
    }
  },
  // External packages configuration
  serverExternalPackages: [],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'drive.google.com',
        pathname: '/uc/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.discordapp.com',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5000',
        pathname: '/**',
      },
      // Production servers
      {
        protocol: 'http',
        hostname: '138.197.21.102',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'infinitedriven.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
