/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  transpilePackages: ['@clinic-os/shared'],
};

module.exports = nextConfig;
