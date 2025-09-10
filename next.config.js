/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
    typescript: {
        ignoreBuildErrors: true, // ignore ALL TypeScript errors
    },
  images: { unoptimized: true },
    // Disable ESLint during build
    eslint: {
        ignoreDuringBuilds: true,
    },
    // Try disabling SWC minification
    swcMinify: false,
    // Try disabling compiler optimization
    compiler: {
        removeConsole: false,
    },
};

module.exports = nextConfig;
