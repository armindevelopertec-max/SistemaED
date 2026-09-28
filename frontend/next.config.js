/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  transpilePackages: ['pdfjs-dist'],
  async rewrites() {
    return [
      {
        source: '/auth/:path*',
        destination: 'http://localhost:3001/auth/:path*',
      },
      {
        source: '/users/:path*',
        destination: 'http://localhost:3001/users/:path*',
      },
      {
        source: '/tramites/:path*',
        destination: 'http://localhost:3001/tramites/:path*',
      },
      {
        source: '/minio/:path*',
        destination: 'http://localhost:3001/minio/:path*',
      },
      {
        source: '/reportes/:path*',
        destination: 'http://localhost:3001/reportes/:path*',
      },
    ];
  },
};

module.exports = nextConfig;