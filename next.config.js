/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'standalone',
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
  images: {
    domains: ['localhost'],
  },
}
