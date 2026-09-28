/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  transpilePackages: ['pdfjs-dist'],
};

module.exports = nextConfig;